import { describe, expect, it } from "vitest";
import {
  createDefaultSave,
  INITIAL_MAGNIFIERS,
  migrateSaveData,
} from "@/entities/save/schema";

describe("migrateSaveData", () => {
  it("defaults the comparator to flip and upgrades an unset current save", () => {
    expect(createDefaultSave().settings.comparatorScheme).toBe("flip");

    const save = createDefaultSave();
    save.settings.comparatorScheme = null;

    expect(migrateSaveData(save).settings.comparatorScheme).toBe("flip");
  });

  it("keeps the side-by-side mobile comparator choice", () => {
    const save = createDefaultSave();
    save.settings.comparatorScheme = "side-by-side";

    expect(migrateSaveData(save).settings.comparatorScheme).toBe(
      "side-by-side",
    );
  });

  it("migrates v1 elapsedSeconds into the v3 attempt model", () => {
    const save = migrateSaveData({
      version: 1,
      updatedAt: 123,
      completedLevels: ["nr-01-scene01"],
      bestResults: {},
      inProgress: {
        levelId: "nr-02-scene02",
        foundDifferenceIds: ["rolled-bedding-count-2"],
        elapsedSeconds: 42,
        mistakes: 1,
      },
      magnifiers: 2,
      artifacts: {},
      daily: { lastClaimDate: null, streak: 0 },
      settings: { locale: "en", vibration: true, reducedMotion: false },
      purchases: { noForcedInterstitials: false, productIds: [] },
    });

    expect(save.version).toBe(3);
    expect(save.inProgress?.elapsedActiveSeconds).toBe(42);
    expect(save.inProgress).toMatchObject({
      attemptNumber: 1,
      mode: "campaign",
      timeGrantedSeconds: 0,
      hintsUsed: 0,
    });
    expect(save.settings.locale).toBe("en");
    expect(save.settings.localeSource).toBe("manual");
  });

  it("falls back safely for corrupt saves", () => {
    const save = migrateSaveData({ version: 2, magnifiers: -100 });

    expect(save.version).toBe(3);
    expect(save.magnifiers).toBe(INITIAL_MAGNIFIERS);
    expect(save.inProgress).toBeNull();
  });

  it("keeps large loaded v2 magnifier balances", () => {
    const save = migrateSaveData({
      version: 2,
      updatedAt: 123,
      completedLevels: [],
      bestResults: {},
      inProgress: null,
      magnifiers: 99,
      artifacts: {},
      viewedCampaignReportIds: [],
      daily: { lastClaimDate: null, streak: 0 },
      settings: {
        locale: "ru",
        localeSource: "auto",
        vibration: true,
        reducedMotion: false,
      },
      reviewPrompt: {
        schemaVersion: 1,
        prePromptShownCount: 0,
        nextEligibleCompletedLevel: 4,
        nativeReviewResolved: false,
      },
      purchases: { noForcedInterstitials: false, productIds: [] },
    });

    expect(save.magnifiers).toBe(99);
  });

  it("adds viewed campaign report ids to older v2 saves", () => {
    const save = migrateSaveData({
      version: 2,
      updatedAt: 123,
      completedLevels: [],
      bestResults: {},
      inProgress: null,
      magnifiers: 3,
      artifacts: {},
      daily: { lastClaimDate: null, streak: 0 },
      settings: {
        locale: "ru",
        localeSource: "auto",
        vibration: true,
        reducedMotion: false,
      },
      reviewPrompt: {
        schemaVersion: 1,
        prePromptShownCount: 0,
        nextEligibleCompletedLevel: 4,
        nativeReviewResolved: false,
      },
      purchases: { noForcedInterstitials: false, productIds: [] },
    });

    expect(save.viewedCampaignReportIds).toEqual([]);
  });
});
