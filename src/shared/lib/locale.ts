export type SupportedLocale = "ru" | "en";

function toSupportedLocale(language?: string): SupportedLocale | undefined {
  const normalized = language?.trim().toLowerCase().split(/[-_]/)[0];
  return normalized === "ru" || normalized === "en" ? normalized : undefined;
}

export function getBrowserLanguage(): string | undefined {
  return typeof navigator === "undefined" ? undefined : navigator.language;
}

export function resolveInitialLocale(
  platformLanguage?: string,
  browserLanguage?: string,
): SupportedLocale {
  return (
    toSupportedLocale(platformLanguage) ??
    toSupportedLocale(browserLanguage) ??
    "ru"
  );
}
