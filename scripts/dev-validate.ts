import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const viteCli = join(dirname(require.resolve("vite/package.json")), "bin", "vite.js");

process.env.VITE_LAYOUT_DEBUG = "true";
process.env.ALLOW_LAYOUT_DEBUG = "true";

const viteArgs = process.argv.slice(2).filter((arg) => {
  if (arg === "final" || arg === "--final") {
    process.env.VITE_FINAL_VALIDATE = "true";
    process.env.VITE_LAYOUT_DEBUG = "false";
    return false;
  }
  if (arg !== "cheat" && arg !== "--cheat") return true;
  process.env.VITE_DEV_VALIDATE_CHEAT = "true";
  return false;
});

const result = spawnSync(process.execPath, [viteCli, "--host", "127.0.0.1", ...viteArgs], {
  env: process.env,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
