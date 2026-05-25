#!/usr/bin/env python3
"""
Test App Store Connect API key (same JWT Apple expects for EAS Submit).

Loads repo-root .env automatically (see .env.example keys).

  python3 scripts/test-asc-api-key.py

Override: export vars before running, or pass another file:

  ENV_FILE=/path/to/.env python3 scripts/test-asc-api-key.py

Prefer Node (no pip): npm run test:asc  (see test-asc-api-key.mjs)

Requires: pip3 install 'pyjwt[crypto]'  (often broken on Homebrew Python + macOS; use .mjs instead)
"""

from __future__ import annotations

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

try:
    import jwt
except ImportError:
    print("Install dependencies: pip3 install 'pyjwt[crypto]'", file=sys.stderr)
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_ENV_FILE = REPO_ROOT / ".env"
API_BASE = "https://api.appstoreconnect.apple.com/v1"


def load_env_file(path: Path) -> None:
    """Load KEY=VALUE lines into os.environ (does not override existing vars)."""
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        if key and key not in os.environ:
            os.environ[key] = value


def load_dotenv() -> Path | None:
    env_file = Path(os.environ.get("ENV_FILE", DEFAULT_ENV_FILE))
    load_env_file(env_file)
    return env_file if env_file.is_file() else None


def load_private_key() -> str | bytes:
    path = os.environ.get("ASC_KEY_PATH")
    if path:
        key_path = Path(path).expanduser()
        if not key_path.is_file():
            print(f"ASC_KEY_PATH not found: {key_path}", file=sys.stderr)
            sys.exit(1)
        return key_path.read_text(encoding="utf-8")

    raw = os.environ.get("EXPO_ASC_API_KEY", "").strip()
    if not raw:
        print(
            "Set ASC_KEY_PATH or EXPO_ASC_API_KEY in .env (or environment).",
            file=sys.stderr,
        )
        sys.exit(1)
    try:
        decoded = base64.b64decode(raw, validate=False)
    except Exception as e:
        print(f"EXPO_ASC_API_KEY is not valid base64: {e}", file=sys.stderr)
        sys.exit(1)
    text = decoded.decode("utf-8", errors="replace")
    if "BEGIN PRIVATE KEY" in text:
        return text
    return decoded


def resolve_app_id() -> str:
    return (
        os.environ.get("ASC_APP_ID")
        or os.environ.get("EXPO_PUBLIC_ASC_APP_ID")
        or "6919295469"
    )


def make_token(key_id: str, issuer_id: str, private_key: str | bytes) -> str:
    now = int(time.time())
    return jwt.encode(
        {
            "iss": issuer_id,
            "iat": now,
            "exp": now + 20 * 60,
            "aud": "appstoreconnect-v1",
        },
        private_key,
        algorithm="ES256",
        headers={"kid": key_id, "typ": "JWT"},
    )


def api_get(path: str, token: str) -> tuple[int, str]:
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return res.status, res.read().decode("utf-8", errors="replace")[:2000]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return e.code, body


def main() -> None:
    env_file = load_dotenv()

    key_id = os.environ.get("EXPO_ASC_API_KEY_ID")
    issuer_id = os.environ.get("EXPO_ASC_ISSUER_ID")
    app_id = resolve_app_id()

    if not key_id or not issuer_id:
        print(
            "Missing EXPO_ASC_API_KEY_ID or EXPO_ASC_ISSUER_ID in .env or environment.",
            file=sys.stderr,
        )
        sys.exit(1)

    private_key = load_private_key()
    token = make_token(key_id, issuer_id, private_key)

    print("Testing App Store Connect API key…")
    if env_file:
        print(f"  Env file:  {env_file}")
    print(f"  Key ID:    {key_id}")
    print(f"  Issuer ID: {issuer_id}")
    print(f"  App ID:    {app_id}")
    if os.environ.get("ASC_KEY_PATH"):
        print(f"  Key path:  {os.environ['ASC_KEY_PATH']}")
    else:
        print("  Key source: EXPO_ASC_API_KEY (base64)")
    print()

    status, body = api_get("/apps", token)
    print(f"GET /v1/apps → HTTP {status}")
    if status == 200:
        print("  Auth OK (can list apps).")
    else:
        print(body)
        print("\n401 here means the key/issuer/.p8 or base64 is wrong, or the key was revoked.")
        sys.exit(1)

    status, body = api_get(f"/apps/{app_id}", token)
    print(f"\nGET /v1/apps/{app_id} → HTTP {status}")
    if status == 200:
        data = json.loads(body)
        attrs = data.get("data", {}).get("attributes", {})
        print(f"  Auth OK — app name: {attrs.get('name')}")
        print("\nThis key works for EAS Submit. Re-upload the same .p8 on expo.dev if submit still fails.")
        return

    print(body)
    if status == 403:
        print("\n403: token works but this key cannot access that app (wrong team or role).")
    elif status == 404:
        print("\n404: wrong app ID — set EXPO_PUBLIC_ASC_APP_ID in .env from App Store Connect.")
    sys.exit(1)


if __name__ == "__main__":
    main()
