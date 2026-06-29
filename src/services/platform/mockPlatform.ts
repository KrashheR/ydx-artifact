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
  onClose?: () => void;
  onError?: (error?: unknown) => void;
}

export interface InterstitialGateway {
  showInterstitial(callbacks?: InterstitialCallbacks): Promise<InterstitialResult>;
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

type YandexGamesSdk = {
  adv?: {
    showFullscreenAdv?: (options: { callbacks?: YandexFullscreenAdCallbacks }) => void;
  };
  feedback?: YandexFeedbackApi;
  getPlayer?: () => Promise<YandexPlayer>;
  getStorage?: () => YandexStorage;
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

  if (mockPlatform.mode === "mock" || typeof window === "undefined") {
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
  mode: import.meta.env.VITE_PLATFORM_MODE ?? "mock",
  async init() {
    const ysdk = await getYandexSdk();
    return { sdkReady: Boolean(ysdk), localMock: !ysdk };
  },
  async showRewarded(): Promise<RewardedResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    return "rewarded";
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
      callbacks.onClose?.();
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
            onClose: () => {
              callbacks.onClose?.();
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
  }
};
