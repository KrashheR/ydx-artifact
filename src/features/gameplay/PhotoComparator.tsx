import { useMemo, useRef, useState } from "react";
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

let wrongClickSeq = 0;

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
  const pointer = useRef<PointerState | null>(null);
  const [wrongClicksA, setWrongClicksA] = useState<WrongClick[]>([]);
  const [wrongClicksB, setWrongClicksB] = useState<WrongClick[]>([]);

  const found = useMemo(
    () => level.differences.filter((d) => foundIds.includes(d.id)),
    [foundIds, level.differences]
  );
  const visibleMarkers = debugShowAllDifferences ? level.differences : found;

  function normalizePoint(event: React.PointerEvent<HTMLDivElement>, side: "A" | "B") {
    const target = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - target.left - pan.x) / (target.width * zoom);
    const y = (event.clientY - target.top - pan.y) / (target.height * zoom);
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)), side };
  }

  function addWrongClick(side: "A" | "B", x: number, y: number) {
    const key = wrongClickSeq++;
    const setter = side === "A" ? setWrongClicksA : setWrongClicksB;
    setter((prev) => [...prev, { key, x, y }]);
    setTimeout(() => setter((prev) => prev.filter((w) => w.key !== key)), 700);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>, side: "A" | "B") {
    const active = pointer.current;
    pointer.current = null;
    if (!active) return;
    const dragged = Math.hypot(event.clientX - active.startX, event.clientY - active.startY) > 8;
    if (dragged) return;

    const point = normalizePoint(event, side);
    const match = level.differences.find((d) => {
      if (foundIds.includes(d.id)) return false;
      return hitTest(side === "A" ? d.hitAreaA : d.hitAreaB, point.x, point.y, imageAspectRatio);
    });

    if (match) {
      onDifference(match.id);
    } else {
      onMisclick();
      addWrongClick(side, point.x, point.y);
    }
  }

  function renderPhoto(side: "A" | "B", mobile = false) {
    const baseSrc = side === "A" ? level.imageA : level.imageB;
    const src = debugUseMarkupReference ? getSceneMarkupAsset(baseSrc) : baseSrc;
    const label = side === "A" ? labelA : labelB;
    const wrongClicks = side === "A" ? wrongClicksA : wrongClicksB;
    const displaySide = mobile ? version : side;

    return (
      <div className="flex flex-1 flex-col">
        {/* Label row (desktop only) */}
        {!mobile && label && (
          <div className="mb-[10px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[6px] font-manrope text-[11px] font-bold text-exp-brass2"
                style={{ background: "rgba(184,138,69,.16)", border: "1px solid rgba(184,138,69,.4)" }}
              >
                {side}
              </span>
              <span className="font-manrope text-[11px] font-semibold tracking-[.18em] text-exp-muted">{label}</span>
            </div>
            <span className="font-jetbrains text-[10px] font-medium" style={{ color: "rgba(135,144,135,.7)" }}>
              REF-{level.id.toUpperCase()}-{side}
            </span>
          </div>
        )}

        {/* Image canvas */}
        <div
          className="game-area relative flex-1 overflow-hidden rounded-[13px]"
          style={{
            background: "#1b211d",
            border: "1px solid rgba(213,195,154,.14)",
            boxShadow: "inset 0 0 60px rgba(0,0,0,.5)"
          }}
          onContextMenu={(e) => e.preventDefault()}
          onWheel={(e) => {
            e.preventDefault();
            setZoom((z) => Math.max(1, Math.min(2.5, z + (e.deltaY < 0 ? 0.12 : -0.12))));
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY };
          }}
          onPointerMove={(e) => {
            if (!pointer.current) return;
            const dx = e.clientX - pointer.current.x;
            const dy = e.clientY - pointer.current.y;
            pointer.current = { ...pointer.current, x: e.clientX, y: e.clientY };
            if (Math.hypot(e.clientX - pointer.current.startX, e.clientY - pointer.current.startY) > 8) {
              setPan((p) => ({
                x: Math.max(-220, Math.min(220, p.x + dx)),
                y: Math.max(-140, Math.min(140, p.y + dy))
              }));
            }
          }}
          onPointerUp={(e) => handlePointerUp(e, side)}
          role="img"
          aria-label={`${level.id} ${displaySide}`}
        >
          {/* Hatching texture */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "repeating-linear-gradient(45deg, rgba(213,195,154,.045) 0 14px, rgba(213,195,154,.015) 14px 28px)" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(70% 60% at 50% 38%, rgba(96,206,168,.07), transparent 60%)" }}
          />

          {/* Pannable/zoomable layer */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              className="h-full w-full object-fill"
              onLoad={(event) => {
                const image = event.currentTarget;
                if (image.naturalHeight > 0) {
                  setImageAspectRatio(image.naturalWidth / image.naturalHeight);
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
              />
              );
            })}

            {hintId ? <HintMarker difference={level.differences.find((d) => d.id === hintId)} aspectRatio={imageAspectRatio} /> : null}

            {wrongClicks.map((wc) => (
              <WrongClickMarker key={wc.key} x={wc.x} y={wc.y} />
            ))}
          </div>

          {/* A/B badge (mobile only) */}
          {mobile && (
            <div
              className="absolute left-[10px] top-[9px] flex items-center gap-[6px] rounded-[6px] px-[9px]"
              style={{ height: "22px", background: "rgba(21,27,24,.7)", border: "1px solid rgba(184,138,69,.3)" }}
            >
              <span className="font-manrope text-[9.5px] font-bold text-exp-brass2">{version}</span>
              <span className="font-manrope text-[8px] font-semibold tracking-[.1em] text-exp-muted">
                {version === "A" ? t("game.labelOriginal") : t("game.labelCopy")}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Desktop: side by side */}
      <div className="hidden flex-1 gap-5 md:flex">
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

      {/* Mobile: single image + toggle */}
      <div className="flex flex-1 flex-col md:hidden">
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
    </div>
  );
}

function FoundMarker({
  difference,
  side,
  debug = false,
  aspectRatio
}: {
  difference: DifferenceDefinition;
  side: "A" | "B";
  debug?: boolean;
  aspectRatio: number;
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
        height: `${box.height * 100}%`
      }}
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
    </span>
  );
}

function HintMarker({ difference, aspectRatio }: { difference?: DifferenceDefinition; aspectRatio: number }) {
  if (!difference) return null;
  const box = shapeBounds(difference.hintArea, aspectRatio);
  return (
    <span
      className="absolute"
      style={{
        left: `${box.left * 100}%`,
        top: `${box.top * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
        borderRadius: difference.hintArea.kind === "circle" || difference.hintArea.kind === "ellipse" ? "50%" : undefined,
        clipPath: difference.hintArea.kind === "polygon" ? polygonClipPath(difference.hintArea) : undefined,
        border: "1.5px dashed rgba(216,175,99,.55)",
        background: "radial-gradient(circle, rgba(216,175,99,.12), transparent 70%)",
        animation: "game-pulse 2.4s ease-in-out infinite"
      }}
      aria-hidden
    />
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
