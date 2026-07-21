import type {
  GameReviewGateway,
  InterstitialCallbacks,
  InterstitialResult,
  PlatformAdapter,
  RewardedResult,
  StorageLike,
  TestablePlatformAdapter,
} from "./types";

const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 50));

function browserStorage(): StorageLike | null {
  try {
    const storage = window.localStorage;
    return {
      getItem: async (key) => storage.getItem(key),
      setItem: async (key, value) => storage.setItem(key, value),
      removeItem: async (key) => storage.removeItem(key),
    };
  } catch {
    return null;
  }
}

let reviewOverride: GameReviewGateway | null = null;
let rewardedOverride: { showRewarded(): Promise<RewardedResult> } | null = null;
let interstitialOverride: { showInterstitial(callbacks?: InterstitialCallbacks): Promise<InterstitialResult> } | null = null;

export const localPlatform: TestablePlatformAdapter = {
  id: "local",
  async init() { return { sdkReady: false, localMock: true }; },
  async getEnvironmentLanguage() { return undefined; },
  async getStorage() { return browserStorage(); },
  async showRewarded(): Promise<RewardedResult> {
    if (rewardedOverride) return rewardedOverride.showRewarded();
    await wait();
    return "rewarded";
  },
  async showInterstitial(callbacks: InterstitialCallbacks = {}): Promise<InterstitialResult> {
    if (interstitialOverride) return interstitialOverride.showInterstitial(callbacks);
    callbacks.onOpen?.();
    await wait();
    callbacks.onClose?.();
    return "closed";
  },
  async canReview() { return reviewOverride?.canReview() ?? { value: false, reason: "UNKNOWN" }; },
  async requestReview() {
    if (reviewOverride) return reviewOverride.requestReview();
    throw new Error("Review API is unavailable on local platform");
  },
  async notifyLoadingStart() {},
  async notifyLoadingReady() {},
  setGameplayActive() {},
  setReviewGatewayOverride(gateway) { reviewOverride = gateway; },
  setInterstitialGatewayOverride(gateway) { interstitialOverride = gateway; },
  setRewardedGatewayOverride(gateway) { rewardedOverride = gateway; },
};

export type { PlatformAdapter };
