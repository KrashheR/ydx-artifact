import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackAnalyticsEvent } from "@/services/analytics/analytics";

describe("trackAnalyticsEvent", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_YANDEX_METRICA_ID", "12345678");
    vi.stubGlobal("crypto", { randomUUID: () => "session-test-id" });
    window.sessionStorage.clear();
    window.__artifactAnalyticsEvents = [];
    window.ym = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    delete window.ym;
    delete window.__artifactAnalyticsEvents;
  });

  it("sends a prefixed reachGoal event to Yandex Metrica", () => {
    trackAnalyticsEvent("level_attempt_start", {
      levelId: "nr-01",
      campaignId: "northern-route",
      skipped: undefined,
    });

    expect(window.ym).toHaveBeenCalledWith(
      12345678,
      "reachGoal",
      "aa_level_attempt_start",
      expect.objectContaining({
        schemaVersion: 2,
        sessionId: "session-test-id",
        eventSequence: 1,
        levelId: "nr-01",
        campaignId: "northern-route",
      }),
    );
    expect(window.__artifactAnalyticsEvents?.[0].goal).toBe(
      "aa_level_attempt_start",
    );
    expect(
      window.__artifactAnalyticsEvents?.[0].payload.skipped,
    ).toBeUndefined();
  });

  it("keeps a local debug buffer when the counter is not configured", () => {
    vi.stubEnv("VITE_YANDEX_METRICA_ID", "");

    trackAnalyticsEvent("game_ready", { language: "ru" });

    expect(window.ym).not.toHaveBeenCalled();
    expect(window.__artifactAnalyticsEvents?.[0]).toEqual(
      expect.objectContaining({
        event: "game_ready",
        goal: "aa_game_ready",
      }),
    );
  });
});
