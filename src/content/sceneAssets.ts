import { campaignManifest, type ChapterId } from "./campaignManifest";

type RuntimeImportMeta = ImportMeta & {
  env?: {
    BASE_URL?: string;
  };
};

function getRuntimeBaseUrl() {
  const baseUrl = (import.meta as RuntimeImportMeta).env?.BASE_URL ?? "/";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export const SCENE_ASSET_ROOT = `${getRuntimeBaseUrl()}/assets/scenes`;

export function getLevelSceneAsset(assetFolder: string, levelOrder: number, filename: string) {
  return `${SCENE_ASSET_ROOT}/${assetFolder}/${levelOrder}/${filename}`;
}

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
