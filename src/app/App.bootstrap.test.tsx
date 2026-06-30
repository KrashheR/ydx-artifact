import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/app/App";
import "@/i18n";
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
      saveStatus: "idle"
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      window.setTimeout(() => callback(performance.now()), 0);
      return 1;
    });
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() }
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
      expect(document.body).toHaveTextContent("Choose Your Expedition");
      expect(document.body).not.toHaveTextContent("Выберите экспедицию");
      expect(LoadedImage.instances).toHaveLength(3);
      expect(LoadedImage.instances.every((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    });

    window.ysdk = {
      environment: { i18n: { lang: "en" } },
      features: { LoadingAPI: { ready } },
      on: vi.fn()
    };

    render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    expect(screen.queryByText("Выберите экспедицию")).not.toBeInTheDocument();

    await expect(screen.findByRole("heading", { name: "Choose Your Expedition" })).resolves.toBeVisible();
    await waitFor(() => expect(ready).toHaveBeenCalledTimes(1));
    expect(screen.queryByLabelText("Loading")).not.toBeInTheDocument();
  });
});
