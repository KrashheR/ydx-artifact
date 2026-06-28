export type RewardedResult = "rewarded" | "closed" | "failed";

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

type YandexFeedbackApi = {
  canReview?: () => Promise<CanReviewResult>;
  requestReview?: () => Promise<RequestReviewResult | { sentFeedback?: boolean }>;
};

type YandexGamesSdk = {
  feedback?: YandexFeedbackApi;
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

async function getYsdk(): Promise<YandexGamesSdk | null> {
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
    const ysdk = await getYsdk();
    return { sdkReady: Boolean(ysdk), localMock: !ysdk };
  },
  async showRewarded(): Promise<RewardedResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    return "rewarded";
  },
  async copyDiagnostics(payload: unknown) {
    await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
  },
  async canReview(): Promise<CanReviewResult> {
    if (reviewGatewayOverride) {
      return reviewGatewayOverride.canReview();
    }

    try {
      const ysdk = await getYsdk();
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
      const ysdk = await getYsdk();
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
  }
};
