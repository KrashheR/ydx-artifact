# Find the Differences: Anomaly Archive

Local vertical-slice scaffold based on `docs/`.

## Run

```bash
pnpm install
pnpm dev
pnpm dev:align
```

Open the Vite URL printed by the command. The default platform mode is local mock and does not require Yandex SDK.

In local development, you can unlock all currently implemented campaigns and levels from the browser console:

```js
await window.__artifactDev?.unlockAllContent();
```

To reset the local save after that:

```js
await window.__artifactDev?.resetSave();
```

To exercise the review prompt locally without Yandex SDK:

```js
window.__artifactDev?.setReviewMock?.("sent");
await window.__artifactDev?.triggerReviewPromptDemo?.();
```

That seeds the first three campaign completions and starts level 4; complete level 4 to see the post-victory review prompt.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:content
pnpm assets:optimize
pnpm agent:check
pnpm build
pnpm release:zip
pnpm dev:validate
pnpm dev:validate:cheat
pnpm validate:final
pnpm validate:archive
pnpm test:e2e
```

For broad agent edits, `pnpm agent:check` runs lint, typecheck and content validation. For pre-release agent validation, use `pnpm agent:release-check`.
`pnpm dev:validate` starts the Vite dev server with gameplay scenes swapped to each level's `3.*` markup reference and all difference hitboxes visible for live alignment checks.
`pnpm dev:align` starts an all-content-unlocked dev server with a mobile scene-alignment dashboard. In a phone landscape viewport, adjust each level's A/B image with 0.5px X/Y controls; drafts persist per level in localStorage, and Apply writes the offsets to `src/content/sceneAlignment.json` for use in normal gameplay.
`pnpm assets:optimize` dry-runs conservative WebP recompression for runtime gameplay scene pairs; pass `-- --apply` to replace only candidates that keep dimensions and pass the pixel-difference gates.
`pnpm dev:validate:cheat` starts the same validation server and automatically unlocks all currently implemented campaigns and levels in the local dev save.
`pnpm dev --cheat` starts the plain dev server (no hitbox debug overlay) with that same all-content unlock applied to the local dev save.
`pnpm validate:final` starts the same hitbox editor over the final gameplay `1.*` and `2.*` scene images instead of the `3.*` markup reference, so A/B hitboxes can be moved, resized, rotated, copied and applied against the real pair.
`pnpm validate:archive` starts the final A/B hitbox editor directly on Daily Archive case 1 and adds an in-game 1-7 switcher so all `public/assets/scenes/archive/` cases can be reviewed without waiting for the calendar rotation.
Production builds exclude scene markup reference files named `3.webp` from `dist/assets/scenes/**`; the source files stay in `public` for `pnpm validate:content`, `pnpm dev:validate`, and local hitbox review.
Production builds also exclude unused scene placeholder SVGs, emit relative Vite asset links for Yandex ZIP hosting, and keep the Yandex Games SDK as the platform-provided `/sdk.js` script in `index.html`.
Custom gameplay analytics can be enabled locally by adding `VITE_YANDEX_METRICA_ID=<counter id>` to `.env.production.local`; production release validation requires a numeric ID and verifies it is embedded with Metrica initialization in `dist`. Setup steps are documented in `docs/YANDEX_METRICS_SETUP_GUIDE.md`.
Use `pnpm validate:analytics` to compare the typed registry, runtime calls and `ANALYTICS_EVENTS.md`. Use `pnpm metrika:goals` to dry-run Yandex Metrica goal setup, then `pnpm metrika:goals:publish` to create missing JavaScript-event goals from that same registry.
Production builds do not emit sourcemaps by default to keep the Yandex upload smaller. Use `BUILD_SOURCEMAP=true pnpm build` when a diagnostic build needs `.map` files.
`pnpm release:zip` creates a fresh production build, then packages the contents of `dist/` into `dist-yandex.zip` with the Node-based release packager, verifies root `index.html`, rejects root-relative `/assets` script/style links, and excludes macOS/system junk plus sourcemaps. It does not require system `zip` / `unzip` binaries.

## Scope Implemented

- React + TypeScript strict + Vite + Tailwind.
- RU/EN i18n with manual switch.
- Data-driven chapter catalog with 3 playable 13-level campaigns (`northern-route`, `sand-meridian`, `emerald-meridian`) and 7 standalone Daily Archive entries.
- Campaign screens now render as a chapter journal of level cards based on `docs/menu-design/new_campaign_menu.html`, with centralized scene-preview paths for each card image.
- `sand-meridian` map nodes and route are sourced from `docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json`, so new campaign maps can be connected through the same handoff package pattern.
- All 13 `northern-route` levels are wired to local scene intake assets listed in `ASSET_MANIFEST.md`; every level now uses hitboxes transcribed from its `3.webp` markup reference.
- All 13 `sand-meridian` levels are wired to compressed local WebP scene pairs under `public/assets/scenes/sand-meredian/`; levels 1-13 use hitboxes transcribed from their matching `3.webp` markup references.
- All 13 `emerald-meridian` levels are wired to compressed local WebP scene pairs under `public/assets/scenes/emerald-meridian/`; route points follow `docs/plot/emerald-meredian/emerald_meridian_story_map_placement_guide.md`, and gameplay hitboxes are transcribed from markup references with the level 3, 4, 5 and 8 upper-right extra hitboxes pruned.
- Campaign metadata such as runtime asset folders, preview filenames, map aspect ratios and legacy folder notes is centralized in `src/content/campaignManifest.ts`.
- Daily Archive levels are wired from `public/assets/scenes/archive/1-7/` through `src/content/dailyArchive.ts`; the Archive Hub daily card starts the selected archive case directly in the shared `GameScreen` daily mode, the calendar selection is deterministic by local `dayNumber % 7`, daily completions grant `+1` hint, and they do not write to campaign `completedLevels`.
- `GameScreen` layout-debug mode is opt-in via `VITE_LAYOUT_DEBUG=true pnpm dev`: the comparator draws all authored difference markers immediately and swaps scene `1/2` assets for the local `3.*` markup reference on both sides so button/marker positions can be adjusted visually.
- `pnpm dev:validate` runs the same hitbox-alignment view through Vite dev/HMR so hitbox edits can be reviewed live against `3.*`; `pnpm validate:final` uses the final gameplay `1.*`/`2.*` images with the same editor. In these modes, visible hitbox markers are draggable; drag the marker frame to move it, the right/bottom handles to resize one axis, the bottom-right handle to resize both axes, or the top round handle to rotate ellipse hitboxes. Editing either A/B marker updates both side hitboxes and the shared hint area synchronously. The bottom editor bar can add a new centered hitbox next to "Apply"; each editable hitbox has an X delete control that asks for confirmation before removing it from the draft. Edits apply immediately to the current level, persist in localStorage for that level, and the on-screen "Apply" button writes the edited hitboxes back into the relevant `src/content/*` level module through a local dev-only Vite endpoint. "Copy JSON" still copies the edited `differences` array, and "Reset" clears the local authoring override.
- `pnpm validate:archive` reuses the final A/B hitbox editor for Daily Archive cases and can Apply edits back into `src/content/dailyArchive.ts`; the validation bar exposes all seven archive cases in one session.
- Responsive photo comparator with desktop side-by-side and mobile landscape A/B flip or before/after slider; mobile portrait is blocked by a rotate-device gate and is not a playable layout.
- Circle/polygon hit testing, found markers, hints, misclicks and completion. New saves start with 1 hint, campaign progression grants +1 hint after every second newly completed campaign level, and hints can accumulate through rewards.
- Yandex Player Data cloud saves with a `ysdk.getStorage()` / `localStorage` mirror fallback and versioned schema.
- Yandex Games SDK lifecycle: `/sdk.js` bootstrap, early pause/resume subscription, one-shot `LoadingAPI.ready()` after hydration, and centralized `GameplayAPI.start()` / `stop()` for active gameplay.
- First-run locale auto-detection through `ysdk.environment.i18n.lang`, with persisted manual RU/EN override.
- Mock platform adapter and diagnostics copy.
- Post-victory review pre-prompt wired to the Yandex Games feedback API seam with local dev mocks; the first prompt is eligible after the fourth newly completed campaign level.
- Forced fullscreen interstitials are queued after every second completed campaign level of the session (replays included) and shown from the victory screen before either navigation — next level or back to the map. They are suppressed by the `no_forced_ads` entitlement, by a rewarded video shown less than 90 seconds ago, and never interrupt gameplay.
- Startup routing opens White Meridian level 01 with a soft investigation onboarding overlay only for a brand-new save; on phones, the compare-control choice follows the briefing before gameplay begins. Returning players start from the archive hub/main menu.
- Privacy-safe attempt-level product analytics for activation, campaign exposure, gameplay outcomes, hints, ads, saves/scenes/errors, daily rewards and review prompts, with typed Yandex Metrica `reachGoal` registry and release gate.

## Agent Workflow

Start with `AGENTS.MD`, then use `docs/AGENT_INDEX.md` to choose the smallest relevant file set. Content and UI tasks have short flow guides in `docs/FLOWS/`.
