# Analytics Events

The runtime analytics adapter lives in `src/services/analytics/analytics.ts`.

## Transport

- Local/dev: every event is appended to `window.__artifactAnalyticsEvents` and printed to the console in dev mode.
- Production without `VITE_YANDEX_METRICA_ID`: events stay local only; no external analytics script is loaded.
- Production with `VITE_YANDEX_METRICA_ID=<counter id>`: `trackAnalyticsEvent()` dynamically loads the Yandex Metrica tag, initializes the counter and sends `ym(counterId, "reachGoal", "aa_<event>", payload)`.

Every payload is privacy-safe by contract:

- `schemaVersion`
- `sessionId` generated per browser tab session
- `event`
- `timestamp`
- `deviceType`
- `platformMode`
- `gameVersion`
- event-specific fields

Do not add Yandex profile IDs, names, emails, full saves, purchase tokens, raw stack traces, or browser history.

## Goal Naming

All custom goals use the `aa_` prefix in Yandex Metrica:

```text
level_start -> aa_level_start
level_complete -> aa_level_complete
rewarded_hint_rewarded -> aa_rewarded_hint_rewarded
```

Only use letters, numbers and underscores in event names.

## Core Events

| Event | When | Key fields |
|---|---|---|
| `game_open` | App bootstrap starts. | `language` |
| `save_loaded` | Persistent save hydration completes. | `source`, `cloudAvailable`, `completedLevels`, `language` |
| `game_ready` | `LoadingAPI.ready()` has been sent after the first interactive frame. | `language` |
| `screen_view` | Home/map/game screen becomes active. | `screen`, `campaignId`, `levelId`, `mode` |
| `settings_opened` | Settings modal opens. | `source`, `screen` |
| `settings_closed` | Settings modal closes. | `screen` |
| `settings_language_changed` | Player manually changes language. | `previousLanguage`, `language` |

## Campaign And Map Events

| Event | When | Key fields |
|---|---|---|
| `campaign_selected` | Player clicks a campaign card. | `campaignCardId`, `campaignStatus`, `completedInCampaign`, `totalInCampaign` |
| `locked_campaign_clicked` | Clicked campaign is locked. | `campaignCardId`, `campaignStatus` |
| `level_card_clicked` | Player clicks a level card or sticky current-level CTA. | `levelId`, `campaignId`, `levelOrder`, `source`, `completed`, `current`, `starCount` |
| `campaign_progress` | New campaign level completion advances progress. | same as `level_complete` |

## Gameplay Events

| Event | When | Key fields |
|---|---|---|
| `level_start` | Level starts or resumes from saved in-progress state. | `levelId`, `campaignId`, `levelOrder`, `mode`, `isReplay`, `resumedFoundDifferences` |
| `difference_found` | Player finds an unfound difference. | `levelId`, `differenceId`, `findOrder`, `elapsedActiveSeconds`, `mistakes` |
| `level_misclick` | Player taps/clicks an invalid point. | `levelId`, `misclicks`, `foundDifferences`, `elapsedActiveSeconds` |
| `hint_revealed` | Area hint is shown. | `levelId`, `differenceId`, `source`, `foundDifferences`, `mistakes`, `elapsedActiveSeconds` |
| `magnifiers_spent` | Magnifier currency is spent. | `amount`, `magnifiersBefore`, `magnifiersAfter` |
| `level_failed_timeout` | Level timer reaches zero. | `levelId`, `mode`, `foundDifferences`, `mistakes`, `elapsedActiveSeconds` |
| `level_time_extended` | Player spends magnifiers for extra time. | `levelId`, `foundDifferences`, `mistakes`, `elapsedActiveSeconds` |
| `level_retry` | In-progress level state is reset for retry. | `levelId`, `foundDifferences`, `mistakes`, `elapsedActiveSeconds` |
| `level_exit_to_map` | Player leaves gameplay to the campaign map. | `levelId`, `mode`, `foundDifferences`, `mistakes`, `elapsedActiveSeconds`, `completed` |
| `level_next_clicked` | Player starts the next level from the completion overlay. | `levelId`, `nextLevelId`, `campaignId`, `mode` |
| `level_complete` | Level completion is committed to save. | `levelId`, `campaignId`, `levelOrder`, `mode`, `durationSeconds`, `durationBucket`, `foundDifferences`, `mistakes`, `accuracy`, `isReplay`, `completedLevels`, `rewardMagnifiers`, `magnifiersAfterReward`, `artifactUnlockCount`, `queuedReviewCheck`, `queuedInterstitialCheck` |

`durationSeconds` is the exact active gameplay completion time rounded down to seconds. `durationBucket` is a stable grouping for quick Metrica segmentation: `under_30s`, `30_59s`, `60_119s`, `120_179s`, `180_239s`, `240_299s`, `300s_plus`.

## Daily Events

| Event | When | Key fields |
|---|---|---|
| `daily_start_clicked` | Player starts the daily entry. | `levelId`, `streak`, `lastClaimDate` |
| `daily_reward_claimed` | Daily completion grants streak reward. | `date`, `previousClaimDate`, `streak` |

## Ads Events

| Event | When | Key fields |
|---|---|---|
| `rewarded_hint_offer_opened` | Zero-magnifier hint offer opens. | `levelId`, `mode`, `foundDifferences`, `mistakes`, `elapsedActiveSeconds` |
| `rewarded_hint_requested` | Player confirms rewarded hint ad. | same as above |
| `rewarded_hint_rewarded` | Rewarded video grants the hint. | same as above |
| `rewarded_hint_closed` | Rewarded video closes without reward. | same as above |
| `rewarded_hint_failed` | Rewarded video fails/unavailable. | same as above |
| `interstitial_eligible` | Post-victory next-level interstitial cadence is eligible. | `completedLevels`, `campaignId`, `language`, `promptOrdinal` |
| `interstitial_request` | Fullscreen ad request starts. | same as above |
| `interstitial_open` | Fullscreen ad opens. | same as above |
| `interstitial_close` | Fullscreen ad closes. | same as above |
| `interstitial_error` | Fullscreen ad fails/offline. | same as above |

## Review Events

| Event | When |
|---|---|
| `review_prompt_eligible` | In-game review pre-prompt can be shown after a post-victory result. |
| `review_prompt_shown` | Pre-prompt is displayed over the post-victory result. |
| `review_prompt_review_clicked` | Player chooses review/rate action. |
| `review_prompt_later_clicked` | Player chooses later. |
| `review_prompt_closed` | Player closes the pre-prompt. |
| `review_native_requested` | Native Yandex review dialog is requested. |
| `review_native_sent` | Native review flow reports feedback sent. |
| `review_native_closed` | Native review flow closes without sent feedback. |
| `review_native_unavailable` | Yandex review API is unavailable or not eligible. |
| `review_native_error` | Native review flow throws or fails unexpectedly. |

## Recommended Metrica Goals

Yandex Metrica has a limited number of goals per counter, so do not create a separate goal for every level or difference. Create exact JavaScript-event goals for the main funnel:

- `aa_game_ready`
- `aa_level_start`
- `aa_difference_found`
- `aa_level_complete`
- `aa_level_failed_timeout`
- `aa_hint_revealed`
- `aa_rewarded_hint_requested`
- `aa_rewarded_hint_rewarded`
- `aa_interstitial_open`
- `aa_daily_reward_claimed`
- `aa_review_native_sent`

For deeper analysis, use event payload fields such as `levelId`, `campaignId`, `mode`, `differenceId`, `accuracy` and `durationSeconds`.
