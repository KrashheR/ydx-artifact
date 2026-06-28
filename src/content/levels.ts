import { levelSchema, type LevelDefinition } from "../entities/level/schema";

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
      hitAreaA: { kind: "circle", cx: 0.209, cy: 0.806, radius: 0.072 },
      hitAreaB: { kind: "circle", cx: 0.209, cy: 0.806, radius: 0.072 },
      hintArea: { kind: "circle", cx: 0.209, cy: 0.806, radius: 0.11 },
      difficulty: 1
    },
    {
      id: "canister-count-1",
      hitAreaA: { kind: "circle", cx: 0.323, cy: 0.621, radius: 0.107 },
      hitAreaB: { kind: "circle", cx: 0.323, cy: 0.621, radius: 0.107 },
      hintArea: { kind: "circle", cx: 0.323, cy: 0.621, radius: 0.145 },
      difficulty: 1
    },
    {
      id: "lifebuoy-color-1",
      hitAreaA: { kind: "circle", cx: 0.554, cy: 0.512, radius: 0.048 },
      hitAreaB: { kind: "circle", cx: 0.554, cy: 0.512, radius: 0.048 },
      hintArea: { kind: "circle", cx: 0.554, cy: 0.512, radius: 0.08 },
      difficulty: 1
    },
    {
      id: "seagull-removed-1",
      hitAreaA: { kind: "circle", cx: 0.945, cy: 0.321, radius: 0.039 },
      hitAreaB: { kind: "circle", cx: 0.945, cy: 0.321, radius: 0.039 },
      hintArea: { kind: "circle", cx: 0.945, cy: 0.321, radius: 0.07 },
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
      hitAreaA: { kind: "ellipse", cx: 0.126, cy: 0.17, rx: 0.101, ry: 0.089 },
      hitAreaB: { kind: "ellipse", cx: 0.126, cy: 0.17, rx: 0.101, ry: 0.089 },
      hintArea: { kind: "ellipse", cx: 0.126, cy: 0.17, rx: 0.135, ry: 0.125 },
      difficulty: 1
    },
    {
      id: "lamp-color-2",
      hitAreaA: { kind: "ellipse", cx: 0.237, cy: 0.39, rx: 0.045, ry: 0.09 },
      hitAreaB: { kind: "ellipse", cx: 0.237, cy: 0.39, rx: 0.045, ry: 0.09 },
      hintArea: { kind: "ellipse", cx: 0.237, cy: 0.39, rx: 0.07, ry: 0.12 },
      difficulty: 1
    },
    {
      id: "snowshoes-count-2",
      hitAreaA: { kind: "ellipse", cx: 0.634, cy: 0.31, rx: 0.056, ry: 0.153 },
      hitAreaB: { kind: "ellipse", cx: 0.634, cy: 0.31, rx: 0.056, ry: 0.153 },
      hintArea: { kind: "ellipse", cx: 0.634, cy: 0.31, rx: 0.085, ry: 0.185 },
      difficulty: 1
    },
    {
      id: "rope-added-2",
      hitAreaA: { kind: "ellipse", cx: 0.377, cy: 0.572, rx: 0.085, ry: 0.09 },
      hitAreaB: { kind: "ellipse", cx: 0.377, cy: 0.572, rx: 0.085, ry: 0.09 },
      hintArea: { kind: "ellipse", cx: 0.377, cy: 0.572, rx: 0.12, ry: 0.125 },
      difficulty: 1
    },
    {
      id: "crate-added-2",
      hitAreaA: { kind: "ellipse", cx: 0.856, cy: 0.647, rx: 0.048, ry: 0.082 },
      hitAreaB: { kind: "ellipse", cx: 0.856, cy: 0.647, rx: 0.048, ry: 0.082 },
      hintArea: { kind: "ellipse", cx: 0.856, cy: 0.647, rx: 0.075, ry: 0.115 },
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
      hitAreaA: { kind: "circle", cx: 0.336, cy: 0.318, radius: 0.132 },
      hitAreaB: { kind: "circle", cx: 0.336, cy: 0.318, radius: 0.132 },
      hintArea: { kind: "circle", cx: 0.336, cy: 0.318, radius: 0.175 },
      difficulty: 1
    },
    {
      id: "open-window-3",
      hitAreaA: { kind: "circle", cx: 0.691, cy: 0.164, radius: 0.078 },
      hitAreaB: { kind: "circle", cx: 0.691, cy: 0.164, radius: 0.078 },
      hintArea: { kind: "circle", cx: 0.691, cy: 0.164, radius: 0.11 },
      difficulty: 1
    },
    {
      id: "lantern-count-3",
      hitAreaA: { kind: "circle", cx: 0.909, cy: 0.412, radius: 0.087 },
      hitAreaB: { kind: "circle", cx: 0.909, cy: 0.412, radius: 0.087 },
      hintArea: { kind: "circle", cx: 0.909, cy: 0.412, radius: 0.12 },
      difficulty: 1
    },
    {
      id: "map-route-3",
      hitAreaA: { kind: "circle", cx: 0.62, cy: 0.789, radius: 0.051 },
      hitAreaB: { kind: "circle", cx: 0.62, cy: 0.789, radius: 0.051 },
      hintArea: { kind: "circle", cx: 0.62, cy: 0.789, radius: 0.078 },
      difficulty: 1
    },
    {
      id: "compass-removed-3",
      hitAreaA: { kind: "circle", cx: 0.871, cy: 0.772, radius: 0.075 },
      hitAreaB: { kind: "circle", cx: 0.871, cy: 0.772, radius: 0.075 },
      hintArea: { kind: "circle", cx: 0.871, cy: 0.772, radius: 0.105 },
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
      hitAreaA: { kind: "circle", cx: 0.333, cy: 0.813, radius: 0.212 },
      hitAreaB: { kind: "circle", cx: 0.333, cy: 0.813, radius: 0.212 },
      hintArea: { kind: "circle", cx: 0.333, cy: 0.813, radius: 0.245 },
      difficulty: 1
    },
    {
      id: "train-door-4",
      hitAreaA: { kind: "circle", cx: 0.342, cy: 0.324, radius: 0.064 },
      hitAreaB: { kind: "circle", cx: 0.342, cy: 0.324, radius: 0.064 },
      hintArea: { kind: "circle", cx: 0.342, cy: 0.324, radius: 0.095 },
      difficulty: 1
    },
    {
      id: "barrel-count-4",
      hitAreaA: { kind: "circle", cx: 0.545, cy: 0.524, radius: 0.117 },
      hitAreaB: { kind: "circle", cx: 0.545, cy: 0.524, radius: 0.117 },
      hintArea: { kind: "circle", cx: 0.545, cy: 0.524, radius: 0.15 },
      difficulty: 1
    },
    {
      id: "cart-moved-4",
      hitAreaA: { kind: "circle", cx: 0.722, cy: 0.567, radius: 0.066 },
      hitAreaB: { kind: "circle", cx: 0.722, cy: 0.567, radius: 0.066 },
      hintArea: { kind: "circle", cx: 0.722, cy: 0.567, radius: 0.1 },
      difficulty: 1
    },
    {
      id: "lantern-color-4",
      hitAreaA: { kind: "circle", cx: 0.935, cy: 0.345, radius: 0.055 },
      hitAreaB: { kind: "circle", cx: 0.935, cy: 0.345, radius: 0.055 },
      hintArea: { kind: "circle", cx: 0.935, cy: 0.345, radius: 0.08 },
      difficulty: 1
    },
    {
      id: "fur-gloves-4",
      hitAreaA: { kind: "circle", cx: 0.888, cy: 0.648, radius: 0.05 },
      hitAreaB: { kind: "circle", cx: 0.888, cy: 0.648, radius: 0.05 },
      hintArea: { kind: "circle", cx: 0.888, cy: 0.648, radius: 0.075 },
      difficulty: 1
    }
  ],
  requiredDifferences: 6,
  reward: {
    archivePoints: 140,
    magnifiers: 0
  }
});

