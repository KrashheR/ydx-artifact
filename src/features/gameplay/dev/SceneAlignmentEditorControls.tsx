import type {
  MobileSceneAlignment,
  SceneOffset,
} from "@/content/sceneAlignment";

type ApplyStatus = "idle" | "saving" | "saved" | "error";
type Axis = keyof SceneOffset;

type Props = {
  levelId: string;
  alignment: MobileSceneAlignment;
  storageKey: string;
  applyStatus: ApplyStatus;
  onApplyStatus: (status: ApplyStatus) => void;
  onChange: (side: "A" | "B", axis: Axis, value: number) => void;
  onReset: () => void;
};

const STEP = 0.5;

export function SceneAlignmentEditorControls({
  levelId,
  alignment,
  storageKey,
  applyStatus,
  onApplyStatus,
  onChange,
  onReset,
}: Props) {
  async function applyAlignment() {
    onApplyStatus("saving");
    try {
      const response = await fetch("/__dev/scene-alignment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId, mobile: alignment }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Scene alignment update failed");
      }
      window.localStorage.removeItem(storageKey);
      onApplyStatus("saved");
    } catch (error) {
      console.error(error);
      onApplyStatus("error");
    }
  }

  return (
    <div className="scene-alignment-editor absolute bottom-2 left-1/2 z-50 flex max-w-[calc(100%-12px)] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-xl border border-exp-brass/50 bg-[#111713]/95 px-2 py-2 shadow-2xl">
      <div className="shrink-0 font-jetbrains text-[9px] font-bold text-exp-brass2">
        {levelId.toUpperCase()}
      </div>
      {(["A", "B"] as const).map((side) => (
        <div
          key={side}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-1.5 py-1"
        >
          <span className="w-4 text-center font-jetbrains text-[11px] font-bold text-exp-brass2">
            {side}
          </span>
          {(["x", "y"] as const).map((axis) => (
            <div key={axis} className="flex items-center gap-0.5">
              <span className="text-[9px] uppercase text-exp-muted">{axis}</span>
              <button
                type="button"
                className="h-8 w-8 rounded-md border border-white/10 text-exp-parch"
                aria-label={`${side} ${axis} minus ${STEP} pixels`}
                onClick={() =>
                  onChange(side, axis, alignment[side][axis] - STEP)
                }
              >
                −
              </button>
              <input
                className="h-8 w-[54px] rounded-md border border-white/10 bg-black/30 px-1 text-center font-jetbrains text-[10px] text-exp-parch"
                type="number"
                min={-32}
                max={32}
                step={STEP}
                aria-label={`${side} ${axis} offset in pixels`}
                value={alignment[side][axis]}
                onChange={(event) =>
                  onChange(side, axis, Number(event.currentTarget.value))
                }
              />
              <button
                type="button"
                className="h-8 w-8 rounded-md border border-white/10 text-exp-parch"
                aria-label={`${side} ${axis} plus ${STEP} pixels`}
                onClick={() =>
                  onChange(side, axis, alignment[side][axis] + STEP)
                }
              >
                +
              </button>
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        className="h-9 shrink-0 rounded-lg bg-exp-success px-3 font-manrope text-[10px] font-bold text-[#102016]"
        disabled={applyStatus === "saving"}
        onClick={applyAlignment}
      >
        {applyStatus === "saving" ? "Saving…" : "Apply"}
      </button>
      <button
        type="button"
        className="h-9 shrink-0 rounded-lg border border-white/15 px-3 font-manrope text-[10px] font-bold text-exp-parch"
        onClick={onReset}
      >
        Reset
      </button>
      {applyStatus === "saved" || applyStatus === "error" ? (
        <span
          className="shrink-0 text-[9px] font-bold"
          style={{ color: applyStatus === "saved" ? "#6fc69e" : "#ff9d8a" }}
        >
          {applyStatus === "saved" ? "Saved" : "Failed"}
        </span>
      ) : null}
    </div>
  );
}
