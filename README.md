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

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:content
pnpm build
pnpm test:e2e
```

## Scope Implemented

- React + TypeScript strict + Vite + Tailwind.
- RU/EN i18n with manual switch.
- Data-driven chapter catalog with 2 playable 13-level campaigns (`northern-route`, `sand-meridian`) and 3 daily entries.
- `sand-meridian` map nodes and route are sourced from `docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json`, so new campaign maps can be connected through the same handoff package pattern.
- All 13 `northern-route` levels are wired to local scene intake assets listed in `ASSET_MANIFEST.md`; levels 5-12 still use temporary hitbox data pending markup transcription.
- All 13 `sand-meridian` levels are wired to local PNG scene pairs under `public/assets/scenes/sand-meredian/`; the current intake package contains folders `1-12`, so level 13 temporarily reuses folder `12` until final art arrives. Hitboxes still use scaffold data until markup references are transcribed.
- Responsive photo comparator with desktop side-by-side and mobile A/B toggle.
- Circle/polygon hit testing, found markers, hints, misclicks and completion.
- Local save fallback with versioned schema.
- Mock platform adapter and diagnostics copy.
