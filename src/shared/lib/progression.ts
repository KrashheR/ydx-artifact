import type { SaveData } from "@/entities/save/schema";
import { chapterList, getChapterLevels, getLevelById } from "@/content/chapters";

type BestResult = SaveData["bestResults"][string];

export type StartupDestination =
  | { kind: "game"; levelId: string; showOnboarding: boolean }
  | { kind: "collection" };

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

export function getFirstCampaignLevelId() {
  return getChapterLevels("northern-route")[0]?.id ?? null;
}

export function getNextCampaignLevelId(save: SaveData) {
  for (const chapter of chapterList) {
    const nextLevel = chapter.levels.find((level) => !save.completedLevels.includes(level.id));
    if (nextLevel) return nextLevel.id;
  }

  return null;
}

export function resolveStartupDestination(save: SaveData): StartupDestination {
  const inProgressLevel = save.inProgress ? getLevelById(save.inProgress.levelId) : null;
  if (inProgressLevel) {
    return {
      kind: "game",
      levelId: inProgressLevel.id,
      showOnboarding: false
    };
  }

  const nextLevelId = getNextCampaignLevelId(save);
  if (!nextLevelId) return { kind: "collection" };

  return {
    kind: "game",
    levelId: nextLevelId,
    showOnboarding: nextLevelId === getFirstCampaignLevelId() && save.completedLevels.length === 0
  };
}

export function starsForAccuracy(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.85) return 3;
  if (accuracy >= 0.6) return 2;
  return 1;
}

export function isBetterLevelResult(candidate: BestResult, current?: BestResult): boolean {
  if (!current) return true;

  const candidateStars = starsForAccuracy(candidate.accuracy);
  const currentStars = starsForAccuracy(current.accuracy);

  if (candidateStars !== currentStars) return candidateStars > currentStars;
  if (candidate.accuracy !== current.accuracy) return candidate.accuracy > current.accuracy;
  if (candidate.durationSeconds !== current.durationSeconds) {
    return candidate.durationSeconds < current.durationSeconds;
  }

  return candidate.mistakes < current.mistakes;
}
