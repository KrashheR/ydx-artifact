const MOBILE_GAMEPLAY_QUERIES = [
  // Matches the mobile-landscape gameplay breakpoint in styles.css.
  "(pointer: coarse) and (orientation: landscape) and (max-height: 520px) and (max-width: 940px)",
  // Matches the portrait phone breakpoint (orientation gate territory).
  "(pointer: coarse) and (orientation: portrait) and (max-width: 767px)"
];

export function isMobileGameplayDevice(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return MOBILE_GAMEPLAY_QUERIES.some((query) => window.matchMedia(query).matches);
}
