# Content Pipeline

Runtime placeholder assets live in `public/assets/scenes/northern-route/placeholder/`.

Chapter 1 map point titles in `src/i18n/*/common.json` are sourced from `docs/plot/meridian/10_STORY_AND_SCENE_PROMPTS.md`.

Playable chapter wiring now goes through `src/content/campaignManifest.ts`, campaign builder modules, and `src/content/chapters.ts`. To connect a new campaign quickly:

1. Drop the handoff package into `docs/plot/<campaign>/`.
2. Add the scene asset folder under `public/assets/scenes/<runtime-folder>/`.
3. Register asset folder, preview filename, background asset and aspect ratio in `src/content/campaignManifest.ts`.
4. Create a level builder module like `src/content/sandMeridianLevels.ts`.
5. Register the chapter once in `src/content/chapters.ts` with map points and level list.
6. Add locale titles in `src/i18n/ru/common.json` and `src/i18n/en/common.json`.
7. Run `pnpm validate:content`.

Production replacement should follow the docs pipeline: master A, local B edits only, diff validation, hitbox annotation, manifest and provenance update.

## Three-image level intake

For each new level, intake accepts three source images from the content owner:

1. Scene A: the left image shown to the player.
2. Scene B: the right image shown to the player.
3. Markup reference: the same composition with visible circles around the clickable differences.

The implementation workflow is:

1. Convert the three source images to WebP and place them under `public/assets/scenes/<campaign-folder>/<level-order>/` as `1.webp`, `2.webp`, and `3.webp`.
2. Wire `1.webp` to `imageA` and `2.webp` to `imageB` in the campaign level builder under `src/content/`.
3. Use `3.webp` only as the authoring reference for hitboxes. Do not show it in gameplay.
4. Transcribe each marked area from `3.webp` into normalized `hitAreaA`, `hitAreaB`, and `hintArea` data in `src/content/levels.ts`.
5. Update `ASSET_MANIFEST.md`, `ASSET_PROVENANCE.json`, and run `pnpm validate:content`.

Hitboxes are authored as normalized coordinates from `0` to `1` relative to the rendered image bounds. Prefer circles for round zones, ellipses for stretched markup rings, and polygons only when the clickable shape is materially non-elliptical.
`src/features/gameplay/PhotoComparator.tsx` renders scene images without cropping and draws found markers / area hints from those same normalized `hitArea*` / `hintArea` bounds, so the visible ring, click target and markup reference stay in the same coordinate space. Circle hitboxes are aspect-aware: `radius` is authored as the horizontal image-width fraction, while vertical radius is derived from the loaded image aspect ratio.

## Intake status

- Level 1 (`nr-01-scene01`) is wired to `public/assets/scenes/northern-route/1/1.webp` and `2.webp`.
- Level 1 hitboxes were transcribed from `public/assets/scenes/northern-route/1/3.webp` for compass, canisters, lifebuoy and seagull differences, then rechecked against the markup circles after aspect-aware circle rendering was added.
- Level 2 (`nr-02-scene02`) is wired to `public/assets/scenes/northern-route/2/1.webp` and `2.webp`.
- Level 2 hitboxes were transcribed from `public/assets/scenes/northern-route/2/3.webp` for rolled bedding, lamp color, snowshoes, rope and crate differences; the stretched markup rings use ellipse hitboxes.
- Level 3 (`nr-03-scene03`) is wired to `public/assets/scenes/northern-route/3/1.webp` and `2.webp`.
- Level 3 hitboxes were transcribed from `public/assets/scenes/northern-route/3/3.webp` for lighthouse lens, open window, lantern count, map route and compass differences.
- Level 4 (`nr-04-scene04`) is wired to `public/assets/scenes/northern-route/4/1.webp` and `2.webp`.
- Level 4 hitboxes were transcribed from `public/assets/scenes/northern-route/4/3.webp` for switch, train door, barrel count, handcart, lantern color and fur glove differences.
- Levels 5-12 (`nr-05` through `nr-12`) are wired to their runtime WebP scene pairs under `public/assets/scenes/northern-route/<level-order>/1.webp` and `2.webp`.
- Levels 5-12 hitboxes are transcribed from their `3.webp` markup references in `src/content/levels.ts`, replacing the earlier scaffold coordinates. Levels 5, 6, 7, 8, 9, 10 and 12 were rechecked against the visible markup rings after aspect-aware circle rendering and ellipse hitboxes were added.
- Level 13 (`nr-13-scene13`) is wired to `public/assets/scenes/northern-route/13/1.webp` and `2.webp`.
- Level 13 hitboxes were transcribed from `public/assets/scenes/northern-route/13/3.webp` for the tent opening, survey device, mug, rope coil, tarp, rope marker, striped post and bridge differences.
- Runtime scene, markup, preview and map background assets in `public/assets/scenes/` are WebP. Keep source masters outside runtime folders if they need to be preserved.
- Campaign journal/map card previews resolve to each campaign's runtime `1.webp` asset via `src/content/sceneAssets.ts` and `src/content/campaignManifest.ts`.
- `sand-meridian` is connected from `docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json` and runtime assets in `public/assets/scenes/sand-meredian/`.
- `sand-meridian` map placement is data-driven; no manual point coordinates remain in `MapScreen`.
- `sand-meridian` gameplay now uses transcribed hitboxes for levels 1-13 based on each scene's `public/assets/scenes/sand-meredian/<level-order>/3.webp` markup reference. Levels 3, 7, 11, 12 and 13 were rechecked against their markup references and include their marked circles.
- `emerald-meridian` is connected from `docs/plot/emerald-meredian/emerald_meridian_story_map_placement_guide.md` and runtime assets in `public/assets/scenes/emerald-meridian/`.
- `emerald-meridian` map placement is stored in `src/content/chapters.ts` as a sequential 13-point route derived from the story placement guide until a dedicated handoff JSON is supplied.
- `emerald-meridian` gameplay hitboxes in `src/content/emeraldMeridianLevels.ts` are transcribed from each level's `3.webp` annotation rings (find-ALL: `requiredDifferences` equals the number of rings per level — 10, 9, 9, 10, 7, 9, 9, 11, 9, 10, 9, 9, 9).
- Local layout-debug mode is opt-in with `VITE_LAYOUT_DEBUG=true pnpm dev`; it can swap gameplay `1/2` scene assets to the local `3.*` markup reference via `getSceneMarkupAsset()` and draw all authored difference markers immediately for visual alignment work.
- `pnpm dev:validate` starts the same layout-debug mode through Vite dev/HMR, so reviewers can compare authored hitboxes against every level's `3.*` markup reference while code and content edits update live.
- `pnpm validate:content` now checks level assets, chapter previews/backgrounds, locale keys, provenance coverage, markup references, known campaign runtime folders and accidental debug-flag usage.
