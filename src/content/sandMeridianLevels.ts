import { levelSchema, type LevelDefinition } from "../entities/level/schema";
import sandMeridianMapLayout from "../../docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json";

const scene12Differences = [
  { id: "mirror", x: 0.17, y: 0.378, radius: 0.05 },
  { id: "survey-rods", x: 0.394, y: 0.274, radius: 0.06 },
  { id: "telescope", x: 0.745, y: 0.322, radius: 0.07 },
  { id: "tent", x: 0.877, y: 0.159, radius: 0.09 },
  { id: "wall-notch", x: 0.929, y: 0.37, radius: 0.04 },
  { id: "gnomon", x: 0.5, y: 0.516, radius: 0.06 },
  { id: "shadow-arc", x: 0.62, y: 0.664, radius: 0.085 },
  { id: "floor-sector", x: 0.389, y: 0.747, radius: 0.075 },
  { id: "ring-gap", x: 0.319, y: 0.746, radius: 0.07 }
] as const;

const scene13Differences = [
  { id: "generator", x: 0.179, y: 0.563, radius: 0.048 },
  { id: "tablet-pot", x: 0.461, y: 0.493, radius: 0.036 },
  { id: "map-rolls", x: 0.553, y: 0.696, radius: 0.05 },
  { id: "floor-tool", x: 0.597, y: 0.555, radius: 0.037 },
  { id: "door-lantern", x: 0.684, y: 0.483, radius: 0.046 },
  { id: "side-passage", x: 0.768, y: 0.271, radius: 0.042 },
  { id: "hanging-cloth", x: 0.852, y: 0.334, radius: 0.063 },
  { id: "rope-coils", x: 0.773, y: 0.614, radius: 0.064 },
  { id: "case-tablet", x: 0.789, y: 0.834, radius: 0.033 }
] as const;

