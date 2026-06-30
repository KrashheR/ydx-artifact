import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
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
        <button key={difference.id} type="button" onClick={() => onDifference(difference.id)}>
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
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    mockPlatform.setRewardedGatewayOverride(null);
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
        pendingMapCheckCompletedLevels: null,
        lastResolvedCompletedLevels: 0,
        nativeRequestInFlight: false,
      },
    });
  });

  it("returns to the current campaign level select from the completion overlay", async () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    for (const difference of level.differences) {
      fireEvent.click(screen.getByRole("button", { name: `find ${difference.id}` }));
      await waitFor(() => {
        expect(useGameStore.getState().saveData.inProgress?.foundDifferenceIds).toContain(difference.id);
      });
    }

    const levelSelectButton = await screen.findByRole("button", { name: /К выбору уровней|Level Select/ });
    fireEvent.click(levelSelectButton);

    await waitFor(() => {
      expect(useGameStore.getState().screen).toEqual({
        kind: "map",
        chapterId: "northern-route",
      });
    });
  });

  it("does not spend another magnifier while an area hint is already active", async () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.getState().startLevel(level.id, "campaign");

    render(<GameScreen levelId={level.id} mode="campaign" />);

    const hintedDifference = level.differences[0];
    const hintButton = screen.getByRole("button", { name: /Подсказка|Hint/ });
    fireEvent.click(hintButton);

    await screen.findByTestId("active-hint");
    expect(screen.getByTestId("active-hint")).toHaveTextContent(hintedDifference.id);
    expect(useGameStore.getState().saveData.magnifiers).toBe(2);

    fireEvent.click(hintButton);

    expect(useGameStore.getState().saveData.magnifiers).toBe(2);
    expect(hintButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: `find ${hintedDifference.id}` }));

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

    await screen.findByTestId("active-hint");
    expect(showRewarded).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("active-hint")).toHaveTextContent(level.differences[0].id);
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
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

    await screen.findByTestId("active-hint");
    expect(screen.getByTestId("active-hint")).toHaveTextContent(level.differences[0].id);

    await waitFor(() => expect(hintButton).not.toBeDisabled());
    fireEvent.click(hintButton);

    await waitFor(() => {
      expect(showRewarded).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId("active-hint")).toHaveTextContent(level.differences[1].id);
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

    await waitFor(() => expect(showRewarded).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId("active-hint")).not.toBeInTheDocument();
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
  });
});
