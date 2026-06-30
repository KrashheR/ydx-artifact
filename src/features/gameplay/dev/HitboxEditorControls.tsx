import type { DifferenceDefinition } from "@/entities/level/schema";

type ApplyStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  differences: DifferenceDefinition[];
  levelId: string;
  chapterId: string;
  order: number;
  storageKey: string;
  applyStatus: ApplyStatus;
  onApplyStatus: (status: ApplyStatus) => void;
  onReset: () => void;
};

export function HitboxEditorControls({
  differences,
  levelId,
  chapterId,
  order,
  storageKey,
  applyStatus,
  onApplyStatus,
  onReset
}: Props) {
  async function copyEditedDifferences() {
    await window.navigator.clipboard?.writeText(JSON.stringify(differences, null, 2));
  }

  async function applyEditedDifferences() {
    onApplyStatus("saving");
    try {
      const response = await fetch("/__dev/hitboxes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId, chapterId, order, differences })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Hitbox source update failed");
      }
      window.localStorage.removeItem(storageKey);
      onApplyStatus("saved");
    } catch (error) {
      console.error(error);
      onApplyStatus("error");
    }
  }

  return (
    <div
      className="absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-[10px] px-3 py-2"
      style={{ border: "1px solid rgba(111,198,158,.45)", background: "rgba(21,27,24,.9)" }}
    >
      <span className="font-jetbrains text-[10px] font-semibold text-exp-success">
        HITBOX EDITOR
      </span>
      <span className="hidden font-manrope text-[10px] font-semibold text-exp-muted sm:inline">
        Drag/resize either side to update both hitboxes
      </span>
      <button
        type="button"
        className="rounded-[7px] px-3 py-1 font-manrope text-[11px] font-bold text-[#102016]"
        style={{ background: "#6fc69e" }}
        disabled={applyStatus === "saving"}
        onClick={applyEditedDifferences}
      >
        {applyStatus === "saving" ? "Applying..." : "Apply"}
      </button>
      <button
        type="button"
        className="rounded-[7px] px-3 py-1 font-manrope text-[11px] font-bold text-[#102016]"
        style={{ background: "rgba(111,198,158,.72)" }}
        onClick={copyEditedDifferences}
      >
        Copy JSON
      </button>
      {applyStatus === "saved" || applyStatus === "error" ? (
        <span
          className="font-manrope text-[10px] font-bold"
          style={{ color: applyStatus === "saved" ? "#6fc69e" : "#ff9d8a" }}
        >
          {applyStatus === "saved" ? "Applied" : "Apply failed"}
        </span>
      ) : null}
      <button
        type="button"
        className="rounded-[7px] px-3 py-1 font-manrope text-[11px] font-bold text-exp-parch"
        style={{ border: "1px solid rgba(213,195,154,.2)", background: "rgba(213,195,154,.06)" }}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
