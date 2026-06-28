import { levels as northernRouteLevels } from "./levels";
import { sandMeridianLevels } from "./sandMeridianLevels";
import { emeraldMeridianLevels } from "./emeraldMeridianLevels";
import type { LevelDefinition } from "../entities/level/schema";
import sandMeridianMapLayout from "../../docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json";
import { campaignManifest } from "./campaignManifest";

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
  campaignId: "white" | "sand" | "emerald";
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

const emeraldMeridianMapPoints: MapPointDefinition[] = [
  { id: emeraldMeridianLevels[0].id, order: 1, x: 0.12, y: 0.78, promptFile: "01_river_landing.md", landmark: "wooden river pier", storyRole: "campaign-entry" },
  { id: emeraldMeridianLevels[1].id, order: 2, x: 0.21, y: 0.69, promptFile: "02_abandoned_radio_station.md", landmark: "radio hut", storyRole: "communications-trace" },
  { id: emeraldMeridianLevels[2].id, order: 3, x: 0.31, y: 0.59, promptFile: "03_botanical_camp.md", landmark: "central research tent", storyRole: "botanical-survey" },
  { id: emeraldMeridianLevels[3].id, order: 4, x: 0.4, y: 0.53, promptFile: "04_flooded_bridge.md", landmark: "bridge approach", storyRole: "route-sabotage" },
  { id: emeraldMeridianLevels[4].id, order: 5, x: 0.49, y: 0.45, promptFile: "05_stone_terraces.md", landmark: "central terrace", storyRole: "waterworks-reveal" },
  { id: emeraldMeridianLevels[5].id, order: 6, x: 0.58, y: 0.49, promptFile: "06_stilt_village.md", landmark: "main stilt house", storyRole: "local-allies" },
  { id: emeraldMeridianLevels[6].id, order: 7, x: 0.66, y: 0.4, promptFile: "07_three_stream_waterfall.md", landmark: "waterfall basin", storyRole: "sluice-gate" },
  { id: emeraldMeridianLevels[7].id, order: 8, x: 0.72, y: 0.32, promptFile: "08_temple_of_roots.md", landmark: "temple forecourt", storyRole: "system-map" },
  { id: emeraldMeridianLevels[8].id, order: 9, x: 0.63, y: 0.24, promptFile: "09_underground_reservoir.md", landmark: "cave entrance", storyRole: "reservoir-access" },
  { id: emeraldMeridianLevels[9].id, order: 10, x: 0.76, y: 0.18, promptFile: "10_canopy_observatory.md", landmark: "observatory platform", storyRole: "rain-calendar" },
  { id: emeraldMeridianLevels[10].id, order: 11, x: 0.86, y: 0.28, promptFile: "11_heart_of_green_valley.md", landmark: "lakeshore station", storyRole: "hidden-valley" },
  { id: emeraldMeridianLevels[11].id, order: 12, x: 0.9, y: 0.46, promptFile: "12_ruined_geological_station.md", landmark: "dismantled drill", storyRole: "mining-proof" },
  { id: emeraldMeridianLevels[12].id, order: 13, x: 0.82, y: 0.7, promptFile: "13_evacuation_airstrip.md", landmark: "airstrip aircraft", storyRole: "campaign-finale" }
];

export const chapters: Record<ChapterId, ChapterDefinition> = {
  "northern-route": {
    id: "northern-route",
    campaignId: campaignManifest["northern-route"].campaignId,
    titleKey: campaignManifest["northern-route"].titleKey,
    backgroundAsset: campaignManifest["northern-route"].backgroundAsset,
    aspectRatio: campaignManifest["northern-route"].mapAspectRatio,
    levels: northernRouteLevels,
    mapPoints: northernRouteMapPoints
  },
  "sand-meridian": {
    id: "sand-meridian",
    campaignId: campaignManifest["sand-meridian"].campaignId,
    titleKey: campaignManifest["sand-meridian"].titleKey,
    backgroundAsset: campaignManifest["sand-meridian"].backgroundAsset,
    aspectRatio: campaignManifest["sand-meridian"].mapAspectRatio,
    levels: sandMeridianLevels,
    mapPoints: sandMeridianMapPoints
  },
  "emerald-meridian": {
    id: "emerald-meridian",
    campaignId: campaignManifest["emerald-meridian"].campaignId,
    titleKey: campaignManifest["emerald-meridian"].titleKey,
    backgroundAsset: campaignManifest["emerald-meridian"].backgroundAsset,
    aspectRatio: campaignManifest["emerald-meridian"].mapAspectRatio,
    levels: emeraldMeridianLevels,
    mapPoints: emeraldMeridianMapPoints
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
