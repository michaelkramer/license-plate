# GitHub Actions secrets (iOS TestFlight)

Add these under **Settings → Secrets and variables → Actions** for this repository.

## Required

| Secret | How to obtain |
|--------|----------------|
| `EXPO_TOKEN` | [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) — must be named **exactly** `EXPO_TOKEN` (case-sensitive) |

### `EXPO_TOKEN` checklist

1. Log in as **kramerica** (project owner in `apps/mobile/app.json`).
2. Create an access token at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) with permission to use EAS.
3. In **this GitHub repo** (not only locally): **Settings → Secrets and variables → Actions → New repository secret**.
4. Name: `EXPO_TOKEN` — Value: paste the token with no extra spaces or quotes.
5. If the repo is under an organization, confirm the secret is visible to this repository (org secrets need repo access).

The workflow fails with “An Expo user account is required” when this secret is missing, misnamed (e.g. `EXPO_ACCESS_TOKEN`), or empty. Re-run the workflow after saving the secret; you do not need to change the workflow file again.

## Recommended (App Store Connect API)

| Secret | How to obtain |
|--------|----------------|
| `EXPO_ASC_API_KEY_ID` | App Store Connect → Users and Access → Integrations → Keys |
| `EXPO_ASC_ISSUER_ID` | Same page (Issuer ID at top) |
| `EXPO_ASC_API_KEY` | Base64-encode the downloaded `.p8` file: `base64 -i AuthKey_XXXX.p8 \| pbcopy` |

## Optional

| Secret | When to use |
|--------|-------------|
| `GH_PAT` | Fine-grained or classic PAT with `contents: write` if branch protection blocks the default `GITHUB_TOKEN` from pushing version-sync commits |

## Branch protection on `main`

If version sync commits fail with **403** or **refusing to allow**:

1. **Settings → Branches →** your `main` rule → enable **Allow specified actors to bypass required pull requests** and add `github-actions`, or
2. Add `GH_PAT` owned by a user with bypass rights (see workflow checkout `token`).

Full checklist: [testflight-setup.md](./testflight-setup.md).
