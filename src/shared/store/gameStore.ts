import { create } from "zustand";
import {
  createDefaultSave,
  MAX_MAGNIFIERS,
  type ReviewUnavailableReason,
  type SaveData
} from "@/entities/save/schema";
import { getLevelById, type ChapterId } from "@/content/chapters";
import {
  clearPersistentSave,
  loadPersistentSave,
  savePersistentSave
} from "@/services/storage/localSaveService";
import {
  trackAnalyticsEvent,
  type AnalyticsPayload
} from "@/services/analytics/analytics";
import {
  isBetterLevelResult,
  resolveStartupDestination,
  unlockedArtifactsForCompleted
} from "@/shared/lib/progression";

export type Screen =
  | { kind: "home" }
  | { kind: "map"; chapterId: ChapterId }
  | { kind: "game"; levelId: string; mode: "campaign" | "daily"; showOnboarding?: boolean }
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

type GameStore = {
  screen: Screen;
  saveData: SaveData;
  saveStatus: SaveStatus;
  reviewPromptRuntime: ReviewPromptRuntimeState;
  interstitialRuntime: InterstitialRuntimeState;
  startedAt: number;
  hydrate: () => Promise<void>;
  save: (options?: { flush?: boolean }) => Promise<void>;
  navigate: (screen: Screen) => void;
  openStartupScreen: () => void;
  startLevel: (levelId: string, mode?: "campaign" | "daily") => void;
  recordDifference: (levelId: string, differenceId: string) => void;
  recordMisclick: (levelId: string) => void;
  completeLevel: (
    levelId: string,
    durationSeconds: number,
    mode?: "campaign" | "daily"
  ) => void;
  spendMagnifiers: (amount: number) => boolean;
  setLocale: (locale: "ru" | "en") => void;
  setAutoLocale: (locale: "ru" | "en") => void;
  addActiveLevelTime: (levelId: string, seconds: number, options?: { save?: boolean; flush?: boolean }) => void;
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
  resetLevelProgress: (levelId: string) => void;
  resetSave: () => Promise<void>;
};

function ensureInProgress(saveData: SaveData, levelId: string): SaveData {
  if (saveData.inProgress?.levelId === levelId) return saveData;
  return {
    ...saveData,
    inProgress: {
      levelId,
      foundDifferenceIds: [],
      elapsedActiveSeconds: 0,
      mistakes: 0
    }
  };
}

function applyArtifactUnlocks(saveData: SaveData): SaveData {
  const artifacts = { ...saveData.artifacts };
  for (const artifact of unlockedArtifactsForCompleted(saveData.completedLevels)) {
    if (artifacts[artifact.id] === "locked") {
      artifacts[artifact.id] = "newly-unlocked";
    }
  }
  return { ...saveData, artifacts };
}

function getScreenAnalyticsPayload(screen: Screen) {
  if (screen.kind === "map") return { screen: screen.kind, campaignId: screen.chapterId };
  if (screen.kind === "game") return { screen: screen.kind, levelId: screen.levelId, mode: screen.mode };
  return { screen: screen.kind };
}

