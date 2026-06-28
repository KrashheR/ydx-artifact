# Yandex Integration

`src/services/platform/mockPlatform.ts` is the current adapter seam. It now also wraps the Yandex review API:

- `mockPlatform.canReview()` safely returns `{ value: false, reason: "UNKNOWN" }` when Yandex SDK or `ysdk.feedback` is unavailable.
- `mockPlatform.requestReview()` normalizes the documented `feedbackSent` response and tolerates the older `sentFeedback` example payload.
- SDK initialization is cached via a singleton promise and reuses `window.ysdk` when the host already initialized the SDK.

Local development remains safe:

- the app does not crash without Yandex SDK;
- `window.__artifactDev?.setReviewMock("sent" | "closed" | "unavailable" | "error")` overrides the review gateway in Vite dev mode;
- `window.__artifactDev?.triggerReviewPromptDemo()` seeds the third-level map scenario and queues the review check for manual verification.
