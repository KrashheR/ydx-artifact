import type { GameReviewGateway, InterstitialCallbacks, InterstitialResult, RequestReviewResult, RewardedResult, StorageLike, TestablePlatformAdapter } from "./types";

type YandexPlayer = { getData?: () => Promise<unknown>; setData?: (data: unknown, flush?: boolean) => Promise<void> };
type YandexSdk = {
  adv?: { showFullscreenAdv?: (options: { callbacks?: { onOpen?: () => void; onClose?: () => void; onError?: (error: unknown) => void; onOffline?: () => void } }) => void; showRewardedVideo?: (options: { callbacks?: { onRewarded?: () => void; onClose?: () => void; onError?: (error: unknown) => void } }) => void };
  features?: { LoadingAPI?: { ready?: () => void }; GameplayAPI?: { start?: () => void; stop?: () => void } };
  feedback?: { canReview?: () => Promise<{ value: boolean; reason?: "NO_AUTH" | "UNKNOWN" }>; requestReview?: () => Promise<RequestReviewResult | { sentFeedback?: boolean }> };
  environment?: { i18n?: { lang?: string } };
  getPlayer?: () => Promise<YandexPlayer>; getStorage?: () => Storage;
  on?: (event: "game_api_pause" | "game_api_resume", callback: () => void) => void;
};
declare global { interface Window { YaGames?: { init?: () => Promise<YandexSdk> }; ysdk?: YandexSdk } }

let sdkPromise: Promise<YandexSdk | null> | null = null;
let readySent = false;
let gameplayActive = false;
let reviewOverride: GameReviewGateway | null = null;
let rewardedOverride: { showRewarded(): Promise<RewardedResult> } | null = null;
let interstitialOverride: { showInterstitial(callbacks?: InterstitialCallbacks): Promise<InterstitialResult> } | null = null;

export async function getYandexSdk(): Promise<YandexSdk | null> {
  if (typeof window === "undefined") return null;
  if (window.ysdk) return window.ysdk;
  sdkPromise ??= window.YaGames?.init?.().then((sdk) => (window.ysdk = sdk)).catch((error) => { console.error("[platform:yandex:init]", error); return null; }) ?? Promise.resolve(null);
  return sdkPromise;
}

function storageLike(storage: Storage): StorageLike {
  return { getItem: async (key) => storage.getItem(key), setItem: async (key, value) => storage.setItem(key, value), removeItem: async (key) => storage.removeItem(key) };
}

export const yandexPlatform: TestablePlatformAdapter = {
  id: "yandex",
  async init() { const sdk = await getYandexSdk(); return { sdkReady: Boolean(sdk), localMock: !sdk }; },
  async getEnvironmentLanguage() { return (await getYandexSdk())?.environment?.i18n?.lang; },
  async getStorage() { try { const sdk = await getYandexSdk(); return sdk?.getStorage ? storageLike(sdk.getStorage()) : null; } catch { return null; } },
  async getCloudSave() { try { const sdk = await getYandexSdk(); const player = sdk?.getPlayer ? await sdk.getPlayer() : null; return await player?.getData?.() ?? null; } catch { return null; } },
  async setCloudSave(data, flush = false) { try { const sdk = await getYandexSdk(); const player = sdk?.getPlayer ? await sdk.getPlayer() : null; if (!player?.setData) return false; await player.setData(data, flush); return true; } catch { return false; } },
  async showRewarded() {
    if (rewardedOverride) return rewardedOverride.showRewarded();
    const adv = (await getYandexSdk())?.adv;
    if (!adv?.showRewardedVideo) return "failed";
    const show = adv.showRewardedVideo.bind(adv);
    return new Promise<RewardedResult>((resolve) => { let done = false; const settle = (v: RewardedResult) => { if (!done) { done = true; resolve(v); } }; try { show({ callbacks: { onRewarded: () => settle("rewarded"), onClose: () => settle("closed"), onError: () => settle("failed") } }); } catch { settle("failed"); } });
  },
  async showInterstitial(callbacks: InterstitialCallbacks = {}) {
    if (interstitialOverride) return interstitialOverride.showInterstitial(callbacks);
    const adv = (await getYandexSdk())?.adv;
    if (!adv?.showFullscreenAdv) return "failed";
    const show = adv.showFullscreenAdv.bind(adv);
    return new Promise<InterstitialResult>((resolve) => { let done = false; const settle = (v: InterstitialResult) => { if (!done) { done = true; resolve(v); } }; try { show({ callbacks: { onOpen: callbacks.onOpen, onClose: () => { callbacks.onClose?.(); settle("closed"); }, onError: (error) => { callbacks.onError?.(error); settle("failed"); }, onOffline: () => { callbacks.onError?.("offline"); settle("failed"); } } }); } catch (error) { callbacks.onError?.(error); settle("failed"); } });
  },
  async canReview() { if (reviewOverride) return reviewOverride.canReview(); try { return await (await getYandexSdk())?.feedback?.canReview?.() ?? { value: false, reason: "UNKNOWN" }; } catch { return { value: false, reason: "UNKNOWN" }; } },
  async requestReview() { if (reviewOverride) return reviewOverride.requestReview(); const result = await (await getYandexSdk())?.feedback?.requestReview?.(); if (!result) throw new Error("Yandex review API is unavailable"); return "feedbackSent" in result ? result : { feedbackSent: Boolean(result.sentFeedback) }; },
  async notifyLoadingStart() {},
  async notifyLoadingReady() { if (!readySent) { readySent = true; (await getYandexSdk())?.features?.LoadingAPI?.ready?.(); } },
  setGameplayActive(active) { if (active === gameplayActive) return; gameplayActive = active; void getYandexSdk().then((sdk) => active ? sdk?.features?.GameplayAPI?.start?.() : sdk?.features?.GameplayAPI?.stop?.()); },
  subscribePause(listener) { let paused = false; const update = (value: boolean) => { paused = value; listener(paused); }; void getYandexSdk().then((sdk) => { sdk?.on?.("game_api_pause", () => update(true)); sdk?.on?.("game_api_resume", () => update(false)); }); listener(paused); return () => {}; },
  setReviewGatewayOverride(gateway) { reviewOverride = gateway; },
  setInterstitialGatewayOverride(gateway) { interstitialOverride = gateway; },
  setRewardedGatewayOverride(gateway) { rewardedOverride = gateway; },
};
