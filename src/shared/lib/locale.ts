export type SupportedLocale = "ru" | "en";

const russianFallbackLanguages = new Set(["ru", "be", "kk", "uk", "uz"]);

export function resolveInitialLocale(sdkLanguage?: string): SupportedLocale {
  const normalized = sdkLanguage?.toLowerCase().split("-")[0];
  return normalized && russianFallbackLanguages.has(normalized) ? "ru" : "en";
}
