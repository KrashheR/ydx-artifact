import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type SceneOffset = { x: number; y: number };
type MobileSceneAlignment = { A: SceneOffset; B: SceneOffset };

export type SceneAlignmentSourceWriteRequest = {
  levelId: string;
  mobile: MobileSceneAlignment;
};

const MAX_OFFSET_PX = 32;

export async function writeSceneAlignmentToSource(
  root: string,
  request: SceneAlignmentSourceWriteRequest,
) {
  validateRequest(request);
  const file = "src/content/sceneAlignment.json";
  const filePath = join(root, file);
  const current = JSON.parse(await readFile(filePath, "utf8")) as Record<
    string,
    { mobile: MobileSceneAlignment }
  >;
  const mobile = roundAlignment(request.mobile);

  if (isZeroAlignment(mobile)) {
    delete current[request.levelId];
  } else {
    current[request.levelId] = { mobile };
  }

  const ordered = Object.fromEntries(
    Object.entries(current).sort(([a], [b]) => a.localeCompare(b, "en")),
  );
  await writeFile(filePath, `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
  return { file, levelId: request.levelId, mobile };
}

function validateRequest(request: SceneAlignmentSourceWriteRequest) {
  if (!request.levelId || typeof request.levelId !== "string") {
    throw new Error("levelId is required");
  }
  for (const side of ["A", "B"] as const) {
    for (const axis of ["x", "y"] as const) {
      const value = request.mobile?.[side]?.[axis];
      if (!Number.isFinite(value) || Math.abs(value) > MAX_OFFSET_PX) {
        throw new Error(
          `${side}.${axis} must be a finite number between -${MAX_OFFSET_PX} and ${MAX_OFFSET_PX}`,
        );
      }
    }
  }
}

function roundAlignment(alignment: MobileSceneAlignment): MobileSceneAlignment {
  return {
    A: { x: round(alignment.A.x), y: round(alignment.A.y) },
    B: { x: round(alignment.B.x), y: round(alignment.B.y) },
  };
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function isZeroAlignment(alignment: MobileSceneAlignment) {
  return Object.values(alignment).every(
    (offset) => offset.x === 0 && offset.y === 0,
  );
}
