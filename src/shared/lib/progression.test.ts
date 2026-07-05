import { describe, expect, it } from "vitest";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { levels } from "@/content/levels";
import {
  getNextCampaignLevelId,
  isLevelUnlocked,
  resolveStartupDestination
} from "@/shared/lib/progression";

describe("progression", () => {
  it("unlocks only first level for a new save", () => {
    const save = createDefaultSave();
    expect(isLevelUnlocked(levels[0].id, save)).toBe(true);
    expect(isLevelUnlocked(levels[1].id, save)).toBe(false);
  });

  it("unlocks next level after completion", () => {
    const save = { ...createDefaultSave(), completedLevels: [levels[0].id] };
    expect(isLevelUnlocked(levels[1].id, save)).toBe(true);
  });

  it("tracks unlock progression independently for each chapter", () => {
    const sandLevels = getChapterLevels("sand-meridian");
    const emeraldLevels = getChapterLevels("emerald-meridian");
    const save = { ...createDefaultSave(), completedLevels: [sandLevels[0].id] };
    expect(isLevelUnlocked(sandLevels[1].id, save)).toBe(true);
    expect(isLevelUnlocked(levels[1].id, save)).toBe(false);
    expect(isLevelUnlocked(emeraldLevels[1].id, save)).toBe(false);
  });

  it("opens a new player directly on the first campaign level with onboarding", () => {
    expect(resolveStartupDestination(createDefaultSave())).toEqual({
      kind: "game",
      levelId: levels[0].id,
      showOnboarding: true
    });
  });

  it("resumes an in-progress level before choosing the next campaign level", () => {
    const save = {
      ...createDefaultSave(),
      completedLevels: [levels[0].id],
      inProgress: {
        levelId: levels[0].id,
        foundDifferenceIds: ["compass-removed-1"],
        elapsedActiveSeconds: 12,
        mistakes: 1
      }
    };

    expect(resolveStartupDestination(save)).toEqual({
      kind: "game",
      levelId: levels[0].id,
      showOnboarding: false
    });
  });

  it("opens the next uncompleted campaign level when no level is in progress", () => {
    const save = { ...createDefaultSave(), completedLevels: [levels[0].id] };

    expect(getNextCampaignLevelId(save)).toBe(levels[1].id);
    expect(resolveStartupDestination(save)).toEqual({
      kind: "game",
      levelId: levels[1].id,
      showOnboarding: false
    });
  });

  it("opens the expedition case after all campaign levels are completed", () => {
    const allCampaignLevelIds = [
      ...getChapterLevels("northern-route"),
      ...getChapterLevels("sand-meridian"),
      ...getChapterLevels("emerald-meridian")
    ].map((level) => level.id);
    const save = { ...createDefaultSave(), completedLevels: allCampaignLevelIds };

    expect(resolveStartupDestination(save)).toEqual({ kind: "collection" });
  });
});
