import { levelSchema, type LevelDefinition } from "../entities/level/schema";

const baseDifferences = [
  { id: "missing-cup", x: 0.2, y: 0.7 },
  { id: "blue-strap", x: 0.75, y: 0.64 },
  { id: "clock-hand", x: 0.52, y: 0.22 },
  { id: "moved-tube", x: 0.38, y: 0.82 },
  { id: "lamp-color", x: 0.62, y: 0.43 },
  { id: "crate-count", x: 0.32, y: 0.5 },
  { id: "gauge-needle", x: 0.84, y: 0.34 },
  { id: "window-glow", x: 0.13, y: 0.28 }
] as const;

const titles = [
  "nr01",
  "nr02",
  "nr03",
  "nr04",
  "nr05",
  "nr06",
  "nr07",
  "nr08",
  "nr09",
  "nr10",
  "nr11",
  "nr12",
  "nr13"
] as const;

const counts = [4, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8];
const artifactByOrder: Record<number, string> = {
  3: "brass-compass",
  6: "field-radio",
  9: "blue-flower",
  12: "torn-map"
};

const firstLevel = levelSchema.parse({
  id: "nr-01-scene01",
  chapterId: "northern-route",
  order: 1,
  titleKey: "levels.nr01.title",
  imageA: "/assets/scenes/northern-route/1/1.webp",
  imageB: "/assets/scenes/northern-route/1/2.webp",
  thumbnail: "/assets/scenes/northern-route/1/1.webp",
  differences: [
    {
      id: "compass-removed-1",
      hitAreaA: { kind: "circle", cx: 0.21, cy: 0.81, radius: 0.07 },
      hitAreaB: { kind: "circle", cx: 0.21, cy: 0.81, radius: 0.07 },
      hintArea: { kind: "circle", cx: 0.21, cy: 0.81, radius: 0.13 },
      difficulty: 1
    },
    {
      id: "canister-count-1",
      hitAreaA: { kind: "circle", cx: 0.32, cy: 0.63, radius: 0.105 },
      hitAreaB: { kind: "circle", cx: 0.335, cy: 0.63, radius: 0.095 },
      hintArea: { kind: "circle", cx: 0.325, cy: 0.63, radius: 0.14 },
      difficulty: 1
    },
    {
      id: "lifebuoy-color-1",
      hitAreaA: { kind: "circle", cx: 0.555, cy: 0.52, radius: 0.055 },
      hitAreaB: { kind: "circle", cx: 0.555, cy: 0.52, radius: 0.055 },
      hintArea: { kind: "circle", cx: 0.555, cy: 0.52, radius: 0.1 },
      difficulty: 1
    },
    {
      id: "seagull-removed-1",
      hitAreaA: { kind: "circle", cx: 0.95, cy: 0.34, radius: 0.05 },
      hitAreaB: { kind: "circle", cx: 0.95, cy: 0.34, radius: 0.05 },
      hintArea: { kind: "circle", cx: 0.95, cy: 0.34, radius: 0.09 },
      difficulty: 1
    }
  ],
  requiredDifferences: 4,
  reward: {
    archivePoints: 110,
    magnifiers: 0
  }
});

