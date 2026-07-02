/**
 * Generates compressed preview assets for map/home cards from full-size scene images.
 *
 * - `<campaign>/<order>/card.webp`  <- downscaled copy of `<order>/1.webp` (map level cards)
 * - `<campaign>/preview-sm.webp`    <- downscaled copy of `preview.webp` (home campaign cards)
 *
 * Full-size originals stay untouched; runtime code references the generated files
 * via `campaignManifest` (`cardPreviewFilename`, `previewFilename`).
 *
 * Run after adding or replacing scene assets: `pnpm assets:previews`
 */
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { campaignManifestList } from "../src/content/campaignManifest";

const SCENES_ROOT = join(process.cwd(), "public", "assets", "scenes");

const LEVEL_CARD_WIDTH = 720;
const HOME_PREVIEW_WIDTH = 960;
const WEBP_QUALITY = 70;

async function generatePreview(sourcePath: string, targetPath: string, width: number) {
  await sharp(sourcePath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(targetPath);

  const [sourceSize, targetSize] = await Promise.all([
    stat(sourcePath).then((s) => s.size),
    stat(targetPath).then((s) => s.size)
  ]);

  return { sourceSize, targetSize };
}

async function main() {
  let totalSource = 0;
  let totalTarget = 0;
  let generated = 0;

  for (const campaign of campaignManifestList) {
    const campaignDir = join(SCENES_ROOT, campaign.assetFolder);

    const homeSource = join(campaignDir, "preview.webp");
    const homeResult = await generatePreview(homeSource, join(campaignDir, "preview-sm.webp"), HOME_PREVIEW_WIDTH);
    totalSource += homeResult.sourceSize;
    totalTarget += homeResult.targetSize;
    generated += 1;

    const entries = await readdir(campaignDir, { withFileTypes: true });
    const levelDirs = entries
      .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
      .sort((a, b) => Number(a.name) - Number(b.name));

    for (const levelDir of levelDirs) {
      const source = join(campaignDir, levelDir.name, "1.webp");
      const target = join(campaignDir, levelDir.name, "card.webp");
      const result = await generatePreview(source, target, LEVEL_CARD_WIDTH);
      totalSource += result.sourceSize;
      totalTarget += result.targetSize;
      generated += 1;
    }

    console.log(`${campaign.assetFolder}: ${levelDirs.length} level cards + home preview`);
  }

  const savedPercent = ((1 - totalTarget / totalSource) * 100).toFixed(1);
  console.log(
    `Generated ${generated} previews: ${(totalSource / 1024).toFixed(0)} KiB -> ${(totalTarget / 1024).toFixed(0)} KiB (-${savedPercent}%)`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
