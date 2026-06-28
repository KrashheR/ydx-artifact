# Analytics Events

Required events are listed in `docs/game_concept.json`.

The scaffold still does not send network analytics, but review prompt instrumentation now goes through `src/services/analytics/analytics.ts` so the contract is explicit:

- `review_prompt_eligible`
- `review_prompt_shown`
- `review_prompt_review_clicked`
- `review_prompt_later_clicked`
- `review_prompt_closed`
- `review_native_requested`
- `review_native_sent`
- `review_native_closed`
- `review_native_unavailable`
- `review_native_error`