const sandMeridianDifferenceOverrides = {
  1: [
    { id: "lantern-pair", x: 0.05, y: 0.685, radius: 0.05 },
    { id: "helmet-crate", x: 0.205, y: 0.635, radius: 0.07 },
    { id: "rope-coil", x: 0.1, y: 0.815, radius: 0.095 },
    { id: "truck-ladder", x: 0.365, y: 0.325, radius: 0.06 },
    { id: "rolled-canvas", x: 0.415, y: 0.665, radius: 0.07 },
    { id: "cable-reel", x: 0.553, y: 0.609, radius: 0.045 },
    { id: "fuel-can", x: 0.605, y: 0.509, radius: 0.035 },
    { id: "painted-rock", x: 0.91, y: 0.52, radius: 0.035 },
    { id: "deck-winch", x: 0.582, y: 0.889, radius: 0.06 }
  ],
  2: [
    { id: "signal-flares", x: 0.376, y: 0.368, radius: 0.04 },
    { id: "generator", x: 0.086, y: 0.424, radius: 0.06 },
    { id: "blue-barrels", x: 0.79, y: 0.457, radius: 0.055 },
    { id: "helmet-rack", x: 0.66, y: 0.457, radius: 0.06 },
    { id: "ventilator", x: 0.532, y: 0.509, radius: 0.06 },
    { id: "field-phone", x: 0.277, y: 0.579, radius: 0.04 },
    { id: "jeep-radio", x: 0.772, y: 0.618, radius: 0.04 },
    { id: "equipment-case", x: 0.46, y: 0.89, radius: 0.07 }
  ],
  3: [
    { id: "signal-marker", x: 0.653, y: 0.133, radius: 0.04 },
    { id: "lamp", x: 0.74, y: 0.237, radius: 0.04 },
    { id: "cave-mouth", x: 0.685, y: 0.469, radius: 0.04 },
    { id: "striped-pole", x: 0.821, y: 0.469, radius: 0.04 },
    { id: "carved-stone", x: 0.588, y: 0.567, radius: 0.045 },
    { id: "rock-stack", x: 0.393, y: 0.613, radius: 0.04 },
    { id: "tool-case", x: 0.099, y: 0.707, radius: 0.04 },
    { id: "tool-cloth", x: 0.205, y: 0.831, radius: 0.085 },
    { id: "fossil-slab", x: 0.874, y: 0.777, radius: 0.065 }
  ],
  4: [
    { id: "signal-flags", x: 0.183, y: 0.216, radius: 0.11 },
    { id: "wall-switch", x: 0.607, y: 0.168, radius: 0.055 },
    { id: "wind-holes", x: 0.392, y: 0.491, radius: 0.11 },
    { id: "horn-speaker", x: 0.409, y: 0.583, radius: 0.04 },
    { id: "cable-run", x: 0.592, y: 0.648, radius: 0.05 },
    { id: "stone-cairn", x: 0.492, y: 0.673, radius: 0.04 },
    { id: "tent-peak", x: 0.935, y: 0.525, radius: 0.065 },
    { id: "radio-crates", x: 0.836, y: 0.634, radius: 0.06 },
    { id: "dish-antenna", x: 0.784, y: 0.849, radius: 0.07 }
  ],
  5: [
    { id: "scaffold-frame", x: 0.287, y: 0.275, radius: 0.11 },
    { id: "work-light", x: 0.348, y: 0.181, radius: 0.04 },
    { id: "rope-coil", x: 0.35, y: 0.505, radius: 0.05 },
    { id: "chalk-markings", x: 0.51, y: 0.378, radius: 0.04 },
    { id: "rope-barrier", x: 0.56, y: 0.47, radius: 0.045 },
    { id: "alcove-row", x: 0.804, y: 0.427, radius: 0.12 },
    { id: "orange-reel", x: 0.405, y: 0.684, radius: 0.045 },
    { id: "mine-cart", x: 0.552, y: 0.668, radius: 0.06 },
    { id: "helmet-bench", x: 0.823, y: 0.683, radius: 0.11 }
  ],
  6: [
    { id: "helmet-rack", x: 0.132, y: 0.234, radius: 0.07 },
    { id: "survey-flag", x: 0.722, y: 0.359, radius: 0.05 },
    { id: "generator", x: 0.086, y: 0.534, radius: 0.08 },
    { id: "ladder", x: 0.834, y: 0.576, radius: 0.08 },
    { id: "winch-drum", x: 0.305, y: 0.785, radius: 0.09 },
    { id: "winch-wheel", x: 0.242, y: 0.704, radius: 0.045 },
    { id: "basket-cage", x: 0.531, y: 0.702, radius: 0.09 },
    { id: "chain-anchor", x: 0.835, y: 0.87, radius: 0.06 }
  ],
  7: [
    { id: "tripod-light", x: 0.115, y: 0.185, radius: 0.06 },
    { id: "reflector-dish", x: 0.413, y: 0.424, radius: 0.07 },
    { id: "catwalk", x: 0.225, y: 0.551, radius: 0.13 },
    { id: "mineral-column", x: 0.424, y: 0.663, radius: 0.06 },
    { id: "small-dish", x: 0.592, y: 0.427, radius: 0.03 },
    { id: "back-spotlight", x: 0.722, y: 0.359, radius: 0.05 },
    { id: "crystal-table", x: 0.841, y: 0.642, radius: 0.08 },
    { id: "sample-case", x: 0.555, y: 0.852, radius: 0.055 },
    { id: "covered-stack", x: 0.949, y: 0.591, radius: 0.11 }
  ],
  8: [
    { id: "aqueduct", x: 0.115, y: 0.185, radius: 0.08 },
    { id: "supply-mat", x: 0.699, y: 0.213, radius: 0.09 },
    { id: "bridge", x: 0.536, y: 0.393, radius: 0.08 },
    { id: "water-gate", x: 0.742, y: 0.418, radius: 0.06 },
    { id: "basket", x: 0.225, y: 0.551, radius: 0.045 },
    { id: "bottle-cluster", x: 0.168, y: 0.812, radius: 0.07 },
    { id: "pump-rig", x: 0.394, y: 0.819, radius: 0.09 },
    { id: "measuring-pole", x: 0.839, y: 0.682, radius: 0.09 },
    { id: "water-reflection", x: 0.949, y: 0.589, radius: 0.04 }
  ],
  9: [
    { id: "ceiling-hole", x: 0.207, y: 0.148, radius: 0.08 },
    { id: "side-pipe", x: 0.052, y: 0.474, radius: 0.045 },
    { id: "gong", x: 0.374, y: 0.328, radius: 0.09 },
    { id: "tripod-mic", x: 0.511, y: 0.698, radius: 0.11 },
    { id: "floor-cable", x: 0.61, y: 0.703, radius: 0.04 },
    { id: "back-light", x: 0.639, y: 0.374, radius: 0.04 },
    { id: "marker-flag", x: 0.774, y: 0.337, radius: 0.03 },
    { id: "horn-speaker", x: 0.82, y: 0.518, radius: 0.06 },
    { id: "tape-recorder", x: 0.689, y: 0.816, radius: 0.08 }
  ],
  10: [
    { id: "timber-post", x: 0.117, y: 0.359, radius: 0.085 },
    { id: "stone-slab", x: 0.08, y: 0.739, radius: 0.09 },
    { id: "pottery-shelf", x: 0.274, y: 0.541, radius: 0.09 },
    { id: "doorway", x: 0.445, y: 0.467, radius: 0.075 },
    { id: "tea-table", x: 0.418, y: 0.614, radius: 0.045 },
    { id: "striped-awning", x: 0.744, y: 0.319, radius: 0.11 },
    { id: "wall-hooks", x: 0.802, y: 0.55, radius: 0.085 },
    { id: "stone-basin", x: 0.735, y: 0.684, radius: 0.09 },
    { id: "leather-straps", x: 0.82, y: 0.803, radius: 0.08 }
  ],
  11: [
    { id: "bridge-bunting", x: 0.376, y: 0.097, radius: 0.06 },
    { id: "rock-symbol", x: 0.635, y: 0.181, radius: 0.04 },
    { id: "crate", x: 0.709, y: 0.239, radius: 0.05 },
    { id: "bridge-lantern", x: 0.776, y: 0.223, radius: 0.04 },
    { id: "bridge-post", x: 0.776, y: 0.345, radius: 0.04 },
    { id: "plank-span", x: 0.598, y: 0.479, radius: 0.06 },
    { id: "bridge-planks", x: 0.456, y: 0.633, radius: 0.075 },
    { id: "left-lantern", x: 0.086, y: 0.663, radius: 0.04 },
    { id: "winch", x: 0.287, y: 0.801, radius: 0.065 },
    { id: "metal-bracket", x: 0.52, y: 0.67, radius: 0.035 },
    { id: "bridge-net", x: 0.648, y: 0.676, radius: 0.08 }
  ],
  12: scene12Differences,
  13: scene13Differences
} as const;

