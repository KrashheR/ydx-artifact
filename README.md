# Find the Differences: Anomaly Archive

Local vertical-slice scaffold based on `docs/`.

## Run

```bash
pnpm install
pnpm dev
```

Open the Vite URL printed by the command. The default platform mode is local mock and does not require Yandex SDK.

In local development, you can unlock all currently implemented campaigns and levels from the browser console:

```js
await window.__artifactDev?.unlockAllContent()
```

To reset the local save after that:

```js
await window.__artifactDev?.resetSave()
```

To exercise the review prompt locally without Yandex SDK:

```js
window.__artifactDev?.setReviewMock?.("sent")
await window.__artifactDev?.triggerReviewPromptDemo?.()
```

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:content
pnpm agent:check
pnpm build
pnpm dev:validate
pnpm test:e2e
```

For broad agent edits, `pnpm agent:check` runs lint, typecheck and content validation. For pre-release agent validation, use `pnpm agent:release-check`.
`pnpm dev:validate` starts the Vite dev server with gameplay scenes swapped to each level's `3.*` markup reference and all difference hitboxes visible for live alignment checks.

## Scope Implemented

- React + TypeScript strict + Vite + Tailwind.
- RU/EN i18n with manual switch.
- Data-driven chapter catalog with 3 playable 13-level campaigns (`northern-route`, `sand-meridian`, `emerald-meridian`) and 3 daily entries.
- Campaign screens now render as a chapter journal of level cards based on `docs/menu-design/new_campaign_menu.html`, with centralized scene-preview paths for each card image.
- `sand-meridian` map nodes and route are sourced from `docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json`, so new campaign maps can be connected through the same handoff package pattern.
- All 13 `northern-route` levels are wired to local scene intake assets listed in `ASSET_MANIFEST.md`; every level now uses hitboxes transcribed from its `3.webp` markup reference.
- All 13 `sand-meridian` levels are wired to compressed local WebP scene pairs under `public/assets/scenes/sand-meredian/`; levels 1-13 use hitboxes transcribed from their matching `3.webp` markup references.
- All 13 `emerald-meridian` levels are wired to compressed local WebP scene pairs under `public/assets/scenes/emerald-meridian/`; route points follow `docs/plot/emerald-meredian/emerald_meridian_story_map_placement_guide.md` and hitboxes still use scaffold data until markup references are transcribed.
- Campaign metadata such as runtime asset folders, preview filenames, map backgrounds and legacy folder notes is centralized in `src/content/campaignManifest.ts`.
- `GameScreen` layout-debug mode is opt-in via `VITE_LAYOUT_DEBUG=true pnpm dev`: the comparator draws all authored difference markers immediately and swaps scene `1/2` assets for the local `3.*` markup reference on both sides so button/marker positions can be adjusted visually.
- `pnpm dev:validate` runs the same hitbox-alignment view through Vite dev/HMR so hitbox edits can be reviewed live. In this mode, visible hitbox markers are draggable; edits apply immediately to the current level, persist in localStorage for that level, and the on-screen "Copy JSON" button copies the edited `differences` array for committing back into the relevant `src/content/*` level module. "Reset" clears the local authoring override.
- Responsive photo comparator with desktop side-by-side and mobile A/B toggle.
- Circle/polygon hit testing, found markers, hints, misclicks and completion.
- Yandex Player Data cloud saves with a `ysdk.getStorage()` / `localStorage` mirror fallback and versioned schema.
- Mock platform adapter and diagnostics copy.
- Campaign journal review pre-prompt wired to the Yandex Games feedback API seam with local dev mocks.

## Agent Workflow

Start with `AGENTS.MD`, then use `docs/AGENT_INDEX.md` to choose the smallest relevant file set. Content and UI tasks have short flow guides in `docs/FLOWS/`.
