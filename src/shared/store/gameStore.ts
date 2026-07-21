import { create } from "zustand";
import { getDailyArchiveDateKey } from "@/content/dailyArchive";
import {
  createDefaultSave,
  type ComparatorScheme,
  type ReviewUnavailableReason,
  type SaveData,
} from "@/entities/save/schema";
import { getChapter, getLevelById, type ChapterId } from "@/content/chapters";
import {
  getCampaignReportChapterId,
  getCampaignReportForCampaign,
  type CampaignReport,
  type CampaignReportCampaignId,
  type CampaignReportId,
} from "@/data/campaignReports";
import {
  clearPersistentSave,
  loadPersistentSave,
  savePersistentSave,
} from "@/services/storage/localSaveService";
import {
  trackAnalyticsEvent,
  type AnalyticsPayload,
} from "@/services/analytics/analytics";
import {
  getArtifactForLevel,
  isBetterLevelResult,
  resolveStartupDestination,
  unlockedArtifactsForCompleted,
} from "@/shared/lib/progression";

export type Screen =
  | { kind: "home" }
  | { kind: "map"; chapterId: ChapterId }
  | {
      kind: "game";
      levelId: string;
      mode: "campaign" | "daily";
      showOnboarding?: boolean;
    }
  | { kind: "daily" }
  | { kind: "collection" };

type SaveStatus = "idle" | "saving" | "saved" | "local-only";

type ReviewPromptRuntimeState = {
  pendingMapCheckToken: number;
  pendingMapCheckCompletedLevels: number | null;
  nativeRequestInFlight: boolean;
};

type InterstitialRuntimeState = {
  pendingMapCheckCompletedLevels: number | null;
  lastResolvedCompletedLevels: number;
  nativeRequestInFlight: boolean;
};

type LevelCompletionAnalyticsPayload = AnalyticsPayload & {
  isReplay: boolean;
};

export type LevelAttemptOutcome =
  | "completed"
  | "timeout"
  | "explicit_exit"
  | "background_abandon"
  | "restart"
  | "technical_error";

type GameStore = {
  screen: Screen;
  saveData: SaveData;
  saveStatus: SaveStatus;
  reviewPromptRuntime: ReviewPromptRuntimeState;
  interstitialRuntime: InterstitialRuntimeState;
  // Artifact ids unlocked by the last level completion, waiting for the
  // post-level reveal ceremony. Runtime-only: a reload skips the ceremony but
  // the collection still shows the artifact with its "new" badge.
  artifactRevealQueue: string[];
  startedAt: number;
  hydrate: () => Promise<void>;
  save: (options?: { flush?: boolean }) => Promise<void>;
  navigate: (screen: Screen) => void;
  openStartupScreen: () => void;
  startLevel: (
    levelId: string,
    mode?: "campaign" | "daily",
    options?: { onboarding?: boolean },
  ) => void;
  resumeLevelAttempt: (levelId: string) => void;
  endLevelAttempt: (levelId: string, outcome: LevelAttemptOutcome) => void;
  recordHintUsed: (
    levelId: string,
    differenceId: string,
    rewarded: boolean,
  ) => void;
  grantLevelTime: (levelId: string, seconds: number) => void;
  recordDifference: (levelId: string, differenceId: string) => void;
  recordMisclick: (levelId: string) => void;
  completeLevel: (
    levelId: string,
    durationSeconds: number,
    mode?: "campaign" | "daily",
  ) => void;
  spendMagnifiers: (amount: number) => boolean;
  setLocale: (locale: "ru" | "en") => void;
  setAutoLocale: (locale: "ru" | "en") => void;
  setComparatorScheme: (scheme: ComparatorScheme) => void;
  addActiveLevelTime: (
    levelId: string,
    seconds: number,
    options?: { save?: boolean; flush?: boolean },
  ) => void;
  claimDailyReward: (date: string) => void;
  clearPendingReviewPromptCheck: () => void;
  clearPendingInterstitialCheck: () => void;
  setInterstitialNativeRequestInFlight: (value: boolean) => void;
  setInterstitialResolved: (completedLevels: number) => void;
  markReviewPromptShown: () => void;
  dismissReviewPrompt: () => void;
  setReviewNativeRequestInFlight: (value: boolean) => void;
  setReviewNativeResolved: (value: boolean) => void;
  setReviewUnavailableReason: (reason?: ReviewUnavailableReason) => void;
  dismissArtifactReveal: (artifactId: string) => void;
  markArtifactViewed: (artifactId: string) => void;
  markCampaignReportViewed: (reportId: CampaignReportId) => void;
  shouldShowCampaignReport: (
    campaignId: CampaignReportCampaignId | ChapterId,
  ) => boolean;
  getCampaignReportForCompletedCampaign: (
    campaignId: CampaignReportCampaignId | ChapterId,
  ) => CampaignReport | null;
  resetLevelProgress: (levelId: string) => void;
  resetSave: () => Promise<void>;
};

