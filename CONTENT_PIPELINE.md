# Content Pipeline

Runtime placeholder assets live in `public/assets/scenes/northern-route/placeholder/`.

Chapter 1 map point titles in `src/i18n/*/common.json` are sourced from `docs/plot/meridian/10_STORY_AND_SCENE_PROMPTS.md`.

Production replacement should follow the docs pipeline: master A, local B edits only, diff validation, hitbox annotation, manifest and provenance update.

## Three-image level intake

For each new level, intake accepts three source images from the content owner:

1. Scene A: the left image shown to the player.
2. Scene B: the right image shown to the player.
3. Markup reference: the same composition with visible circles around the clickable differences.

The implementation workflow is:

1. Convert all three source images to WebP.
2. Place them under `public/assets/scenes/northern-route/<level-order>/` as `1.webp`, `2.webp`, and `3.webp`.
3. Wire `1.webp` to `imageA` and `2.webp` to `imageB` in `src/content/levels.ts`.
4. Use `3.webp` only as the authoring reference for hitboxes. Do not show it in gameplay.
5. Transcribe each marked area from `3.webp` into normalized `hitAreaA`, `hitAreaB`, and `hintArea` data in `src/content/levels.ts`.
6. Update `ASSET_MANIFEST.md`, `ASSET_PROVENANCE.json`, and run `pnpm validate:content`.

Hitboxes are authored as normalized coordinates from `0` to `1` relative to the rendered image bounds. Prefer circles for marked round zones; use polygons only when the clickable shape is materially non-circular.

## Intake status

- Level 1 (`nr-01-scene01`) is wired to `public/assets/scenes/northern-route/1/1.webp` and `2.webp`.
- Level 1 hitboxes were transcribed from `public/assets/scenes/northern-route/1/3.webp` for compass, canisters, lifebuoy and seagull differences.
- The original PNG files remain in the same folder as source intake files; runtime uses the converted WebP files.
