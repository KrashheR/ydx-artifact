import { useMemo, useRef, useState } from "react";
import type { DifferenceDefinition, LevelDefinition } from "@/entities/level/schema";
import { hitTest, shapeCenter } from "@/shared/lib/hitTesting";

type PhotoComparatorProps = {
  level: LevelDefinition;
  foundIds: string[];
  hintId?: string;
  onDifference: (differenceId: string) => void;
  onMisclick: () => void;
};

type PointerState = {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
};

export function PhotoComparator({ level, foundIds, hintId, onDifference, onMisclick }: PhotoComparatorProps) {
  const [version, setVersion] = useState<"A" | "B">("A");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pointer = useRef<PointerState | null>(null);

  const found = useMemo(
    () => level.differences.filter((difference) => foundIds.includes(difference.id)),
    [foundIds, level.differences]
  );

  function normalizePoint(event: React.PointerEvent<HTMLDivElement>, side: "A" | "B") {
    const target = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - target.left - pan.x) / (target.width * zoom);
    const y = (event.clientY - target.top - pan.y) / (target.height * zoom);
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)), side };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>, side: "A" | "B") {
    const active = pointer.current;
    pointer.current = null;
    if (!active) return;
    const dragged = Math.hypot(event.clientX - active.startX, event.clientY - active.startY) > 8;
    if (dragged) return;

    const point = normalizePoint(event, side);
    const match = level.differences.find((difference) => {
      if (foundIds.includes(difference.id)) return false;
      const shape = side === "A" ? difference.hitAreaA : difference.hitAreaB;
      return hitTest(shape, point.x, point.y);
    });

    if (match) onDifference(match.id);
    else onMisclick();
  }

  function renderPhoto(side: "A" | "B", mobile = false) {
    const src = side === "A" ? level.imageA : level.imageB;
    return (
      <div
        className="game-area relative aspect-[16/10] overflow-hidden rounded-2xl border border-graphite/25 bg-graphite"
        onContextMenu={(event) => event.preventDefault()}
        onWheel={(event) => {
          event.preventDefault();
          setZoom((current) => Math.max(1, Math.min(2.5, current + (event.deltaY < 0 ? 0.12 : -0.12))));
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!pointer.current) return;
          const dx = event.clientX - pointer.current.x;
          const dy = event.clientY - pointer.current.y;
          pointer.current = { ...pointer.current, x: event.clientX, y: event.clientY };
          if (Math.hypot(event.clientX - pointer.current.startX, event.clientY - pointer.current.startY) > 8) {
            setPan((current) => ({
              x: Math.max(-220, Math.min(220, current.x + dx)),
              y: Math.max(-140, Math.min(140, current.y + dy))
            }));
          }
        }}
        onPointerUp={(event) => handlePointerUp(event, side)}
        role="img"
        aria-label={`${level.id} ${side}`}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <img src={src} alt="" draggable={false} className="h-full w-full object-cover" />
          {found.map((difference) => (
            <Marker key={`${side}-${difference.id}`} difference={difference} side={side} />
          ))}
          {hintId ? <Hint difference={level.differences.find((difference) => difference.id === hintId)} /> : null}
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-ivory/90 px-3 py-1 text-sm font-bold">{mobile ? version : side}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden gap-4 md:grid md:grid-cols-2">
        {renderPhoto("A")}
        {renderPhoto("B")}
      </div>
      <div className="md:hidden">
        {renderPhoto(version, true)}
        <button
          className="mt-3 min-h-12 w-full rounded-xl bg-teal px-4 py-2 font-bold text-ivory"
          onClick={() => setVersion((current) => (current === "A" ? "B" : "A"))}
          onPointerDown={() => setVersion((current) => (current === "A" ? "B" : "A"))}
        >
          Compare A/B
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="rounded-lg bg-ivory px-3 py-1" onClick={() => setZoom((current) => Math.min(2.5, current + 0.15))}>+</button>
        <button className="rounded-lg bg-ivory px-3 py-1" onClick={() => setZoom((current) => Math.max(1, current - 0.15))}>-</button>
        <button className="rounded-lg bg-ivory px-3 py-1" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</button>
      </div>
    </div>
  );
}

function Marker({ difference, side }: { difference: DifferenceDefinition; side: "A" | "B" }) {
  const center = shapeCenter(side === "A" ? difference.hitAreaA : difference.hitAreaB);
  return (
    <span
      className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-rust bg-ivory/35 shadow-lg"
      style={{ left: `${center.x * 100}%`, top: `${center.y * 100}%` }}
      aria-hidden
    />
  );
}

function Hint({ difference }: { difference?: DifferenceDefinition }) {
  if (!difference) return null;
  const center = shapeCenter(difference.hintArea);
  return (
    <span
      className="absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-ochre bg-ochre/20"
      style={{ left: `${center.x * 100}%`, top: `${center.y * 100}%` }}
      aria-hidden
    />
  );
}
