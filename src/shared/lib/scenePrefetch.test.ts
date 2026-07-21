import { describe, expect, it } from "vitest";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { getLikelyNextLevels, getUnlockedChapters } from "./scenePrefetch";

function saveWith(overrides: Partial<ReturnType<typeof createDefaultSave>>) {
  return { ...createDefaultSave(), ...overrides };
}

const northernLevels = getChapterLevels("northern-route");
const sandLevels = getChapterLevels("sand-meridian");

describe("scenePrefetch", () => {
  it("only unlocks the first chapter on a fresh save", () => {
    const save = createDefaultSave();
    expect(getUnlockedChapters(save).map((chapter) => chapter.id)).toEqual([
      "northern-route",
    ]);
    expect(getLikelyNextLevels(save).map((level) => level.id)).toEqual([
      northernLevels[0].id,
    ]);
  });

  it("unlocks the next chapter when the previous one is fully completed", () => {
    const save = saveWith({
      completedLevels: northernLevels.map((level) => level.id),
    });
    expect(getUnlockedChapters(save).map((chapter) => chapter.id)).toEqual([
      "northern-route",
      "sand-meridian",
    ]);
    expect(getLikelyNextLevels(save).map((level) => level.id)).toEqual([
      sandLevels[0].id,
    ]);
  });

  it("targets the first uncompleted level of each unlocked chapter", () => {
    const save = saveWith({
      completedLevels: [northernLevels[0].id, northernLevels[1].id],
    });
    expect(getLikelyNextLevels(save).map((level) => level.id)).toEqual([
      northernLevels[2].id,
    ]);
  });

  it("puts the in-progress level and its chapter first", () => {
    const save = saveWith({
      completedLevels: northernLevels.map((level) => level.id),
      inProgress: {
        levelId: sandLevels[2].id,
        mode: "campaign",
        attemptId: "test-attempt",
        attemptNumber: 1,
        attemptStartedAt: 0,
        attemptStartedActiveSeconds: 0,
        attemptStartedFoundDifferences: 0,
        attemptStartedMistakes: 0,
        attemptStartedHints: 0,
        attemptStartedRewardedHints: 0,
        attemptStartedTimeExtensions: 0,
        terminalAt: null,
        onboarding: false,
        foundDifferenceIds: [],
        elapsedActiveSeconds: 10,
        timeGrantedSeconds: 0,
        mistakes: 0,
        hintsUsed: 0,
        hintedDifferenceIds: [],
        rewardedHintsUsed: 0,
        timeExtensionsUsed: 0,
      },
    });
    expect(getUnlockedChapters(save)[0].id).toBe("sand-meridian");
    const likely = getLikelyNextLevels(save).map((level) => level.id);
    expect(likely[0]).toBe(sandLevels[2].id);
    expect(likely).toContain(sandLevels[0].id);
  });
});
