import { existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const distDir = join(root, "dist");
const archivePath = resolve(root, "dist-yandex.zip");

function run(command: string, args: string[], cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} ${args.join(" ")} failed\n${output}`);
  }
  return result.stdout;
}

if (!existsSync(join(distDir, "index.html"))) {
  throw new Error("dist/index.html is missing. Run pnpm build before pnpm release:zip.");
}

if (existsSync(archivePath)) {
  rmSync(archivePath);
}

run("zip", [
  "-r",
  "-X",
  archivePath,
  ".",
  "-x",
  ".DS_Store",
  "*/.DS_Store",
  "__MACOSX/*",
  "*/__MACOSX/*",
  "._*",
  "*/._*",
  "*.map",
  "*/.git/*",
  "*/node_modules/*"
], distDir);

const entries = run("unzip", ["-Z1", archivePath])
  .split(/\r?\n/)
  .filter(Boolean);

const forbidden = entries.filter(
  (entry) =>
    entry === "dist/" ||
    entry.startsWith("dist/") ||
    entry.includes("__MACOSX") ||
    entry.endsWith(".DS_Store") ||
    entry.split("/").some((part) => part.startsWith("._")) ||
    entry.endsWith(".map")
);

if (!entries.includes("index.html")) {
  throw new Error("index.html is not at the ZIP root");
}

if (forbidden.length > 0) {
  throw new Error(`ZIP contains forbidden entries:\n${forbidden.join("\n")}`);
}

console.log(`Created ${archivePath}`);
console.log(`ZIP entries: ${entries.length}`);
