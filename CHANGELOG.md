# Changelog

## Unreleased

- Removed two extra upper-right hitboxes (`bird-glyph`, `incense-sticks`) from `emerald-meridian` level 8, reducing the level to 9 required differences.

- Removed two extra upper-right hitboxes (`top-foliage`, `stone-step`) from `emerald-meridian` level 5, reducing the level to 5 required differences.

- Removed three extra upper-right hitboxes (`carabiner`, `ladder-foot`, `right-edge`) from `emerald-meridian` level 4, reducing the level to 7 required differences.

- Removed the extra upper-right `hanging-leaves` hitbox from `emerald-meridian` level 3, reducing the level to 8 required differences.

- Pruned extra `sand-meridian` hitboxes from levels 11, 12 and 13, and made levels 12/13 editable through the local hitbox Apply endpoint by keeping their overrides inline.

- Made `pnpm release:zip` independent from system `zip` / `unzip` binaries by replacing the shell-out packaging step with a Node-based ZIP writer and in-script entry validation.

- Fixed replay completion ratings so improved attempts update the saved best stars, worse attempts no longer downgrade the best result, and campaign cards render the saved star count.

- Normalized mobile landscape gameplay HUD controls to 38px height with 12px text.

- Moved the home campaign-selection and campaign-map settings buttons into their topbars instead of rendering them as fixed overlay controls.

- Standardized the desktop header height, horizontal padding and settings button size/offset across home, campaign journal and gameplay screens.

- Moved the gameplay settings button into the HUD controls and removed the pause button from gameplay.

- Removed the Exact Reveal / "Проявитель" gameplay mechanic; the gameplay gear button now opens settings on mobile instead of spending magnifiers.

- Reworked level success/failure result modals for phone landscape so the summary, progress and actions fit within the compact gameplay viewport.

- Changed campaign carousel paging to crossfade cards instead of hiding and replacing them instantly.

- Added the mobile landscape home campaign carousel, kept the desktop campaign row independent from carousel state, and blocked phone portrait with a rotate-device gate.

- Centered and widened the mobile landscape home campaign card, and moved carousel arrows farther away from the card edges.

- Fixed the app bootstrap locale sync so the shell no longer repeatedly calls `i18n.changeLanguage()` after the active locale is already applied.

- Guarded comparator frame-size and pan synchronization against repeated no-op state updates.

- Reduced the gameplay timer font to 16px on mobile while keeping the larger HUD timer on wider screens.

- Restored the mobile landscape A/B flip button label while keeping the control in the right-edge safe-area slot.

- Tightened mobile gameplay and level-card typography, and moved the mobile landscape A/B flip control into a side control slot so it no longer covers the scene image.

- Pinned the mobile home campaign CTA to the bottom of each active campaign card.

- Fixed gameplay comparator sizing so 16:10 scene images keep their real aspect ratio on desktop, mobile portrait and mobile landscape instead of stretching into square-ish play slots.

- Renamed the Russian mobile A/B compare button to "Перевернуть".
- Fixed gameplay image panning so zoomed scenes keep the same drag overscroll allowance on the bottom edge as on the top, left and right edges.
- Fixed the campaign mission journal so level lists scroll inside the game viewport with a custom brass scrollbar instead of relying on blocked page scrolling.
- Matched mission level-card hover motion to campaign cards on the campaign journal.
- Delayed `LoadingAPI.ready()` behind a single bootstrap gate: save hydration, SDK/manual locale resolution, i18n/title/lang updates, first-screen preview image preload, font readiness and two rendered frames now complete before the interactive home screen replaces the loader; added regression coverage for the SDK `en` startup path.
- Added Vite legacy build support for `Safari >= 9`, `iOS >= 9` and `Android >= 5` via `@vitejs/plugin-legacy`, including legacy bundles, `nomodule` scripts and polyfills in production output.
- Fixed Yandex prepublication blockers: `pnpm release:zip` now creates `dist-yandex.zip` from the contents of `dist/` and validates root `index.html` plus forbidden macOS/system/source-map entries.
- Regenerated `northern-route` level 13 scene A from the owner-provided PNG as a compressed WebP, removed the source PNG from runtime assets, and kept A/B validation passing for the 9-difference finale.
- Removed the unfinished campaign paywall from production UI. Locked campaigns now only explain gameplay unlock requirements; purchase CTA, modal, restore button and stub price are gone.
- Added first-run locale detection from `ysdk.environment.i18n.lang`, persisted manual locale source, `<html lang>` updates and localized `document.title`.
- Migrated saves to version 2 with `elapsedActiveSeconds` for in-progress levels, safe v1 migration and active-time-only gameplay timer persistence.
- Made zero-magnifier hint CTA explicit for rewarded ads and added a confirmation prompt before showing rewarded video.
- Split hitbox editor controls into a dev-only lazy chunk, removed production internal REF labels, and replaced `structuredClone` with a JSON-compatible clone helper.
- Added adaptive modal max-height scrolling and tightened the gameplay HUD safe-area layout for small mobile viewports.
- Extended content validation with A/B hash comparison, WebP dimension checks and normalized hotspot bounds checks.

