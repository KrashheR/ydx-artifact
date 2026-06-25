import { existsSync } from "node:fs";
import { join } from "node:path";
import { levels } from "../src/content/levels";

const root = process.cwd();
const errors: string[] = [];
const ids = new Set<string>();

for (const level of levels) {
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

if (levels.length !== 12) errors.push(`Expected 12 campaign levels, got ${levels.length}`);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Content validation passed: ${levels.length} levels`);
