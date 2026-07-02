import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const viteCli = join(dirname(require.resolve("vite/package.json")), "bin", "vite.js");

const viteArgs = process.argv.slice(2).filter((arg) => {
  if (arg !== "cheat" && arg !== "--cheat") return true;
  process.env.VITE_DEV_VALIDATE_CHEAT = "true";
  return false;
});

const result = spawnSync(process.execPath, [viteCli, "--host", "127.0.0.1", ...viteArgs], {
  env: process.env,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
