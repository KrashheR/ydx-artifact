import { beforeEach, describe, expect, it, vi } from "vitest";
import { dailyArchiveLevels } from "@/content/dailyArchive";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { starsForAccuracy } from "@/shared/lib/progression";
import { useGameStore } from "@/shared/store/gameStore";

vi.mock("@/services/storage/localSaveService", () => ({
  clearPersistentSave: vi.fn(async () => undefined),
  loadPersistentSave: vi.fn(async () => ({
    saveData: null,
    source: "default",
    cloudAvailable: false,
  })),
  savePersistentSave: vi.fn(async (saveData) => ({
    saveData,
    cloudSynced: false,
  })),
}));

function resetStore() {
  window.sessionStorage.clear();
  window.__artifactAnalyticsEvents = [];
  useGameStore.setState({
    screen: { kind: "home" },
    saveData: createDefaultSave(),
    saveStatus: "idle",
    reviewPromptRuntime: {
      pendingMapCheckToken: 0,
      pendingMapCheckCompletedLevels: null,
      nativeRequestInFlight: false,
    },
    interstitialRuntime: {
      campaignCompletions: 0,
      completionsSinceLastAd: 0,
      pendingToken: null,
      lastResolvedToken: 0,
      nativeRequestInFlight: false,
    },
    adRuntime: { lastRewardedShownAt: null },
    artifactRevealQueue: [],
  });
}

function completeAttempt(
  levelId: string,
  mistakes: number,
  durationSeconds: number,
) {
  const level = getChapterLevels("northern-route").find(
    (candidate) => candidate.id === levelId,
  );
  if (!level) throw new Error(`Unknown level: ${levelId}`);

  useGameStore.getState().startLevel(level.id, "campaign");
  useGameStore.setState((state) => ({
    saveData: {
      ...state.saveData,
      inProgress: {
        ...state.saveData.inProgress!,
        levelId,
        foundDifferenceIds: level.differences.map(
          (difference) => difference.id,
        ),
        elapsedActiveSeconds: durationSeconds,
        mistakes,
      },
    },
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
    expect(
      starsForAccuracy(
        useGameStore.getState().saveData.bestResults[level.id].accuracy,
      ),
    ).toBe(1);

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

describe("gameStore analytics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetStore();
  });

  it("tracks level completion duration in seconds and a stable bucket", () => {
    const level = getChapterLevels("northern-route")[0];

    completeAttempt(level.id, 1, 130);

    const completionEvent = window.__artifactAnalyticsEvents?.find(
      (event) => event.event === "level_complete",
    );
    expect(completionEvent?.goal).toBe("aa_level_complete");
    expect(completionEvent?.payload).toEqual(
      expect.objectContaining({
        levelId: level.id,
        durationSeconds: 130,
        durationBucket: "120_179s",
      }),
    );
  });

  it("keeps daily completion out of campaign progression", () => {
    const dailyLevel = dailyArchiveLevels[0];

    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(dailyLevel.id, "daily");
    useGameStore.setState((state) => ({
      saveData: {
        ...state.saveData,
        inProgress: {
          ...state.saveData.inProgress!,
          levelId: dailyLevel.id,
          foundDifferenceIds: dailyLevel.differences.map(
            (difference) => difference.id,
          ),
          elapsedActiveSeconds: 75,
          mistakes: 0,
        },
      },
    }));

    useGameStore.getState().completeLevel(dailyLevel.id, 75, "daily");

    expect(useGameStore.getState().saveData.completedLevels).toEqual([]);
    // Daily no longer hands out a free magnifier: only the rewarded video does.
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
    expect(useGameStore.getState().saveData.daily).toMatchObject({
      lastClaimDate: expect.any(String),
      streak: 1,
      lastAdRewardDate: null,
    });
    expect(
      window.__artifactAnalyticsEvents?.some(
        (event) => event.event === "campaign_progress",
      ),
    ).toBe(false);
  });

  it("records the daily streak without granting a magnifier", () => {
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 99 },
    }));

    useGameStore.getState().claimDailyReward("2026-07-07");

    expect(useGameStore.getState().saveData.magnifiers).toBe(99);
    expect(useGameStore.getState().saveData.daily.streak).toBe(1);
  });

  it("grants the rewarded daily magnifier exactly once per calendar date", () => {
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));

    expect(useGameStore.getState().grantDailyAdReward("2026-07-07")).toBe(true);
    expect(useGameStore.getState().saveData.magnifiers).toBe(1);

    expect(useGameStore.getState().grantDailyAdReward("2026-07-07")).toBe(false);
    expect(useGameStore.getState().saveData.magnifiers).toBe(1);

    expect(useGameStore.getState().grantDailyAdReward("2026-07-08")).toBe(true);
    expect(useGameStore.getState().saveData.magnifiers).toBe(2);
  });

  it("emits one terminal event and creates a new id for a restart", () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.getState().startLevel(level.id, "campaign");
    const firstAttemptId =
      useGameStore.getState().saveData.inProgress?.attemptId;

    useGameStore.getState().endLevelAttempt(level.id, "timeout");
    useGameStore.getState().endLevelAttempt(level.id, "timeout");

    const timeoutEnds = window.__artifactAnalyticsEvents?.filter(
      (event) =>
        event.event === "level_attempt_end" &&
        event.payload.outcome === "timeout",
    );
    expect(timeoutEnds).toHaveLength(1);

    useGameStore.getState().resetLevelProgress(level.id);
    expect(useGameStore.getState().saveData.inProgress).toMatchObject({
      attemptNumber: 2,
      foundDifferenceIds: [],
      elapsedActiveSeconds: 0,
    });
    expect(useGameStore.getState().saveData.inProgress?.attemptId).not.toBe(
      firstAttemptId,
    );
  });

  it("grants timer time without reducing monotonic active duration", () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.getState().startLevel(level.id, "campaign");
    useGameStore.getState().addActiveLevelTime(level.id, 300, { save: false });
    useGameStore.getState().grantLevelTime(level.id, 30);

    expect(useGameStore.getState().saveData.inProgress).toMatchObject({
      elapsedActiveSeconds: 300,
      timeGrantedSeconds: 30,
      timeExtensionsUsed: 1,
    });
  });

  it("stores used hints and withholds the no-intervention seal", () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.getState().startLevel(level.id, "campaign");
    useGameStore
      .getState()
      .recordHintUsed(level.id, level.differences[0].id, false);
    completeAttempt(level.id, 0, 80);

    expect(
      useGameStore.getState().saveData.bestResults[level.id],
    ).toMatchObject({
      hintsUsed: 1,
    });
    expect(
      useGameStore.getState().saveData.bestResults[level.id].seals,
    ).not.toContain("no-intervention");
  });

  it("resets the daily streak after a missed calendar day", () => {
    useGameStore.setState((state) => ({
      saveData: {
        ...state.saveData,
        daily: {
          lastClaimDate: "2026-07-18",
          streak: 4,
          lastAdRewardDate: null,
        },
      },
    }));

    useGameStore.getState().claimDailyReward("2026-07-21");

    expect(useGameStore.getState().saveData.daily.streak).toBe(1);
  });
});

