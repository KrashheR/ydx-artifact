# Save Schema

Version: `2`

Stored fields: completed levels, best results, in-progress level, magnifiers, artifacts, daily streak, settings, review prompt state and purchase flags. Runtime validation and migration are in `src/entities/save/schema.ts`.

Storage flow:

- Yandex Player Data (`player.getData` / `player.setData`) is the canonical cloud save when the Yandex SDK is available.
- The local mirror uses `ysdk.getStorage()` when available, then `window.localStorage` as the browser fallback.
- Hydration loads local and cloud saves, validates both, and uses the valid save with the newest `updatedAt`.
- Cloud load has a 4-second timeout. If cloud is unavailable, gameplay continues from the local mirror or a default save.
- Frequent gameplay progress can use non-flushing cloud writes; important milestones and lifecycle exits request `flush: true`.
- Replaying a completed level updates `bestResults[levelId]` only when the new attempt is better: higher star count from accuracy wins first, then higher accuracy, then shorter duration. Worse replays do not downgrade saved stars.
- Version `2` stores in-progress timer state as `inProgress.elapsedActiveSeconds`; it increments only during active gameplay and is used to restore remaining time after reload.
- Version `1` saves are migrated safely. Old `inProgress.elapsedSeconds` is treated as active elapsed time when present; missing or invalid values fall back to `0`.
- `settings.localeSource` records whether locale came from SDK auto-detection or a manual settings choice. SDK language can update only auto-sourced locale.
- `magnifiers` (hints) are capped at `MAX_MAGNIFIERS = 3`. The cap applies when granting level/daily rewards and when loading or migrating a save, so older saves with a larger stock clamp down to 3.
- `artifacts` is a record of `artifactId -> "locked" | "newly-unlocked" | "viewed"`. The canonical id set (15 ids, 5 per campaign) comes from `src/content/artifacts.ts`; `createDefaultSave` and `migrateSaveData` merge missing ids in as `locked`. Legacy ids from older saves (`brass-compass`, `field-radio`, `blue-flower`, `torn-map`) are kept but unused. On `hydrate`, artifacts are reconciled against `completedLevels` (milestone levels 3/6/8/10/13 per campaign), so saves that predate the collection unlock their artifacts as `newly-unlocked`. Opening an artifact's detail panel in the collection persists `viewed` and permanently clears its "new" badge. The post-level reveal queue is runtime-only and is not persisted.

Persisted review prompt fields:

- `reviewPrompt.schemaVersion`
- `reviewPrompt.prePromptShownCount`
- `reviewPrompt.nextEligibleCompletedLevel` (defaults to `4`; old saves with a lower first-prompt threshold are still clamped by runtime eligibility so the first pre-prompt cannot show before the fourth completed campaign level)
- `reviewPrompt.nativeReviewResolved`
- `reviewPrompt.lastUnavailableReason`

`nativeRequestInFlight` is intentionally runtime-only and lives in Zustand state so a crashed session cannot permanently block future review attempts.
Interstitial post-level checks are also runtime-only: the save records purchases/no-ads, but queued fullscreen ad opportunities are not persisted.

Local development still exposes browser-console cheat hooks only in Vite dev mode. Dev unlock code is dynamically imported from `src/dev/*` and must not appear in production chunks.
