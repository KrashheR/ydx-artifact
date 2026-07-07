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
    {
      id: "archive-01-photo",
      hitAreaA: { kind: "ellipse", cx: 0.7405, cy: 0.1416, rx: 0.0845, ry: 0.1361 },
      hitAreaB: { kind: "ellipse", cx: 0.7405, cy: 0.1416, rx: 0.0845, ry: 0.1361 },
      hintArea: { kind: "ellipse", cx: 0.7405, cy: 0.1416, rx: 0.1095, ry: 0.1661 },
      difficulty: 1,
    },
    {
      id: "archive-01-rope-coil",
      hitAreaA: { kind: "ellipse", cx: 0.8922, cy: 0.3317, rx: 0.0886, ry: 0.1467 },
      hitAreaB: { kind: "ellipse", cx: 0.8922, cy: 0.3317, rx: 0.0886, ry: 0.1467 },
      hintArea: { kind: "ellipse", cx: 0.8922, cy: 0.3317, rx: 0.1136, ry: 0.1767 },
      difficulty: 1,
    },
    {
      id: "archive-01-magnifier",
      hitAreaA: { kind: "ellipse", cx: 0.1487, cy: 0.4701, rx: 0.0953, ry: 0.2549, rotation: 39.6356 },
      hitAreaB: { kind: "ellipse", cx: 0.1487, cy: 0.4701, rx: 0.0953, ry: 0.2549, rotation: 39.6356 },
      hintArea: { kind: "ellipse", cx: 0.1487, cy: 0.4701, rx: 0.1203, ry: 0.2849, rotation: 39.6356 },
      difficulty: 1,
    },
    {
      id: "archive-01-knife",
      hitAreaA: { kind: "ellipse", cx: 0.7481, cy: 0.4657, rx: 0.0643, ry: 0.182 },
      hitAreaB: { kind: "ellipse", cx: 0.7481, cy: 0.4657, rx: 0.0643, ry: 0.182 },
      hintArea: { kind: "ellipse", cx: 0.7481, cy: 0.4657, rx: 0.0893, ry: 0.212 },
      difficulty: 1,
    },
    {
      id: "archive-01-wax-seal",
      hitAreaA: { kind: "ellipse", cx: 0.506, cy: 0.437, rx: 0.045, ry: 0.068 },
      hitAreaB: { kind: "ellipse", cx: 0.506, cy: 0.437, rx: 0.045, ry: 0.068 },
      hintArea: { kind: "ellipse", cx: 0.506, cy: 0.437, rx: 0.07, ry: 0.098 },
      difficulty: 1,
    },
    {
      id: "archive-01-compass",
      hitAreaA: { kind: "ellipse", cx: 0.659, cy: 0.8728, rx: 0.0665, ry: 0.1099 },
      hitAreaB: { kind: "ellipse", cx: 0.659, cy: 0.8728, rx: 0.0665, ry: 0.1099 },
      hintArea: { kind: "ellipse", cx: 0.659, cy: 0.8728, rx: 0.0915, ry: 0.1399 },
      difficulty: 1,
    },
    {
      id: "new-hitbox-7",
      hitAreaA: { kind: "ellipse", cx: 0.3738, cy: 0.9151, rx: 0.107, ry: 0.065, rotation: -11.8755 },
      hitAreaB: { kind: "ellipse", cx: 0.3738, cy: 0.9151, rx: 0.107, ry: 0.065, rotation: -11.8755 },
      hintArea: { kind: "ellipse", cx: 0.3738, cy: 0.9151, rx: 0.132, ry: 0.095, rotation: -11.8755 },
      difficulty: 1,
    }
  ]),
  dailyLevel(2, "daily.archiveCase02.title", [
    {
      id: "archive-02-fixing-jar",
      hitAreaA: { kind: "ellipse", cx: 0.7456, cy: 0.2758, rx: 0.0612, ry: 0.1109 },
      hitAreaB: { kind: "ellipse", cx: 0.7456, cy: 0.2758, rx: 0.0612, ry: 0.1109 },
      hintArea: { kind: "ellipse", cx: 0.7456, cy: 0.2758, rx: 0.0862, ry: 0.1409 },
      difficulty: 1,
    },
    {
      id: "archive-02-tweezers",
      hitAreaA: { kind: "ellipse", cx: 0.818, cy: 0.584, rx: 0.078, ry: 0.094 },
      hitAreaB: { kind: "ellipse", cx: 0.818, cy: 0.584, rx: 0.078, ry: 0.094 },
      hintArea: { kind: "ellipse", cx: 0.818, cy: 0.584, rx: 0.103, ry: 0.124 },
      difficulty: 1,
    },
    {
      id: "archive-02-gloves",
      hitAreaA: { kind: "ellipse", cx: 0.829, cy: 0.8332, rx: 0.157, ry: 0.172 },
      hitAreaB: { kind: "ellipse", cx: 0.829, cy: 0.8332, rx: 0.157, ry: 0.172 },
      hintArea: { kind: "ellipse", cx: 0.829, cy: 0.8332, rx: 0.182, ry: 0.202 },
      difficulty: 1,
    },
    {
      id: "archive-02-photo-mark",
      hitAreaA: { kind: "ellipse", cx: 0.2963, cy: 0.6421, rx: 0.0533, ry: 0.0832 },
      hitAreaB: { kind: "ellipse", cx: 0.2963, cy: 0.6421, rx: 0.0533, ry: 0.0832 },
      hintArea: { kind: "ellipse", cx: 0.2963, cy: 0.6421, rx: 0.0783, ry: 0.1132 },
      difficulty: 1,
    },
    {
      id: "archive-02-film-strip",
      hitAreaA: { kind: "ellipse", cx: 0.0635, cy: 0.7798, rx: 0.0427, ry: 0.2117, rotation: 15.2466 },
      hitAreaB: { kind: "ellipse", cx: 0.0635, cy: 0.7798, rx: 0.0427, ry: 0.2117, rotation: 15.2466 },
      hintArea: { kind: "ellipse", cx: 0.0635, cy: 0.7798, rx: 0.0677, ry: 0.2417, rotation: 15.2466 },
      difficulty: 1,
    },
    {
      id: "archive-02-brush",
      hitAreaA: { kind: "ellipse", cx: 0.5363, cy: 0.7823, rx: 0.1646, ry: 0.0932 },
      hitAreaB: { kind: "ellipse", cx: 0.5363, cy: 0.7823, rx: 0.1646, ry: 0.0932 },
      hintArea: { kind: "ellipse", cx: 0.5363, cy: 0.7823, rx: 0.1896, ry: 0.1232 },
      difficulty: 1,
    }
  ]),
  dailyLevel(3, "daily.archiveCase03.title", [
    {
      id: "archive-03-top-drawer",
      hitAreaA: { kind: "ellipse", cx: 0.8559, cy: 0.1701, rx: 0.046, ry: 0.0731 },
      hitAreaB: { kind: "ellipse", cx: 0.8559, cy: 0.1701, rx: 0.046, ry: 0.0731 },
      hintArea: { kind: "ellipse", cx: 0.8559, cy: 0.1701, rx: 0.071, ry: 0.1031 },
      difficulty: 2,
    },
    {
      id: "archive-03-open-drawer",
      hitAreaA: { kind: "ellipse", cx: 0.4975, cy: 0.437, rx: 0.0735, ry: 0.1169 },
      hitAreaB: { kind: "ellipse", cx: 0.4975, cy: 0.437, rx: 0.0735, ry: 0.1169 },
      hintArea: { kind: "ellipse", cx: 0.4975, cy: 0.437, rx: 0.0985, ry: 0.1469 },
      difficulty: 2,
    },
    {
      id: "archive-03-card-stack",
      hitAreaA: { kind: "ellipse", cx: 0.4635, cy: 0.6624, rx: 0.0514, ry: 0.0398 },
      hitAreaB: { kind: "ellipse", cx: 0.4635, cy: 0.6624, rx: 0.0514, ry: 0.0398 },
      hintArea: { kind: "ellipse", cx: 0.4635, cy: 0.6624, rx: 0.0764, ry: 0.0698 },
      difficulty: 2,
    },
    {
      id: "archive-03-stamp",
      hitAreaA: { kind: "ellipse", cx: 0.1456, cy: 0.754, rx: 0.064, ry: 0.1023 },
      hitAreaB: { kind: "ellipse", cx: 0.1456, cy: 0.754, rx: 0.064, ry: 0.1023 },
      hintArea: { kind: "ellipse", cx: 0.1456, cy: 0.754, rx: 0.089, ry: 0.1323 },
      difficulty: 2,
    },
    {
      id: "archive-03-red-thread",
      hitAreaA: { kind: "ellipse", cx: 0.5873, cy: 0.747, rx: 0.0523, ry: 0.0822 },
      hitAreaB: { kind: "ellipse", cx: 0.5873, cy: 0.747, rx: 0.0523, ry: 0.0822 },
      hintArea: { kind: "ellipse", cx: 0.5873, cy: 0.747, rx: 0.0773, ry: 0.1122 },
      difficulty: 2,
    },
    {
      id: "archive-03-key",
      hitAreaA: { kind: "ellipse", cx: 0.4842, cy: 0.8584, rx: 0.0476, ry: 0.0736 },
      hitAreaB: { kind: "ellipse", cx: 0.4842, cy: 0.8584, rx: 0.0476, ry: 0.0736 },
      hintArea: { kind: "ellipse", cx: 0.4842, cy: 0.8584, rx: 0.0726, ry: 0.1036 },
      difficulty: 2,
    },
    {
      id: "new-hitbox-7",
      hitAreaA: { kind: "ellipse", cx: 0.2616, cy: 0.4094, rx: 0.04, ry: 0.065 },
      hitAreaB: { kind: "ellipse", cx: 0.2616, cy: 0.4094, rx: 0.04, ry: 0.065 },
      hintArea: { kind: "ellipse", cx: 0.2616, cy: 0.4094, rx: 0.065, ry: 0.095 },
      difficulty: 1,
    }
  ]),
  dailyLevel(4, "daily.archiveCase04.title", [
    {
      id: "archive-04-photo",
      hitAreaA: { kind: "ellipse", cx: 0.4923, cy: 0.2303, rx: 0.0856, ry: 0.1618 },
      hitAreaB: { kind: "ellipse", cx: 0.4923, cy: 0.2303, rx: 0.0856, ry: 0.1618 },
      hintArea: { kind: "ellipse", cx: 0.4923, cy: 0.2303, rx: 0.1106, ry: 0.1918 },
      difficulty: 2,
    },
    {
      id: "archive-04-timer",
      hitAreaA: { kind: "ellipse", cx: 0.4927, cy: 0.5055, rx: 0.0511, ry: 0.0806 },
      hitAreaB: { kind: "ellipse", cx: 0.4927, cy: 0.5055, rx: 0.0511, ry: 0.0806 },
      hintArea: { kind: "ellipse", cx: 0.4927, cy: 0.5055, rx: 0.0761, ry: 0.1106 },
      difficulty: 2,
    },
    {
      id: "archive-04-bottle",
      hitAreaA: { kind: "ellipse", cx: 0.7717, cy: 0.4233, rx: 0.0526, ry: 0.1692, rotation: 7.2085 },
      hitAreaB: { kind: "ellipse", cx: 0.7717, cy: 0.4233, rx: 0.0526, ry: 0.1692, rotation: 7.2085 },
      hintArea: { kind: "ellipse", cx: 0.7717, cy: 0.4233, rx: 0.0776, ry: 0.1992, rotation: 7.2085 },
      difficulty: 2,
    },
    {
      id: "archive-04-developer-tray",
      hitAreaA: { kind: "ellipse", cx: 0.4929, cy: 0.7082, rx: 0.0967, ry: 0.0832 },
      hitAreaB: { kind: "ellipse", cx: 0.4929, cy: 0.7082, rx: 0.0967, ry: 0.0832 },
      hintArea: { kind: "ellipse", cx: 0.4929, cy: 0.7082, rx: 0.1217, ry: 0.1132 },
      difficulty: 2,
    },
    {
      id: "archive-04-tongs",
      hitAreaA: { kind: "ellipse", cx: 0.6635, cy: 0.8069, rx: 0.0994, ry: 0.062, rotation: 26.7147 },
      hitAreaB: { kind: "ellipse", cx: 0.6635, cy: 0.8069, rx: 0.0994, ry: 0.062, rotation: 26.7147 },
      hintArea: { kind: "ellipse", cx: 0.6635, cy: 0.8069, rx: 0.1244, ry: 0.092, rotation: 26.7147 },
      difficulty: 2,
    }
  ]),
  dailyLevel(5, "daily.archiveCase05.title", [
    {
      id: "archive-05-red-route",
      hitAreaA: { kind: "ellipse", cx: 0.4067, cy: 0.5582, rx: 0.0429, ry: 0.2199, rotation: -44.6294 },
      hitAreaB: { kind: "ellipse", cx: 0.4067, cy: 0.5582, rx: 0.0429, ry: 0.2199, rotation: -44.6294 },
      hintArea: { kind: "ellipse", cx: 0.4067, cy: 0.5582, rx: 0.0679, ry: 0.2499, rotation: -44.6294 },
      difficulty: 2,
    },
    {
      id: "archive-05-left-photo",
      hitAreaA: { kind: "ellipse", cx: 0.1596, cy: 0.4425, rx: 0.0875, ry: 0.1018 },
      hitAreaB: { kind: "ellipse", cx: 0.1596, cy: 0.4425, rx: 0.0875, ry: 0.1018 },
      hintArea: { kind: "ellipse", cx: 0.1596, cy: 0.4425, rx: 0.1125, ry: 0.1318 },
      difficulty: 2,
    },
    {
      id: "archive-05-map-blank",
      hitAreaA: { kind: "ellipse", cx: 0.6753, cy: 0.5905, rx: 0.0614, ry: 0.0878 },
      hitAreaB: { kind: "ellipse", cx: 0.6753, cy: 0.5905, rx: 0.0614, ry: 0.0878 },
      hintArea: { kind: "ellipse", cx: 0.6753, cy: 0.5905, rx: 0.0864, ry: 0.1178 },
      difficulty: 2,
    },
    {
      id: "archive-05-blue-pin",
      hitAreaA: { kind: "ellipse", cx: 0.6482, cy: 0.8482, rx: 0.0521, ry: 0.0828 },
      hitAreaB: { kind: "ellipse", cx: 0.6482, cy: 0.8482, rx: 0.0521, ry: 0.0828 },
      hintArea: { kind: "ellipse", cx: 0.6482, cy: 0.8482, rx: 0.0771, ry: 0.1128 },
      difficulty: 2,
    },
    {
      id: "archive-05-compass",
      hitAreaA: { kind: "ellipse", cx: 0.1195, cy: 0.8372, rx: 0.053, ry: 0.0857 },
      hitAreaB: { kind: "ellipse", cx: 0.1195, cy: 0.8372, rx: 0.053, ry: 0.0857 },
      hintArea: { kind: "ellipse", cx: 0.1195, cy: 0.8372, rx: 0.078, ry: 0.1157 },
      difficulty: 2,
    },
    {
      id: "archive-05-scroll",
      hitAreaA: { kind: "ellipse", cx: 0.3769, cy: 0.87, rx: 0.1013, ry: 0.0736 },
      hitAreaB: { kind: "ellipse", cx: 0.3769, cy: 0.87, rx: 0.1013, ry: 0.0736 },
      hintArea: { kind: "ellipse", cx: 0.3769, cy: 0.87, rx: 0.1263, ry: 0.1036 },
      difficulty: 2,
    }
  ]),
  dailyLevel(6, "daily.archiveCase06.title", [
    {
      id: "archive-06-sextant",
      hitAreaA: { kind: "ellipse", cx: 0.3449, cy: 0.2475, rx: 0.0805, ry: 0.1512 },
      hitAreaB: { kind: "ellipse", cx: 0.3449, cy: 0.2475, rx: 0.0805, ry: 0.1512 },
      hintArea: { kind: "ellipse", cx: 0.3449, cy: 0.2475, rx: 0.1055, ry: 0.1812 },
      difficulty: 3,
    },
    {
      id: "archive-06-vase",
      hitAreaA: { kind: "ellipse", cx: 0.4679, cy: 0.6168, rx: 0.0473, ry: 0.0806 },
      hitAreaB: { kind: "ellipse", cx: 0.4679, cy: 0.6168, rx: 0.0473, ry: 0.0806 },
      hintArea: { kind: "ellipse", cx: 0.4679, cy: 0.6168, rx: 0.0723, ry: 0.1106 },
      difficulty: 3,
    },
    {
      id: "archive-06-lantern",
      hitAreaA: { kind: "ellipse", cx: 0.1422, cy: 0.6685, rx: 0.0596, ry: 0.1857 },
      hitAreaB: { kind: "ellipse", cx: 0.1422, cy: 0.6685, rx: 0.0596, ry: 0.1857 },
      hintArea: { kind: "ellipse", cx: 0.1422, cy: 0.6685, rx: 0.0846, ry: 0.2157 },
      difficulty: 3,
    },
    {
      id: "archive-06-case-lock",
      hitAreaA: { kind: "ellipse", cx: 0.3123, cy: 0.6475, rx: 0.1014, ry: 0.148 },
      hitAreaB: { kind: "ellipse", cx: 0.3123, cy: 0.6475, rx: 0.1014, ry: 0.148 },
      hintArea: { kind: "ellipse", cx: 0.3123, cy: 0.6475, rx: 0.1264, ry: 0.178 },
      difficulty: 3,
    },
    {
      id: "archive-06-hook",
      hitAreaA: { kind: "ellipse", cx: 0.4492, cy: 0.7581, rx: 0.0448, ry: 0.0771 },
      hitAreaB: { kind: "ellipse", cx: 0.4492, cy: 0.7581, rx: 0.0448, ry: 0.0771 },
      hintArea: { kind: "ellipse", cx: 0.4492, cy: 0.7581, rx: 0.0698, ry: 0.1071 },
      difficulty: 3,
    },
    {
      id: "archive-06-canvas-roll",
      hitAreaA: { kind: "ellipse", cx: 0.6054, cy: 0.7524, rx: 0.125, ry: 0.1421 },
      hitAreaB: { kind: "ellipse", cx: 0.6054, cy: 0.7524, rx: 0.125, ry: 0.1421 },
      hintArea: { kind: "ellipse", cx: 0.6054, cy: 0.7524, rx: 0.15, ry: 0.1721 },
      difficulty: 3,
    }
  ]),
  dailyLevel(7, "daily.archiveCase07.title", [
    {
      id: "archive-07-keys",
      hitAreaA: { kind: "ellipse", cx: 0.6652, cy: 0.3468, rx: 0.0369, ry: 0.0922 },
      hitAreaB: { kind: "ellipse", cx: 0.6652, cy: 0.3468, rx: 0.0369, ry: 0.0922 },
      hintArea: { kind: "ellipse", cx: 0.6652, cy: 0.3468, rx: 0.0619, ry: 0.1222 },
      difficulty: 3,
    },
    {
      id: "archive-07-open-box",
      hitAreaA: { kind: "ellipse", cx: 0.3972, cy: 0.4889, rx: 0.0627, ry: 0.1013 },
      hitAreaB: { kind: "ellipse", cx: 0.3972, cy: 0.4889, rx: 0.0627, ry: 0.1013 },
      hintArea: { kind: "ellipse", cx: 0.3972, cy: 0.4889, rx: 0.0877, ry: 0.1313 },
      difficulty: 3,
    },
    {
      id: "archive-07-paper-bundle",
      hitAreaA: { kind: "ellipse", cx: 0.5287, cy: 0.5121, rx: 0.0555, ry: 0.0771 },
      hitAreaB: { kind: "ellipse", cx: 0.5287, cy: 0.5121, rx: 0.0555, ry: 0.0771 },
      hintArea: { kind: "ellipse", cx: 0.5287, cy: 0.5121, rx: 0.0805, ry: 0.1071 },
      difficulty: 3,
    },
    {
      id: "archive-07-envelope",
      hitAreaA: { kind: "ellipse", cx: 0.5738, cy: 0.8397, rx: 0.1138, ry: 0.0882 },
      hitAreaB: { kind: "ellipse", cx: 0.5738, cy: 0.8397, rx: 0.1138, ry: 0.0882 },
      hintArea: { kind: "ellipse", cx: 0.5738, cy: 0.8397, rx: 0.1388, ry: 0.1182 },
      difficulty: 3,
    },
    {
      id: "archive-07-padlock",
      hitAreaA: { kind: "ellipse", cx: 0.273, cy: 0.9328, rx: 0.062, ry: 0.0769 },
      hitAreaB: { kind: "ellipse", cx: 0.273, cy: 0.9328, rx: 0.062, ry: 0.0769 },
      hintArea: { kind: "ellipse", cx: 0.273, cy: 0.9328, rx: 0.087, ry: 0.1069 },
      difficulty: 3,
    }
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
