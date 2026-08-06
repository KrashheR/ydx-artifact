import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import {
  dailyArchiveLevels,
  getDailyArchiveDateKey,
} from "@/content/dailyArchive";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { GameScreen } from "@/screens/GameScreen";
import { mockPlatform } from "@/services/platform/mockPlatform";
import { useGameStore } from "@/shared/store/gameStore";

vi.mock("@/features/gameplay/PhotoComparator", () => ({
  PhotoComparator: ({
    level,
    hintId,
    onDifference,
  }: {
    level: { differences: { id: string }[] };
    hintId?: string;
    onDifference: (differenceId: string) => void;
  }) => (
    <div>
      {hintId ? <div data-testid="active-hint">{hintId}</div> : null}
      {level.differences.map((difference) => (
        <button
          key={difference.id}
          type="button"
          onClick={() => onDifference(difference.id)}
        >
          find {difference.id}
        </button>
      ))}
    </div>
  ),
}));

describe("GameScreen", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mockPlatform.setRewardedGatewayOverride(null);
    mockPlatform.setInterstitialGatewayOverride(null);
    mockPlatform.setReviewGatewayOverride(null);
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
    window.__artifactAnalyticsEvents = [];
  });

  async function completeRenderedLevel(level: ReturnType<typeof getChapterLevels>[number]) {
    for (const difference of level.differences) {
      fireEvent.click(
        screen.getByRole("button", { name: `find ${difference.id}` }),
      );
      await waitFor(() => {
        expect(
          useGameStore.getState().saveData.inProgress?.foundDifferenceIds ??
            useGameStore.getState().saveData.completedLevels,
        ).toContain(difference.id);
      });
    }

    await waitFor(() => {
      expect(useGameStore.getState().saveData.completedLevels).toContain(level.id);
    });
  }

  it("returns to the current campaign level select from the completion overlay", async () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    await completeRenderedLevel(level);

    const levelSelectButton = await screen.findByRole("button", {
      name: /К выбору уровней|Level Select/,
    });
    fireEvent.click(levelSelectButton);

    await waitFor(() => {
      expect(useGameStore.getState().screen).toEqual({
        kind: "map",
        chapterId: "northern-route",
      });
    });
  });

  it("marks the two-photo compare layout for the mobile landscape HUD", () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.setState((state) => ({
      saveData: {
        ...state.saveData,
        settings: {
          ...state.saveData.settings,
          comparatorScheme: "side-by-side",
        },
      },
    }));

    const { container } = render(
      <GameScreen levelId={level.id} mode="campaign" />,
    );

    expect(container.querySelector(".game-screen")).toHaveClass(
      "game-screen--side-by-side",
    );
  });

  it("shows a queued interstitial only when the player clicks next level", async () => {
    const levels = getChapterLevels("northern-route");
    const level = levels[1];
    const showInterstitial = vi.fn(async () => "closed" as const);
    mockPlatform.setInterstitialGatewayOverride({ showInterstitial });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, completedLevels: [levels[0].id] },
      interstitialRuntime: {
        campaignCompletions: 1,
        completionsSinceLastAd: 1,
        pendingToken: null,
        lastResolvedToken: 0,
        nativeRequestInFlight: false,
      },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    await completeRenderedLevel(level);

    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBe(2);
    expect(showInterstitial).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole("button", { name: /3/ }));

    await waitFor(() => expect(showInterstitial).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(useGameStore.getState().screen).toEqual({
        kind: "game",
        levelId: levels[2].id,
        mode: "campaign",
      });
    });
    expect(useGameStore.getState().interstitialRuntime).toMatchObject({
      pendingToken: null,
      lastResolvedToken: 2,
      nativeRequestInFlight: false,
    });
  });

  it("still shows the queued interstitial when the player returns to the map", async () => {
    const levels = getChapterLevels("northern-route");
    const level = levels[1];
    const showInterstitial = vi.fn(async () => "closed" as const);
    mockPlatform.setInterstitialGatewayOverride({ showInterstitial });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, completedLevels: [levels[0].id] },
      interstitialRuntime: {
        campaignCompletions: 1,
        completionsSinceLastAd: 1,
        pendingToken: null,
        lastResolvedToken: 0,
        nativeRequestInFlight: false,
      },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);
    await completeRenderedLevel(level);

    fireEvent.click(
      await screen.findByRole("button", { name: /К выбору уровней|Level Select/ }),
    );

    await waitFor(() => expect(showInterstitial).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(useGameStore.getState().screen).toEqual({
        kind: "map",
        chapterId: "northern-route",
      });
    });
  });

  it("skips the campaign interstitial for the no forced ads entitlement", async () => {
    const levels = getChapterLevels("northern-route");
    const level = levels[1];
    const showInterstitial = vi.fn(async () => "closed" as const);
    mockPlatform.setInterstitialGatewayOverride({ showInterstitial });
    useGameStore.setState((state) => ({
      saveData: {
        ...state.saveData,
        completedLevels: [levels[0].id],
        purchases: { ...state.saveData.purchases, noForcedInterstitials: true },
      },
      interstitialRuntime: {
        campaignCompletions: 1,
        completionsSinceLastAd: 1,
        pendingToken: null,
        lastResolvedToken: 0,
        nativeRequestInFlight: false,
      },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);
    await completeRenderedLevel(level);

    fireEvent.click(await screen.findByRole("button", { name: /3/ }));

    await waitFor(() => {
      expect(useGameStore.getState().screen).toMatchObject({ kind: "game" });
    });
    expect(showInterstitial).not.toHaveBeenCalled();
  });

  it("suppresses the campaign interstitial right after a rewarded video", async () => {
    const levels = getChapterLevels("northern-route");
    const level = levels[1];
    const showInterstitial = vi.fn(async () => "closed" as const);
    mockPlatform.setInterstitialGatewayOverride({ showInterstitial });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, completedLevels: [levels[0].id] },
      interstitialRuntime: {
        campaignCompletions: 1,
        completionsSinceLastAd: 1,
        pendingToken: null,
        lastResolvedToken: 0,
        nativeRequestInFlight: false,
      },
      adRuntime: { lastRewardedShownAt: Date.now() - 1_000 },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);
    await completeRenderedLevel(level);

    fireEvent.click(await screen.findByRole("button", { name: /3/ }));

    await waitFor(() => {
      expect(useGameStore.getState().screen).toMatchObject({ kind: "game" });
    });
    expect(showInterstitial).not.toHaveBeenCalled();
    expect(
      window.__artifactAnalyticsEvents?.some(
        (event) =>
          event.event === "interstitial_suppressed" &&
          event.payload.reason === "recent_rewarded",
      ),
    ).toBe(true);
  });

  it("shows the review pre-prompt after the fourth campaign victory and keeps its buttons clickable", async () => {
    const levels = getChapterLevels("northern-route");
    const level = levels[3];
    mockPlatform.setReviewGatewayOverride({
      canReview: vi.fn(async () => ({ value: true })),
      requestReview: vi.fn(async () => ({ feedbackSent: true })),
    });
    useGameStore.setState((state) => ({
      saveData: {
        ...state.saveData,
        completedLevels: [levels[0].id, levels[1].id, levels[2].id],
      },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    await completeRenderedLevel(level);

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument(), {
      timeout: 1200,
    });
    fireEvent.click(screen.getByRole("button", { name: /Позже|Later/ }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(useGameStore.getState().saveData.reviewPrompt).toMatchObject({
      prePromptShownCount: 1,
      nextEligibleCompletedLevel: 9,
    });
  });

  async function completeRenderedDaily(level: (typeof dailyArchiveLevels)[number]) {
    for (const difference of level.differences) {
      fireEvent.click(
        screen.getByRole("button", { name: `find ${difference.id}` }),
      );
      await waitFor(() => {
        expect(
          useGameStore.getState().saveData.inProgress?.foundDifferenceIds ?? [],
        ).toContain(difference.id);
      });
    }
    await screen.findByText(/Награда дня|Daily reward/i);
  }

  it("grants exactly one daily magnifier after the rewarded video and skips the interstitial", async () => {
    const level = dailyArchiveLevels[0];
    const showRewarded = vi.fn(async () => "rewarded" as const);
    const showInterstitial = vi.fn(async () => "closed" as const);
    mockPlatform.setRewardedGatewayOverride({ showRewarded });
    mockPlatform.setInterstitialGatewayOverride({ showInterstitial });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(level.id, "daily");

    render(<GameScreen levelId={level.id} mode="daily" />);
    await completeRenderedDaily(level);

    fireEvent.click(
      screen.getByRole("button", { name: /за рекламу|for an ad/i }),
    );

    await waitFor(() => {
      expect(useGameStore.getState().saveData.magnifiers).toBe(1);
    });
    await waitFor(() => {
      expect(useGameStore.getState().screen).toEqual({ kind: "home" });
    });
    expect(showRewarded).toHaveBeenCalledTimes(1);
    expect(showInterstitial).not.toHaveBeenCalled();
    expect(useGameStore.getState().saveData.daily.streak).toBe(1);
  });

  it("shows the interstitial when the daily reward is declined and still returns to the hub", async () => {
    const level = dailyArchiveLevels[0];
    const showInterstitial = vi.fn(async () => "closed" as const);
    mockPlatform.setInterstitialGatewayOverride({ showInterstitial });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(level.id, "daily");

    render(<GameScreen levelId={level.id} mode="daily" />);
    await completeRenderedDaily(level);

    fireEvent.click(
      screen.getByRole("button", { name: /без награды|without a reward/i }),
    );

    await waitFor(() => expect(showInterstitial).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(useGameStore.getState().screen).toEqual({ kind: "home" });
    });
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
    // The streak lands regardless of the ad choice.
    expect(useGameStore.getState().saveData.daily.streak).toBe(1);
  });

  it("returns to the archive hub even when the daily interstitial fails", async () => {
    const level = dailyArchiveLevels[0];
    const showInterstitial = vi.fn(async () => "failed" as const);
    mockPlatform.setInterstitialGatewayOverride({ showInterstitial });
    useGameStore.getState().startLevel(level.id, "daily");

    render(<GameScreen levelId={level.id} mode="daily" />);
    await completeRenderedDaily(level);

    fireEvent.click(
      screen.getByRole("button", { name: /без награды|without a reward/i }),
    );

    await waitFor(() => {
      expect(useGameStore.getState().screen).toEqual({ kind: "home" });
    });
  });

  it("keeps the daily reward failure recoverable without granting a magnifier", async () => {
    const level = dailyArchiveLevels[0];
    const showRewarded = vi.fn(async () => "failed" as const);
    mockPlatform.setRewardedGatewayOverride({ showRewarded });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(level.id, "daily");

    render(<GameScreen levelId={level.id} mode="daily" />);
    await completeRenderedDaily(level);

    fireEvent.click(
      screen.getByRole("button", { name: /за рекламу|for an ad/i }),
    );

    await screen.findByText(/недоступна|unavailable/i);
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
    expect(useGameStore.getState().saveData.daily.streak).toBe(1);
    expect(useGameStore.getState().screen).not.toEqual({ kind: "home" });
  });

  it("hides the daily reward offer once the day's magnifier was already granted", async () => {
    const level = dailyArchiveLevels[0];
    useGameStore.setState((state) => ({
      saveData: {
        ...state.saveData,
        daily: {
          ...state.saveData.daily,
          lastAdRewardDate: getDailyArchiveDateKey(),
        },
      },
    }));
    useGameStore.getState().startLevel(level.id, "daily");

    render(<GameScreen levelId={level.id} mode="daily" />);

    for (const difference of level.differences) {
      fireEvent.click(
        screen.getByRole("button", { name: `find ${difference.id}` }),
      );
      await waitFor(() => {
        expect(
          useGameStore.getState().saveData.inProgress?.foundDifferenceIds ?? [],
        ).toContain(difference.id);
      });
    }

    await screen.findByText(/Дело дня закрыто|Daily case closed/i);
    expect(
      screen.queryByRole("button", { name: /за рекламу|for an ad/i }),
    ).not.toBeInTheDocument();
  });

  it("does not spend another magnifier while an area hint is already active", async () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 2 },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    const hintedDifference = level.differences[0];
    const hintButton = screen.getByRole("button", { name: /Подсказка|Hint/ });
    fireEvent.click(hintButton);

    await screen.findByTestId("active-hint");
    expect(screen.getByTestId("active-hint")).toHaveTextContent(
      hintedDifference.id,
    );
    expect(useGameStore.getState().saveData.magnifiers).toBe(1);

    fireEvent.click(hintButton);

    expect(useGameStore.getState().saveData.magnifiers).toBe(1);
    expect(hintButton).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: `find ${hintedDifference.id}` }),
    );

    await waitFor(() => {
      expect(screen.queryByTestId("active-hint")).not.toBeInTheDocument();
    });
  });

  it("shows a rewarded ad and then applies an area hint when magnifiers are empty", async () => {
    const level = getChapterLevels("northern-route")[0];
    const showRewarded = vi.fn(async () => "rewarded" as const);
    mockPlatform.setRewardedGatewayOverride({ showRewarded });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    fireEvent.click(screen.getByRole("button", { name: /рекламу|ad/i }));
    expect(
      screen.getByRole("dialog", { name: /подсказку|hint/i }),
    ).toBeInTheDocument();
    expect(showRewarded).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Посмотреть|Watch/i }));

    await screen.findByTestId("active-hint");
    expect(showRewarded).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("active-hint")).toHaveTextContent(
      level.differences[0].id,
    );
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
  });

  it("closes the rewarded hint modal from the top-right close button", async () => {
    const level = getChapterLevels("northern-route")[0];
    const showRewarded = vi.fn(async () => "rewarded" as const);
    mockPlatform.setRewardedGatewayOverride({ showRewarded });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    fireEvent.click(screen.getByRole("button", { name: /рекламу|ad/i }));
    expect(
      screen.getByRole("dialog", { name: /подсказку|hint/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Закрыть|Close/i }));

    expect(
      screen.queryByRole("dialog", { name: /подсказку|hint/i }),
    ).not.toBeInTheDocument();
    expect(showRewarded).not.toHaveBeenCalled();
  });

  it("allows watching another rewarded ad for another area hint while the previous ad hint is still active", async () => {
    const level = getChapterLevels("northern-route")[0];
    const showRewarded = vi.fn(async () => "rewarded" as const);
    mockPlatform.setRewardedGatewayOverride({ showRewarded });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    const hintButton = screen.getByRole("button", { name: /рекламу|ad/i });
    fireEvent.click(hintButton);
    fireEvent.click(screen.getByRole("button", { name: /Посмотреть|Watch/i }));

    await screen.findByTestId("active-hint");
    expect(screen.getByTestId("active-hint")).toHaveTextContent(
      level.differences[0].id,
    );

    await waitFor(() => expect(hintButton).not.toBeDisabled());
    fireEvent.click(hintButton);
    fireEvent.click(screen.getByRole("button", { name: /Посмотреть|Watch/i }));

    await waitFor(() => {
      expect(showRewarded).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId("active-hint")).toHaveTextContent(
        level.differences[1].id,
      );
    });
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
  });

  it("does not apply an area hint when the rewarded ad closes without a reward", async () => {
    const level = getChapterLevels("northern-route")[0];
    const showRewarded = vi.fn(async () => "closed" as const);
    mockPlatform.setRewardedGatewayOverride({ showRewarded });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    fireEvent.click(screen.getByRole("button", { name: /рекламу|ad/i }));
    fireEvent.click(screen.getByRole("button", { name: /Посмотреть|Watch/i }));

    await waitFor(() => expect(showRewarded).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId("active-hint")).not.toBeInTheDocument();
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
  });

  function timeOutCurrentLevel(levelId: string) {
    useGameStore.getState().addActiveLevelTime(levelId, 300, { save: false });
  }

  it("grants exactly sixty seconds for one rewarded timeout extension per attempt", async () => {
    const level = getChapterLevels("northern-route")[0];
    const showRewarded = vi.fn(async () => "rewarded" as const);
    mockPlatform.setRewardedGatewayOverride({ showRewarded });
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);
    timeOutCurrentLevel(level.id);

    const adButton = await screen.findByRole("button", {
      name: /\+60|60 seconds|60 секунд/i,
    });
    const foundBefore =
      useGameStore.getState().saveData.inProgress?.foundDifferenceIds.length ?? 0;
    fireEvent.click(adButton);

    await waitFor(() => {
      expect(
        useGameStore.getState().saveData.inProgress?.timeGrantedSeconds,
      ).toBe(60);
    });
    const attempt = useGameStore.getState().saveData.inProgress;
    expect(attempt?.rewardedTimeExtensionUsed).toBe(true);
    // Attempt progress is carried into the extended run.
    expect(attempt?.foundDifferenceIds).toHaveLength(foundBefore);
    expect(showRewarded).toHaveBeenCalledTimes(1);
  });

  it("offers the rewarded extension only once per attempt", async () => {
    const level = getChapterLevels("northern-route")[0];
    mockPlatform.setRewardedGatewayOverride({
      showRewarded: vi.fn(async () => "rewarded" as const),
    });
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);
    timeOutCurrentLevel(level.id);

    fireEvent.click(
      await screen.findByRole("button", { name: /\+60|60 seconds|60 секунд/i }),
    );
    await waitFor(() => {
      expect(
        useGameStore.getState().saveData.inProgress?.rewardedTimeExtensionUsed,
      ).toBe(true);
    });

    // Run the clock out again on the same attempt.
    timeOutCurrentLevel(level.id);

    await screen.findByRole("button", { name: /Начать заново|Start Over/i });
    expect(
      screen.queryByRole("button", { name: /\+60|60 seconds|60 секунд/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps the used-extension flag after a reload of the same attempt", async () => {
    const level = getChapterLevels("northern-route")[0];
    mockPlatform.setRewardedGatewayOverride({
      showRewarded: vi.fn(async () => "rewarded" as const),
    });
    useGameStore.getState().startLevel(level.id, "campaign");

    const view = render(<GameScreen levelId={level.id} mode="campaign" />);
    timeOutCurrentLevel(level.id);
    fireEvent.click(
      await screen.findByRole("button", { name: /\+60|60 seconds|60 секунд/i }),
    );
    await waitFor(() => {
      expect(
        useGameStore.getState().saveData.inProgress?.rewardedTimeExtensionUsed,
      ).toBe(true);
    });
    view.unmount();

    // A reload rehydrates the same persisted attempt and remounts the screen.
    render(<GameScreen levelId={level.id} mode="campaign" />);
    timeOutCurrentLevel(level.id);

    await screen.findByRole("button", { name: /Начать заново|Start Over/i });
    expect(
      screen.queryByRole("button", { name: /\+60|60 seconds|60 секунд/i }),
    ).not.toBeInTheDocument();
  });

  it("does not grant time when the rewarded extension is closed early", async () => {
    const level = getChapterLevels("northern-route")[0];
    mockPlatform.setRewardedGatewayOverride({
      showRewarded: vi.fn(async () => "closed" as const),
    });
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);
    timeOutCurrentLevel(level.id);

    fireEvent.click(
      await screen.findByRole("button", { name: /\+60|60 seconds|60 секунд/i }),
    );

    await waitFor(() => {
      expect(
        useGameStore.getState().saveData.inProgress?.rewardedTimeExtensionUsed,
      ).toBe(false);
    });
    expect(
      useGameStore.getState().saveData.inProgress?.timeGrantedSeconds,
    ).toBe(0);
  });

  it("prevents native context menus, text selection, and browser dragging during gameplay", () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    const contextMenuEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(contextMenuEvent);
    expect(contextMenuEvent.defaultPrevented).toBe(true);

    const selectStartEvent = new Event("selectstart", {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(selectStartEvent);
    expect(selectStartEvent.defaultPrevented).toBe(true);

    const dragStartEvent = new Event("dragstart", {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(dragStartEvent);
    expect(dragStartEvent.defaultPrevented).toBe(true);
  });

  it("shows rewarded hint failures inside the modal instead of a native alert", async () => {
    const level = getChapterLevels("northern-route")[0];
    const showRewarded = vi.fn(async () => "failed" as const);
    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => undefined);
    mockPlatform.setRewardedGatewayOverride({ showRewarded });
    useGameStore.setState((state) => ({
      saveData: { ...state.saveData, magnifiers: 0 },
    }));
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    fireEvent.click(screen.getByRole("button", { name: /рекламу|ad/i }));
    fireEvent.click(screen.getByRole("button", { name: /Посмотреть|Watch/i }));

    await screen.findByText(/недоступна|unavailable/i);
    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.queryByTestId("active-hint")).not.toBeInTheDocument();
  });
});
