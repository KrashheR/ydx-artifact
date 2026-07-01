import { useTranslation } from "react-i18next";
import type { LevelDefinition } from "@/entities/level/schema";
import type { ChapterDefinition } from "@/content/chapters";
import { starsForAccuracy } from "@/shared/lib/progression";

type Props = {
  level: LevelDefinition;
  chapter: ChapterDefinition;
  found: number;
  required: number;
  mistakes: number;
  elapsedSeconds: number;
  completedLevelIds: string[];
  nextLevelOrder?: number;
  nextLevelTitle?: string;
  onNext: (() => void) | null;
  onRetry: () => void;
  onMap: () => void;
};

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function Stars({ count }: { count: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {([1, 2, 3] as const).map((i) => (
        <svg key={i} width="17" height="17" viewBox="0 0 24 24"
          fill={i <= count ? "#d8af63" : "none"}
          stroke={i <= count ? "#d8af63" : "rgba(213,195,154,.3)"}
          strokeWidth="1.2"
        >
          <path d="M12 2l2.9 6.3 6.6.6-5 4.5 1.5 6.6L12 17l-6 3.5 1.5-6.6-5-4.5 6.6-.6z" />
        </svg>
      ))}
    </div>
  );
}

const statCard = "result-stat-card flex flex-1 flex-col items-center rounded-xl border border-exp-parch/[.12] py-4";
const statLabel = "mt-[5px] text-[9.5px] font-semibold tracking-[.14em] text-exp-muted";
const secondaryBtn = "flex-1 rounded-[10px] border border-exp-parch/[.14] bg-transparent py-3 text-[13.5px] font-semibold text-exp-parch";

export function LevelCompleteOverlay({
  level, chapter, found, required, mistakes, elapsedSeconds,
  completedLevelIds, nextLevelOrder, nextLevelTitle, onNext, onRetry, onMap
}: Props) {
  const { t } = useTranslation();
  const accuracy = found / Math.max(found + mistakes, 1);
  const stars = starsForAccuracy(accuracy);
  const chapterDone = completedLevelIds.filter((id) => chapter.levels.some((l) => l.id === id)).length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(80% 80% at 50% 42%, rgba(13,18,15,.55), rgba(13,18,15,.88))" }}
      />

      <div
        className="modal-panel result-dialog relative z-10 w-[560px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[18px] font-manrope"
        style={{
          background: "linear-gradient(180deg, #27302b, #1c241e)",
          border: "1px solid rgba(184,138,69,.35)",
          boxShadow: "0 50px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(213,195,154,.08)",
          animation: "game-pop .5s cubic-bezier(.2,.8,.3,1.2)"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, transparent, #d8af63, transparent)" }} />

        <div className="result-dialog-content relative px-12 py-10 text-center">
          <div className="result-hero">
          <div
            className="result-icon mx-auto mb-[18px] flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle at 40% 34%, #3a7a64, #1e4435 72%)",
              border: "2.5px dashed rgba(155,217,187,.55)",
              boxShadow: "0 14px 36px rgba(0,0,0,.5), 0 0 30px rgba(47,106,87,.4)"
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cdeede" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <div className="result-badge text-[11px] font-semibold tracking-[.32em] text-exp-success2">
            {t("game.completedBadge", { order: level.order })}
          </div>
          <h2 className="result-title mt-2 font-cormorant text-[42px] font-semibold leading-tight text-exp-parch">
            {t("game.completedTitle")}
          </h2>
          <p className="result-desc mx-auto mt-2.5 max-w-[380px] text-[14px] leading-[1.55] text-exp-muted">
            {t("game.completedDesc")}
          </p>
          </div>

          <div className="result-body">
          <div className="result-stats mt-[26px] flex gap-3">
            <div className={statCard} style={{ background: "rgba(21,27,24,.5)" }}>
              <div className="font-jetbrains text-[23px] font-semibold text-exp-parch">{formatTime(elapsedSeconds)}</div>
              <div className={statLabel}>{t("game.statTime")}</div>
            </div>
            <div className={statCard} style={{ background: "rgba(21,27,24,.5)" }}>
              <div className="text-[23px] font-semibold text-exp-success2">{found} / {required}</div>
              <div className={statLabel}>{t("game.statFound")}</div>
            </div>
            <div className={statCard} style={{ background: "rgba(21,27,24,.5)" }}>
              <Stars count={stars} />
              <div className="mt-[7px] text-[9.5px] font-semibold tracking-[.14em] text-exp-muted">{t("game.statRating")}</div>
            </div>
          </div>

          <div className="result-progress mb-6 mt-3 rounded-xl border border-exp-parch/[.12] px-[18px] py-[15px]" style={{ background: "rgba(21,27,24,.4)" }}>
            <div className="mb-[9px] flex justify-between">
              <span className="text-[11px] font-semibold tracking-[.08em] text-exp-muted">{t(chapter.titleKey).toUpperCase()}</span>
              <span className="text-[12px] font-bold text-exp-brass2">{chapterDone} / {chapter.levels.length}</span>
            </div>
            <div className="flex gap-[3px]">
              {chapter.levels.map((l) => {
                const isDone = completedLevelIds.includes(l.id);
                const isCurrent = l.id === level.id;
                return (
                  <span
                    key={l.id}
                    className="h-2 flex-1 rounded-[2px]"
                    style={{
                      background: isDone ? "linear-gradient(180deg, #d8af63, #a9762f)" : "rgba(213,195,154,.1)",
                      boxShadow: isCurrent && isDone ? "0 0 10px rgba(216,175,99,.7)" : undefined
                    }}
                  />
                );
              })}
            </div>
          </div>

          {onNext ? (
            <button
              onClick={onNext}
              className="result-primary flex w-full items-center justify-center gap-[9px] rounded-[10px] border-none py-[17px] text-[16px] font-bold text-[#1a130a]"
              style={{
                background: "linear-gradient(180deg, #d8af63, #b3812f)",
                boxShadow: "0 12px 28px rgba(184,138,69,.32), inset 0 1px 0 rgba(255,255,255,.3)"
              }}
            >
              {t("game.nextLevelCta", { order: nextLevelOrder, title: nextLevelTitle })}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a130a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="result-primary w-full rounded-[10px] border-none py-[17px] text-[16px] font-bold text-[#1a130a]"
              style={{
                background: "linear-gradient(180deg, #d8af63, #b3812f)",
                boxShadow: "0 12px 28px rgba(184,138,69,.32), inset 0 1px 0 rgba(255,255,255,.3)"
              }}
            >
              {t("game.retry")}
            </button>
          )}

          <div className="result-actions mt-[11px] flex gap-[11px]">
            {onNext && (
              <button onClick={onRetry} className={secondaryBtn}>
                {t("game.retry")}
              </button>
            )}
            <button onClick={onMap} className={secondaryBtn}>
              {t("game.toMap")}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