type SandMeridianLayoutLevel = (typeof sandMeridianMapLayout.levels)[number];

function makeDifferences(order: number) {
  const overrideDifferences = sandMeridianDifferenceOverrides[order as keyof typeof sandMeridianDifferenceOverrides];

  return overrideDifferences.map((difference) => ({
    id: `${difference.id}-${order}`,
    hitAreaA: { kind: "circle" as const, cx: difference.x, cy: difference.y, radius: difference.radius },
    hitAreaB: { kind: "circle" as const, cx: difference.x, cy: difference.y, radius: difference.radius },
    hintArea: {
      kind: "circle" as const,
      cx: difference.x,
      cy: difference.y,
      radius: difference.radius + 0.05
    },
    difficulty: (order < 5 ? 1 : order < 10 ? 2 : 3) as 1 | 2 | 3
  }));
}

function getTitleKey(level: SandMeridianLayoutLevel) {
  return `levels.${level.id.slice(0, 5).replace("-", "")}.title`;
}

function makeLevel(level: SandMeridianLayoutLevel): LevelDefinition {
  return levelSchema.parse({
    id: level.id,
    chapterId: "sand-meridian",
    order: level.order,
    titleKey: getTitleKey(level),
    imageA: `/assets/scenes/sand-meredian/${level.order}/1.webp`,
    imageB: `/assets/scenes/sand-meredian/${level.order}/2.webp`,
    thumbnail: `/assets/scenes/sand-meredian/${level.order}/1.webp`,
    differences: makeDifferences(level.order),
    requiredDifferences: sandMeridianDifferenceOverrides[level.order as keyof typeof sandMeridianDifferenceOverrides].length,
    reward: {
      archivePoints: 140 + level.order * 10,
      magnifiers: level.order % 3 === 0 ? 1 : 0
    }
  });
}

export const sandMeridianLevels = sandMeridianMapLayout.levels.map(makeLevel);
