# Asset Manifest

All runtime scene assets in this scaffold are local placeholders. They preserve the expected path discipline and allow gameplay, validation and build checks without external hotlinks.

Production level intake stores converted scene images under `public/assets/scenes/northern-route/<level-order>/`:

- `1.webp`: left scene, wired to `imageA`.
- `2.webp`: right scene, wired to `imageB`.
- `3.webp`: markup reference used for authoring hitboxes; not displayed in gameplay.

| id | path | kind | status | source |
|---|---|---|---|---|
| placeholder-a | `public/assets/scenes/northern-route/placeholder/a.svg` | scene A | placeholder | local SVG generated for scaffold |
| placeholder-b | `public/assets/scenes/northern-route/placeholder/b.svg` | scene B | placeholder | local SVG generated for scaffold |
| placeholder-thumb | `public/assets/scenes/northern-route/placeholder/thumb.svg` | thumbnail | placeholder | local SVG generated for scaffold |
| nr-01-scene-a | `public/assets/scenes/northern-route/1/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-01-scene-b | `public/assets/scenes/northern-route/1/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-01-markup | `public/assets/scenes/northern-route/1/3.webp` | markup reference | authoring-only | content owner image converted from PNG |
