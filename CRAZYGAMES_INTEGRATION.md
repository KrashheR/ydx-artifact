# CrazyGames integration

`VITE_PLATFORM=crazygames` selects the CrazyGames adapter; `yandex` and `local` remain explicit alternatives. `build:crazygames` creates the Basic Launch profile (`VITE_CRAZYGAMES_LAUNCH=basic`), while `build:crazygames:full` explicitly enables the Full Launch ad profile. Both inject the SDK v3 script; `build:yandex` injects `/sdk.js`; local development injects neither.

The adapter at `src/services/platform/crazyGamesPlatform.ts` owns every `window.CrazyGames.SDK` call. It initializes SDK v3 before storage access, reads `SDK.user.systemInfo.locale`, sends `loadingStart` at bootstrap and one `loadingStop` after the first hydrated render, and maps active level state to `gameplayStart`/`gameplayStop`. Automatic locale selection keeps a saved manual choice first, then SDK locale, browser locale, and uses English as the CrazyGames fallback.

CrazyGames saves use `SDK.data` under `anomaly-archive-save-v1`, with the existing Zod migration. There is no parallel local/cloud merge on this profile: the Data Module provides guest local persistence and account sync. An unavailable SDK, or a Data Module operation rejected because the module is disabled, falls back to browser storage so Basic Launch remains playable. A successful Data Module write is displayed as synced; browser fallback is displayed as local-only.

Basic Launch disables every ad placement and its rewarded CTA while retaining SDK lifecycle and Data Module support. Rewarded and midgame calls are additionally guarded in the adapter. In the explicit Full Launch profile, rewarded ads award only after `adFinished`; errors award nothing. Midgame ads use `midgame`, are requested by the existing between-level flow, and have a three-minute completed-ad cooldown. The CrazyGames adapter intentionally disables the Yandex review API and Metrica transport.

Use `pnpm build:crazygames`, `pnpm release:crazygames:validate`, and `pnpm release:crazygames:zip` for Basic Launch. Use `pnpm build:crazygames:full` only when preparing the later monetized profile. The validation ZIP is `dist-crazygames.zip`, has root `index.html`, and checks CrazyGames file/total/initial-download limits.
