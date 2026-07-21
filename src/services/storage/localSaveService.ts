import { createDefaultSave, migrateSaveData, type SaveData } from "@/entities/save/schema";
import { getPlatformAdapter, getPlatformId } from "@/services/platform/platform";
import type { StorageLike } from "@/services/platform/types";

const SAVE_KEY = "anomaly-archive-save-v1";
const CLOUD_LOAD_TIMEOUT_MS = 4_000;

type SaveSource = "cloud" | "local" | "default";
type LocalMirrorSource = "platform" | "browser";

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

function browserStorageLike(): StorageLike | null {
  const storage = getBrowserLocalStorage();
  return storage ? { getItem: async (key) => storage.getItem(key), setItem: async (key, value) => storage.setItem(key, value), removeItem: async (key) => storage.removeItem(key) } : null;
}

async function getPlatformStorage(): Promise<StorageLike | null> {
  return getPlatformAdapter().getStorage();
}

async function readLocalMirror(): Promise<{ saveData: SaveData | null; source: LocalMirrorSource | null }> {
  const platformStorage = await getPlatformStorage();
  if (platformStorage) {
    try {
      return {
        saveData: parseSerializedSave(await platformStorage.getItem(SAVE_KEY)),
        source: "platform",
      };
    } catch {
      // Data Module can be present but disabled in the Developer Portal.
      // Browser storage keeps the guest save usable in that case.
    }
  }

  const browserStorage = browserStorageLike();
  if (!browserStorage) return { saveData: null, source: null };

  try {
    return {
      saveData: parseSerializedSave(await browserStorage.getItem(SAVE_KEY)),
      source: "browser",
    };
  } catch {
    return { saveData: null, source: null };
  }
}

async function writeLocalMirror(save: SaveData): Promise<LocalMirrorSource> {
  const serializedSave = JSON.stringify(save);
  const platformStorage = await getPlatformStorage();
  if (platformStorage) {
    try {
      await platformStorage.setItem(SAVE_KEY, serializedSave);
      return "platform";
    } catch {
      // Fall through to browser storage when platform storage rejects a write
      // (for example CrazyGames' dataModuleDisabled error).
    }
  }

  const browserStorage = browserStorageLike();
  if (!browserStorage) throw new Error("Local save storage is unavailable");
  await browserStorage.setItem(SAVE_KEY, serializedSave);
  return "browser";
}

async function removeLocalMirror(): Promise<void> {
  const platformStorage = await getPlatformStorage();
  if (platformStorage) {
    try {
      await platformStorage.removeItem(SAVE_KEY);
      return;
    } catch {
      // Fall through to the browser mirror if platform storage is unavailable.
    }
  }
  await browserStorageLike()?.removeItem(SAVE_KEY);
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
  const read = getPlatformAdapter().getCloudSave;
  if (!read) {
    return { saveData: null, available: false };
  }

  const data = await withTimeout(read(), CLOUD_LOAD_TIMEOUT_MS);

  if (!data) {
    return { saveData: null, available: false };
  }

  return { saveData: parseSave(data), available: true };
}

async function writeCloudSave(save: SaveData, flush: boolean): Promise<boolean> {
  return (await getPlatformAdapter().setCloudSave?.(save, flush)) ?? false;
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
  await getPlatformAdapter().init();
  if (getPlatformId() === "crazygames") {
    const stored = await readLocalMirror();
    return {
      saveData: stored.saveData ?? createDefaultSave(),
      source: stored.saveData
        ? stored.source === "platform" ? "cloud" : "local"
        : "default",
      cloudAvailable: stored.source === "platform",
    };
  }
  const [localSave, cloudResult] = await Promise.all([readLocalMirror(), readCloudSave()]);
  const selected = chooseNewestSave(localSave.saveData, cloudResult.saveData);

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
  await getPlatformAdapter().init();
  const payload: SaveData = { ...save, updatedAt: Date.now() };
  let localError: unknown = null;
  let localMirrorSource: LocalMirrorSource | null = null;

  try {
    localMirrorSource = await writeLocalMirror(payload);
  } catch (error) {
    localError = error;
  }

  const cloudSynced = getPlatformId() === "crazygames"
    ? localMirrorSource === "platform"
    : await writeCloudSave(payload, options.flush ?? false);

  if (localError && !cloudSynced) {
    throw localError;
  }

  return { saveData: payload, cloudSynced };
}

export async function clearPersistentSave(): Promise<void> {
  await getPlatformAdapter().init();
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
