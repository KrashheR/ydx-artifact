# Yandex Integration

`src/services/platform/mockPlatform.ts` is the current adapter seam. It now wraps the Yandex review API, rewarded advertising API and fullscreen advertising API:

- `mockPlatform.canReview()` safely returns `{ value: false, reason: "UNKNOWN" }` when Yandex SDK or `ysdk.feedback` is unavailable.
- `mockPlatform.requestReview()` normalizes the documented `feedbackSent` response and tolerates the older `sentFeedback` example payload.
- `mockPlatform.showRewarded()` calls `ysdk.adv.showRewardedVideo()` when available, grants only after `onRewarded` followed by close, and falls back to an immediate local mock reward in Vite/local mode.
- `mockPlatform.showInterstitial()` calls `ysdk.adv.showFullscreenAdv()` when available and falls back to a short local mock open/close cycle in Vite/local mode.
- SDK initialization is cached via a singleton promise and reuses `window.ysdk` when the host already initialized the SDK.

Rewarded hint behavior:

- the regular area hint button spends one magnifier while the player has a positive balance;
- when the balance is `0`, the same button shows an ad icon and requests a rewarded Yandex ad;
- the hint marker is applied only when the rewarded ad returns `rewarded`; closing or failing the ad returns the player to gameplay without a hint or penalty;
- rewarded hint offers remain available after a rewarded hint while there are still unrevealed differences, so the player can watch another ad for another hint.

Forced interstitial cadence:

- only after a newly completed campaign level;
- only on the campaign map after returning from gameplay;
- queued at total completed campaign levels `3, 6, 9, ...`;
- skipped for replay completions, daily levels and saves with `purchases.noForcedInterstitials`;
- the runtime queue is not persisted in the save schema.

Cloud save is wired through `src/services/storage/localSaveService.ts`:

- `loadPersistentSave()` reads the local mirror and Yandex Player Data in parallel, validates both with `saveSchema`, and chooses the newest valid save by `updatedAt`.
- The cloud read path uses `ysdk.getPlayer().getData()` with a 4-second timeout.
- `savePersistentSave()` writes the full save to the local mirror first, then best-effort syncs `ysdk.getPlayer().setData(save, flush)`.
- The local mirror prefers `ysdk.getStorage()` and falls back to `window.localStorage`.
- Cloud failures surface to the app as `saveStatus: "local-only"` and do not block gameplay.

Local development remains safe:

- the app does not crash without Yandex SDK;
- `window.__artifactDev?.setReviewMock("sent" | "closed" | "unavailable" | "error")` overrides the review gateway in Vite dev mode;
- `window.__artifactDev?.triggerReviewPromptDemo()` seeds the third-level map scenario and queues the review check for manual verification.
