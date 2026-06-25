import { z } from "zod";

export const pointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1)
});

export const hitShapeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("circle"),
    cx: z.number().min(0).max(1),
    cy: z.number().min(0).max(1),
    radius: z.number().min(0.005).max(1)
  }),
  z.object({
    kind: z.literal("polygon"),
    points: z.array(pointSchema).min(3)
  })
]);

export const differenceSchema = z.object({
  id: z.string().min(1),
  hitAreaA: hitShapeSchema,
  hitAreaB: hitShapeSchema,
  hintArea: hitShapeSchema,
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)])
});

export const levelSchema = z.object({
  id: z.string().min(1),
  chapterId: z.literal("northern-route"),
  order: z.number().int().min(1).max(12),
  titleKey: z.string().min(1),
  imageA: z.string().min(1),
  imageB: z.string().min(1),
  thumbnail: z.string().min(1),
  differences: z.array(differenceSchema).min(4),
  requiredDifferences: z.number().int().min(1),
  reward: z.object({
    archivePoints: z.number().int().nonnegative(),
    magnifiers: z.number().int().nonnegative().optional(),
    artifactId: z.string().optional()
  })
});

export type HitShape = z.infer<typeof hitShapeSchema>;
export type DifferenceDefinition = z.infer<typeof differenceSchema>;
export type LevelDefinition = z.infer<typeof levelSchema>;
