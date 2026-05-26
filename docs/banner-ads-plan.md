# Bottom Banner Ads Plan (Expo Mobile)

## Goal
Add a small banner ad at the bottom of app screens in `apps/mobile` with a low-risk rollout, App Store compliance, and easy future extension (mediation or ad removal purchase later).

## Recommended approach
- Use **Google AdMob banner ads** via `react-native-google-mobile-ads`.
- Keep placement consistent at the bottom of screens by integrating with the existing shared layout (`Header` / content / `Footer`).
- Use **test ad unit IDs in development** and real IDs only in production builds.

## Scope
- Add one reusable banner component.
- Render it globally in layout for primary screens.
- Add environment-based configuration for iOS/Android ad unit IDs.
- Add basic iOS privacy handling (ATT prompt path and non-personalized fallback).
- Keep current navigation and game flows unchanged.

## Implementation steps
1. **Install and configure ad SDK**
   - Add `react-native-google-mobile-ads` to `apps/mobile/package.json`.
   - Update Expo config/plugin settings in `apps/mobile/app.json` for Google Mobile Ads.
   - Document required IDs and where to store them (EAS secrets/env config).

2. **Create reusable ad component**
   - Add `apps/mobile/src/component/ads/BannerAd.tsx`.
   - Responsibilities:
     - Select correct ad unit ID by platform and environment.
     - Render banner with safe area spacing.
     - Log/load failure safely without crashing UI.

3. **Integrate into screen layout**
   - Add banner near the bottom in shared layout flow (adjacent to `Footer` usage) so it appears across target screens.
   - Ensure no overlap with content or bottom insets.
   - Keep spacing consistent in portrait mode.

4. **Privacy and policy baseline**
   - Add ATT request flow for iOS before personalized ads.
   - Default to non-personalized behavior when consent/permission is not granted.
   - Verify privacy labels and ad disclosure text for App Store metadata.

5. **Testing and rollout**
   - Validate with AdMob test banners on iOS simulator/device and Android emulator/device.
   - Verify no layout regressions on home, plates, and game log screens.
   - Ship behind a simple env flag if we want gradual enablement.

## File change plan
- `apps/mobile/package.json` (dependency)
- `apps/mobile/app.json` (plugin/config)
- `apps/mobile/src/component/ads/BannerAd.tsx` (new)
- `apps/mobile/src/component/layout/*` or shared screen wrapper files (integration point)
- `docs/ci-secrets.md` or new `docs/mobile-ads.md` (setup + secrets)

## Decisions to confirm before implementation
- Banner placement:
  - Above footer, or replacing footer area on ad-enabled builds.
- Coverage:
  - All app screens, or only non-camera/non-critical screens.
- Monetization policy:
  - Ads always on, or env flag/remote toggle for phased rollout.

## Risks and mitigations
- **Policy rejection risk**: incomplete privacy/ATT messaging.
  - Mitigation: implement ATT + non-personalized fallback and verify metadata before submission.
- **Layout crowding on small devices**: bottom UI can feel compressed.
  - Mitigation: test on small iPhone sizes and adjust vertical spacing.
- **Low early fill/revenue**: new app with little traffic.
  - Mitigation: start simple with AdMob; evaluate mediation only after baseline data.
