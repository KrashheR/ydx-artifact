import { z } from "zod";
import { ARTIFACT_IDS } from "@/content/artifacts";
import { CAMPAIGN_REPORT_IDS } from "@/data/campaignReports";

export const SAVE_VERSION = 2;

export const INITIAL_MAGNIFIERS = 1;
export const MAX_MAGNIFIERS = 5;

export const reviewUnavailableReasonSchema = z.enum([
  "NO_AUTH",
  "GAME_RATED",
  "REVIEW_ALREADY_REQUESTED",
  "REVIEW_WAS_REQUESTED",
  "UNKNOWN"
]);

export const reviewPromptStateSchema = z.object({
  schemaVersion: z.literal(1),
  prePromptShownCount: z.number().int().min(0).max(2),
  nextEligibleCompletedLevel: z.number().int().nonnegative(),
  nativeReviewResolved: z.boolean(),
  lastUnavailableReason: reviewUnavailableReasonSchema.optional()
});

export type ReviewUnavailableReason = z.infer<typeof reviewUnavailableReasonSchema>;
export type ReviewPromptState = z.infer<typeof reviewPromptStateSchema>;

export const initialReviewPromptState: ReviewPromptState = {
  schemaVersion: 1,
  prePromptShownCount: 0,
  nextEligibleCompletedLevel: 4,
  nativeReviewResolved: false
};

const bestResultSchema = z.object({
  durationSeconds: z.number().nonnegative(),
  accuracy: z.number().min(0).max(1),
  mistakes: z.number().int().nonnegative(),
  hintsUsed: z.number().int().nonnegative(),
  seals: z.array(z.string())
});

const inProgressV2Schema = z.object({
  levelId: z.string(),
  foundDifferenceIds: z.array(z.string()),
  elapsedActiveSeconds: z.number().nonnegative(),
  mistakes: z.number().int().nonnegative()
});

const campaignReportIdSchema = z.enum([
  "white-meridian-report",
  "sand-meridian-report",
  "emerald-meridian-report"
]);

export const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  updatedAt: z.number(),
  completedLevels: z.array(z.string()),
  bestResults: z.record(bestResultSchema),
  inProgress: inProgressV2Schema.nullable(),
  magnifiers: z.number().int().nonnegative(),
  artifacts: z.record(z.enum(["locked", "newly-unlocked", "viewed"])),
  viewedCampaignReportIds: z.array(campaignReportIdSchema).default([]),
  daily: z.object({
    lastClaimDate: z.string().nullable(),
    streak: z.number().int().nonnegative()
  }),
  settings: z.object({
    locale: z.enum(["ru", "en"]),
    localeSource: z.enum(["auto", "manual"]),
    vibration: z.boolean(),
    reducedMotion: z.boolean()
  }),
  reviewPrompt: reviewPromptStateSchema.default(initialReviewPromptState),
  purchases: z.object({
    noForcedInterstitials: z.boolean(),
    productIds: z.array(z.string())
  })
});

export type SaveData = z.infer<typeof saveSchema>;

const saveV1Schema = z.object({
  version: z.literal(1),
  updatedAt: z.number().optional(),
  completedLevels: z.array(z.string()).optional(),
  bestResults: z.record(bestResultSchema.partial()).optional(),
  inProgress: z
    .object({
      levelId: z.string(),
      foundDifferenceIds: z.array(z.string()).optional(),
      elapsedSeconds: z.number().optional(),
      elapsedActiveSeconds: z.number().optional(),
      mistakes: z.number().optional()
    })
    .nullable()
    .optional(),
  magnifiers: z.number().optional(),
  artifacts: z.record(z.enum(["locked", "newly-unlocked", "viewed"])).optional(),
  viewedCampaignReportIds: z.array(campaignReportIdSchema).optional(),
  daily: z
    .object({
      lastClaimDate: z.string().nullable().optional(),
      streak: z.number().optional()
    })
    .optional(),
  settings: z
    .object({
      locale: z.enum(["ru", "en"]).optional(),
      vibration: z.boolean().optional(),
      reducedMotion: z.boolean().optional()
    })
    .optional(),
  reviewPrompt: reviewPromptStateSchema.optional(),
  purchases: z
    .object({
      noForcedInterstitials: z.boolean().optional(),
      productIds: z.array(z.string()).optional()
    })
    .optional()
});

