import { z } from "zod";
import { ARTIFACT_IDS } from "@/content/artifacts";
import { CAMPAIGN_REPORT_IDS } from "@/data/campaignReports";

export const SAVE_VERSION = 3;

export const INITIAL_MAGNIFIERS = 1;

export const reviewUnavailableReasonSchema = z.enum([
  "NO_AUTH",
  "GAME_RATED",
  "REVIEW_ALREADY_REQUESTED",
  "REVIEW_WAS_REQUESTED",
  "UNKNOWN",
]);

export const reviewPromptStateSchema = z.object({
  schemaVersion: z.literal(1),
  prePromptShownCount: z.number().int().min(0).max(2),
  nextEligibleCompletedLevel: z.number().int().nonnegative(),
  nativeReviewResolved: z.boolean(),
  lastUnavailableReason: reviewUnavailableReasonSchema.optional(),
});

export type ReviewUnavailableReason = z.infer<
  typeof reviewUnavailableReasonSchema
>;
export type ReviewPromptState = z.infer<typeof reviewPromptStateSchema>;

export const initialReviewPromptState: ReviewPromptState = {
  schemaVersion: 1,
  prePromptShownCount: 0,
  nextEligibleCompletedLevel: 4,
  nativeReviewResolved: false,
};

const bestResultSchema = z.object({
  durationSeconds: z.number().nonnegative(),
  accuracy: z.number().min(0).max(1),
  mistakes: z.number().int().nonnegative(),
  hintsUsed: z.number().int().nonnegative(),
  seals: z.array(z.string()),
});

const levelAttemptModeSchema = z.enum(["campaign", "daily"]);

const inProgressV3Schema = z.object({
  levelId: z.string(),
  mode: levelAttemptModeSchema,
  attemptId: z.string().min(1),
  attemptNumber: z.number().int().positive(),
  attemptStartedAt: z.number().nonnegative(),
  attemptStartedActiveSeconds: z.number().nonnegative(),
  attemptStartedFoundDifferences: z.number().int().nonnegative(),
  attemptStartedMistakes: z.number().int().nonnegative(),
  attemptStartedHints: z.number().int().nonnegative(),
  attemptStartedRewardedHints: z.number().int().nonnegative(),
  attemptStartedTimeExtensions: z.number().int().nonnegative(),
  terminalAt: z.number().nonnegative().nullable(),
  onboarding: z.boolean(),
  foundDifferenceIds: z.array(z.string()),
  elapsedActiveSeconds: z.number().nonnegative(),
  timeGrantedSeconds: z.number().int().nonnegative(),
  mistakes: z.number().int().nonnegative(),
  hintsUsed: z.number().int().nonnegative(),
  hintedDifferenceIds: z.array(z.string()),
  rewardedHintsUsed: z.number().int().nonnegative(),
  timeExtensionsUsed: z.number().int().nonnegative(),
});

export const comparatorSchemeSchema = z.enum(["slider", "flip"]);

export type ComparatorScheme = z.infer<typeof comparatorSchemeSchema>;

const campaignReportIdSchema = z.enum([
  "white-meridian-report",
  "sand-meridian-report",
  "emerald-meridian-report",
]);

export const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  updatedAt: z.number(),
  completedLevels: z.array(z.string()),
  bestResults: z.record(bestResultSchema),
  inProgress: inProgressV3Schema.nullable(),
  levelAttemptCounts: z.record(z.number().int().nonnegative()),
  magnifiers: z.number().int().nonnegative(),
  artifacts: z.record(z.enum(["locked", "newly-unlocked", "viewed"])),
  viewedCampaignReportIds: z.array(campaignReportIdSchema).default([]),
  daily: z.object({
    lastClaimDate: z.string().nullable(),
    streak: z.number().int().nonnegative(),
  }),
  settings: z.object({
    locale: z.enum(["ru", "en"]),
    localeSource: z.enum(["auto", "manual"]),
    vibration: z.boolean(),
    reducedMotion: z.boolean(),
    comparatorScheme: comparatorSchemeSchema.nullable().default(null),
  }),
  reviewPrompt: reviewPromptStateSchema.default(initialReviewPromptState),
  purchases: z.object({
    noForcedInterstitials: z.boolean(),
    productIds: z.array(z.string()),
  }),
});

export type SaveData = z.infer<typeof saveSchema>;

const legacySaveSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  updatedAt: z.number().optional(),
  completedLevels: z.array(z.string()).optional(),
  bestResults: z.record(bestResultSchema.partial()).optional(),
  inProgress: z
    .object({
      levelId: z.string(),
      foundDifferenceIds: z.array(z.string()).optional(),
      elapsedSeconds: z.number().optional(),
      elapsedActiveSeconds: z.number().optional(),
      mistakes: z.number().optional(),
    })
    .nullable()
    .optional(),
  magnifiers: z.number().optional(),
  artifacts: z
    .record(z.enum(["locked", "newly-unlocked", "viewed"]))
    .optional(),
  viewedCampaignReportIds: z.array(campaignReportIdSchema).optional(),
  daily: z
    .object({
      lastClaimDate: z.string().nullable().optional(),
      streak: z.number().optional(),
    })
    .optional(),
  settings: z
    .object({
      locale: z.enum(["ru", "en"]).optional(),
      localeSource: z.enum(["auto", "manual"]).optional(),
      vibration: z.boolean().optional(),
      reducedMotion: z.boolean().optional(),
      comparatorScheme: comparatorSchemeSchema.nullable().optional(),
    })
    .optional(),
  reviewPrompt: reviewPromptStateSchema.optional(),
  purchases: z
    .object({
      noForcedInterstitials: z.boolean().optional(),
      productIds: z.array(z.string()).optional(),
    })
    .optional(),
});

