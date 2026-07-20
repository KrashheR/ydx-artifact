import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { loadProductionViteEnv } from "./vite-env";

const require = createRequire(import.meta.url);
const viteCli = join(
  dirname(require.resolve("vite/package.json")),
  "bin",
  "vite.js",
);

loadProductionViteEnv();
process.env.VITE_SCENE_ALIGNMENT_DEBUG = "true";
process.env.VITE_DEV_VALIDATE_CHEAT = "true";

const result = spawnSync(
  process.execPath,
  [viteCli, "--host", "127.0.0.1", ...process.argv.slice(2)],
  { env: process.env, stdio: "inherit" },
);

process.exit(result.status ?? 1);
