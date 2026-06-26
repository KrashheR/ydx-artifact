import { levels as northernRouteLevels } from "./levels";
import { sandMeridianLevels } from "./sandMeridianLevels";
import type { LevelDefinition } from "../entities/level/schema";
import sandMeridianMapLayout from "../../docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json";

export type ChapterId = LevelDefinition["chapterId"];

export type MapPointDefinition = {
  id: string;
  order: number;
  x: number;
  y: number;
  promptFile?: string;
  landmark?: string;
  storyRole?: string;
};

export type ChapterDefinition = {
  id: ChapterId;
  campaignId: "white" | "sand";
  titleKey: string;
  backgroundAsset: string;
  aspectRatio: number;
  levels: LevelDefinition[];
  mapPoints: MapPointDefinition[];
};

const northernRouteMapPoints: MapPointDefinition[] = [
  { order: 1, id: northernRouteLevels[0].id, x: 0.272, y: 0.836 },
  { order: 2, id: northernRouteLevels[1].id, x: 0.315, y: 0.661 },
  { order: 3, id: northernRouteLevels[2].id, x: 0.431, y: 0.567 },
  { order: 4, id: northernRouteLevels[3].id, x: 0.314, y: 0.458 },
  { order: 5, id: northernRouteLevels[4].id, x: 0.352, y: 0.309 },
  { order: 6, id: northernRouteLevels[5].id, x: 0.573, y: 0.293 },
  { order: 7, id: northernRouteLevels[6].id, x: 0.66, y: 0.167 },
  { order: 8, id: northernRouteLevels[7].id, x: 0.795, y: 0.241 },
  { order: 9, id: northernRouteLevels[8].id, x: 0.886, y: 0.172 },
  { order: 10, id: northernRouteLevels[9].id, x: 0.847, y: 0.418 },
  { order: 11, id: northernRouteLevels[10].id, x: 0.768, y: 0.587 },
  { order: 12, id: northernRouteLevels[11].id, x: 0.598, y: 0.734 },
  { order: 13, id: northernRouteLevels[12].id, x: 0.436, y: 0.868 }
];

const sandMeridianMapPoints: MapPointDefinition[] = sandMeridianMapLayout.levels.map((level) => ({
  id: level.id,
  order: level.order,
  x: level.x,
  y: level.y,
  promptFile: level.promptFile,
  landmark: level.landmark,
  storyRole: level.storyRole
}));

export const chapters: Record<ChapterId, ChapterDefinition> = {
  "northern-route": {
    id: "northern-route",
    campaignId: "white",
    titleKey: "campaigns.white.title",
    backgroundAsset: "/assets/scenes/northern-route/background.png",
    aspectRatio: 16 / 10,
    levels: northernRouteLevels,
    mapPoints: northernRouteMapPoints
  },
  "sand-meridian": {
    id: "sand-meridian",
    campaignId: "sand",
    titleKey: "campaigns.sand.title",
    backgroundAsset: "/assets/scenes/sand-meredian/background.png",
    aspectRatio: 16 / 10,
    levels: sandMeridianLevels,
    mapPoints: sandMeridianMapPoints
  }
};

export const chapterList = Object.values(chapters);
export const allLevels = chapterList.flatMap((chapter) => chapter.levels);

export function getChapter(chapterId: ChapterId) {
  return chapters[chapterId];
}

export function getChapterLevels(chapterId: ChapterId) {
  return chapters[chapterId].levels;
}

export function getLevelById(levelId: string) {
  return allLevels.find((level) => level.id === levelId);
}
