import { spawnSync } from "node:child_process";
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
