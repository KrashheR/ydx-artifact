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
      { id: "flag-ribbon", shape: { kind: "circle", cx: 0.812, cy: 0.1147, r: 0.05 } },
      { id: "boat-awning", shape: { kind: "ellipse", cx: 0.2417, cy: 0.3724, rx: 0.1647, ry: 0.083 } },
      { id: "fuel-barrel", shape: { kind: "circle", cx: 0.172, cy: 0.54, r: 0.052 } },
      { id: "oil-drum", shape: { kind: "ellipse", cx: 0.7877, cy: 0.6389, rx: 0.0918, ry: 0.3648 } },
      { id: "left-jar", shape: { kind: "ellipse", cx: 0.7, cy: 0.585, rx: 0.03, ry: 0.055 } },
      { id: "right-jar", shape: { kind: "ellipse", cx: 0.7494, cy: 0.6044, rx: 0.03, ry: 0.055 } },
      { id: "river-map", shape: { kind: "ellipse", cx: 0.6278, cy: 0.6337, rx: 0.0744, ry: 0.0747 } },
      { id: "sample-kit", shape: { kind: "ellipse", cx: 0.4473, cy: 0.7588, rx: 0.087, ry: 0.1532 } },
      { id: "bottle-crate", shape: { kind: "ellipse", cx: 0.5766, cy: 0.832, rx: 0.09, ry: 0.1044 } },
      { id: "water-pump", shape: { kind: "ellipse", cx: 0.8385, cy: 0.8477, rx: 0.062, ry: 0.1257 } }
    ],
  // ── Level 2: em-02-radio-station (9) ─────────────────────────────────────
  [
      { id: "antenna-top", shape: { kind: "circle", cx: 0.2201, cy: 0.1055, r: 0.0693 } },
      { id: "roof-board", shape: { kind: "circle", cx: 0.354, cy: 0.295, r: 0.042 } },
      { id: "hanging-tube", shape: { kind: "circle", cx: 0.6939, cy: 0.4167, r: 0.042 } },
      { id: "window-foliage", shape: { kind: "circle", cx: 0.8284, cy: 0.4165, r: 0.0979 } },
      { id: "radio-dial", shape: { kind: "ellipse", cx: 0.5396, cy: 0.5466, rx: 0.0767, ry: 0.0844 } },
      { id: "desk-fan", shape: { kind: "circle", cx: 0.6292, cy: 0.4895, r: 0.045 } },
      { id: "battery-cables", shape: { kind: "circle", cx: 0.5506, cy: 0.7257, r: 0.049 } },
      { id: "small-bottle", shape: { kind: "ellipse", cx: 0.7348, cy: 0.7005, rx: 0.1028, ry: 0.0865 } },
      { id: "fallen-log", shape: { kind: "ellipse", cx: 0.1635, cy: 0.8004, rx: 0.1408, ry: 0.0933 } }
    ],
  // ── Level 3: em-03-botanical-camp (8) ────────────────────────────────────
  [
      { id: "microscope-case", shape: { kind: "ellipse", cx: 0.0894, cy: 0.3623, rx: 0.09, ry: 0.1361 } },
      { id: "glass-cylinder", shape: { kind: "ellipse", cx: 0.933, cy: 0.392, rx: 0.05, ry: 0.108 } },
      { id: "colored-bottles", shape: { kind: "ellipse", cx: 0.677, cy: 0.545, rx: 0.08, ry: 0.1363 } },
      { id: "specimen-row", shape: { kind: "ellipse", cx: 0.386, cy: 0.616, rx: 0.215, ry: 0.105 } },
      { id: "flower-jar", shape: { kind: "ellipse", cx: 0.2685, cy: 0.9338, rx: 0.0761, ry: 0.07 } },
      { id: "survey-map", shape: { kind: "ellipse", cx: 0.3787, cy: 0.7598, rx: 0.175, ry: 0.05 } },
      { id: "herbarium-box", shape: { kind: "ellipse", cx: 0.8209, cy: 0.6718, rx: 0.0963, ry: 0.1252 } },
      { id: "field-boots", shape: { kind: "ellipse", cx: 0.4752, cy: 0.9288, rx: 0.0797, ry: 0.098 } }
    ],
  // ── Level 4: em-04-flooded-bridge (7) ────────────────────────────────────
  [
      { id: "rope-end", shape: { kind: "ellipse", cx: 0.273, cy: 0.2196, rx: 0.0675, ry: 0.0865 } },
      { id: "pelican-case", shape: { kind: "circle", cx: 0.258, cy: 0.6799, r: 0.0888 } },
      { id: "bolt-cutters", shape: { kind: "circle", cx: 0.1729, cy: 0.8182, r: 0.05 } },
      { id: "bridge-planks", shape: { kind: "ellipse", cx: 0.6806, cy: 0.604, rx: 0.1404, ry: 0.1537 } },
      { id: "rope-knot", shape: { kind: "ellipse", cx: 0.5324, cy: 0.705, rx: 0.1761, ry: 0.1169 } },
      { id: "boot-print", shape: { kind: "circle", cx: 0.4132, cy: 0.8613, r: 0.0805 } },
      { id: "orange-bag", shape: { kind: "ellipse", cx: 0.8002, cy: 0.8607, rx: 0.105, ry: 0.1368 } }
    ],
  // ── Level 5: em-05-stone-terraces (5) ────────────────────────────────────
  [
      { id: "survey-line", shape: { kind: "ellipse", cx: 0.4814, cy: 0.1726, rx: 0.1423, ry: 0.0783 } },
      { id: "stone-cylinder", shape: { kind: "ellipse", cx: 0.256, cy: 0.3749, rx: 0.1694, ry: 0.1728 } },
      { id: "glyph-block", shape: { kind: "circle", cx: 0.5, cy: 0.415, r: 0.08 } },
      { id: "water-wheel", shape: { kind: "circle", cx: 0.731, cy: 0.5777, r: 0.085 } },
      { id: "water-pool", shape: { kind: "ellipse", cx: 0.7029, cy: 0.8891, rx: 0.3144, ry: 0.1787 } }
    ],
  // ── Level 6: em-06-stilt-village (9) ─────────────────────────────────────
  [
      { id: "window-shutter", shape: { kind: "circle", cx: 0.1667, cy: 0.23, r: 0.0889 } },
      { id: "map-board", shape: { kind: "circle", cx: 0.5095, cy: 0.385, r: 0.07 } },
      { id: "hut-basket", shape: { kind: "ellipse", cx: 0.6775, cy: 0.3845, rx: 0.0568, ry: 0.1494 } },
      { id: "hammock", shape: { kind: "ellipse", cx: 0.7906, cy: 0.3973, rx: 0.055, ry: 0.07 } },
      { id: "red-basket", shape: { kind: "circle", cx: 0.1956, cy: 0.5865, r: 0.05 } },
      { id: "water-buoys", shape: { kind: "ellipse", cx: 0.8668, cy: 0.6057, rx: 0.1378, ry: 0.1367 } },
      { id: "oar", shape: { kind: "ellipse", cx: 0.1269, cy: 0.8347, rx: 0.0768, ry: 0.2029 } },
      { id: "first-aid-box", shape: { kind: "circle", cx: 0.27, cy: 0.835, r: 0.065 } },
      { id: "deck-jar", shape: { kind: "circle", cx: 0.4084, cy: 0.9011, r: 0.05 } }
    ],
  // ── Level 7: em-07-three-stream-waterfall (9) ────────────────────────────
  [
      { id: "cliff-log", shape: { kind: "ellipse", cx: 0.3995, cy: 0.2414, rx: 0.1237, ry: 0.1441 } },
      { id: "twin-waterfall", shape: { kind: "ellipse", cx: 0.2267, cy: 0.9072, rx: 0.1206, ry: 0.1495 } },
      { id: "temple-doorway", shape: { kind: "circle", cx: 0.7553, cy: 0.4554, r: 0.065 } },
      { id: "stone-steps", shape: { kind: "ellipse", cx: 0.9015, cy: 0.4694, rx: 0.0683, ry: 0.208 } },
      { id: "carved-stone", shape: { kind: "circle", cx: 0.1726, cy: 0.6077, r: 0.09 } },
      { id: "tripod", shape: { kind: "ellipse", cx: 0.6031, cy: 0.6918, rx: 0.0778, ry: 0.1687 } },
      { id: "coiled-rope", shape: { kind: "ellipse", cx: 0.41, cy: 0.835, rx: 0.1, ry: 0.1273 } },
      { id: "raft", shape: { kind: "ellipse", cx: 0.8332, cy: 0.7912, rx: 0.158, ry: 0.1695 } },
      { id: "stone-block", shape: { kind: "circle", cx: 0.6868, cy: 0.8968, r: 0.0777 } }
    ],
  // ── Level 8: em-08-temple-of-roots (9) ───────────────────────────────────
  [
      { id: "relief-panel", shape: { kind: "ellipse", cx: 0.479, cy: 0.6133, rx: 0.0818, ry: 0.0977 } },
      { id: "dark-doorway", shape: { kind: "ellipse", cx: 0.7655, cy: 0.3825, rx: 0.065, ry: 0.1893 } },
      { id: "flashlight", shape: { kind: "circle", cx: 0.6084, cy: 0.5595, r: 0.0582 } },
      { id: "water-trickle", shape: { kind: "ellipse", cx: 0.4667, cy: 0.3734, rx: 0.0957, ry: 0.168 } },
      { id: "stone-well", shape: { kind: "ellipse", cx: 0.723, cy: 0.6857, rx: 0.0831, ry: 0.065 } },
      { id: "compass", shape: { kind: "circle", cx: 0.1585, cy: 0.8756, r: 0.0474 } },
      { id: "paint-brush", shape: { kind: "circle", cx: 0.3043, cy: 0.8253, r: 0.06 } },
      { id: "floor-crack", shape: { kind: "ellipse", cx: 0.4892, cy: 0.8287, rx: 0.057, ry: 0.1873 } },
      { id: "lantern", shape: { kind: "circle", cx: 0.7035, cy: 0.8228, r: 0.055 } }
    ],
  // ── Level 9: em-09-underground-reservoir (9) ─────────────────────────────
  [
      { id: "shrine-niche", shape: { kind: "circle", cx: 0.7737, cy: 0.1734, r: 0.0703 } },
      { id: "pool-surface", shape: { kind: "ellipse", cx: 0.675, cy: 0.3404, rx: 0.1318, ry: 0.1249 } },
      { id: "water-plants", shape: { kind: "ellipse", cx: 0.3884, cy: 0.5159, rx: 0.222, ry: 0.1957 } },
      { id: "wall-sluice", shape: { kind: "ellipse", cx: 0.7384, cy: 0.5972, rx: 0.075, ry: 0.1809 } },
      { id: "waterfall-left", shape: { kind: "circle", cx: 0.0859, cy: 0.629, r: 0.0862 } },
      { id: "pebble-wall", shape: { kind: "ellipse", cx: 0.3904, cy: 0.7935, rx: 0.1293, ry: 0.1249 } },
      { id: "lower-pool", shape: { kind: "circle", cx: 0.241, cy: 0.8643, r: 0.1035 } },
      { id: "glass-jar", shape: { kind: "circle", cx: 0.6038, cy: 0.8428, r: 0.0687 } },
      { id: "brass-cylinder", shape: { kind: "ellipse", cx: 0.8913, cy: 0.723, rx: 0.1072, ry: 0.2462 } }
    ],
  // ── Level 10: em-10-canopy-observatory (10) ──────────────────────────────
  [
      { id: "pergola-beam", shape: { kind: "circle", cx: 0.2303, cy: 0.0718, r: 0.0754 } },
      { id: "crater-lake", shape: { kind: "ellipse", cx: 0.5341, cy: 0.2326, rx: 0.0945, ry: 0.055 } },
      { id: "gnomon-top", shape: { kind: "circle", cx: 0.4957, cy: 0.34, r: 0.048 } },
      { id: "left-post", shape: { kind: "ellipse", cx: 0.0984, cy: 0.3727, rx: 0.053, ry: 0.1482 } },
      { id: "telescope", shape: { kind: "ellipse", cx: 0.199, cy: 0.5601, rx: 0.083, ry: 0.2405 } },
      { id: "right-post", shape: { kind: "circle", cx: 0.7519, cy: 0.7361, r: 0.048 } },
      { id: "gnomon-mid", shape: { kind: "circle", cx: 0.5001, cy: 0.5783, r: 0.048 } },
      { id: "gnomon-lower", shape: { kind: "ellipse", cx: 0.5013, cy: 0.8192, rx: 0.033, ry: 0.1557 } },
      { id: "compass-rose", shape: { kind: "circle", cx: 0.4554, cy: 0.8694, r: 0.065 } },
      { id: "water-dish", shape: { kind: "circle", cx: 0.6271, cy: 0.8717, r: 0.068 } }
    ],
  // ── Level 11: em-11-green-valley (9) ─────────────────────────────────────
  [
      { id: "camp-flag", shape: { kind: "circle", cx: 0.6585, cy: 0.1524, r: 0.045 } },
      { id: "pipe-spout", shape: { kind: "circle", cx: 0.4706, cy: 0.4614, r: 0.05 } },
      { id: "blue-plants", shape: { kind: "ellipse", cx: 0.2449, cy: 0.5883, rx: 0.185, ry: 0.2078 } },
      { id: "stone-weir", shape: { kind: "ellipse", cx: 0.55, cy: 0.58, rx: 0.105, ry: 0.105 } },
      { id: "glass-terrarium", shape: { kind: "ellipse", cx: 0.8828, cy: 0.5823, rx: 0.1, ry: 0.1193 } },
      { id: "cable-reel", shape: { kind: "circle", cx: 0.4618, cy: 0.7333, r: 0.075 } },
      { id: "blue-flower", shape: { kind: "circle", cx: 0.2922, cy: 0.829, r: 0.0696 } },
      { id: "core-samples", shape: { kind: "ellipse", cx: 0.6009, cy: 0.877, rx: 0.135, ry: 0.095 } },
      { id: "lab-case", shape: { kind: "ellipse", cx: 0.8226, cy: 0.8394, rx: 0.0947, ry: 0.1396 } }
    ],
  // ── Level 12: em-12-geological-station (9) ───────────────────────────────
  [
      { id: "drill-head", shape: { kind: "circle", cx: 0.2286, cy: 0.1762, r: 0.085 } },
      { id: "theodolite", shape: { kind: "ellipse", cx: 0.5026, cy: 0.3236, rx: 0.055, ry: 0.095 } },
      { id: "muddy-track", shape: { kind: "ellipse", cx: 0.5221, cy: 0.5083, rx: 0.11, ry: 0.1029 } },
      { id: "glass-bottle", shape: { kind: "circle", cx: 0.7401, cy: 0.4852, r: 0.05 } },
      { id: "drill-bits", shape: { kind: "ellipse", cx: 0.345, cy: 0.62, rx: 0.1003, ry: 0.085 } },
      { id: "core-box", shape: { kind: "ellipse", cx: 0.22, cy: 0.815, rx: 0.1177, ry: 0.1135 } },
      { id: "drill-pipes", shape: { kind: "ellipse", cx: 0.5575, cy: 0.8654, rx: 0.155, ry: 0.1585 } },
      { id: "hose-coupling", shape: { kind: "ellipse", cx: 0.7129, cy: 0.7027, rx: 0.07, ry: 0.0703 } },
      { id: "cable-end", shape: { kind: "circle", cx: 0.8081, cy: 0.87, r: 0.055 } }
    ],
  // ── Level 13: em-13-evacuation-airstrip (9) ──────────────────────────────
  [
      { id: "radio-set", shape: { kind: "circle", cx: 0.1379, cy: 0.3988, r: 0.07 } },
      { id: "supply-crates", shape: { kind: "ellipse", cx: 0.2384, cy: 0.5559, rx: 0.12, ry: 0.095 } },
      { id: "terrarium", shape: { kind: "ellipse", cx: 0.1163, cy: 0.6451, rx: 0.105, ry: 0.1298 } },
      { id: "runway-patch", shape: { kind: "ellipse", cx: 0.5617, cy: 0.4472, rx: 0.075, ry: 0.06 } },
      { id: "bush-plane", shape: { kind: "ellipse", cx: 0.7865, cy: 0.3795, rx: 0.1753, ry: 0.1199 } },
      { id: "ground-hose", shape: { kind: "ellipse", cx: 0.6386, cy: 0.5748, rx: 0.095, ry: 0.065 } },
      { id: "map-laptop", shape: { kind: "circle", cx: 0.3125, cy: 0.826, r: 0.095 } },
      { id: "campfire", shape: { kind: "circle", cx: 0.5, cy: 0.755, r: 0.1069 } },
      { id: "empty-patch", shape: { kind: "ellipse", cx: 0.7221, cy: 0.7905, rx: 0.1097, ry: 0.222 } }
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
