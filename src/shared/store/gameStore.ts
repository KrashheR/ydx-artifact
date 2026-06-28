import { create } from "zustand";
import {
  createDefaultSave,
  type ReviewUnavailableReason,
  type SaveData
} from "@/entities/save/schema";
import { allLevels, getLevelById, type ChapterId } from "@/content/chapters";
import { clearLocalSave, loadLocalSave, saveLocalSave } from "@/services/storage/localSaveService";
import { unlockedArtifactsForCompleted } from "@/shared/lib/progression";
import { buildUnlockedDevSave, DEV_ALL_CAMPAIGNS_PRODUCT_ID } from "@/shared/lib/devCheats";

type Screen =
  | { kind: "home" }
  | { kind: "map"; chapterId: ChapterId }
  | { kind: "game"; levelId: string; mode: "campaign" | "daily" }
  | { kind: "daily" }
  | { kind: "collection" }
  | { kind: "settings" };

type SaveStatus = "idle" | "saving" | "saved" | "local-only";

type ReviewPromptRuntimeState = {
  pendingMapCheckToken: number;
  pendingMapCheckCompletedLevels: number | null;
  nativeRequestInFlight: boolean;
};

type GameStore = {
  screen: Screen;
  saveData: SaveData;
  saveStatus: SaveStatus;
  reviewPromptRuntime: ReviewPromptRuntimeState;
  startedAt: number;
  hydrate: () => Promise<void>;
  save: () => Promise<void>;
  navigate: (screen: Screen) => void;
  startLevel: (levelId: string, mode?: "campaign" | "daily") => void;
  recordDifference: (levelId: string, differenceId: string) => void;
  recordMisclick: (levelId: string) => void;
  completeLevel: (
    levelId: string,
    durationSeconds: number,
    exactHintUsed: boolean,
    mode?: "campaign" | "daily"
  ) => void;
  spendMagnifiers: (amount: number) => boolean;
  setLocale: (locale: "ru" | "en") => void;
  claimDailyReward: (date: string) => void;
  clearPendingReviewPromptCheck: () => void;
  markReviewPromptShown: () => void;
  dismissReviewPrompt: () => void;
  setReviewNativeRequestInFlight: (value: boolean) => void;
  setReviewNativeResolved: (value: boolean) => void;
  setReviewUnavailableReason: (reason?: ReviewUnavailableReason) => void;
  resetLevelProgress: (levelId: string) => void;
  resetSave: () => Promise<void>;
  unlockAllDevContent: () => Promise<void>;
};

