# Content Pipeline

Runtime placeholder assets live in `public/assets/scenes/northern-route/placeholder/`.

Chapter 1 map point titles in `src/i18n/*/common.json` are sourced from `docs/plot/meridian/10_STORY_AND_SCENE_PROMPTS.md`.

Playable chapter wiring now goes through `src/content/chapters.ts`. To connect a new company/campaign quickly:

1. Drop the handoff package into `docs/plot/<campaign>/`.
2. Add the scene asset folder under `public/assets/scenes/<runtime-folder>/`.
3. Create a level builder module like `src/content/sandMeridianLevels.ts`.
4. Register the chapter once in `src/content/chapters.ts` with background asset, aspect ratio and map points.
5. Add locale titles in `src/i18n/ru/common.json` and `src/i18n/en/common.json`.
6. Run `pnpm validate:content`.

Production replacement should follow the docs pipeline: master A, local B edits only, diff validation, hitbox annotation, manifest and provenance update.

## Three-image level intake

For each new level, intake accepts three source images from the content owner:

1. Scene A: the left image shown to the player.
2. Scene B: the right image shown to the player.
3. Markup reference: the same composition with visible circles around the clickable differences.

The implementation workflow is:

1. Convert the three source images to WebP and place them under `public/assets/scenes/northern-route/<level-order>/` as `1.webp`, `2.webp`, and `3.webp`.
2. Wire `1.webp` to `imageA` and `2.webp` to `imageB` in `src/content/levels.ts`.
3. Use `3.webp` only as the authoring reference for hitboxes. Do not show it in gameplay.
4. Transcribe each marked area from `3.webp` into normalized `hitAreaA`, `hitAreaB`, and `hintArea` data in `src/content/levels.ts`.
5. Update `ASSET_MANIFEST.md`, `ASSET_PROVENANCE.json`, and run `pnpm validate:content`.

Hitboxes are authored as normalized coordinates from `0` to `1` relative to the rendered image bounds. Prefer circles for marked round zones; use polygons only when the clickable shape is materially non-circular.

## Intake status

- Level 1 (`nr-01-scene01`) is wired to `public/assets/scenes/northern-route/1/1.webp` and `2.webp`.
- Level 1 hitboxes were transcribed from `public/assets/scenes/northern-route/1/3.webp` for compass, canisters, lifebuoy and seagull differences.
- Level 2 (`nr-02-scene02`) is wired to `public/assets/scenes/northern-route/2/1.webp` and `2.webp`.
- Level 2 hitboxes were transcribed from `public/assets/scenes/northern-route/2/3.webp` for rolled bedding, lamp color, snowshoes, rope and crate differences.
- Level 3 (`nr-03-scene03`) is wired to `public/assets/scenes/northern-route/3/1.webp` and `2.webp`.
- Level 3 hitboxes were transcribed from `public/assets/scenes/northern-route/3/3.webp` for lighthouse lens, open window, lantern count, map route and compass differences.
- Level 4 (`nr-04-scene04`) is wired to `public/assets/scenes/northern-route/4/1.webp` and `2.webp`.
- Level 4 hitboxes were transcribed from `public/assets/scenes/northern-route/4/3.webp` for switch, train door, barrel count, handcart, lantern color and fur glove differences.
- Levels 5-12 (`nr-05` through `nr-12`) are now wired to their runtime WebP scene pairs under `public/assets/scenes/northern-route/<level-order>/1.webp` and `2.webp`.
- Levels 5-12 also have `3.webp` markup references exported for authoring, but their gameplay hitboxes in `src/content/levels.ts` still use temporary scaffold data until the marked circles are transcribed.
- Level 13 (`nr-13-scene13`) is wired to `public/assets/scenes/northern-route/13/1.webp` and `2.webp`.
- Level 13 hitboxes were transcribed from `public/assets/scenes/northern-route/13/3.webp` for the tent opening, survey device, mug, rope coil, tarp, rope marker, striped post and bridge differences.
- The original PNG files remain in the same folder as source intake files; runtime uses the converted WebP files.
- `sand-meridian` is connected from `docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json` and runtime assets in `public/assets/scenes/sand-meredian/`.
- `sand-meridian` map placement is data-driven; no manual point coordinates remain in `MapScreen`.
- `sand-meridian` gameplay currently uses scaffold hitboxes in `src/content/sandMeridianLevels.ts` until marked reference images are transcribed.
- The current `sand-meridian` art package contains scene folders `1-12`; level 13 is wired through a documented fallback to folder `12` until `public/assets/scenes/sand-meredian/13/` is delivered.
