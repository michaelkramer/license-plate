# TestFlight and CI setup

One-time steps before the [iOS TestFlight workflow](../.github/workflows/ios-testflight.yml) can succeed.

## Apple

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) and note your **Team ID**.
2. In [App Store Connect](https://appstoreconnect.apple.com), create an app named **licensePlate** with bundle ID `com.kramerica.licenseplate` (must match `apps/mobile/app.json`).
3. After the first successful build, copy the numeric **Apple ID** (ASC App ID) from App Information and set `EXPO_PUBLIC_ASC_APP_ID` in GitHub Actions secrets (optional; submit can resolve the app by bundle ID).

## Expo / EAS (local, once)

```sh
cd apps/mobile
npx eas-cli login
npx eas-cli credentials   # iOS → production
```

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

See [ci-secrets.md](./ci-secrets.md). Version-sync commits use `[skip ci]` and change only `apps/mobile/app.json`, which is excluded from workflow path triggers via `paths-ignore`.

## CI behavior

- Triggers on push to `main` when files under `apps/mobile/` change.
- Skips when the commit message contains `[skip ci]` (version sync commits).
- Builds iOS production on EAS, submits to TestFlight, syncs build number into `app.json`, and commits back to `main`.

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
