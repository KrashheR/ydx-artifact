import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@/i18n";
import { chapterList } from "@/content/chapters";
import { getCampaignCardPreviewAsset } from "@/content/sceneAssets";
import { createDefaultSave } from "@/entities/save/schema";
import { MapScreen } from "@/screens/MapScreen";
import { useGameStore } from "@/shared/store/gameStore";

describe("MapScreen", () => {
  it("has a map node position for every playable chapter level", () => {
    for (const chapter of chapterList) {
      expect(chapter.mapPoints).toHaveLength(chapter.levels.length);
    }
  });

  it("keeps campaign map aspect ratios aligned with the authored background assets", () => {
    expect(chapterList.map((chapter) => chapter.aspectRatio)).toEqual([
      1672 / 941,
      1586 / 992,
      1672 / 941
    ]);
  });

  it("builds campaign card preview paths from the configured runtime format for each chapter", () => {
    expect(getCampaignCardPreviewAsset("northern-route", 3)).toBe("/assets/scenes/northern-route/3/1.webp");
    expect(getCampaignCardPreviewAsset("sand-meridian", 7)).toBe("/assets/scenes/sand-meredian/7/1.webp");
    expect(getCampaignCardPreviewAsset("emerald-meridian", 12)).toBe("/assets/scenes/emerald-meridian/12/1.webp");
  });

  it("keeps the mounted chapter stable while the map exits to home", () => {
    useGameStore.setState({
      screen: { kind: "map", chapterId: "sand-meridian" },
      saveData: createDefaultSave(),
      reviewPromptRuntime: {
        pendingMapCheckToken: 0,
        pendingMapCheckCompletedLevels: null,
        nativeRequestInFlight: false
      }
    });

    render(<MapScreen onOpenSettings={() => undefined} />);

    expect(screen.getByRole("heading", { name: "Песчаный меридиан" })).toBeInTheDocument();

    act(() => {
      useGameStore.setState({ screen: { kind: "home" } });
    });

    expect(screen.getByRole("heading", { name: "Песчаный меридиан" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Белый меридиан" })).not.toBeInTheDocument();
  });
});
