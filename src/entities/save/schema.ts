import { z } from "zod";

export const saveSchema = z.object({
  version: z.literal(1),
  updatedAt: z.number(),
  completedLevels: z.array(z.string()),
  bestResults: z.record(
    z.object({
      durationSeconds: z.number(),
      accuracy: z.number(),
      mistakes: z.number(),
      hintsUsed: z.number(),
      seals: z.array(z.string())
    })
  ),
  inProgress: z
    .object({
      levelId: z.string(),
      foundDifferenceIds: z.array(z.string()),
      elapsedSeconds: z.number(),
      mistakes: z.number()
    })
    .nullable(),
  magnifiers: z.number().int().nonnegative(),
  artifacts: z.record(z.enum(["locked", "newly-unlocked", "viewed"])),
  daily: z.object({
    lastClaimDate: z.string().nullable(),
    streak: z.number().int().nonnegative()
  }),
  settings: z.object({
    locale: z.enum(["ru", "en"]),
    vibration: z.boolean(),
    reducedMotion: z.boolean()
  }),
  purchases: z.object({
    noForcedInterstitials: z.boolean(),
    productIds: z.array(z.string())
  })
});

export type SaveData = z.infer<typeof saveSchema>;

export function createDefaultSave(): SaveData {
  return {
    version: 1,
    updatedAt: Date.now(),
    completedLevels: [],
    bestResults: {},
    inProgress: null,
    magnifiers: 3,
    artifacts: {
      "brass-compass": "locked",
      "field-radio": "locked",
      "blue-flower": "locked",
      "torn-map": "locked"
    },
    daily: {
      lastClaimDate: null,
      streak: 0
    },
    settings: {
      locale: "ru",
      vibration: true,
      reducedMotion: false
    },
    purchases: {
      noForcedInterstitials: false,
      productIds: []
    }
  };
}
