export type RewardedResult = "rewarded" | "closed" | "failed";

export const mockPlatform = {
  mode: import.meta.env.VITE_PLATFORM_MODE ?? "mock",
  async init() {
    return { sdkReady: false, localMock: true };
  },
  async showRewarded(): Promise<RewardedResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    return "rewarded";
  },
  async copyDiagnostics(payload: unknown) {
    await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
  }
};