function createAttemptId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function createLevelAttempt(
  saveData: SaveData,
  levelId: string,
  mode: "campaign" | "daily",
  options: { onboarding?: boolean; carryProgress?: boolean } = {},
): SaveData {
  const previous =
    options.carryProgress && saveData.inProgress?.levelId === levelId
      ? saveData.inProgress
      : null;
  const attemptNumber = (saveData.levelAttemptCounts[levelId] ?? 0) + 1;
  const elapsedActiveSeconds = previous?.elapsedActiveSeconds ?? 0;
  return {
    ...saveData,
    levelAttemptCounts: {
      ...saveData.levelAttemptCounts,
      [levelId]: attemptNumber,
    },
    inProgress: {
      levelId,
      mode,
      attemptId: createAttemptId(),
      attemptNumber,
      attemptStartedAt: Date.now(),
      attemptStartedActiveSeconds: elapsedActiveSeconds,
      attemptStartedFoundDifferences: previous?.foundDifferenceIds.length ?? 0,
      attemptStartedMistakes: previous?.mistakes ?? 0,
      attemptStartedHints: previous?.hintsUsed ?? 0,
      attemptStartedRewardedHints: previous?.rewardedHintsUsed ?? 0,
      attemptStartedTimeExtensions: previous?.timeExtensionsUsed ?? 0,
      terminalAt: null,
      onboarding: options.onboarding ?? false,
      foundDifferenceIds: previous?.foundDifferenceIds ?? [],
      elapsedActiveSeconds,
      timeGrantedSeconds: previous?.timeGrantedSeconds ?? 0,
      mistakes: previous?.mistakes ?? 0,
      hintsUsed: previous?.hintsUsed ?? 0,
      hintedDifferenceIds: previous?.hintedDifferenceIds ?? [],
      rewardedHintsUsed: previous?.rewardedHintsUsed ?? 0,
      timeExtensionsUsed: previous?.timeExtensionsUsed ?? 0,
    },
  };
}

function ensureInProgress(
  saveData: SaveData,
  levelId: string,
  mode: "campaign" | "daily" = "campaign",
): SaveData {
  if (saveData.inProgress?.levelId === levelId) return saveData;
  return createLevelAttempt(saveData, levelId, mode);
}

function applyArtifactUnlocks(saveData: SaveData): SaveData {
  const artifacts = { ...saveData.artifacts };
  for (const artifact of unlockedArtifactsForCompleted(
    saveData.completedLevels,
  )) {
    if (artifacts[artifact.id] === "locked") {
      artifacts[artifact.id] = "newly-unlocked";
    }
  }
  return { ...saveData, artifacts };
}

function getScreenAnalyticsPayload(screen: Screen) {
  if (screen.kind === "map")
    return { screen: screen.kind, campaignId: screen.chapterId };
  if (screen.kind === "game")
    return { screen: screen.kind, levelId: screen.levelId, mode: screen.mode };
  return { screen: screen.kind };
}

function getLevelAnalyticsPayload(levelId: string) {
  const level = getLevelById(levelId);
  if (!level) return { levelId };

  return {
    levelId,
    campaignId: level.chapterId,
    levelOrder: level.order,
    requiredDifferences: level.requiredDifferences,
  };
}

function getDurationBucket(durationSeconds: number) {
  const seconds = Math.floor(durationSeconds);
  if (seconds < 30) return "under_30s";
  if (seconds < 60) return "30_59s";
  if (seconds < 120) return "60_119s";
  if (seconds < 180) return "120_179s";
  if (seconds < 240) return "180_239s";
  if (seconds < 300) return "240_299s";
  return "300s_plus";
}

function getConsecutiveDailyStreak(
  previousDate: string | null,
  currentDate: string,
  previousStreak: number,
) {
  if (!previousDate) return 1;
  const previous = Date.parse(`${previousDate}T00:00:00Z`);
  const current = Date.parse(`${currentDate}T00:00:00Z`);
  if (!Number.isFinite(previous) || !Number.isFinite(current)) return 1;
  const days = Math.round((current - previous) / 86_400_000);
  return days === 1 ? previousStreak + 1 : 1;
}

