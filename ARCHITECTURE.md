# Architecture

React owns screens and UI state. Gameplay hit testing is isolated in `src/shared/lib/hitTesting.ts`; level hit shapes support circles, ellipses and polygons through `src/entities/level/schema.ts`.

Playable campaign content is chapter-driven:

- `src/content/campaignManifest.ts` is the central campaign metadata source for ids, runtime asset folders, preview filenames, map backgrounds, aspect ratios and legacy folder notes.
- `src/content/levels.ts` contains authored `northern-route` gameplay levels.
- `src/content/sandMeridianLevels.ts` builds `sand-meridian` gameplay levels from the plot handoff package plus shared scaffold hitboxes.
- `src/content/emeraldMeridianLevels.ts` builds `emerald-meridian` gameplay levels from the local jungle scene package plus shared scaffold hitboxes.
- `src/content/chapters.ts` is the catalog layer used by Home, Map, progression and validation; each chapter provides level list, map background, native map aspect ratio and normalized map nodes.
- `src/content/sceneAssets.ts` centralizes campaign card preview paths, including the configurable scene filename used by the campaign journal cards.

Platform calls are routed through service modules under `src/services`. Current implementation uses local mock mode and `window.localStorage` as the save mirror.

Review prompt flow stays inside the same architecture seams:

- `src/services/platform/mockPlatform.ts` owns the Yandex review gateway (`canReview` / `requestReview`) and caches SDK initialization.
- `src/shared/store/gameStore.ts` persists review prompt schedule state in `saveData.reviewPrompt` and keeps transient request guards in `reviewPromptRuntime`.
- `src/screens/MapScreen.tsx` now renders the campaign journal card layout for desktop/mobile, while still orchestrating the safe post-level review prompt check and opening `GameReviewPrePromptModal` only after `canReview()` succeeds.
