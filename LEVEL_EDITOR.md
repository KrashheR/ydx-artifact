# Level Editor

The production dev-only level editor is not implemented in this scaffold. Hitbox data is currently authored in `src/content/levels.ts`.

Until an editor exists, new level markup uses the three-image intake documented in `CONTENT_PIPELINE.md`:

- `1.webp` is the left gameplay scene.
- `2.webp` is the right gameplay scene.
- `3.webp` is a reference-only markup image with visible circles around differences.

Do not implement gameplay by overlaying transparent buttons from the markup image. Use the markup image to read coordinates, then store normalized hitboxes in `src/content/levels.ts` so existing hit testing in `src/shared/lib/hitTesting.ts` remains the single source of interaction behavior.

Current authored intake:

- Level 1 (`nr-01-scene01`) uses `public/assets/scenes/northern-route/1/3.webp` as the markup reference.
- Its four circles are stored in `src/content/levels.ts` as normalized circle hitboxes for the compass, canisters, lifebuoy and seagull differences.
- Level 2 (`nr-02-scene02`) uses `public/assets/scenes/northern-route/2/3.webp` for rolled bedding, lamp color, snowshoes, rope and crate hitboxes.
- Level 3 (`nr-03-scene03`) uses `public/assets/scenes/northern-route/3/3.webp` for lighthouse lens, open window, lantern count, map route and compass hitboxes.
- Level 4 (`nr-04-scene04`) uses `public/assets/scenes/northern-route/4/3.webp` for switch, train door, barrel count, handcart, lantern color and fur glove hitboxes.
- Levels 5-12 already have gameplay scene pairs and markup references exported to WebP, but their marked circles have not yet been transcribed into normalized hitboxes in `src/content/levels.ts`.
- Level 13 (`nr-13-scene13`) uses `public/assets/scenes/northern-route/13/3.webp` for the tent opening, survey device, mug, rope coil, tarp, rope marker, striped post and bridge hitboxes.
