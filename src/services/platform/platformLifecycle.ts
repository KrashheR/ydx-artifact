import { getPlatformAdapter } from "./platform";

type PauseListener = (paused: boolean) => void;

let lifecycleInitPromise: Promise<void> | null = null;
let loadingReadySent = false;
let platformPaused = false;
let gameplayRequested = false;
const pauseListeners = new Set<PauseListener>();

function notifyPauseListeners() {
  for (const listener of pauseListeners) {
    listener(platformPaused);
  }
}

async function applyGameplayState() {
  const shouldRun = gameplayRequested && !platformPaused;

  try {
    getPlatformAdapter().setGameplayActive(shouldRun);
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
    await getPlatformAdapter().init();
    getPlatformAdapter().subscribePause?.(setPlatformPaused);
  })();

  return lifecycleInitPromise;
}

export async function notifyGameReady(): Promise<void> {
  if (loadingReadySent) return;

  await initPlatformLifecycle();
  try {
    await getPlatformAdapter().notifyLoadingReady();
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
