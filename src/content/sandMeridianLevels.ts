import { levelSchema, type LevelDefinition } from "../entities/level/schema";
import sandMeridianMapLayout from "../../docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json";

const sandMeridianDifferenceOverrides = {
  1: [
      { id: "lantern-pair", x: 0.0452, y: 0.7053, radius: 0.063 },
      { id: "helmet-crate", shape: { kind: "ellipse", cx: 0.205, cy: 0.635, rx: 0.0727, ry: 0.1246 } },
      { id: "rope-coil", shape: { kind: "ellipse", cx: 0.1373, cy: 0.8377, rx: 0.0979, ry: 0.1567 } },
      { id: "truck-ladder", shape: { kind: "ellipse", cx: 0.3713, cy: 0.4061, rx: 0.0666, ry: 0.212 } },
      { id: "rolled-canvas", shape: { kind: "ellipse", cx: 0.4055, cy: 0.6657, rx: 0.0866, ry: 0.1026 } },
      { id: "cable-reel", x: 0.553, y: 0.609, radius: 0.0488 },
      { id: "fuel-can", x: 0.605, y: 0.509, radius: 0.0392 },
      { id: "painted-rock", x: 0.91, y: 0.52, radius: 0.0401 },
      { id: "deck-winch", x: 0.582, y: 0.889, radius: 0.06 }
    ],
  2: [
      { id: "signal-flares", shape: { kind: "ellipse", cx: 0.3772, cy: 0.4115, rx: 0.0503, ry: 0.1703 } },
      { id: "generator", x: 0.086, y: 0.424, radius: 0.06 },
      { id: "blue-barrels", x: 0.79, y: 0.457, radius: 0.0664 },
      { id: "helmet-rack", x: 0.66, y: 0.457, radius: 0.06 },
      { id: "ventilator", x: 0.532, y: 0.509, radius: 0.0647 },
      { id: "field-phone", x: 0.277, y: 0.579, radius: 0.04 },
      { id: "jeep-radio", x: 0.7678, y: 0.7312, radius: 0.0698 },
      { id: "equipment-case", x: 0.46, y: 0.89, radius: 0.07 }
    ],
  3: [
      { id: "signal-marker", x: 0.653, y: 0.133, radius: 0.04 },
      { id: "lamp", x: 0.74, y: 0.237, radius: 0.04 },
      { id: "cave-mouth", x: 0.7062, y: 0.4912, radius: 0.0642 },
      { id: "striped-pole", shape: { kind: "ellipse", cx: 0.8089, cy: 0.587, rx: 0.04, ry: 0.2235 } },
      { id: "carved-stone", x: 0.588, y: 0.6086, radius: 0.0628 },
      { id: "rock-stack", x: 0.6447, y: 0.8016, radius: 0.0678 },
      { id: "tool-case", shape: { kind: "ellipse", cx: 0.1214, cy: 0.708, rx: 0.0763, ry: 0.1277 } },
      { id: "tool-cloth", x: 0.1748, y: 0.8532, radius: 0.085 },
      { id: "fossil-slab", x: 0.854, y: 0.777, radius: 0.0783 }
    ],
  4: [
      { id: "signal-flags", x: 0.183, y: 0.216, radius: 0.0965 },
      { id: "wall-switch", x: 0.607, y: 0.168, radius: 0.055 },
      { id: "wind-holes", shape: { kind: "ellipse", cx: 0.391, cy: 0.4591, rx: 0.0962, ry: 0.1009 } },
      { id: "horn-speaker", x: 0.4116, y: 0.5851, radius: 0.0492 },
      { id: "cable-run", x: 0.592, y: 0.648, radius: 0.05 },
      { id: "stone-cairn", x: 0.492, y: 0.673, radius: 0.04 },
      { id: "tent-peak", x: 0.8709, y: 0.6304, radius: 0.1775 },
      { id: "radio-crates", x: 0.836, y: 0.634, radius: 0.06 },
      { id: "dish-antenna", x: 0.7834, y: 0.8577, radius: 0.07 }
    ],
  5: [
      { id: "scaffold-frame", shape: { kind: "ellipse", cx: 0.2999, cy: 0.3956, rx: 0.1411, ry: 0.3222 } },
      { id: "work-light", x: 0.3385, y: 0.1669, radius: 0.0488 },
      { id: "rope-coil", x: 0.3364, y: 0.5523, radius: 0.0454 },
      { id: "chalk-markings", x: 0.4934, y: 0.4078, radius: 0.05 },
      { id: "rope-barrier", x: 0.6216, y: 0.5294, radius: 0.0351 },
      { id: "alcove-row", shape: { kind: "ellipse", cx: 0.7703, cy: 0.424, rx: 0.12, ry: 0.1076 } },
      { id: "orange-reel", x: 0.4044, y: 0.6888, radius: 0.045 },
      { id: "mine-cart", x: 0.5423, y: 0.6786, radius: 0.0727 },
      { id: "helmet-bench", shape: { kind: "ellipse", cx: 0.8206, cy: 0.6771, rx: 0.11, ry: 0.1037 } }
    ],
  6: [
      { id: "helmet-rack", shape: { kind: "ellipse", cx: 0.1584, cy: 0.2855, rx: 0.1045, ry: 0.1351 } },
      { id: "survey-flag", x: 0.7475, y: 0.1518, radius: 0.0583 },
      { id: "generator", x: 0.086, y: 0.534, radius: 0.08 },
      { id: "ladder", shape: { kind: "ellipse", cx: 0.7585, cy: 0.6173, rx: 0.0722, ry: 0.2469 } },
      { id: "winch-drum", x: 0.2986, y: 0.8249, radius: 0.0701 },
      { id: "winch-wheel", x: 0.2111, y: 0.6561, radius: 0.0585 },
      { id: "basket-cage", x: 0.531, y: 0.702, radius: 0.09 },
      { id: "chain-anchor", x: 0.835, y: 0.87, radius: 0.06 }
    ],
  7: [
      { id: "tripod-light", x: 0.1333, y: 0.2317, radius: 0.06 },
      { id: "reflector-dish", x: 0.413, y: 0.424, radius: 0.07 },
      { id: "catwalk", shape: { kind: "ellipse", cx: 0.1981, cy: 0.722, rx: 0.13, ry: 0.3152 } },
      { id: "mineral-column", shape: { kind: "ellipse", cx: 0.4325, cy: 0.6524, rx: 0.1066, ry: 0.1259 } },
      { id: "small-dish", x: 0.592, y: 0.427, radius: 0.03 },
      { id: "back-spotlight", x: 0.722, y: 0.359, radius: 0.05 },
      { id: "crystal-table", shape: { kind: "ellipse", cx: 0.7489, cy: 0.5676, rx: 0.0767, ry: 0.1057 } },
      { id: "sample-case", x: 0.555, y: 0.852, radius: 0.055 },
      { id: "covered-stack", shape: { kind: "ellipse", cx: 0.9302, cy: 0.7301, rx: 0.11, ry: 0.2774 } }
    ],
  8: [
      { id: "aqueduct", x: 0.1422, y: 0.1831, radius: 0.08 },
      { id: "supply-mat", shape: { kind: "ellipse", cx: 0.6477, cy: 0.1909, rx: 0.09, ry: 0.097 } },
      { id: "bridge", shape: { kind: "ellipse", cx: 0.5495, cy: 0.4411, rx: 0.1117, ry: 0.143 } },
      { id: "water-gate", x: 0.7416, y: 0.3949, radius: 0.06 },
      { id: "basket", x: 0.225, y: 0.551, radius: 0.045 },
      { id: "bottle-cluster", x: 0.1759, y: 0.8003, radius: 0.07 },
      { id: "pump-rig", x: 0.3363, y: 0.796, radius: 0.09 },
      { id: "measuring-pole", shape: { kind: "ellipse", cx: 0.8424, cy: 0.6485, rx: 0.0572, ry: 0.1586 } }
    ],
  9: [
      { id: "ceiling-hole", x: 0.207, y: 0.148, radius: 0.08 },
      { id: "side-pipe", x: 0.052, y: 0.474, radius: 0.045 },
      { id: "gong", x: 0.3849, y: 0.3261, radius: 0.09 },
      { id: "tripod-mic", shape: { kind: "ellipse", cx: 0.4963, cy: 0.6214, rx: 0.0724, ry: 0.2058 } },
      { id: "floor-cable", shape: { kind: "ellipse", cx: 0.5864, cy: 0.6633, rx: 0.0799, ry: 0.2844 } },
      { id: "back-light", x: 0.5821, y: 0.4359, radius: 0.027 },
      { id: "marker-flag", x: 0.774, y: 0.337, radius: 0.03 },
      { id: "horn-speaker", x: 0.82, y: 0.518, radius: 0.06 },
      { id: "tape-recorder", x: 0.6745, y: 0.8353, radius: 0.0927 }
    ],
  10: [
      { id: "timber-post", x: 0.1055, y: 0.3987, radius: 0.1119 },
      { id: "stone-slab", x: 0.08, y: 0.739, radius: 0.0935 },
      { id: "pottery-shelf", x: 0.274, y: 0.541, radius: 0.05 },
      { id: "doorway", shape: { kind: "ellipse", cx: 0.4402, cy: 0.467, rx: 0.036, ry: 0.1281 } },
      { id: "tea-table", x: 0.418, y: 0.614, radius: 0.0302 },
      { id: "striped-awning", shape: { kind: "ellipse", cx: 0.6736, cy: 0.3524, rx: 0.1327, ry: 0.1312 } },
      { id: "wall-hooks", shape: { kind: "ellipse", cx: 0.7771, cy: 0.5138, rx: 0.085, ry: 0.1203 } },
      { id: "stone-basin", shape: { kind: "ellipse", cx: 0.7219, cy: 0.6286, rx: 0.09, ry: 0.1164 } },
      { id: "leather-straps", shape: { kind: "ellipse", cx: 0.8098, cy: 0.7844, rx: 0.08, ry: 0.1307 } }
    ],
  11: [
      { id: "bridge-bunting", x: 0.9217, y: 0.2208, radius: 0.06 },
      { id: "rock-symbol", shape: { kind: "ellipse", cx: 0.5594, cy: 0.1568, rx: 0.1368, ry: 0.0939 } },
      { id: "crate", shape: { kind: "ellipse", cx: 0.7144, cy: 0.2429, rx: 0.0312, ry: 0.0789 } },
      { id: "bridge-lantern", x: 0.776, y: 0.223, radius: 0.04 },
      { id: "bridge-post", shape: { kind: "ellipse", cx: 0.7941, cy: 0.3402, rx: 0.089, ry: 0.1423 } },
      { id: "plank-span", shape: { kind: "ellipse", cx: 0.5786, cy: 0.4181, rx: 0.1272, ry: 0.2003 } },
      { id: "bridge-planks", x: 0.4052, y: 0.6495, radius: 0.0539 },
      { id: "left-lantern", x: 0.1169, y: 0.6775, radius: 0.04 },
      { id: "winch", x: 0.287, y: 0.801, radius: 0.065 },
      { id: "bridge-net", shape: { kind: "ellipse", cx: 0.6498, cy: 0.6644, rx: 0.0969, ry: 0.2159 } }
    ],
  12: [
      { id: "mirror", x: 0.17, y: 0.378, radius: 0.05 },
      { id: "survey-rods", shape: { kind: "ellipse", cx: 0.3952, cy: 0.3137, rx: 0.06, ry: 0.1742 } },
      { id: "telescope", x: 0.7323, y: 0.3752, radius: 0.0888 },
      { id: "tent", shape: { kind: "ellipse", cx: 0.877, cy: 0.159, rx: 0.119, ry: 0.1738 } },
      { id: "wall-notch", x: 0.1196, y: 0.8227, radius: 0.04 },
      { id: "gnomon", x: 0.5, y: 0.516, radius: 0.06 },
      { id: "shadow-arc", x: 0.303, y: 0.9193, radius: 0.085 },
      { id: "floor-sector", shape: { kind: "ellipse", cx: 0.5045, cy: 0.6716, rx: 0.2144, ry: 0.25 } },
      { id: "ring-gap", x: 0.2174, y: 0.9027, radius: 0.07 }
    ],
  13: [
      { id: "generator", x: 0.179, y: 0.563, radius: 0.048 },
      { id: "tablet-pot", x: 0.461, y: 0.493, radius: 0.036 },
      { id: "map-rolls", x: 0.553, y: 0.696, radius: 0.05 },
      { id: "floor-tool", x: 0.597, y: 0.555, radius: 0.037 },
      { id: "door-lantern", x: 0.684, y: 0.483, radius: 0.046 },
      { id: "side-passage", x: 0.768, y: 0.271, radius: 0.042 },
      { id: "hanging-cloth", x: 0.852, y: 0.334, radius: 0.063 },
      { id: "rope-coils", x: 0.773, y: 0.614, radius: 0.064 },
      { id: "case-tablet", x: 0.789, y: 0.834, radius: 0.033 }
    ]
} as const;

