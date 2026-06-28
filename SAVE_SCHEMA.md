# Save Schema

Version: `1`

Stored fields: completed levels, best results, in-progress level, magnifiers, artifacts, daily streak, settings, review prompt state and purchase flags. Runtime validation is in `src/entities/save/schema.ts`.

Persisted review prompt fields:

- `reviewPrompt.schemaVersion`
- `reviewPrompt.prePromptShownCount`
- `reviewPrompt.nextEligibleCompletedLevel`
- `reviewPrompt.nativeReviewResolved`
- `reviewPrompt.lastUnavailableReason`

`nativeRequestInFlight` is intentionally runtime-only and lives in Zustand state so a crashed session cannot permanently block future review attempts.

Local development may also set the purchase marker `dev-all-campaigns` inside `purchases.productIds` through the browser-console cheat hook exposed only in Vite dev mode.
