# Save Schema

Version: `2`

Stored fields: completed levels, best results, in-progress level, magnifiers, artifacts, daily streak, settings, review prompt state and purchase flags. Runtime validation and migration are in `src/entities/save/schema.ts`.

Storage flow:

- Yandex Player Data (`player.getData` / `player.setData`) is the canonical cloud save when the Yandex SDK is available.
- The local mirror uses `ysdk.getStorage()` when available, then `window.localStorage` as the browser fallback.
- Hydration loads local and cloud saves, validates both, and uses the valid save with the newest `updatedAt`.
- Cloud load has a 4-second timeout. If cloud is unavailable, gameplay continues from the local mirror or a default save.
- Frequent gameplay progress can use non-flushing cloud writes; important milestones and lifecycle exits request `flush: true`.
- Version `2` stores in-progress timer state as `inProgress.elapsedActiveSeconds`; it increments only during active gameplay and is used to restore remaining time after reload.
- Version `1` saves are migrated safely. Old `inProgress.elapsedSeconds` is treated as active elapsed time when present; missing or invalid values fall back to `0`.
- `settings.localeSource` records whether locale came from SDK auto-detection or a manual settings choice. SDK language can update only auto-sourced locale.

Persisted review prompt fields:

- `reviewPrompt.schemaVersion`
- `reviewPrompt.prePromptShownCount`
- `reviewPrompt.nextEligibleCompletedLevel`
- `reviewPrompt.nativeReviewResolved`
- `reviewPrompt.lastUnavailableReason`

`nativeRequestInFlight` is intentionally runtime-only and lives in Zustand state so a crashed session cannot permanently block future review attempts.

Local development still exposes browser-console cheat hooks only in Vite dev mode. Dev unlock code is dynamically imported from `src/dev/*` and must not appear in production chunks.
