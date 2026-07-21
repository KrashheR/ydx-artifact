/**
 * CrazyGames disables ads during Basic Launch. Keep the SDK active for
 * lifecycle and Data Module support, but make ad placements opt-in for the
 * later Full Launch profile.
 */
export function areAdsEnabled(
  platform = import.meta.env.VITE_PLATFORM ?? import.meta.env.VITE_PLATFORM_MODE,
  crazyGamesLaunchProfile = import.meta.env.VITE_CRAZYGAMES_LAUNCH,
) {
  return platform !== "crazygames" || crazyGamesLaunchProfile === "full";
}
