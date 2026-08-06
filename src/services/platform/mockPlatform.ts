export type RewardedResult = "rewarded" | "closed" | "failed";
export type InterstitialResult = "closed" | "failed";

import type { ReviewUnavailableReason } from "@/entities/save/schema";

export interface CanReviewResult {
  value: boolean;
  reason?: ReviewUnavailableReason;
}

export interface RequestReviewResult {
  feedbackSent: boolean;
}

export interface GameReviewGateway {
  canReview(): Promise<CanReviewResult>;
  requestReview(): Promise<RequestReviewResult>;
}

export interface InterstitialCallbacks {
  onOpen?: () => void;
  /** `wasShown` is false when Yandex silently declines (frequency cap, offline). */
  onClose?: (wasShown: boolean) => void;
  onError?: (error?: unknown) => void;
}

export interface InterstitialGateway {
  showInterstitial(callbacks?: InterstitialCallbacks): Promise<InterstitialResult>;
}

export interface RewardedCallbacks {
  /** Fires when the video is actually on screen; drives the 90s suppression stamp. */
  onOpen?: () => void;
  onRewarded?: () => void;
  onClose?: () => void;
  onError?: (error?: unknown) => void;
}

export interface RewardedGateway {
  showRewarded(callbacks?: RewardedCallbacks): Promise<RewardedResult>;
}

type YandexFeedbackApi = {
  canReview?: () => Promise<CanReviewResult>;
  requestReview?: () => Promise<RequestReviewResult | { sentFeedback?: boolean }>;
};

type YandexFullscreenAdCallbacks = {
  onOpen?: () => void;
  onClose?: (wasShown: boolean) => void;
  onError?: (error: unknown) => void;
  onOffline?: () => void;
};

type YandexRewardedAdCallbacks = {
  onOpen?: () => void;
  onRewarded?: () => void;
  onClose?: () => void;
  onError?: (error: unknown) => void;
};

export type YandexCatalogProduct = {
  id?: string;
  title?: string;
  description?: string;
  imageURI?: string;
  price?: string;
  priceValue?: string;
  priceCurrencyCode?: string;
  getPriceCurrencyImage?: (size?: "small" | "medium" | "svg") => string;
};

export type YandexPurchase = {
  productID?: string;
  purchaseToken?: string;
};

export type YandexPaymentsApi = {
  getCatalog?: () => Promise<YandexCatalogProduct[]>;
  purchase?: (options: { id: string }) => Promise<YandexPurchase>;
  getPurchases?: () => Promise<YandexPurchase[]>;
  consumePurchase?: (purchaseToken: string) => Promise<void>;
};

type YandexGamesSdk = {
  getPayments?: (options?: { signed?: boolean }) => Promise<YandexPaymentsApi>;
  adv?: {
    showFullscreenAdv?: (options: { callbacks?: YandexFullscreenAdCallbacks }) => void;
    showRewardedVideo?: (options: { callbacks?: YandexRewardedAdCallbacks }) => void;
  };
  features?: {
    LoadingAPI?: {
      ready?: () => void;
    };
    GameplayAPI?: {
      start?: () => void;
      stop?: () => void;
    };
  };
  feedback?: YandexFeedbackApi;
  environment?: {
    i18n?: {
      lang?: string;
    };
  };
  getPlayer?: () => Promise<YandexPlayer>;
  getStorage?: () => YandexStorage;
  on?: (eventName: "game_api_pause" | "game_api_resume", callback: () => void) => void;
  off?: (eventName: "game_api_pause" | "game_api_resume", callback: () => void) => void;
};

export type YandexPlayer = {
  getData?: () => Promise<unknown>;
  setData?: (data: unknown, flush?: boolean) => Promise<void>;
};

export type YandexStorage = {
  getItem?: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
};

declare global {
  interface Window {
    YaGames?: {
      init?: () => Promise<YandexGamesSdk>;
    };
    ysdk?: YandexGamesSdk;
  }
}

let reviewGatewayOverride: GameReviewGateway | null = null;
let interstitialGatewayOverride: InterstitialGateway | null = null;
let rewardedGatewayOverride: RewardedGateway | null = null;
let ysdkInitPromise: Promise<YandexGamesSdk | null> | null = null;

function normalizeFeedbackSent(
  result: RequestReviewResult | { sentFeedback?: boolean }
): RequestReviewResult {
  if ("feedbackSent" in result) {
    return { feedbackSent: result.feedbackSent };
  }

  return { feedbackSent: Boolean(result.sentFeedback) };
}

function logPlatformError(scope: string, error: unknown) {
  console.error(`[platform:${scope}]`, error);
}

