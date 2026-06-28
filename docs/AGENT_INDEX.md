# Agent Index

Use this file as the first routing table after `AGENTS.MD`, `README.md`, and `package.json`.
Open only the row that matches the task, then follow references from that area.

| Task area | Read first | Usually edit | Minimal checks | Docs to update |
|---|---|---|---|---|
| UI screen/layout | `docs/FLOWS/ui-change.md`, touched screen/component, `src/i18n/*/common.json` | `src/screens/*`, `src/shared/ui/*`, local tests | `pnpm lint`, `pnpm typecheck` | `README.md` or `CHANGELOG.md` only if user-visible |
| Gameplay comparator/hit testing | `src/features/gameplay/PhotoComparator.tsx`, `src/shared/lib/hitTesting.ts`, nearby tests | `src/features/gameplay/*`, `src/shared/lib/*` | focused Vitest or `pnpm test`, `pnpm typecheck` | `ARCHITECTURE.md`, `CONTENT_PIPELINE.md` if behavior changes |
| Campaign/level content | `docs/FLOWS/content-intake.md`, `CONTENT_PIPELINE.md`, relevant `src/content/*` | `src/content/*`, `public/assets/scenes/*`, locales | `pnpm validate:content` | `CONTENT_PIPELINE.md`, `ASSET_MANIFEST.md`, `ASSET_PROVENANCE.json`, `CHANGELOG.md` |
| Save/progression | `SAVE_SCHEMA.md`, `src/entities/save/schema.ts`, `src/shared/store/gameStore.ts` | save schema/store/progression tests | `pnpm test`, `pnpm typecheck` | `SAVE_SCHEMA.md`, `docs/starter-data/save.example.json` |
| Yandex/platform | `YANDEX_INTEGRATION.md`, `docs/06_YANDEX_PLATFORM_RELEASE_AND_MODERATION.md`, `src/services/*` | `src/services/*`, store seams | `pnpm typecheck`, focused tests | `YANDEX_INTEGRATION.md`, `INCIDENT_RUNBOOK.md` if operational |
| Analytics/LiveOps | `ANALYTICS_EVENTS.md`, `docs/07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md` | analytics services, event callers | `pnpm typecheck`, focused tests | `ANALYTICS_EVENTS.md` |
| Release/build | `RELEASE_CHECKLIST.md`, `docs/08_RELEASE_READINESS_CHECKLIST.md` | scripts/config/docs | `pnpm release:validate` or `pnpm agent:release-check` | release docs and `CHANGELOG.md` |

## Fast Commands

- `pnpm agent:check` - lint, typecheck, and content validation for broad agent edits.
- `pnpm agent:release-check` - content validation, production build, and Playwright smoke test.
- `pnpm validate:content` - campaign, level, asset, locale, provenance, markup reference, and debug-flag validation.

## Token Notes

- Large design exports under `docs/design-reference/` and `docs/menu-design/` are references, not first reads.
- Use `docs/design-reference/CODEX_HANDOFF.md` for UI rules before opening full HTML exports.
- `src/content/campaignManifest.ts` is the source for campaign asset folders, preview filenames, map backgrounds, and legacy folder notes.
