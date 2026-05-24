# GitHub Actions secrets (iOS TestFlight)

Add these under **Settings → Secrets and variables → Actions** for this repository.

## Required

| Secret | How to obtain |
|--------|----------------|
| `EXPO_TOKEN` | [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) |

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
