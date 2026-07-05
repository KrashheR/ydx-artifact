import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArtifactDefinition } from "@/content/artifacts";
import { getChapter, getChapterLevels } from "@/content/chapters";
import { getChapterArtifacts } from "@/content/artifacts";
import { useGameStore } from "@/shared/store/gameStore";

const REVEAL_DELAY_MS = 1400;

function SealBadge({ size = 64 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 38% 30%, #e7c074, #a9762f)",
        border: "2px solid rgba(255,236,196,.5)",
        boxShadow: "0 10px 24px rgba(0,0,0,.5)"
      }}
    >
      <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="#2a1d0c" strokeWidth="1.8">
        <rect x="5" y="11" width="14" height="9.5" rx="1.6" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    </div>
  );
}

export function ArtifactRevealOverlay({
  artifact,
  backgroundSrc,
  onContinue,
  onOpenCollection
}: {
  artifact: ArtifactDefinition;
  backgroundSrc: string;
  onContinue: () => void;
  onOpenCollection: () => void;
}) {
  const { t } = useTranslation();
  const reducedMotion = useGameStore((s) => s.saveData.settings.reducedMotion);
  const artifactStates = useGameStore((s) => s.saveData.artifacts);
  const [revealed, setRevealed] = useState(reducedMotion);

  useEffect(() => {
    if (revealed) return;
    const id = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [revealed]);

  const chapter = getChapter(artifact.chapterId);
  const chapterArtifacts = getChapterArtifacts(artifact.chapterId);
  const unlockedInChapter = chapterArtifacts.filter(
    (entry) => (artifactStates[entry.id] ?? "locked") !== "locked"
  ).length;
  const isFinalCaseArtifact =
    artifact.unlockLevelOrder === Math.max(...getChapterLevels(artifact.chapterId).map((l) => l.order));

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-3">
      <img
        src={backgroundSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "blur(10px) brightness(.4) saturate(.8)", transform: "scale(1.08)" }}
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: "rgba(13,18,16,.4)" }} />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="artifact-reveal-title"
        className="modal-panel result-dialog relative z-10 flex w-[600px] max-w-[calc(100vw-32px)] flex-col items-center overflow-hidden rounded-[16px] px-8 pb-8 pt-9 text-center font-manrope sm:px-11"
        style={{
          background: "#222A25",
          border: "1px solid rgba(184,138,69,.45)",
          boxShadow: "0 40px 90px rgba(0,0,0,.6)",
          maxHeight: "calc(100vh - 24px)",
          overflowY: "auto",
          animation: "game-pop .5s cubic-bezier(.2,.8,.3,1.2)"
        }}
      >
        <div className="text-[11px] font-bold tracking-[.32em] text-exp-brass">
          {isFinalCaseArtifact ? t("artifactReveal.eyebrowFinal") : t("artifactReveal.eyebrow")}
        </div>
        <h2
          id="artifact-reveal-title"
          className="mt-2 font-cormorant text-[30px] font-semibold leading-tight text-exp-parch"
        >
          {t("artifactReveal.title")}
        </h2>

        {/* Sealed → revealed artifact card */}
        <div className="relative mt-6 h-[200px] w-[200px] sm:h-[220px] sm:w-[220px]">
          {/* Sealed state */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-[6px] transition-opacity duration-700"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(213,195,154,.06) 0 10px, rgba(213,195,154,.02) 10px 20px)",
              border: "1px dashed rgba(184,138,69,.5)",
              opacity: revealed ? 0 : 1
            }}
            aria-hidden={revealed}
          >
            <div className="absolute left-[14px] right-[14px] top-[44%] h-[1.5px]" style={{ background: "rgba(184,138,69,.5)" }} />
            <div className="absolute bottom-[14px] left-[44%] top-[14px] w-[1.5px]" style={{ background: "rgba(184,138,69,.5)" }} />
            <SealBadge />
          </div>

          {/* Revealed state */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-[8px] transition-all duration-700"
            style={{
              background: "linear-gradient(160deg, #2b2115, #1c150c)",
              border: "1px solid rgba(184,138,69,.5)",
              boxShadow: "0 22px 44px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,236,196,.08)",
              opacity: revealed ? 1 : 0,
              transform: revealed ? "scale(1)" : "scale(.92)"
            }}
            aria-hidden={!revealed}
          >
            <img
              src={artifact.openImage}
              alt={t(`artifacts.${artifact.id}.name`)}
              className="h-full w-full rounded-[8px] object-cover"
              draggable={false}
            />
            <span
              className="absolute -right-2 -top-2 rounded-[4px] border px-1.5 py-0.5 text-[9px] font-extrabold tracking-[.1em]"
              style={{
                transform: "rotate(10deg)",
                color: "#6fc69e",
                borderColor: "#4d8f74",
                background: "rgba(21,27,24,.85)"
              }}
            >
              {t("artifactReveal.collectedTag")}
            </span>
          </div>
        </div>

        {!revealed ? (
          <div className="mt-[18px] text-[13px] font-medium text-exp-muted">
            {t("artifactReveal.sealing")}
          </div>
        ) : (
          <div className="flex flex-col items-center" style={{ animation: "game-pop .4s ease-out" }}>
            <div className="mt-5 font-cormorant text-[22px] font-semibold text-exp-parch">
              {t(`artifacts.${artifact.id}.name`)}
            </div>
            <div className="mt-1.5 text-[13px] font-medium italic" style={{ color: "#c9a869" }}>
              {t(`artifacts.${artifact.id}.reveal`)}
            </div>
            <p className="mt-3.5 max-w-[460px] text-[13px] leading-[1.55]" style={{ color: "#a9b0a6" }}>
              {t(`artifacts.${artifact.id}.body`)}
            </p>
            <div className="mt-3 font-jetbrains text-[11px] font-semibold tracking-[.08em] text-exp-muted">
              {t("artifactReveal.footer", {
                campaign: t(chapter.titleKey),
                done: unlockedInChapter,
                total: chapterArtifacts.length
              })}
            </div>

            <div className="mt-6 flex w-full flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                autoFocus
                onClick={onContinue}
                className="h-[52px] w-full flex-1 rounded-[9px] border-none text-[14.5px] font-extrabold text-[#1a130a]"
                style={{
                  background: "linear-gradient(180deg, #d8af63, #b3812f)",
                  boxShadow: "0 10px 26px rgba(184,138,69,.28), inset 0 1px 0 rgba(255,255,255,.3)"
                }}
              >
                {t("artifactReveal.continueCta")}
              </button>
              <button
                type="button"
                onClick={onOpenCollection}
                className="h-[52px] w-full flex-1 rounded-[9px] text-[13.5px] font-bold text-exp-parch"
                style={{
                  border: "1px solid rgba(213,195,154,.24)",
                  background: "rgba(213,195,154,.05)"
                }}
              >
                {t("artifactReveal.collectionCta")}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
