import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/app/App";
import "@/i18n";
import { getChapterLevels } from "@/content/chapters";
import { createDefaultSave } from "@/entities/save/schema";
import { useGameStore } from "@/shared/store/gameStore";

class LoadedImage {
  static instances: LoadedImage[] = [];

  complete = false;
  naturalWidth = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private currentSrc = "";

  constructor() {
    LoadedImage.instances.push(this);
  }

  get src() {
    return this.currentSrc;
  }

  set src(value: string) {
    this.currentSrc = value;
    window.setTimeout(() => {
      this.complete = true;
      this.naturalWidth = 1024;
      this.onload?.();
    }, 0);
  }
}

describe("App bootstrap", () => {
  beforeEach(async () => {
    LoadedImage.instances = [];
    window.localStorage.clear();
    await i18n.changeLanguage("ru");
    useGameStore.setState({
      screen: { kind: "home" },
      saveData: createDefaultSave(),
      saveStatus: "idle",
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      window.setTimeout(() => callback(performance.now()), 0);
      return 1;
    });
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
    vi.stubGlobal("Image", LoadedImage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete window.ysdk;
  });

  it("shows the first interactive frame in the SDK locale before LoadingAPI.ready", async () => {
    const ready = vi.fn(() => {
      expect(document.documentElement.lang).toBe("en");
      expect(document.title).toBe("Spot the Differences: Expedition Mysteries");
      expect(document.body).toHaveTextContent("Boreas Pier");
      expect(document.body).toHaveTextContent("Start investigation");
      expect(document.body).not.toHaveTextContent("Выберите экспедицию");
      expect(LoadedImage.instances.length).toBeGreaterThanOrEqual(3);
      expect(
        LoadedImage.instances
          .slice(0, 3)
          .every((image) => image.complete && image.naturalWidth > 0),
      ).toBe(true);
    });

    window.ysdk = {
      environment: { i18n: { lang: "en" } },
      features: { LoadingAPI: { ready } },
      on: vi.fn(),
    };

    render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    expect(screen.queryByText("Выберите экспедицию")).not.toBeInTheDocument();

    await expect(
      screen.findByRole("heading", { name: "Boreas Pier" }),
    ).resolves.toBeVisible();
    await expect(
      screen.findByRole("button", { name: "Start investigation" }),
    ).resolves.toBeVisible();
    await waitFor(() => expect(ready).toHaveBeenCalledTimes(1));
    expect(screen.queryByLabelText("Loading")).not.toBeInTheDocument();
  });

  it("keeps the settings button available inside the gameplay HUD", async () => {
    const level = getChapterLevels("northern-route")[0];
    useGameStore.setState({
      screen: { kind: "game", levelId: level.id, mode: "campaign" },
      saveData: {
        ...createDefaultSave(),
        inProgress: {
          levelId: level.id,
          mode: "campaign",
          attemptId: "test-attempt",
          attemptNumber: 1,
          attemptStartedAt: 0,
          attemptStartedActiveSeconds: 0,
          attemptStartedFoundDifferences: 0,
          attemptStartedMistakes: 0,
          attemptStartedHints: 0,
          attemptStartedRewardedHints: 0,
          attemptStartedTimeExtensions: 0,
          terminalAt: null,
          onboarding: false,
          foundDifferenceIds: [],
          elapsedActiveSeconds: 0,
          timeGrantedSeconds: 0,
          mistakes: 0,
          hintsUsed: 0,
          hintedDifferenceIds: [],
          rewardedHintsUsed: 0,
          timeExtensionsUsed: 0,
        },
      },
    });

    render(<App />);

    const settingsButton = await screen.findByRole("button", {
      name: /Настройки|Settings/,
    });
    expect(settingsButton).not.toHaveClass("fixed");
    fireEvent.click(settingsButton);

    const dialog = await screen.findByRole("dialog", {
      name: /Настройки|Settings/,
    });
    await waitFor(() => expect(dialog).toBeVisible());
  });

  it("prevents native context menus, text selection, and browser dragging app-wide", async () => {
    render(<App />);

    await waitFor(() => {
      const contextMenuEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(contextMenuEvent);
      expect(contextMenuEvent.defaultPrevented).toBe(true);
    });

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

  it("keeps the settings button inside the map topbar", async () => {
    useGameStore.setState({
      screen: { kind: "map", chapterId: "northern-route" },
      saveData: createDefaultSave(),
    });

    render(<App />);

    const settingsButton = await screen.findByRole("button", {
      name: /Настройки|Settings/,
    });
    expect(settingsButton).not.toHaveClass("fixed");
    expect(settingsButton.closest(".map-topbar")).not.toBeNull();
    fireEvent.click(settingsButton);

    const dialog = await screen.findByRole("dialog", {
      name: /Настройки|Settings/,
    });
    await waitFor(() => expect(dialog).toBeVisible());
  });

  it("keeps the settings button inside the campaign selection topbar", async () => {
    useGameStore.setState({
      screen: { kind: "map", chapterId: "northern-route" },
      saveData: createDefaultSave(),
    });

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /Назад|Back/ }));

    const homeTopbar = await waitFor(() => {
      const topbar = document.querySelector(".home-topbar");
      expect(topbar).not.toBeNull();
      return topbar as HTMLElement;
    });
    const settingsButton = within(homeTopbar).getByRole("button", {
      name: /Настройки|Settings/,
    });
    expect(settingsButton).not.toHaveClass("fixed");
    fireEvent.click(settingsButton);

    const dialog = await screen.findByRole("dialog", {
      name: /Настройки|Settings/,
    });
    await waitFor(() => expect(dialog).toBeVisible());
  });
});
