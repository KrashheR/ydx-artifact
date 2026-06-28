import { describe, expect, it } from "vitest";
import { hitTest } from "@/shared/lib/hitTesting";

describe("hitTest", () => {
  it("detects circle hits", () => {
    expect(hitTest({ kind: "circle", cx: 0.5, cy: 0.5, radius: 0.1 }, 0.55, 0.55)).toBe(true);
    expect(hitTest({ kind: "circle", cx: 0.5, cy: 0.5, radius: 0.1 }, 0.8, 0.8)).toBe(false);
  });

  it("detects ellipse hits", () => {
    expect(hitTest({ kind: "ellipse", cx: 0.5, cy: 0.5, rx: 0.2, ry: 0.08 }, 0.68, 0.5)).toBe(true);
    expect(hitTest({ kind: "ellipse", cx: 0.5, cy: 0.5, rx: 0.2, ry: 0.08 }, 0.5, 0.6)).toBe(false);
  });

  it("detects polygon hits", () => {
    const square = {
      kind: "polygon" as const,
      points: [
        { x: 0.2, y: 0.2 },
        { x: 0.8, y: 0.2 },
        { x: 0.8, y: 0.8 },
        { x: 0.2, y: 0.8 }
      ]
    };
    expect(hitTest(square, 0.5, 0.5)).toBe(true);
    expect(hitTest(square, 0.9, 0.5)).toBe(false);
  });
});