type SandMeridianLayoutLevel = (typeof sandMeridianMapLayout.levels)[number];
type SandMeridianCircleSpec = { id: string; x: number; y: number; radius: number };
type SandMeridianShapeSpec =
  | SandMeridianCircleSpec
  | { id: string; shape: { kind: "circle"; cx: number; cy: number; r: number } }
  | { id: string; shape: { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number } };

function getSandMeridianShape(difference: SandMeridianShapeSpec) {
  if ("shape" in difference) return difference.shape;
  return { kind: "circle" as const, cx: difference.x, cy: difference.y, r: difference.radius };
}

function makeDifferences(order: number) {
  const overrideDifferences = sandMeridianDifferenceOverrides[order as keyof typeof sandMeridianDifferenceOverrides];

  return overrideDifferences.map((difference) => {
    const shape = getSandMeridianShape(difference);
    const hitArea =
      shape.kind === "circle"
        ? { kind: "circle" as const, cx: shape.cx, cy: shape.cy, radius: shape.r }
        : { kind: "ellipse" as const, cx: shape.cx, cy: shape.cy, rx: shape.rx, ry: shape.ry };
    const hintArea =
      shape.kind === "circle"
        ? { kind: "circle" as const, cx: shape.cx, cy: shape.cy, radius: shape.r + 0.05 }
        : { kind: "ellipse" as const, cx: shape.cx, cy: shape.cy, rx: shape.rx + 0.05, ry: shape.ry + 0.05 };

    return {
      id: `${difference.id}-${order}`,
      hitAreaA: hitArea,
      hitAreaB: hitArea,
      hintArea,
      difficulty: (order < 5 ? 1 : order < 10 ? 2 : 3) as 1 | 2 | 3
    };
  });
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
