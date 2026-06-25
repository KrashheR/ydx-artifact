import { createDefaultSave, saveSchema, type SaveData } from "@/entities/save/schema";

const SAVE_KEY = "anomaly-archive-save-v1";

export async function loadLocalSave(): Promise<SaveData> {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultSave();
    return saveSchema.parse(JSON.parse(raw));
  } catch {
    return createDefaultSave();
  }
}

export async function saveLocalSave(save: SaveData): Promise<void> {
  const payload: SaveData = { ...save, updatedAt: Date.now() };
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export async function clearLocalSave(): Promise<void> {
  window.localStorage.removeItem(SAVE_KEY);
}
