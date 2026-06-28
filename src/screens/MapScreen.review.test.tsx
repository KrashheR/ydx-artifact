import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { mockPlatform } from "@/services/platform/mockPlatform";
import { MapScreen } from "@/screens/MapScreen";
import { useGameStore } from "@/shared/store/gameStore";

describe("MapScreen review prompt flow", () => {
  beforeEach(() => {
    const firstThreeLevels = getChapterLevels("northern-route").slice(0, 3).map((level) => level.id);
    const saveData = createDefaultSave();

    useGameStore.setState({
      screen: { kind: "map", chapterId: "northern-route" },
      saveData: {
        ...saveData,
        completedLevels: firstThreeLevels
      },
      reviewPromptRuntime: {
        pendingMapCheckToken: 1,
        pendingMapCheckCompletedLevels: 3,
        nativeRequestInFlight: false
      }
    });
  });

  afterEach(() => {
    mockPlatform.setReviewGatewayOverride(null);
  });

  it("shows the pre-prompt on the map and reschedules after Later", async () => {
    mockPlatform.setReviewGatewayOverride({
      canReview: vi.fn(async () => ({ value: true })),
      requestReview: vi.fn(async () => ({ feedbackSent: true }))
    });

    render(<MapScreen />);

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 650));
    });

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Позже" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    const { reviewPrompt } = useGameStore.getState().saveData;
    expect(reviewPrompt.prePromptShownCount).toBe(1);
    expect(reviewPrompt.nextEligibleCompletedLevel).toBe(8);
  });

  it("requests the native review flow only once on rapid double click and resolves the scenario", async () => {
    const gateway = {
      canReview: vi.fn(async () => ({ value: true })),
      requestReview: vi.fn(async () => ({ feedbackSent: false }))
    };
    mockPlatform.setReviewGatewayOverride(gateway);

    render(<MapScreen />);

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 650));
    });

    const button = await screen.findByRole("button", { name: "Оценить игру" });
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(gateway.requestReview).toHaveBeenCalledTimes(1));
    expect(useGameStore.getState().saveData.reviewPrompt.nativeReviewResolved).toBe(true);
  });
});