const secondLevel = levelSchema.parse({
  id: "nr-02-scene02",
  chapterId: "northern-route",
  order: 2,
  titleKey: "levels.nr02.title",
  imageA: "/assets/scenes/northern-route/2/1.webp",
  imageB: "/assets/scenes/northern-route/2/2.webp",
  thumbnail: "/assets/scenes/northern-route/2/1.webp",
  differences: [
    {
      id: "rolled-bedding-count-2",
      hitAreaA: { kind: "circle", cx: 0.158, cy: 0.171, radius: 0.06 },
      hitAreaB: { kind: "circle", cx: 0.158, cy: 0.171, radius: 0.06 },
      hintArea: { kind: "circle", cx: 0.158, cy: 0.171, radius: 0.085 },
      difficulty: 1
    },
    {
      id: "lamp-color-2",
      hitAreaA: { kind: "circle", cx: 0.238, cy: 0.381, radius: 0.038 },
      hitAreaB: { kind: "circle", cx: 0.238, cy: 0.381, radius: 0.038 },
      hintArea: { kind: "circle", cx: 0.238, cy: 0.381, radius: 0.055 },
      difficulty: 1
    },
    {
      id: "snowshoes-count-2",
      hitAreaA: { kind: "circle", cx: 0.629, cy: 0.336, radius: 0.065 },
      hitAreaB: { kind: "circle", cx: 0.629, cy: 0.336, radius: 0.065 },
      hintArea: { kind: "circle", cx: 0.629, cy: 0.336, radius: 0.105 },
      difficulty: 1
    },
    {
      id: "rope-added-2",
      hitAreaA: { kind: "circle", cx: 0.388, cy: 0.583, radius: 0.09 },
      hitAreaB: { kind: "circle", cx: 0.388, cy: 0.583, radius: 0.09 },
      hintArea: { kind: "circle", cx: 0.388, cy: 0.583, radius: 0.125 },
      difficulty: 1
    },
    {
      id: "crate-added-2",
      hitAreaA: { kind: "circle", cx: 0.855, cy: 0.635, radius: 0.045 },
      hitAreaB: { kind: "circle", cx: 0.855, cy: 0.635, radius: 0.045 },
      hintArea: { kind: "circle", cx: 0.855, cy: 0.635, radius: 0.065 },
      difficulty: 1
    }
  ],
  requiredDifferences: 5,
  reward: {
    archivePoints: 120,
    magnifiers: 0
  }
});

const thirdLevel = levelSchema.parse({
  id: "nr-03-scene03",
  chapterId: "northern-route",
  order: 3,
  titleKey: "levels.nr03.title",
  imageA: "/assets/scenes/northern-route/3/1.webp",
  imageB: "/assets/scenes/northern-route/3/2.webp",
  thumbnail: "/assets/scenes/northern-route/3/1.webp",
  differences: [
    {
      id: "lens-rotation-3",
      hitAreaA: { kind: "circle", cx: 0.357, cy: 0.323, radius: 0.135 },
      hitAreaB: { kind: "circle", cx: 0.357, cy: 0.323, radius: 0.135 },
      hintArea: { kind: "circle", cx: 0.357, cy: 0.323, radius: 0.18 },
      difficulty: 1
    },
    {
      id: "open-window-3",
      hitAreaA: { kind: "circle", cx: 0.677, cy: 0.258, radius: 0.078 },
      hitAreaB: { kind: "circle", cx: 0.677, cy: 0.258, radius: 0.078 },
      hintArea: { kind: "circle", cx: 0.677, cy: 0.258, radius: 0.11 },
      difficulty: 1
    },
    {
      id: "lantern-count-3",
      hitAreaA: { kind: "circle", cx: 0.877, cy: 0.376, radius: 0.07 },
      hitAreaB: { kind: "circle", cx: 0.877, cy: 0.376, radius: 0.07 },
      hintArea: { kind: "circle", cx: 0.877, cy: 0.376, radius: 0.1 },
      difficulty: 1
    },
    {
      id: "map-route-3",
      hitAreaA: { kind: "circle", cx: 0.668, cy: 0.795, radius: 0.052 },
      hitAreaB: { kind: "circle", cx: 0.668, cy: 0.795, radius: 0.052 },
      hintArea: { kind: "circle", cx: 0.668, cy: 0.795, radius: 0.078 },
      difficulty: 1
    },
    {
      id: "compass-removed-3",
      hitAreaA: { kind: "circle", cx: 0.881, cy: 0.771, radius: 0.072 },
      hitAreaB: { kind: "circle", cx: 0.881, cy: 0.771, radius: 0.072 },
      hintArea: { kind: "circle", cx: 0.881, cy: 0.771, radius: 0.1 },
      difficulty: 1
    }
  ],
  requiredDifferences: 5,
  reward: {
    archivePoints: 130,
    magnifiers: 1,
    artifactId: "brass-compass"
  }
});

