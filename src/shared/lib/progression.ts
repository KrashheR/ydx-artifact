import type { SaveData } from "@/entities/save/schema";
import { getChapterLevels, getLevelById } from "@/content/chapters";

export function isLevelUnlocked(levelId: string, save: SaveData): boolean {
  const level = getLevelById(levelId);
  if (!level) return false;
  const chapterLevels = getChapterLevels(level.chapterId);
  if (level.order === 1) return true;
  const previous = chapterLevels.find((candidate) => candidate.order === level.order - 1);
  return previous ? save.completedLevels.includes(previous.id) : false;
}

export function unlockedArtifactsForCompleted(completedLevelIds: string[]) {
  const completedOrders = new Set(
    getChapterLevels("northern-route")
      .filter((level) => completedLevelIds.includes(level.id))
      .map((level) => level.order)
  );
  return [
    { level: 3, id: "brass-compass" },
    { level: 6, id: "field-radio" },
    { level: 9, id: "blue-flower" },
    { level: 12, id: "torn-map" }
  ].filter((artifact) => completedOrders.has(artifact.level));
}
