import { createDefaultSave, migrateSaveData, type SaveData } from "@/entities/save/schema";
import { getYandexSdk, type YandexPlayer, type YandexStorage } from "@/services/platform/mockPlatform";

const SAVE_KEY = "anomaly-archive-save-v1";
const CLOUD_LOAD_TIMEOUT_MS = 4_000;

type SaveSource = "cloud" | "local" | "default";

export type LoadSaveResult = {
  saveData: SaveData;
  source: SaveSource;
  cloudAvailable: boolean;
};

export type SaveResult = {
  saveData: SaveData;
  cloudSynced: boolean;
};

function parseSave(value: unknown): SaveData | null {
  try {
    return migrateSaveData(value);
  } catch {
    return null;
  }
}

function parseSerializedSave(raw: string | null): SaveData | null {
  if (!raw) return null;

  try {
    return parseSave(JSON.parse(raw));
  } catch {
    return null;
  }
}

function getBrowserLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function getSafeStorage(): Promise<YandexStorage | null> {
  try {
    const ysdk = await getYandexSdk();
    return ysdk?.getStorage?.() ?? null;
  } catch {
    return null;
  }
}

async function getLocalStorageMirror(): Promise<YandexStorage | Storage | null> {
  return (await getSafeStorage()) ?? getBrowserLocalStorage();
}

async function readLocalMirror(): Promise<SaveData | null> {
  const storage = await getLocalStorageMirror();
  return parseSerializedSave(storage?.getItem?.(SAVE_KEY) ?? null);
}

async function writeLocalMirror(save: SaveData): Promise<void> {
  const storage = await getLocalStorageMirror();

  if (!storage?.setItem) {
    throw new Error("Local save storage is unavailable");
  }

  storage.setItem(SAVE_KEY, JSON.stringify(save));
}

async function removeLocalMirror(): Promise<void> {
  const storage = await getLocalStorageMirror();
  storage?.removeItem?.(SAVE_KEY);
}

async function getCloudPlayer(): Promise<YandexPlayer | null> {
  try {
    const ysdk = await getYandexSdk();
    return await (ysdk?.getPlayer?.() ?? null);
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => resolve(null), timeoutMs);

    promise
      .then((value) => resolve(value))
      .catch(() => resolve(null))
      .finally(() => window.clearTimeout(timeoutId));
  });
}

async function readCloudSave(): Promise<{ saveData: SaveData | null; available: boolean }> {
  const player = await getCloudPlayer();

  if (!player?.getData) {
    return { saveData: null, available: false };
  }

  const data = await withTimeout(player.getData(), CLOUD_LOAD_TIMEOUT_MS);

  if (!data) {
    return { saveData: null, available: false };
  }

  return { saveData: parseSave(data), available: true };
}

async function writeCloudSave(save: SaveData, flush: boolean): Promise<boolean> {
  const player = await getCloudPlayer();

  if (!player?.setData) {
    return false;
  }

  try {
    await player.setData(save, flush);
    return true;
  } catch {
    return false;
  }
}

function chooseNewestSave(localSave: SaveData | null, cloudSave: SaveData | null): {
  saveData: SaveData;
  source: SaveSource;
} {
  if (cloudSave && (!localSave || cloudSave.updatedAt >= localSave.updatedAt)) {
    return { saveData: cloudSave, source: "cloud" };
  }

  if (localSave) {
    return { saveData: localSave, source: "local" };
  }

  return { saveData: createDefaultSave(), source: "default" };
}

export async function loadLocalSave(): Promise<SaveData> {
  return (await loadPersistentSave()).saveData;
}

export async function loadPersistentSave(): Promise<LoadSaveResult> {
  const [localSave, cloudResult] = await Promise.all([readLocalMirror(), readCloudSave()]);
  const selected = chooseNewestSave(localSave, cloudResult.saveData);

  try {
    await writeLocalMirror(selected.saveData);
  } catch {
    // Local mirror is best-effort; gameplay can continue with in-memory state.
  }

  if (cloudResult.available && selected.source !== "cloud") {
    void writeCloudSave(selected.saveData, false);
  }

  return {
    ...selected,
    cloudAvailable: cloudResult.available
  };
}

export async function savePersistentSave(save: SaveData, options: { flush?: boolean } = {}): Promise<SaveResult> {
  const payload: SaveData = { ...save, updatedAt: Date.now() };
  let localError: unknown = null;

  try {
    await writeLocalMirror(payload);
  } catch (error) {
    localError = error;
  }

  const cloudSynced = await writeCloudSave(payload, options.flush ?? false);

  if (localError && !cloudSynced) {
    throw localError;
  }

  return { saveData: payload, cloudSynced };
}

export async function clearPersistentSave(): Promise<void> {
  const defaultSave = createDefaultSave();
  await removeLocalMirror();
  await writeCloudSave(defaultSave, true);
}

export async function saveLocalSave(save: SaveData): Promise<void> {
  await savePersistentSave(save);
}

export async function clearLocalSave(): Promise<void> {
  await clearPersistentSave();
}

export async function loadLocalSaveLegacy(): Promise<SaveData> {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultSave();
    return migrateSaveData(JSON.parse(raw));
  } catch {
    return createDefaultSave();
  }
}
