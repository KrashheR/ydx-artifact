import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const viteCli = join(dirname(require.resolve("vite/package.json")), "bin", "vite.js");

process.env.VITE_LAYOUT_DEBUG = "true";
process.env.ALLOW_LAYOUT_DEBUG = "true";

const result = spawnSync(process.execPath, [viteCli, "--host", "127.0.0.1", ...process.argv.slice(2)], {
  env: process.env,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
