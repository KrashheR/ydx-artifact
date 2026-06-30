import { createHash } from "node:crypto";
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

function fileHash(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readWebpDimensions(path: string): { width: number; height: number } | null {
  const buffer = readFileSync(path);
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }

  const chunkType = buffer.toString("ascii", 12, 16);
  if (chunkType === "VP8X") {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3)
    };
  }
  if (chunkType === "VP8 ") {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff
    };
  }
  if (chunkType === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    };
  }

  return null;
}

function shapeBounds(shape: { kind: string; [key: string]: unknown }) {
  if (shape.kind === "circle") {
    const cx = Number(shape.cx);
    const cy = Number(shape.cy);
    const radius = Number(shape.radius);
    return { left: cx - radius, top: cy - radius, right: cx + radius, bottom: cy + radius };
  }
  if (shape.kind === "ellipse") {
    const cx = Number(shape.cx);
    const cy = Number(shape.cy);
    const rx = Number(shape.rx);
    const ry = Number(shape.ry);
    return { left: cx - rx, top: cy - ry, right: cx + rx, bottom: cy + ry };
  }
  const points = shape.points as Array<{ x: number; y: number }>;
  return {
    left: Math.min(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    right: Math.max(...points.map((point) => point.x)),
    bottom: Math.max(...points.map((point) => point.y))
  };
}

function validateShape(owner: string, shape: { kind: string; [key: string]: unknown }) {
  const box = shapeBounds(shape);
  if (box.right <= box.left || box.bottom <= box.top || box.right < 0 || box.bottom < 0 || box.left > 1 || box.top > 1) {
    errors.push(`${owner}: hotspot has invalid size or does not intersect the normalized image`);
  }

  if (shape.kind === "circle") {
    const cx = Number(shape.cx);
    const cy = Number(shape.cy);
    const radius = Number(shape.radius);
    if (cx < 0 || cx > 1 || cy < 0 || cy > 1 || radius <= 0) {
      errors.push(`${owner}: circle hotspot center is outside 0..1 or radius is not positive`);
    }
    return;
  }

  if (shape.kind === "ellipse") {
    const cx = Number(shape.cx);
    const cy = Number(shape.cy);
    const rx = Number(shape.rx);
    const ry = Number(shape.ry);
    if (cx < 0 || cx > 1 || cy < 0 || cy > 1 || rx <= 0 || ry <= 0) {
      errors.push(`${owner}: ellipse hotspot center is outside 0..1 or radius is not positive`);
    }
    return;
  }

  const points = shape.points as Array<{ x: number; y: number }>;
  if (points.some((point) => point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1)) {
    errors.push(`${owner}: polygon point is outside 0..1`);
  }
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
  const imageAPath = publicPath(level.imageA);
  const imageBPath = publicPath(level.imageB);
  if (existsSync(imageAPath) && existsSync(imageBPath)) {
    if (fileHash(imageAPath) === fileHash(imageBPath)) {
      errors.push(`${level.id}: image A and B are identical`);
    }
    const dimensionsA = readWebpDimensions(imageAPath);
    const dimensionsB = readWebpDimensions(imageBPath);
    if (dimensionsA && dimensionsB && (dimensionsA.width !== dimensionsB.width || dimensionsA.height !== dimensionsB.height)) {
      errors.push(`${level.id}: image A/B dimensions differ`);
    }
  }
  const diffIds = new Set<string>();
  const hitboxKeys = new Set<string>();
  for (const diff of level.differences) {
    if (diffIds.has(diff.id)) errors.push(`${level.id}: duplicate difference ${diff.id}`);
    diffIds.add(diff.id);
    for (const shape of [diff.hitAreaA, diff.hitAreaB, diff.hintArea]) {
      validateShape(`${level.id}/${diff.id}`, shape);
      if (shape.kind === "polygon" && shape.points.length < 3) {
        errors.push(`${level.id}/${diff.id}: polygon has fewer than 3 points`);
      }
    }
    const box = shapeBounds(diff.hitAreaB);
    const hitboxKey = [
      Math.round(box.left * 1000),
      Math.round(box.top * 1000),
      Math.round(box.right * 1000),
      Math.round(box.bottom * 1000)
    ].join(":");
    if (hitboxKeys.has(hitboxKey)) errors.push(`${level.id}/${diff.id}: duplicate hotspot bounds`);
    hitboxKeys.add(hitboxKey);
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
