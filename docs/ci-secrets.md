# GitHub Actions secrets (iOS TestFlight)

The workflow [`.github/workflows/ios-testflight.yml`](../.github/workflows/ios-testflight.yml) uses the GitHub Environment named **`preview`**.

## Common mistake: Variables vs Secrets

| Where you added it | Works? |
|--------------------|--------|
| **Actions → Variables** tab (Environment variables) | **No** — the workflow reads `secrets.EXPO_TOKEN`, not `vars.EXPO_TOKEN` |
| **Actions → Secrets** tab (Repository secrets) | **Yes** — remove `environment: preview` from the workflow or keep it; repo secrets are available |
| **Environments → preview → Environment secrets** | **Yes** — matches the current workflow (`environment: preview`) |

**Never put `EXPO_TOKEN` in Variables.** Variables are visible in the UI and are not treated as secrets. Rotate the token at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) if it was stored as a variable, then add it again as a **secret**.

## Required (Environment `preview` → Environment secrets)

Go to **Settings → Environments → preview → Environment secrets** (not Variables):

| Secret name | How to obtain |
|-------------|----------------|
| `EXPO_TOKEN` | [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) while logged in as **kramerica** |

### `EXPO_TOKEN` checklist

1. Create the token on Expo.
2. **Environments → preview → Add environment secret** → name `EXPO_TOKEN`, paste value (no quotes).
3. Delete `EXPO_TOKEN` from **Environment variables** if you added it there by mistake.
4. Re-run the workflow.

Alternative: add `EXPO_TOKEN` under **Secrets and variables → Actions → Secrets** (repository secret) and remove `environment: preview` from the workflow if you prefer not to use environments.

## Recommended (App Store Connect API)

Same place: **Environment secrets** for `preview` (not Variables):

| Secret name | How to obtain |
|-------------|----------------|
| `EXPO_ASC_API_KEY_ID` | App Store Connect → Users and Access → Integrations → Keys |
| `EXPO_ASC_ISSUER_ID` | Issuer ID on that page |
| `EXPO_ASC_API_KEY` | Base64-encoded `.p8` file: `base64 -i AuthKey_XXXX.p8 \| pbcopy` |

`EXPO_PUBLIC_ASC_APP_ID` in Variables is optional for submit; EAS can resolve the app by bundle ID. The workflow does not read that variable today.

## Optional

| Secret | When to use |
|--------|-------------|
| `GH_PAT` | Repository secret if branch protection blocks version-sync pushes |

## Branch protection on `main`

If version sync commits fail with **403**:

1. Allow GitHub Actions to bypass branch protection, or
2. Add repository secret `GH_PAT` with `contents: write`.

Full checklist: [testflight-setup.md](./testflight-setup.md).