function getAttemptAnalyticsPayload(saveData: SaveData) {
  const attempt = saveData.inProgress;
  if (!attempt) return null;
  const level = getLevelById(attempt.levelId);
  const now = Date.now();
  return {
    ...getLevelAnalyticsPayload(attempt.levelId),
    attemptId: attempt.attemptId,
    attemptNumber: attempt.attemptNumber,
    mode: attempt.mode,
    activeDurationSeconds: Math.max(
      0,
      Math.floor(
        attempt.elapsedActiveSeconds - attempt.attemptStartedActiveSeconds,
      ),
    ),
    totalActiveDurationSeconds: Math.floor(attempt.elapsedActiveSeconds),
    wallDurationSeconds: Math.max(
      0,
      Math.floor((now - attempt.attemptStartedAt) / 1000),
    ),
    foundDifferences: attempt.foundDifferenceIds.length,
    newFoundDifferences: Math.max(
      0,
      attempt.foundDifferenceIds.length -
        attempt.attemptStartedFoundDifferences,
    ),
    requiredDifferences: level?.requiredDifferences ?? 0,
    misclicks: Math.max(0, attempt.mistakes - attempt.attemptStartedMistakes),
    totalMisclicks: attempt.mistakes,
    hintsUsed: Math.max(0, attempt.hintsUsed - attempt.attemptStartedHints),
    totalHintsUsed: attempt.hintsUsed,
    rewardedHintsUsed: Math.max(
      0,
      attempt.rewardedHintsUsed - attempt.attemptStartedRewardedHints,
    ),
    totalRewardedHintsUsed: attempt.rewardedHintsUsed,
    timeExtensionsUsed: Math.max(
      0,
      attempt.timeExtensionsUsed - attempt.attemptStartedTimeExtensions,
    ),
    totalTimeExtensionsUsed: attempt.timeExtensionsUsed,
    timeGrantedSeconds: attempt.timeGrantedSeconds,
    compareScheme: saveData.settings.comparatorScheme ?? "flip",
    isReplay: saveData.completedLevels.includes(attempt.levelId),
    onboarding: attempt.onboarding,
  };
}

const CAMPAIGN_LEVELS_PER_HINT_REWARD = 2;
const NEXT_CAMPAIGN_BY_ID: Partial<Record<ChapterId, ChapterId>> = {
  "northern-route": "sand-meridian",
  "sand-meridian": "emerald-meridian",
};

