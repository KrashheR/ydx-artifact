import type { SaveData } from "@/entities/save/schema";
import type { LevelDefinition } from "@/entities/level/schema";
import { chapterList, getLevelById, type ChapterDefinition } from "@/content/chapters";
import { getCampaignCardPreviewAsset } from "@/content/sceneAssets";
import { preloadImage, preloadImages } from "./imagePreload";

/**
 * Chapters the player can enter, most likely first: chapters unlock in
 * `chapterList` order once the previous chapter is fully completed (mirroring
 * the home screen campaign gating), and the chapter of the in-progress level
 * is moved to the front.
 */
export function getUnlockedChapters(save: SaveData): ChapterDefinition[] {
  const unlocked: ChapterDefinition[] = [];

  let previousChapterComplete = true;
  for (const chapter of chapterList) {
    if (!previousChapterComplete) break;
    unlocked.push(chapter);
    previousChapterComplete = chapter.levels.every((level) => save.completedLevels.includes(level.id));
  }

  const inProgressChapterId = save.inProgress ? getLevelById(save.inProgress.levelId)?.chapterId : undefined;
  return unlocked.sort((a, b) => Number(b.id === inProgressChapterId) - Number(a.id === inProgressChapterId));
}

/**
 * Levels the player is most likely to open next, most likely first: the
 * in-progress level (if any), then the first uncompleted level of each
 * unlocked chapter.
 */
export function getLikelyNextLevels(save: SaveData): LevelDefinition[] {
  const result: LevelDefinition[] = [];

  const inProgressLevel = save.inProgress ? getLevelById(save.inProgress.levelId) : undefined;
  if (inProgressLevel) result.push(inProgressLevel);

  for (const chapter of getUnlockedChapters(save)) {
    const next = chapter.levels.find((level) => !save.completedLevels.includes(level.id));
    if (next && !result.some((level) => level.id === next.id)) {
      result.push(next);
    }
  }

  return result;
}

/**
 * Background warmup for what the player will see after the home screen: map
 * backgrounds and level card previews of unlocked chapters, then the scene
 * pairs of the likely next levels. Images load one at a time so the prefetch
 * never competes with itself for bandwidth, and everything is best-effort —
 * the browser cache is the only consumer. Skipped when the browser reports a
 * data-saver preference.
 */
export async function prefetchHomeIdleAssets(save: SaveData) {
  const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;

  for (const chapter of getUnlockedChapters(save)) {
    await preloadImage(chapter.backgroundAsset);
    for (const level of chapter.levels) {
      await preloadImage(getCampaignCardPreviewAsset(chapter.id, level.order));
    }
  }

  for (const level of getLikelyNextLevels(save)) {
    await preloadImages([level.imageA, level.imageB]);
  }
}
