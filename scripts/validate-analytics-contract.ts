import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { ANALYTICS_EVENT_NAMES } from "../src/services/analytics/eventRegistry";
import { loadProductionViteEnv } from "./vite-env";

const root = process.cwd();
const release = process.argv.includes("--release");
const verifyDist = process.argv.includes("--dist");
const crazyGames = process.argv.includes("--crazygames");
const registry = new Set<string>(ANALYTICS_EVENT_NAMES);
const errors: string[] = [];

function filesRecursively(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesRecursively(path) : [path];
  });
}

const sourceFiles = filesRecursively(join(root, "src")).filter((file) =>
  [".ts", ".tsx"].includes(extname(file)),
);
const runtimeEvents = new Set<string>();
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(
    /trackAnalyticsEvent\(\s*["']([a-z0-9_]+)["']/g,
  )) {
    runtimeEvents.add(match[1]);
  }
}

for (const event of runtimeEvents) {
  if (!registry.has(event))
    errors.push(`Runtime event is missing from registry: ${event}`);
}

const docs = readFileSync(join(root, "ANALYTICS_EVENTS.md"), "utf8");
for (const event of registry) {
  if (!docs.includes(`\`${event}\``)) {
    errors.push(`Registry event is missing from ANALYTICS_EVENTS.md: ${event}`);
  }
}

loadProductionViteEnv();
const counterId = process.env.VITE_YANDEX_METRICA_ID ?? "";
if (release && !crazyGames && !/^\d+$/.test(counterId)) {
  errors.push("Release requires a numeric VITE_YANDEX_METRICA_ID");
}

if (verifyDist) {
  const dist = join(root, "dist");
  if (!existsSync(dist)) {
    errors.push("dist/ is missing; build before --dist verification");
  } else {
    const output = filesRecursively(dist)
      .filter((file) => [".js", ".html"].includes(extname(file)))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    if (crazyGames && output.includes("mc.yandex.ru/metrika/tag.js")) {
      errors.push("CrazyGames output must not contain the Metrica tag");
    } else if (!crazyGames && !output.includes("mc.yandex.ru/metrika/tag.js")) {
      errors.push(
        "Production output does not contain the Metrica tag initialization",
      );
    }
    if (counterId && !output.includes(counterId)) {
      errors.push(
        "Production output does not contain the configured Metrica counter ID",
      );
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[analytics] ${error}`);
  process.exit(1);
}

console.log(
  `[analytics] contract OK: ${registry.size} registry events, ${runtimeEvents.size} static runtime events`,
);
