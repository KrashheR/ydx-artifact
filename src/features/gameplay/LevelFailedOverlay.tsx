import { useTranslation } from "react-i18next";
import type { LevelDefinition } from "@/entities/level/schema";

type Props = {
  level: LevelDefinition;
  found: number;
  canExtend: boolean;
  onRetry: () => void;
  onExtend: () => void;
  onMap: () => void;
};

const statCard = "flex flex-1 flex-col items-center rounded-xl border border-exp-parch/[.12] py-4";
const statLabel = "mt-[5px] text-[9.5px] font-semibold tracking-[.14em] text-exp-muted";

export function LevelFailedOverlay({ level, found, canExtend, onRetry, onExtend, onMap }: Props) {
  const { t } = useTranslation();
  const remaining = level.requiredDifferences - found;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(80% 80% at 50% 42%, rgba(28,14,11,.5), rgba(13,18,15,.9))" }}
      />

      <div
        className="modal-panel relative z-10 w-[560px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[18px] font-manrope"
        style={{
          background: "linear-gradient(180deg, #2c2622, #1f1b18)",
          border: "1px solid rgba(176,86,66,.4)",
          boxShadow: "0 50px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(213,195,154,.06)",
          animation: "game-pop .5s cubic-bezier(.2,.8,.3,1.2)"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, transparent, #c9684f, transparent)" }} />

        <div className="relative px-12 py-10 text-center">
          <div
            className="mx-auto mb-[18px] flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle at 40% 34%, #7a4a3c, #3a201a 72%)",
              border: "2.5px dashed rgba(224,138,120,.5)",
              boxShadow: "0 14px 36px rgba(0,0,0,.5), 0 0 30px rgba(176,86,66,.32)"
            }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#e8b3a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2" />
              <path d="M9 2h6" />
              <path d="M18.5 5.5l1.8-1.8" />
            </svg>
          </div>

          <div className="text-[11px] font-semibold tracking-[.32em]" style={{ color: "#e08a78" }}>
            {t("game.timeoutBadge")}
          </div>
          <h2 className="mt-2 font-cormorant text-[42px] font-semibold leading-tight text-exp-parch">
            {t("game.timeoutTitle")}
          </h2>
          <p className="mx-auto mt-2.5 max-w-[392px] text-[14px] leading-[1.55] text-exp-muted">
            {t("game.timeoutDesc")}
          </p>

          <div className="mt-[26px] flex gap-3">
            <div className={statCard} style={{ background: "rgba(21,27,24,.5)" }}>
              <div className="font-jetbrains text-[23px] font-semibold" style={{ color: "#e08a78" }}>00:00</div>
              <div className={statLabel}>{t("game.statTimer")}</div>
            </div>
            <div className={statCard} style={{ background: "rgba(21,27,24,.5)" }}>
              <div className="text-[23px] font-semibold text-exp-brass2">{found} / {level.requiredDifferences}</div>
              <div className={statLabel}>{t("game.statFound")}</div>
            </div>
            <div className={statCard} style={{ background: "rgba(21,27,24,.5)" }}>
              <div className="text-[23px] font-semibold" style={{ color: "#e08a78" }}>{remaining}</div>
              <div className={statLabel}>{t("game.statRemaining")}</div>
            </div>
          </div>

          <div className="mb-6 mt-3 rounded-xl border border-exp-parch/[.12] px-[18px] py-[15px]" style={{ background: "rgba(21,27,24,.4)" }}>
            <div className="mb-[10px] flex justify-between">
              <span className="text-[11px] font-semibold tracking-[.08em] text-exp-muted">
                {t("game.diffsOnLevel")}
              </span>
              <span className="text-[12px] font-bold text-exp-brass2">{found} / {level.requiredDifferences}</span>
            </div>
            <div className="flex gap-[7px]">
              {Array.from({ length: level.requiredDifferences }).map((_, i) => {
                const isDone = i < found;
                return (
                  <span
                    key={i}
                    className="flex h-[26px] flex-1 items-center justify-center rounded-[7px]"
                    style={{
                      background: isDone ? "#d8af63" : "rgba(208,94,74,.1)",
                      border: isDone ? "none" : "1.5px solid rgba(224,138,120,.5)"
                    }}
                  >
                    {isDone ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a130a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e08a78" strokeWidth="3" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          <button
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-[9px] rounded-[10px] border-none py-[17px] text-[16px] font-bold text-[#1a130a]"
            style={{
              background: "linear-gradient(180deg, #d8af63, #b3812f)",
              boxShadow: "0 12px 28px rgba(184,138,69,.32), inset 0 1px 0 rgba(255,255,255,.3)"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a130a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {t("game.retryAgain")}
          </button>

          <div className="mt-[11px] flex gap-[11px]">
            <button
              onClick={onExtend}
              disabled={!canExtend}
              className="flex flex-1 items-center justify-center gap-[7px] rounded-[10px] py-3 text-[13.5px] font-semibold disabled:opacity-40"
              style={{ border: "1px solid rgba(184,138,69,.4)", background: "rgba(184,138,69,.08)", color: "#d8af63" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 8v5l3 1.5" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              {t("game.extendTime")}
            </button>
            <button
              onClick={onMap}
              className="flex-1 rounded-[10px] border border-exp-parch/[.14] bg-transparent py-3 text-[13.5px] font-semibold text-exp-parch"
            >
              {t("game.toMap")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
