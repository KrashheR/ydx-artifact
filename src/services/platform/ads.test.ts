import { describe, expect, it } from "vitest";
import { areAdsEnabled } from "@/services/platform/ads";

describe("CrazyGames Basic Launch ads", () => {
  it("disables all ad placements for adsDisabledBasicLaunch", () => {
    expect(areAdsEnabled("crazygames", "basic")).toBe(false);
    expect(areAdsEnabled("crazygames", undefined)).toBe(false);
  });

  it("keeps ad placements available only in the CrazyGames Full Launch profile", () => {
    expect(areAdsEnabled("crazygames", "full")).toBe(true);
    expect(areAdsEnabled("yandex", undefined)).toBe(true);
  });
});
