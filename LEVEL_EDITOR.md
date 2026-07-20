# Level Editor

The local dev-only hitbox editor is available through `pnpm dev:validate` for markup-reference review and `pnpm validate:final` for final A/B scene review. Hitbox data is authored in `src/content/*` and can be written back with the editor's Apply action.

Mobile A/B image registration is authored separately with `pnpm dev:align`. Open the game in a landscape phone viewport, select the target campaign level, then nudge either image on X/Y in 0.5 CSS-pixel increments. The draft is stored per level in localStorage. `Apply` writes the pair to `src/content/sceneAlignment.json`; normal gameplay applies it to both the visible image and its marker/hit-test plane in flip and slider comparison modes. Desktop scene placement is unchanged. Set all four values to zero and Apply to remove an override.

Until an editor exists, new level markup uses the three-image intake documented in `CONTENT_PIPELINE.md`:

- `1.webp` is the left gameplay scene.
- `2.webp` is the right gameplay scene.
- `3.webp` is a reference-only markup image with visible circles around differences.

Do not implement gameplay by overlaying transparent buttons from the markup image. Use the markup image to read coordinates, then store normalized hitboxes in `src/content/levels.ts` so existing hit testing in `src/shared/lib/hitTesting.ts` remains the single source of interaction behavior.

Visible markers in the editor can be dragged, resized from the right/bottom/corner handles, and rotated for ellipse hitboxes from the top round handle. Ellipse rotation is stored as optional `rotation` degrees from `-180` to `180` and is preserved by the Apply endpoint for all campaign content modules.

Current authored intake:

- Level 1 (`nr-01-scene01`) uses `public/assets/scenes/northern-route/1/3.webp` as the markup reference.
- Its four circles are stored in `src/content/levels.ts` as normalized circle hitboxes for the compass, canisters, lifebuoy and seagull differences.
- Level 2 (`nr-02-scene02`) uses `public/assets/scenes/northern-route/2/3.webp` for rolled bedding, lamp color, snowshoes, rope and crate hitboxes.
- Level 3 (`nr-03-scene03`) uses `public/assets/scenes/northern-route/3/3.webp` for lighthouse lens, open window, lantern count, map route and compass hitboxes.
- Level 4 (`nr-04-scene04`) uses `public/assets/scenes/northern-route/4/3.webp` for switch, train door, barrel count, handcart, lantern color and fur glove hitboxes.
- Levels 5-12 now use normalized hitboxes transcribed from their `public/assets/scenes/northern-route/<level-order>/3.webp` markup references.
- Level 13 (`nr-13-scene13`) uses `public/assets/scenes/northern-route/13/3.webp` for the tent opening, survey device, mug, rope coil, tarp, rope marker, striped post and bridge hitboxes.
