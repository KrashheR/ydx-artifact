# Architecture

React owns screens and UI state. Gameplay hit testing is isolated in `src/shared/lib/hitTesting.ts`; level hit shapes support circles, axis-aligned or rotated ellipses, and polygons through `src/entities/level/schema.ts`.

`src/features/gameplay/PhotoComparator.tsx` displays scene images with `object-fit: contain`. The comparator measures the contained image plane inside each photo panel and converts pointer, found-marker, hint-marker and wrong-click coordinates through that plane, so normalized hitboxes stay aligned when the panel aspect ratio adds letterbox space.

Playable campaign content is chapter-driven:

- `src/content/campaignManifest.ts` is the central campaign metadata source for ids, runtime asset folders, preview filenames, map backgrounds, aspect ratios and legacy folder notes.
- `src/content/levels.ts` contains authored `northern-route` gameplay levels.
- `src/content/sandMeridianLevels.ts` builds `sand-meridian` gameplay levels from the plot handoff package plus shared scaffold hitboxes.
- `src/content/emeraldMeridianLevels.ts` builds `emerald-meridian` gameplay levels from the local jungle scene package plus shared scaffold hitboxes.
- `src/content/chapters.ts` is the catalog layer used by Home, Map, progression and validation; each chapter provides level list, map background, native map aspect ratio and normalized map nodes.
- `src/content/sceneAssets.ts` centralizes campaign card preview paths, including the configurable scene filename used by the campaign journal cards.

Loading performance:

- App bootstrap in `src/app/App.tsx` runs save hydration/locale resolution, campaign preview warmup and font readiness in parallel (`Promise.all`) before revealing the UI.
- After hydration, `src/shared/store/gameStore.ts` resolves the startup destination from save state: in-progress campaign levels resume first, otherwise the next uncompleted campaign level opens directly, a new player starts on White Meridian level 01 with an onboarding overlay, and a fully completed archive opens the collection/case screen.
- Home and map cards use generated compressed previews (`preview-sm.webp`, `card.webp`, see `scripts/generate-level-previews.ts`) instead of full-size scene images; map card `<img>` tags are `loading="lazy"`.
- `src/screens/GameScreen.tsx` preloads both scene images (`imageA`/`imageB`) via `src/shared/lib/imagePreload.ts` when a level opens, and prefetches the next level's pair while the completion overlay is shown.
- After bootstrap, an idle-scheduled background prefetch (`src/shared/lib/scenePrefetch.ts`) warms map backgrounds and level card previews of unlocked chapters plus the likely next levels' scene pairs, one image at a time; it is skipped under data-saver.
- Secondary surfaces (`CollectionScreen`, `DailyScreen`, `SettingsModal`) are `React.lazy` chunks; the settings modal mounts on first open. Home, map and gameplay stay in the entry chunk.

Platform calls are routed through service modules under `src/services`. The platform adapter keeps Yandex SDK access out of React components for review prompts, fullscreen interstitials, rewarded hint ads and cloud/local save storage.

Review prompt flow stays inside the same architecture seams:

- `src/services/platform/mockPlatform.ts` owns the Yandex review gateway (`canReview` / `requestReview`) and caches SDK initialization.
- The same adapter owns Yandex ad calls: `showRewarded()` powers zero-balance area hints through `ysdk.adv.showRewardedVideo()`, and `showInterstitial()` powers campaign-map break ads through `ysdk.adv.showFullscreenAdv()`.
- `src/shared/store/gameStore.ts` persists review prompt schedule state in `saveData.reviewPrompt` and keeps transient request guards in `reviewPromptRuntime`.
- `src/screens/MapScreen.tsx` now renders the campaign journal card layout for desktop/mobile, while still orchestrating the safe post-level review prompt check and opening `GameReviewPrePromptModal` only after `canReview()` succeeds.
