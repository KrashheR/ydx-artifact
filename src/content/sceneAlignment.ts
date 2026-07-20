import { z } from "zod";
import alignmentData from "./sceneAlignment.json";

export type SceneOffset = {
  x: number;
  y: number;
};

export type MobileSceneAlignment = {
  A: SceneOffset;
  B: SceneOffset;
};

export const ZERO_SCENE_OFFSET: SceneOffset = Object.freeze({ x: 0, y: 0 });

const DEFAULT_MOBILE_ALIGNMENT: MobileSceneAlignment = Object.freeze({
  A: ZERO_SCENE_OFFSET,
  B: ZERO_SCENE_OFFSET,
});

const sceneOffsetSchema = z.object({
  x: z.number().min(-32).max(32),
  y: z.number().min(-32).max(32),
});

const sceneAlignments = z
  .record(
    z.string().min(1),
    z.object({
      mobile: z.object({ A: sceneOffsetSchema, B: sceneOffsetSchema }),
    }),
  )
  .parse(alignmentData);

export function getMobileSceneAlignment(levelId: string): MobileSceneAlignment {
  const mobile = sceneAlignments[levelId]?.mobile;
  return {
    A: normalizeOffset(mobile?.A),
    B: normalizeOffset(mobile?.B),
  };
}

function normalizeOffset(offset?: Partial<SceneOffset>): SceneOffset {
  return {
    x: Number.isFinite(offset?.x) ? Number(offset?.x) : 0,
    y: Number.isFinite(offset?.y) ? Number(offset?.y) : 0,
  };
}

export function isDefaultMobileSceneAlignment(
  alignment: MobileSceneAlignment,
) {
  return (
    alignment.A.x === DEFAULT_MOBILE_ALIGNMENT.A.x &&
    alignment.A.y === DEFAULT_MOBILE_ALIGNMENT.A.y &&
    alignment.B.x === DEFAULT_MOBILE_ALIGNMENT.B.x &&
    alignment.B.y === DEFAULT_MOBILE_ALIGNMENT.B.y
  );
}