function ensureInProgress(saveData: SaveData, levelId: string): SaveData {
  if (saveData.inProgress?.levelId === levelId) return saveData;
  return {
    ...saveData,
    inProgress: {
      levelId,
      foundDifferenceIds: [],
      elapsedSeconds: 0,
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

export const useGameStore = create<GameStore>((set, get) => ({
  screen: { kind: "home" },
  saveData: createDefaultSave(),
  saveStatus: "idle",
  reviewPromptRuntime: {
    pendingMapCheckToken: 0,
    pendingMapCheckCompletedLevels: null,
    nativeRequestInFlight: false
  },
  startedAt: Date.now(),
  async hydrate() {
    const saveData = await loadLocalSave();
    set({ saveData, saveStatus: "saved" });
  },
  async save() {
    const saveData = get().saveData;
    set({ saveStatus: "saving" });
    try {
      await saveLocalSave(saveData);
      set({ saveStatus: "saved" });
    } catch {
      set({ saveStatus: "local-only" });
    }
  },
  navigate(screen) {
    set({ screen });
  },
  startLevel(levelId, mode = "campaign") {
    const level = getLevelById(levelId);
    if (!level) return;
    set((state) => ({
      screen: { kind: "game", levelId, mode },
      saveData: ensureInProgress(state.saveData, levelId)
    }));
    void get().save();
  },
  recordDifference(levelId, differenceId) {
    set((state) => {
      const saveData = ensureInProgress(state.saveData, levelId);
      const inProgress = saveData.inProgress!;
      if (inProgress.foundDifferenceIds.includes(differenceId)) return state;
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
            mistakes: inProgress.mistakes + 1
          }
        }
      };
    });
    void get().save();
  },
  completeLevel(levelId, durationSeconds, exactHintUsed, mode = "campaign") {
    set((state) => {
      const level = getLevelById(levelId);
      if (!level) return state;
      const foundCount = state.saveData.inProgress?.foundDifferenceIds.length ?? level.requiredDifferences;
      const mistakes = state.saveData.inProgress?.mistakes ?? 0;
      const accuracy = foundCount / Math.max(foundCount + mistakes, 1);
      const seals = ["completed"];
      if (accuracy >= 0.85) seals.push("accurate-eye");
      if (!exactHintUsed) seals.push("no-intervention");
      const wasAlreadyCompleted = state.saveData.completedLevels.includes(levelId);
      const completedLevels = wasAlreadyCompleted
        ? state.saveData.completedLevels
        : [...state.saveData.completedLevels, levelId];
      const nextSave = applyArtifactUnlocks({
        ...state.saveData,
        completedLevels,
        inProgress: null,
        magnifiers: state.saveData.magnifiers + (level.reward.magnifiers ?? 0),
        bestResults: {
          ...state.saveData.bestResults,
          [levelId]: {
            durationSeconds,
            accuracy,
            mistakes,
            hintsUsed: exactHintUsed ? 1 : 0,
            seals
          }
        }
      });
      const shouldQueueReviewCheck = mode === "campaign" && !wasAlreadyCompleted;

      return {
        saveData: nextSave,
        reviewPromptRuntime: shouldQueueReviewCheck
          ? {
              ...state.reviewPromptRuntime,
              pendingMapCheckToken: state.reviewPromptRuntime.pendingMapCheckToken + 1,
              pendingMapCheckCompletedLevels: completedLevels.length
            }
          : state.reviewPromptRuntime
      };
    });
    void get().save();
  },
  spendMagnifiers(amount) {
    const current = get().saveData.magnifiers;
    if (current < amount) return false;
    set((state) => ({ saveData: { ...state.saveData, magnifiers: current - amount } }));
    void get().save();
    return true;
  },
  setLocale(locale) {
    set((state) => ({
      saveData: { ...state.saveData, settings: { ...state.saveData.settings, locale } }
    }));
    void get().save();
  },
  claimDailyReward(date) {
    set((state) => {
      if (state.saveData.daily.lastClaimDate === date) return state;
      return {
        saveData: {
          ...state.saveData,
          magnifiers: state.saveData.magnifiers + 1,
          daily: { lastClaimDate: date, streak: state.saveData.daily.streak + 1 }
        }
      };
    });
    void get().save();
  },
  clearPendingReviewPromptCheck() {
    set((state) => ({
      reviewPromptRuntime: {
        ...state.reviewPromptRuntime,
        pendingMapCheckCompletedLevels: null
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
    void get().save();
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
    set((state) => {
      if (state.saveData.inProgress?.levelId !== levelId) return state;
      return { saveData: { ...state.saveData, inProgress: null } };
    });
    void get().save();
  },
  async resetSave() {
    await clearLocalSave();
    set({
      saveData: createDefaultSave(),
      screen: { kind: "home" },
      saveStatus: "idle",
      reviewPromptRuntime: {
        pendingMapCheckToken: 0,
        pendingMapCheckCompletedLevels: null,
        nativeRequestInFlight: false
      }
    });
  },
  async unlockAllDevContent() {
    const currentSave = get().saveData;
    const allLevelsAlreadyCompleted = allLevels.every((level) => currentSave.completedLevels.includes(level.id));
    const purchasesAlreadyUnlocked =
      currentSave.purchases.noForcedInterstitials
      && currentSave.purchases.productIds.includes(DEV_ALL_CAMPAIGNS_PRODUCT_ID);

    const saveData = allLevelsAlreadyCompleted && purchasesAlreadyUnlocked
      ? currentSave
      : buildUnlockedDevSave(currentSave);

    set({ saveData });
    await get().save();
  }
}));
