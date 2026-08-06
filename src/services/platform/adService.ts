import {
  trackAnalyticsEvent,
  type AnalyticsPayload,
} from "@/services/analytics/analytics";
import {
  mockPlatform,
  type InterstitialResult,
  type RewardedResult,
} from "@/services/platform/mockPlatform";
import {
  resolveInterstitialDecision,
  type AdPlacement,
  type InterstitialSuppressionReason,
} from "@/shared/lib/adPolicy";
import { useGameStore } from "@/shared/store/gameStore";

/**
 * All ad placements funnel through here so that:
 *  - every placement emits the same offer/requested/opened/rewarded/closed/failed
 *    event family with a `placement` discriminator;
 *  - a rewarded view that actually opened stamps the 90s interstitial
 *    suppression clock exactly once, wherever it was triggered from.
 */

export function trackRewardedOffer(
  placement: AdPlacement,
  payload: AnalyticsPayload = {},
) {
  trackAnalyticsEvent("rewarded_offer_opened", { ...payload, placement });
}

export async function runRewardedAd(
  placement: AdPlacement,
  payload: AnalyticsPayload = {},
): Promise<RewardedResult> {
  trackAnalyticsEvent("rewarded_requested", { ...payload, placement });

  const result = await mockPlatform.showRewarded({
    onOpen: () => {
      useGameStore.getState().markRewardedShown();
      trackAnalyticsEvent("rewarded_opened", {
        ...payload,
        placement,
        wasShown: true,
      });
    },
  });

  if (result === "rewarded") {
    // Defensive: a gateway that never fired onOpen still counts as shown.
    useGameStore.getState().markRewardedShown();
    trackAnalyticsEvent("rewarded_rewarded", {
      ...payload,
      placement,
      wasShown: true,
    });
  } else if (result === "closed") {
    trackAnalyticsEvent("rewarded_closed", {
      ...payload,
      placement,
      wasShown: true,
    });
  } else {
    trackAnalyticsEvent("rewarded_failed", {
      ...payload,
      placement,
      wasShown: false,
    });
  }

  return result;
}

export type InterstitialRunInput = {
  placement: AdPlacement;
  /**
   * Cadence ordinal for campaign ads. Daily passes null: it has no cadence and
   * must not touch the campaign ledger.
   */
  token: number | null;
  inGameplay?: boolean;
  adInFlight?: boolean;
  payload?: AnalyticsPayload;
  onOpen?: () => void;
  onClose?: () => void;
};

export type InterstitialRunResult =
  | { shown: boolean; suppressed: false; result: InterstitialResult }
  | { shown: false; suppressed: true; reason: InterstitialSuppressionReason };

/**
 * Runs a forced interstitial if policy allows. Never throws and never blocks
 * navigation: callers navigate regardless of the outcome.
 */
export async function runInterstitial(
  input: InterstitialRunInput,
): Promise<InterstitialRunResult> {
  const store = useGameStore.getState();
  const payload: AnalyticsPayload = {
    ...input.payload,
    placement: input.placement,
    token: input.token,
  };

  const token = input.token;
  const decision = resolveInterstitialDecision({
    noForcedInterstitials: store.saveData.purchases.noForcedInterstitials,
    cadence:
      token === null
        ? null
        : {
            pendingToken: token,
            lastResolvedToken: store.interstitialRuntime.lastResolvedToken,
          },
    nativeRequestInFlight: store.interstitialRuntime.nativeRequestInFlight,
    adInFlight: input.adInFlight ?? false,
    lastRewardedShownAt: store.adRuntime.lastRewardedShownAt,
    now: Date.now(),
    inGameplay: input.inGameplay ?? false,
  });

  if (!decision.allowed) {
    trackAnalyticsEvent("interstitial_suppressed", {
      ...payload,
      reason: decision.reason,
      wasShown: false,
    });
    // A suppressed ad still resolves its token so the same completion is never
    // retried in a loop; the next cadence point produces a fresh token.
    if (token !== null && decision.reason !== "in_flight") {
      store.setInterstitialResolved(token);
    }
    return { shown: false, suppressed: true, reason: decision.reason };
  }

  trackAnalyticsEvent("interstitial_eligible", payload);
  trackAnalyticsEvent("interstitial_request", payload);
  store.setInterstitialNativeRequestInFlight(true);

  let wasShown = false;

  const result = await mockPlatform.showInterstitial({
    onOpen: () => {
      wasShown = true;
      input.onOpen?.();
      trackAnalyticsEvent("interstitial_open", { ...payload, wasShown: true });
    },
    onClose: (closedWasShown) => {
      wasShown = wasShown || closedWasShown;
      input.onClose?.();
      trackAnalyticsEvent("interstitial_close", {
        ...payload,
        wasShown: closedWasShown,
      });
    },
    onError: () => {
      input.onClose?.();
      trackAnalyticsEvent("interstitial_error", { ...payload, wasShown: false });
    },
  });

  const resolvedStore = useGameStore.getState();
  if (token === null) {
    resolvedStore.setInterstitialNativeRequestInFlight(false);
  } else {
    resolvedStore.setInterstitialResolved(token);
  }

  return { shown: result === "closed" && wasShown, suppressed: false, result };
}
