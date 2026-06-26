import { allLevels } from "@/content/chapters";
import type { SaveData } from "@/entities/save/schema";

export const DEV_ALL_CAMPAIGNS_PRODUCT_ID = "dev-all-campaigns";

export function buildUnlockedDevSave(saveData: SaveData): SaveData {
  const completedLevels = allLevels.map((level) => level.id);
  const productIds = saveData.purchases.productIds.includes(DEV_ALL_CAMPAIGNS_PRODUCT_ID)
    ? saveData.purchases.productIds
    : [...saveData.purchases.productIds, DEV_ALL_CAMPAIGNS_PRODUCT_ID];
  const artifacts = Object.fromEntries(
    Object.keys(saveData.artifacts).map((artifactId) => [artifactId, "viewed"])
  ) as SaveData["artifacts"];

  return {
    ...saveData,
    updatedAt: Date.now(),
    completedLevels,
    inProgress: null,
    artifacts,
    purchases: {
      ...saveData.purchases,
      noForcedInterstitials: true,
      productIds
    }
  };
}
