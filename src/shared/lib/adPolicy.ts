/**
 * Single source of truth for when forced interstitials may run.
 *
 * The campaign cadence counts *completed* campaign levels inside the current
 * game session (replays included), so it deliberately does not derive from
 * `saveData.completedLevels.length`, which cannot see a replay.
 */

export const INTERSTITIAL_CAMPAIGN_COMPLETION_INTERVAL = 2;

/** A rewarded view suppresses forced interstitials for this long. */
export const REWARDED_INTERSTITIAL_SUPPRESSION_MS = 90_000;

/** Rewarded time extension granted per view, in seconds. */
export const REWARDED_TIME_EXTENSION_SECONDS = 60;

/** Magnifier-funded time extension. */
export const MAGNIFIER_TIME_EXTENSION_SECONDS = 60;
export const MAGNIFIER_TIME_EXTENSION_COST = 2;

/** Area hint cost. */
export const AREA_HINT_MAGNIFIER_COST = 1;

export const AD_PLACEMENTS = [
  "campaign_every_two_levels",
  "daily_reward",
  "daily_exit_interstitial",
  "timeout_extension",
  "area_hint_rewarded",
] as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export const INTERSTITIAL_SUPPRESSION_REASONS = [
  "no_forced_ads",
  "recent_rewarded",
  "in_flight",
  "already_resolved",
  "not_eligible",
] as const;

export type InterstitialSuppressionReason =
  (typeof INTERSTITIAL_SUPPRESSION_REASONS)[number];

export type InterstitialDecision =
  | { allowed: true }
  | { allowed: false; reason: InterstitialSuppressionReason };

/**
 * Campaign ads are gated by the every-two-completions cadence ledger. Daily
 * exit ads have no cadence and pass `cadence: null`, which skips the ordinal
 * bookkeeping while keeping every other suppression rule identical.
 */
export type InterstitialCadence = {
  /** Completion ordinal that queued this ad, or null when nothing is queued. */
  pendingToken: number | null;
  /** Highest completion ordinal already resolved (shown, failed or skipped). */
  lastResolvedToken: number;
};

export type InterstitialDecisionInput = {
  noForcedInterstitials: boolean;
  cadence: InterstitialCadence | null;
  nativeRequestInFlight: boolean;
  /** Any ad currently on screen, or a navigation action already running. */
  adInFlight: boolean;
  lastRewardedShownAt: number | null;
  now: number;
  /** Forced ads never interrupt an active level. */
  inGameplay: boolean;
};

/**
 * Takes completions since the last *resolved* ad, not the absolute count.
 *
 * On the straight path the two are identical (ad after completions 2, 4, 6...).
 * They diverge only when an ad was deferred by a detour into the collection or
 * the campaign report: the deferred ad fires at the next exit, and the counter
 * resets there, so two ads can never land one completion apart.
 */
export function isCampaignInterstitialCompletion(completionsSinceLastAd: number) {
  return (
    completionsSinceLastAd > 0 &&
    completionsSinceLastAd % INTERSTITIAL_CAMPAIGN_COMPLETION_INTERVAL === 0
  );
}

export function isRewardedSuppressionActive(
  lastRewardedShownAt: number | null,
  now: number,
) {
  if (lastRewardedShownAt === null) return false;
  return now - lastRewardedShownAt < REWARDED_INTERSTITIAL_SUPPRESSION_MS;
}

/**
 * Shared gate for both the campaign cadence and the Daily exit interstitial.
 * Daily callers pass a synthetic pending token because they have no cadence.
 */
export function resolveInterstitialDecision(
  input: InterstitialDecisionInput,
): InterstitialDecision {
  if (input.noForcedInterstitials) {
    return { allowed: false, reason: "no_forced_ads" };
  }
  if (input.inGameplay) {
    return { allowed: false, reason: "not_eligible" };
  }
  if (input.cadence) {
    if (input.cadence.pendingToken === null) {
      return { allowed: false, reason: "not_eligible" };
    }
    if (input.cadence.pendingToken <= input.cadence.lastResolvedToken) {
      return { allowed: false, reason: "already_resolved" };
    }
  }
  if (input.nativeRequestInFlight || input.adInFlight) {
    return { allowed: false, reason: "in_flight" };
  }
  if (isRewardedSuppressionActive(input.lastRewardedShownAt, input.now)) {
    return { allowed: false, reason: "recent_rewarded" };
  }
  return { allowed: true };
}
