# Yandex Integration

`src/services/platform/mockPlatform.ts` is the current adapter seam. It now wraps the Yandex review API, rewarded advertising API and fullscreen advertising API:

- Production `index.html` loads the Yandex Games SDK from `/sdk.js`; local/dev runs still fall back safely when `window.YaGames` is absent.
- `src/services/analytics/analytics.ts` sends typed Yandex Metrica custom gameplay analytics. If `VITE_YANDEX_METRICA_ID` is set during build, the adapter loads the Metrica tag on first event and sends `ym(counterId, "reachGoal", "aa_<event>", payload)` events. Local builds may omit it and retain events only in the debug buffer; `release:validate`, `release:zip` and `agent:release-check` require a numeric ID and verify the built output. The source of truth for event/goal names is `src/services/analytics/eventRegistry.ts`.
- `src/services/platform/platformLifecycle.ts` initializes the SDK lifecycle early, subscribes to `game_api_pause` / `game_api_resume`, sends `ysdk.features.LoadingAPI.ready()` once after the bootstrap gate has hydrated save data, applied the final locale/title, preloaded first-screen campaign previews, waited for fonts and rendered the interactive home screen, and centralizes `ysdk.features.GameplayAPI.start()` / `stop()`.
- `GameScreen` routes active gameplay through that lifecycle controller: the timer, scene input and GameplayAPI are stopped while the game is paused, a rewarded/interstitial/native dialog is active, the level is completed/failed, or the platform sends `game_api_pause`.
- `mockPlatform.canReview()` safely returns `{ value: false, reason: "UNKNOWN" }` when Yandex SDK or `ysdk.feedback` is unavailable.
- `mockPlatform.requestReview()` normalizes the documented `feedbackSent` response and tolerates the older `sentFeedback` example payload.
- `mockPlatform.showRewarded(callbacks)` calls `ysdk.adv.showRewardedVideo()` when available, grants only after `onRewarded` followed by close, and falls back to an immediate local mock reward in Vite/local mode. The optional `onOpen` callback fires when the video is actually on screen and is what stamps the 90-second interstitial suppression clock.
- `mockPlatform.showInterstitial(callbacks)` calls `ysdk.adv.showFullscreenAdv()` when available and falls back to a short local mock open/close cycle in Vite/local mode. `onClose(wasShown)` forwards the platform's `wasShown` flag so a silently declined ad is never counted as shown.
- `src/services/platform/adService.ts` is the only caller of those two gateways. It owns placement-tagged analytics, the rewarded suppression stamp, and the `resolveInterstitialDecision` policy gate from `src/shared/lib/adPolicy.ts`.
- `src/services/platform/payments.ts` wraps `ysdk.getPayments()` behind a typed `PaymentsGateway` (`isAvailable`, `getCatalog`, `purchase`, `getPurchases`, `consumePurchase`) with normalized product/purchase shapes and a `PaymentsError` kind of `cancelled` / `unavailable` / `failed`. UI never touches `ysdk` directly.
- `src/services/platform/purchaseService.ts` owns the purchase pipeline, the idempotency ledger and startup recovery.
- `mockPlatform.getEnvironmentLanguage()` reads `ysdk.environment.i18n.lang` through the platform seam. On first/default saves locale selection follows the Yandex flow: persisted manual choice, then SDK `ru`/`en`, then browser `ru`/`en`, then Russian fallback. A manual Settings language choice is persisted and is not overwritten by later automatic detection.
- SDK initialization is cached via a singleton promise and reuses `window.ysdk` when the host already initialized the SDK.
- Production Vite builds use `@vitejs/plugin-legacy` for `Safari >= 9`, `iOS >= 9` and `Android >= 5`, producing both modern module scripts and legacy `nomodule` scripts/polyfills for the declared Yandex platform range.

Rewarded hint behavior:

- the regular area hint button spends one magnifier while the player has a positive balance;
- when the balance is `0`, the same button shows an ad icon and requests a rewarded Yandex ad;
- the zero-balance CTA is explicit (`Реклама → подсказка` / `Ad → hint`) and opens a confirmation prompt before showing the ad;
- the hint marker is applied only when the rewarded ad returns `rewarded`; closing or failing the ad returns the player to gameplay without a hint or penalty;
- rewarded hint offers remain available after a rewarded hint while there are still unrevealed differences, so the player can watch another ad for another hint.

Forced interstitial cadence:

- queued after every second completed campaign level of the session, replays included (`2, 4, 6, ...`);
- unfinished attempts, explicit exits and timeouts without a later win do not count; Daily has its own rule;
- shown from the post-victory surface before either navigation — the "next level" CTA **or** returning to the campaign map;
- detours into the collection or the campaign report postpone the queued ad instead of cancelling it;
- suppressed with a logged reason for `purchases.noForcedInterstitials`, a rewarded video shown less than 90 seconds ago, a request already in flight, an already-resolved completion, or active gameplay;
- a `wasShown: false`, error, offline or platform-cooldown result never blocks navigation, is not counted as shown, and is retried only at the next natural post-level point;
- the session counter is runtime state and is not persisted in the save schema.

