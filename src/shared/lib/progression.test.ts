import { describe, expect, it } from "vitest";
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
});
