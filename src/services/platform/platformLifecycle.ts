import { getYandexSdk } from "@/services/platform/mockPlatform";

type PauseListener = (paused: boolean) => void;

let lifecycleInitPromise: Promise<void> | null = null;
let loadingReadySent = false;
let platformPaused = false;
let gameplayRequested = false;
let gameplayStarted = false;
const pauseListeners = new Set<PauseListener>();

function notifyPauseListeners() {
  for (const listener of pauseListeners) {
    listener(platformPaused);
  }
}

async function applyGameplayState() {
  const shouldRun = gameplayRequested && !platformPaused;

  if (shouldRun === gameplayStarted) return;

  const ysdk = await getYandexSdk();
  const gameplayApi = ysdk?.features?.GameplayAPI;

  try {
    if (shouldRun) {
      gameplayApi?.start?.();
    } else {
      gameplayApi?.stop?.();
    }
    gameplayStarted = shouldRun;
  } catch (error) {
    console.error("[platform:gameplay-api]", error);
  }
}

function setPlatformPaused(nextPaused: boolean) {
  if (platformPaused === nextPaused) return;
  platformPaused = nextPaused;
  notifyPauseListeners();
  void applyGameplayState();
}

export function initPlatformLifecycle(): Promise<void> {
  lifecycleInitPromise ??= (async () => {
    const ysdk = await getYandexSdk();
    ysdk?.on?.("game_api_pause", () => setPlatformPaused(true));
    ysdk?.on?.("game_api_resume", () => setPlatformPaused(false));
  })();

  return lifecycleInitPromise;
}

export async function notifyGameReady(): Promise<void> {
  if (loadingReadySent) return;

  await initPlatformLifecycle();
  const ysdk = await getYandexSdk();

  try {
    ysdk?.features?.LoadingAPI?.ready?.();
    loadingReadySent = true;
  } catch (error) {
    console.error("[platform:loading-ready]", error);
  }
}

export function setGameplayActive(active: boolean) {
  gameplayRequested = active;
  void applyGameplayState();
}

export function getIsPlatformPaused() {
  return platformPaused;
}

export function subscribePlatformPause(listener: PauseListener) {
  pauseListeners.add(listener);
  listener(platformPaused);
  return () => {
    pauseListeners.delete(listener);
  };
}