Daily Archive ads:

- completing the Daily no longer grants a magnifier automatically;
- the first win of a calendar date offers "watch a rewarded video for 1 magnifier" or "finish without a reward";
- the magnifier lands only after `onRewarded`, is flushed to the cloud, is stamped into `daily.lastAdRewardDate`, and is never granted twice for the same date;
- taking the reward returns to the Archive Hub without an interstitial (rewarded and interstitial are never chained);
- declining attempts the Daily exit interstitial and returns to the hub regardless of the outcome;
- the streak lands either way, and a rewarded failure keeps both retry and decline available.

Rewarded timeout extension:

- the timeout overlay offers "Ad -> +60 seconds", "Extend for 2 magnifiers", "Start Over" and "Back to archive";
- one rewarded extension per level attempt, tracked by `inProgress.rewardedTimeExtensionUsed`, which is persisted and carried across attempt restarts so a reload cannot farm it;
- the magnifier-funded extension stays available regardless of whether the rewarded one was used;
- both grant 60 seconds and preserve the attempt's found differences, mistakes and elapsed time.

In-app purchases:

- three products must be created by hand in the Yandex Developer Console: `no_forced_ads` (non-consumable), `magnifiers_10` (consumable) and `archive_starter_pack` (non-consumable, one-off 20 magnifiers);
- starting price hypotheses to enter in the console: 99, 29 and 129 YAN. The app never hardcodes prices - `price`, `priceValue`, `priceCurrencyCode` and the currency image come from `payments.getCatalog()`;
- consumable flow: purchase, validate product id and token, check the ledger, grant into the save, flush to the cloud, and only then `consumePurchase(token)`. The token is written into `purchases.processedPurchaseTokens` in the *same* save write as the reward;
- one-off payloads are additionally guarded by `purchases.grantedOneTimeProductIds`, so `archive_starter_pack` grants its 20 magnifiers exactly once while still restoring `noForcedInterstitials` on every recovery;
- startup runs `recoverPurchases()` after hydration: it restores non-consumable entitlements, finishes unprocessed consumables idempotently, and never blocks the boot when payments are unavailable or the player is not authorized.

Review pre-prompt cadence:

- first eligible after the fourth newly completed campaign level;
- checked from the post-victory result surface instead of the campaign map;
- soft dismissal reschedules the next prompt no earlier than five more completed levels, with the existing minimum of level 8 for old saves;
- the pre-prompt uses the same Yandex feedback seam and native request guard as before.

Cloud save is wired through `src/services/storage/localSaveService.ts`:

- `loadPersistentSave()` reads the local mirror and Yandex Player Data in parallel, validates/migrates both with `migrateSaveData()`, and chooses the newest valid save by `updatedAt`.
- The cloud read path uses `ysdk.getPlayer().getData()` with a 4-second timeout.
- `savePersistentSave()` writes the full save to the local mirror first, then best-effort syncs `ysdk.getPlayer().setData(save, flush)`.
- The local mirror prefers `ysdk.getStorage()` and falls back to `window.localStorage`.
- Cloud failures surface to the app as `saveStatus: "local-only"` and do not block gameplay.
- In-progress level state uses save schema v3 with attempt ID/number, terminal marker, monotonic `elapsedActiveSeconds`, separate `timeGrantedSeconds`, hints and aggregated mistakes. Hidden tabs close the active attempt as `background_abandon`; returning creates a new resume segment while preserving gameplay progress.

Local development remains safe:

- the app does not crash without Yandex SDK;
- direct `pnpm` may be unavailable in some managed shells; the equivalent local binaries (`./node_modules/.bin/eslint`, `./node_modules/.bin/tsc`, `./node_modules/.bin/vite`, `./node_modules/.bin/tsx`) can validate the same code without reinstalling dependencies;
- `window.__artifactDev?.setReviewMock("sent" | "closed" | "unavailable" | "error")` overrides the review gateway in Vite dev mode;
- `window.__artifactDev?.triggerReviewPromptDemo()` seeds the first three campaign completions and starts level 4 so completing that level opens the post-victory review pre-prompt.
- `createMockPaymentsGateway()` from `src/services/platform/mockPayments.ts` provides an in-memory catalog, purchase, cancel, error, no-payments, recovery and consume behavior. It is installed automatically when `VITE_PLATFORM_MODE=mock`, and tests install it with `setPaymentsGatewayOverride()` in the same style as the ad gateway overrides. Production builds never reach that branch and never render dev-only shop controls;
- `window.__artifactAnalyticsEvents` stores the last 100 product analytics events locally for QA. Use `VITE_ANALYTICS_DEBUG=true pnpm dev` to print them while testing.
