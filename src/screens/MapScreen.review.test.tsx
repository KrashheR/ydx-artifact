import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { mockPlatform } from "@/services/platform/mockPlatform";
import { MapScreen } from "@/screens/MapScreen";
import { useGameStore } from "@/shared/store/gameStore";

describe("MapScreen review prompt flow", () => {
  beforeEach(() => {
    const firstFourLevels = getChapterLevels("northern-route").slice(0, 4).map((level) => level.id);
    const saveData = createDefaultSave();

    useGameStore.setState({
      screen: { kind: "map", chapterId: "northern-route" },
      saveData: {
        ...saveData,
        completedLevels: firstFourLevels
      },
      reviewPromptRuntime: {
        pendingMapCheckToken: 1,
        pendingMapCheckCompletedLevels: 4,
        nativeRequestInFlight: false
      }
    });
  });

  afterEach(() => {
    mockPlatform.setReviewGatewayOverride(null);
  });

  it("does not show the pre-prompt on the map while a post-level check is pending", async () => {
    const gateway = {
      canReview: vi.fn(async () => ({ value: true })),
      requestReview: vi.fn(async () => ({ feedbackSent: false }))
    };
    mockPlatform.setReviewGatewayOverride(gateway);

    render(<MapScreen onOpenSettings={() => undefined} />);

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 650));
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(gateway.canReview).not.toHaveBeenCalled();
  });
});
