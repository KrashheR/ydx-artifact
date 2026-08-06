import { describe, expect, it } from "vitest";
import {
  isCampaignInterstitialCompletion,
  resolveInterstitialDecision,
  REWARDED_INTERSTITIAL_SUPPRESSION_MS,
  REWARDED_TIME_EXTENSION_SECONDS,
  MAGNIFIER_TIME_EXTENSION_SECONDS,
  MAGNIFIER_TIME_EXTENSION_COST,
} from "@/shared/lib/adPolicy";

const NOW = 1_000_000;

function decide(overrides: Partial<Parameters<typeof resolveInterstitialDecision>[0]> = {}) {
  return resolveInterstitialDecision({
    noForcedInterstitials: false,
    cadence: { pendingToken: 2, lastResolvedToken: 0 },
    nativeRequestInFlight: false,
    adInFlight: false,
    lastRewardedShownAt: null,
    now: NOW,
    inGameplay: false,
    ...overrides,
  });
}

describe("interstitial cadence", () => {
  it("fires on every second completion and never on odd ones", () => {
    expect(isCampaignInterstitialCompletion(1)).toBe(false);
    expect(isCampaignInterstitialCompletion(2)).toBe(true);
    expect(isCampaignInterstitialCompletion(3)).toBe(false);
    expect(isCampaignInterstitialCompletion(4)).toBe(true);
    expect(isCampaignInterstitialCompletion(0)).toBe(false);
  });
});

describe("resolveInterstitialDecision", () => {
  it("allows a queued campaign ad at a post-victory navigation point", () => {
    expect(decide()).toEqual({ allowed: true });
  });

  it("blocks forced ads for the no_forced_ads entitlement", () => {
    expect(decide({ noForcedInterstitials: true })).toEqual({
      allowed: false,
      reason: "no_forced_ads",
    });
  });

  it("blocks forced ads while a rewarded video is still within the window", () => {
    expect(
      decide({ lastRewardedShownAt: NOW - (REWARDED_INTERSTITIAL_SUPPRESSION_MS - 1) }),
    ).toEqual({ allowed: false, reason: "recent_rewarded" });
  });

  it("allows a forced ad once the rewarded window elapsed", () => {
    expect(
      decide({ lastRewardedShownAt: NOW - REWARDED_INTERSTITIAL_SUPPRESSION_MS }),
    ).toEqual({ allowed: true });
  });

  it("blocks a duplicate request for the same completion", () => {
    expect(decide({ cadence: { pendingToken: 2, lastResolvedToken: 2 } })).toEqual({
      allowed: false,
      reason: "already_resolved",
    });
  });

  it("blocks concurrent requests", () => {
    expect(decide({ nativeRequestInFlight: true })).toEqual({
      allowed: false,
      reason: "in_flight",
    });
    expect(decide({ adInFlight: true })).toEqual({
      allowed: false,
      reason: "in_flight",
    });
  });

  it("never interrupts active gameplay", () => {
    expect(decide({ inGameplay: true })).toEqual({
      allowed: false,
      reason: "not_eligible",
    });
  });

  it("treats a missing pending token as not eligible", () => {
    expect(decide({ cadence: { pendingToken: null, lastResolvedToken: 0 } })).toEqual({
      allowed: false,
      reason: "not_eligible",
    });
  });

  it("lets cadence-free daily ads through without a token", () => {
    expect(decide({ cadence: null })).toEqual({ allowed: true });
    expect(decide({ cadence: null, noForcedInterstitials: true })).toEqual({
      allowed: false,
      reason: "no_forced_ads",
    });
  });
});

describe("time extension values", () => {
  it("grants sixty seconds from both sources", () => {
    expect(REWARDED_TIME_EXTENSION_SECONDS).toBe(60);
    expect(MAGNIFIER_TIME_EXTENSION_SECONDS).toBe(60);
    expect(MAGNIFIER_TIME_EXTENSION_COST).toBe(2);
  });
});
