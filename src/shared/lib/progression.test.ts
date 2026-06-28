import { describe, expect, it } from "vitest";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { levels } from "@/content/levels";
import { isLevelUnlocked } from "@/shared/lib/progression";

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
});
