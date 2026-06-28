import { describe, expect, it } from "vitest";
import { getChapterPreviewAsset, getSceneMarkupAsset } from "@/content/sceneAssets";

describe("sceneAssets", () => {
  it("maps gameplay scene assets to the markup reference asset", () => {
    expect(getSceneMarkupAsset("/assets/scenes/northern-route/3/1.webp")).toBe("/assets/scenes/northern-route/3/3.webp");
    expect(getSceneMarkupAsset("/assets/scenes/sand-meredian/7/2.webp")).toBe("/assets/scenes/sand-meredian/7/3.webp");
    expect(getSceneMarkupAsset("/assets/scenes/emerald-meridian/12/1.webp")).toBe("/assets/scenes/emerald-meridian/12/3.webp");
  });

  it("maps chapter ids to campaign menu preview assets", () => {
    expect(getChapterPreviewAsset("northern-route")).toBe("/assets/scenes/northern-route/preview.webp");
    expect(getChapterPreviewAsset("sand-meridian")).toBe("/assets/scenes/sand-meredian/preview.webp");
    expect(getChapterPreviewAsset("emerald-meridian")).toBe("/assets/scenes/emerald-meridian/preview.webp");
  });
});
