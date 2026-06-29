import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultSave, type SaveData } from "@/entities/save/schema";
import { loadPersistentSave, savePersistentSave } from "@/services/storage/localSaveService";

function makeSave(updatedAt: number, completedLevels: string[] = []): SaveData {
  return {
    ...createDefaultSave(),
    updatedAt,
    completedLevels
  };
}

describe("persistent save storage", () => {
  afterEach(() => {
    window.localStorage.clear();
    window.ysdk = undefined;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("loads the newest valid save from Yandex cloud and mirrors it locally", async () => {
    const localSave = makeSave(100, ["nr-01-night-train"]);
    const cloudSave = makeSave(200, ["nr-01-night-train", "nr-02-signal-lamp"]);

    window.localStorage.setItem("anomaly-archive-save-v1", JSON.stringify(localSave));
    window.ysdk = {
      getPlayer: async () => ({
        getData: async () => cloudSave,
        setData: async () => undefined
      })
    };

    const result = await loadPersistentSave();

    expect(result.source).toBe("cloud");
    expect(result.cloudAvailable).toBe(true);
    expect(result.saveData.completedLevels).toEqual(cloudSave.completedLevels);
    expect(JSON.parse(window.localStorage.getItem("anomaly-archive-save-v1")!)).toMatchObject({
      completedLevels: cloudSave.completedLevels
    });
  });

  it("saves to the local mirror and Yandex Player Data with flush when requested", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(500);
    const setData = vi.fn<(data: unknown, flush?: boolean) => Promise<void>>().mockResolvedValue(undefined);
    const save = makeSave(100, ["nr-01-night-train"]);

    window.ysdk = {
      getPlayer: async () => ({
        getData: async () => null,
        setData
      })
    };

    const result = await savePersistentSave(save, { flush: true });

    expect(result.cloudSynced).toBe(true);
    expect(result.saveData.updatedAt).toBe(500);
    expect(setData).toHaveBeenCalledWith(result.saveData, true);
    expect(JSON.parse(window.localStorage.getItem("anomaly-archive-save-v1")!)).toMatchObject({
      updatedAt: 500,
      completedLevels: save.completedLevels
    });
  });
});
