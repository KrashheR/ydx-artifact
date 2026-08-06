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
    const firstLevels = getChapterLevels("northern-route")
      .slice(0, 2)
      .map((level) => level.id);

    useGameStore.setState({
      screen: { kind: "map", chapterId: "northern-route" },
      saveData: { ...createDefaultSave(), completedLevels: firstLevels },
      reviewPromptRuntime: {
        pendingMapCheckToken: 0,
        pendingMapCheckCompletedLevels: null,
        nativeRequestInFlight: false
      },
      interstitialRuntime: {
        campaignCompletions: 2,
        completionsSinceLastAd: 2,
        pendingToken: 2,
        lastResolvedToken: 0,
        nativeRequestInFlight: false
      },
      adRuntime: { lastRewardedShownAt: null }
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
    // The queued ad survives the detour and resolves at the next victory exit.
    expect(useGameStore.getState().interstitialRuntime.pendingToken).toBe(2);
  });
});
