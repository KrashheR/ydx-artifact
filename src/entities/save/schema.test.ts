import { describe, expect, it } from "vitest";
import { migrateSaveData } from "@/entities/save/schema";

describe("migrateSaveData", () => {
  it("migrates v1 elapsedSeconds to v2 elapsedActiveSeconds", () => {
    const save = migrateSaveData({
      version: 1,
      updatedAt: 123,
      completedLevels: ["nr-01-scene01"],
      bestResults: {},
      inProgress: {
        levelId: "nr-02-scene02",
        foundDifferenceIds: ["rolled-bedding-count-2"],
        elapsedSeconds: 42,
        mistakes: 1
      },
      magnifiers: 2,
      artifacts: {},
      daily: { lastClaimDate: null, streak: 0 },
      settings: { locale: "en", vibration: true, reducedMotion: false },
      purchases: { noForcedInterstitials: false, productIds: [] }
    });

    expect(save.version).toBe(2);
    expect(save.inProgress?.elapsedActiveSeconds).toBe(42);
    expect(save.settings.locale).toBe("en");
    expect(save.settings.localeSource).toBe("manual");
  });

  it("falls back safely for corrupt saves", () => {
    const save = migrateSaveData({ version: 2, magnifiers: -100 });

    expect(save.version).toBe(2);
    expect(save.magnifiers).toBe(3);
    expect(save.inProgress).toBeNull();
  });
});
