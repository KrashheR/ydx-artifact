# Changelog

## Unreleased

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