- Added Yandex Games launch lifecycle handling for moderation readiness: production now loads `/sdk.js`, sends `LoadingAPI.ready()` once after hydration, subscribes to `game_api_pause` / `game_api_resume`, and centralizes `GameplayAPI.start()` / `stop()` around active gameplay.

- Removed the Google Fonts runtime hotlink from `index.html`, switched Tailwind font stacks to system/local fallbacks, and strengthened production browser behavior by suppressing page scroll, image drag, text selection and gameplay context menus.

- Extended the production build cleanup to exclude unused scene placeholder SVGs alongside local `3.webp` markup references.

- Recompressed all WebP scene assets under `public/assets/scenes/` in place again, preserving dimensions and paths while reducing total WebP weight from 43.2 MB to 25.5 MB.

- Disabled production sourcemap emission by default to reduce the release build size; diagnostic builds can still opt in with `BUILD_SOURCEMAP=true pnpm build`.

- Updated the layout-debug hitbox editor so dragging or resizing either A/B marker synchronously updates both side hitboxes and the shared hint area.

- Added `pnpm dev:validate:cheat`, which starts the hitbox validation dev server and automatically applies the existing all-content dev unlock.

- Excluded scene markup reference files named `3.webp` from production Vite build output while keeping them in `public` for content validation and local hitbox review.

- Added a local hitbox authoring flow to layout-debug gameplay: `pnpm dev:validate` now lets reviewers drag visible difference markers, resize them from a bottom-right corner handle, applies edits immediately, persists them per level in localStorage, and exports the edited `differences` JSON for committing into `src/content/*`.

- Added an "Apply" action to the layout-debug hitbox editor. In `pnpm dev:validate`, the browser now posts edited hitboxes to a dev-only Vite endpoint that writes them back into the matching `src/content/*` campaign module.

- Added one-axis resize handles to the layout-debug hitbox editor: right and bottom handles resize width/height independently, while the corner handle still resizes both axes.

- Added zero-balance area hints through Yandex rewarded ads: the hint button switches to an ad icon when magnifiers reach `0`, calls `ysdk.adv.showRewardedVideo()`, applies the hint only after a rewarded completion, and remains available for another ad-backed hint while more unrevealed differences exist.

- Fixed area hints so their pulse no longer shifts away from authored `hintArea` bounds, made the hint ring more visible, and prevented repeated magnifier spending while an existing unfound hint is already active.

- Corrected the `northern-route` level 4 switch hitbox from an aspect-scaled circle to an ellipse so the clickable zone matches the lower markup ring instead of covering extra vertical space.

- Switched gameplay scene rendering from stretched `object-fit: fill` to `object-fit: contain` and anchored hit testing, found markers, hints and wrong-click feedback to the measured contained image plane so normalized hitboxes stay aligned with the visible image.

- Recompressed all runtime WebP scene assets under `public/assets/scenes/` in place, preserving dimensions and paths while reducing total runtime image weight from about 101.6 MB to 43.2 MB; also whitespace-minified the project SVG images.

- Made campaign level journal cards wider in the `map-level-grid`, including compact mobile landscape, so the cards read closer to square instead of tall rectangles.

- Reworked mobile landscape layouts against `docs/landscape_review`: campaign selection, level journal, settings, paywall, and gameplay now use compact 896x414-oriented compositions; gameplay mobile landscape uses the variant-2 A/B flip-card instead of side-by-side photos.