export async function getYandexSdk(): Promise<YandexGamesSdk | null> {
  if (window.ysdk) return window.ysdk;

  if (import.meta.env.VITE_PLATFORM_MODE === "mock" || typeof window === "undefined") {
    return null;
  }

  if (!window.YaGames?.init) {
    return null;
  }

  ysdkInitPromise ??= window.YaGames
    .init()
    .then((ysdk) => {
      window.ysdk = ysdk;
      return ysdk;
    })
    .catch((error) => {
      logPlatformError("init", error);
      return null;
    });

  return ysdkInitPromise;
}

export const mockPlatform = {
  mode: import.meta.env.VITE_PLATFORM_MODE ?? "auto",
  async init() {
    const ysdk = await getYandexSdk();
    return { sdkReady: Boolean(ysdk), localMock: !ysdk };
  },
  async getEnvironmentLanguage(): Promise<string | undefined> {
    const ysdk = await getYandexSdk();
    return ysdk?.environment?.i18n?.lang;
  },
  async showRewarded(callbacks: RewardedCallbacks = {}): Promise<RewardedResult> {
    if (rewardedGatewayOverride) {
      return rewardedGatewayOverride.showRewarded(callbacks);
    }

    const ysdk = await getYandexSdk();
    const adv = ysdk?.adv;

    if (!adv?.showRewardedVideo) {
      callbacks.onOpen?.();
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      callbacks.onRewarded?.();
      callbacks.onClose?.();
      return "rewarded";
    }
    const showRewardedVideo = adv.showRewardedVideo.bind(adv);

    return new Promise((resolve) => {
      let settled = false;
      let rewarded = false;
      const settle = (result: RewardedResult) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      try {
        showRewardedVideo({
          callbacks: {
            onOpen: () => callbacks.onOpen?.(),
            onRewarded: () => {
              rewarded = true;
              callbacks.onRewarded?.();
            },
            onClose: () => {
              callbacks.onClose?.();
              settle(rewarded ? "rewarded" : "closed");
            },
            onError: (error) => {
              logPlatformError("showRewarded", error);
              callbacks.onError?.(error);
              settle("failed");
            }
          }
        });
      } catch (error) {
        logPlatformError("showRewarded", error);
        callbacks.onError?.(error);
        settle("failed");
      }
    });
  },
  async showInterstitial(callbacks: InterstitialCallbacks = {}): Promise<InterstitialResult> {
    if (interstitialGatewayOverride) {
      return interstitialGatewayOverride.showInterstitial(callbacks);
    }

    const ysdk = await getYandexSdk();
    const adv = ysdk?.adv;

    if (!adv?.showFullscreenAdv) {
      callbacks.onOpen?.();
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      callbacks.onClose?.(true);
      return "closed";
    }
    const showFullscreenAdv = adv.showFullscreenAdv.bind(adv);

    return new Promise((resolve) => {
      let settled = false;
      const settle = (result: InterstitialResult) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      try {
        showFullscreenAdv({
          callbacks: {
            onOpen: callbacks.onOpen,
            onClose: (wasShown) => {
              callbacks.onClose?.(wasShown !== false);
              settle("closed");
            },
            onError: (error) => {
              callbacks.onError?.(error);
              settle("failed");
            },
            onOffline: () => {
              callbacks.onError?.("offline");
              settle("failed");
            }
          }
        });
      } catch (error) {
        callbacks.onError?.(error);
        logPlatformError("showInterstitial", error);
        settle("failed");
      }
    });
  },
  async copyDiagnostics(payload: unknown) {
    await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
  },
  async canReview(): Promise<CanReviewResult> {
    if (reviewGatewayOverride) {
      return reviewGatewayOverride.canReview();
    }

    try {
      const ysdk = await getYandexSdk();
      if (!ysdk?.feedback?.canReview) {
        return { value: false, reason: "UNKNOWN" };
      }

      return await ysdk.feedback.canReview();
    } catch (error) {
      logPlatformError("canReview", error);
      return { value: false, reason: "UNKNOWN" };
    }
  },
  async requestReview(): Promise<RequestReviewResult> {
    if (reviewGatewayOverride) {
      return reviewGatewayOverride.requestReview();
    }

    try {
      const ysdk = await getYandexSdk();
      if (!ysdk?.feedback?.requestReview) {
        throw new Error("Yandex review API is unavailable");
      }

      return normalizeFeedbackSent(await ysdk.feedback.requestReview());
    } catch (error) {
      logPlatformError("requestReview", error);
      throw error;
    }
  },
  setReviewGatewayOverride(gateway: GameReviewGateway | null) {
    reviewGatewayOverride = gateway;
  },
  setInterstitialGatewayOverride(gateway: InterstitialGateway | null) {
    interstitialGatewayOverride = gateway;
  },
  setRewardedGatewayOverride(gateway: RewardedGateway | null) {
    rewardedGatewayOverride = gateway;
  }
};