function clampNonNegativeInteger(value: unknown, fallback: number) {
  return Number.isFinite(value)
    ? Math.max(0, Math.floor(Number(value)))
    : fallback;
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
        seals: result.seals ?? [],
      },
    ]),
  );
}

export function migrateSaveData(value: unknown): SaveData {
  const v2 = saveSchema.safeParse(value);
  if (v2.success) {
    return {
      ...v2.data,
      settings: {
        ...v2.data.settings,
        comparatorScheme: v2.data.settings.comparatorScheme ?? "flip",
      },
      artifacts: {
        ...Object.fromEntries(
          ARTIFACT_IDS.map((artifactId) => [artifactId, "locked" as const]),
        ),
        ...v2.data.artifacts,
      },
      viewedCampaignReportIds: v2.data.viewedCampaignReportIds.filter(
        (reportId) => CAMPAIGN_REPORT_IDS.includes(reportId),
      ),
    };
  }

  const legacy = legacySaveSchema.safeParse(value);
  if (!legacy.success) return createDefaultSave();

  const fallback = createDefaultSave();
  const source = legacy.data;
  const elapsedActiveSeconds = source.inProgress
    ? clampNonNegativeInteger(
        source.inProgress.elapsedActiveSeconds ??
          source.inProgress.elapsedSeconds,
        0,
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
          mode: "campaign",
          attemptId: `migrated-${source.updatedAt ?? 0}-${source.inProgress.levelId}`,
          attemptNumber: 1,
          attemptStartedAt: source.updatedAt ?? Date.now(),
          attemptStartedActiveSeconds: 0,
          attemptStartedFoundDifferences: 0,
          attemptStartedMistakes: 0,
          attemptStartedHints: 0,
          attemptStartedRewardedHints: 0,
          attemptStartedTimeExtensions: 0,
          terminalAt: null,
          onboarding: false,
          foundDifferenceIds: source.inProgress.foundDifferenceIds ?? [],
          elapsedActiveSeconds,
          timeGrantedSeconds: 0,
          mistakes: clampNonNegativeInteger(source.inProgress.mistakes, 0),
          hintsUsed: 0,
          hintedDifferenceIds: [],
          rewardedHintsUsed: 0,
          timeExtensionsUsed: 0,
        }
      : null,
    levelAttemptCounts: source.inProgress
      ? { [source.inProgress.levelId]: 1 }
      : {},
    magnifiers:
      typeof source.magnifiers === "number" && source.magnifiers >= 0
        ? Math.floor(source.magnifiers)
        : fallback.magnifiers,
    artifacts: { ...fallback.artifacts, ...(source.artifacts ?? {}) },
    viewedCampaignReportIds:
      source.viewedCampaignReportIds ?? fallback.viewedCampaignReportIds,
    daily: {
      lastClaimDate: source.daily?.lastClaimDate ?? null,
      streak: clampNonNegativeInteger(source.daily?.streak, 0),
    },
    settings: {
      locale: source.settings?.locale ?? fallback.settings.locale,
      localeSource: source.settings?.localeSource ?? "manual",
      vibration: source.settings?.vibration ?? fallback.settings.vibration,
      reducedMotion:
        source.settings?.reducedMotion ?? fallback.settings.reducedMotion,
      comparatorScheme: source.settings?.comparatorScheme ?? "flip",
    },
    reviewPrompt: source.reviewPrompt ?? fallback.reviewPrompt,
    purchases: {
      noForcedInterstitials: source.purchases?.noForcedInterstitials ?? false,
      productIds: source.purchases?.productIds ?? [],
    },
  });
}

export function createDefaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    updatedAt: Date.now(),
    completedLevels: [],
    bestResults: {},
    inProgress: null,
    levelAttemptCounts: {},
    magnifiers: INITIAL_MAGNIFIERS,
    artifacts: Object.fromEntries(
      ARTIFACT_IDS.map((artifactId) => [artifactId, "locked"]),
    ),
    viewedCampaignReportIds: [],
    daily: {
      lastClaimDate: null,
      streak: 0,
    },
    settings: {
      locale: "ru",
      localeSource: "auto",
      vibration: true,
      reducedMotion: false,
      comparatorScheme: "flip",
    },
    reviewPrompt: initialReviewPromptState,
    purchases: {
      noForcedInterstitials: false,
      productIds: [],
    },
  };
}
