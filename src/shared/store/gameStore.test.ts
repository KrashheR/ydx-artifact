import { beforeEach, describe, expect, it, vi } from "vitest";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { starsForAccuracy } from "@/shared/lib/progression";
import { useGameStore } from "@/shared/store/gameStore";

vi.mock("@/services/storage/localSaveService", () => ({
  clearPersistentSave: vi.fn(async () => undefined),
  loadPersistentSave: vi.fn(async () => ({
    saveData: null,
    source: "default",
    cloudAvailable: false
  })),
  savePersistentSave: vi.fn(async (saveData) => ({
    saveData,
    cloudSynced: false
  }))
}));

function resetStore() {
  useGameStore.setState({
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
    }
  });
}

function completeAttempt(levelId: string, mistakes: number, durationSeconds: number) {
  const level = getChapterLevels("northern-route").find((candidate) => candidate.id === levelId);
  if (!level) throw new Error(`Unknown level: ${levelId}`);

  useGameStore.getState().startLevel(level.id, "campaign");
  useGameStore.setState((state) => ({
    saveData: {
      ...state.saveData,
      inProgress: {
        levelId,
        foundDifferenceIds: level.differences.map((difference) => difference.id),
        elapsedActiveSeconds: durationSeconds,
        mistakes
      }
    }
  }));
  useGameStore.getState().completeLevel(level.id, durationSeconds, "campaign");
}

describe("gameStore best results", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetStore();
  });

  it("updates the saved replay result when the player earns more stars", () => {
    const level = getChapterLevels("northern-route")[0];

    completeAttempt(level.id, level.requiredDifferences + 1, 90);
    expect(starsForAccuracy(useGameStore.getState().saveData.bestResults[level.id].accuracy)).toBe(1);

    completeAttempt(level.id, 0, 80);

    const bestResult = useGameStore.getState().saveData.bestResults[level.id];
    expect(starsForAccuracy(bestResult.accuracy)).toBe(3);
    expect(bestResult.mistakes).toBe(0);
    expect(bestResult.durationSeconds).toBe(80);
  });

  it("does not downgrade saved stars when a replay is worse", () => {
    const level = getChapterLevels("northern-route")[0];

    completeAttempt(level.id, 0, 80);
    completeAttempt(level.id, level.requiredDifferences + 1, 90);

    const bestResult = useGameStore.getState().saveData.bestResults[level.id];
    expect(starsForAccuracy(bestResult.accuracy)).toBe(3);
    expect(bestResult.mistakes).toBe(0);
    expect(bestResult.durationSeconds).toBe(80);
  });
});
