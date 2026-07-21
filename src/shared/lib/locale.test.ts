import { describe, expect, it } from "vitest";
import {
  getPlatformLocaleFallback,
  resolveInitialLocale,
} from "@/shared/lib/locale";

describe("resolveInitialLocale", () => {
  it.each([
    ["ru", undefined, "ru"],
    ["en", "ru-RU", "en"],
    ["ru-RU", "en-US", "ru"],
    [undefined, "ru-RU", "ru"],
    [undefined, "en-US", "en"],
    ["kk", "en-US", "en"],
    ["tr", "de-DE", "ru"],
    [undefined, undefined, "ru"],
  ] as const)(
    "maps platform %s and browser %s to %s",
    (platformLanguage, browserLanguage, expected) => {
      expect(resolveInitialLocale(platformLanguage, browserLanguage)).toBe(expected);
    },
  );

  it("uses English as the CrazyGames fallback locale", () => {
    expect(getPlatformLocaleFallback("crazygames")).toBe("en");
    expect(resolveInitialLocale("tr", "de-DE", "en")).toBe("en");
  });
});
