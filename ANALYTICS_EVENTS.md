# Analytics Events

Runtime adapter: `src/services/analytics/analytics.ts`. Typed source of truth:
`src/services/analytics/eventRegistry.ts`. The Metrica sync script imports that
registry; `pnpm validate:analytics` checks runtime names and this document.

## Transport and privacy

With a numeric `VITE_YANDEX_METRICA_ID`, events are sent as
`ym(counterId, "reachGoal", "aa_<event>", payload)`. Without it, the last 100
events remain in `window.__artifactAnalyticsEvents` for local diagnostics.

Every payload uses schema version 2 and adds:

- `sessionId`, `eventSequence`;
- `buildId`, `gameVersion`, `contentVersion`, `environment`;
- `locale`, `platformDeviceType`, `viewportWidth`, `viewportHeight`;
- `platformMode`.

The goal name already identifies the event, and Metrica timestamps it, so the
payload does not repeat an event name or client ISO timestamp. Do not add profile
IDs, names, email, full saves, purchase tokens, raw stacks, URLs, or raw error
messages. Errors use a normalized non-reversible `fingerprint`.

## Activation

| Event                          | Meaning                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `game_open`                    | Bootstrap began.                                                                        |
| `save_load_result`             | Save hydration succeeded or fell back, with `result`, `source`, and cloud availability. |
| `game_ready`                   | The first interactive frame and Yandex Loading API readiness completed.                 |
| `game_ready_timing`            | Bootstrap duration in `durationMs`.                                                     |
| `onboarding_impression`        | The first-run overlay became visible; no level attempt exists yet.                      |
| `onboarding_start_clicked`     | Player accepted onboarding and the first attempt starts.                                |
| `onboarding_first_interaction` | First honest difference found in the onboarding attempt; activation milestone.          |
| `onboarding_completed`         | The onboarding attempt completed the first level.                                       |
| `onboarding_abandoned`         | Page/tab was left while the onboarding overlay was still open.                          |

## Level attempt contract

`level_attempt_start`, `level_resume`, `difference_found`, `hint_revealed`, and
`level_attempt_end` share `attemptId` and `attemptNumber`. A background return
starts a new attempt segment with a new ID, preserving saved level progress.
Only one terminal event is emitted for an ID.

| Event                 | Meaning and key fields                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `level_attempt_start` | New attempt: level/campaign/mode, attempt ID/number, replay, compare scheme.                                         |
| `level_resume`        | New resumed segment after saved/background/timeout state, including `resumedFoundDifferences`.                       |
| `difference_found`    | Difference ID, find order, attempt ID, elapsed active time, `hintAssisted`.                                          |
| `hint_revealed`       | Difference ID, source, attempt ID/number and cumulative hint count.                                                  |
| `level_time_extended` | Time grant; active time is not reduced. Includes total granted time and attempt ID.                                  |
| `level_attempt_end`   | Exactly one outcome: `completed`, `timeout`, `explicit_exit`, `background_abandon`, `restart`, or `technical_error`. |
| `level_complete`      | Durable result/progression event with attempt ID, total active time, hints, mistakes, accuracy, replay and rewards.  |
| `level_next_clicked`  | Player continues from victory to the next level.                                                                     |

`level_attempt_end` includes `activeDurationSeconds` for this segment,
`totalActiveDurationSeconds` for the preserved level run, `wallDurationSeconds`,
found/required differences, aggregated misclicks, hints, rewarded hints, time
extensions/grant, scheme, replay and onboarding flags. Misclicks are not sent per
tap, avoiding Metrica visit-parameter pressure.

Completion `durationSeconds` is monotonic total active gameplay time. Timer
extensions increment `timeGrantedSeconds`; they never subtract active duration.
`no-intervention` is awarded only when `hintsUsed` is zero.

## Navigation, content, collection and daily

| Event                                | Meaning                                                             |
| ------------------------------------ | ------------------------------------------------------------------- |
| `screen_view`                        | Home/map/game/daily/collection navigation.                          |
| `settings_opened`                    | Settings opened.                                                    |
| `settings_closed`                    | Settings closed.                                                    |
| `settings_language_changed`          | Selected locale changed.                                            |
| `settings_comparator_scheme_changed` | Compare scheme changed.                                             |
| `campaign_card_impression`           | Campaign exposure denominator with status, position and `eligible`. |
| `campaign_selected`                  | Campaign card/continue action.                                      |
| `locked_campaign_clicked`            | Locked campaign action.                                             |
| `campaign_entered`                   | Eligible campaign map or direct continue was entered.               |
| `campaign_first_level_completed`     | First level of a campaign completed for the first time.             |
| `campaign_progress`                  | A new campaign level completion advanced progress.                  |
| `campaign_completed`                 | Final level of a campaign completed for the first time.             |
| `campaign_unlocked`                  | Sequential next campaign became eligible.                           |
| `level_card_clicked`                 | Level card or current-level CTA clicked.                            |
| `campaign_report_shown`              | Campaign finale report shown.                                       |
| `campaign_report_cta_clicked`        | Finale report action.                                               |
| `collection_opened`                  | Collection opened.                                                  |
| `collection_artifact_viewed`         | Artifact detail viewed.                                             |
| `collection_replay_level_clicked`    | Replay launched from an artifact.                                   |
| `artifact_unlock_queued`             | New artifact queued after completion.                               |
| `artifact_unlock_modal_shown`        | Artifact reveal modal shown.                                        |
| `artifact_unlock_continue_clicked`   | Continue from reveal.                                               |
| `artifact_unlock_collection_clicked` | Collection opened from reveal.                                      |
| `artifact_toast_shown`               | Difference-linked artifact toast shown.                             |
| `daily_opened`                       | Daily hub entry exposed/opened.                                     |
| `daily_start_clicked`                | Daily case start clicked.                                           |
| `daily_reward_claimed`               | Daily completion/reward; `streak` is consecutive calendar days.     |
| `magnifiers_spent`                   | Hint currency spend.                                                |

## Ads and reviews

Rewarded funnel: `rewarded_hint_offer_opened`, `rewarded_hint_requested`,
`rewarded_hint_rewarded`, `rewarded_hint_closed`, `rewarded_hint_failed`.

Interstitial funnel: `interstitial_eligible`, `interstitial_request`,
`interstitial_open`, `interstitial_close`, `interstitial_error`.

Review funnel: `review_prompt_eligible`, `review_prompt_shown`,
`review_prompt_review_clicked`, `review_prompt_later_clicked`,
`review_prompt_closed`, `review_native_requested`, `review_native_sent`,
`review_native_closed`, `review_native_unavailable`, `review_native_error`.

## Quality telemetry

| Event               | Meaning                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `save_write_failed` | Neither persistent path accepted the save; safe status only.                                      |
| `scene_load_result` | A/B preload result, failed asset count and duration.                                              |
| `fatal_error`       | Window error/unhandled rejection with safe fingerprint; ends active attempt as `technical_error`. |

## Release operations

- `pnpm validate:analytics` checks registry ↔ static runtime calls ↔ docs.
- Release commands add `--release`, requiring a numeric production counter.
- Post-build `--dist` verifies the counter ID and Metrica initialization exist in output.
- `pnpm metrika:goals` and `pnpm metrika:goals:publish` use the same registry.
- A real ingestion smoke in the target counter remains a manual/CI credentialed
  gate; record it in the release checklist.

Production analytics debug logging must remain disabled.
