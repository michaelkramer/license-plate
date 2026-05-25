#!/usr/bin/env node
/**
 * Test App Store Connect API key (no pip — uses Node crypto only).
 * Loads repo-root .env automatically.
 *
 *   node scripts/test-asc-api-key.mjs
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_BASE = "https://api.appstoreconnect.apple.com/v1";

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadPrivateKey() {
  const keyPath = process.env.ASC_KEY_PATH?.replace(/^~/, process.env.HOME || "");
  if (keyPath && fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, "utf8");
  }
  const raw = process.env.EXPO_ASC_API_KEY?.trim();
  if (!raw) {
    console.error("Set ASC_KEY_PATH or EXPO_ASC_API_KEY in .env");
    process.exit(1);
  }
  const decoded = Buffer.from(raw, "base64");
  const text = decoded.toString("utf8");
  if (text.includes("BEGIN PRIVATE KEY")) return text;
  return decoded;
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeToken(keyId, issuerId, privateKeyPem) {
  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({
      iss: issuerId,
      iat: now,
      exp: now + 20 * 60,
      aud: "appstoreconnect-v1",
    }),
  );
  const data = `${header}.${payload}`;
  const key = crypto.createPrivateKey(privateKeyPem);
  const signature = crypto.sign("sha256", Buffer.from(data), {
    key,
    dsaEncoding: "ieee-p1363",
  });
  return `${data}.${signature.toString("base64url")}`;
}

async function apiGet(apiPath, token) {
  const res = await fetch(`${API_BASE}${apiPath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.text();
  return { status: res.status, body };
}

const envFile = process.env.ENV_FILE || path.join(REPO_ROOT, ".env");
loadEnvFile(envFile);

const keyId = process.env.EXPO_ASC_API_KEY_ID;
const issuerId = process.env.EXPO_ASC_ISSUER_ID;
const appId =
  process.env.ASC_APP_ID || process.env.EXPO_PUBLIC_ASC_APP_ID || "6772763761";

if (!keyId || !issuerId) {
  console.error("Missing EXPO_ASC_API_KEY_ID or EXPO_ASC_ISSUER_ID in .env");
  process.exit(1);
}

const token = makeToken(keyId, issuerId, loadPrivateKey());

console.log("Testing App Store Connect API key…");
if (fs.existsSync(envFile)) console.log(`  Env file:  ${envFile}`);
console.log(`  Key ID:    ${keyId}`);
console.log(`  Issuer ID: ${issuerId}`);
console.log(`  App ID:    ${appId}`);
console.log();

let { status, body } = await apiGet("/apps?limit=50", token);
console.log(`GET /v1/apps → HTTP ${status}`);
if (status !== 200) {
  console.log(body.slice(0, 2000));
  console.log("\n401 = invalid key, issuer, or .p8 / base64.");
  process.exit(1);
}
console.log("  Auth OK (can list apps).");
let appsList = [];
try {
  appsList = JSON.parse(body).data ?? [];
} catch {
  /* ignore */
}

({ status, body } = await apiGet(`/apps/${appId}`, token));
console.log(`\nGET /v1/apps/${appId} → HTTP ${status}`);
if (status === 200) {
  const data = JSON.parse(body);
  const name = data?.data?.attributes?.name;
  console.log(`  Auth OK — app name: ${name}`);
  console.log("\nKey works for EAS Submit.");
  process.exit(0);
}
console.log(body.slice(0, 2000));
if (status === 403) console.log("\n403: key cannot access this app.");
if (status === 404) {
  console.log("\n404: wrong EXPO_PUBLIC_ASC_APP_ID / ascAppId in eas.json.");
  if (appsList.length) {
    console.log("\nApps visible to this API key (use this id in .env and eas.json):");
    for (const app of appsList) {
      const name = app.attributes?.name ?? "?";
      const bundle = app.attributes?.bundleId ?? "";
      console.log(`  ${app.id}  ${name}  (${bundle})`);
    }
  }
}
process.exit(1);