const fourthLevel = levelSchema.parse({
  id: "nr-04-scene04",
  chapterId: "northern-route",
  order: 4,
  titleKey: "levels.nr04.title",
  imageA: "/assets/scenes/northern-route/4/1.webp",
  imageB: "/assets/scenes/northern-route/4/2.webp",
  thumbnail: "/assets/scenes/northern-route/4/1.webp",
  differences: [
    {
      id: "switch-position-4",
      hitAreaA: { kind: "circle", cx: 0.322, cy: 0.809, radius: 0.13 },
      hitAreaB: { kind: "circle", cx: 0.322, cy: 0.809, radius: 0.13 },
      hintArea: { kind: "circle", cx: 0.322, cy: 0.809, radius: 0.18 },
      difficulty: 1
    },
    {
      id: "train-door-4",
      hitAreaA: { kind: "circle", cx: 0.346, cy: 0.358, radius: 0.065 },
      hitAreaB: { kind: "circle", cx: 0.346, cy: 0.358, radius: 0.065 },
      hintArea: { kind: "circle", cx: 0.346, cy: 0.358, radius: 0.09 },
      difficulty: 1
    },
    {
      id: "barrel-count-4",
      hitAreaA: { kind: "circle", cx: 0.516, cy: 0.524, radius: 0.08 },
      hitAreaB: { kind: "circle", cx: 0.516, cy: 0.524, radius: 0.08 },
      hintArea: { kind: "circle", cx: 0.516, cy: 0.524, radius: 0.11 },
      difficulty: 1
    },
    {
      id: "cart-moved-4",
      hitAreaA: { kind: "circle", cx: 0.701, cy: 0.567, radius: 0.065 },
      hitAreaB: { kind: "circle", cx: 0.613, cy: 0.585, radius: 0.065 },
      hintArea: { kind: "circle", cx: 0.657, cy: 0.576, radius: 0.12 },
      difficulty: 1
    },
    {
      id: "lantern-color-4",
      hitAreaA: { kind: "circle", cx: 0.934, cy: 0.354, radius: 0.04 },
      hitAreaB: { kind: "circle", cx: 0.934, cy: 0.354, radius: 0.04 },
      hintArea: { kind: "circle", cx: 0.934, cy: 0.354, radius: 0.06 },
      difficulty: 1
    },
    {
      id: "fur-gloves-4",
      hitAreaA: { kind: "circle", cx: 0.901, cy: 0.645, radius: 0.05 },
      hitAreaB: { kind: "circle", cx: 0.901, cy: 0.645, radius: 0.05 },
      hintArea: { kind: "circle", cx: 0.901, cy: 0.645, radius: 0.075 },
      difficulty: 1
    }
  ],
  requiredDifferences: 6,
  reward: {
    archivePoints: 140,
    magnifiers: 0
  }
});