const fifthLevel = levelSchema.parse({
  id: "nr-05-scene05",
  chapterId: "northern-route",
  order: 5,
  titleKey: "levels.nr05.title",
  imageA: "/assets/scenes/northern-route/5/1.webp",
  imageB: "/assets/scenes/northern-route/5/2.webp",
  thumbnail: "/assets/scenes/northern-route/5/1.webp",
  differences: [
    {
      id: "thermometer-dial-5",
      hitAreaA: { kind: "circle", cx: 0.109, cy: 0.145, radius: 0.089 },
      hitAreaB: { kind: "circle", cx: 0.109, cy: 0.145, radius: 0.089 },
      hintArea: { kind: "circle", cx: 0.109, cy: 0.145, radius: 0.12 },
      difficulty: 2
    },
    {
      id: "barometer-stack-5",
      hitAreaA: { kind: "circle", cx: 0.113, cy: 0.401, radius: 0.11 },
      hitAreaB: { kind: "circle", cx: 0.113, cy: 0.401, radius: 0.11 },
      hintArea: { kind: "circle", cx: 0.113, cy: 0.401, radius: 0.145 },
      difficulty: 2
    },
    {
      id: "weather-map-5",
      hitAreaA: { kind: "circle", cx: 0.395, cy: 0.229, radius: 0.054 },
      hitAreaB: { kind: "circle", cx: 0.395, cy: 0.229, radius: 0.054 },
      hintArea: { kind: "circle", cx: 0.395, cy: 0.229, radius: 0.085 },
      difficulty: 2
    },
    {
      id: "weather-vane-5",
      hitAreaA: { kind: "circle", cx: 0.759, cy: 0.243, radius: 0.062 },
      hitAreaB: { kind: "circle", cx: 0.759, cy: 0.243, radius: 0.062 },
      hintArea: { kind: "circle", cx: 0.759, cy: 0.243, radius: 0.095 },
      difficulty: 2
    },
    {
      id: "signal-pole-5",
      hitAreaA: { kind: "circle", cx: 0.914, cy: 0.407, radius: 0.042 },
      hitAreaB: { kind: "circle", cx: 0.914, cy: 0.407, radius: 0.042 },
      hintArea: { kind: "circle", cx: 0.914, cy: 0.407, radius: 0.07 },
      difficulty: 2
    },
    {
      id: "table-mug-5",
      hitAreaA: { kind: "circle", cx: 0.569, cy: 0.806, radius: 0.069 },
      hitAreaB: { kind: "circle", cx: 0.569, cy: 0.806, radius: 0.069 },
      hintArea: { kind: "circle", cx: 0.569, cy: 0.806, radius: 0.105 },
      difficulty: 2
    }
  ],
  requiredDifferences: 6,
  reward: {
    archivePoints: 150,
    magnifiers: 0
  }
});

