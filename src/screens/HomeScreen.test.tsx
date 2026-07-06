import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import i18n from "i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { getDailyArchiveEntryForDate } from "@/content/dailyArchive";
import { createDefaultSave } from "@/entities/save/schema";
import { HomeScreen } from "@/screens/HomeScreen";
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

describe("HomeScreen", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
    window.__artifactAnalyticsEvents = [];
    await i18n.changeLanguage("en");
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
      },
      artifactRevealQueue: []
    });
  });

  it("opens the current daily archive case directly in gameplay", async () => {
    const dailyEntry = getDailyArchiveEntryForDate();

    render(<HomeScreen onOpenSettings={() => undefined} />);

    const dailyCard = screen.getByText("DAILY ARCHIVE").closest("section");
    expect(dailyCard).not.toBeNull();

    fireEvent.click(within(dailyCard as HTMLElement).getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(useGameStore.getState().screen).toEqual({
        kind: "game",
        levelId: dailyEntry.levelId,
        mode: "daily"
      });
    });
    expect(window.__artifactAnalyticsEvents?.some((event) => event.event === "daily_start_clicked")).toBe(true);
  });
});