- Renamed the game to its official title everywhere it is shown to players: RU "Найди отличия: Тайны экспедиций", EN "Spot the Differences: Expedition Mysteries". Updated `src/i18n/{ru,en}/common.json` (`app.title` and the header brand tag `campaigns.supra` → "ТАЙНЫ ЭКСПЕДИЦИЙ" / "EXPEDITION MYSTERIES"), the `index.html` `<title>`, the e2e heading assertion in `tests/e2e/app.spec.ts`, and the store listing `title` fields in `docs/starter-data/catalog-copy.example.json` and `docs/starter-data/i18n/{ru,en}/common.json`.
- Added the missing `ladder-foot` hitbox to `emerald-meridian` level 4 (`em-04-flooded-bridge`) in `src/content/emeraldMeridianLevels.ts`: a 10th annotation ring at the foot of the bridge ladder was drawn in `4/3.webp` but had no hit area. Transcribed it (`circle` at `cx 0.707, cy 0.712, r 0.046`, least-squares fit to the ring, verified via red overlay render), bringing level 4 to 10 rings so `requiredDifferences` now equals 10.
- Added `pnpm validate:final`, a final A/B hitbox review server that draws the editable hitbox overlay over real `1.*` and `2.*` gameplay images while keeping the same drag, resize, copy and apply controls as `pnpm dev:validate`.
- Fixed all 13 `emerald-meridian` chapter hitboxes in `src/content/emeraldMeridianLevels.ts` to match the rings drawn on each level's `3.webp` annotation image — both the count and the position/size/shape of every hit area were transcribed and visually verified against red overlay renders. Made the chapter find-ALL: removed the `differenceCounts` table and the "find any subset" comment, and set `requiredDifferences` to `perLevelDiffs[order - 1].length` so the required count always equals the number of drawn rings (per-level ring counts: 10, 9, 9, 9, 7, 9, 9, 11, 9, 10, 9, 9, 9). Fixes the prior `pnpm validate:content` failure where `requiredDifferences` did not match the number of differences.

- Moved the settings entry point into the app shell so the gear button is always clickable in the top-right corner on every screen and opens the shared settings modal.

- Fixed the gameplay result modal's "Level Select" / "К выбору уровней" action so it returns to the current campaign level journal after completion.
- Removed the collection button from the campaign map header and fixed the home settings control so the gear button opens the settings modal reliably.

