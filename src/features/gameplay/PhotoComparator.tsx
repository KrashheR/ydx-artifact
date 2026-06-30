import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSceneMarkupAsset } from "@/content/sceneAssets";
import type { DifferenceDefinition, HitShape, LevelDefinition } from "@/entities/level/schema";
import { hitTest } from "@/shared/lib/hitTesting";

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
type ContainedRect = { left: number; top: number; width: number; height: number };
type NormalizedPoint = { x: number; y: number; side: "A" | "B"; inImage: boolean };
type ResizeAxis = "x" | "y" | "both";
type HitboxEdit = {
  differenceId: string;
  side: "A" | "B";
  mode: "move" | "resize";
  resizeAxis?: ResizeAxis;
  clientX: number;
  clientY: number;
};
type ApplyStatus = "idle" | "saving" | "saved" | "error";

let wrongClickSeq = 0;
const HITBOX_EDITOR_STORAGE_PREFIX = "artifact.hitboxEditor.";
const HitboxEditorControls = import.meta.env.DEV
  ? lazy(() => import("./dev/HitboxEditorControls").then((module) => ({ default: module.HitboxEditorControls })))
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
  debugUseMarkupReference = false
}: PhotoComparatorProps) {
  const { t } = useTranslation();
  const [version, setVersion] = useState<"A" | "B">("A");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [imageAspectRatio, setImageAspectRatio] = useState(1586 / 992);
  const [editableDifferences, setEditableDifferences] = useState<DifferenceDefinition[]>(() =>
    cloneDifferences(level.differences)
  );
  const pointer = useRef<PointerState | null>(null);
  const hitboxEdit = useRef<HitboxEdit | null>(null);
  const [wrongClicksA, setWrongClicksA] = useState<WrongClick[]>([]);
  const [wrongClicksB, setWrongClicksB] = useState<WrongClick[]>([]);
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>("idle");
  const hitboxEditorEnabled = debugShowAllDifferences && debugUseMarkupReference;
  const editorStorageKey = `${HITBOX_EDITOR_STORAGE_PREFIX}${level.id}`;

  useEffect(() => {
    setEditableDifferences(loadEditedDifferences(editorStorageKey, level.differences));
    setApplyStatus("idle");
  }, [editorStorageKey, level.differences]);

  const found = useMemo(
    () => editableDifferences.filter((d) => foundIds.includes(d.id)),
    [editableDifferences, foundIds]
  );
  const visibleMarkers = debugShowAllDifferences ? editableDifferences : found;

  function addWrongClick(side: "A" | "B", x: number, y: number) {
    const key = wrongClickSeq++;
    const setter = side === "A" ? setWrongClicksA : setWrongClicksB;
    setter((prev) => [...prev, { key, x, y }]);
    setTimeout(() => setter((prev) => prev.filter((w) => w.key !== key)), 700);
  }

  function handlePointerUp(point: NormalizedPoint) {
    const active = pointer.current;
    pointer.current = null;
    if (!active) return;
    if (!point.inImage) return;

    const match = editableDifferences.find((d) => {
      if (foundIds.includes(d.id)) return false;
      return hitTest(point.side === "A" ? d.hitAreaA : d.hitAreaB, point.x, point.y, imageAspectRatio);
    });

    if (match) {
      onDifference(match.id);
    } else {
      onMisclick();
      addWrongClick(point.side, point.x, point.y);
    }
  }

  function updateEditableDifferences(updater: (differences: DifferenceDefinition[]) => DifferenceDefinition[]) {
    setEditableDifferences((current) => {
      const next = updater(current);
      if (hitboxEditorEnabled) {
        window.localStorage.setItem(editorStorageKey, JSON.stringify(next));
      }
      return next;
    });
  }

  function handleHitboxMove(differenceId: string, side: "A" | "B", dx: number, dy: number) {
    updateEditableDifferences((differences) =>
      differences.map((difference) => {
        if (difference.id !== differenceId) return difference;
        return moveDifferenceHitboxPair(difference, side, dx, dy);
      })
    );
  }

  function handleHitboxResize(differenceId: string, side: "A" | "B", dx: number, dy: number, axis: ResizeAxis) {
    updateEditableDifferences((differences) =>
      differences.map((difference) => {
        if (difference.id !== differenceId) return difference;
        return resizeDifferenceHitboxPair(difference, side, dx, dy, imageAspectRatio, axis);
      })
    );
  }

  function resetEditedDifferences() {
    window.localStorage.removeItem(editorStorageKey);
    setEditableDifferences(cloneDifferences(level.differences));
    setApplyStatus("idle");
  }

  function renderPhoto(side: "A" | "B", mobile = false) {
    const baseSrc = side === "A" ? level.imageA : level.imageB;
    const src = debugUseMarkupReference ? getSceneMarkupAsset(baseSrc) : baseSrc;
    const label = side === "A" ? labelA : labelB;
    const wrongClicks = side === "A" ? wrongClicksA : wrongClicksB;
    const displaySide = side;

    return (
      <div className="flex flex-1 flex-col">
        {/* Label row (desktop only) */}
        {!mobile && label && (
          <div className="comparator-label-row mb-[10px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[6px] font-manrope text-[11px] font-bold text-exp-brass2"
                style={{ background: "rgba(184,138,69,.16)", border: "1px solid rgba(184,138,69,.4)" }}
              >
                {side}
              </span>
              <span className="font-manrope text-[11px] font-semibold tracking-[.18em] text-exp-muted">{label}</span>
            </div>
            {hitboxEditorEnabled ? (
              <span className="font-jetbrains text-[10px] font-medium" style={{ color: "rgba(135,144,135,.7)" }}>
                {level.id.toUpperCase()}-{side}
              </span>
            ) : null}
          </div>
        )}

        <PhotoCanvas
          levelId={level.id}
          side={displaySide}
          mobile={mobile}
          version={version}
          src={src}
          zoom={zoom}
          pan={pan}
          imageAspectRatio={imageAspectRatio}
          pointer={pointer}
          visibleMarkers={visibleMarkers}
          foundIds={foundIds}
          hintDifference={hintId ? level.differences.find((d) => d.id === hintId) : undefined}
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
          compareLabel={version === "A" ? t("game.labelOriginal") : t("game.labelCopy")}
        />
      </div>
    );
  }

  return (
    <div className="photo-comparator relative flex flex-1 flex-col">
      {/* Desktop: side by side */}
      <div className="comparator-desktop hidden flex-1 gap-5 md:flex">
        {renderPhoto("A")}

        {/* Divider */}
        <div className="flex flex-col items-center justify-center gap-[14px] pt-[30px]" style={{ width: "34px", flexShrink: 0 }}>
          <div className="flex-1" style={{ width: "1px", background: "linear-gradient(180deg, transparent, rgba(213,195,154,.2), transparent)" }} />
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-exp-brass"
            style={{ border: "1px solid rgba(184,138,69,.4)", background: "rgba(21,27,24,.7)", flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
            </svg>
          </div>
          <div className="flex-1" style={{ width: "1px", background: "linear-gradient(180deg, transparent, rgba(213,195,154,.2), transparent)" }} />
        </div>

        {renderPhoto("B")}
      </div>

      {/* Mobile landscape: one full-screen flip card */}
      <div className="comparator-landscape-flip hidden flex-1 flex-col">
        <div className="comparator-flip-stage relative flex-1">
          <div
            className="comparator-flip-card absolute inset-0"
            style={{
              transform:
                version === "B" ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            <div className="comparator-flip-face comparator-flip-front absolute inset-0">
              {renderPhoto("A", true)}
            </div>
            <div className="comparator-flip-face comparator-flip-back absolute inset-0">
              {renderPhoto("B", true)}
            </div>
          </div>
          <div
            className="comparator-ab-segments pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center rounded-[9px] p-1"
            aria-hidden="true"
          >
            {(["A", "B"] as const).map((segment) => (
              <span
                key={segment}
                className="flex h-7 min-w-9 items-center justify-center rounded-[7px] font-jetbrains text-[12px] font-bold"
                style={
                  version === segment
                    ? {
                        background:
                          "linear-gradient(180deg,#D8AF63,#B3812F)",
                        color: "#1A130A",
                        boxShadow: "0 0 14px rgba(216,175,99,.42)"
                      }
                    : { color: "rgba(213,195,154,.68)" }
                }
              >
                {segment}
              </span>
            ))}
          </div>
        </div>
        <button
          className="comparator-flip-button absolute left-1/2 z-30 flex min-h-[46px] -translate-x-1/2 items-center justify-center gap-2 rounded-[10px] px-5 font-manrope text-[13px] font-bold text-[#1A130A]"
          style={{
            background: "linear-gradient(180deg,#D8AF63,#B3812F)",
            boxShadow:
              "0 10px 24px rgba(184,138,69,.36), inset 0 1px 0 rgba(255,255,255,.3)"
          }}
          onClick={() => setVersion((v) => (v === "A" ? "B" : "A"))}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
          </svg>
          {t("actions.compare")}
        </button>
      </div>

      {/* Mobile: single image + toggle */}
      <div className="comparator-mobile-portrait flex flex-1 flex-col md:hidden">
        {renderPhoto(version, true)}
        <button
          className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl font-manrope text-[13.5px] font-bold text-exp-brass2"
          style={{ border: "1px solid rgba(184,138,69,.45)", background: "rgba(184,138,69,.1)" }}
          onClick={() => setVersion((v) => (v === "A" ? "B" : "A"))}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
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
            onReset={resetEditedDifferences}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

function PhotoCanvas({
  levelId,
  side,
  mobile,
  version,
  src,
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
  compareLabel
}: {
  levelId: string;
  side: "A" | "B";
  mobile: boolean;
  version: "A" | "B";
  src: string;
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
  onHitboxMove: (differenceId: string, side: "A" | "B", dx: number, dy: number) => void;
  onHitboxResize: (differenceId: string, side: "A" | "B", dx: number, dy: number, axis: ResizeAxis) => void;
  compareLabel: string;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState<Size>({ width: 0, height: 0 });
  const imageRect = getContainedImageRect(frameSize, imageAspectRatio);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const updateFrameSize = () => {
      const rect = element.getBoundingClientRect();
      setFrameSize({ width: rect.width, height: rect.height });
    };

    updateFrameSize();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateFrameSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function normalizePoint(event: React.PointerEvent<HTMLDivElement>): NormalizedPoint {
    const target = event.currentTarget.getBoundingClientRect();
    const rect = getContainedImageRect({ width: target.width, height: target.height }, imageAspectRatio);
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
      style={{
        background: "#1b211d",
        border: "1px solid rgba(213,195,154,.14)",
        boxShadow: "inset 0 0 60px rgba(0,0,0,.5)"
      }}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={(e) => {
        e.preventDefault();
        onZoom((z) => Math.max(1, Math.min(2.5, z + (e.deltaY < 0 ? 0.12 : -0.12))));
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY };
      }}
      onPointerMove={(e) => {
        if (hitboxEdit.current) {
          if (imageRect.width <= 0 || imageRect.height <= 0) return;
          const active = hitboxEdit.current;
          const dx = (e.clientX - active.clientX) / zoom / imageRect.width;
          const dy = (e.clientY - active.clientY) / zoom / imageRect.height;
          hitboxEdit.current = { ...active, clientX: e.clientX, clientY: e.clientY };
          if (active.mode === "resize") {
            onHitboxResize(active.differenceId, active.side, dx, dy, active.resizeAxis ?? "both");
          } else {
            onHitboxMove(active.differenceId, active.side, dx, dy);
          }
          return;
        }
        if (!pointer.current) return;
        const dx = e.clientX - pointer.current.x;
        const dy = e.clientY - pointer.current.y;
        const dragged = Math.hypot(e.clientX - pointer.current.startX, e.clientY - pointer.current.startY) > 8;
        pointer.current = { ...pointer.current, x: e.clientX, y: e.clientY };
        if (dragged) {
          onPan((p) => ({
            x: Math.max(-220, Math.min(220, p.x + dx)),
            y: Math.max(-140, Math.min(140, p.y + dy))
          }));
        }
      }}
      onPointerUp={(e) => {
        if (hitboxEdit.current) {
          hitboxEdit.current = null;
          return;
        }
        const active = pointer.current;
        if (!active) return;
        const dragged = Math.hypot(e.clientX - active.startX, e.clientY - active.startY) > 8;
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
        style={{ background: "repeating-linear-gradient(45deg, rgba(213,195,154,.045) 0 14px, rgba(213,195,154,.015) 14px 28px)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(70% 60% at 50% 38%, rgba(96,206,168,.07), transparent 60%)" }}
      />

      <div
        className="absolute inset-0 origin-top-left"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <div
          className="absolute"
          style={{
            left: imageRect.left,
            top: imageRect.top,
            width: imageRect.width,
            height: imageRect.height
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="h-full w-full object-contain"
            onLoad={(event) => {
              const image = event.currentTarget;
              if (image.naturalHeight > 0) {
                onImageAspectRatio(image.naturalWidth / image.naturalHeight);
              }
            }}
          />

          {visibleMarkers.map((d) => {
            const debugOnly = debugShowAllDifferences && !foundIds.includes(d.id);
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
                    clientY: event.clientY
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
                    clientY: event.clientY
                  };
                }}
              />
            );
          })}

          {hintDifference ? <HintMarker difference={hintDifference} aspectRatio={imageAspectRatio} /> : null}

          {wrongClicks.map((wc) => (
            <WrongClickMarker key={wc.key} x={wc.x} y={wc.y} />
          ))}
        </div>
      </div>

      {mobile && (
        <div
          className="absolute left-[10px] top-[9px] flex items-center gap-[6px] rounded-[6px] px-[9px]"
          style={{ height: "22px", background: "rgba(21,27,24,.7)", border: "1px solid rgba(184,138,69,.3)" }}
        >
          <span className="font-manrope text-[9.5px] font-bold text-exp-brass2">{version}</span>
          <span className="font-manrope text-[8px] font-semibold tracking-[.1em] text-exp-muted">{compareLabel}</span>
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
  onResizeStart
}: {
  difference: DifferenceDefinition;
  side: "A" | "B";
  debug?: boolean;
  aspectRatio: number;
  editable?: boolean;
  onEditStart?: (event: React.PointerEvent<HTMLSpanElement>) => void;
  onResizeStart?: (event: React.PointerEvent<HTMLSpanElement>, axis: ResizeAxis) => void;
}) {
  const shape = side === "A" ? difference.hitAreaA : difference.hitAreaB;
  const box = shapeBounds(shape, aspectRatio);
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
        touchAction: editable ? "none" : undefined
      }}
      onPointerDown={editable ? onEditStart : undefined}
      aria-hidden
    >
      {/* Outer ring */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          border: debug ? "2px dashed rgba(111,198,158,.95)" : "2.5px solid #d8af63",
          boxShadow: debug ? "0 0 18px rgba(111,198,158,.45)" : "0 0 14px rgba(216,175,99,.5)",
          animation: "game-ring .4s ease-out",
          borderRadius: shape.kind === "circle" || shape.kind === "ellipse" ? "50%" : undefined,
          clipPath: shape.kind === "polygon" ? polygonClipPath(shape) : undefined
        }}
      />
      {debug ? (
        <span
          className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "#6fc69e", boxShadow: "0 0 10px rgba(111,198,158,.8)" }}
        />
      ) : (
        <span
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            width: "clamp(18px, 38%, 28px)",
            height: "clamp(18px, 38%, 28px)",
            background: "#d8af63"
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a130a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
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
            touchAction: "none"
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
    </span>
  );
}

function HintMarker({ difference, aspectRatio }: { difference?: DifferenceDefinition; aspectRatio: number }) {
  if (!difference) return null;
  const box = shapeBounds(difference.hintArea, aspectRatio);
  return (
    <span
      className="pointer-events-none absolute"
      style={{
        left: `${box.left * 100}%`,
        top: `${box.top * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
        borderRadius: difference.hintArea.kind === "circle" || difference.hintArea.kind === "ellipse" ? "50%" : undefined,
        clipPath: difference.hintArea.kind === "polygon" ? polygonClipPath(difference.hintArea) : undefined
      }}
      aria-hidden
    >
      <span
        className="absolute inset-0"
        style={{
          borderRadius: "inherit",
          border: "3px dashed rgba(216,175,99,.9)",
          background: "radial-gradient(circle, rgba(216,175,99,.24), rgba(216,175,99,.08) 58%, transparent 74%)",
          boxShadow: "0 0 22px rgba(216,175,99,.5), inset 0 0 18px rgba(216,175,99,.18)",
          animation: "game-pulse 2.2s ease-in-out infinite"
        }}
      />
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
        animation: "wrong-fade .7s ease-out forwards"
      }}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{ border: "2px solid rgba(208,94,74,.85)", background: "rgba(208,94,74,.14)", transform: "translate(-50%, -50%)" }}
      />
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ color: "#e08a78" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
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
    touchAction: "none"
  };
}

function shapeBounds(shape: HitShape, aspectRatio: number) {
  if (shape.kind === "circle") {
    const yRadius = shape.radius * aspectRatio;
    return {
      left: shape.cx - shape.radius,
      top: shape.cy - yRadius,
      width: shape.radius * 2,
      height: yRadius * 2
    };
  }
  if (shape.kind === "ellipse") {
    return {
      left: shape.cx - shape.rx,
      top: shape.cy - shape.ry,
      width: shape.rx * 2,
      height: shape.ry * 2
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
    height: maxY - minY
  };
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
    return { left: (size.width - width) / 2, top: 0, width, height: size.height };
  }

  const height = size.width / aspectRatio;
  return { left: 0, top: (size.height - height) / 2, width: size.width, height };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function cloneDifferences(differences: DifferenceDefinition[]) {
  return JSON.parse(JSON.stringify(differences)) as DifferenceDefinition[];
}

function loadEditedDifferences(storageKey: string, fallback: DifferenceDefinition[]) {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return cloneDifferences(fallback);
  try {
    return JSON.parse(stored) as DifferenceDefinition[];
  } catch {
    return cloneDifferences(fallback);
  }
}

function moveDifferenceHitboxPair(difference: DifferenceDefinition, side: "A" | "B", dx: number, dy: number) {
  const activeShape = side === "A" ? difference.hitAreaA : difference.hitAreaB;
  const movedActiveShape = moveShape(activeShape, dx, dy);
  const nextHitAreaA = side === "A" ? movedActiveShape : moveShape(difference.hitAreaA, dx, dy);
  const nextHitAreaB = side === "B" ? movedActiveShape : moveShape(difference.hitAreaB, dx, dy);

  return {
    ...difference,
    hitAreaA: nextHitAreaA,
    hitAreaB: nextHitAreaB,
    hintArea: moveShape(difference.hintArea, dx, dy)
  };
}

function resizeDifferenceHitboxPair(
  difference: DifferenceDefinition,
  side: "A" | "B",
  dx: number,
  dy: number,
  aspectRatio: number,
  axis: ResizeAxis
) {
  const activeShape = side === "A" ? difference.hitAreaA : difference.hitAreaB;
  const resizedActiveShape = resizeShape(activeShape, dx, dy, aspectRatio, axis);
  const nextHitAreaA = side === "A" ? resizedActiveShape : resizeShape(difference.hitAreaA, dx, dy, aspectRatio, axis);
  const nextHitAreaB = side === "B" ? resizedActiveShape : resizeShape(difference.hitAreaB, dx, dy, aspectRatio, axis);

  return {
    ...difference,
    hitAreaA: nextHitAreaA,
    hitAreaB: nextHitAreaB,
    hintArea: resizeShape(difference.hintArea, dx, dy, aspectRatio, axis)
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
    points: shape.points.map((point) => ({ x: clamp01(point.x + dx), y: clamp01(point.y + dy) }))
  };
}

function resizeShape(shape: HitShape, dx: number, dy: number, aspectRatio: number, axis: ResizeAxis): HitShape {
  const resizeX = axis === "x" || axis === "both";
  const resizeY = axis === "y" || axis === "both";

  if (shape.kind === "circle") {
    if (axis !== "both") {
      return {
        kind: "ellipse",
        cx: shape.cx,
        cy: shape.cy,
        rx: clampHitSize(shape.radius + (resizeX ? dx : 0)),
        ry: clampHitSize(shape.radius * aspectRatio + (resizeY ? dy : 0))
      };
    }
    const radiusDelta = (dx + dy / aspectRatio) / 2;
    return { ...shape, radius: clampHitSize(shape.radius + radiusDelta) };
  }
  if (shape.kind === "ellipse") {
    return {
      ...shape,
      rx: clampHitSize(shape.rx + (resizeX ? dx : 0)),
      ry: clampHitSize(shape.ry + (resizeY ? dy : 0))
    };
  }

  const box = shapeBounds(shape, aspectRatio);
  const center = {
    x: box.left + box.width / 2,
    y: box.top + box.height / 2
  };
  const width = Math.max(0.005, box.width);
  const height = Math.max(0.005, box.height);
  const scaleX = resizeX ? Math.max(0.1, (width + dx * 2) / width) : 1;
  const scaleY = resizeY ? Math.max(0.1, (height + dy * 2) / height) : 1;

  return {
    ...shape,
    points: shape.points.map((point) => ({
      x: clamp01(center.x + (point.x - center.x) * scaleX),
      y: clamp01(center.y + (point.y - center.y) * scaleY)
    }))
  };
}

function clampHitSize(value: number) {
  return Math.max(0.005, Math.min(1, value));
}
