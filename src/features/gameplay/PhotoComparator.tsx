import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getMobileSceneAlignment,
  ZERO_SCENE_OFFSET,
  type MobileSceneAlignment,
  type SceneOffset,
} from "@/content/sceneAlignment";
import { getSceneMarkupAsset } from "@/content/sceneAssets";
import type {
  DifferenceDefinition,
  HitShape,
  LevelDefinition,
} from "@/entities/level/schema";
import { hitTest, shapeCenter } from "@/shared/lib/hitTesting";
import { useGameStore } from "@/shared/store/gameStore";
import { useReducedEffects } from "@/shared/motion/useReducedEffects";

type PhotoComparatorProps = {
  level: LevelDefinition;
  foundIds: string[];
  hintId?: string;
  onDifference: (differenceId: string) => void;
  onMisclick: () => void;
  labelA?: string;
  labelB?: string;
  debugShowAllDifferences?: boolean;
  debugUseMarkupReference?: boolean;
  debugEnableHitboxEditor?: boolean;
  debugEnableSceneAlignmentEditor?: boolean;
};

type PointerState = {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
};

type WrongClick = { key: number; x: number; y: number };
type Size = { width: number; height: number };
type ContainedRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};
type NormalizedPoint = {
  x: number;
  y: number;
  side: "A" | "B";
  inImage: boolean;
};
type ResizeAxis = "x" | "y" | "both";
type HitboxEdit = {
  differenceId: string;
  side: "A" | "B";
  mode: "move" | "resize" | "rotate";
  resizeAxis?: ResizeAxis;
  clientX: number;
  clientY: number;
  centerClientX?: number;
  centerClientY?: number;
  lastAngle?: number;
};
type ApplyStatus = "idle" | "saving" | "saved" | "error";
type FlipDirection = "to-a" | "to-b";
type FlipPhase = "out" | "in";

let wrongClickSeq = 0;
const HITBOX_EDITOR_STORAGE_PREFIX = "artifact.hitboxEditor.";
const SCENE_ALIGNMENT_STORAGE_PREFIX = "artifact.sceneAlignmentEditor.";
const PAN_OVERSCROLL_PX = 160;
const FLIP_OUT_MS = 70;
const FLIP_TRANSITION_MS = 190;
const HitboxEditorControls = import.meta.env.DEV
  ? lazy(() =>
      import("./dev/HitboxEditorControls").then((module) => ({
        default: module.HitboxEditorControls,
      })),
    )
  : null;
const SceneAlignmentEditorControls = import.meta.env.DEV
  ? lazy(() =>
      import("./dev/SceneAlignmentEditorControls").then((module) => ({
        default: module.SceneAlignmentEditorControls,
      })),
    )
  : null;

