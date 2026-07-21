# Save Schema

Version: `3`

Stored fields: completed levels, best results, in-progress level, magnifiers, artifacts, viewed campaign reports, daily streak, settings, review prompt state and purchase flags. Runtime validation and migration are in `src/entities/save/schema.ts`.

Storage flow:

- Yandex Player Data (`player.getData` / `player.setData`) is the canonical cloud save when the Yandex SDK is available.
- The local mirror uses `ysdk.getStorage()` when available, then `window.localStorage` as the browser fallback.
- Hydration loads local and cloud saves, validates both, and uses the valid save with the newest `updatedAt`.
- Cloud load has a 4-second timeout. If cloud is unavailable, gameplay continues from the local mirror or a default save.
- Frequent gameplay progress can use non-flushing cloud writes; important milestones and lifecycle exits request `flush: true`.
- Replaying a completed level updates `bestResults[levelId]` only when the new attempt is better: higher star count from accuracy wins first, then higher accuracy, then shorter duration. Worse replays do not downgrade saved stars.
- Daily Archive completions use standalone `daily-archive-*` level ids for in-progress and best-result data, but they do not append to campaign `completedLevels`, do not unlock campaign artifacts/reports/levels, and do not queue campaign review or interstitial checks. The daily reward path grants `+1` magnifier, records `daily.lastClaimDate`, and maintains `daily.streak` as consecutive calendar days (a missed day resets it to `1`).
- Version `3` persists the analytics attempt envelope in `inProgress`: `attemptId`, per-level `attemptNumber`, mode/start timestamps, terminal marker, onboarding flag, active-time baseline, monotonic `elapsedActiveSeconds`, `timeGrantedSeconds`, mistakes, hint/difference ids, rewarded hints and time-extension count. `levelAttemptCounts` keeps attempt numbering stable across completed/restarted attempts.
- Background/timeout attempts retain gameplay progress with a terminal marker. A later resume creates a new attempt ID/number and active-time baseline while preserving found differences and total active timer state. Restart creates an empty attempt.
- Timer extensions add to `timeGrantedSeconds`; they never reduce `elapsedActiveSeconds`.
- Version `1` and `2` saves are migrated safely. Old `inProgress.elapsedSeconds` is treated as active elapsed time when present; missing attempt metadata receives a migration-safe attempt ID and zeroed counters.
- `settings.localeSource` records whether locale came from SDK auto-detection or a manual settings choice. SDK language can update only auto-sourced locale.
- `settings.comparatorScheme` stores the mobile compare scheme: `"slider"` (before/after slider), `"flip"` (single frame with an A/B flip button), `"side-by-side"` (both photos with shared zoom/pan), or `null` (not chosen yet, defaults for older saves via zod `.default(null)`). While it is `null`, mobile devices see a one-time scheme picker modal on launch; choosing an option or changing it later in settings persists the value with a flushed save. Desktop layout ignores this field.
- New saves start with `INITIAL_MAGNIFIERS = 1`.
- `magnifiers` (hints) are stored as a non-negative integer without a maximum cap. Campaign progression grants `+1` magnifier after every second newly completed campaign level; replays do not grant this cadence reward. Daily Archive rewards add to the current balance, and loading or migrating a save preserves large existing balances.
- `artifacts` is a record of `artifactId -> "locked" | "newly-unlocked" | "viewed"`. The canonical id set (15 ids, 5 per campaign) comes from `src/content/artifacts.ts`; `createDefaultSave` and `migrateSaveData` merge missing ids in as `locked`. Legacy ids from older saves (`brass-compass`, `field-radio`, `blue-flower`, `torn-map`) are kept but unused. On `hydrate`, artifacts are reconciled against `completedLevels` (milestone levels 3/6/8/10/13 per campaign), so saves that predate the collection unlock their artifacts as `newly-unlocked`. Opening an artifact's detail panel in the collection persists `viewed` and permanently clears its "new" badge. The post-level reveal queue is runtime-only and is not persisted.
- `viewedCampaignReportIds` stores campaign finale reports that have already been automatically shown (`white-meridian-report`, `sand-meridian-report`, `emerald-meridian-report`). Missing values in older version `2` saves default to `[]`, so completing level 13 of a campaign can show its report once without breaking existing cloud/local saves. Report configs live in `src/data/campaignReports.ts`; the first report maps the public White Meridian id to the existing `northern-route` chapter id.

Persisted review prompt fields:

- `reviewPrompt.schemaVersion`
- `reviewPrompt.prePromptShownCount`
- `reviewPrompt.nextEligibleCompletedLevel` (defaults to `4`; old saves with a lower first-prompt threshold are still clamped by runtime eligibility so the first pre-prompt cannot show before the fourth completed campaign level)
- `reviewPrompt.nativeReviewResolved`
- `reviewPrompt.lastUnavailableReason`

`nativeRequestInFlight` is intentionally runtime-only and lives in Zustand state so a crashed session cannot permanently block future review attempts.
Interstitial post-level checks are also runtime-only: the save records purchases/no-ads, but queued fullscreen ad opportunities are not persisted.

Local development still exposes browser-console cheat hooks only in Vite dev mode. Dev unlock code is dynamically imported from `src/dev/*` and must not appear in production chunks.
