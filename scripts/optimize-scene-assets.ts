/**
 * Conservatively recompresses runtime gameplay WebP scene pairs.
 *
 * The script is dry-run by default. Use `--apply` to replace only candidates
 * that keep dimensions, meet pixel-difference gates, and reduce file size.
 */
import { readdir, rename, stat, unlink } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import sharp from "sharp";

const SCENES_ROOT = join(process.cwd(), "public", "assets", "scenes");
const WEBP_QUALITY = getNumberArg("--quality", 97);
const MIN_SAVING_PERCENT = getNumberArg("--min-saving", 10);
const MIN_PSNR_DB = getNumberArg("--min-psnr", 40);
const MAX_MEAN_ABSOLUTE_ERROR = getNumberArg("--max-mae", 2);
const MAX_CHANNEL_DELTA = getNumberArg("--max-delta", 45);
const APPLY = process.argv.includes("--apply");

type CandidateResult = {
  file: string;
  originalSize: number;
  optimizedSize: number;
  savingPercent: number;
  psnr: number;
  meanAbsoluteError: number;
  maxDelta: number;
  accepted: boolean;
  reason: string;
};

function getNumberArg(name: string, fallback: number) {
  const prefix = `${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  if (!arg) return fallback;

  const value = Number(arg.slice(prefix.length));
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a number`);
  }

  return value;
}

async function findRuntimeScenePairs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return findRuntimeScenePairs(path);
      if (entry.isFile() && (entry.name === "1.webp" || entry.name === "2.webp")) return [path];
      return [];
    })
  );

  return nested.flat().sort((a, b) => a.localeCompare(b, "en"));
}

async function calculatePixelMetrics(sourcePath: string, candidatePath: string) {
  const [source, candidate] = await Promise.all([
    sharp(sourcePath).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(candidatePath).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  ]);

  if (
    source.info.width !== candidate.info.width ||
    source.info.height !== candidate.info.height ||
    source.info.channels !== candidate.info.channels
  ) {
    throw new Error(`Decoded pixel shape mismatch for ${sourcePath}`);
  }

  let squaredError = 0;
  let absoluteError = 0;
  let maxDelta = 0;

  for (let index = 0; index < source.data.length; index += 1) {
    const delta = Math.abs(source.data[index] - candidate.data[index]);
    squaredError += delta * delta;
    absoluteError += delta;
    if (delta > maxDelta) maxDelta = delta;
  }

  const meanSquaredError = squaredError / source.data.length;
  const psnr = meanSquaredError === 0 ? Number.POSITIVE_INFINITY : 10 * Math.log10((255 * 255) / meanSquaredError);

  return {
    psnr,
    meanAbsoluteError: absoluteError / source.data.length,
    maxDelta
  };
}

async function optimizeCandidate(file: string): Promise<CandidateResult> {
  const tmpFile = join(dirname(file), `.${basename(file)}.optimize-tmp.webp`);
  const original = await stat(file);
  let tmpMoved = false;

  try {
    await sharp(file).webp({ quality: WEBP_QUALITY, effort: 6 }).toFile(tmpFile);

    const [sourceMetadata, candidateMetadata, optimized] = await Promise.all([
      sharp(file).metadata(),
      sharp(tmpFile).metadata(),
      stat(tmpFile)
    ]);

    if (sourceMetadata.width !== candidateMetadata.width || sourceMetadata.height !== candidateMetadata.height) {
      return reject(file, original.size, optimized.size, "dimension mismatch");
    }

    const savingPercent = (1 - optimized.size / original.size) * 100;
    if (optimized.size >= original.size || savingPercent < MIN_SAVING_PERCENT) {
      return reject(file, original.size, optimized.size, "insufficient saving");
    }

    const metrics = await calculatePixelMetrics(file, tmpFile);
    const accepted =
      metrics.psnr >= MIN_PSNR_DB &&
      metrics.meanAbsoluteError <= MAX_MEAN_ABSOLUTE_ERROR &&
      metrics.maxDelta <= MAX_CHANNEL_DELTA;

    if (!accepted) {
      return {
        file,
        originalSize: original.size,
        optimizedSize: optimized.size,
        savingPercent,
        ...metrics,
        accepted: false,
        reason: "pixel metric gate"
      };
    }

    if (APPLY) {
      await rename(tmpFile, file);
      tmpMoved = true;
    }

    return {
      file,
      originalSize: original.size,
      optimizedSize: optimized.size,
      savingPercent,
      ...metrics,
      accepted: true,
      reason: APPLY ? "replaced" : "would replace"
    };
  } finally {
    if (!tmpMoved) {
      await unlink(tmpFile).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
  }
}

function reject(file: string, originalSize: number, optimizedSize: number, reason: string): CandidateResult {
  return {
    file,
    originalSize,
    optimizedSize,
    savingPercent: (1 - optimizedSize / originalSize) * 100,
    psnr: 0,
    meanAbsoluteError: 0,
    maxDelta: 0,
    accepted: false,
    reason
  };
}

function formatSize(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KiB`;
}

async function main() {
  const files = await findRuntimeScenePairs(SCENES_ROOT);
  const results: CandidateResult[] = [];

  for (const file of files) {
    results.push(await optimizeCandidate(file));
  }

  const accepted = results.filter((result) => result.accepted);
  const originalTotal = results.reduce((total, result) => total + result.originalSize, 0);
  const nextTotal = results.reduce(
    (total, result) => total + (result.accepted ? result.optimizedSize : result.originalSize),
    0
  );

  for (const result of accepted) {
    console.log(
      `${APPLY ? "optimized" : "would optimize"} ${result.file}: ${formatSize(result.originalSize)} -> ${formatSize(
        result.optimizedSize
      )} (-${result.savingPercent.toFixed(1)}%, psnr ${result.psnr.toFixed(2)} dB, mae ${result.meanAbsoluteError.toFixed(
        3
      )}, max ${result.maxDelta})`
    );
  }

  const savedPercent = (1 - nextTotal / originalTotal) * 100;
  console.log(
    `${APPLY ? "Optimized" : "Dry run"} ${accepted.length}/${results.length} runtime scene files: ${formatSize(
      originalTotal
    )} -> ${formatSize(nextTotal)} (-${savedPercent.toFixed(1)}%)`
  );
  console.log(
    `Gates: q=${WEBP_QUALITY}, min saving=${MIN_SAVING_PERCENT}%, min PSNR=${MIN_PSNR_DB} dB, max MAE=${MAX_MEAN_ABSOLUTE_ERROR}, max delta=${MAX_CHANNEL_DELTA}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