- Redesigned settings as a `SettingsModal` overlay (bottom sheet on mobile, centered modal on desktop) matching the Expedition design system; removed "Reset save" and "Copy diagnostics" dev buttons from production UI; removed `{ kind: "settings" }` from the `Screen` union and `App.tsx` routing — settings is now opened via local `useState` in `HomeScreen`.
- Moved the remaining visible daily and settings strings into `src/i18n/{ru,en}/common.json`, and switched `DailyScreen` / `SettingsScreen` to the new translation keys.
- Added Yandex fullscreen interstitial handling on the campaign map after every third newly completed campaign level, with no-ads entitlement suppression and focused MapScreen coverage.
- Added Yandex Player Data cloud saves with `ysdk.getStorage()` / `localStorage` mirroring, newest-`updatedAt` cloud/local hydration, 4-second cloud load timeout and focused storage tests.
- Corrected `northern-route` level 12 hitboxes for the radio room scene, including the sled, steam plume, pressed flower case and lower drawer markup rings.
- Corrected `northern-route` level 7 hitboxes so the gameplay markers align with the white `3.webp` markup rings.
- Reduced the gameplay completion modal delay from 1 second to 0.7 seconds after the final difference is found.
- Added `npm run dev:validate` / `pnpm dev:validate`, which starts Vite dev/HMR with scene images swapped to `3.*` markup references and all gameplay hitboxes visible for visual alignment review.
- Added ellipse hitbox support and corrected stretched first-campaign markup rings for `northern-route` levels 2 and 9 so clickable areas match the visible authoring circles more closely.
- Delayed the gameplay completion modal by 1 second after the final difference so the last found marker appears before the win result opens.
- Converted all runtime PNG scene, preview and map background assets under `public/assets/scenes/` to compressed WebP, updated content wiring to `.webp`, and removed the old PNG runtime copies.
- Added missing `seagull-13` difference to `northern-route` level 13 (`src/content/levels.ts`): seagull is present in `1.png` but absent in `2.png`, its circle is marked in `3.png`, and `requiredDifferences` updated from 8 to 9.
- Added agent workflow routing docs (`docs/AGENT_INDEX.md`, `docs/FLOWS/content-intake.md`, `docs/FLOWS/ui-change.md`) plus `pnpm agent:check` and `pnpm agent:release-check`.
- Centralized campaign runtime metadata in `src/content/campaignManifest.ts` and documented the legacy `sand-meredian` asset folder mapping.
- Made gameplay layout-debug mode opt-in via `VITE_LAYOUT_DEBUG=true` instead of always-on, and expanded content validation to cover locales, provenance, markup references, known asset folders and debug-flag usage.
- Excluded generated design-reference HTML/support files from ESLint so agent checks focus on maintained project code.
- Smoothed app-level screen transitions to fade without vertical movement, removing the visible layout jump when moving between levels.
- Fixed campaign map exit transitions so returning from `sand-meridian` or `emerald-meridian` no longer flashes the first `northern-route` / White Meridian campaign before the home menu appears.
- Fixed `sand-meridian` level 13 to use its own `public/assets/scenes/sand-meredian/13/1.png` and `2.png` runtime scene pair with hitboxes transcribed from `13/3.png`, removing the old folder 12 fallback.
- Added the missing lower-left tool-cloth hitbox for `sand-meridian` level 3 so all 9 circles from `public/assets/scenes/sand-meredian/3/3.png` are playable.
- Added the missing marked hitboxes for `sand-meridian` levels 7, 11 and 12; level 13 also inherits the corrected level 12 fallback hitboxes.
- Wired the expedition home/paywall campaign cards to the new `public/assets/scenes/<chapter>/preview.png` images, keeping gradient backgrounds as fallbacks and documenting the preview assets.
- Fixed gameplay difference overlays so found markers and hint rings scale from authored `hitArea` / `hintArea` geometry instead of fixed pixel circles; scene images no longer crop away from normalized hitbox coordinates, circle hit testing now respects image aspect ratio, and the confirmation checkmark stays centered inside the authored hitbox even while layout-debug markers are visible.
- Rechecked and corrected first-campaign (`northern-route`) hitboxes against the visible `3.*` markup circles for scenes with confirmed drift.
- Switched `northern-route` campaign journal/map card previews to the existing `1.webp` runtime assets instead of the shared `1.png` helper default, while leaving the PNG-based later campaigns unchanged.
- Restored corrupted Russian level titles for the final `northern-route` level and every `sand-meridian` / `emerald-meridian` level card, plus fixed broken RU count labels in the locale dictionary.
- Enabled a temporary `GameScreen` layout-debug mode that renders all difference markers immediately and swaps comparator scene assets from `1/2` to the local `3.*` markup reference, making it easier to adjust button and marker positions visually.
- Removed the light mobile tap-flash on buttons, cards and map interactions by disabling the browser tap highlight for interactive elements and pinning the app shell background during screen transitions.
- Re-transcribed `northern-route` hitboxes for levels 5-12 from the provided `3.webp` markup references, replacing the shared scaffold coordinates with per-scene click zones.
- Replaced the campaign node map screen with a level-journal layout based on `docs/menu-design/new_campaign_menu.html`, including responsive desktop/mobile card grids and direct level launch from cards.
- Matched the campaign journal shell to `HomeScreen` spacing and width rules, and switched its page background to the same expedition backdrop used on the main screen.
- Added `src/content/sceneAssets.ts` to centralize campaign card preview image paths, so the per-card scene filename can be changed in one place later.
- Fixed campaign 1 map node alignment by switching chapter map containers from a hardcoded `16:10` frame to the real background image aspect ratios, so level points sit back on the painted circles.
- Removed the yellow dashed route line between campaign map nodes so the map shows standalone points only.
- Re-transcribed `sand-meridian` hitboxes across the full current art package in `public/assets/scenes/sand-meredian/`, using each scene's `3.png` markup reference for levels 1-12 and reusing level 12 coordinates for the level 13 fallback.
- Connected the third campaign, `emerald-meridian`, into the playable chapter catalog with 13 routed map nodes, scaffold level definitions, localized titles, and sequential unlock after `sand-meridian`.
- Updated the expedition home screen so the third campaign now shows real progress, unlock messaging, and map navigation instead of a permanently locked stub.
- Added a campaign-map review pre-prompt modal based on `docs/rate-modal-design`, shown after the third completed campaign level and rescheduled once after a soft dismissal.
- Extended the platform seam with Yandex review gateway support (`canReview` / `requestReview`), safe local fallbacks, and Vite dev helpers for review-flow testing.
- Persisted `reviewPrompt` state in the save schema, wired review analytics event hooks, and covered the flow with unit, component, and integration tests.