export function PhotoComparator({
  level,
  foundIds,
  hintId,
  onDifference,
  onMisclick,
  labelA,
  labelB,
  debugShowAllDifferences = false,
  debugUseMarkupReference = false,
  debugEnableHitboxEditor = false,
  debugEnableSceneAlignmentEditor = false,
}: PhotoComparatorProps) {
  const { t } = useTranslation();
  const reducedEffects = useReducedEffects();
  const comparatorScheme = useGameStore(
    (s) => s.saveData.settings.comparatorScheme ?? "flip",
  );
  const [version, setVersion] = useState<"A" | "B">("A");
  const [comparePosition, setComparePosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [imageAspectRatio, setImageAspectRatio] = useState(1586 / 992);
  const [editableDifferences, setEditableDifferences] = useState<
    DifferenceDefinition[]
  >(() => cloneDifferences(level.differences));
  const pointer = useRef<PointerState | null>(null);
  const hitboxEdit = useRef<HitboxEdit | null>(null);
  const sliderFrameRef = useRef<HTMLDivElement | null>(null);
  const flipTimerRef = useRef<number | null>(null);
  const flipFinishTimerRef = useRef<number | null>(null);
  const sliderGlintTimerRef = useRef<number | null>(null);
  const previousSliderSideRef = useRef<"left" | "right">("right");
  const lastSliderGlintRef = useRef(0);
  const [wrongClicksA, setWrongClicksA] = useState<WrongClick[]>([]);
  const [wrongClicksB, setWrongClicksB] = useState<WrongClick[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<FlipDirection>("to-b");
  const [flipPhase, setFlipPhase] = useState<FlipPhase>("out");
  const [sliderGlint, setSliderGlint] = useState(false);
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>("idle");
  const [alignmentApplyStatus, setAlignmentApplyStatus] =
    useState<ApplyStatus>("idle");
  const [mobileSceneAlignment, setMobileSceneAlignment] =
    useState<MobileSceneAlignment>(() => getMobileSceneAlignment(level.id));
  const hitboxEditorEnabled =
    debugShowAllDifferences && debugEnableHitboxEditor;
  const editorStorageKey = `${HITBOX_EDITOR_STORAGE_PREFIX}${level.id}`;
  const alignmentStorageKey = `${SCENE_ALIGNMENT_STORAGE_PREFIX}${level.id}`;

  useEffect(() => {
    setEditableDifferences(
      loadEditedDifferences(editorStorageKey, level.differences),
    );
    setApplyStatus("idle");
  }, [editorStorageKey, level.differences]);

  useEffect(() => {
    const sourceAlignment = getMobileSceneAlignment(level.id);
    setMobileSceneAlignment(
      debugEnableSceneAlignmentEditor
        ? loadEditedSceneAlignment(alignmentStorageKey, sourceAlignment)
        : sourceAlignment,
    );
    setAlignmentApplyStatus("idle");
  }, [alignmentStorageKey, debugEnableSceneAlignmentEditor, level.id]);

  useEffect(
    () => () => {
      if (flipTimerRef.current !== null) window.clearTimeout(flipTimerRef.current);
      if (flipFinishTimerRef.current !== null) window.clearTimeout(flipFinishTimerRef.current);
      if (sliderGlintTimerRef.current !== null) window.clearTimeout(sliderGlintTimerRef.current);
    },
    [],
  );

  const found = useMemo(
    () => editableDifferences.filter((d) => foundIds.includes(d.id)),
    [editableDifferences, foundIds],
  );
  const visibleMarkers = debugShowAllDifferences ? editableDifferences : found;

  function addWrongClick(side: "A" | "B", x: number, y: number) {
    const key = wrongClickSeq++;
    const setter = side === "A" ? setWrongClicksA : setWrongClicksB;
    setter((prev) => [...prev, { key, x, y }]);
    setTimeout(() => setter((prev) => prev.filter((w) => w.key !== key)), 560);
  }

  function handlePointerUp(point: NormalizedPoint) {
    const active = pointer.current;
    pointer.current = null;
    if (!active) return;
    if (!point.inImage) return;

    const match = editableDifferences.find((d) => {
      if (foundIds.includes(d.id)) return false;
      return hitTest(
        point.side === "A" ? d.hitAreaA : d.hitAreaB,
        point.x,
        point.y,
        imageAspectRatio,
      );
    });

    if (match) {
      onDifference(match.id);
    } else {
      onMisclick();
      addWrongClick(point.side, point.x, point.y);
    }
  }

  function updateEditableDifferences(
    updater: (differences: DifferenceDefinition[]) => DifferenceDefinition[],
  ) {
    setApplyStatus("idle");
    setEditableDifferences((current) => {
      const next = updater(current);
      if (hitboxEditorEnabled) {
        window.localStorage.setItem(editorStorageKey, JSON.stringify(next));
      }
      return next;
    });
  }

  function handleAddHitbox() {
    updateEditableDifferences((differences) => [
      ...differences,
      createNewDifference(level, differences),
    ]);
  }

  function handleHitboxDelete(differenceId: string) {
    const confirmed = window.confirm(
      `Delete hitbox "${differenceId}"? This only changes the editor draft until you click Apply.`,
    );
    if (!confirmed) return;
    hitboxEdit.current = null;
    updateEditableDifferences((differences) =>
      differences.filter((difference) => difference.id !== differenceId),
    );
  }

  function handleHitboxMove(
    differenceId: string,
    side: "A" | "B",
    dx: number,
    dy: number,
  ) {
    updateEditableDifferences((differences) =>
      differences.map((difference) => {
        if (difference.id !== differenceId) return difference;
        return moveDifferenceHitboxPair(difference, side, dx, dy);
      }),
    );
  }

  function handleHitboxResize(
    differenceId: string,
    side: "A" | "B",
    dx: number,
    dy: number,
    axis: ResizeAxis,
  ) {
    updateEditableDifferences((differences) =>
      differences.map((difference) => {
        if (difference.id !== differenceId) return difference;
        return resizeDifferenceHitboxPair(
          difference,
          side,
          dx,
          dy,
          imageAspectRatio,
          axis,
        );
      }),
    );
  }

  function handleHitboxRotate(
    differenceId: string,
    side: "A" | "B",
    deltaDegrees: number,
  ) {
    updateEditableDifferences((differences) =>
      differences.map((difference) => {
        if (difference.id !== differenceId) return difference;
        return rotateDifferenceHitboxPair(difference, side, deltaDegrees);
      }),
    );
  }

  function resetEditedDifferences() {
    window.localStorage.removeItem(editorStorageKey);
    setEditableDifferences(cloneDifferences(level.differences));
    setApplyStatus("idle");
  }

  function updateSceneAlignment(
    side: "A" | "B",
    axis: keyof SceneOffset,
    value: number,
  ) {
    if (!Number.isFinite(value)) return;
    setAlignmentApplyStatus("idle");
    setMobileSceneAlignment((current) => {
      const next = {
        ...current,
        [side]: { ...current[side], [axis]: clampSceneOffset(value) },
      };
      window.localStorage.setItem(alignmentStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function resetSceneAlignment() {
    window.localStorage.removeItem(alignmentStorageKey);
    setMobileSceneAlignment(getMobileSceneAlignment(level.id));
    setAlignmentApplyStatus("idle");
  }

  function renderPhoto(side: "A" | "B", mobile = false) {
    const src = getSceneSource(level, side, debugUseMarkupReference);
    const inactiveSrc = mobile
      ? getSceneSource(level, side === "A" ? "B" : "A", debugUseMarkupReference)
      : undefined;
    const label = side === "A" ? labelA : labelB;
    const wrongClicks = side === "A" ? wrongClicksA : wrongClicksB;
    const displaySide = side;

    return (
      <div className="comparator-photo-column flex flex-1 flex-col">
        {/* Label row (desktop only) */}
        {!mobile && label && (
          <div className="comparator-label-row mb-[10px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[6px] font-manrope text-[11px] font-bold text-exp-brass2"
                style={{
                  background: "rgba(184,138,69,.16)",
                  border: "1px solid rgba(184,138,69,.4)",
                }}
              >
                {side}
              </span>
              <span className="font-manrope text-[11px] font-semibold tracking-[.18em] text-exp-muted">
                {label}
              </span>
            </div>
            {hitboxEditorEnabled ? (
              <span
                className="font-jetbrains text-[10px] font-medium"
                style={{ color: "rgba(135,144,135,.7)" }}
              >
                {level.id.toUpperCase()}-{side}
              </span>
            ) : null}
          </div>
        )}

        <SceneAspectFrame aspectRatio={imageAspectRatio}>
          <PhotoCanvas
            levelId={level.id}
            side={displaySide}
            mobile={mobile}
            version={version}
            src={src}
            inactiveSrc={inactiveSrc}
            zoom={zoom}
            pan={pan}
            imageAspectRatio={imageAspectRatio}
            pointer={pointer}
            visibleMarkers={visibleMarkers}
            foundIds={foundIds}
            hintDifference={
              hintId
                ? level.differences.find((d) => d.id === hintId)
                : undefined
            }
            wrongClicks={wrongClicks}
            debugShowAllDifferences={debugShowAllDifferences}
            hitboxEditorEnabled={hitboxEditorEnabled}
            hitboxEdit={hitboxEdit}
            onImageAspectRatio={setImageAspectRatio}
            onZoom={setZoom}
            onPan={setPan}
            onPointerPick={handlePointerUp}
            onHitboxMove={handleHitboxMove}
            onHitboxResize={handleHitboxResize}
            onHitboxRotate={handleHitboxRotate}
            onHitboxDelete={handleHitboxDelete}
            compareLabel={
              version === "A" ? t("game.labelOriginal") : t("game.labelCopy")
            }
            sceneOffset={mobile ? mobileSceneAlignment[side] : ZERO_SCENE_OFFSET}
          />
        </SceneAspectFrame>
      </div>
    );
  }

  function renderSliderLayer(side: "A" | "B") {
    const src = getSceneSource(level, side, debugUseMarkupReference);
    const wrongClicks = side === "A" ? wrongClicksA : wrongClicksB;

    return (
      <PhotoCanvas
        levelId={level.id}
        side={side}
        mobile={false}
        version={side}
        src={src}
        zoom={zoom}
        pan={pan}
        imageAspectRatio={imageAspectRatio}
        pointer={pointer}
        visibleMarkers={visibleMarkers}
        foundIds={foundIds}
        hintDifference={
          hintId ? level.differences.find((d) => d.id === hintId) : undefined
        }
        wrongClicks={wrongClicks}
        debugShowAllDifferences={debugShowAllDifferences}
        hitboxEditorEnabled={hitboxEditorEnabled}
        hitboxEdit={hitboxEdit}
        onImageAspectRatio={setImageAspectRatio}
        onZoom={setZoom}
        onPan={setPan}
        onPointerPick={handlePointerUp}
        onHitboxMove={handleHitboxMove}
        onHitboxResize={handleHitboxResize}
        onHitboxRotate={handleHitboxRotate}
        onHitboxDelete={handleHitboxDelete}
        compareLabel={
          side === "A" ? t("game.labelOriginal") : t("game.labelCopy")
        }
        sceneOffset={mobileSceneAlignment[side]}
      />
    );
  }

  function updateComparePositionFromPointer(clientX: number) {
    const rect = sliderFrameRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    updateComparePosition(Math.max(0, Math.min(100, Math.round(next))));
  }

  function updateComparePosition(next: number) {
    const side = next < 50 ? "left" : "right";
    const crossedCenter = side !== previousSliderSideRef.current;
    previousSliderSideRef.current = side;
    setComparePosition(next);

    if (
      !crossedCenter ||
      reducedEffects ||
      Date.now() - lastSliderGlintRef.current < 900
    )
      return;

    lastSliderGlintRef.current = Date.now();
    setSliderGlint(true);
    if (sliderGlintTimerRef.current !== null) {
      window.clearTimeout(sliderGlintTimerRef.current);
    }
    sliderGlintTimerRef.current = window.setTimeout(() => {
      setSliderGlint(false);
      sliderGlintTimerRef.current = null;
    }, 260);
  }

  function handleFlip() {
    if (isFlipping) return;
    if (reducedEffects) {
      setVersion((current) => (current === "A" ? "B" : "A"));
      return;
    }

    const nextVersion = version === "A" ? "B" : "A";
    setFlipDirection(nextVersion === "A" ? "to-a" : "to-b");
    setFlipPhase("out");
    setIsFlipping(true);
    flipTimerRef.current = window.setTimeout(() => {
      setVersion(nextVersion);
      setFlipPhase("in");
      flipTimerRef.current = null;
    }, FLIP_OUT_MS);
    flipFinishTimerRef.current = window.setTimeout(() => {
      setIsFlipping(false);
      flipFinishTimerRef.current = null;
    }, FLIP_TRANSITION_MS);
  }

  return (
    <div className="photo-comparator relative flex flex-1 flex-col">
      {/* Desktop: side by side */}
      <div className="comparator-desktop hidden flex-1 gap-5 md:flex">
        {renderPhoto("A")}

        {/* Divider */}
        <div
          className="flex flex-col items-center justify-center gap-[14px] pt-[30px]"
          style={{ width: "34px", flexShrink: 0 }}
        >
          <div
            className="flex-1"
            style={{
              width: "1px",
              background:
                "linear-gradient(180deg, transparent, rgba(213,195,154,.2), transparent)",
            }}
          />
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-exp-brass"
            style={{
              border: "1px solid rgba(184,138,69,.4)",
              background: "rgba(21,27,24,.7)",
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
            </svg>
          </div>
          <div
            className="flex-1"
            style={{
              width: "1px",
              background:
                "linear-gradient(180deg, transparent, rgba(213,195,154,.2), transparent)",
            }}
          />
        </div>

        {renderPhoto("B")}
      </div>

      {/* Mobile landscape: one full 16:10 frame that flips between A and B */}
      {comparatorScheme === "flip" && (
        <div className="comparator-landscape-flip hidden flex-1 flex-col items-center justify-center gap-[10px]">
          <div className={isFlipping ? `vfx-compare-flip vfx-compare-flip--${flipDirection} vfx-compare-flip--${flipPhase} w-full flex-1` : "w-full flex-1"}>
            {renderPhoto(version, true)}
          </div>
          <button
            className="vfx-press comparator-flip-button flex min-h-[44px] w-full max-w-[560px] items-center justify-center gap-2 rounded-xl font-manrope text-[13px] font-bold text-exp-brass2 disabled:opacity-70"
            style={{
              border: "1px solid rgba(184,138,69,.45)",
              background: "rgba(184,138,69,.1)",
            }}
            onClick={handleFlip}
            disabled={isFlipping}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
            </svg>
            {t("actions.compare")}
          </button>
        </div>
      )}

      {/* Mobile landscape: both photos stay visible with a shared camera. */}
      {comparatorScheme === "side-by-side" && (
        <div className="comparator-landscape-side-by-side relative hidden flex-1 gap-2">
          {renderPhoto("A", true)}
          {renderPhoto("B", true)}
          <div className="comparator-side-by-side-zoom absolute bottom-2 left-1/2 z-40 flex -translate-x-1/2 overflow-hidden rounded-lg">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center text-lg font-bold text-exp-brass2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
              aria-label={t("actions.zoomOut")}
              onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
            >
              −
            </button>
            <span
              className="flex min-w-11 items-center justify-center border-x border-[rgba(213,195,154,.16)] px-1 font-jetbrains text-[10px] text-exp-brass2"
              aria-live="polite"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center text-lg font-bold text-exp-brass2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
              aria-label={t("actions.zoomIn")}
              onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Mobile landscape: one full 16:10 frame with before/after slider */}
      {comparatorScheme === "slider" && (
        <div className="comparator-landscape-slider hidden flex-1 flex-col items-center justify-center gap-[11px]">
        <SceneAspectFrame aspectRatio={imageAspectRatio}>
          <div
            ref={sliderFrameRef}
            className="comparator-slider-frame relative h-full w-full overflow-hidden rounded-[14px]"
          >
            <div className="absolute inset-0 flex">
              {renderSliderLayer("B")}
            </div>
            <div
              className="absolute inset-0 flex overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
            >
              {renderSliderLayer("A")}
            </div>
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-30 w-[2px] -translate-x-1/2 bg-[#d8af63] shadow-[0_0_14px_rgba(216,175,99,.7)]"
              style={{ left: `${comparePosition}%` }}
              aria-hidden="true"
            />
            {sliderGlint ? (
              <span
                className="vfx-compare-slider-glint pointer-events-none absolute bottom-0 top-0 z-20 w-14 -translate-x-1/2"
                style={{ left: `${comparePosition}%` }}
                aria-hidden="true"
              />
            ) : null}
            <div
              className="absolute top-1/2 z-30 flex h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center rounded-full bg-[#d8af63] text-[#1a130a] shadow-[0_6px_16px_rgba(0,0,0,.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
              style={{ left: `${comparePosition}%` }}
              role="slider"
              tabIndex={0}
              aria-label={t("actions.compare")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={comparePosition}
              onPointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                updateComparePositionFromPointer(event.clientX);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId))
                  return;
                event.stopPropagation();
                updateComparePositionFromPointer(event.clientX);
              }}
              onPointerUp={(event) => {
                event.stopPropagation();
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                  event.preventDefault();
                  updateComparePosition(Math.max(0, comparePosition - 5));
                }
                if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                  event.preventDefault();
                  updateComparePosition(Math.min(100, comparePosition + 5));
                }
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
              </svg>
            </div>
            <div className="pointer-events-none absolute left-3 top-3 z-40 flex h-6 items-center gap-1.5 rounded-[7px] bg-[rgba(12,16,14,.75)] px-2.5">
              <span className="text-[10px] font-bold text-[#e7c074]">A</span>
              <span className="text-[8.5px] font-semibold tracking-[.1em] text-exp-muted">
                {labelA}
              </span>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-40 flex h-6 items-center gap-1.5 rounded-[7px] bg-[rgba(12,16,14,.75)] px-2.5">
              <span className="text-[10px] font-bold text-[#d8af63]">B</span>
              <span className="text-[8.5px] font-semibold tracking-[.1em] text-exp-muted">
                {labelB}
              </span>
            </div>
          </div>
        </SceneAspectFrame>
          <input
            className="comparator-slider-range"
            type="range"
            min="0"
            max="100"
            value={comparePosition}
            aria-label={t("actions.compare")}
            onChange={(event) => updateComparePosition(Number(event.target.value))}
          />
        </div>
      )}

      {/* Mobile: single image + toggle */}
      <div className="comparator-mobile-portrait flex flex-1 flex-col md:hidden">
        <div className={isFlipping ? `vfx-compare-flip vfx-compare-flip--${flipDirection} vfx-compare-flip--${flipPhase} flex-1` : "flex-1"}>
          {renderPhoto(version, true)}
        </div>
        <button
          className="comparator-portrait-flip-button mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl font-manrope text-[13.5px] font-bold text-exp-brass2"
          style={{
            border: "1px solid rgba(184,138,69,.45)",
            background: "rgba(184,138,69,.1)",
          }}
          onClick={handleFlip}
          disabled={isFlipping}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
          </svg>
          {t("actions.compare")}
        </button>
      </div>

      {hitboxEditorEnabled && HitboxEditorControls ? (
        <Suspense fallback={null}>
          <HitboxEditorControls
            differences={editableDifferences}
            levelId={level.id}
            chapterId={level.chapterId}
            order={level.order}
            storageKey={editorStorageKey}
            applyStatus={applyStatus}
            onApplyStatus={setApplyStatus}
            onAddHitbox={handleAddHitbox}
            onReset={resetEditedDifferences}
          />
        </Suspense>
      ) : null}

      {debugEnableSceneAlignmentEditor && SceneAlignmentEditorControls ? (
        <Suspense fallback={null}>
          <SceneAlignmentEditorControls
            levelId={level.id}
            alignment={mobileSceneAlignment}
            storageKey={alignmentStorageKey}
            applyStatus={alignmentApplyStatus}
            onApplyStatus={setAlignmentApplyStatus}
            onChange={updateSceneAlignment}
            onReset={resetSceneAlignment}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

function getSceneSource(
  level: LevelDefinition,
  side: "A" | "B",
  debugUseMarkupReference: boolean,
) {
  const baseSrc = side === "A" ? level.imageA : level.imageB;
  return debugUseMarkupReference ? getSceneMarkupAsset(baseSrc) : baseSrc;
}

function SceneAspectFrame({
  aspectRatio,
  children,
}: {
  aspectRatio: number;
  children: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState<Size>({ width: 0, height: 0 });
  const sceneRect = getContainedImageRect(frameSize, aspectRatio);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const updateFrameSize = () => {
      const rect = element.getBoundingClientRect();
      setFrameSize((current) =>
        current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height },
      );
    };

    updateFrameSize();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateFrameSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="comparator-photo-frame">
      <div
        className="comparator-photo-size"
        style={{
          width: sceneRect.width > 0 ? sceneRect.width : undefined,
          height: sceneRect.height > 0 ? sceneRect.height : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PhotoCanvas({
  levelId,
  side,
  mobile,
  version,
  src,
  inactiveSrc,
  zoom,
  pan,
  imageAspectRatio,
  pointer,
  visibleMarkers,
  foundIds,
  hintDifference,
  wrongClicks,
  debugShowAllDifferences,
  hitboxEditorEnabled,
  hitboxEdit,
  onImageAspectRatio,
  onZoom,
  onPan,
  onPointerPick,
  onHitboxMove,
  onHitboxResize,
  onHitboxRotate,
  onHitboxDelete,
  compareLabel,
  sceneOffset,
}: {
  levelId: string;
  side: "A" | "B";
  mobile: boolean;
  version: "A" | "B";
  src: string;
  inactiveSrc?: string;
  zoom: number;
  pan: { x: number; y: number };
  imageAspectRatio: number;
  pointer: React.MutableRefObject<PointerState | null>;
  visibleMarkers: DifferenceDefinition[];
  foundIds: string[];
  hintDifference?: DifferenceDefinition;
  wrongClicks: WrongClick[];
  debugShowAllDifferences: boolean;
  hitboxEditorEnabled: boolean;
  hitboxEdit: React.MutableRefObject<HitboxEdit | null>;
  onImageAspectRatio: (aspectRatio: number) => void;
  onZoom: React.Dispatch<React.SetStateAction<number>>;
  onPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onPointerPick: (point: NormalizedPoint) => void;
  onHitboxMove: (
    differenceId: string,
    side: "A" | "B",
    dx: number,
    dy: number,
  ) => void;
  onHitboxResize: (
    differenceId: string,
    side: "A" | "B",
    dx: number,
    dy: number,
    axis: ResizeAxis,
  ) => void;
  onHitboxRotate: (
    differenceId: string,
    side: "A" | "B",
    deltaDegrees: number,
  ) => void;
  onHitboxDelete: (differenceId: string) => void;
  compareLabel: string;
  sceneOffset: SceneOffset;
}) {
  const reducedEffects = useReducedEffects();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState<Size>({ width: 0, height: 0 });
  const containedImageRect = getContainedImageRect(frameSize, imageAspectRatio);
  const imageRect = {
    ...containedImageRect,
    left: containedImageRect.left + sceneOffset.x,
    top: containedImageRect.top + sceneOffset.y,
  };

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const updateFrameSize = () => {
      const rect = element.getBoundingClientRect();
      setFrameSize((current) =>
        current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height },
      );
    };

    updateFrameSize();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateFrameSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onPan((current) => {
      const next = clampPan(current, frameSize, imageAspectRatio, zoom);
      return next.x === current.x && next.y === current.y ? current : next;
    });
  }, [frameSize, imageAspectRatio, onPan, zoom]);

  function normalizePoint(
    event: React.PointerEvent<HTMLDivElement>,
  ): NormalizedPoint {
    const target = event.currentTarget.getBoundingClientRect();
    const rect = getContainedImageRect(
      { width: target.width, height: target.height },
      imageAspectRatio,
    );
    const layerX = (event.clientX - target.left - pan.x) / zoom;
    const layerY = (event.clientY - target.top - pan.y) / zoom;
    const x = (layerX - rect.left) / rect.width;
    const y = (layerY - rect.top) / rect.height;
    const inImage = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    return { x: clamp01(x), y: clamp01(y), side, inImage };
  }

  return (
    <div
      ref={frameRef}
      className="game-area comparator-photo relative flex-1 overflow-hidden rounded-[13px]"
      style={
        {
          "--scene-aspect-ratio": imageAspectRatio,
          background: "#1b211d",
          border: "1px solid rgba(213,195,154,.14)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,.5)",
        } as React.CSSProperties
      }
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragStart={(e) => e.preventDefault()}
      onWheel={(e) => {
        e.preventDefault();
        const nextZoom = Math.max(
          1,
          Math.min(2.5, zoom + (e.deltaY < 0 ? 0.12 : -0.12)),
        );
        onZoom(nextZoom);
        onPan((current) =>
          clampPan(current, frameSize, imageAspectRatio, nextZoom),
        );
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        pointer.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          startX: e.clientX,
          startY: e.clientY,
        };
      }}
      onPointerMove={(e) => {
        if (hitboxEdit.current) {
          if (imageRect.width <= 0 || imageRect.height <= 0) return;
          const active = hitboxEdit.current;
          if (
            active.mode === "rotate" &&
            active.centerClientX !== undefined &&
            active.centerClientY !== undefined &&
            active.lastAngle !== undefined
          ) {
            const nextAngle = pointerAngleDegrees(
              e.clientX,
              e.clientY,
              active.centerClientX,
              active.centerClientY,
            );
            const deltaDegrees = normalizeDegrees(nextAngle - active.lastAngle);
            hitboxEdit.current = {
              ...active,
              clientX: e.clientX,
              clientY: e.clientY,
              lastAngle: nextAngle,
            };
            onHitboxRotate(active.differenceId, active.side, deltaDegrees);
            return;
          }
          const dx = (e.clientX - active.clientX) / zoom / imageRect.width;
          const dy = (e.clientY - active.clientY) / zoom / imageRect.height;
          hitboxEdit.current = {
            ...active,
            clientX: e.clientX,
            clientY: e.clientY,
          };
          if (active.mode === "resize") {
            onHitboxResize(
              active.differenceId,
              active.side,
              dx,
              dy,
              active.resizeAxis ?? "both",
            );
          } else {
            onHitboxMove(active.differenceId, active.side, dx, dy);
          }
          return;
        }
        if (!pointer.current) return;
        const dx = e.clientX - pointer.current.x;
        const dy = e.clientY - pointer.current.y;
        const dragged =
          Math.hypot(
            e.clientX - pointer.current.startX,
            e.clientY - pointer.current.startY,
          ) > 8;
        pointer.current = { ...pointer.current, x: e.clientX, y: e.clientY };
        if (dragged) {
          onPan((p) =>
            clampPan(
              { x: p.x + dx, y: p.y + dy },
              frameSize,
              imageAspectRatio,
              zoom,
            ),
          );
        }
      }}
      onPointerUp={(e) => {
        if (hitboxEdit.current) {
          hitboxEdit.current = null;
          return;
        }
        const active = pointer.current;
        if (!active) return;
        const dragged =
          Math.hypot(e.clientX - active.startX, e.clientY - active.startY) > 8;
        if (dragged) {
          pointer.current = null;
          return;
        }
        onPointerPick(normalizePoint(e));
      }}
      role="img"
      aria-label={`${levelId} ${side}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgba(213,195,154,.045) 0 14px, rgba(213,195,154,.015) 14px 28px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 38%, rgba(96,206,168,.07), transparent 60%)",
        }}
      />

      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <div
          className="absolute"
          style={{
            left: imageRect.left,
            top: imageRect.top,
            width: imageRect.width,
            height: imageRect.height,
          }}
        >
          {/* Both sources stay mounted so flipping never shows an empty frame
              while the other image loads/decodes */}
          {(inactiveSrc
            ? [src, inactiveSrc].sort((a, b) => a.localeCompare(b))
            : [src]
          ).map((source) => {
            const sourceSide = source === src ? side : side === "A" ? "B" : "A";
            return (
              <img
              key={source}
              src={source}
              alt=""
              draggable={false}
              className={`comparator-scene-layer comparator-scene-layer--${sourceSide.toLowerCase()} absolute inset-0 h-full w-full object-contain`}
              style={{ opacity: source === src ? 1 : 0 }}
              aria-hidden={source === src ? undefined : true}
              onLoad={(event) => {
                if (source !== src) return;
                const image = event.currentTarget;
                if (image.naturalHeight > 0) {
                  onImageAspectRatio(image.naturalWidth / image.naturalHeight);
                }
              }}
              />
            );
          })}

          {visibleMarkers.map((d) => {
            const debugOnly =
              debugShowAllDifferences && !foundIds.includes(d.id);
            return (
              <FoundMarker
                key={`${side}-${d.id}`}
                difference={d}
                side={side}
                debug={debugOnly}
                aspectRatio={imageAspectRatio}
                editable={hitboxEditorEnabled}
                onEditStart={(event) => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  hitboxEdit.current = {
                    differenceId: d.id,
                    side,
                    mode: "move",
                    clientX: event.clientX,
                    clientY: event.clientY,
                  };
                }}
                onResizeStart={(event, axis) => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  hitboxEdit.current = {
                    differenceId: d.id,
                    side,
                    mode: "resize",
                    resizeAxis: axis,
                    clientX: event.clientX,
                    clientY: event.clientY,
                  };
                }}
                onRotateStart={(event, center) => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const frameBox = frameRef.current?.getBoundingClientRect();
                  if (!frameBox) return;
                  const centerClientX =
                    frameBox.left +
                    pan.x +
                    (imageRect.left + center.x * imageRect.width) * zoom;
                  const centerClientY =
                    frameBox.top +
                    pan.y +
                    (imageRect.top + center.y * imageRect.height) * zoom;
                  hitboxEdit.current = {
                    differenceId: d.id,
                    side,
                    mode: "rotate",
                    clientX: event.clientX,
                    clientY: event.clientY,
                    centerClientX,
                    centerClientY,
                    lastAngle: pointerAngleDegrees(
                      event.clientX,
                      event.clientY,
                      centerClientX,
                      centerClientY,
                    ),
                  };
                }}
                onDelete={() => onHitboxDelete(d.id)}
              />
            );
          })}

          {hintDifference ? (
            <HintMarker
              difference={hintDifference}
              aspectRatio={imageAspectRatio}
              reducedEffects={reducedEffects}
            />
          ) : null}

          {wrongClicks.map((wc) => (
            <WrongClickMarker key={wc.key} x={wc.x} y={wc.y} />
          ))}
        </div>
      </div>

      {mobile && (
        <div
          className="absolute left-[10px] top-[9px] flex items-center gap-[6px] rounded-[6px] px-[9px]"
          style={{
            height: "22px",
            background: "rgba(21,27,24,.7)",
            border: "1px solid rgba(184,138,69,.3)",
          }}
        >
          <span className="font-manrope text-[9.5px] font-bold text-exp-brass2">
            {version}
          </span>
          <span className="font-manrope text-[8px] font-semibold tracking-[.1em] text-exp-muted">
            {compareLabel}
          </span>
        </div>
      )}
    </div>
  );
}

function FoundMarker({
  difference,
  side,
  debug = false,
  aspectRatio,
  editable = false,
  onEditStart,
  onResizeStart,
  onRotateStart,
  onDelete,
}: {
  difference: DifferenceDefinition;
  side: "A" | "B";
  debug?: boolean;
  aspectRatio: number;
  editable?: boolean;
  onEditStart?: (event: React.PointerEvent<HTMLSpanElement>) => void;
  onResizeStart?: (
    event: React.PointerEvent<HTMLSpanElement>,
    axis: ResizeAxis,
  ) => void;
  onRotateStart?: (
    event: React.PointerEvent<HTMLSpanElement>,
    center: { x: number; y: number },
  ) => void;
  onDelete?: () => void;
}) {
  const shape = side === "A" ? difference.hitAreaA : difference.hitAreaB;
  const box = shapeBounds(shape, aspectRatio);
  const center = shapeCenter(shape);
  const shapeFrame = shapeFrameInBox(shape, box);
  const rotation = shapeRotation(shape);
  return (
    <span
      className="absolute"
      style={{
        left: `${box.left * 100}%`,
        top: `${box.top * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
        cursor: editable ? "grab" : undefined,
        pointerEvents: editable ? "auto" : undefined,
        touchAction: editable ? "none" : undefined,
      }}
      onPointerDown={editable ? onEditStart : undefined}
      aria-hidden={editable ? undefined : true}
    >
      {/* Geometry and motion use separate wrappers so rotation is never
          overwritten by an entrance transform. */}
      <span
        className="absolute"
        style={{
          left: `${shapeFrame.left * 100}%`,
          top: `${shapeFrame.top * 100}%`,
          width: `${shapeFrame.width * 100}%`,
          height: `${shapeFrame.height * 100}%`,
          borderRadius:
            shape.kind === "circle" || shape.kind === "ellipse"
              ? "50%"
              : undefined,
          clipPath:
            shape.kind === "polygon" ? polygonClipPath(shape) : undefined,
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
        }}
      >
        <span
          className={`absolute inset-0 rounded-[inherit] ${debug ? "" : "vfx-found-ring"}`}
          style={{
            border: debug ? "2px dashed rgba(111,198,158,.95)" : "2.5px solid #d8af63",
            boxShadow: debug ? "0 0 18px rgba(111,198,158,.45)" : "0 0 14px rgba(216,175,99,.5)",
          }}
        />
      </span>
      {debug ? (
        <span
          className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "#6fc69e",
            boxShadow: "0 0 10px rgba(111,198,158,.8)",
          }}
        />
      ) : (
        <span
          className="vfx-found-check absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            width: "clamp(18px, 38%, 28px)",
            height: "clamp(18px, 38%, 28px)",
            background: "#d8af63",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a130a"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <FoundFlecks />
        </span>
      )}
      {editable ? (
        <span
          className="absolute bottom-0 right-0 h-[14px] w-[14px] translate-x-1/2 translate-y-1/2 rounded-[3px]"
          style={{
            background: "#6fc69e",
            border: "2px solid #102016",
            boxShadow: "0 0 10px rgba(111,198,158,.65)",
            cursor: "nwse-resize",
            pointerEvents: "auto",
            touchAction: "none",
          }}
          onPointerDown={(event) => onResizeStart?.(event, "both")}
        />
      ) : null}
      {editable ? (
        <span
          className="absolute right-0 top-1/2 h-[22px] w-[10px] -translate-y-1/2 translate-x-1/2 rounded-[3px]"
          style={resizeHandleStyle("ew-resize")}
          onPointerDown={(event) => onResizeStart?.(event, "x")}
        />
      ) : null}
      {editable ? (
        <span
          className="absolute bottom-0 left-1/2 h-[10px] w-[22px] -translate-x-1/2 translate-y-1/2 rounded-[3px]"
          style={resizeHandleStyle("ns-resize")}
          onPointerDown={(event) => onResizeStart?.(event, "y")}
        />
      ) : null}
      {editable && shape.kind === "ellipse" ? (
        <span
          className="absolute left-1/2 top-0 h-[14px] w-[14px] -translate-x-1/2 -translate-y-[175%] rounded-full"
          style={resizeHandleStyle("grab")}
          title={`Rotate ${Math.round(rotation)} deg`}
          onPointerDown={(event) => onRotateStart?.(event, center)}
        />
      ) : null}
      {editable ? (
        <button
          type="button"
          className="absolute right-0 top-0 flex h-[22px] w-[22px] translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[#1a130a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
          style={{
            background: "#ff9d8a",
            border: "2px solid #102016",
            boxShadow: "0 0 12px rgba(255,157,138,.7)",
            pointerEvents: "auto",
            touchAction: "none",
          }}
          aria-label={`Delete hitbox ${difference.id}`}
          title={`Delete ${difference.id}`}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      ) : null}
    </span>
  );
}

function HintMarker({
  difference,
  aspectRatio,
  reducedEffects,
}: {
  difference?: DifferenceDefinition;
  aspectRatio: number;
  reducedEffects: boolean;
}) {
  if (!difference) return null;
  const box = shapeBounds(difference.hintArea, aspectRatio);
  const shapeFrame = shapeFrameInBox(difference.hintArea, box);
  const rotation = shapeRotation(difference.hintArea);
  return (
    <span
      className="pointer-events-none absolute"
      style={{
        left: `${box.left * 100}%`,
        top: `${box.top * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
        borderRadius:
          difference.hintArea.kind === "circle" ||
          difference.hintArea.kind === "ellipse"
            ? "50%"
            : undefined,
        clipPath:
          difference.hintArea.kind === "polygon"
            ? polygonClipPath(difference.hintArea)
            : undefined,
      }}
      aria-hidden
    >
      <span
        className={`absolute ${reducedEffects ? "" : "vfx-hint-sequence"}`}
        style={{
          left: `${shapeFrame.left * 100}%`,
          top: `${shapeFrame.top * 100}%`,
          width: `${shapeFrame.width * 100}%`,
          height: `${shapeFrame.height * 100}%`,
          borderRadius: "inherit",
          border: "3px dashed rgba(216,175,99,.9)",
          background:
            "radial-gradient(circle, rgba(216,175,99,.24), rgba(216,175,99,.08) 58%, transparent 74%)",
          boxShadow:
            "0 0 22px rgba(216,175,99,.5), inset 0 0 18px rgba(216,175,99,.18)",
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
        }}
      />
    </span>
  );
}

function FoundFlecks() {
  const flecks = [["-18px", "-12px"], ["17px", "-11px"], ["20px", "6px"], ["-19px", "10px"], ["0", "-20px"], ["2px", "20px"]] as const;
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {flecks.map(([x, y], index) => (
        <span
          key={index}
          className="vfx-found-fleck"
          style={{ "--fleck-x": x, "--fleck-y": y, animationDelay: `${index * 22}ms` } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

function WrongClickMarker({ x, y }: { x: number; y: number }) {
  return (
    <span
      className="pointer-events-none absolute"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: "34px",
        height: "34px",
        transform: "translate(-50%, -50%)",
      }}
      aria-hidden
    >
      <span className="vfx-wrong-marker absolute inset-0">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid rgba(208,94,74,.85)",
            background: "rgba(208,94,74,.14)",
          }}
        />
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ color: "#e08a78" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </span>
      </span>
    </span>
  );
}

function resizeHandleStyle(cursor: string): React.CSSProperties {
  return {
    background: "#6fc69e",
    border: "2px solid #102016",
    boxShadow: "0 0 10px rgba(111,198,158,.65)",
    cursor,
    pointerEvents: "auto",
    touchAction: "none",
  };
}

function shapeBounds(shape: HitShape, aspectRatio: number) {
  if (shape.kind === "circle") {
    const yRadius = shape.radius * aspectRatio;
    return {
      left: shape.cx - shape.radius,
      top: shape.cy - yRadius,
      width: shape.radius * 2,
      height: yRadius * 2,
    };
  }
  if (shape.kind === "ellipse") {
    const rotation = shapeRotation(shape);
    if (rotation !== 0) {
      const angle = degreesToRadians(rotation);
      const radiusXInYUnits = shape.rx * aspectRatio;
      const radiusY = shape.ry;
      const rotatedRadiusXInYUnits = Math.hypot(
        radiusXInYUnits * Math.cos(angle),
        radiusY * Math.sin(angle),
      );
      const rotatedRadiusY = Math.hypot(
        radiusXInYUnits * Math.sin(angle),
        radiusY * Math.cos(angle),
      );
      const rotatedRadiusX = rotatedRadiusXInYUnits / aspectRatio;
      return {
        left: shape.cx - rotatedRadiusX,
        top: shape.cy - rotatedRadiusY,
        width: rotatedRadiusX * 2,
        height: rotatedRadiusY * 2,
      };
    }
    return {
      left: shape.cx - shape.rx,
      top: shape.cy - shape.ry,
      width: shape.rx * 2,
      height: shape.ry * 2,
    };
  }

  const xs = shape.points.map((point) => point.x);
  const ys = shape.points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function shapeFrameInBox(shape: HitShape, box: ContainedRect) {
  if (shape.kind === "circle" || shape.kind === "polygon") {
    return { left: 0, top: 0, width: 1, height: 1 };
  }

  const centerX = box.width > 0 ? (shape.cx - box.left) / box.width : 0.5;
  const centerY = box.height > 0 ? (shape.cy - box.top) / box.height : 0.5;
  const width = box.width > 0 ? (shape.rx * 2) / box.width : 1;
  const height = box.height > 0 ? (shape.ry * 2) / box.height : 1;
  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    width,
    height,
  };
}

function shapeRotation(shape: HitShape) {
  return shape.kind === "ellipse" ? (shape.rotation ?? 0) : 0;
}

function polygonClipPath(shape: Extract<HitShape, { kind: "polygon" }>) {
  const box = shapeBounds(shape, 1);
  const points = shape.points.map((point) => {
    const x = ((point.x - box.left) / box.width) * 100;
    const y = ((point.y - box.top) / box.height) * 100;
    return `${x}% ${y}%`;
  });
  return `polygon(${points.join(", ")})`;
}

function getContainedImageRect(size: Size, aspectRatio: number): ContainedRect {
  if (size.width <= 0 || size.height <= 0 || aspectRatio <= 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const frameAspectRatio = size.width / size.height;
  if (frameAspectRatio > aspectRatio) {
    const width = size.height * aspectRatio;
    return {
      left: (size.width - width) / 2,
      top: 0,
      width,
      height: size.height,
    };
  }

  const height = size.width / aspectRatio;
  return {
    left: 0,
    top: (size.height - height) / 2,
    width: size.width,
    height,
  };
}

function clampPan(
  pan: { x: number; y: number },
  frameSize: Size,
  aspectRatio: number,
  zoom: number,
) {
  if (frameSize.width <= 0 || frameSize.height <= 0) {
    return pan;
  }

  const imageRect = getContainedImageRect(frameSize, aspectRatio);
  if (imageRect.width <= 0 || imageRect.height <= 0) {
    return pan;
  }

  return {
    x: clampAxisPan(
      pan.x,
      imageRect.left * zoom,
      (imageRect.left + imageRect.width) * zoom,
      frameSize.width,
    ),
    y: clampAxisPan(
      pan.y,
      imageRect.top * zoom,
      (imageRect.top + imageRect.height) * zoom,
      frameSize.height,
    ),
  };
}

function clampAxisPan(
  value: number,
  scaledStart: number,
  scaledEnd: number,
  frameLength: number,
) {
  const min = frameLength - PAN_OVERSCROLL_PX - scaledEnd;
  const max = PAN_OVERSCROLL_PX - scaledStart;
  if (min > max) {
    return (min + max) / 2;
  }
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function pointerAngleDegrees(
  clientX: number,
  clientY: number,
  centerClientX: number,
  centerClientY: number,
) {
  return (
    (Math.atan2(clientY - centerClientY, clientX - centerClientX) * 180) /
    Math.PI
  );
}

function normalizeDegrees(value: number) {
  let next = value;
  while (next > 180) next -= 360;
  while (next < -180) next += 360;
  return next;
}

function cloneDifferences(differences: DifferenceDefinition[]) {
  return JSON.parse(JSON.stringify(differences)) as DifferenceDefinition[];
}

function loadEditedDifferences(
  storageKey: string,
  fallback: DifferenceDefinition[],
) {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return cloneDifferences(fallback);
  try {
    return JSON.parse(stored) as DifferenceDefinition[];
  } catch {
    return cloneDifferences(fallback);
  }
}

function loadEditedSceneAlignment(
  storageKey: string,
  fallback: MobileSceneAlignment,
) {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return fallback;
  try {
    const parsed = JSON.parse(stored) as MobileSceneAlignment;
    for (const side of ["A", "B"] as const) {
      if (!Number.isFinite(parsed?.[side]?.x) || !Number.isFinite(parsed?.[side]?.y)) {
        return fallback;
      }
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function clampSceneOffset(value: number) {
  return Math.max(-32, Math.min(32, Number(value.toFixed(2))));
}

function createNewDifference(
  level: LevelDefinition,
  differences: DifferenceDefinition[],
): DifferenceDefinition {
  const hitArea = createDefaultHitShape(0.04, 0.065);
  return {
    id: createNewDifferenceId(level, differences),
    hitAreaA: hitArea,
    hitAreaB: { ...hitArea },
    hintArea: createDefaultHitShape(0.065, 0.095),
    difficulty: 1,
  };
}

function createNewDifferenceId(
  level: LevelDefinition,
  differences: DifferenceDefinition[],
) {
  const existingIds = new Set(differences.map((difference) => difference.id));
  let index = differences.length + 1;
  while (true) {
    const candidate =
      level.chapterId === "sand-meridian"
        ? `new-hitbox-${index}-${level.order}`
        : `new-hitbox-${index}`;
    if (!existingIds.has(candidate)) return candidate;
    index += 1;
  }
}

function createDefaultHitShape(rx: number, ry: number): HitShape {
  return {
    kind: "ellipse",
    cx: 0.5,
    cy: 0.5,
    rx,
    ry,
  };
}

function moveDifferenceHitboxPair(
  difference: DifferenceDefinition,
  side: "A" | "B",
  dx: number,
  dy: number,
) {
  const activeShape = side === "A" ? difference.hitAreaA : difference.hitAreaB;
  const movedActiveShape = moveShape(activeShape, dx, dy);
  const nextHitAreaA =
    side === "A" ? movedActiveShape : moveShape(difference.hitAreaA, dx, dy);
  const nextHitAreaB =
    side === "B" ? movedActiveShape : moveShape(difference.hitAreaB, dx, dy);

  return {
    ...difference,
    hitAreaA: nextHitAreaA,
    hitAreaB: nextHitAreaB,
    hintArea: moveShape(difference.hintArea, dx, dy),
  };
}

function resizeDifferenceHitboxPair(
  difference: DifferenceDefinition,
  side: "A" | "B",
  dx: number,
  dy: number,
  aspectRatio: number,
  axis: ResizeAxis,
) {
  const activeShape = side === "A" ? difference.hitAreaA : difference.hitAreaB;
  const resizedActiveShape = resizeShape(
    activeShape,
    dx,
    dy,
    aspectRatio,
    axis,
  );
  const nextHitAreaA =
    side === "A"
      ? resizedActiveShape
      : resizeShape(difference.hitAreaA, dx, dy, aspectRatio, axis);
  const nextHitAreaB =
    side === "B"
      ? resizedActiveShape
      : resizeShape(difference.hitAreaB, dx, dy, aspectRatio, axis);

  return {
    ...difference,
    hitAreaA: nextHitAreaA,
    hitAreaB: nextHitAreaB,
    hintArea: resizeShape(difference.hintArea, dx, dy, aspectRatio, axis),
  };
}

function rotateDifferenceHitboxPair(
  difference: DifferenceDefinition,
  side: "A" | "B",
  deltaDegrees: number,
) {
  const activeShape = side === "A" ? difference.hitAreaA : difference.hitAreaB;
  const rotatedActiveShape = rotateShape(activeShape, deltaDegrees);
  const nextHitAreaA =
    side === "A"
      ? rotatedActiveShape
      : rotateShape(difference.hitAreaA, deltaDegrees);
  const nextHitAreaB =
    side === "B"
      ? rotatedActiveShape
      : rotateShape(difference.hitAreaB, deltaDegrees);

  return {
    ...difference,
    hitAreaA: nextHitAreaA,
    hitAreaB: nextHitAreaB,
    hintArea: rotateShape(difference.hintArea, deltaDegrees),
  };
}

function moveShape(shape: HitShape, dx: number, dy: number): HitShape {
  if (shape.kind === "circle") {
    return { ...shape, cx: clamp01(shape.cx + dx), cy: clamp01(shape.cy + dy) };
  }
  if (shape.kind === "ellipse") {
    return { ...shape, cx: clamp01(shape.cx + dx), cy: clamp01(shape.cy + dy) };
  }
  return {
    ...shape,
    points: shape.points.map((point) => ({
      x: clamp01(point.x + dx),
      y: clamp01(point.y + dy),
    })),
  };
}

function rotateShape(shape: HitShape, deltaDegrees: number): HitShape {
  if (shape.kind !== "ellipse") return shape;
  const rotation = normalizeDegrees((shape.rotation ?? 0) + deltaDegrees);
  if (Math.abs(rotation) < 0.05) {
    return {
      kind: "ellipse",
      cx: shape.cx,
      cy: shape.cy,
      rx: shape.rx,
      ry: shape.ry,
    };
  }
  return { ...shape, rotation };
}

function resizeShape(
  shape: HitShape,
  dx: number,
  dy: number,
  aspectRatio: number,
  axis: ResizeAxis,
): HitShape {
  const resizeX = axis === "x" || axis === "both";
  const resizeY = axis === "y" || axis === "both";

  if (shape.kind === "circle") {
    if (axis !== "both") {
      return {
        kind: "ellipse",
        cx: shape.cx,
        cy: shape.cy,
        rx: clampHitSize(shape.radius + (resizeX ? dx : 0)),
        ry: clampHitSize(shape.radius * aspectRatio + (resizeY ? dy : 0)),
      };
    }
    const radiusDelta = (dx + dy / aspectRatio) / 2;
    return { ...shape, radius: clampHitSize(shape.radius + radiusDelta) };
  }
  if (shape.kind === "ellipse") {
    return {
      ...shape,
      rx: clampHitSize(shape.rx + (resizeX ? dx : 0)),
      ry: clampHitSize(shape.ry + (resizeY ? dy : 0)),
    };
  }

  const box = shapeBounds(shape, aspectRatio);
  const center = {
    x: box.left + box.width / 2,
    y: box.top + box.height / 2,
  };
  const width = Math.max(0.005, box.width);
  const height = Math.max(0.005, box.height);
  const scaleX = resizeX ? Math.max(0.1, (width + dx * 2) / width) : 1;
  const scaleY = resizeY ? Math.max(0.1, (height + dy * 2) / height) : 1;

  return {
    ...shape,
    points: shape.points.map((point) => ({
      x: clamp01(center.x + (point.x - center.x) * scaleX),
      y: clamp01(center.y + (point.y - center.y) * scaleY),
    })),
  };
}

function clampHitSize(value: number) {
  return Math.max(0.005, Math.min(1, value));
}
