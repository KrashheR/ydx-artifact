import { levelSchema, type DifferenceDefinition, type LevelDefinition } from "../entities/level/schema";
import { getLevelSceneAsset } from "./sceneAssets";

const DAY_MS = 86_400_000;
export const DAILY_ARCHIVE_ASSET_FOLDER = "archive";

function localDayNumber(date: Date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}

export function getDailyArchiveDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ellipse(
  id: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  difficulty: DifferenceDefinition["difficulty"] = 2,
): DifferenceDefinition {
  const hintRx = Math.min(1, rx + 0.025);
  const hintRy = Math.min(1, ry + 0.03);

  return {
    id,
    hitAreaA: { kind: "ellipse", cx, cy, rx, ry },
    hitAreaB: { kind: "ellipse", cx, cy, rx, ry },
    hintArea: { kind: "ellipse", cx, cy, rx: hintRx, ry: hintRy },
    difficulty,
  };
}

function dailyLevel(
  order: number,
  titleKey: string,
  differences: DifferenceDefinition[],
): LevelDefinition {
  return levelSchema.parse({
    id: `daily-archive-${String(order).padStart(2, "0")}`,
    chapterId: "northern-route",
    order,
    titleKey,
    imageA: getLevelSceneAsset(DAILY_ARCHIVE_ASSET_FOLDER, order, "1.webp"),
    imageB: getLevelSceneAsset(DAILY_ARCHIVE_ASSET_FOLDER, order, "2.webp"),
    thumbnail: getLevelSceneAsset(DAILY_ARCHIVE_ASSET_FOLDER, order, "1.webp"),
    differences,
    requiredDifferences: differences.length,
    reward: {
      archivePoints: 0,
      magnifiers: 0,
    },
  });
}

export const dailyArchiveLevels: LevelDefinition[] = [
  dailyLevel(1, "daily.archiveCase01.title", [
    ellipse("archive-01-photo", 0.7405, 0.1416, 0.0845, 0.1361, 1),
    ellipse("archive-01-rope-coil", 0.8922, 0.3317, 0.0886, 0.1467, 1),
    ellipse("archive-01-magnifier", 0.1721, 0.4093, 0.1119, 0.191, 1),
    ellipse("archive-01-knife", 0.7481, 0.4657, 0.0643, 0.182, 1),
    ellipse("archive-01-wax-seal", 0.506, 0.437, 0.0675, 0.1109, 1),
    ellipse("archive-01-compass", 0.6583, 0.8705, 0.0665, 0.1099, 1),
  ]),
  dailyLevel(2, "daily.archiveCase02.title", [
    ellipse("archive-02-fixing-jar", 0.7323, 0.2636, 0.0612, 0.1109, 1),
    ellipse("archive-02-tweezers", 0.818, 0.584, 0.078, 0.094, 1),
    ellipse("archive-02-gloves", 0.842, 0.827, 0.157, 0.172, 1),
    ellipse("archive-02-photo-mark", 0.2963, 0.6421, 0.0533, 0.0832, 1),
    ellipse("archive-02-film-strip", 0.0943, 0.7873, 0.0908, 0.1689, 1),
    ellipse("archive-02-brush", 0.5363, 0.7823, 0.1646, 0.0932, 1),
  ]),
  dailyLevel(3, "daily.archiveCase03.title", [
    ellipse("archive-03-top-drawer", 0.8566, 0.1603, 0.046, 0.0731, 2),
    ellipse("archive-03-open-drawer", 0.4975, 0.437, 0.0735, 0.1169, 2),
    ellipse("archive-03-card-stack", 0.4023, 0.629, 0.0514, 0.0398, 2),
    ellipse("archive-03-stamp", 0.1456, 0.754, 0.064, 0.1023, 2),
    ellipse("archive-03-red-thread", 0.5873, 0.747, 0.0523, 0.0822, 2),
    ellipse("archive-03-key", 0.4842, 0.8584, 0.0476, 0.0736, 2),
  ]),
  dailyLevel(4, "daily.archiveCase04.title", [
    ellipse("archive-04-photo", 0.3042, 0.2051, 0.0574, 0.0887, 2),
    ellipse("archive-04-timer", 0.4927, 0.5055, 0.0511, 0.0806, 2),
    ellipse("archive-04-bottle", 0.7686, 0.5212, 0.0526, 0.0832, 2),
    ellipse("archive-04-developer-tray", 0.5047, 0.7056, 0.0523, 0.0832, 2),
    ellipse("archive-04-tongs", 0.6091, 0.7828, 0.0526, 0.0837, 2),
    ellipse("archive-04-film", 0.2954, 0.8826, 0.1059, 0.0897, 2),
  ]),
  dailyLevel(5, "daily.archiveCase05.title", [
    ellipse("archive-05-red-route", 0.3471, 0.3911, 0.0517, 0.1144, 2),
    ellipse("archive-05-left-photo", 0.1709, 0.4425, 0.0526, 0.0842, 2),
    ellipse("archive-05-map-blank", 0.7059, 0.6487, 0.0277, 0.0444, 2),
    ellipse("archive-05-blue-pin", 0.5243, 0.7072, 0.0265, 0.0423, 2),
    ellipse("archive-05-compass", 0.1195, 0.8372, 0.053, 0.0857, 2),
    ellipse("archive-05-scroll", 0.3433, 0.8695, 0.0731, 0.0736, 2),
  ]),
  dailyLevel(6, "daily.archiveCase06.title", [
    ellipse("archive-06-sextant", 0.3449, 0.2475, 0.076, 0.1381, 3),
    ellipse("archive-06-vase", 0.5218, 0.3785, 0.0473, 0.0806, 3),
    ellipse("archive-06-lantern", 0.1431, 0.687, 0.0596, 0.126, 3),
    ellipse("archive-06-case-lock", 0.2967, 0.7475, 0.0706, 0.1048, 3),
    ellipse("archive-06-hook", 0.4492, 0.7581, 0.0448, 0.0771, 3),
    ellipse("archive-06-canvas-roll", 0.634, 0.814, 0.0523, 0.0615, 3),
  ]),
  dailyLevel(7, "daily.archiveCase07.title", [
    ellipse("archive-07-scrolls", 0.4931, 0.2792, 0.0583, 0.1064, 3),
    ellipse("archive-07-keys", 0.6652, 0.3468, 0.0369, 0.0922, 3),
    ellipse("archive-07-open-box", 0.3972, 0.4889, 0.0627, 0.1013, 3),
    ellipse("archive-07-paper-bundle", 0.5287, 0.5121, 0.0555, 0.0771, 3),
    ellipse("archive-07-envelope", 0.5738, 0.8397, 0.088, 0.0731, 3),
    ellipse("archive-07-padlock", 0.2856, 0.9178, 0.0426, 0.0685, 3),
  ]),
];

export const dailyLevels = dailyArchiveLevels.map((level) => ({
  id: level.id,
  titleKey: level.titleKey,
  levelId: level.id,
}));

export function getDailyArchiveEntryForDate(date = new Date()) {
  return dailyLevels[localDayNumber(date) % dailyLevels.length];
}
