# Yandex Integration

`src/services/platform/mockPlatform.ts` is the current adapter seam. It now wraps the Yandex review API, rewarded advertising API and fullscreen advertising API:

- Production `index.html` loads the Yandex Games SDK from `/sdk.js`; local/dev runs still fall back safely when `window.YaGames` is absent.
- `src/services/analytics/analytics.ts` also supports optional Yandex Metrica custom gameplay analytics. If `VITE_YANDEX_METRICA_ID` is set during build, the analytics adapter loads the Metrica tag on first event and sends `ym(counterId, "reachGoal", "aa_<event>", payload)` events. The Vite wrappers load `VITE_*` values from `.env.production.local` for `pnpm dev`, `pnpm dev:validate` and `pnpm build`, so the same local counter ID is used across dev, build and release validation flows. If the env var is absent, no external analytics script is loaded and events remain in the local debug buffer.
- `src/services/platform/platformLifecycle.ts` initializes the SDK lifecycle early, subscribes to `game_api_pause` / `game_api_resume`, sends `ysdk.features.LoadingAPI.ready()` once after the bootstrap gate has hydrated save data, applied the final locale/title, preloaded first-screen campaign previews, waited for fonts and rendered the interactive home screen, and centralizes `ysdk.features.GameplayAPI.start()` / `stop()`.
- `GameScreen` routes active gameplay through that lifecycle controller: the timer, scene input and GameplayAPI are stopped while the game is paused, a rewarded/interstitial/native dialog is active, the level is completed/failed, or the platform sends `game_api_pause`.
- `mockPlatform.canReview()` safely returns `{ value: false, reason: "UNKNOWN" }` when Yandex SDK or `ysdk.feedback` is unavailable.
- `mockPlatform.requestReview()` normalizes the documented `feedbackSent` response and tolerates the older `sentFeedback` example payload.
- `mockPlatform.showRewarded()` calls `ysdk.adv.showRewardedVideo()` when available, grants only after `onRewarded` followed by close, and falls back to an immediate local mock reward in Vite/local mode.
- `mockPlatform.showInterstitial()` calls `ysdk.adv.showFullscreenAdv()` when available and falls back to a short local mock open/close cycle in Vite/local mode.
- `mockPlatform.getEnvironmentLanguage()` reads `ysdk.environment.i18n.lang` through the platform seam. On first/default saves the app maps this to `ru` or `en`; a manual Settings language choice is persisted and is not overwritten by SDK language on later launches.
- SDK initialization is cached via a singleton promise and reuses `window.ysdk` when the host already initialized the SDK.
- Production Vite builds use `@vitejs/plugin-legacy` for `Safari >= 9`, `iOS >= 9` and `Android >= 5`, producing both modern module scripts and legacy `nomodule` scripts/polyfills for the declared Yandex platform range.

Rewarded hint behavior:

- the regular area hint button spends one magnifier while the player has a positive balance;
- when the balance is `0`, the same button shows an ad icon and requests a rewarded Yandex ad;
- the zero-balance CTA is explicit (`Реклама → подсказка` / `Ad → hint`) and opens a confirmation prompt before showing the ad;
- the hint marker is applied only when the rewarded ad returns `rewarded`; closing or failing the ad returns the player to gameplay without a hint or penalty;
- rewarded hint offers remain available after a rewarded hint while there are still unrevealed differences, so the player can watch another ad for another hint.

Forced interstitial cadence:

- only after a newly completed campaign level;
- shown from the post-victory "next level" CTA, before the next campaign level starts;
- returning to the campaign map does not show the queued fullscreen ad and clears that pending post-level opportunity;
- queued at total completed campaign levels `3, 6, 9, ...`;
- skipped for replay completions, daily levels and saves with `purchases.noForcedInterstitials`;
- the runtime queue is not persisted in the save schema.

Review pre-prompt cadence:

- first eligible after the fourth newly completed campaign level;
- checked from the post-victory result surface instead of the campaign map;
- soft dismissal reschedules the next prompt no earlier than five more completed levels, with the existing minimum of level 8 for old saves;
- the pre-prompt uses the same Yandex feedback seam and native request guard as before.

Cloud save is wired through `src/services/storage/localSaveService.ts`:

- `loadPersistentSave()` reads the local mirror and Yandex Player Data in parallel, validates/migrates both with `migrateSaveData()`, and chooses the newest valid save by `updatedAt`.
- The cloud read path uses `ysdk.getPlayer().getData()` with a 4-second timeout.
- `savePersistentSave()` writes the full save to the local mirror first, then best-effort syncs `ysdk.getPlayer().setData(save, flush)`.
- The local mirror prefers `ysdk.getStorage()` and falls back to `window.localStorage`.
- Cloud failures surface to the app as `saveStatus: "local-only"` and do not block gameplay.
- In-progress level timer state is persisted as `elapsedActiveSeconds`, incremented only during visible, unpaused gameplay. Pauses, hidden tabs, SDK pause and rewarded ads do not reduce remaining level time.

Local development remains safe:

- the app does not crash without Yandex SDK;
- direct `pnpm` may be unavailable in some managed shells; the equivalent local binaries (`./node_modules/.bin/eslint`, `./node_modules/.bin/tsc`, `./node_modules/.bin/vite`, `./node_modules/.bin/tsx`) can validate the same code without reinstalling dependencies;
- `window.__artifactDev?.setReviewMock("sent" | "closed" | "unavailable" | "error")` overrides the review gateway in Vite dev mode;
- `window.__artifactDev?.triggerReviewPromptDemo()` seeds the first three campaign completions and starts level 4 so completing that level opens the post-victory review pre-prompt.
- `window.__artifactAnalyticsEvents` stores the last 100 product analytics events locally for QA. Use `VITE_ANALYTICS_DEBUG=true pnpm dev` to print them while testing.