function clampNonNegativeInteger(value: unknown, fallback: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(Number(value))) : fallback;
}

function normalizeBestResults(value: unknown): SaveData["bestResults"] {
  const parsed = z.record(bestResultSchema.partial()).safeParse(value);
  if (!parsed.success) return {};

  return Object.fromEntries(
    Object.entries(parsed.data).map(([levelId, result]) => [
      levelId,
      {
        durationSeconds: Math.max(0, result.durationSeconds ?? 0),
        accuracy: Math.min(1, Math.max(0, result.accuracy ?? 0)),
        mistakes: clampNonNegativeInteger(result.mistakes, 0),
        hintsUsed: clampNonNegativeInteger(result.hintsUsed, 0),
        seals: result.seals ?? []
      }
    ])
  );
}

export function migrateSaveData(value: unknown): SaveData {
  const v2 = saveSchema.safeParse(value);
  if (v2.success) {
    return {
      ...v2.data,
      magnifiers: Math.min(v2.data.magnifiers, MAX_MAGNIFIERS),
      artifacts: {
        ...Object.fromEntries(ARTIFACT_IDS.map((artifactId) => [artifactId, "locked" as const])),
        ...v2.data.artifacts
      },
      viewedCampaignReportIds: v2.data.viewedCampaignReportIds.filter((reportId) =>
        CAMPAIGN_REPORT_IDS.includes(reportId)
      )
    };
  }

  const v1 = saveV1Schema.safeParse(value);
  if (!v1.success) return createDefaultSave();

  const fallback = createDefaultSave();
  const source = v1.data;
  const elapsedActiveSeconds = source.inProgress
    ? clampNonNegativeInteger(
        source.inProgress.elapsedActiveSeconds ?? source.inProgress.elapsedSeconds,
        0
      )
    : 0;

  return saveSchema.parse({
    ...fallback,
    version: SAVE_VERSION,
    updatedAt: source.updatedAt ?? Date.now(),
    completedLevels: source.completedLevels ?? fallback.completedLevels,
    bestResults: normalizeBestResults(source.bestResults),
    inProgress: source.inProgress
      ? {
          levelId: source.inProgress.levelId,
          foundDifferenceIds: source.inProgress.foundDifferenceIds ?? [],
          elapsedActiveSeconds,
          mistakes: clampNonNegativeInteger(source.inProgress.mistakes, 0)
        }
      : null,
    magnifiers: Math.min(
      clampNonNegativeInteger(source.magnifiers, fallback.magnifiers),
      MAX_MAGNIFIERS
    ),
    artifacts: { ...fallback.artifacts, ...(source.artifacts ?? {}) },
    viewedCampaignReportIds: source.viewedCampaignReportIds ?? fallback.viewedCampaignReportIds,
    daily: {
      lastClaimDate: source.daily?.lastClaimDate ?? null,
      streak: clampNonNegativeInteger(source.daily?.streak, 0)
    },
    settings: {
      locale: source.settings?.locale ?? fallback.settings.locale,
      localeSource: "manual",
      vibration: source.settings?.vibration ?? fallback.settings.vibration,
      reducedMotion: source.settings?.reducedMotion ?? fallback.settings.reducedMotion
    },
    reviewPrompt: source.reviewPrompt ?? fallback.reviewPrompt,
    purchases: {
      noForcedInterstitials: source.purchases?.noForcedInterstitials ?? false,
      productIds: source.purchases?.productIds ?? []
    }
  });
}

export function createDefaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    updatedAt: Date.now(),
    completedLevels: [],
    bestResults: {},
    inProgress: null,
    magnifiers: INITIAL_MAGNIFIERS,
    artifacts: Object.fromEntries(ARTIFACT_IDS.map((artifactId) => [artifactId, "locked"])),
    viewedCampaignReportIds: [],
    daily: {
      lastClaimDate: null,
      streak: 0
    },
    settings: {
      locale: "ru",
      localeSource: "auto",
      vibration: true,
      reducedMotion: false
    },
    reviewPrompt: initialReviewPromptState,
    purchases: {
      noForcedInterstitials: false,
      productIds: []
    }
  };
}
