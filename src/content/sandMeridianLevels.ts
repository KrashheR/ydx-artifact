import { levelSchema, type LevelDefinition } from "../entities/level/schema";
import sandMeridianMapLayout from "../../docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json";

const baseDifferences = [
  { id: "camp-marker", x: 0.18, y: 0.74 },
  { id: "rope-coil", x: 0.37, y: 0.65 },
  { id: "sun-disc", x: 0.56, y: 0.24 },
  { id: "cracked-stone", x: 0.48, y: 0.81 },
  { id: "water-jar", x: 0.69, y: 0.59 },
  { id: "tripod-shadow", x: 0.82, y: 0.43 },
  { id: "survey-flag", x: 0.28, y: 0.47 },
  { id: "carved-symbol", x: 0.74, y: 0.29 }
] as const;

const differenceCounts = [4, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8] as const;
const runtimeAssetOrderByLevelOrder: Partial<Record<number, number>> = {
  // The current intake package has only scene folders 1-12.
  13: 12
};

type SandMeridianLayoutLevel = (typeof sandMeridianMapLayout.levels)[number];

function makeDifferences(order: number) {
  const total = differenceCounts[order - 1];

  return baseDifferences.slice(0, total).map((difference, index) => {
    const shift = (order % 3) * 0.012;
    const radius = index < 4 ? 0.05 : 0.04;
    const movedX =
      index % 2 === 0 ? Math.min(difference.x + shift, 0.94) : Math.max(difference.x - shift, 0.06);

    return {
      id: `${difference.id}-${order}`,
      hitAreaA: { kind: "circle" as const, cx: difference.x, cy: difference.y, radius },
      hitAreaB: { kind: "circle" as const, cx: movedX, cy: difference.y, radius },
      hintArea: {
        kind: "circle" as const,
        cx: (difference.x + movedX) / 2,
        cy: difference.y,
        radius: radius + 0.05
      },
      difficulty: (order < 5 ? 1 : order < 10 ? 2 : 3) as 1 | 2 | 3
    };
  });
}

function getTitleKey(level: SandMeridianLayoutLevel) {
  return `levels.${level.id.slice(0, 5).replace("-", "")}.title`;
}

function makeLevel(level: SandMeridianLayoutLevel): LevelDefinition {
  const runtimeAssetOrder = runtimeAssetOrderByLevelOrder[level.order] ?? level.order;

  return levelSchema.parse({
    id: level.id,
    chapterId: "sand-meridian",
    order: level.order,
    titleKey: getTitleKey(level),
    imageA: `/assets/scenes/sand-meredian/${runtimeAssetOrder}/1.png`,
    imageB: `/assets/scenes/sand-meredian/${runtimeAssetOrder}/2.png`,
    thumbnail: `/assets/scenes/sand-meredian/${runtimeAssetOrder}/1.png`,
    differences: makeDifferences(level.order),
    requiredDifferences: differenceCounts[level.order - 1],
    reward: {
      archivePoints: 140 + level.order * 10,
      magnifiers: level.order % 3 === 0 ? 1 : 0
    }
  });
}

export const sandMeridianLevels = sandMeridianMapLayout.levels.map(makeLevel);
