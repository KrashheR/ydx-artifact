import type { InterstitialCallbacks, InterstitialResult, PlatformAdapter, RewardedResult, StorageLike } from "./types";
import { areAdsEnabled } from "./ads";

type CrazyGamesSdk = {
  init(): Promise<void>;
  game: {
    loadingStart(): void;
    loadingStop(): void;
    gameplayStart(): void;
    gameplayStop(): void;
    happytime?(): void;
  };
  ad: { requestAd(type: "rewarded" | "midgame", callbacks: {
    adStarted?: () => void; adFinished?: () => void; adError?: (error: unknown) => void;
  }): void };
  data: { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void>; removeItem?(key: string): Promise<void> };
  gameSettings?: { setGameContext?(context: Record<string, string | number>): void };
  user?: { systemInfo?: { locale?: string } };
};

declare global { interface Window { CrazyGames?: { SDK?: CrazyGamesSdk } } }

let initPromise: Promise<CrazyGamesSdk | null> | null = null;
let loadingStarted = false;
let loadingStopped = false;
let gameplayActive = false;
let lastMidgameFinishedAt = 0;
const MIDGAME_COOLDOWN_MS = 3 * 60 * 1000;

async function getSdk() {
  initPromise ??= (async () => {
    const sdk = window.CrazyGames?.SDK;
    if (!sdk) return null;
    try { await sdk.init(); return sdk; } catch (error) { console.error("[platform:crazygames:init]", error); return null; }
  })();
  return initPromise;
}

export const crazyGamesPlatform: PlatformAdapter = {
  id: "crazygames",
  async init() { const sdk = await getSdk(); return { sdkReady: Boolean(sdk), localMock: !sdk }; },
  async getEnvironmentLanguage() { return (await getSdk())?.user?.systemInfo?.locale; },
  async getStorage(): Promise<StorageLike | null> {
    const sdk = await getSdk();
    if (!sdk?.data) return null;
    return {
      getItem: (key) => sdk.data.getItem(key),
      setItem: (key, value) => sdk.data.setItem(key, value),
      removeItem: async (key) => { await sdk.data.removeItem?.(key); },
    };
  },
  async showRewarded(): Promise<RewardedResult> {
    if (!areAdsEnabled()) return "failed";
    const sdk = await getSdk();
    if (!sdk) return "failed";
    return new Promise((resolve) => {
      let settled = false;
      const settle = (value: RewardedResult) => { if (!settled) { settled = true; resolve(value); } };
      try { sdk.ad.requestAd("rewarded", { adFinished: () => settle("rewarded"), adError: () => settle("failed") }); }
      catch (error) { console.error("[platform:crazygames:rewarded]", error); settle("failed"); }
    });
  },
  async showInterstitial(callbacks: InterstitialCallbacks = {}): Promise<InterstitialResult> {
    if (!areAdsEnabled()) return "failed";
    const sdk = await getSdk();
    if (!sdk) return "failed";
    if (Date.now() - lastMidgameFinishedAt < MIDGAME_COOLDOWN_MS) return "failed";
    return new Promise((resolve) => {
      let settled = false;
      const settle = (value: InterstitialResult) => { if (!settled) { settled = true; resolve(value); } };
      try { sdk.ad.requestAd("midgame", { adStarted: () => callbacks.onOpen?.(), adFinished: () => { lastMidgameFinishedAt = Date.now(); callbacks.onClose?.(); settle("closed"); }, adError: (error) => { callbacks.onError?.(error); settle("failed"); } }); }
      catch (error) { callbacks.onError?.(error); settle("failed"); }
    });
  },
  async canReview() { return { value: false, reason: "UNKNOWN" }; },
  async requestReview() { throw new Error("Review API is unavailable on CrazyGames"); },
  async notifyLoadingStart() { if (!loadingStarted) { loadingStarted = true; (await getSdk())?.game.loadingStart(); } },
  async notifyLoadingReady() { if (!loadingStopped) { loadingStopped = true; (await getSdk())?.game.loadingStop(); } },
  setGameplayActive(active) { if (active === gameplayActive) return; gameplayActive = active; void getSdk().then((sdk) => active ? sdk?.game.gameplayStart() : sdk?.game.gameplayStop()); },
  reportCompletion(percent) { void getSdk().then((sdk) => { if (percent >= 100) sdk?.game.happytime?.(); }); },
  setGameContext(context) { void getSdk().then((sdk) => sdk?.gameSettings?.setGameContext?.(context)); },
};
