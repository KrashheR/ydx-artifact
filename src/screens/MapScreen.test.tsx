import { describe, expect, it } from "vitest";
import { chapterList } from "@/content/chapters";

describe("MapScreen", () => {
  it("has a map node position for every playable chapter level", () => {
    for (const chapter of chapterList) {
      expect(chapter.mapPoints).toHaveLength(chapter.levels.length);
    }
  });
});
