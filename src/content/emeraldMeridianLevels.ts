import { levelSchema, type LevelDefinition } from "../entities/level/schema";

const baseDifferences = [
  { id: "rope-bundle", x: 0.17, y: 0.72 },
  { id: "survey-case", x: 0.34, y: 0.62 },
  { id: "water-ripple", x: 0.56, y: 0.79 },
  { id: "canopy-gap", x: 0.62, y: 0.22 },
  { id: "moss-marker", x: 0.74, y: 0.57 },
  { id: "stone-relief", x: 0.46, y: 0.38 },
  { id: "lantern-glow", x: 0.83, y: 0.31 },
  { id: "crate-latch", x: 0.26, y: 0.48 }
] as const;

const differenceCounts = [4, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8] as const;

const emeraldLevelIds = [
  "em-01-river-landing",
  "em-02-radio-station",
  "em-03-botanical-camp",
  "em-04-flooded-bridge",
  "em-05-stone-terraces",
  "em-06-stilt-village",
  "em-07-three-stream-waterfall",
  "em-08-temple-of-roots",
  "em-09-underground-reservoir",
  "em-10-canopy-observatory",
  "em-11-green-valley",
  "em-12-geological-station",
  "em-13-evacuation-airstrip"
] as const;

function makeDifferences(order: number) {
  const total = differenceCounts[order - 1];

  return baseDifferences.slice(0, total).map((difference, index) => {
    const shiftX = ((order + index) % 3 === 0 ? -1 : 1) * 0.014;
    const shiftY = index % 2 === 0 ? 0.008 : -0.008;
    const radius = index < 4 ? 0.05 : 0.04;

    return {
      id: `${difference.id}-${order}`,
      hitAreaA: { kind: "circle" as const, cx: difference.x, cy: difference.y, radius },
      hitAreaB: {
        kind: "circle" as const,
        cx: Math.min(0.94, Math.max(0.06, difference.x + shiftX)),
        cy: Math.min(0.94, Math.max(0.06, difference.y + shiftY)),
        radius
      },
      hintArea: {
        kind: "circle" as const,
        cx: Math.min(0.94, Math.max(0.06, difference.x + shiftX / 2)),
        cy: Math.min(0.94, Math.max(0.06, difference.y + shiftY / 2)),
        radius: radius + 0.05
      },
      difficulty: (order < 5 ? 1 : order < 10 ? 2 : 3) as 1 | 2 | 3
    };
  });
}

function getTitleKey(levelId: (typeof emeraldLevelIds)[number]) {
  return `levels.${levelId.slice(0, 5).replace("-", "")}.title`;
}

function makeLevel(levelId: (typeof emeraldLevelIds)[number], order: number): LevelDefinition {
  return levelSchema.parse({
    id: levelId,
    chapterId: "emerald-meridian",
    order,
    titleKey: getTitleKey(levelId),
    imageA: `/assets/scenes/emerald-meridian/${order}/1.webp`,
    imageB: `/assets/scenes/emerald-meridian/${order}/2.webp`,
    thumbnail: `/assets/scenes/emerald-meridian/${order}/1.webp`,
    differences: makeDifferences(order),
    requiredDifferences: differenceCounts[order - 1],
    reward: {
      archivePoints: 180 + order * 10,
      magnifiers: order % 3 === 0 ? 1 : 0
    }
  });
}

export const emeraldMeridianLevels = emeraldLevelIds.map((levelId, index) => makeLevel(levelId, index + 1));
