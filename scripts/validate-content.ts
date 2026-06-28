import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { campaignManifestList } from "../src/content/campaignManifest";
import { allLevels, chapterList } from "../src/content/chapters";
import { getChapterPreviewAsset, getSceneMarkupAsset } from "../src/content/sceneAssets";

const root = process.cwd();
const errors: string[] = [];
const ids = new Set<string>();
const knownAssetFolders = new Set(campaignManifestList.map((campaign) => campaign.assetFolder));

type LocaleDictionary = Record<string, unknown>;
type AssetProvenance = {
  assets?: Array<{
    path?: string;
  }>;
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as T;
}

function publicPath(asset: string) {
  return join(root, "public", asset.replace(/^\//, ""));
}

function hasLocaleKey(locale: LocaleDictionary, key: string) {
  let current: unknown = locale;
  for (const segment of key.split(".")) {
    if (!current || typeof current !== "object" || !(segment in current)) return false;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === "string";
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\//, "");
}

const ruLocale = readJson<LocaleDictionary>("src/i18n/ru/common.json");
const enLocale = readJson<LocaleDictionary>("src/i18n/en/common.json");
const provenance = readJson<AssetProvenance>("ASSET_PROVENANCE.json");
const provenancePaths = (provenance.assets ?? [])
  .map((asset) => asset.path)
  .filter((path): path is string => Boolean(path))
  .map(normalizePath);

function hasProvenance(assetPath: string) {
  const normalized = normalizePath(join("public", assetPath.replace(/^\//, "")));
  return provenancePaths.some((path) => normalized === path || normalized.startsWith(`${path.replace(/\/$/, "")}/`));
}

function validateAssetPath(owner: string, asset: string, options: { requireProvenance?: boolean; requireMarkup?: boolean } = {}) {
  const path = publicPath(asset);
  if (!existsSync(path)) errors.push(`${owner}: missing asset ${asset}`);

  const parts = asset.replace(/^\//, "").split("/");
  if (parts[0] !== "assets" || parts[1] !== "scenes" || !knownAssetFolders.has(parts[2])) {
    errors.push(`${owner}: asset path is outside known campaign folders: ${asset}`);
  }

  if (options.requireProvenance && !hasProvenance(asset)) {
    errors.push(`${owner}: missing provenance entry for ${asset}`);
  }

  if (options.requireMarkup) {
    const markupAsset = getSceneMarkupAsset(asset);
    if (!existsSync(publicPath(markupAsset))) {
      errors.push(`${owner}: missing markup reference ${markupAsset}`);
    }
    if (!hasProvenance(markupAsset)) {
      errors.push(`${owner}: missing provenance entry for markup reference ${markupAsset}`);
    }
  }
}

if (process.env.VITE_LAYOUT_DEBUG === "true" && process.env.ALLOW_LAYOUT_DEBUG !== "true") {
  errors.push("VITE_LAYOUT_DEBUG=true is only allowed with ALLOW_LAYOUT_DEBUG=true");
}

for (const chapter of chapterList) {
  if (chapter.levels.length !== chapter.mapPoints.length) {
    errors.push(`${chapter.id}: levels count does not match map point count`);
  }
  validateAssetPath(`${chapter.id}: background`, chapter.backgroundAsset, { requireProvenance: true });
  validateAssetPath(`${chapter.id}: preview`, getChapterPreviewAsset(chapter.id), { requireProvenance: true });
  if (!hasLocaleKey(ruLocale, chapter.titleKey)) errors.push(`${chapter.id}: missing RU locale key ${chapter.titleKey}`);
  if (!hasLocaleKey(enLocale, chapter.titleKey)) errors.push(`${chapter.id}: missing EN locale key ${chapter.titleKey}`);
}

for (const level of allLevels) {
  if (ids.has(level.id)) errors.push(`Duplicate level id: ${level.id}`);
  ids.add(level.id);
  if (level.requiredDifferences !== level.differences.length) {
    errors.push(`${level.id}: requiredDifferences does not match differences length`);
  }
  if (!hasLocaleKey(ruLocale, level.titleKey)) errors.push(`${level.id}: missing RU locale key ${level.titleKey}`);
  if (!hasLocaleKey(enLocale, level.titleKey)) errors.push(`${level.id}: missing EN locale key ${level.titleKey}`);
  validateAssetPath(level.id, level.imageA, { requireProvenance: true, requireMarkup: true });
  validateAssetPath(level.id, level.imageB, { requireProvenance: true, requireMarkup: true });
  validateAssetPath(level.id, level.thumbnail, { requireProvenance: true });
  const diffIds = new Set<string>();
  for (const diff of level.differences) {
    if (diffIds.has(diff.id)) errors.push(`${level.id}: duplicate difference ${diff.id}`);
    diffIds.add(diff.id);
    for (const shape of [diff.hitAreaA, diff.hitAreaB, diff.hintArea]) {
      if (shape.kind === "polygon" && shape.points.length < 3) {
        errors.push(`${level.id}/${diff.id}: polygon has fewer than 3 points`);
      }
    }
  }
}

if (chapterList.some((chapter) => chapter.levels.length !== 13)) {
  errors.push("Expected every playable chapter to contain exactly 13 levels");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Content validation passed: ${allLevels.length} levels across ${chapterList.length} chapters`);
