import { useTranslation } from "react-i18next";

export type ArtifactToastVariant = "new" | "replay";

// Non-blocking toast shown top-center over the gameplay HUD the moment the
// player taps the difference tied to a collectible artifact. Auto-dismissed
// by the caller after ~2.5s; never intercepts input.
export function ArtifactFoundToast({ variant }: { variant: ArtifactToastVariant }) {
  const { t } = useTranslation();
  const isReplay = variant === "replay";

  return (
    // Positioning wrapper stays transform-stable: the pop animation lives on
    // the inner card because `game-pop` animates `transform` and would
    // otherwise override the centering translate.
    <div className="pointer-events-none absolute left-1/2 top-[74px] z-40 -translate-x-1/2">
    <div
      className="flex items-center gap-3 rounded-[10px] px-5 py-3 pl-3.5"
      style={{
        background: "rgba(21,27,24,.86)",
        border: isReplay ? "1px solid rgba(111,198,158,.35)" : "1px solid rgba(184,138,69,.5)",
        boxShadow: "0 14px 30px rgba(0,0,0,.5), inset 0 1px 0 rgba(213,195,154,.06)",
        backdropFilter: "blur(6px)",
        animation: "game-pop .35s cubic-bezier(.2,.8,.3,1.2)"
      }}
      role="status"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={
          isReplay
            ? { background: "rgba(111,198,158,.12)", border: "1px solid rgba(111,198,158,.4)" }
            : {
                background: "radial-gradient(circle at 38% 32%, #e7c074, #a9762f)",
                boxShadow: "0 0 14px rgba(216,175,99,.5)"
              }
        }
      >
        {isReplay ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6fc69e" strokeWidth="1.8" strokeLinecap="round">
            <rect x="4" y="9" width="16" height="10" rx="2" />
            <path d="M8 9V6a4 4 0 0 1 8 0v3" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a1d0c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h6l2 2h8v10H4z" />
            <circle cx="12" cy="14" r="1.6" fill="#2a1d0c" stroke="none" />
          </svg>
        )}
      </div>
      <div className="text-left">
        <div className="text-[13px] font-bold" style={{ color: isReplay ? "#8fd6b4" : "#D5C39A" }}>
          {isReplay ? t("artifactReveal.toastReplayTitle") : t("artifactReveal.toastTitle")}
        </div>
        <div className="mt-0.5 text-[11px] font-medium" style={{ color: isReplay ? "#6d9683" : "#a9b0a6" }}>
          {isReplay ? t("artifactReveal.toastReplaySubtitle") : t("artifactReveal.toastSubtitle")}
        </div>
      </div>
    </div>
    </div>
  );
}