const sixthLevel = levelSchema.parse({
  id: "nr-06-scene06",
  chapterId: "northern-route",
  order: 6,
  titleKey: "levels.nr06.title",
  imageA: "/assets/scenes/northern-route/6/1.webp",
  imageB: "/assets/scenes/northern-route/6/2.webp",
  thumbnail: "/assets/scenes/northern-route/6/1.webp",
  differences: [
    {
      id: "field-radio-6",
      hitAreaA: { kind: "circle", cx: 0.181, cy: 0.413, radius: 0.06 },
      hitAreaB: { kind: "circle", cx: 0.181, cy: 0.413, radius: 0.06 },
      hintArea: { kind: "circle", cx: 0.181, cy: 0.413, radius: 0.09 },
      difficulty: 2
    },
    {
      id: "skis-6",
      hitAreaA: { kind: "circle", cx: 0.367, cy: 0.378, radius: 0.082 },
      hitAreaB: { kind: "circle", cx: 0.367, cy: 0.378, radius: 0.082 },
      hintArea: { kind: "circle", cx: 0.367, cy: 0.378, radius: 0.115 },
      difficulty: 2
    },
    {
      id: "blue-roll-6",
      hitAreaA: { kind: "circle", cx: 0.271, cy: 0.718, radius: 0.12 },
      hitAreaB: { kind: "circle", cx: 0.271, cy: 0.718, radius: 0.12 },
      hintArea: { kind: "circle", cx: 0.271, cy: 0.718, radius: 0.16 },
      difficulty: 2
    },
    {
      id: "cargo-sled-6",
      hitAreaA: { kind: "circle", cx: 0.595, cy: 0.52, radius: 0.093 },
      hitAreaB: { kind: "circle", cx: 0.595, cy: 0.52, radius: 0.093 },
      hintArea: { kind: "circle", cx: 0.595, cy: 0.52, radius: 0.13 },
      difficulty: 2
    },
    {
      id: "ice-tracks-6",
      hitAreaA: { kind: "circle", cx: 0.731, cy: 0.679, radius: 0.077 },
      hitAreaB: { kind: "circle", cx: 0.731, cy: 0.679, radius: 0.077 },
      hintArea: { kind: "circle", cx: 0.731, cy: 0.679, radius: 0.11 },
      difficulty: 2
    },
    {
      id: "blue-flag-6",
      hitAreaA: { kind: "circle", cx: 0.875, cy: 0.431, radius: 0.037 },
      hitAreaB: { kind: "circle", cx: 0.875, cy: 0.431, radius: 0.037 },
      hintArea: { kind: "circle", cx: 0.875, cy: 0.431, radius: 0.06 },
      difficulty: 2
    }
  ],
  requiredDifferences: 6,
  reward: {
    archivePoints: 160,
    magnifiers: 1,
    artifactId: "field-radio"
  }
});