describe("gameStore magnifier economy", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetStore();
  });

  it("never grants magnifiers automatically for campaign completions", () => {
    const levels = getChapterLevels("northern-route");
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));

    for (const level of levels.slice(0, 4)) {
      completeAttempt(level.id, 0, 80);
      expect(useGameStore.getState().saveData.magnifiers).toBe(0);
    }
  });

  it("spends two magnifiers for a paid time extension", () => {
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 2 },
    }));

    expect(useGameStore.getState().spendMagnifiers(2)).toBe(true);
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
    expect(useGameStore.getState().spendMagnifiers(2)).toBe(false);
  });
});

describe("gameStore interstitial cadence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetStore();
  });

  it("queues the first interstitial only after the second campaign completion", () => {
    const levels = getChapterLevels("northern-route");

    completeAttempt(levels[0].id, 0, 80);
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBeNull();

    completeAttempt(levels[1].id, 0, 80);
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBe(2);
  });

  it("queues the next interstitial after two further completions", () => {
    const levels = getChapterLevels("northern-route");

    completeAttempt(levels[0].id, 0, 80);
    completeAttempt(levels[1].id, 0, 80);
    useGameStore.getState().setInterstitialResolved(2);

    completeAttempt(levels[2].id, 0, 80);
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBeNull();

    completeAttempt(levels[3].id, 0, 80);
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBe(4);
  });

  it("keeps a deferred ad and the next scheduled one two completions apart", () => {
    const levels = getChapterLevels("northern-route");

    completeAttempt(levels[0].id, 0, 80);
    completeAttempt(levels[1].id, 0, 80);
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBe(2);

    // The player detours into the collection, so the queued ad is postponed
    // rather than cancelled and still pending after the next completion.
    completeAttempt(levels[2].id, 0, 80);
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBe(2);

    // It resolves at that exit; the cadence restarts from there.
    useGameStore.getState().setInterstitialResolved(2);

    completeAttempt(levels[3].id, 0, 80);
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBeNull();

    completeAttempt(levels[4].id, 0, 80);
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBe(5);
  });

  it("counts campaign replays towards the cadence", () => {
    const levels = getChapterLevels("northern-route");

    completeAttempt(levels[0].id, 0, 80);
    completeAttempt(levels[0].id, 0, 70);

    expect(useGameStore.getState().interstitialRuntime).toMatchObject({
      campaignCompletions: 2,
      completionsSinceLastAd: 2,
      pendingToken: 2,
    });
  });

  it("ignores unfinished attempts and daily completions", () => {
    const levels = getChapterLevels("northern-route");
    const dailyLevel = dailyArchiveLevels[0];

    completeAttempt(levels[0].id, 0, 80);

    useGameStore.getState().startLevel(levels[1].id, "campaign");
    useGameStore.getState().endLevelAttempt(levels[1].id, "timeout");
    useGameStore.getState().startLevel(levels[1].id, "campaign");
    useGameStore.getState().endLevelAttempt(levels[1].id, "explicit_exit");

    useGameStore.getState().startLevel(dailyLevel.id, "daily");
    useGameStore.getState().completeLevel(dailyLevel.id, 60, "daily");

    expect(useGameStore.getState().interstitialRuntime).toMatchObject({
      campaignCompletions: 1,
      completionsSinceLastAd: 1,
      pendingToken: null,
    });
  });
});

describe("gameStore campaign reports", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetStore();
  });

  it("shows a completed campaign report automatically only until it is viewed", () => {
    for (const level of getChapterLevels("northern-route")) {
      completeAttempt(level.id, 0, 80);
    }

    const report = useGameStore
      .getState()
      .getCampaignReportForCompletedCampaign("northern-route");

    expect(report?.id).toBe("white-meridian-report");
    expect(
      useGameStore.getState().shouldShowCampaignReport("northern-route"),
    ).toBe(true);

    useGameStore.getState().markCampaignReportViewed("white-meridian-report");

    expect(
      useGameStore.getState().shouldShowCampaignReport("northern-route"),
    ).toBe(false);
    expect(
      useGameStore
        .getState()
        .getCampaignReportForCompletedCampaign("northern-route")?.id,
    ).toBe("white-meridian-report");
  });
});
