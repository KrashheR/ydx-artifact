import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { mockPlatform } from "@/services/platform/mockPlatform";
import { MapScreen } from "@/screens/MapScreen";
import { useGameStore } from "@/shared/store/gameStore";

describe("MapScreen interstitial flow", () => {
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
        pendingMapCheckToken: 0,
        pendingMapCheckCompletedLevels: null,
        nativeRequestInFlight: false
      },
      interstitialRuntime: {
        pendingMapCheckCompletedLevels: 3,
        lastResolvedCompletedLevels: 0,
        nativeRequestInFlight: false
      }
    });
  });

  afterEach(() => {
    mockPlatform.setInterstitialGatewayOverride(null);
  });

  it("does not show a queued interstitial on the map", async () => {
    const showInterstitial = vi.fn(async () => "closed" as const);
    mockPlatform.setInterstitialGatewayOverride({ showInterstitial });

    render(<MapScreen onOpenSettings={() => undefined} />);

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
    });

    expect(showInterstitial).not.toHaveBeenCalled();
    expect(useGameStore.getState().interstitialRuntime.pendingMapCheckCompletedLevels).toBe(3);
  });

  it("queues the next interstitial check on each third new campaign completion", () => {
    const campaignLevels = getChapterLevels("northern-route").slice(0, 3);
    useGameStore.setState({
      screen: { kind: "map", chapterId: "northern-route" },
      saveData: createDefaultSave(),
      interstitialRuntime: {
        pendingMapCheckCompletedLevels: null,
        lastResolvedCompletedLevels: 0,
        nativeRequestInFlight: false
      }
    });

    useGameStore.getState().completeLevel(campaignLevels[0].id, 42, "campaign");
    expect(useGameStore.getState().interstitialRuntime.pendingMapCheckCompletedLevels).toBeNull();

    useGameStore.getState().completeLevel(campaignLevels[1].id, 43, "campaign");
    expect(useGameStore.getState().interstitialRuntime.pendingMapCheckCompletedLevels).toBeNull();

    useGameStore.getState().completeLevel(campaignLevels[2].id, 44, "campaign");
    expect(useGameStore.getState().interstitialRuntime.pendingMapCheckCompletedLevels).toBe(3);

    useGameStore.getState().completeLevel(campaignLevels[2].id, 45, "campaign");
    expect(useGameStore.getState().interstitialRuntime.pendingMapCheckCompletedLevels).toBe(3);
  });

});