const seventhLevel = levelSchema.parse({
  id: "nr-07-scene07",
  chapterId: "northern-route",
  order: 7,
  titleKey: "levels.nr07.title",
  imageA: "/assets/scenes/northern-route/7/1.webp",
  imageB: "/assets/scenes/northern-route/7/2.webp",
  thumbnail: "/assets/scenes/northern-route/7/1.webp",
  differences: [
    {
      id: "shutter-7",
      hitAreaA: { kind: "circle", cx: 0.133, cy: 0.401, radius: 0.12 },
      hitAreaB: { kind: "circle", cx: 0.133, cy: 0.401, radius: 0.12 },
      hintArea: { kind: "circle", cx: 0.133, cy: 0.401, radius: 0.16 },
      difficulty: 2
    },
    {
      id: "snow-tracks-7",
      hitAreaA: { kind: "circle", cx: 0.16, cy: 0.845, radius: 0.12 },
      hitAreaB: { kind: "circle", cx: 0.16, cy: 0.845, radius: 0.12 },
      hintArea: { kind: "circle", cx: 0.16, cy: 0.845, radius: 0.16 },
      difficulty: 2
    },
    {
      id: "ceiling-lamp-7",
      hitAreaA: { kind: "circle", cx: 0.64, cy: 0.283, radius: 0.052 },
      hitAreaB: { kind: "circle", cx: 0.64, cy: 0.283, radius: 0.052 },
      hintArea: { kind: "circle", cx: 0.64, cy: 0.283, radius: 0.08 },
      difficulty: 2
    },
    {
      id: "back-door-7",
      hitAreaA: { kind: "circle", cx: 0.603, cy: 0.533, radius: 0.055 },
      hitAreaB: { kind: "circle", cx: 0.603, cy: 0.533, radius: 0.055 },
      hintArea: { kind: "circle", cx: 0.603, cy: 0.533, radius: 0.082 },
      difficulty: 2
    },
    {
      id: "wall-switch-7",
      hitAreaA: { kind: "circle", cx: 0.842, cy: 0.58, radius: 0.055 },
      hitAreaB: { kind: "circle", cx: 0.842, cy: 0.58, radius: 0.055 },
      hintArea: { kind: "circle", cx: 0.842, cy: 0.58, radius: 0.082 },
      difficulty: 2
    },
    {
      id: "crate-7",
      hitAreaA: { kind: "circle", cx: 0.748, cy: 0.84, radius: 0.11 },
      hitAreaB: { kind: "circle", cx: 0.748, cy: 0.84, radius: 0.11 },
      hintArea: { kind: "circle", cx: 0.748, cy: 0.84, radius: 0.15 },
      difficulty: 2
    },
    {
      id: "red-lantern-7",
      hitAreaA: { kind: "circle", cx: 0.953, cy: 0.493, radius: 0.09 },
      hitAreaB: { kind: "circle", cx: 0.953, cy: 0.493, radius: 0.09 },
      hintArea: { kind: "circle", cx: 0.953, cy: 0.493, radius: 0.125 },
      difficulty: 2
    }
  ],
  requiredDifferences: 7,
  reward: {
    archivePoints: 170,
    magnifiers: 0
  }
});

