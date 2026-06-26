import { existsSync } from "node:fs";
import { join } from "node:path";
import { allLevels, chapterList } from "../src/content/chapters";

const root = process.cwd();
const errors: string[] = [];
const ids = new Set<string>();

for (const chapter of chapterList) {
  if (chapter.levels.length !== chapter.mapPoints.length) {
    errors.push(`${chapter.id}: levels count does not match map point count`);
  }
}

for (const level of allLevels) {
  if (ids.has(level.id)) errors.push(`Duplicate level id: ${level.id}`);
  ids.add(level.id);
  if (level.requiredDifferences !== level.differences.length) {
    errors.push(`${level.id}: requiredDifferences does not match differences length`);
  }
  for (const asset of [level.imageA, level.imageB, level.thumbnail]) {
    const path = join(root, "public", asset.replace(/^\//, ""));
    if (!existsSync(path)) errors.push(`${level.id}: missing asset ${asset}`);
  }
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
