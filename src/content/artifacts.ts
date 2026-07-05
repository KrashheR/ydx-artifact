import { type ChapterId } from "./campaignManifest";
import { getArtifactAsset } from "./sceneAssets";

// Collectible expedition artifacts ("Коллекция находок"). Content source:
// docs/expedition_narrative_collection_ru.json — milestone levels 3/6/8/10/13
// of each campaign unlock one artifact when the level is completed (the game
// is find-ALL, so completing a level always includes tapping the artifact
// difference). `differenceId` marks the artifact hotspot inside the level for
// the in-gameplay toast; it is optional because not every milestone scene has
// a 1:1 object among its differences.

export const ARTIFACT_MILESTONE_ORDERS = [3, 6, 8, 10, 13] as const;

export type ArtifactId =
  | "white-compass"
  | "white-field-radio"
  | "white-red-diary"
  | "white-echo-recorder"
  | "white-descent-rope"
  | "sand-rune-marker"
  | "sand-descent-helmets"
  | "sand-hydraulic-pump"
  | "sand-bronze-lamp"
  | "sand-buried-map"
  | "emerald-botanical-vials"
  | "emerald-tropical-map"
  | "emerald-stone-plaque"
  | "emerald-brass-spyglass"
  | "emerald-evacuation-aircraft";

export type ArtifactDefinition = {
  id: ArtifactId;
  chapterId: ChapterId;
  unlockLevelOrder: (typeof ARTIFACT_MILESTONE_ORDERS)[number];
  differenceId?: string;
  openImage: string;
  closedImage: string;
};

type ArtifactSpec = Omit<ArtifactDefinition, "openImage" | "closedImage">;

const artifactSpecs: ArtifactSpec[] = [
  { id: "white-compass", chapterId: "northern-route", unlockLevelOrder: 3, differenceId: "compass-removed-3" },
  { id: "white-field-radio", chapterId: "northern-route", unlockLevelOrder: 6, differenceId: "field-radio-6" },
  { id: "white-red-diary", chapterId: "northern-route", unlockLevelOrder: 8, differenceId: "red-book-8" },
  { id: "white-echo-recorder", chapterId: "northern-route", unlockLevelOrder: 10, differenceId: "radio-case-10" },
  { id: "white-descent-rope", chapterId: "northern-route", unlockLevelOrder: 13, differenceId: "rope-coil-13" },
  { id: "sand-rune-marker", chapterId: "sand-meridian", unlockLevelOrder: 3, differenceId: "carved-stone-3" },
  { id: "sand-descent-helmets", chapterId: "sand-meridian", unlockLevelOrder: 6, differenceId: "helmet-rack-6" },
  { id: "sand-hydraulic-pump", chapterId: "sand-meridian", unlockLevelOrder: 8, differenceId: "pump-rig-8" },
  { id: "sand-bronze-lamp", chapterId: "sand-meridian", unlockLevelOrder: 10 },
  { id: "sand-buried-map", chapterId: "sand-meridian", unlockLevelOrder: 13, differenceId: "map-rolls-13" },
  { id: "emerald-botanical-vials", chapterId: "emerald-meridian", unlockLevelOrder: 3, differenceId: "herbarium-box" },
  { id: "emerald-tropical-map", chapterId: "emerald-meridian", unlockLevelOrder: 6, differenceId: "map-board" },
  { id: "emerald-stone-plaque", chapterId: "emerald-meridian", unlockLevelOrder: 8, differenceId: "relief-panel" },
  { id: "emerald-brass-spyglass", chapterId: "emerald-meridian", unlockLevelOrder: 10, differenceId: "telescope" },
  { id: "emerald-evacuation-aircraft", chapterId: "emerald-meridian", unlockLevelOrder: 13, differenceId: "bush-plane" }
];

export const artifactList: ArtifactDefinition[] = artifactSpecs.map((spec) => ({
  ...spec,
  openImage: getArtifactAsset(spec.chapterId, spec.unlockLevelOrder, "open"),
  closedImage: getArtifactAsset(spec.chapterId, spec.unlockLevelOrder, "closed")
}));

export const ARTIFACT_IDS = artifactList.map((artifact) => artifact.id);
export const TOTAL_ARTIFACTS = artifactList.length;

const artifactById = new Map(artifactList.map((artifact) => [artifact.id, artifact]));

export function getArtifactById(artifactId: string) {
  return artifactById.get(artifactId as ArtifactId);
}

export function getChapterArtifacts(chapterId: ChapterId) {
  return artifactList.filter((artifact) => artifact.chapterId === chapterId);
}