function getCampaignCompletionRewardMagnifiers(
  completedCampaignLevels: number,
  isNewCampaignCompletion: boolean,
) {
  if (!isNewCampaignCompletion) return 0;
  return completedCampaignLevels > 0 &&
    completedCampaignLevels % CAMPAIGN_LEVELS_PER_HINT_REWARD === 0
    ? 1
    : 0;
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: { kind: "home" },
  saveData: createDefaultSave(),
  saveStatus: "idle",
  reviewPromptRuntime: {
    pendingMapCheckToken: 0,
    pendingMapCheckCompletedLevels: null,
    nativeRequestInFlight: false,
  },
  interstitialRuntime: {
    pendingMapCheckCompletedLevels: null,
    lastResolvedCompletedLevels: 0,
    nativeRequestInFlight: false,
  },
  artifactRevealQueue: [],
  startedAt: Date.now(),
  async hydrate() {
    let result: Awaited<ReturnType<typeof loadPersistentSave>>;
    try {
      result = await loadPersistentSave();
    } catch {
      set({ saveData: createDefaultSave(), saveStatus: "local-only" });
      trackAnalyticsEvent("save_load_result", {
        result: "error",
        source: "default",
        cloudAvailable: false,
      });
      return;
    }
    set({
      // Reconcile artifacts with completed levels so saves made before the
      // collection existed still unlock their milestone artifacts.
      saveData: applyArtifactUnlocks(result.saveData),
      saveStatus: result.cloudAvailable
        ? "saved"
        : result.source === "default"
          ? "idle"
          : "local-only",
    });
    trackAnalyticsEvent("save_load_result", {
      result: "success",
      source: result.source,
      cloudAvailable: result.cloudAvailable,
      completedLevels: result.saveData.completedLevels.length,
      language: result.saveData.settings.locale,
    });
  },
  async save(options) {
    const saveData = get().saveData;
    set({ saveStatus: "saving" });
    try {
      const result = await savePersistentSave(saveData, options);
      set({
        saveData: result.saveData,
        saveStatus: result.cloudSynced ? "saved" : "local-only",
      });
    } catch {
      set({ saveStatus: "local-only" });
      trackAnalyticsEvent("save_write_failed", {
        flush: options?.flush ?? false,
        saveStatus: "local-only",
      });
    }
  },
  navigate(screen) {
    set({ screen });
    trackAnalyticsEvent("screen_view", getScreenAnalyticsPayload(screen));
  },
  openStartupScreen() {
    const destination = resolveStartupDestination(get().saveData);
    if (destination.kind === "home") {
      const screen: Screen = { kind: "home" };
      set({ screen });
      trackAnalyticsEvent("screen_view", getScreenAnalyticsPayload(screen));
      return;
    }

    const level = getLevelById(destination.levelId);
    if (!level) {
      const screen: Screen = { kind: "home" };
      set({ screen });
      trackAnalyticsEvent("screen_view", getScreenAnalyticsPayload(screen));
      return;
    }

    const screen: Screen = {
      kind: "game",
      levelId: level.id,
      mode: "campaign",
      showOnboarding: destination.showOnboarding,
    };

    if (destination.showOnboarding) {
      set({ screen });
      trackAnalyticsEvent("screen_view", {
        screen: "game",
        ...getLevelAnalyticsPayload(level.id),
        mode: "campaign",
      });
      return;
    }

    get().startLevel(level.id, "campaign");
  },
  startLevel(levelId, mode = "campaign", options) {
    const level = getLevelById(levelId);
    if (!level) return;
    const state = get();
    const previous =
      state.saveData.inProgress?.levelId === levelId
        ? state.saveData.inProgress
        : null;
    const isResume = previous !== null && !options?.onboarding;
    const nextSave =
      previous && previous.terminalAt === null
        ? state.saveData
        : createLevelAttempt(state.saveData, levelId, mode, {
            onboarding: options?.onboarding,
            carryProgress: isResume,
          });
    set({
      screen: { kind: "game", levelId, mode },
      saveData: nextSave,
    });
    const attemptPayload = getAttemptAnalyticsPayload(nextSave);
    trackAnalyticsEvent(isResume ? "level_resume" : "level_attempt_start", {
      ...attemptPayload,
      resumedFoundDifferences: previous?.foundDifferenceIds.length ?? 0,
      onboarding: options?.onboarding ?? false,
    });
    trackAnalyticsEvent("screen_view", {
      screen: "game",
      ...getLevelAnalyticsPayload(levelId),
      mode,
    });
    void get().save();
  },
  resumeLevelAttempt(levelId) {
    const current = get().saveData.inProgress;
    if (!current || current.levelId !== levelId || current.terminalAt === null)
      return;
    const nextSave = createLevelAttempt(get().saveData, levelId, current.mode, {
      carryProgress: true,
    });
    set({ saveData: nextSave });
    trackAnalyticsEvent("level_resume", {
      ...getAttemptAnalyticsPayload(nextSave),
      resumedFoundDifferences: current.foundDifferenceIds.length,
    });
    void get().save();
  },
  endLevelAttempt(levelId, outcome) {
    const state = get();
    const attempt = state.saveData.inProgress;
    if (!attempt || attempt.levelId !== levelId || attempt.terminalAt !== null)
      return;
    const payload = getAttemptAnalyticsPayload(state.saveData);
    set({
      saveData: {
        ...state.saveData,
        inProgress: { ...attempt, terminalAt: Date.now() },
      },
    });
    trackAnalyticsEvent("level_attempt_end", { ...payload, outcome });
    void get().save({ flush: outcome !== "background_abandon" });
  },
  recordHintUsed(levelId, differenceId, rewarded) {
    set((state) => {
      const attempt = state.saveData.inProgress;
      if (
        !attempt ||
        attempt.levelId !== levelId ||
        attempt.terminalAt !== null
      )
        return state;
      return {
        saveData: {
          ...state.saveData,
          inProgress: {
            ...attempt,
            hintsUsed: attempt.hintsUsed + 1,
            hintedDifferenceIds: attempt.hintedDifferenceIds.includes(
              differenceId,
            )
              ? attempt.hintedDifferenceIds
              : [...attempt.hintedDifferenceIds, differenceId],
            rewardedHintsUsed: attempt.rewardedHintsUsed + (rewarded ? 1 : 0),
          },
        },
      };
    });
    void get().save();
  },
  grantLevelTime(levelId, seconds) {
    const granted = Math.max(0, Math.floor(seconds));
    if (granted === 0) return;
    set((state) => {
      const attempt = state.saveData.inProgress;
      if (
        !attempt ||
        attempt.levelId !== levelId ||
        attempt.terminalAt !== null
      )
        return state;
      return {
        saveData: {
          ...state.saveData,
          inProgress: {
            ...attempt,
            timeGrantedSeconds: attempt.timeGrantedSeconds + granted,
            timeExtensionsUsed: attempt.timeExtensionsUsed + 1,
          },
        },
      };
    });
    void get().save({ flush: true });
  },
  recordDifference(levelId, differenceId) {
    let analyticsPayload: AnalyticsPayload | null = null;
    let onboardingPayload: AnalyticsPayload | null = null;
    set((state) => {
      const saveData = ensureInProgress(state.saveData, levelId);
      const inProgress = saveData.inProgress!;
      if (inProgress.foundDifferenceIds.includes(differenceId)) return state;
      analyticsPayload = {
        ...getLevelAnalyticsPayload(levelId),
        differenceId,
        findOrder: inProgress.foundDifferenceIds.length + 1,
        elapsedActiveSeconds: Math.floor(inProgress.elapsedActiveSeconds),
        mistakes: inProgress.mistakes,
        attemptId: inProgress.attemptId,
        attemptNumber: inProgress.attemptNumber,
        hintAssisted: inProgress.hintedDifferenceIds.includes(differenceId),
      };
      if (inProgress.onboarding && inProgress.foundDifferenceIds.length === 0) {
        onboardingPayload = {
          ...getLevelAnalyticsPayload(levelId),
          attemptId: inProgress.attemptId,
          attemptNumber: inProgress.attemptNumber,
          differenceId,
          elapsedActiveSeconds: Math.floor(inProgress.elapsedActiveSeconds),
        };
      }
      return {
        saveData: {
          ...saveData,
          inProgress: {
            ...inProgress,
            foundDifferenceIds: [
              ...inProgress.foundDifferenceIds,
              differenceId,
            ],
          },
        },
      };
    });
    if (analyticsPayload) {
      trackAnalyticsEvent("difference_found", analyticsPayload);
    }
    if (onboardingPayload) {
      trackAnalyticsEvent("onboarding_first_interaction", onboardingPayload);
    }
    void get().save();
  },
  recordMisclick(levelId) {
    set((state) => {
      const saveData = ensureInProgress(state.saveData, levelId);
      const inProgress = saveData.inProgress!;
      return {
        saveData: {
          ...saveData,
          inProgress: {
            ...inProgress,
            mistakes: inProgress.mistakes + 1,
          },
        },
      };
    });
    void get().save();
  },
  completeLevel(levelId, durationSeconds, mode = "campaign") {
    const completionEvents: LevelCompletionAnalyticsPayload[] = [];
    const attemptEndEvents: AnalyticsPayload[] = [];
    let artifactUnlockCount = 0;
    let newlyUnlockedArtifactIds: string[] = [];
    let dailyRewardAnalyticsPayload: AnalyticsPayload | null = null;
    const dailyRewardDate = mode === "daily" ? getDailyArchiveDateKey() : null;
    set((state) => {
      const level = getLevelById(levelId);
      if (!level) return state;
      const attempt =
        state.saveData.inProgress?.levelId === levelId
          ? state.saveData.inProgress
          : null;
      const activeDurationSeconds =
        attempt?.elapsedActiveSeconds ?? durationSeconds;
      const foundCount =
        attempt?.foundDifferenceIds.length ?? level.requiredDifferences;
      const mistakes = attempt?.mistakes ?? 0;
      const hintsUsed = attempt?.hintsUsed ?? 0;
      const accuracy = foundCount / Math.max(foundCount + mistakes, 1);
      const seals = ["completed"];
      if (accuracy >= 0.85) seals.push("accurate-eye");
      if (hintsUsed === 0) seals.push("no-intervention");
      const completedResult = {
        durationSeconds: activeDurationSeconds,
        accuracy,
        mistakes,
        hintsUsed,
        seals,
      };
      const currentBest = state.saveData.bestResults[levelId];
      const bestResults = isBetterLevelResult(completedResult, currentBest)
        ? {
            ...state.saveData.bestResults,
            [levelId]: completedResult,
          }
        : state.saveData.bestResults;
      const isCampaignCompletion = mode === "campaign";
      const wasAlreadyCompleted =
        isCampaignCompletion &&
        state.saveData.completedLevels.includes(levelId);
      const completedLevels =
        !isCampaignCompletion || wasAlreadyCompleted
          ? state.saveData.completedLevels
          : [...state.saveData.completedLevels, levelId];
      const campaignRewardMagnifiers = isCampaignCompletion
        ? getCampaignCompletionRewardMagnifiers(
            completedLevels.length,
            !wasAlreadyCompleted,
          )
        : 0;
      const shouldClaimDailyReward =
        dailyRewardDate !== null &&
        state.saveData.daily.lastClaimDate !== dailyRewardDate;
      const daily = shouldClaimDailyReward
        ? {
            lastClaimDate: dailyRewardDate,
            streak: getConsecutiveDailyStreak(
              state.saveData.daily.lastClaimDate,
              dailyRewardDate,
              state.saveData.daily.streak,
            ),
          }
        : state.saveData.daily;
      const saveBeforeArtifactUnlocks = {
        ...state.saveData,
        completedLevels,
        inProgress: null,
        magnifiers:
          state.saveData.magnifiers +
          campaignRewardMagnifiers +
          (shouldClaimDailyReward ? 1 : 0),
        daily,
        bestResults,
      };
      if (shouldClaimDailyReward) {
        dailyRewardAnalyticsPayload = {
          date: dailyRewardDate,
          previousClaimDate: state.saveData.daily.lastClaimDate,
          streak: daily.streak,
        };
      }
      const nextSave = applyArtifactUnlocks(saveBeforeArtifactUnlocks);
      newlyUnlockedArtifactIds = Object.entries(nextSave.artifacts)
        .filter(
          ([artifactId, state]) =>
            state === "newly-unlocked" &&
            (saveBeforeArtifactUnlocks.artifacts[artifactId] ?? "locked") ===
              "locked",
        )
        .map(([artifactId]) => artifactId);
      artifactUnlockCount = newlyUnlockedArtifactIds.length;
      const shouldQueueReviewCheck =
        mode === "campaign" && !wasAlreadyCompleted;
      const shouldQueueInterstitialCheck =
        shouldQueueReviewCheck &&
        completedLevels.length > 0 &&
        completedLevels.length % 3 === 0;

      completionEvents.push({
        ...getLevelAnalyticsPayload(levelId),
        mode,
        attemptId: attempt?.attemptId,
        attemptNumber: attempt?.attemptNumber,
        onboarding: attempt?.onboarding ?? false,
        durationSeconds: Math.floor(activeDurationSeconds),
        activeDurationSeconds: Math.floor(activeDurationSeconds),
        durationBucket: getDurationBucket(activeDurationSeconds),
        foundDifferences: foundCount,
        mistakes,
        hintsUsed,
        rewardedHintsUsed: attempt?.rewardedHintsUsed ?? 0,
        timeExtensionsUsed: attempt?.timeExtensionsUsed ?? 0,
        accuracy: Number(accuracy.toFixed(4)),
        isReplay: wasAlreadyCompleted,
        completedLevels: completedLevels.length,
        rewardMagnifiers: campaignRewardMagnifiers,
        magnifiersAfterReward: nextSave.magnifiers,
        artifactUnlockCount,
        queuedReviewCheck: shouldQueueReviewCheck,
        queuedInterstitialCheck: shouldQueueInterstitialCheck,
      });

      if (attempt && attempt.terminalAt === null) {
        attemptEndEvents.push({
          ...getAttemptAnalyticsPayload(state.saveData),
          outcome: "completed",
        });
      }

      // The reveal ceremony is reserved for the artifact of the level that was
      // just completed; artifacts reconciled retroactively (e.g. after a save
      // migration) unlock silently and surface via the collection "new" badge.
      const levelArtifactId = getArtifactForLevel(levelId)?.id ?? null;
      const queuedArtifactIds = newlyUnlockedArtifactIds.filter(
        (artifactId) => artifactId === levelArtifactId,
      );

      return {
        saveData: nextSave,
        artifactRevealQueue:
          queuedArtifactIds.length > 0
            ? [...state.artifactRevealQueue, ...queuedArtifactIds]
            : state.artifactRevealQueue,
        reviewPromptRuntime: shouldQueueReviewCheck
          ? {
              ...state.reviewPromptRuntime,
              pendingMapCheckToken:
                state.reviewPromptRuntime.pendingMapCheckToken + 1,
              pendingMapCheckCompletedLevels: completedLevels.length,
            }
          : state.reviewPromptRuntime,
        interstitialRuntime: shouldQueueInterstitialCheck
          ? {
              ...state.interstitialRuntime,
              pendingMapCheckCompletedLevels: completedLevels.length,
            }
          : state.interstitialRuntime,
      };
    });
    const completionPayload = completionEvents[0];
    if (attemptEndEvents[0]) {
      trackAnalyticsEvent("level_attempt_end", attemptEndEvents[0]);
    }
    if (completionPayload?.onboarding) {
      trackAnalyticsEvent("onboarding_completed", {
        ...getLevelAnalyticsPayload(levelId),
        attemptId: completionPayload.attemptId,
        activeDurationSeconds: completionPayload.activeDurationSeconds,
      });
    }
    if (completionPayload) {
      trackAnalyticsEvent("level_complete", completionPayload);
      if (mode === "campaign" && !completionPayload.isReplay) {
        trackAnalyticsEvent("campaign_progress", completionPayload);
        if (completionPayload.levelOrder === 1) {
          trackAnalyticsEvent(
            "campaign_first_level_completed",
            completionPayload,
          );
        }
        const completedChapter = getChapter(
          completionPayload.campaignId as ChapterId,
        );
        if (completionPayload.levelOrder === completedChapter.levels.length) {
          trackAnalyticsEvent("campaign_completed", completionPayload);
          const unlockedCampaignId = NEXT_CAMPAIGN_BY_ID[completedChapter.id];
          if (unlockedCampaignId) {
            trackAnalyticsEvent("campaign_unlocked", {
              campaignId: unlockedCampaignId,
              unlockedByCampaignId: completedChapter.id,
              completedLevels: completionPayload.completedLevels,
            });
          }
        }
      }
    }
    if (dailyRewardAnalyticsPayload) {
      trackAnalyticsEvent("daily_reward_claimed", dailyRewardAnalyticsPayload);
    }
    for (const artifactId of newlyUnlockedArtifactIds) {
      trackAnalyticsEvent("artifact_unlock_queued", {
        ...getLevelAnalyticsPayload(levelId),
        artifactId,
      });
    }
    void get().save({ flush: true });
  },
  spendMagnifiers(amount) {
    const current = get().saveData.magnifiers;
    if (current < amount) return false;
    set((state) => ({
      saveData: { ...state.saveData, magnifiers: current - amount },
    }));
    trackAnalyticsEvent("magnifiers_spent", {
      amount,
      magnifiersBefore: current,
      magnifiersAfter: current - amount,
    });
    void get().save({ flush: true });
    return true;
  },
  setLocale(locale) {
    const previousLocale = get().saveData.settings.locale;
    set((state) => ({
      saveData: {
        ...state.saveData,
        settings: {
          ...state.saveData.settings,
          locale,
          localeSource: "manual",
        },
      },
    }));
    trackAnalyticsEvent("settings_language_changed", {
      previousLanguage: previousLocale,
      language: locale,
    });
    void get().save({ flush: true });
  },
  setAutoLocale(locale) {
    set((state) => {
      if (state.saveData.settings.localeSource === "manual") return state;
      if (
        state.saveData.settings.locale === locale &&
        state.saveData.settings.localeSource === "auto"
      )
        return state;
      return {
        saveData: {
          ...state.saveData,
          settings: {
            ...state.saveData.settings,
            locale,
            localeSource: "auto",
          },
        },
      };
    });
    void get().save({ flush: true });
  },
  setComparatorScheme(scheme) {
    const previousScheme = get().saveData.settings.comparatorScheme;
    if (previousScheme === scheme) return;
    set((state) => ({
      saveData: {
        ...state.saveData,
        settings: { ...state.saveData.settings, comparatorScheme: scheme },
      },
    }));
    trackAnalyticsEvent("settings_comparator_scheme_changed", {
      previousScheme: previousScheme ?? "none",
      scheme,
    });
    void get().save({ flush: true });
  },
  addActiveLevelTime(levelId, seconds, options) {
    const increment = Math.floor(seconds);
    if (increment === 0) return;
    set((state) => {
      if (state.saveData.inProgress?.levelId !== levelId) return state;
      return {
        saveData: {
          ...state.saveData,
          inProgress: {
            ...state.saveData.inProgress,
            elapsedActiveSeconds: Math.max(
              0,
              state.saveData.inProgress.elapsedActiveSeconds + increment,
            ),
          },
        },
      };
    });
    if (options?.save ?? true) {
      void get().save({ flush: options?.flush ?? false });
    }
  },
  claimDailyReward(date) {
    const previousDaily = get().saveData.daily;
    if (previousDaily.lastClaimDate === date) return;
    const nextStreak = getConsecutiveDailyStreak(
      previousDaily.lastClaimDate,
      date,
      previousDaily.streak,
    );
    set((state) => {
      return {
        saveData: {
          ...state.saveData,
          magnifiers: state.saveData.magnifiers + 1,
          daily: { lastClaimDate: date, streak: nextStreak },
        },
      };
    });
    trackAnalyticsEvent("daily_reward_claimed", {
      date,
      previousClaimDate: previousDaily.lastClaimDate,
      streak: nextStreak,
    });
    void get().save({ flush: true });
  },
  clearPendingReviewPromptCheck() {
    set((state) => ({
      reviewPromptRuntime: {
        ...state.reviewPromptRuntime,
        pendingMapCheckCompletedLevels: null,
      },
    }));
  },
  clearPendingInterstitialCheck() {
    set((state) => ({
      interstitialRuntime: {
        ...state.interstitialRuntime,
        pendingMapCheckCompletedLevels: null,
      },
    }));
  },
  setInterstitialNativeRequestInFlight(value) {
    set((state) => ({
      interstitialRuntime: {
        ...state.interstitialRuntime,
        nativeRequestInFlight: value,
      },
    }));
  },
  setInterstitialResolved(completedLevels) {
    set((state) => ({
      interstitialRuntime: {
        ...state.interstitialRuntime,
        pendingMapCheckCompletedLevels: null,
        lastResolvedCompletedLevels: Math.max(
          state.interstitialRuntime.lastResolvedCompletedLevels,
          completedLevels,
        ),
        nativeRequestInFlight: false,
      },
    }));
  },
  markReviewPromptShown() {
    set((state) => ({
      saveData: {
        ...state.saveData,
        reviewPrompt: {
          ...state.saveData.reviewPrompt,
          prePromptShownCount: Math.min(
            state.saveData.reviewPrompt.prePromptShownCount + 1,
            2,
          ),
        },
      },
      reviewPromptRuntime: {
        ...state.reviewPromptRuntime,
        pendingMapCheckCompletedLevels: null,
      },
    }));
    void get().save({ flush: true });
  },
  dismissReviewPrompt() {
    set((state) => {
      const reviewPrompt = state.saveData.reviewPrompt;

      return {
        saveData: {
          ...state.saveData,
          reviewPrompt: {
            ...reviewPrompt,
            nextEligibleCompletedLevel:
              reviewPrompt.prePromptShownCount <= 1
                ? Math.max(state.saveData.completedLevels.length + 5, 8)
                : reviewPrompt.nextEligibleCompletedLevel,
          },
        },
      };
    });
    void get().save();
  },
  setReviewNativeRequestInFlight(value) {
    set((state) => ({
      reviewPromptRuntime: {
        ...state.reviewPromptRuntime,
        nativeRequestInFlight: value,
      },
    }));
  },
  setReviewNativeResolved(value) {
    set((state) => ({
      saveData: {
        ...state.saveData,
        reviewPrompt: {
          ...state.saveData.reviewPrompt,
          nativeReviewResolved: value,
        },
      },
    }));
    void get().save();
  },
  setReviewUnavailableReason(reason) {
    set((state) => ({
      saveData: {
        ...state.saveData,
        reviewPrompt: {
          ...state.saveData.reviewPrompt,
          lastUnavailableReason: reason,
        },
      },
    }));
    void get().save();
  },
  dismissArtifactReveal(artifactId) {
    set((state) => ({
      artifactRevealQueue: state.artifactRevealQueue.filter(
        (queued) => queued !== artifactId,
      ),
    }));
  },
  markArtifactViewed(artifactId) {
    const currentState = get().saveData.artifacts[artifactId];
    if (currentState !== "newly-unlocked") return;
    set((state) => ({
      saveData: {
        ...state.saveData,
        artifacts: { ...state.saveData.artifacts, [artifactId]: "viewed" },
      },
    }));
    trackAnalyticsEvent("collection_artifact_viewed", { artifactId });
    void get().save();
  },
  markCampaignReportViewed(reportId) {
    const viewedReportIds = get().saveData.viewedCampaignReportIds;
    if (viewedReportIds.includes(reportId)) return;
    set((state) => ({
      saveData: {
        ...state.saveData,
        viewedCampaignReportIds: [
          ...state.saveData.viewedCampaignReportIds,
          reportId,
        ],
      },
    }));
    void get().save({ flush: true });
  },
  shouldShowCampaignReport(campaignId) {
    const report = get().getCampaignReportForCompletedCampaign(campaignId);
    if (!report) return false;
    return !get().saveData.viewedCampaignReportIds.includes(report.id);
  },
  getCampaignReportForCompletedCampaign(campaignId) {
    const report = getCampaignReportForCampaign(campaignId);
    if (!report) return null;
    const chapter = getChapter(getCampaignReportChapterId(report));
    const isComplete = chapter.levels.every((level) =>
      get().saveData.completedLevels.includes(level.id),
    );
    return isComplete ? report : null;
  },
  resetLevelProgress(levelId) {
    const currentSave = get().saveData;
    const inProgress = currentSave.inProgress;
    if (!inProgress || inProgress.levelId !== levelId) return;
    const endPayload =
      inProgress.terminalAt === null
        ? getAttemptAnalyticsPayload(currentSave)
        : null;
    const nextSave = createLevelAttempt(
      { ...currentSave, inProgress: null },
      levelId,
      inProgress.mode,
    );
    set({ saveData: nextSave });
    if (endPayload) {
      trackAnalyticsEvent("level_attempt_end", {
        ...endPayload,
        outcome: "restart",
      });
    }
    trackAnalyticsEvent("level_attempt_start", {
      ...getAttemptAnalyticsPayload(nextSave),
      restarted: true,
    });
    void get().save();
  },
  async resetSave() {
    await clearPersistentSave();
    set({
      saveData: createDefaultSave(),
      screen: { kind: "home" },
      saveStatus: "idle",
      reviewPromptRuntime: {
        pendingMapCheckToken: 0,
        pendingMapCheckCompletedLevels: null,
        nativeRequestInFlight: false,
      },
      interstitialRuntime: {
        pendingMapCheckCompletedLevels: null,
        lastResolvedCompletedLevels: 0,
        nativeRequestInFlight: false,
      },
      artifactRevealQueue: [],
    });
  },
}));
