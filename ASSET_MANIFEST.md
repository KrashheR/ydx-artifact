# Asset Manifest

All runtime scene assets in this scaffold are local placeholders. They preserve the expected path discipline and allow gameplay, validation and build checks without external hotlinks.

Production level intake stores converted runtime scene images under `public/assets/scenes/northern-route/<level-order>/`:

- `1.webp`: left scene, wired to `imageA`.
- `2.webp`: right scene, wired to `imageB`.
- `3.webp`: markup reference used for authoring hitboxes; not displayed in gameplay.

`sand-meridian` runtime intake uses compressed WebP files under `public/assets/scenes/sand-meredian/<level-order>/`:

- `1.webp`: left scene, wired to `imageA`.
- `2.webp`: right scene, wired to `imageB`.
- `3.webp`: markup reference kept in the intake package for later hitbox transcription.

`emerald-meridian` runtime intake uses compressed WebP files under `public/assets/scenes/emerald-meridian/<level-order>/`:

- `1.webp`: left scene, wired to `imageA`.
- `2.webp`: right scene, wired to `imageB`.
- `3.webp`: markup reference kept in the intake package for later hitbox transcription.

Campaign selection screen previews are stored beside each chapter package as `public/assets/scenes/<chapter-folder>/preview.webp` and are resolved through `src/content/sceneAssets.ts`.

| id | path | kind | status | source |
|---|---|---|---|---|
| placeholder-a | `public/assets/scenes/northern-route/placeholder/a.svg` | scene A | placeholder | local SVG generated for scaffold |
| placeholder-b | `public/assets/scenes/northern-route/placeholder/b.svg` | scene B | placeholder | local SVG generated for scaffold |
| placeholder-thumb | `public/assets/scenes/northern-route/placeholder/thumb.svg` | thumbnail | placeholder | local SVG generated for scaffold |
| sand-meridian-background | `public/assets/scenes/sand-meredian/background.webp` | chapter map background | production-intake | content owner image provided in workspace, converted to WebP |
| sand-meridian-preview | `public/assets/scenes/sand-meredian/preview.webp` | campaign menu preview | production-intake | content owner image provided in workspace, converted to WebP |
| sand-meridian-package | `public/assets/scenes/sand-meredian/` | campaign scene package | production-intake | content owner package with scene triplets for folders `1-13` |
| sm-01-13-markup | `public/assets/scenes/sand-meredian/<level-order>/3.webp` | markup reference | authoring-only | folders `1-13` transcribed into gameplay hitboxes in `src/content/sandMeridianLevels.ts`; levels 3, 7, 11, 12 and 13 include their marked circles after recheck |
| emerald-meridian-background | `public/assets/scenes/emerald-meridian/bg.webp` | chapter map background | production-intake | content owner image provided in workspace, converted to WebP |
| emerald-meridian-preview | `public/assets/scenes/emerald-meridian/preview.webp` | campaign menu preview | production-intake | content owner image provided in workspace, converted to WebP |
| emerald-meridian-package | `public/assets/scenes/emerald-meridian/` | campaign scene package | production-intake | content owner package with scene triplets for folders `1-13` |
| northern-route-background | `public/assets/scenes/northern-route/background.webp` | chapter map background | production-intake | content owner image provided in workspace, converted to WebP |
| northern-route-preview | `public/assets/scenes/northern-route/preview.webp` | campaign menu preview | production-intake | content owner image provided in workspace, converted to WebP |
| nr-01-scene-a | `public/assets/scenes/northern-route/1/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-01-scene-b | `public/assets/scenes/northern-route/1/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-01-markup | `public/assets/scenes/northern-route/1/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-02-scene-a | `public/assets/scenes/northern-route/2/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-02-scene-b | `public/assets/scenes/northern-route/2/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-02-markup | `public/assets/scenes/northern-route/2/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-03-scene-a | `public/assets/scenes/northern-route/3/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-03-scene-b | `public/assets/scenes/northern-route/3/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-03-markup | `public/assets/scenes/northern-route/3/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-04-scene-a | `public/assets/scenes/northern-route/4/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-04-scene-b | `public/assets/scenes/northern-route/4/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-04-markup | `public/assets/scenes/northern-route/4/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-05-scene-a | `public/assets/scenes/northern-route/5/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-05-scene-b | `public/assets/scenes/northern-route/5/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-05-markup | `public/assets/scenes/northern-route/5/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-06-scene-a | `public/assets/scenes/northern-route/6/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-06-scene-b | `public/assets/scenes/northern-route/6/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-06-markup | `public/assets/scenes/northern-route/6/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-07-scene-a | `public/assets/scenes/northern-route/7/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-07-scene-b | `public/assets/scenes/northern-route/7/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-07-markup | `public/assets/scenes/northern-route/7/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-08-scene-a | `public/assets/scenes/northern-route/8/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-08-scene-b | `public/assets/scenes/northern-route/8/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-08-markup | `public/assets/scenes/northern-route/8/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-09-scene-a | `public/assets/scenes/northern-route/9/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-09-scene-b | `public/assets/scenes/northern-route/9/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-09-markup | `public/assets/scenes/northern-route/9/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-10-scene-a | `public/assets/scenes/northern-route/10/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-10-scene-b | `public/assets/scenes/northern-route/10/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-10-markup | `public/assets/scenes/northern-route/10/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-11-scene-a | `public/assets/scenes/northern-route/11/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-11-scene-b | `public/assets/scenes/northern-route/11/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-11-markup | `public/assets/scenes/northern-route/11/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-12-scene-a | `public/assets/scenes/northern-route/12/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-12-scene-b | `public/assets/scenes/northern-route/12/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-12-markup | `public/assets/scenes/northern-route/12/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
| nr-13-scene-a | `public/assets/scenes/northern-route/13/1.webp` | scene A | production-intake | content owner image converted from PNG |
| nr-13-scene-b | `public/assets/scenes/northern-route/13/2.webp` | scene B | production-intake | content owner image converted from PNG |
| nr-13-markup | `public/assets/scenes/northern-route/13/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