const thirteenthLevel = levelSchema.parse({
  id: "nr-13-scene13",
  chapterId: "northern-route",
  order: 13,
  titleKey: "levels.nr13.title",
  imageA: "/assets/scenes/northern-route/13/1.webp",
  imageB: "/assets/scenes/northern-route/13/2.webp",
  thumbnail: "/assets/scenes/northern-route/13/1.webp",
  differences: [
    {
      id: "tent-opening-13",
      hitAreaA: { kind: "circle", cx: 0.226, cy: 0.39, radius: 0.065 },
      hitAreaB: { kind: "circle", cx: 0.226, cy: 0.39, radius: 0.065 },
      hintArea: { kind: "circle", cx: 0.226, cy: 0.39, radius: 0.095 },
      difficulty: 3
    },
    {
      id: "survey-device-13",
      hitAreaA: { kind: "circle", cx: 0.333, cy: 0.307, radius: 0.045 },
      hitAreaB: { kind: "circle", cx: 0.333, cy: 0.307, radius: 0.045 },
      hintArea: { kind: "circle", cx: 0.333, cy: 0.307, radius: 0.07 },
      difficulty: 3
    },
    {
      id: "mug-13",
      hitAreaA: { kind: "circle", cx: 0.141, cy: 0.56, radius: 0.038 },
      hitAreaB: { kind: "circle", cx: 0.141, cy: 0.56, radius: 0.038 },
      hintArea: { kind: "circle", cx: 0.141, cy: 0.56, radius: 0.06 },
      difficulty: 3
    },
    {
      id: "rope-coil-13",
      hitAreaA: { kind: "circle", cx: 0.286, cy: 0.708, radius: 0.08 },
      hitAreaB: { kind: "circle", cx: 0.286, cy: 0.708, radius: 0.08 },
      hintArea: { kind: "circle", cx: 0.286, cy: 0.708, radius: 0.115 },
      difficulty: 3
    },
    {
      id: "red-tarp-13",
      hitAreaA: { kind: "circle", cx: 0.31, cy: 0.875, radius: 0.12 },
      hitAreaB: { kind: "circle", cx: 0.31, cy: 0.875, radius: 0.12 },
      hintArea: { kind: "circle", cx: 0.31, cy: 0.875, radius: 0.16 },
      difficulty: 3
    },
    {
      id: "rope-marker-13",
      hitAreaA: { kind: "circle", cx: 0.475, cy: 0.62, radius: 0.06 },
      hitAreaB: { kind: "circle", cx: 0.475, cy: 0.62, radius: 0.06 },
      hintArea: { kind: "circle", cx: 0.475, cy: 0.62, radius: 0.09 },
      difficulty: 3
    },
    {
      id: "striped-post-13",
      hitAreaA: { kind: "circle", cx: 0.595, cy: 0.669, radius: 0.07 },
      hitAreaB: { kind: "circle", cx: 0.595, cy: 0.669, radius: 0.07 },
      hintArea: { kind: "circle", cx: 0.595, cy: 0.669, radius: 0.1 },
      difficulty: 3
    },
    {
      id: "bridge-planks-13",
      hitAreaA: { kind: "circle", cx: 0.783, cy: 0.521, radius: 0.125 },
      hitAreaB: { kind: "circle", cx: 0.783, cy: 0.521, radius: 0.125 },
      hintArea: { kind: "circle", cx: 0.783, cy: 0.521, radius: 0.17 },
      difficulty: 3
    }
  ],
  requiredDifferences: 8,
  reward: {
    archivePoints: 230,
    magnifiers: 0
  }
});

const authoredLevels: Partial<Record<number, LevelDefinition>> = {
  1: firstLevel,
  2: secondLevel,
  3: thirdLevel,
  4: fourthLevel,
  13: thirteenthLevel
};

function makeLevel(order: number): LevelDefinition {
  const authoredLevel = authoredLevels[order];
  if (authoredLevel) return authoredLevel;

  const slug = titles[order - 1];
  const id = `nr-${String(order).padStart(2, "0")}-${slug.replace("nr", "scene")}`;
  const differences = baseDifferences.slice(0, counts[order - 1]).map((diff, index) => ({
    id: `${diff.id}-${order}`,
    hitAreaA: { kind: "circle" as const, cx: diff.x, cy: diff.y, radius: index < 4 ? 0.045 : 0.035 },
    hitAreaB: {
      kind: "circle" as const,
      cx: index === 3 ? Math.min(diff.x + 0.07, 0.95) : diff.x,
      cy: diff.y,
      radius: index < 4 ? 0.045 : 0.035
    },
    hintArea: { kind: "circle" as const, cx: diff.x, cy: diff.y, radius: 0.11 },
    difficulty: (order < 5 ? 1 : order < 10 ? 2 : 3) as 1 | 2 | 3
  }));

  return levelSchema.parse({
    id,
    chapterId: "northern-route",
    order,
    titleKey: `levels.${slug}.title`,
    imageA: `/assets/scenes/northern-route/${order}/1.webp`,
    imageB: `/assets/scenes/northern-route/${order}/2.webp`,
    thumbnail: `/assets/scenes/northern-route/${order}/1.webp`,
    differences,
    requiredDifferences: counts[order - 1],
    reward: {
      archivePoints: 100 + order * 10,
      magnifiers: order % 3 === 0 ? 1 : 0,
      artifactId: artifactByOrder[order]
    }
  });
}

export const levels = Array.from({ length: 13 }, (_, index) => makeLevel(index + 1));

export const dailyLevels = [
  { id: "daily-icebreaker-cabin", titleKey: "Daily: icebreaker cabin", levelId: levels[2].id },
  { id: "daily-cartographer-room", titleKey: "Daily: cartographer room", levelId: levels[5].id },
  { id: "daily-weather-platform", titleKey: "Daily: weather platform", levelId: levels[9].id }
];
