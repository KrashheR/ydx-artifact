# Asset Manifest

All runtime scene assets in this scaffold are local placeholders. They preserve the expected path discipline and allow gameplay, validation and build checks without external hotlinks.

WebP assets under `public/assets/scenes/` were recompressed in place on 2026-06-29 and again on 2026-06-30 to reduce download/package size while preserving pixel dimensions and existing paths. On 2026-07-03, gameplay scene pairs named `1.webp` and `2.webp` were restored to each file's first committed runtime WebP blob (`361c921`, `61b1f77`, or `78d3b0d`) because later passes overcompressed gameplay images. Later on 2026-07-03, `scripts/optimize-scene-assets.ts --apply` was run with q97 and pixel metric gates, replacing only six oversized runtime scene pairs while preserving 1586x992 dimensions and existing paths. On 2026-07-04, all 78 runtime gameplay scene pairs named `1.webp` and `2.webp` were recompressed in place against a 13% minimum file-size reduction target, reducing the set from 46.6M bytes to 38.1M bytes while preserving 1586x992 dimensions and existing paths. `public/assets/scenes/northern-route/13/1.webp` is an exception restored from the updated A-scene blob committed in `fdd5d68` so level 13's A/B pair differs again. The `3.webp` markup references, campaign previews and generated card previews remain in their compressed derivative state. Project SVG images were whitespace-minified without geometry changes.

Artifact state images under `public/assets/artifacts/<campaign-folder>/<level-order>/` were converted on 2026-07-05 from owner-provided PNG sources to lossless WebP and downscaled from 1254x1254 to 512x512. The runtime folder keeps only the WebP derivatives; original PNG exports should stay outside runtime folders if preservation is required. Later on 2026-07-05 the filenames were normalized to exactly `open.webp` (unlocked state) and `closed.webp` (locked state) — the mixed `close.webp` copies were renamed — stray `.DS_Store` files were removed, and the images were wired into runtime via `getArtifactAsset` in `src/content/sceneAssets.ts` (campaign folders resolve through `campaignManifest.assetFolder`, so `sand-meridian` keeps using the legacy `sand-meredian` folder).

Archive intake scene images under `public/assets/scenes/archive/<level-order>/` were converted on 2026-07-06 from owner-provided PNG sources to lossless WebP with unchanged 1586x992 dimensions. The converted set covers folders `1-7` with `1.webp` scene A, `2.webp` scene B, and `3.webp` markup reference; the source PNG files are still present in the runtime folder until owner removal is confirmed.

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

Compressed preview derivatives are generated from the full-size assets by `pnpm assets:previews` (`scripts/generate-level-previews.ts`) and are the only preview files referenced at runtime:

- `<chapter-folder>/preview-sm.webp` (960px wide, q70): home campaign card preview, generated from `preview.webp`.
- `<chapter-folder>/<level-order>/card.webp` (720px wide, q70): map level card preview, generated from `<level-order>/1.webp`.

Re-run `pnpm assets:previews` after adding or replacing scene images. The production build excludes the full-size `preview.webp` sources and `3.webp` markup references from `dist/` (see `vite.config.ts`).

Use `pnpm assets:optimize` for a dry-run gated recompression report on runtime `1.webp` / `2.webp` gameplay scene pairs. Use `pnpm assets:optimize -- --apply` only after reviewing the accepted candidates; the script keeps dimensions unchanged and rejects files that do not meet the size and pixel-difference gates.

| id | path | kind | status | source |
|---|---|---|---|---|
| placeholder-a | `public/assets/scenes/northern-route/placeholder/a.svg` | scene A | placeholder | local SVG generated for scaffold |
| placeholder-b | `public/assets/scenes/northern-route/placeholder/b.svg` | scene B | placeholder | local SVG generated for scaffold |
| placeholder-thumb | `public/assets/scenes/northern-route/placeholder/thumb.svg` | thumbnail | placeholder | local SVG generated for scaffold |
| artifact-state-images-2026-07-05 | `public/assets/artifacts/<campaign-folder>/<level-order>/{open,closed}.webp` | artifact state image | production-runtime | owner-provided PNG artifact images converted to 512x512 lossless WebP; wired to the collection via `src/content/artifacts.ts` |
| archive-scene-package-2026-07-06 | `public/assets/scenes/archive/<level-order>/{1,2,3}.webp` | scene package | production-intake | owner-provided PNG archive scene folders `1-7` converted to lossless WebP with unchanged 1586x992 dimensions; source PNGs retained pending removal confirmation |
| sand-meridian-preview | `public/assets/scenes/sand-meredian/preview.webp` | campaign menu preview | production-intake | content owner image provided in workspace, converted to WebP |
| sand-meridian-package | `public/assets/scenes/sand-meredian/` | campaign scene package | production-intake | content owner package with scene triplets for folders `1-13` |
| sm-01-13-markup | `public/assets/scenes/sand-meredian/<level-order>/3.webp` | markup reference | authoring-only | folders `1-13` transcribed into gameplay hitboxes in `src/content/sandMeridianLevels.ts`; levels 3, 7, 11, 12 and 13 include their marked circles after recheck |
| emerald-meridian-preview | `public/assets/scenes/emerald-meridian/preview.webp` | campaign menu preview | production-intake | content owner image provided in workspace, converted to WebP |
| emerald-meridian-package | `public/assets/scenes/emerald-meridian/` | campaign scene package | production-intake | content owner package with scene triplets for folders `1-13` |
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
| nr-13-scene-a | `public/assets/scenes/northern-route/13/1.webp` | scene A | production-intake | updated A scene restored from committed blob `9279a8909c1cc0ae3a31c620890e0647b115fa71` in `fdd5d68` |
| nr-13-scene-b | `public/assets/scenes/northern-route/13/2.webp` | scene B | production-intake | existing workspace WebP retained as B after updated scene A intake |
| nr-13-markup | `public/assets/scenes/northern-route/13/3.webp` | markup reference | authoring-only | content owner markup reference converted from PNG |
