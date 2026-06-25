import type { SaveData } from "@/entities/save/schema";
import { levels } from "@/content/levels";

export function isLevelUnlocked(levelId: string, save: SaveData): boolean {
  const level = levels.find((candidate) => candidate.id === levelId);
  if (!level) return false;
  if (level.order === 1) return true;
  const previous = levels.find((candidate) => candidate.order === level.order - 1);
  return previous ? save.completedLevels.includes(previous.id) : false;
}

export function unlockedArtifactsForCompleted(completedLevelIds: string[]) {
  const completedOrders = new Set(
    levels.filter((level) => completedLevelIds.includes(level.id)).map((level) => level.order)
  );
  return [
    { level: 3, id: "brass-compass" },
    { level: 6, id: "field-radio" },
    { level: 9, id: "blue-flower" },
    { level: 12, id: "torn-map" }
  ].filter((artifact) => completedOrders.has(artifact.level));
}
