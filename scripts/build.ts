import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { loadProductionViteEnv } from "./vite-env";

const require = createRequire(import.meta.url);
const tscCli = require.resolve("typescript/bin/tsc");
const viteCli = join(
  dirname(require.resolve("vite/package.json")),
  "bin",
  "vite.js",
);

loadProductionViteEnv();

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8"),
) as { version: string };
function listFilesRecursively(directory: string): string[] {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      return statSync(path).isDirectory() ? listFilesRecursively(path) : [path];
    })
    .sort();
}

const contentHasher = createHash("sha256")
  .update(readFileSync(join(process.cwd(), "ASSET_MANIFEST.md")))
  .update(readFileSync(join(process.cwd(), "ASSET_PROVENANCE.json")));
for (const file of listFilesRecursively(
  join(process.cwd(), "src", "content"),
)) {
  contentHasher
    .update(file.replace(process.cwd(), ""))
    .update(readFileSync(file));
}
const contentHash = contentHasher.digest("hex").slice(0, 12);
const buildTimestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");

process.env.VITE_APP_VERSION ??= packageJson.version;
process.env.VITE_CONTENT_VERSION ??= contentHash;
process.env.VITE_BUILD_ID ??= `${packageJson.version}-${contentHash}-${buildTimestamp}`;

if (
  process.env.VITE_PLATFORM_MODE === "yandex" &&
  !/^\d+$/.test(process.env.VITE_YANDEX_METRICA_ID ?? "")
) {
  console.error(
    "Yandex production build requires a numeric VITE_YANDEX_METRICA_ID.",
  );
  process.exit(1);
}

const tscResult = spawnSync(process.execPath, [tscCli, "-b"], {
  env: process.env,
  stdio: "inherit",
});

if (tscResult.status !== 0) {
  process.exit(tscResult.status ?? 1);
}

const viteResult = spawnSync(
  process.execPath,
  [viteCli, "build", ...process.argv.slice(2)],
  {
    env: process.env,
    stdio: "inherit",
  },
);

process.exit(viteResult.status ?? 1);
