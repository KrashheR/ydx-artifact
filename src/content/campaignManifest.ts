import type { LevelDefinition } from "../entities/level/schema";

export type ChapterId = LevelDefinition["chapterId"];

export type CampaignManifestEntry = {
  id: ChapterId;
  campaignId: "white" | "sand" | "emerald";
  titleKey: string;
  assetFolder: string;
  previewFilename: string;
  cardPreviewFilename: string;
  backgroundAsset: string;
  mapAspectRatio: number;
  notes?: string;
};

export const campaignManifest: Record<ChapterId, CampaignManifestEntry> = {
  "northern-route": {
    id: "northern-route",
    campaignId: "white",
    titleKey: "campaigns.white.title",
    assetFolder: "northern-route",
    previewFilename: "preview.webp",
    cardPreviewFilename: "1.webp",
    backgroundAsset: "/assets/scenes/northern-route/background.webp",
    mapAspectRatio: 1672 / 941
  },
  "sand-meridian": {
    id: "sand-meridian",
    campaignId: "sand",
    titleKey: "campaigns.sand.title",
    assetFolder: "sand-meredian",
    previewFilename: "preview.webp",
    cardPreviewFilename: "1.webp",
    backgroundAsset: "/assets/scenes/sand-meredian/background.webp",
    mapAspectRatio: 1586 / 992,
    notes: "`sand-meredian` is the legacy runtime folder for the `sand-meridian` campaign."
  },
  "emerald-meridian": {
    id: "emerald-meridian",
    campaignId: "emerald",
    titleKey: "campaigns.emerald.title",
    assetFolder: "emerald-meridian",
    previewFilename: "preview.webp",
    cardPreviewFilename: "1.webp",
    backgroundAsset: "/assets/scenes/emerald-meridian/bg.webp",
    mapAspectRatio: 1672 / 941
  }
};

export const campaignManifestList = Object.values(campaignManifest);
