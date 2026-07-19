import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { ComparatorScheme } from "@/entities/save/schema";
import { useGameStore } from "@/shared/store/gameStore";

function SliderIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M12 3v18" />
      <path d="M8.5 10l-2 2 2 2M15.5 10l2 2-2 2" />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="13" height="10" rx="2" />
      <rect x="8" y="10" width="13" height="10" rx="2" />
      <path d="M6 20.5c-1.8-.4-3-1.2-3-2.5M18 3.5c1.8.4 3 1.2 3 2.5" />
    </svg>
  );
}

function SchemeCard({
  scheme,
  title,
  description,
  icon,
  onSelect,
}: {
  scheme: ComparatorScheme;
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: (scheme: ComparatorScheme) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(scheme)}
      className="control-scheme-card flex min-h-[44px] flex-1 flex-col items-center gap-2 rounded-[12px] px-4 py-4 text-center transition hover:brightness-110 active:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
      style={{
        border: "1px solid rgba(184,138,69,.4)",
        background:
          "linear-gradient(180deg, rgba(184,138,69,.12), rgba(21,27,24,.4))",
      }}
    >
      <span className="text-exp-brass" aria-hidden="true">
        {icon}
      </span>
      <span className="font-manrope text-[14px] font-bold text-exp-parch">
        {title}
      </span>
      <span className="text-[11px] font-medium leading-snug text-exp-muted">
        {description}
      </span>
    </button>
  );
}

export function ControlSchemeModal() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();
  const setComparatorScheme = useGameStore((s) => s.setComparatorScheme);

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      className="fixed inset-0 z-[130] flex items-center justify-center"
      style={{
        paddingTop: "max(10px, env(safe-area-inset-top))",
        paddingRight: "max(10px, env(safe-area-inset-right))",
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        paddingLeft: "max(10px, env(safe-area-inset-left))",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(13,18,15,.5), rgba(13,18,15,.85))",
          backdropFilter: "blur(3px) brightness(.5)",
        }}
      />

      {/* Panel */}
      <motion.div
        className="control-scheme-dialog relative flex w-full max-w-[620px] flex-col overflow-y-auto rounded-2xl"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.32,
          ease: [0.2, 0.8, 0.3, 1.05],
        }}
        style={{
          maxHeight: "calc(100dvh - 20px)",
          background: "linear-gradient(180deg, #27302b, #1d251f)",
          border: "1px solid rgba(184,138,69,.35)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(213,195,154,.08)",
        }}
      >
        {/* Top gold accent line */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-[3px]"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, transparent, #d8af63, transparent)",
          }}
        />

        <div className="px-6 pb-5 pt-5 sm:px-7">
          <p className="text-[10px] font-bold uppercase tracking-[.32em] text-exp-brass">
            {t("controlScheme.eyebrow")}
          </p>
          <h2
            id={titleId}
            className="mt-1 font-cormorant text-[26px] font-semibold leading-none text-exp-parch"
          >
            {t("controlScheme.title")}
          </h2>

          <div className="mt-4 flex gap-3">
            <SchemeCard
              scheme="slider"
              title={t("controlScheme.sliderTitle")}
              description={t("controlScheme.sliderDescription")}
              icon={<SliderIcon />}
              onSelect={setComparatorScheme}
            />
            <SchemeCard
              scheme="flip"
              title={t("controlScheme.flipTitle")}
              description={t("controlScheme.flipDescription")}
              icon={<FlipIcon />}
              onSelect={setComparatorScheme}
            />
          </div>

          <p
            className="mt-4 text-center text-[11px] font-medium"
            style={{ color: "rgba(135,144,135,.85)" }}
          >
            {t("controlScheme.changeLaterHint")}
          </p>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