const eighthLevel = levelSchema.parse({
  id: "nr-08-scene08",
  chapterId: "northern-route",
  order: 8,
  titleKey: "levels.nr08.title",
  imageA: "/assets/scenes/northern-route/8/1.webp",
  imageB: "/assets/scenes/northern-route/8/2.webp",
  thumbnail: "/assets/scenes/northern-route/8/1.webp",
  differences: [
    {
      id: "wall-chart-8",
      hitAreaA: { kind: "circle", cx: 0.122, cy: 0.288, radius: 0.03 },
      hitAreaB: { kind: "circle", cx: 0.122, cy: 0.288, radius: 0.03 },
      hintArea: { kind: "circle", cx: 0.122, cy: 0.288, radius: 0.055 },
      difficulty: 2
    },
    {
      id: "telescope-barrel-8",
      hitAreaA: { kind: "circle", cx: 0.43, cy: 0.232, radius: 0.064 },
      hitAreaB: { kind: "circle", cx: 0.43, cy: 0.232, radius: 0.064 },
      hintArea: { kind: "circle", cx: 0.43, cy: 0.232, radius: 0.095 },
      difficulty: 2
    },
    {
      id: "clock-face-8",
      hitAreaA: { kind: "circle", cx: 0.907, cy: 0.273, radius: 0.07 },
      hitAreaB: { kind: "circle", cx: 0.907, cy: 0.273, radius: 0.07 },
      hintArea: { kind: "circle", cx: 0.907, cy: 0.273, radius: 0.105 },
      difficulty: 2
    },
    {
      id: "telescope-cap-8",
      hitAreaA: { kind: "circle", cx: 0.818, cy: 0.424, radius: 0.041 },
      hitAreaB: { kind: "circle", cx: 0.818, cy: 0.424, radius: 0.041 },
      hintArea: { kind: "circle", cx: 0.818, cy: 0.424, radius: 0.065 },
      difficulty: 2
    },
    {
      id: "hatch-opening-8",
      hitAreaA: { kind: "circle", cx: 0.269, cy: 0.814, radius: 0.125 },
      hitAreaB: { kind: "circle", cx: 0.269, cy: 0.814, radius: 0.125 },
      hintArea: { kind: "circle", cx: 0.269, cy: 0.814, radius: 0.17 },
      difficulty: 2
    },
    {
      id: "chair-back-8",
      hitAreaA: { kind: "circle", cx: 0.635, cy: 0.724, radius: 0.089 },
      hitAreaB: { kind: "circle", cx: 0.635, cy: 0.724, radius: 0.089 },
      hintArea: { kind: "circle", cx: 0.635, cy: 0.724, radius: 0.125 },
      difficulty: 2
    },
    {
      id: "red-book-8",
      hitAreaA: { kind: "circle", cx: 0.731, cy: 0.85, radius: 0.07 },
      hitAreaB: { kind: "circle", cx: 0.731, cy: 0.85, radius: 0.07 },
      hintArea: { kind: "circle", cx: 0.731, cy: 0.85, radius: 0.105 },
      difficulty: 2
    }
  ],
  requiredDifferences: 7,
  reward: {
    archivePoints: 180,
    magnifiers: 0
  }
});

