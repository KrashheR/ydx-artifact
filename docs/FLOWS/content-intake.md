# Content Intake Flow

Use this for campaign, level, hitbox, and scene asset work.

## Read

1. `CONTENT_PIPELINE.md`
2. `src/content/campaignManifest.ts`
3. The relevant campaign module in `src/content/`
4. `src/entities/level/schema.ts`
5. `ASSET_MANIFEST.md` and `ASSET_PROVENANCE.json` when assets change

## Implement

1. Put runtime files under the campaign runtime folder from `campaignManifest`.
2. Keep `1.*` as scene A, `2.*` as scene B, and `3.*` as the authoring-only markup reference.
3. Add or update level data through the campaign builder module.
4. Add RU/EN title keys in `src/i18n/ru/common.json` and `src/i18n/en/common.json`.
5. Update asset manifest/provenance for every new package or file source.
6. Run `pnpm validate:content`.

## Guardrails

- Do not add external scene art without provenance/license notes.
- Do not show `3.*` markup references in normal gameplay.
- Use `VITE_LAYOUT_DEBUG=true pnpm dev` only for local hitbox alignment work.
- If `sand-meridian` uses `sand-meredian` in paths, keep that spelling unless doing an explicit migration; it is a documented legacy runtime folder.
