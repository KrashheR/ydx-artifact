import { describe, expect, it } from "vitest";
import { resolveInitialLocale } from "@/shared/lib/locale";

describe("resolveInitialLocale", () => {
  it.each([
    ["ru", "ru"],
    ["ru-RU", "ru"],
    ["kk", "ru"],
    ["uk-UA", "ru"],
    ["en", "en"],
    ["tr", "en"],
    [undefined, "en"]
  ] as const)("maps %s to %s", (sdkLanguage, expected) => {
    expect(resolveInitialLocale(sdkLanguage)).toBe(expected);
  });
});