const ninthLevel = levelSchema.parse({
  id: "nr-09-scene09",
  chapterId: "northern-route",
  order: 9,
  titleKey: "levels.nr09.title",
  imageA: "/assets/scenes/northern-route/9/1.webp",
  imageB: "/assets/scenes/northern-route/9/2.webp",
  thumbnail: "/assets/scenes/northern-route/9/1.webp",
  differences: [
    {
      id: "ceiling-lamp-9",
      hitAreaA: { kind: "ellipse", cx: 0.379, cy: 0.201, rx: 0.084, ry: 0.124 },
      hitAreaB: { kind: "ellipse", cx: 0.379, cy: 0.201, rx: 0.084, ry: 0.124 },
      hintArea: { kind: "ellipse", cx: 0.379, cy: 0.201, rx: 0.12, ry: 0.16 },
      difficulty: 2
    },
    {
      id: "pots-shelf-9",
      hitAreaA: { kind: "ellipse", cx: 0.717, cy: 0.184, rx: 0.15, ry: 0.14 },
      hitAreaB: { kind: "ellipse", cx: 0.717, cy: 0.184, rx: 0.15, ry: 0.14 },
      hintArea: { kind: "ellipse", cx: 0.717, cy: 0.184, rx: 0.19, ry: 0.18 },
      difficulty: 2
    },
    {
      id: "thermometer-panel-9",
      hitAreaA: { kind: "ellipse", cx: 0.447, cy: 0.444, rx: 0.048, ry: 0.135 },
      hitAreaB: { kind: "ellipse", cx: 0.447, cy: 0.444, rx: 0.048, ry: 0.135 },
      hintArea: { kind: "ellipse", cx: 0.447, cy: 0.444, rx: 0.078, ry: 0.17 },
      difficulty: 2
    },
    {
      id: "window-photo-9",
      hitAreaA: { kind: "ellipse", cx: 0.727, cy: 0.39, rx: 0.052, ry: 0.098 },
      hitAreaB: { kind: "ellipse", cx: 0.727, cy: 0.39, rx: 0.052, ry: 0.098 },
      hintArea: { kind: "ellipse", cx: 0.727, cy: 0.39, rx: 0.082, ry: 0.13 },
      difficulty: 2
    },
    {
      id: "watering-can-9",
      hitAreaA: { kind: "ellipse", cx: 0.195, cy: 0.711, rx: 0.07, ry: 0.106 },
      hitAreaB: { kind: "ellipse", cx: 0.195, cy: 0.711, rx: 0.07, ry: 0.106 },
      hintArea: { kind: "ellipse", cx: 0.195, cy: 0.711, rx: 0.1, ry: 0.14 },
      difficulty: 2
    },
    {
      id: "seed-tray-9",
      hitAreaA: { kind: "ellipse", cx: 0.372, cy: 0.771, rx: 0.096, ry: 0.105 },
      hitAreaB: { kind: "ellipse", cx: 0.372, cy: 0.771, rx: 0.096, ry: 0.105 },
      hintArea: { kind: "ellipse", cx: 0.372, cy: 0.771, rx: 0.13, ry: 0.14 },
      difficulty: 2
    },
    {
      id: "blue-flower-pot-9",
      hitAreaA: { kind: "ellipse", cx: 0.519, cy: 0.669, rx: 0.08, ry: 0.152 },
      hitAreaB: { kind: "ellipse", cx: 0.519, cy: 0.669, rx: 0.08, ry: 0.152 },
      hintArea: { kind: "ellipse", cx: 0.519, cy: 0.669, rx: 0.115, ry: 0.19 },
      difficulty: 2
    }
  ],
  requiredDifferences: 7,
  reward: {
    archivePoints: 190,
    magnifiers: 1,
    artifactId: "blue-flower"
  }
});

const tenthLevel = levelSchema.parse({
  id: "nr-10-scene10",
  chapterId: "northern-route",
  order: 10,
  titleKey: "levels.nr10.title",
  imageA: "/assets/scenes/northern-route/10/1.webp",
  imageB: "/assets/scenes/northern-route/10/2.webp",
  thumbnail: "/assets/scenes/northern-route/10/1.webp",
  differences: [
    {
      id: "signal-port-10",
      hitAreaA: { kind: "circle", cx: 0.153, cy: 0.242, radius: 0.048 },
      hitAreaB: { kind: "circle", cx: 0.153, cy: 0.242, radius: 0.048 },
      hintArea: { kind: "circle", cx: 0.153, cy: 0.242, radius: 0.075 },
      difficulty: 3
    },
    {
      id: "wall-map-10",
      hitAreaA: { kind: "circle", cx: 0.331, cy: 0.278, radius: 0.062 },
      hitAreaB: { kind: "circle", cx: 0.331, cy: 0.278, radius: 0.062 },
      hintArea: { kind: "circle", cx: 0.331, cy: 0.278, radius: 0.095 },
      difficulty: 3
    },
    {
      id: "dish-array-10",
      hitAreaA: { kind: "circle", cx: 0.824, cy: 0.147, radius: 0.081 },
      hitAreaB: { kind: "circle", cx: 0.824, cy: 0.147, radius: 0.081 },
      hintArea: { kind: "circle", cx: 0.824, cy: 0.147, radius: 0.12 },
      difficulty: 3
    },
    {
      id: "beacon-light-10",
      hitAreaA: { kind: "circle", cx: 0.956, cy: 0.216, radius: 0.036 },
      hitAreaB: { kind: "circle", cx: 0.956, cy: 0.216, radius: 0.036 },
      hintArea: { kind: "circle", cx: 0.956, cy: 0.216, radius: 0.06 },
      difficulty: 3
    },
    {
      id: "green-indicator-10",
      hitAreaA: { kind: "circle", cx: 0.533, cy: 0.586, radius: 0.027 },
      hitAreaB: { kind: "circle", cx: 0.533, cy: 0.586, radius: 0.027 },
      hintArea: { kind: "circle", cx: 0.533, cy: 0.586, radius: 0.05 },
      difficulty: 3
    },
    {
      id: "radio-case-10",
      hitAreaA: { kind: "circle", cx: 0.65, cy: 0.829, radius: 0.076 },
      hitAreaB: { kind: "circle", cx: 0.65, cy: 0.829, radius: 0.076 },
      hintArea: { kind: "circle", cx: 0.65, cy: 0.829, radius: 0.11 },
      difficulty: 3
    },
    {
      id: "cable-spool-10",
      hitAreaA: { kind: "circle", cx: 0.904, cy: 0.457, radius: 0.05 },
      hitAreaB: { kind: "circle", cx: 0.904, cy: 0.457, radius: 0.05 },
      hintArea: { kind: "circle", cx: 0.904, cy: 0.457, radius: 0.078 },
      difficulty: 3
    }
  ],
  requiredDifferences: 7,
  reward: {
    archivePoints: 200,
    magnifiers: 0
  }
});

