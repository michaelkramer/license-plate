# License Plate Tracker

Monorepo with an Expo mobile app (`apps/mobile`) and an Express API used for data tooling and Swagger docs (`apps/server`).

## Mobile app

Plate metadata is bundled on-device. After regenerating server JSON, sync it into the app:

```sh
npm run sync:plates-data
```

Plate list data is bundled on-device. The **Plates** screen uses a curated subset (up to 20 per state, loose “generic” heuristic). Regenerate with:

```sh
npm run build:bundled-plates
```

**Images** on that screen load from bundled assets first. Other flows use one of:

1. **Local server (recommended for web and simulators)** — in `apps/mobile/.env.local`:

   ```sh
   EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

   Then run `npm run server` in another terminal. Images are served from `apps/server/src/assets/plates` (no CORS issues).

2. **`source_img` URLs** — used when `EXPO_PUBLIC_API_URL` is not set. Many state DMV sites block cross-origin loads in the browser; native may load some URLs.

```sh
npm start          # from repo root (Expo)
npm run android
npm run ios
```

## Server (optional)

```sh
npm run server
```

Regenerate union data: `node scripts/limit-json.js`, then `npm run sync:plates-data`.

## Deploy

- Web: `npm run deploy` (mobile workspace)
- Native: `npx eas-cli build` — [Expo EAS](https://expo.dev/eas)
