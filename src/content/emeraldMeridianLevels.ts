import { levelSchema, type LevelDefinition } from "../entities/level/schema";

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

type CircleSpec  = { kind: "circle";  cx: number; cy: number; r: number };
type EllipseSpec = { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number };
type ShapeSpec   = CircleSpec | EllipseSpec;

interface DiffSpec { id: string; shape: ShapeSpec }

function makeDiff(spec: DiffSpec, difficulty: 1 | 2 | 3) {
  const { shape } = spec;
  const hitArea =
    shape.kind === "circle"
      ? { kind: "circle"  as const, cx: shape.cx, cy: shape.cy, radius: shape.r }
      : { kind: "ellipse" as const, cx: shape.cx, cy: shape.cy, rx: shape.rx, ry: shape.ry };
  const hintArea =
    shape.kind === "circle"
      ? { kind: "circle"  as const, cx: shape.cx, cy: shape.cy, radius: shape.r + 0.04 }
      : { kind: "ellipse" as const, cx: shape.cx, cy: shape.cy, rx: shape.rx + 0.035, ry: shape.ry + 0.035 };
  return { id: spec.id, hitAreaA: hitArea, hitAreaB: hitArea, hintArea, difficulty };
}

// Every hit area corresponds 1:1 to a ring drawn on the level's annotation
// image (3.webp). The game is find-ALL: requiredDifferences equals the number
// of entries here (see makeLevel), so all rings must be found to pass.
const perLevelDiffs: DiffSpec[][] = [
  // ── Level 1: em-01-river-landing (10) ────────────────────────────────────
  [
    { id: "flag-ribbon",  shape: { kind: "circle",  cx: 0.814, cy: 0.105, r: 0.05 } },
    { id: "boat-awning",  shape: { kind: "ellipse", cx: 0.315, cy: 0.362, rx: 0.092, ry: 0.083 } },
    { id: "fuel-barrel",  shape: { kind: "circle",  cx: 0.172, cy: 0.54, r: 0.052 } },
    { id: "oil-drum",     shape: { kind: "circle",  cx: 0.805, cy: 0.455, r: 0.053 } },
    { id: "left-jar",     shape: { kind: "ellipse", cx: 0.700, cy: 0.585, rx: 0.03, ry: 0.055 } },
    { id: "right-jar",    shape: { kind: "ellipse", cx: 0.742, cy: 0.590, rx: 0.03, ry: 0.055 } },
    { id: "river-map",    shape: { kind: "ellipse", cx: 0.605, cy: 0.617, rx: 0.085, ry: 0.058 } },
    { id: "sample-kit",   shape: { kind: "ellipse", cx: 0.45, cy: 0.71, rx: 0.087, ry: 0.083 } },
    { id: "bottle-crate", shape: { kind: "ellipse", cx: 0.575, cy: 0.815, rx: 0.09, ry: 0.087 } },
    { id: "water-pump",   shape: { kind: "ellipse", cx: 0.842, cy: 0.82, rx: 0.062, ry: 0.09 } },
  ],
  // ── Level 2: em-02-radio-station (9) ─────────────────────────────────────
  [
    { id: "antenna-top",    shape: { kind: "circle",  cx: 0.221, cy: 0.07, r: 0.042 } },
    { id: "roof-board",     shape: { kind: "circle",  cx: 0.354, cy: 0.295, r: 0.042 } },
    { id: "hanging-tube",   shape: { kind: "circle",  cx: 0.692, cy: 0.407, r: 0.042 } },
    { id: "window-foliage", shape: { kind: "circle",  cx: 0.816, cy: 0.408, r: 0.05 } },
    { id: "radio-dial",     shape: { kind: "circle",  cx: 0.528, cy: 0.535, r: 0.04 } },
    { id: "desk-fan",       shape: { kind: "circle",  cx: 0.622, cy: 0.503, r: 0.045 } },
    { id: "battery-cables", shape: { kind: "circle",  cx: 0.569, cy: 0.714, r: 0.042 } },
    { id: "small-bottle",   shape: { kind: "circle",  cx: 0.804, cy: 0.681, r: 0.036 } },
    { id: "fallen-log",     shape: { kind: "ellipse", cx: 0.185, cy: 0.79, rx: 0.128, ry: 0.073 } },
  ],
  // ── Level 3: em-03-botanical-camp (9) ────────────────────────────────────
  [
    { id: "hanging-leaves",  shape: { kind: "circle",  cx: 0.461, cy: 0.275, r: 0.045 } },
    { id: "microscope-case", shape: { kind: "ellipse", cx: 0.085, cy: 0.36, rx: 0.10, ry: 0.088 } },
    { id: "glass-cylinder",  shape: { kind: "ellipse", cx: 0.933, cy: 0.392, rx: 0.05, ry: 0.108 } },
    { id: "colored-bottles", shape: { kind: "circle",  cx: 0.677, cy: 0.545, r: 0.075 } },
    { id: "specimen-row",    shape: { kind: "ellipse", cx: 0.386, cy: 0.616, rx: 0.215, ry: 0.105 } },
    { id: "flower-jar",      shape: { kind: "ellipse", cx: 0.46, cy: 0.62, rx: 0.028, ry: 0.07 } },
    { id: "survey-map",      shape: { kind: "ellipse", cx: 0.380, cy: 0.767, rx: 0.175, ry: 0.05 } },
    { id: "herbarium-box",   shape: { kind: "ellipse", cx: 0.833, cy: 0.685, rx: 0.09, ry: 0.10 } },
    { id: "field-boots",     shape: { kind: "ellipse", cx: 0.515, cy: 0.90, rx: 0.075, ry: 0.078 } },
  ],
  // ── Level 4: em-04-flooded-bridge (10) ───────────────────────────────────
  [
    { id: "rope-end",      shape: { kind: "circle",  cx: 0.241, cy: 0.208, r: 0.036 } },
    { id: "carabiner",     shape: { kind: "circle",  cx: 0.40, cy: 0.36, r: 0.045 } },
    { id: "pelican-case",  shape: { kind: "circle",  cx: 0.237, cy: 0.63, r: 0.075 } },
    { id: "bolt-cutters",  shape: { kind: "circle",  cx: 0.17, cy: 0.80, r: 0.05 } },
    { id: "bridge-planks", shape: { kind: "circle",  cx: 0.69, cy: 0.585, r: 0.078 } },
    { id: "rope-knot",     shape: { kind: "circle",  cx: 0.535, cy: 0.69, r: 0.055 } },
    { id: "ladder-foot",   shape: { kind: "circle",  cx: 0.707, cy: 0.712, r: 0.046 } },
    { id: "boot-print",    shape: { kind: "circle",  cx: 0.41, cy: 0.845, r: 0.07 } },
    { id: "orange-bag",    shape: { kind: "ellipse", cx: 0.805, cy: 0.835, rx: 0.105, ry: 0.095 } },
    { id: "right-edge",    shape: { kind: "circle",  cx: 0.95, cy: 0.72, r: 0.04 } },
  ],
  // ── Level 5: em-05-stone-terraces (7) ────────────────────────────────────
  [
    { id: "top-foliage",    shape: { kind: "circle",  cx: 0.163, cy: 0.125, r: 0.053 } },
    { id: "survey-line",    shape: { kind: "ellipse", cx: 0.49, cy: 0.185, rx: 0.13, ry: 0.06 } },
    { id: "stone-cylinder", shape: { kind: "circle",  cx: 0.27, cy: 0.37, r: 0.09 } },
    { id: "glyph-block",    shape: { kind: "circle",  cx: 0.50, cy: 0.415, r: 0.08 } },
    { id: "water-wheel",    shape: { kind: "circle",  cx: 0.74, cy: 0.55, r: 0.085 } },
    { id: "stone-step",     shape: { kind: "circle",  cx: 0.245, cy: 0.735, r: 0.072 } },
    { id: "water-pool",     shape: { kind: "ellipse", cx: 0.79, cy: 0.835, rx: 0.13, ry: 0.095 } },
  ],
  // ── Level 6: em-06-stilt-village (9) ─────────────────────────────────────
  [
    { id: "window-shutter", shape: { kind: "circle",  cx: 0.20, cy: 0.18, r: 0.055 } },
    { id: "map-board",      shape: { kind: "circle",  cx: 0.515, cy: 0.385, r: 0.07 } },
    { id: "hut-basket",     shape: { kind: "circle",  cx: 0.665, cy: 0.36, r: 0.045 } },
    { id: "hammock",        shape: { kind: "ellipse", cx: 0.795, cy: 0.37, rx: 0.055, ry: 0.07 } },
    { id: "red-basket",     shape: { kind: "circle",  cx: 0.20, cy: 0.58, r: 0.05 } },
    { id: "water-buoys",    shape: { kind: "ellipse", cx: 0.86, cy: 0.59, rx: 0.11, ry: 0.10 } },
    { id: "oar",            shape: { kind: "circle",  cx: 0.135, cy: 0.79, r: 0.065 } },
    { id: "first-aid-box",  shape: { kind: "circle",  cx: 0.27, cy: 0.835, r: 0.065 } },
    { id: "deck-jar",       shape: { kind: "circle",  cx: 0.41, cy: 0.87, r: 0.05 } },
  ],
  // ── Level 7: em-07-three-stream-waterfall (9) ────────────────────────────
  [
    { id: "cliff-log",      shape: { kind: "circle",  cx: 0.405, cy: 0.25, r: 0.072 } },
    { id: "twin-waterfall", shape: { kind: "circle",  cx: 0.715, cy: 0.205, r: 0.065 } },
    { id: "temple-doorway", shape: { kind: "circle",  cx: 0.745, cy: 0.47, r: 0.065 } },
    { id: "stone-steps",    shape: { kind: "circle",  cx: 0.91, cy: 0.465, r: 0.055 } },
    { id: "carved-stone",   shape: { kind: "circle",  cx: 0.175, cy: 0.59, r: 0.09 } },
    { id: "tripod",         shape: { kind: "ellipse", cx: 0.595, cy: 0.665, rx: 0.065, ry: 0.115 } },
    { id: "coiled-rope",    shape: { kind: "ellipse", cx: 0.41, cy: 0.835, rx: 0.10, ry: 0.095 } },
    { id: "raft",           shape: { kind: "ellipse", cx: 0.815, cy: 0.74, rx: 0.105, ry: 0.10 } },
    { id: "stone-block",    shape: { kind: "circle",  cx: 0.685, cy: 0.875, r: 0.06 } },
  ],
  // ── Level 8: em-08-temple-of-roots (11) ──────────────────────────────────
  [
    { id: "relief-panel",   shape: { kind: "circle",  cx: 0.37, cy: 0.315, r: 0.05 } },
    { id: "bird-glyph",     shape: { kind: "circle",  cx: 0.525, cy: 0.32, r: 0.05 } },
    { id: "dark-doorway",   shape: { kind: "ellipse", cx: 0.755, cy: 0.375, rx: 0.065, ry: 0.105 } },
    { id: "flashlight",     shape: { kind: "circle",  cx: 0.595, cy: 0.52, r: 0.05 } },
    { id: "water-trickle",  shape: { kind: "ellipse", cx: 0.45, cy: 0.585, rx: 0.052, ry: 0.072 } },
    { id: "stone-well",     shape: { kind: "ellipse", cx: 0.755, cy: 0.645, rx: 0.10, ry: 0.065 } },
    { id: "compass",        shape: { kind: "circle",  cx: 0.155, cy: 0.85, r: 0.058 } },
    { id: "paint-brush",    shape: { kind: "circle",  cx: 0.315, cy: 0.85, r: 0.06 } },
    { id: "floor-crack",    shape: { kind: "circle",  cx: 0.48, cy: 0.79, r: 0.052 } },
    { id: "lantern",        shape: { kind: "circle",  cx: 0.71, cy: 0.83, r: 0.055 } },
    { id: "incense-sticks", shape: { kind: "circle",  cx: 0.825, cy: 0.87, r: 0.05 } },
  ],
  // ── Level 9: em-09-underground-reservoir (9) ─────────────────────────────
  [
    { id: "shrine-niche",   shape: { kind: "circle", cx: 0.775, cy: 0.18, r: 0.065 } },
    { id: "pool-surface",   shape: { kind: "circle", cx: 0.635, cy: 0.37, r: 0.06 } },
    { id: "water-plants",   shape: { kind: "circle", cx: 0.43, cy: 0.52, r: 0.07 } },
    { id: "wall-sluice",    shape: { kind: "circle", cx: 0.72, cy: 0.565, r: 0.07 } },
    { id: "waterfall-left", shape: { kind: "circle", cx: 0.145, cy: 0.65, r: 0.06 } },
    { id: "pebble-wall",    shape: { kind: "circle", cx: 0.36, cy: 0.745, r: 0.06 } },
    { id: "lower-pool",     shape: { kind: "circle", cx: 0.185, cy: 0.835, r: 0.06 } },
    { id: "glass-jar",      shape: { kind: "circle", cx: 0.595, cy: 0.83, r: 0.065 } },
    { id: "brass-cylinder", shape: { kind: "circle", cx: 0.91, cy: 0.655, r: 0.085 } },
  ],
  // ── Level 10: em-10-canopy-observatory (10) ──────────────────────────────
  [
    { id: "pergola-beam", shape: { kind: "circle",  cx: 0.345, cy: 0.08, r: 0.045 } },
    { id: "crater-lake",  shape: { kind: "ellipse", cx: 0.555, cy: 0.235, rx: 0.08, ry: 0.055 } },
    { id: "gnomon-top",   shape: { kind: "circle",  cx: 0.495, cy: 0.36, r: 0.048 } },
    { id: "left-post",    shape: { kind: "circle",  cx: 0.095, cy: 0.365, r: 0.048 } },
    { id: "telescope",    shape: { kind: "circle",  cx: 0.205, cy: 0.43, r: 0.078 } },
    { id: "right-post",   shape: { kind: "circle",  cx: 0.905, cy: 0.37, r: 0.048 } },
    { id: "gnomon-mid",   shape: { kind: "circle",  cx: 0.495, cy: 0.555, r: 0.048 } },
    { id: "gnomon-lower", shape: { kind: "ellipse", cx: 0.49, cy: 0.745, rx: 0.033, ry: 0.085 } },
    { id: "compass-rose", shape: { kind: "circle",  cx: 0.455, cy: 0.85, r: 0.065 } },
    { id: "water-dish",   shape: { kind: "circle",  cx: 0.625, cy: 0.86, r: 0.068 } },
  ],
  // ── Level 11: em-11-green-valley (9) ─────────────────────────────────────
  [
    { id: "camp-flag",       shape: { kind: "circle",  cx: 0.665, cy: 0.145, r: 0.045 } },
    { id: "pipe-spout",      shape: { kind: "circle",  cx: 0.465, cy: 0.43, r: 0.05 } },
    { id: "blue-plants",     shape: { kind: "circle",  cx: 0.155, cy: 0.58, r: 0.085 } },
    { id: "stone-weir",      shape: { kind: "ellipse", cx: 0.55, cy: 0.58, rx: 0.105, ry: 0.105 } },
    { id: "glass-terrarium", shape: { kind: "ellipse", cx: 0.86, cy: 0.56, rx: 0.10, ry: 0.085 } },
    { id: "cable-reel",      shape: { kind: "circle",  cx: 0.46, cy: 0.69, r: 0.075 } },
    { id: "blue-flower",     shape: { kind: "circle",  cx: 0.285, cy: 0.81, r: 0.07 } },
    { id: "core-samples",    shape: { kind: "ellipse", cx: 0.585, cy: 0.83, rx: 0.135, ry: 0.095 } },
    { id: "lab-case",        shape: { kind: "ellipse", cx: 0.85, cy: 0.82, rx: 0.115, ry: 0.10 } },
  ],
  // ── Level 12: em-12-geological-station (9) ───────────────────────────────
  [
    { id: "drill-head",    shape: { kind: "circle",  cx: 0.215, cy: 0.145, r: 0.075 } },
    { id: "theodolite",    shape: { kind: "ellipse", cx: 0.505, cy: 0.31, rx: 0.055, ry: 0.095 } },
    { id: "muddy-track",   shape: { kind: "ellipse", cx: 0.565, cy: 0.43, rx: 0.08, ry: 0.06 } },
    { id: "glass-bottle",  shape: { kind: "circle",  cx: 0.745, cy: 0.45, r: 0.05 } },
    { id: "drill-bits",    shape: { kind: "ellipse", cx: 0.345, cy: 0.62, rx: 0.115, ry: 0.085 } },
    { id: "core-box",      shape: { kind: "ellipse", cx: 0.22, cy: 0.815, rx: 0.10, ry: 0.075 } },
    { id: "drill-pipes",   shape: { kind: "ellipse", cx: 0.555, cy: 0.81, rx: 0.155, ry: 0.105 } },
    { id: "hose-coupling", shape: { kind: "ellipse", cx: 0.705, cy: 0.71, rx: 0.07, ry: 0.05 } },
    { id: "cable-end",     shape: { kind: "circle",  cx: 0.785, cy: 0.825, r: 0.055 } },
  ],
  // ── Level 13: em-13-evacuation-airstrip (9) ──────────────────────────────
  [
    { id: "radio-set",     shape: { kind: "circle",  cx: 0.155, cy: 0.385, r: 0.07 } },
    { id: "supply-crates", shape: { kind: "ellipse", cx: 0.205, cy: 0.555, rx: 0.12, ry: 0.095 } },
    { id: "terrarium",     shape: { kind: "ellipse", cx: 0.165, cy: 0.65, rx: 0.105, ry: 0.09 } },
    { id: "runway-patch",  shape: { kind: "ellipse", cx: 0.575, cy: 0.43, rx: 0.075, ry: 0.06 } },
    { id: "bush-plane",    shape: { kind: "ellipse", cx: 0.85, cy: 0.415, rx: 0.095, ry: 0.085 } },
    { id: "ground-hose",   shape: { kind: "ellipse", cx: 0.645, cy: 0.565, rx: 0.095, ry: 0.065 } },
    { id: "map-laptop",    shape: { kind: "circle",  cx: 0.305, cy: 0.785, r: 0.095 } },
    { id: "campfire",      shape: { kind: "circle",  cx: 0.50, cy: 0.755, r: 0.092 } },
    { id: "empty-patch",   shape: { kind: "circle",  cx: 0.745, cy: 0.755, r: 0.095 } },
  ],
];

function getTitleKey(levelId: (typeof emeraldLevelIds)[number]) {
  return `levels.${levelId.slice(0, 5).replace("-", "")}.title`;
}

function makeLevel(levelId: (typeof emeraldLevelIds)[number], order: number): LevelDefinition {
  const difficulty = (order < 5 ? 1 : order < 10 ? 2 : 3) as 1 | 2 | 3;
  const differences = perLevelDiffs[order - 1].map(spec => makeDiff(spec, difficulty));

  return levelSchema.parse({
    id: levelId,
    chapterId: "emerald-meridian",
    order,
    titleKey: getTitleKey(levelId),
    imageA: `/assets/scenes/emerald-meridian/${order}/1.webp`,
    imageB: `/assets/scenes/emerald-meridian/${order}/2.webp`,
    thumbnail: `/assets/scenes/emerald-meridian/${order}/1.webp`,
    differences,
    requiredDifferences: perLevelDiffs[order - 1].length,
    reward: {
      archivePoints: 180 + order * 10,
      magnifiers: order % 3 === 0 ? 1 : 0
    }
  });
}

export const emeraldMeridianLevels = emeraldLevelIds.map((levelId, index) =>
  makeLevel(levelId, index + 1)
);
