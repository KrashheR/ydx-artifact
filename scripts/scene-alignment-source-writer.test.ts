import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { writeSceneAlignmentToSource } from "./scene-alignment-source-writer";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("writeSceneAlignmentToSource", () => {
  it("stores a level-specific mobile A/B offset rounded to hundredths", async () => {
    const root = await createFixture();

    await writeSceneAlignmentToSource(root, {
      levelId: "nr-01-scene01",
      mobile: {
        A: { x: 0, y: 0 },
        B: { x: -0.504, y: 1.256 },
      },
    });

    await expect(readConfig(root)).resolves.toEqual({
      "nr-01-scene01": {
        mobile: {
          A: { x: 0, y: 0 },
          B: { x: -0.5, y: 1.26 },
        },
      },
    });
  });

  it("removes the level override when both sides return to zero", async () => {
    const root = await createFixture({
      "nr-01-scene01": {
        mobile: { A: { x: 0.5, y: 0 }, B: { x: 0, y: 0 } },
      },
    });

    await writeSceneAlignmentToSource(root, {
      levelId: "nr-01-scene01",
      mobile: {
        A: { x: 0, y: 0 },
        B: { x: 0, y: 0 },
      },
    });

    await expect(readConfig(root)).resolves.toEqual({});
  });
});

async function createFixture(initial: object = {}) {
  const root = await mkdtemp(join(tmpdir(), "artifact-scene-alignment-"));
  roots.push(root);
  const contentDir = join(root, "src", "content");
  await mkdir(contentDir, { recursive: true });
  await writeFile(
    join(contentDir, "sceneAlignment.json"),
    `${JSON.stringify(initial, null, 2)}\n`,
    "utf8",
  );
  return root;
}

async function readConfig(root: string) {
  return JSON.parse(
    await readFile(join(root, "src", "content", "sceneAlignment.json"), "utf8"),
  );
}