const eleventhLevel = levelSchema.parse({
  id: "nr-11-scene11",
  chapterId: "northern-route",
  order: 11,
  titleKey: "levels.nr11.title",
  imageA: "/assets/scenes/northern-route/11/1.webp",
  imageB: "/assets/scenes/northern-route/11/2.webp",
  thumbnail: "/assets/scenes/northern-route/11/1.webp",
  differences: [
    {
      id: "upper-bedding-11",
      hitAreaA: { kind: "circle", cx: 0.057, cy: 0.126, radius: 0.084 },
      hitAreaB: { kind: "circle", cx: 0.057, cy: 0.126, radius: 0.084 },
      hintArea: { kind: "circle", cx: 0.057, cy: 0.126, radius: 0.115 },
      difficulty: 3
    },
    {
      id: "locker-shelf-11",
      hitAreaA: { kind: "circle", cx: 0.61, cy: 0.202, radius: 0.077 },
      hitAreaB: { kind: "circle", cx: 0.61, cy: 0.202, radius: 0.077 },
      hintArea: { kind: "circle", cx: 0.61, cy: 0.202, radius: 0.11 },
      difficulty: 3
    },
    {
      id: "hood-color-11",
      hitAreaA: { kind: "circle", cx: 0.764, cy: 0.252, radius: 0.062 },
      hitAreaB: { kind: "circle", cx: 0.764, cy: 0.252, radius: 0.062 },
      hintArea: { kind: "circle", cx: 0.764, cy: 0.252, radius: 0.092 },
      difficulty: 3
    },
    {
      id: "window-plant-11",
      hitAreaA: { kind: "circle", cx: 0.454, cy: 0.429, radius: 0.075 },
      hitAreaB: { kind: "circle", cx: 0.454, cy: 0.429, radius: 0.075 },
      hintArea: { kind: "circle", cx: 0.454, cy: 0.429, radius: 0.105 },
      difficulty: 3
    },
    {
      id: "chess-piece-11",
      hitAreaA: { kind: "circle", cx: 0.42, cy: 0.611, radius: 0.046 },
      hitAreaB: { kind: "circle", cx: 0.42, cy: 0.611, radius: 0.046 },
      hintArea: { kind: "circle", cx: 0.42, cy: 0.611, radius: 0.072 },
      difficulty: 3
    },
    {
      id: "firewood-stack-11",
      hitAreaA: { kind: "circle", cx: 0.673, cy: 0.634, radius: 0.089 },
      hitAreaB: { kind: "circle", cx: 0.673, cy: 0.634, radius: 0.089 },
      hintArea: { kind: "circle", cx: 0.673, cy: 0.634, radius: 0.123 },
      difficulty: 3
    },
    {
      id: "winter-boots-11",
      hitAreaA: { kind: "circle", cx: 0.894, cy: 0.843, radius: 0.128 },
      hitAreaB: { kind: "circle", cx: 0.894, cy: 0.843, radius: 0.128 },
      hintArea: { kind: "circle", cx: 0.894, cy: 0.843, radius: 0.17 },
      difficulty: 3
    }
  ],
  requiredDifferences: 7,
  reward: {
    archivePoints: 210,
    magnifiers: 0
  }
});

