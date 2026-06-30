import react from "@vitejs/plugin-react";
import type { Dirent } from "node:fs";
import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { writeHitboxesToSource } from "./scripts/hitbox-source-writer";
import { defineConfig } from "vite";
import type { Plugin, ResolvedConfig } from "vite";

async function removeSceneMarkupReferences(dir: string): Promise<number> {
  let entries: Dirent<string>[];

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
    throw error;
  }

  const removed = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return removeSceneMarkupReferences(path);
      if (entry.isFile() && entry.name === "3.webp") {
        await rm(path);
        return 1;
      }
      return 0;
    })
  );

  return removed.reduce((total, count) => total + count, 0);
}

async function removeDirectory(dir: string): Promise<number> {
  try {
    const entries = await readdir(dir);
    await rm(dir, { recursive: true, force: true });
    return entries.length > 0 ? 1 : 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
    throw error;
  }
}

function excludeNonRuntimeSceneAssetsFromBuild(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: "exclude-non-runtime-scene-assets-from-build",
    apply: "build",
    configResolved(config) {
      resolvedConfig = config;
    },
    async closeBundle() {
      const scenesDir = join(resolvedConfig.root, resolvedConfig.build.outDir, "assets", "scenes");
      const removedMarkupReferences = await removeSceneMarkupReferences(scenesDir);
      const removedPlaceholderDirs = await removeDirectory(join(scenesDir, "northern-route", "placeholder"));
      if (removedMarkupReferences > 0) {
        this.info(`Excluded ${removedMarkupReferences} scene markup reference assets from production build`);
      }
      if (removedPlaceholderDirs > 0) {
        this.info("Excluded unused scene placeholder assets from production build");
      }
    }
  };
}

function hitboxSourceWriter(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: "hitbox-source-writer",
    apply: "serve",
    configResolved(config) {
      resolvedConfig = config;
    },
    configureServer(server) {
      if (process.env.VITE_LAYOUT_DEBUG !== "true") return;

      server.middlewares.use("/__dev/hitboxes/apply", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        try {
          const payload = JSON.parse(await readRequestBody(req));
          const result = await writeHitboxesToSource(resolvedConfig.root, payload);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, result }));
        } catch (error) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
        }
      });
    }
  };
}

function readRequestBody(req: import("node:http").IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export default defineConfig({
  plugins: [react(), hitboxSourceWriter(), excludeNonRuntimeSceneAssetsFromBuild()],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  build: {
    target: "es2018",
    sourcemap: process.env.BUILD_SOURCEMAP === "true"
  }
});
