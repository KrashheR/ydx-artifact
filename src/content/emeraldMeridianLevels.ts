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
      { id: "flag-ribbon", shape: { kind: "circle", cx: 0.814, cy: 0.105, r: 0.05 } },
      { id: "boat-awning", shape: { kind: "ellipse", cx: 0.315, cy: 0.362, rx: 0.092, ry: 0.083 } },
      { id: "fuel-barrel", shape: { kind: "circle", cx: 0.172, cy: 0.54, r: 0.052 } },
      { id: "oil-drum", shape: { kind: "circle", cx: 0.805, cy: 0.455, r: 0.053 } },
      { id: "left-jar", shape: { kind: "ellipse", cx: 0.7, cy: 0.585, rx: 0.03, ry: 0.055 } },
      { id: "right-jar", shape: { kind: "ellipse", cx: 0.742, cy: 0.59, rx: 0.03, ry: 0.055 } },
      { id: "river-map", shape: { kind: "ellipse", cx: 0.6278, cy: 0.6337, rx: 0.0744, ry: 0.0747 } },
      { id: "sample-kit", shape: { kind: "ellipse", cx: 0.4547, cy: 0.7275, rx: 0.087, ry: 0.1057 } },
      { id: "bottle-crate", shape: { kind: "ellipse", cx: 0.5766, cy: 0.832, rx: 0.09, ry: 0.1044 } },
      { id: "water-pump", shape: { kind: "ellipse", cx: 0.8385, cy: 0.8477, rx: 0.062, ry: 0.1257 } }
    ],
  // ── Level 2: em-02-radio-station (9) ─────────────────────────────────────
  [
      { id: "antenna-top", shape: { kind: "circle", cx: 0.221, cy: 0.07, r: 0.042 } },
      { id: "roof-board", shape: { kind: "circle", cx: 0.354, cy: 0.295, r: 0.042 } },
      { id: "hanging-tube", shape: { kind: "circle", cx: 0.692, cy: 0.407, r: 0.042 } },
      { id: "window-foliage", shape: { kind: "circle", cx: 0.816, cy: 0.408, r: 0.05 } },
      { id: "radio-dial", shape: { kind: "circle", cx: 0.528, cy: 0.535, r: 0.0347 } },
      { id: "desk-fan", shape: { kind: "circle", cx: 0.622, cy: 0.503, r: 0.045 } },
      { id: "battery-cables", shape: { kind: "circle", cx: 0.569, cy: 0.714, r: 0.042 } },
      { id: "small-bottle", shape: { kind: "circle", cx: 0.804, cy: 0.681, r: 0.036 } },
      { id: "fallen-log", shape: { kind: "ellipse", cx: 0.1872, cy: 0.8082, rx: 0.1408, ry: 0.0933 } }
    ],
  // ── Level 3: em-03-botanical-camp (9) ────────────────────────────────────
  [
      { id: "hanging-leaves", shape: { kind: "circle", cx: 0.461, cy: 0.275, r: 0.045 } },
      { id: "microscope-case", shape: { kind: "ellipse", cx: 0.0894, cy: 0.3623, rx: 0.09, ry: 0.1361 } },
      { id: "glass-cylinder", shape: { kind: "ellipse", cx: 0.933, cy: 0.392, rx: 0.05, ry: 0.108 } },
      { id: "colored-bottles", shape: { kind: "ellipse", cx: 0.677, cy: 0.545, rx: 0.08, ry: 0.1363 } },
      { id: "specimen-row", shape: { kind: "ellipse", cx: 0.386, cy: 0.616, rx: 0.215, ry: 0.105 } },
      { id: "flower-jar", shape: { kind: "ellipse", cx: 0.46, cy: 0.62, rx: 0.028, ry: 0.07 } },
      { id: "survey-map", shape: { kind: "ellipse", cx: 0.38, cy: 0.767, rx: 0.175, ry: 0.05 } },
      { id: "herbarium-box", shape: { kind: "ellipse", cx: 0.8302, cy: 0.6849, rx: 0.0993, ry: 0.1081 } },
      { id: "field-boots", shape: { kind: "ellipse", cx: 0.5154, cy: 0.9131, rx: 0.0802, ry: 0.098 } }
    ],
  // ── Level 4: em-04-flooded-bridge (10) ───────────────────────────────────
  [
      { id: "rope-end", shape: { kind: "circle", cx: 0.241, cy: 0.208, r: 0.036 } },
      { id: "carabiner", shape: { kind: "circle", cx: 0.4, cy: 0.36, r: 0.045 } },
      { id: "pelican-case", shape: { kind: "circle", cx: 0.2405, cy: 0.6527, r: 0.075 } },
      { id: "bolt-cutters", shape: { kind: "circle", cx: 0.1729, cy: 0.8182, r: 0.05 } },
      { id: "bridge-planks", shape: { kind: "circle", cx: 0.69, cy: 0.585, r: 0.078 } },
      { id: "rope-knot", shape: { kind: "circle", cx: 0.5324, cy: 0.705, r: 0.055 } },
      { id: "ladder-foot", shape: { kind: "circle", cx: 0.6962, cy: 0.7324, r: 0.046 } },
      { id: "boot-print", shape: { kind: "circle", cx: 0.4132, cy: 0.8613, r: 0.0805 } },
      { id: "orange-bag", shape: { kind: "ellipse", cx: 0.8002, cy: 0.8607, rx: 0.105, ry: 0.1368 } },
      { id: "right-edge", shape: { kind: "circle", cx: 0.9188, cy: 0.7512, r: 0.04 } }
    ],
  // ── Level 5: em-05-stone-terraces (7) ────────────────────────────────────
  [
      { id: "top-foliage", shape: { kind: "circle", cx: 0.163, cy: 0.125, r: 0.053 } },
      { id: "survey-line", shape: { kind: "ellipse", cx: 0.4814, cy: 0.1726, rx: 0.1423, ry: 0.0783 } },
      { id: "stone-cylinder", shape: { kind: "circle", cx: 0.2753, cy: 0.3717, r: 0.09 } },
      { id: "glyph-block", shape: { kind: "circle", cx: 0.5, cy: 0.415, r: 0.08 } },
      { id: "water-wheel", shape: { kind: "circle", cx: 0.731, cy: 0.5777, r: 0.085 } },
      { id: "stone-step", shape: { kind: "circle", cx: 0.245, cy: 0.735, r: 0.072 } },
      { id: "water-pool", shape: { kind: "ellipse", cx: 0.7734, cy: 0.8506, rx: 0.13, ry: 0.1156 } }
    ],
  // ── Level 6: em-06-stilt-village (9) ─────────────────────────────────────
  [
      { id: "window-shutter", shape: { kind: "circle", cx: 0.2038, cy: 0.1986, r: 0.0673 } },
      { id: "map-board", shape: { kind: "circle", cx: 0.5095, cy: 0.385, r: 0.07 } },
      { id: "hut-basket", shape: { kind: "ellipse", cx: 0.6775, cy: 0.3845, rx: 0.0568, ry: 0.1494 } },
      { id: "hammock", shape: { kind: "ellipse", cx: 0.7906, cy: 0.3973, rx: 0.055, ry: 0.07 } },
      { id: "red-basket", shape: { kind: "circle", cx: 0.1956, cy: 0.5865, r: 0.05 } },
      { id: "water-buoys", shape: { kind: "ellipse", cx: 0.8668, cy: 0.6057, rx: 0.1378, ry: 0.1367 } },
      { id: "oar", shape: { kind: "circle", cx: 0.1196, cy: 0.7901, r: 0.065 } },
      { id: "first-aid-box", shape: { kind: "circle", cx: 0.27, cy: 0.835, r: 0.065 } },
      { id: "deck-jar", shape: { kind: "circle", cx: 0.4084, cy: 0.9011, r: 0.05 } }
    ],
  // ── Level 7: em-07-three-stream-waterfall (9) ────────────────────────────
  [
      { id: "cliff-log", shape: { kind: "circle", cx: 0.3995, cy: 0.2414, r: 0.072 } },
      { id: "twin-waterfall", shape: { kind: "circle", cx: 0.7213, cy: 0.1929, r: 0.0754 } },
      { id: "temple-doorway", shape: { kind: "circle", cx: 0.7553, cy: 0.4554, r: 0.065 } },
      { id: "stone-steps", shape: { kind: "circle", cx: 0.9015, cy: 0.4694, r: 0.0633 } },
      { id: "carved-stone", shape: { kind: "circle", cx: 0.1726, cy: 0.6077, r: 0.09 } },
      { id: "tripod", shape: { kind: "ellipse", cx: 0.6068, cy: 0.6663, rx: 0.0778, ry: 0.1429 } },
      { id: "coiled-rope", shape: { kind: "ellipse", cx: 0.41, cy: 0.835, rx: 0.1, ry: 0.1273 } },
      { id: "raft", shape: { kind: "ellipse", cx: 0.8188, cy: 0.7488, rx: 0.105, ry: 0.1254 } },
      { id: "stone-block", shape: { kind: "circle", cx: 0.6868, cy: 0.8968, r: 0.0777 } }
    ],
  // ── Level 8: em-08-temple-of-roots (11) ──────────────────────────────────
  [
      { id: "relief-panel", shape: { kind: "circle", cx: 0.37, cy: 0.315, r: 0.0617 } },
      { id: "bird-glyph", shape: { kind: "circle", cx: 0.5267, cy: 0.3276, r: 0.05 } },
      { id: "dark-doorway", shape: { kind: "ellipse", cx: 0.7655, cy: 0.3825, rx: 0.065, ry: 0.105 } },
      { id: "flashlight", shape: { kind: "circle", cx: 0.6013, cy: 0.531, r: 0.0582 } },
      { id: "water-trickle", shape: { kind: "ellipse", cx: 0.4575, cy: 0.6018, rx: 0.052, ry: 0.072 } },
      { id: "stone-well", shape: { kind: "ellipse", cx: 0.7388, cy: 0.6668, rx: 0.0831, ry: 0.065 } },
      { id: "compass", shape: { kind: "circle", cx: 0.155, cy: 0.85, r: 0.058 } },
      { id: "paint-brush", shape: { kind: "circle", cx: 0.315, cy: 0.85, r: 0.06 } },
      { id: "floor-crack", shape: { kind: "circle", cx: 0.4893, cy: 0.7911, r: 0.052 } },
      { id: "lantern", shape: { kind: "circle", cx: 0.7035, cy: 0.8228, r: 0.055 } },
      { id: "incense-sticks", shape: { kind: "circle", cx: 0.8262, cy: 0.8998, r: 0.05 } }
    ],
  // ── Level 9: em-09-underground-reservoir (9) ─────────────────────────────
  [
      { id: "shrine-niche", shape: { kind: "circle", cx: 0.7811, cy: 0.1825, r: 0.065 } },
      { id: "pool-surface", shape: { kind: "circle", cx: 0.6401, cy: 0.3837, r: 0.06 } },
      { id: "water-plants", shape: { kind: "circle", cx: 0.4196, cy: 0.5212, r: 0.07 } },
      { id: "wall-sluice", shape: { kind: "circle", cx: 0.736, cy: 0.5795, r: 0.07 } },
      { id: "waterfall-left", shape: { kind: "circle", cx: 0.1525, cy: 0.6499, r: 0.06 } },
      { id: "pebble-wall", shape: { kind: "circle", cx: 0.3697, cy: 0.7584, r: 0.06 } },
      { id: "lower-pool", shape: { kind: "circle", cx: 0.1935, cy: 0.8643, r: 0.06 } },
      { id: "glass-jar", shape: { kind: "circle", cx: 0.6038, cy: 0.8428, r: 0.0687 } },
      { id: "brass-cylinder", shape: { kind: "circle", cx: 0.9033, cy: 0.6606, r: 0.1022 } }
    ],
  // ── Level 10: em-10-canopy-observatory (10) ──────────────────────────────
  [
      { id: "pergola-beam", shape: { kind: "circle", cx: 0.3522, cy: 0.0684, r: 0.0491 } },
      { id: "crater-lake", shape: { kind: "ellipse", cx: 0.5645, cy: 0.238, rx: 0.08, ry: 0.055 } },
      { id: "gnomon-top", shape: { kind: "circle", cx: 0.4957, cy: 0.34, r: 0.048 } },
      { id: "left-post", shape: { kind: "circle", cx: 0.0957, cy: 0.3456, r: 0.048 } },
      { id: "telescope", shape: { kind: "circle", cx: 0.1947, cy: 0.4286, r: 0.078 } },
      { id: "right-post", shape: { kind: "circle", cx: 0.9025, cy: 0.3833, r: 0.048 } },
      { id: "gnomon-mid", shape: { kind: "circle", cx: 0.5001, cy: 0.5783, r: 0.048 } },
      { id: "gnomon-lower", shape: { kind: "ellipse", cx: 0.4999, cy: 0.742, rx: 0.033, ry: 0.085 } },
      { id: "compass-rose", shape: { kind: "circle", cx: 0.455, cy: 0.85, r: 0.065 } },
      { id: "water-dish", shape: { kind: "circle", cx: 0.6271, cy: 0.8717, r: 0.068 } }
    ],
  // ── Level 11: em-11-green-valley (9) ─────────────────────────────────────
  [
      { id: "camp-flag", shape: { kind: "circle", cx: 0.6585, cy: 0.1524, r: 0.045 } },
      { id: "pipe-spout", shape: { kind: "circle", cx: 0.4655, cy: 0.4463, r: 0.05 } },
      { id: "blue-plants", shape: { kind: "circle", cx: 0.1593, cy: 0.5806, r: 0.0714 } },
      { id: "stone-weir", shape: { kind: "ellipse", cx: 0.55, cy: 0.58, rx: 0.105, ry: 0.105 } },
      { id: "glass-terrarium", shape: { kind: "ellipse", cx: 0.8828, cy: 0.5823, rx: 0.1, ry: 0.1193 } },
      { id: "cable-reel", shape: { kind: "circle", cx: 0.4618, cy: 0.7333, r: 0.075 } },
      { id: "blue-flower", shape: { kind: "circle", cx: 0.2922, cy: 0.829, r: 0.0696 } },
      { id: "core-samples", shape: { kind: "ellipse", cx: 0.6009, cy: 0.877, rx: 0.135, ry: 0.095 } },
      { id: "lab-case", shape: { kind: "ellipse", cx: 0.8226, cy: 0.8394, rx: 0.0947, ry: 0.1396 } }
    ],
  // ── Level 12: em-12-geological-station (9) ───────────────────────────────
  [
      { id: "drill-head", shape: { kind: "circle", cx: 0.2235, cy: 0.1558, r: 0.0643 } },
      { id: "theodolite", shape: { kind: "ellipse", cx: 0.5026, cy: 0.3236, rx: 0.055, ry: 0.095 } },
      { id: "muddy-track", shape: { kind: "ellipse", cx: 0.5678, cy: 0.4442, rx: 0.0706, ry: 0.06 } },
      { id: "glass-bottle", shape: { kind: "circle", cx: 0.7401, cy: 0.4852, r: 0.05 } },
      { id: "drill-bits", shape: { kind: "ellipse", cx: 0.345, cy: 0.62, rx: 0.1003, ry: 0.085 } },
      { id: "core-box", shape: { kind: "ellipse", cx: 0.22, cy: 0.815, rx: 0.0946, ry: 0.075 } },
      { id: "drill-pipes", shape: { kind: "ellipse", cx: 0.5575, cy: 0.8302, rx: 0.155, ry: 0.105 } },
      { id: "hose-coupling", shape: { kind: "ellipse", cx: 0.7014, cy: 0.7108, rx: 0.07, ry: 0.0703 } },
      { id: "cable-end", shape: { kind: "circle", cx: 0.7979, cy: 0.8623, r: 0.055 } }
    ],
  // ── Level 13: em-13-evacuation-airstrip (9) ──────────────────────────────
  [
      { id: "radio-set", shape: { kind: "circle", cx: 0.1533, cy: 0.4005, r: 0.07 } },
      { id: "supply-crates", shape: { kind: "ellipse", cx: 0.2017, cy: 0.5397, rx: 0.12, ry: 0.095 } },
      { id: "terrarium", shape: { kind: "ellipse", cx: 0.1213, cy: 0.6591, rx: 0.105, ry: 0.1298 } },
      { id: "runway-patch", shape: { kind: "ellipse", cx: 0.5617, cy: 0.4472, rx: 0.075, ry: 0.06 } },
      { id: "bush-plane", shape: { kind: "ellipse", cx: 0.8206, cy: 0.3923, rx: 0.1191, ry: 0.085 } },
      { id: "ground-hose", shape: { kind: "ellipse", cx: 0.6386, cy: 0.5748, rx: 0.095, ry: 0.065 } },
      { id: "map-laptop", shape: { kind: "circle", cx: 0.305, cy: 0.785, r: 0.095 } },
      { id: "campfire", shape: { kind: "circle", cx: 0.5, cy: 0.755, r: 0.092 } },
      { id: "empty-patch", shape: { kind: "circle", cx: 0.704, cy: 0.792, r: 0.1047 } }
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
