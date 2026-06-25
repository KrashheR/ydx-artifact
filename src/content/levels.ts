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
  "nr12"
] as const;

const counts = [4, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8];
const artifactByOrder: Record<number, string> = {
  3: "brass-compass",
  6: "field-radio",
  9: "blue-flower",
  12: "torn-map"
};

function makeLevel(order: number): LevelDefinition {
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
    imageA: "/assets/scenes/northern-route/placeholder/a.svg",
    imageB: "/assets/scenes/northern-route/placeholder/b.svg",
    thumbnail: "/assets/scenes/northern-route/placeholder/thumb.svg",
    differences,
    requiredDifferences: counts[order - 1],
    reward: {
      archivePoints: 100 + order * 10,
      magnifiers: order % 3 === 0 ? 1 : 0,
      artifactId: artifactByOrder[order]
    }
  });
}

export const levels = Array.from({ length: 12 }, (_, index) => makeLevel(index + 1));

export const dailyLevels = [
  { id: "daily-icebreaker-cabin", titleKey: "Daily: icebreaker cabin", levelId: levels[2].id },
  { id: "daily-cartographer-room", titleKey: "Daily: cartographer room", levelId: levels[5].id },
  { id: "daily-weather-platform", titleKey: "Daily: weather platform", levelId: levels[9].id }
];
