# TestFlight and CI setup

One-time steps before the [iOS TestFlight workflow](../.github/workflows/ios-testflight.yml) can succeed.

## Apple

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) and note your **Team ID**.
2. In [App Store Connect](https://appstoreconnect.apple.com), create an app named **licensePlate** with bundle ID `com.kramerica.licenseplate` (must match `apps/mobile/app.json`).
3. After the first successful build, copy the numeric **Apple ID** (ASC App ID) from App Information and set `EXPO_PUBLIC_ASC_APP_ID` in GitHub Actions secrets (optional; submit can resolve the app by bundle ID).

## Expo / EAS (local, once)

CI builds are **non-interactive**. Apple signing credentials must already exist on Expo’s servers before GitHub Actions can succeed.

### 1. Link App Store Connect API key on Expo (recommended)

GitHub secrets alone are not enough for **creating** iOS certs the first time.

1. Open [expo.dev](https://expo.dev) → **kramerica** → **license-plate** → **Project settings** → **Credentials** (or **App Store Connect API Key**).
2. Upload the same API key you use for submit (`EXPO_ASC_API_KEY_ID`, issuer, `.p8`).

### 2. Create iOS production credentials (interactive, on your Mac)

```sh
cd apps/mobile
npx eas-cli login
npx eas-cli credentials
```

Choose **iOS** → **production** → **Distribution Certificate** / **Provisioning Profile** → let **EAS manage** them. Answer prompts with your Apple Developer login if asked.

### 3. Confirm with one local production build

Run **without** `--non-interactive` the first time so EAS can validate the distribution certificate:

```sh
npm run build:ios:prod
```

When that finishes on [expo.dev](https://expo.dev), CI non-interactive builds should work.

Optional smoke build before enabling CI:

```sh
npm run build:ios:prod
npm run submit:ios
npm run version:sync
```

## GitHub Actions secrets

Repository → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Required | Description |
|--------|----------|-------------|
| `EXPO_TOKEN` | Yes | [Expo access token](https://expo.dev/settings/access-tokens) for EAS build, submit, and version sync |
| `EXPO_ASC_API_KEY_ID` | Yes (recommended) | App Store Connect API key ID |
| `EXPO_ASC_ISSUER_ID` | Yes (recommended) | App Store Connect API issuer ID |
| `EXPO_ASC_API_KEY` | Yes (recommended) | Base64-encoded contents of the `.p8` API key file |

Generate the API key: App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API**.

Legacy alternative (not recommended): `EXPO_APPLE_APP_SPECIFIC_PASSWORD` plus Apple ID in EAS credentials.

## Branch protection

See [ci-secrets.md](./ci-secrets.md). Version-sync commits use `[skip ci]` in the commit message so the workflow job is skipped and does not loop.

## CI behavior

- Triggers on push to `main` when files under `apps/mobile/` change.
- Skips when the commit message contains `[skip ci]` (version sync commits).
- **Job 1 `build`:** EAS iOS production build (outputs build ID).
- **Job 2 `submit`:** TestFlight submit, version sync, commit to `main`. Re-run only this job if build succeeded but submit failed.
- **Manual submit:** Actions → iOS TestFlight → Run workflow → optional **eas_build_id** (skips build, submits an existing build).

## TestFlight testers

After a green workflow run:

1. [expo.dev](https://expo.dev) → **kramerica** / **license-plate** → confirm the build was submitted.
2. App Store Connect → **TestFlight** → wait for processing.
3. Add an **Internal Testing** group and invite testers via the TestFlight app.

Replace placeholder icons in `apps/mobile/assets/` (`icon.png`, `splash-icon.png`) before App Store release.

## Verify CI (smoke test)

1. Add all secrets from [ci-secrets.md](./ci-secrets.md).
2. Locally (optional):
   ```sh
   cd apps/mobile
   npm run build:ios:prod
   npm run submit:ios
   npm run version:sync
   git diff app.json
   ```
3. Merge to `main` with a change under `apps/mobile/` (not only `app.json`), or run **Actions → iOS TestFlight → Run workflow**.
4. Confirm the workflow completes: build → submit → version sync commit with `[skip ci]`.
5. Check TestFlight in App Store Connect after processing.

## CI log messages explained

| Message | Meaning |
|---------|---------|
| **Expo Go for development** warning | Informational. You are not shipping Expo Go; EAS is nudging you toward a dev client for local dev. Safe to ignore for TestFlight, or set `EAS_BUILD_NO_EXPO_GO_WARNING=true` on the build profile. |
| **No environment variables for "production" on EAS** | EAS cloud env vars for the production environment are empty. Not an error unless you rely on `EXPO_PUBLIC_*` vars at build time. |
| **Incrementing buildNumber** | Working as intended (`autoIncrement` in `eas.json`). |
| **Distribution Certificate is not validated for non-interactive builds** / **Credentials are not set up** | **This fails the build.** Run the [Expo / EAS (local, once)](#expo--eas-local-once) steps above on your machine, then re-run GitHub Actions. |

## Submit failed (“Something went wrong…”)

The CLI message is generic. Find the real error:

1. Open the submission log on Expo (from your terminal):  
   `https://expo.dev/accounts/kramerica/projects/license-plate/submissions/<submission-id>`
2. Or re-run with verbose logging (use your build ID from the successful build):

   ```sh
   cd apps/mobile
   npx eas-cli submit --platform ios --id c191d03d-1a14-4d16-975d-dd300ea41e5a --profile production --verbose --verbose-fastlane
   ```

3. Check **App Store Connect → TestFlight** anyway — uploads sometimes succeed even when the CLI reports failure.

### Common fixes

| Cause | What to do |
|-------|------------|
| **Apple / Expo queue or 500** | Wait 30–60 minutes and submit again. |
| **App Store agreements** | App Store Connect → **Business** / **Agreements** — accept any pending contracts. |
| **API key permissions** | ASC key needs **App Manager** or **Admin**; key must include this app. |
| **Stale Apple login cache** | `rm -rf ~/.app-store` then submit again (re-enter 2FA), or rely on API key only via `eas.json` `ascAppId`. |
| **Upload size / Apple glitch** | Install [Transporter](https://apps.apple.com/app/transporter/id1450874784), download the `.ipa` from the [build artifact](https://expo.dev/accounts/kramerica/projects/license-plate/builds), upload manually. |
| **Next build + submit in one step** | `npx eas-cli build --platform ios --profile production --auto-submit` |

`eas.json` includes `ascAppId` and `appleTeamId` so submit skips re-creating the App Store Connect app and works better in CI.

## Test App Store Connect API auth (401 debugging)

EAS Submit uses the same JWT as Apple’s REST API. Test locally **before** `npm run submit:ios`:

```sh
# From repo root — uses Node only (no pip)
npm run test:asc
# or: node scripts/test-asc-api-key.mjs
```

Loads [`.env`](../.env) automatically. Prefer `ASC_KEY_PATH` to your `.p8` file.

**Homebrew `pip3` broken on your Mac?** That is a known Python + macOS `libexpat` mismatch; use the Node script above instead of `scripts/test-asc-api-key.py`. Optional pip fix: `DYLD_LIBRARY_PATH=/opt/homebrew/opt/expat/lib pip3.12 install 'pyjwt[crypto]'` (Python 3.12 was also installed via `brew install python@3.12`).

**Success:** `GET /v1/apps → HTTP 200` and `GET /v1/apps/<id> → HTTP 200`.

**401 on both:** wrong Issuer ID, wrong Key ID, bad/revoked `.p8`, or `EXPO_ASC_API_KEY` base64 is wrong (re-encode: `base64 -i AuthKey.p8 | tr -d '\n'`).

**200 on /apps but 404 on /apps/<id>:** `ASC_APP_ID` / `ascAppId` in `eas.json` does not match the app (your error used `6919295469` — confirm in App Store Connect).

**200 on /apps but 403 on /apps/<id>:** key role too low — use **Admin** or **App Manager**.

After the script passes, re-upload the same `.p8` on [expo.dev](https://expo.dev) → project → Credentials, then run `npm run submit:ios` again.
