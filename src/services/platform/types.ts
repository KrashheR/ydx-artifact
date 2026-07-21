import type { ReviewUnavailableReason } from "@/entities/save/schema";

export type PlatformId = "yandex" | "crazygames" | "local";
export type RewardedResult = "rewarded" | "closed" | "failed";
export type InterstitialResult = "closed" | "failed";

export interface StorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface InterstitialCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error?: unknown) => void;
}

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

export interface PlatformAdapter extends GameReviewGateway {
  readonly id: PlatformId;
  init(): Promise<{ sdkReady: boolean; localMock: boolean }>;
  getEnvironmentLanguage(): Promise<string | undefined>;
  getStorage(): Promise<StorageLike | null>;
  getCloudSave?(): Promise<unknown | null>;
  setCloudSave?(data: unknown, flush?: boolean): Promise<boolean>;
  showRewarded(): Promise<RewardedResult>;
  showInterstitial(callbacks?: InterstitialCallbacks): Promise<InterstitialResult>;
  notifyLoadingStart(): Promise<void>;
  notifyLoadingReady(): Promise<void>;
  setGameplayActive(active: boolean): void;
  subscribePause?(listener: (paused: boolean) => void): () => void;
  reportCompletion?(percent: number): void;
  setGameContext?(context: Record<string, string | number>): void;
}

export interface TestablePlatformAdapter extends PlatformAdapter {
  setReviewGatewayOverride?(gateway: GameReviewGateway | null): void;
  setInterstitialGatewayOverride?(gateway: {
    showInterstitial(callbacks?: InterstitialCallbacks): Promise<InterstitialResult>;
  } | null): void;
  setRewardedGatewayOverride?(gateway: {
    showRewarded(): Promise<RewardedResult>;
  } | null): void;
}
