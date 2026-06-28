import type { HitShape } from "@/entities/level/schema";

export function hitTest(shape: HitShape, x: number, y: number, aspectRatio = 1): boolean {
  if (shape.kind === "circle") {
    return Math.hypot(x - shape.cx, (y - shape.cy) / aspectRatio) <= shape.radius;
  }
  if (shape.kind === "ellipse") {
    const dx = (x - shape.cx) / shape.rx;
    const dy = (y - shape.cy) / shape.ry;
    return dx * dx + dy * dy <= 1;
  }

  let inside = false;
  const points = shape.points;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const pi = points[i];
    const pj = points[j];
    const intersects = pi.y > y !== pj.y > y && x < ((pj.x - pi.x) * (y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function shapeCenter(shape: HitShape): { x: number; y: number } {
  if (shape.kind === "circle") return { x: shape.cx, y: shape.cy };
  if (shape.kind === "ellipse") return { x: shape.cx, y: shape.cy };
  const total = shape.points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  return { x: total.x / shape.points.length, y: total.y / shape.points.length };
}
