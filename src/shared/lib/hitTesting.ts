import type { HitShape } from "@/entities/level/schema";

export function hitTest(shape: HitShape, x: number, y: number, aspectRatio = 1): boolean {
  if (shape.kind === "circle") {
    return Math.hypot(x - shape.cx, (y - shape.cy) / aspectRatio) <= shape.radius;
  }
  if (shape.kind === "ellipse") {
    const rotation = shape.rotation ?? 0;
    if (rotation === 0) {
      const dx = (x - shape.cx) / shape.rx;
      const dy = (y - shape.cy) / shape.ry;
      return dx * dx + dy * dy <= 1;
    }

    const angle = degreesToRadians(-rotation);
    const dx = (x - shape.cx) * aspectRatio;
    const dy = y - shape.cy;
    const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
    const radiusX = shape.rx * aspectRatio;
    const radiusY = shape.ry;
    return (localX / radiusX) ** 2 + (localY / radiusY) ** 2 <= 1;
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

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
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
