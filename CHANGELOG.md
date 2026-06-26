# Changelog

## Unreleased

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
