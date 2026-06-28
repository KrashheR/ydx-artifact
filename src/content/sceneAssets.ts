import { campaignManifest, type ChapterId } from "./campaignManifest";

export const SCENE_ASSET_ROOT = "/assets/scenes";

export function getChapterPreviewAsset(chapterId: ChapterId) {
  const campaign = campaignManifest[chapterId];
  return `${SCENE_ASSET_ROOT}/${campaign.assetFolder}/${campaign.previewFilename}`;
}

export function getCampaignCardPreviewAsset(chapterId: ChapterId, levelOrder: number) {
  const campaign = campaignManifest[chapterId];
  return `${SCENE_ASSET_ROOT}/${campaign.assetFolder}/${levelOrder}/${campaign.cardPreviewFilename}`;
}

export function getSceneMarkupAsset(sceneAssetPath: string) {
  return sceneAssetPath.replace(/\/(?:1|2)(\.(?:png|webp))$/i, "/3$1");
}