const twelfthLevel = levelSchema.parse({
  id: "nr-12-scene12",
  chapterId: "northern-route",
  order: 12,
  titleKey: "levels.nr12.title",
  imageA: "/assets/scenes/northern-route/12/1.webp",
  imageB: "/assets/scenes/northern-route/12/2.webp",
  thumbnail: "/assets/scenes/northern-route/12/1.webp",
  differences: [
    {
      id: "desk-radio-12",
      hitAreaA: { kind: "circle", cx: 0.298, cy: 0.429, radius: 0.063 },
      hitAreaB: { kind: "circle", cx: 0.298, cy: 0.429, radius: 0.063 },
      hintArea: { kind: "circle", cx: 0.298, cy: 0.429, radius: 0.095 },
      difficulty: 3
    },
    {
      id: "steam-plume-12",
      hitAreaA: { kind: "circle", cx: 0.557, cy: 0.228, radius: 0.058 },
      hitAreaB: { kind: "circle", cx: 0.557, cy: 0.228, radius: 0.058 },
      hintArea: { kind: "circle", cx: 0.557, cy: 0.228, radius: 0.09 },
      difficulty: 3
    },
    {
      id: "wall-lamp-12",
      hitAreaA: { kind: "circle", cx: 0.727, cy: 0.212, radius: 0.039 },
      hitAreaB: { kind: "circle", cx: 0.727, cy: 0.212, radius: 0.039 },
      hintArea: { kind: "circle", cx: 0.727, cy: 0.212, radius: 0.065 },
      difficulty: 3
    },
    {
      id: "sled-bundle-12",
      hitAreaA: { kind: "circle", cx: 0.879, cy: 0.621, radius: 0.061 },
      hitAreaB: { kind: "circle", cx: 0.879, cy: 0.621, radius: 0.061 },
      hintArea: { kind: "circle", cx: 0.879, cy: 0.621, radius: 0.095 },
      difficulty: 3
    },
    {
      id: "compass-12",
      hitAreaA: { kind: "circle", cx: 0.394, cy: 0.796, radius: 0.063 },
      hitAreaB: { kind: "circle", cx: 0.394, cy: 0.796, radius: 0.063 },
      hintArea: { kind: "circle", cx: 0.394, cy: 0.796, radius: 0.095 },
      difficulty: 3
    },
    {
      id: "pressed-flower-case-12",
      hitAreaA: { kind: "circle", cx: 0.697, cy: 0.784, radius: 0.063 },
      hitAreaB: { kind: "circle", cx: 0.697, cy: 0.784, radius: 0.063 },
      hintArea: { kind: "circle", cx: 0.697, cy: 0.784, radius: 0.095 },
      difficulty: 3
    },
    {
      id: "drawer-stones-12",
      hitAreaA: { kind: "circle", cx: 0.19, cy: 0.869, radius: 0.103 },
      hitAreaB: { kind: "circle", cx: 0.19, cy: 0.869, radius: 0.103 },
      hintArea: { kind: "circle", cx: 0.19, cy: 0.869, radius: 0.14 },
      difficulty: 3
    }
  ],
  requiredDifferences: 7,
  reward: {
    archivePoints: 220,
    magnifiers: 1,
    artifactId: "torn-map"
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
    },
    {
      id: "seagull-13",
      hitAreaA: { kind: "circle", cx: 0.826, cy: 0.091, radius: 0.035 },
      hitAreaB: { kind: "circle", cx: 0.826, cy: 0.091, radius: 0.035 },
      hintArea: { kind: "circle", cx: 0.826, cy: 0.091, radius: 0.060 },
      difficulty: 3
    }
  ],
  requiredDifferences: 9,
  reward: {
    archivePoints: 230,
    magnifiers: 0
  }
});

export const levels: LevelDefinition[] = [
  firstLevel,
  secondLevel,
  thirdLevel,
  fourthLevel,
  fifthLevel,
  sixthLevel,
  seventhLevel,
  eighthLevel,
  ninthLevel,
  tenthLevel,
  eleventhLevel,
  twelfthLevel,
  thirteenthLevel
];

export const dailyLevels = [
  { id: "daily-icebreaker-cabin", titleKey: "Daily: icebreaker cabin", levelId: levels[2].id },
  { id: "daily-cartographer-room", titleKey: "Daily: cartographer room", levelId: levels[5].id },
  { id: "daily-weather-platform", titleKey: "Daily: weather platform", levelId: levels[9].id }
];