function getLevelAnalyticsPayload(levelId: string) {
  const level = getLevelById(levelId);
  if (!level) return { levelId };

  return {
    levelId,
    campaignId: level.chapterId,
    levelOrder: level.order,
    requiredDifferences: level.requiredDifferences
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

export const useGameStore = create<GameStore>((set, get) => ({
  screen: { kind: "home" },
  saveData: createDefaultSave(),
  saveStatus: "idle",
  reviewPromptRuntime: {
    pendingMapCheckToken: 0,
    pendingMapCheckCompletedLevels: null,
    nativeRequestInFlight: false
  },
  interstitialRuntime: {
    pendingMapCheckCompletedLevels: null,
    lastResolvedCompletedLevels: 0,
    nativeRequestInFlight: false
  },
  startedAt: Date.now(),
  async hydrate() {
    const result = await loadPersistentSave();
    set({
      saveData: result.saveData,
      saveStatus: result.cloudAvailable ? "saved" : result.source === "default" ? "idle" : "local-only"
    });
    trackAnalyticsEvent("save_loaded", {
      source: result.source,
      cloudAvailable: result.cloudAvailable,
      completedLevels: result.saveData.completedLevels.length,
      language: result.saveData.settings.locale
    });
  },
  async save(options) {
    const saveData = get().saveData;
    set({ saveStatus: "saving" });
    try {
      const result = await savePersistentSave(saveData, options);
      set({
        saveData: result.saveData,
        saveStatus: result.cloudSynced ? "saved" : "local-only"
      });
    } catch {
      set({ saveStatus: "local-only" });
    }
  },
  navigate(screen) {
    set({ screen });
    trackAnalyticsEvent("screen_view", getScreenAnalyticsPayload(screen));
  },
  openStartupScreen() {
    const destination = resolveStartupDestination(get().saveData);
    if (destination.kind === "collection") {
      const screen: Screen = { kind: "collection" };
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

    const currentSave = get().saveData;
    const previousProgress =
      currentSave.inProgress?.levelId === level.id
        ? currentSave.inProgress.foundDifferenceIds.length
        : 0;
    const isReplay = currentSave.completedLevels.includes(level.id);
    const screen: Screen = {
      kind: "game",
      levelId: level.id,
      mode: "campaign",
      showOnboarding: destination.showOnboarding
    };

    set((state) => ({
      screen,
      saveData: ensureInProgress(state.saveData, level.id)
    }));
    trackAnalyticsEvent("level_start", {
      ...getLevelAnalyticsPayload(level.id),
      mode: "campaign",
      isReplay,
      resumedFoundDifferences: previousProgress,
      source: "startup",
      onboardingShown: destination.showOnboarding
    });
    trackAnalyticsEvent("screen_view", { screen: "game", ...getLevelAnalyticsPayload(level.id), mode: "campaign" });
    void get().save();
  },
  startLevel(levelId, mode = "campaign") {
    const level = getLevelById(levelId);
    if (!level) return;
    const state = get();
    const isReplay = state.saveData.completedLevels.includes(levelId);
    const previousProgress =
      state.saveData.inProgress?.levelId === levelId
        ? state.saveData.inProgress.foundDifferenceIds.length
        : 0;
    set((state) => ({
      screen: { kind: "game", levelId, mode },
      saveData: ensureInProgress(state.saveData, levelId)
    }));
    trackAnalyticsEvent("level_start", {
      ...getLevelAnalyticsPayload(levelId),
      mode,
      isReplay,
      resumedFoundDifferences: previousProgress
    });
    trackAnalyticsEvent("screen_view", { screen: "game", ...getLevelAnalyticsPayload(levelId), mode });
    void get().save();
  },
  recordDifference(levelId, differenceId) {
    let analyticsPayload: AnalyticsPayload | null = null;
    set((state) => {
      const saveData = ensureInProgress(state.saveData, levelId);
      const inProgress = saveData.inProgress!;
      if (inProgress.foundDifferenceIds.includes(differenceId)) return state;
      analyticsPayload = {
        ...getLevelAnalyticsPayload(levelId),
        differenceId,
        findOrder: inProgress.foundDifferenceIds.length + 1,
        elapsedActiveSeconds: Math.floor(inProgress.elapsedActiveSeconds),
        mistakes: inProgress.mistakes
      };
      return {
        saveData: {
          ...saveData,
          inProgress: {
            ...inProgress,
            foundDifferenceIds: [...inProgress.foundDifferenceIds, differenceId]
          }
        }
      };
    });
    if (analyticsPayload) {
      trackAnalyticsEvent("difference_found", analyticsPayload);
    }
    void get().save();
  },
  recordMisclick(levelId) {
    let analyticsPayload: AnalyticsPayload | null = null;
    set((state) => {
      const saveData = ensureInProgress(state.saveData, levelId);
      const inProgress = saveData.inProgress!;
      analyticsPayload = {
        ...getLevelAnalyticsPayload(levelId),
        misclicks: inProgress.mistakes + 1,
        foundDifferences: inProgress.foundDifferenceIds.length,
        elapsedActiveSeconds: Math.floor(inProgress.elapsedActiveSeconds)
      };
      return {
        saveData: {
          ...saveData,
          inProgress: {
            ...inProgress,
            mistakes: inProgress.mistakes + 1
          }
        }
      };
    });
    if (analyticsPayload) {
      trackAnalyticsEvent("level_misclick", analyticsPayload);
    }
    void get().save();
  },
  completeLevel(levelId, durationSeconds, mode = "campaign") {
    const completionEvents: LevelCompletionAnalyticsPayload[] = [];
    let artifactUnlockCount = 0;
    set((state) => {
      const level = getLevelById(levelId);
      if (!level) return state;
      const foundCount = state.saveData.inProgress?.foundDifferenceIds.length ?? level.requiredDifferences;
      const mistakes = state.saveData.inProgress?.mistakes ?? 0;
      const accuracy = foundCount / Math.max(foundCount + mistakes, 1);
      const seals = ["completed"];
      if (accuracy >= 0.85) seals.push("accurate-eye");
      seals.push("no-intervention");
      const completedResult = {
        durationSeconds,
        accuracy,
        mistakes,
        hintsUsed: 0,
        seals
      };
      const currentBest = state.saveData.bestResults[levelId];
      const bestResults = isBetterLevelResult(completedResult, currentBest)
        ? {
            ...state.saveData.bestResults,
            [levelId]: completedResult
          }
        : state.saveData.bestResults;
      const wasAlreadyCompleted = state.saveData.completedLevels.includes(levelId);
      const completedLevels = wasAlreadyCompleted
        ? state.saveData.completedLevels
        : [...state.saveData.completedLevels, levelId];
      const saveBeforeArtifactUnlocks = {
        ...state.saveData,
        completedLevels,
        inProgress: null,
        magnifiers: Math.min(
          state.saveData.magnifiers + (level.reward.magnifiers ?? 0),
          MAX_MAGNIFIERS
        ),
        bestResults
      };
      const nextSave = applyArtifactUnlocks(saveBeforeArtifactUnlocks);
      artifactUnlockCount = Object.entries(nextSave.artifacts).filter(
        ([artifactId, state]) =>
          state === "newly-unlocked" && saveBeforeArtifactUnlocks.artifacts[artifactId] === "locked"
      ).length;
      const shouldQueueReviewCheck = mode === "campaign" && !wasAlreadyCompleted;
      const shouldQueueInterstitialCheck =
        shouldQueueReviewCheck && completedLevels.length > 0 && completedLevels.length % 3 === 0;

      completionEvents.push({
        ...getLevelAnalyticsPayload(levelId),
        mode,
        durationSeconds: Math.floor(durationSeconds),
        durationBucket: getDurationBucket(durationSeconds),
        foundDifferences: foundCount,
        mistakes,
        accuracy: Number(accuracy.toFixed(4)),
        isReplay: wasAlreadyCompleted,
        completedLevels: completedLevels.length,
        rewardMagnifiers: level.reward.magnifiers ?? 0,
        magnifiersAfterReward: nextSave.magnifiers,
        artifactUnlockCount,
        queuedReviewCheck: shouldQueueReviewCheck,
        queuedInterstitialCheck: shouldQueueInterstitialCheck
      });

      return {
        saveData: nextSave,
        reviewPromptRuntime: shouldQueueReviewCheck
          ? {
              ...state.reviewPromptRuntime,
              pendingMapCheckToken: state.reviewPromptRuntime.pendingMapCheckToken + 1,
              pendingMapCheckCompletedLevels: completedLevels.length
            }
          : state.reviewPromptRuntime,
        interstitialRuntime: shouldQueueInterstitialCheck
          ? {
              ...state.interstitialRuntime,
              pendingMapCheckCompletedLevels: completedLevels.length
            }
          : state.interstitialRuntime
      };
    });
    const completionPayload = completionEvents[0];
    if (completionPayload) {
      trackAnalyticsEvent("level_complete", completionPayload);
      if (mode === "campaign" && !completionPayload.isReplay) {
        trackAnalyticsEvent("campaign_progress", completionPayload);
      }
    }
    void get().save({ flush: true });
  },
  spendMagnifiers(amount) {
    const current = get().saveData.magnifiers;
    if (current < amount) return false;
    set((state) => ({ saveData: { ...state.saveData, magnifiers: current - amount } }));
    trackAnalyticsEvent("magnifiers_spent", {
      amount,
      magnifiersBefore: current,
      magnifiersAfter: current - amount
    });
    void get().save({ flush: true });
    return true;
  },
  setLocale(locale) {
    const previousLocale = get().saveData.settings.locale;
    set((state) => ({
      saveData: { ...state.saveData, settings: { ...state.saveData.settings, locale, localeSource: "manual" } }
    }));
    trackAnalyticsEvent("settings_language_changed", {
      previousLanguage: previousLocale,
      language: locale
    });
    void get().save({ flush: true });
  },
  setAutoLocale(locale) {
    set((state) => {
      if (state.saveData.settings.localeSource === "manual") return state;
      if (state.saveData.settings.locale === locale && state.saveData.settings.localeSource === "auto") return state;
      return {
        saveData: {
          ...state.saveData,
          settings: { ...state.saveData.settings, locale, localeSource: "auto" }
        }
      };
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
              state.saveData.inProgress.elapsedActiveSeconds + increment
            )
          }
        }
      };
    });
    if (options?.save ?? true) {
      void get().save({ flush: options?.flush ?? false });
    }
  },
  claimDailyReward(date) {
    const previousDaily = get().saveData.daily;
    if (previousDaily.lastClaimDate === date) return;
    set((state) => {
      return {
        saveData: {
          ...state.saveData,
          magnifiers: Math.min(state.saveData.magnifiers + 1, MAX_MAGNIFIERS),
          daily: { lastClaimDate: date, streak: state.saveData.daily.streak + 1 }
        }
      };
    });
    trackAnalyticsEvent("daily_reward_claimed", {
      date,
      previousClaimDate: previousDaily.lastClaimDate,
      streak: previousDaily.streak + 1
    });
    void get().save({ flush: true });
  },
  clearPendingReviewPromptCheck() {
    set((state) => ({
      reviewPromptRuntime: {
        ...state.reviewPromptRuntime,
        pendingMapCheckCompletedLevels: null
      }
    }));
  },
  clearPendingInterstitialCheck() {
    set((state) => ({
      interstitialRuntime: {
        ...state.interstitialRuntime,
        pendingMapCheckCompletedLevels: null
      }
    }));
  },
  setInterstitialNativeRequestInFlight(value) {
    set((state) => ({
      interstitialRuntime: {
        ...state.interstitialRuntime,
        nativeRequestInFlight: value
      }
    }));
  },
  setInterstitialResolved(completedLevels) {
    set((state) => ({
      interstitialRuntime: {
        ...state.interstitialRuntime,
        pendingMapCheckCompletedLevels: null,
        lastResolvedCompletedLevels: Math.max(
          state.interstitialRuntime.lastResolvedCompletedLevels,
          completedLevels
        ),
        nativeRequestInFlight: false
      }
    }));
  },
  markReviewPromptShown() {
    set((state) => ({
      saveData: {
        ...state.saveData,
        reviewPrompt: {
          ...state.saveData.reviewPrompt,
          prePromptShownCount: Math.min(state.saveData.reviewPrompt.prePromptShownCount + 1, 2)
        }
      },
      reviewPromptRuntime: {
        ...state.reviewPromptRuntime,
        pendingMapCheckCompletedLevels: null
      }
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
                : reviewPrompt.nextEligibleCompletedLevel
          }
        }
      };
    });
    void get().save();
  },
  setReviewNativeRequestInFlight(value) {
    set((state) => ({
      reviewPromptRuntime: {
        ...state.reviewPromptRuntime,
        nativeRequestInFlight: value
      }
    }));
  },
  setReviewNativeResolved(value) {
    set((state) => ({
      saveData: {
        ...state.saveData,
        reviewPrompt: {
          ...state.saveData.reviewPrompt,
          nativeReviewResolved: value
        }
      }
    }));
    void get().save();
  },
  setReviewUnavailableReason(reason) {
    set((state) => ({
      saveData: {
        ...state.saveData,
        reviewPrompt: {
          ...state.saveData.reviewPrompt,
          lastUnavailableReason: reason
        }
      }
    }));
    void get().save();
  },
  resetLevelProgress(levelId) {
    const inProgress = get().saveData.inProgress;
    set((state) => {
      if (state.saveData.inProgress?.levelId !== levelId) return state;
      return { saveData: { ...state.saveData, inProgress: null } };
    });
    if (inProgress?.levelId === levelId) {
      trackAnalyticsEvent("level_retry", {
        ...getLevelAnalyticsPayload(levelId),
        foundDifferences: inProgress.foundDifferenceIds.length,
        mistakes: inProgress.mistakes,
        elapsedActiveSeconds: Math.floor(inProgress.elapsedActiveSeconds)
      });
    }
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
        nativeRequestInFlight: false
      },
      interstitialRuntime: {
        pendingMapCheckCompletedLevels: null,
        lastResolvedCompletedLevels: 0,
        nativeRequestInFlight: false
      }
    });
  },
}));
