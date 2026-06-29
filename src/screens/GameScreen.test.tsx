import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { GameScreen } from "@/screens/GameScreen";
import { useGameStore } from "@/shared/store/gameStore";

vi.mock("@/features/gameplay/PhotoComparator", () => ({
  PhotoComparator: ({
    level,
    onDifference,
  }: {
    level: { differences: { id: string }[] };
    onDifference: (differenceId: string) => void;
  }) => (
    <div>
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
});