- Redesigned GameScreen to the dark "Expedition" visual theme matching the `Игровой экран.dc.html` artboard: full-screen dark layout, top HUD with timer/found counter/hint button, image panel with A/B labels and divider, bottom tracker with found squares and accuracy bar.
- Added 5-minute countdown timer with visual warning (red text) when ≤ 30 seconds remain. Pause button stops the timer.
- Added `LevelCompleteOverlay` — modal with green seal, stats (time/found/stars), chapter progress bar, and next-level/retry/map buttons.
- Added `LevelFailedOverlay` — modal with red clock seal, stats, differences tracker, retry and +30-sec (spends 2 magnifiers) buttons.
- Redesigned `PhotoComparator`: dark image panels, gold-ring-with-checkmark found markers (with entrance animation), pulsing dashed hint marker, brief red-X wrong-click animation.
- Added `resetLevelProgress(levelId)` to the game store for clean retry flow.
- Added `font-jetbrains` (JetBrains Mono) Tailwind utility; updated Google Fonts link to include JetBrains Mono and italic Cormorant Garamond weights.
- Added `game.levelBadge`, `game.labelOriginal/Copy`, `game.completedBadge/Title/Desc`, `game.timeoutBadge/Title/Desc`, and related stat/action keys to both `ru` and `en` locales.

- Limited the desktop HomeScreen content width so expedition cards and footer stop overexpanding on very wide displays.
- Added a Vite dev-only console cheat via `window.__artifactDev.unlockAllContent()` to mark all implemented levels complete, unlock campaign access locally, and persist the result in the save.
- Added a matching `window.__artifactDev.resetSave()` helper for quickly returning to a clean local save during development.
- Added a chapter catalog in `src/content/chapters.ts` so map backgrounds, node placement and level lists are configured per campaign instead of hardcoded in `MapScreen`.
- Connected the `sand-meridian` campaign from `docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json`, including a routed map, 13 playable scene entries and localized level titles.
- Updated validation to cover all playable chapters and verify that each chapter has 13 levels and a matching set of map nodes.
- Added dark "Expedition" palette (`exp-*` tokens) to Tailwind config alongside the existing light palette; tokens follow `docs/menu-design` design spec.
- Added Cormorant Garamond and Manrope Google Fonts (`font-cormorant`, `font-manrope` Tailwind utilities).
- Rewrote HomeScreen as a three-campaign expedition selector (desktop card row + mobile stacked layout) per `docs/menu-design` artboards 1 and 4.
- App.tsx now renders HomeScreen full-bleed (no padding / max-width constraint); other screens are unchanged.
- Added `campaigns.*` i18n keys to both `ru` and `en` locales.
- Implemented Paywall modal (artboards 2 and 5): desktop 600px centered modal + mobile bottom sheet (690px, border-radius 26px 26px 0 0). Triggered by "Открыть все кампании" in top-bar and locked campaign cards. Closes on X button, backdrop click, or Escape key. Price is a stub (`—`); wire to Yandex billing catalog when available.
- Added `campaigns.paywall.*` i18n keys to both `ru` and `en` locales (supra, heading, subheading, cta, skip, restore, 5 benefit strings). Desktop shows all 5 benefits; mobile shows 3.

## 0.1.0

- Initial local vertical-slice scaffold.
- Added root `AGENTS.MD` and `CLAUDE.md` handoff guides to reduce token usage and document required update workflow.
- Updated Chapter 1 map point titles from the Meridian plot prompts and restored readable RU locale text.
- Made locked campaign map nodes fully opaque for clearer unavailable level markers.
- Fixed a campaign map crash caused by the 13th level missing a node position, and added a regression test for map node coverage.
- Documented the three-image WebP intake workflow for authoring new levels and hitboxes.
- Authored the first campaign level from the provided scene images, including WebP runtime assets, hitboxes and provenance records.
- Connected campaign scenes 2, 3 and 4 from the provided image folders, exported their runtime WebP assets and authored hitboxes for all marked differences.
- Exported runtime WebP assets for campaign scenes 5-12 and wired those levels to their real scene pairs instead of placeholder images.
- Added campaign scene 13 with runtime WebP assets, localized title, map/UI support and authored hitboxes from the provided markup image.
