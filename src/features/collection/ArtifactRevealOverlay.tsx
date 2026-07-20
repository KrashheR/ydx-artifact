import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArtifactDefinition } from "@/content/artifacts";
import { getChapter, getChapterLevels } from "@/content/chapters";
import { getChapterArtifacts } from "@/content/artifacts";
import { useGameStore } from "@/shared/store/gameStore";

const REVEAL_DELAY_MS = 1400;

function ArchiveWaxSeal({ opening }: { opening: boolean }) {
  return (
    <div
      className={`artifact-wax-seal ${opening ? "artifact-wax-seal--opening" : ""}`}
      aria-hidden="true"
    >
      <div className="artifact-wax-seal__half artifact-wax-seal__half--left" />
      <div className="artifact-wax-seal__half artifact-wax-seal__half--right" />
      <svg
        className="artifact-wax-seal__mark"
        width="38"
        height="38"
        viewBox="0 0 40 40"
        fill="none"
        focusable="false"
      >
        <circle
          cx="20"
          cy="20"
          r="13.5"
          stroke="#2a1d0c"
          strokeWidth="1.7"
          opacity=".72"
        />
        <path
          d="M20 9.5v21M9.5 20h21M14 14l12 12M26 14 14 26"
          stroke="#2a1d0c"
          strokeLinecap="round"
          strokeWidth="1.4"
          opacity=".7"
        />
        <path
          d="M20 12.8 22.2 18l5.6.5-4.2 3.7 1.3 5.5L20 24.8l-4.9 2.9 1.3-5.5-4.2-3.7 5.6-.5L20 12.8Z"
          fill="#2a1d0c"
          opacity=".62"
        />
      </svg>
    </div>
  );
}

export function ArtifactRevealOverlay({
  artifact,
  backgroundSrc,
  onContinue,
  onOpenCollection,
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
    (entry) => (artifactStates[entry.id] ?? "locked") !== "locked",
  ).length;
  const isFinalCaseArtifact =
    artifact.unlockLevelOrder ===
    Math.max(...getChapterLevels(artifact.chapterId).map((l) => l.order));

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-3">
      <img
        src={backgroundSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: "blur(10px) brightness(.4) saturate(.8)",
          transform: "scale(1.08)",
        }}
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{ background: "rgba(13,18,16,.4)" }}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="artifact-reveal-title"
        className="artifact-reveal-dialog modal-panel result-dialog relative z-10 flex w-[600px] max-w-[calc(100vw-32px)] flex-col items-center overflow-hidden rounded-[16px] px-8 pb-8 pt-9 text-center font-manrope sm:px-11"
        style={{
          background: "#222A25",
          border: "1px solid rgba(184,138,69,.45)",
          boxShadow: "0 40px 90px rgba(0,0,0,.6)",
          maxHeight: "calc(100vh - 24px)",
          overflowY: "auto",
          animation: "game-pop .5s cubic-bezier(.2,.8,.3,1.2)",
        }}
      >
        <div className="artifact-reveal-eyebrow text-[11px] font-bold tracking-[.32em] text-exp-brass">
          {isFinalCaseArtifact
            ? t("artifactReveal.eyebrowFinal")
            : t("artifactReveal.eyebrow")}
        </div>
        <h2
          id="artifact-reveal-title"
          className="artifact-reveal-title mt-2 font-cormorant text-[30px] font-semibold leading-tight text-exp-parch"
        >
          {t("artifactReveal.title")}
        </h2>

        {/* Sealed → revealed artifact card */}
        <div className="artifact-reveal-card relative mt-6 h-[200px] w-[200px] sm:h-[220px] sm:w-[220px]">
          {/* Sealed state */}
          <div
            className={`artifact-sealed-card absolute inset-0 flex items-center justify-center rounded-[6px] transition-opacity duration-700 ${
              revealed ? "artifact-sealed-card--opening" : ""
            }`}
            style={{
              opacity: revealed ? 0 : 1,
            }}
            aria-hidden={revealed}
          >
            <div className="artifact-sealed-card__paper artifact-sealed-card__paper--top" />
            <div className="artifact-sealed-card__paper artifact-sealed-card__paper--bottom" />
            <div className="artifact-sealed-card__fold artifact-sealed-card__fold--horizontal" />
            <div className="artifact-sealed-card__fold artifact-sealed-card__fold--vertical" />
            <ArchiveWaxSeal opening={revealed} />
          </div>

          {/* Revealed state */}
          <div
            className="artifact-revealed-card absolute inset-0 flex items-center justify-center rounded-[8px] transition-all duration-700"
            style={{
              background: "linear-gradient(160deg, #2b2115, #1c150c)",
              border: "1px solid rgba(184,138,69,.5)",
              boxShadow:
                "0 22px 44px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,236,196,.08)",
              opacity: revealed ? 1 : 0,
              transform: revealed
                ? "translateY(0) scale(1)"
                : "translateY(10px) scale(.92)",
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
                background: "rgba(21,27,24,.85)",
              }}
            >
              {t("artifactReveal.collectedTag")}
            </span>
          </div>
        </div>

        {!revealed ? (
          <div className="artifact-reveal-sealing mt-[18px] text-[13px] font-medium text-exp-muted">
            {t("artifactReveal.sealing")}
          </div>
        ) : (
          <div
            className="artifact-reveal-content flex flex-col items-center"
            style={{ animation: "game-pop .4s ease-out" }}
          >
            <div className="artifact-reveal-name mt-5 font-cormorant text-[22px] font-semibold text-exp-parch">
              {t(`artifacts.${artifact.id}.name`)}
            </div>
            <div
              className="artifact-reveal-clue mt-1.5 text-[13px] font-medium italic"
              style={{ color: "#c9a869" }}
            >
              {t(`artifacts.${artifact.id}.reveal`)}
            </div>
            <p
              className="artifact-reveal-body mt-3.5 max-w-[460px] text-[13px] leading-[1.55]"
              style={{ color: "#a9b0a6" }}
            >
              {t(`artifacts.${artifact.id}.body`)}
            </p>
            <div className="artifact-reveal-footer mt-3 font-jetbrains text-[11px] font-semibold tracking-[.08em] text-exp-muted">
              {t("artifactReveal.footer", {
                campaign: t(chapter.titleKey),
                done: unlockedInChapter,
                total: chapterArtifacts.length,
              })}
            </div>

            <div className="artifact-reveal-actions mt-6 flex w-full flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                autoFocus
                onClick={onContinue}
                className="h-[52px] w-full flex-1 rounded-[9px] border-none text-[14.5px] font-extrabold text-[#1a130a]"
                style={{
                  background: "linear-gradient(180deg, #d8af63, #b3812f)",
                  boxShadow:
                    "0 10px 26px rgba(184,138,69,.28), inset 0 1px 0 rgba(255,255,255,.3)",
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
                  background: "rgba(213,195,154,.05)",
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
