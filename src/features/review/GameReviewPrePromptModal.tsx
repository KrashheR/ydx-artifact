import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

type GameReviewPrePromptModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onReview: () => void;
  onLater: () => void;
  onClose: () => void;
};

function CompassMedallion() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full sm:h-[66px] sm:w-[66px]"
      style={{
        background: "radial-gradient(circle at 40% 35%, #caa05a, #7e5b2a 72%)",
        boxShadow: "0 10px 28px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,236,196,.35)",
        border: "1px solid rgba(255,236,196,.4)"
      }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.2" stroke="#2a1d0c" strokeWidth="1.4" />
        <path d="M12 4.8 14.4 12 12 19.2 9.6 12 12 4.8Z" fill="#2a1d0c" />
        <path d="M12 6.2 13.6 12 12 16.8 10.4 12 12 6.2Z" fill="#f0d39c" />
      </svg>
    </div>
  );
}

export function GameReviewPrePromptModal({
  isOpen,
  isSubmitting,
  onReview,
  onLater,
  onClose
}: GameReviewPrePromptModalProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const reviewButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusTarget = window.setTimeout(() => {
      reviewButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isSubmitting) onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTarget);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, isSubmitting, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          aria-hidden={false}
          className="fixed inset-0 z-[120] flex items-center justify-center"
          style={{
            paddingTop: "max(8px, env(safe-area-inset-top))",
            paddingRight: "max(8px, env(safe-area-inset-right))",
            paddingBottom: "max(8px, env(safe-area-inset-bottom))",
            paddingLeft: "max(8px, env(safe-area-inset-left))"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
        >
          <div
            className="absolute inset-0"
            onClick={isSubmitting ? undefined : onClose}
            style={{
              background:
                "radial-gradient(ellipse at center,rgba(13,18,15,.5),rgba(13,18,15,.85))",
              backdropFilter: "blur(3px) brightness(.5)"
            }}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={`${descriptionId} ${descriptionId}-desktop`}
            className="modal-panel review-dialog relative w-full max-w-[520px] overflow-hidden rounded-[20px] sm:rounded-[16px]"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "linear-gradient(180deg,#27302b,#1d251f)",
              border: "1px solid rgba(184,138,69,.35)",
              boxShadow: "0 50px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(213,195,154,.08)"
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,.35) 0, transparent 18%), radial-gradient(circle at 80% 30%, rgba(255,255,255,.2) 0, transparent 16%)",
                mixBlendMode: "overlay"
              }}
            />
            <div
              aria-hidden="true"
              className="h-[3px]"
              style={{ background: "linear-gradient(90deg, transparent, #d8af63, transparent)" }}
            />

            <button
              type="button"
              aria-label={t("reviewPrompt.closeLabel")}
              disabled={isSubmitting}
              onClick={onClose}
              className="absolute top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                insetInlineEnd: "16px",
                border: "1px solid rgba(213,195,154,.16)",
                color: "#D5C39A",
                boxShadow: "0 0 0 3px rgba(21,27,24,0)"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <div className="review-dialog-content px-6 pb-[26px] pt-[30px] text-center sm:px-[46px] sm:pb-[34px] sm:pt-[42px]">
              <CompassMedallion />

              <div
                className="mx-auto mt-5 inline-flex max-w-full -rotate-[1.4deg] items-center rounded-full px-4 py-1 text-[9px] font-bold uppercase tracking-[0.26em] sm:text-[10.5px]"
                style={{
                  color: "#B88A45",
                  border: "1px solid rgba(184,138,69,.5)",
                  background: "rgba(184,138,69,.08)"
                }}
              >
                {t("reviewPrompt.eyebrow")}
              </div>

              <h2
                id={titleId}
                className="mt-4 font-cormorant text-[28px] font-semibold leading-tight text-exp-parch sm:text-[36px]"
              >
                {t("reviewPrompt.title")}
              </h2>

              <p
                id={descriptionId}
                className="mx-auto mt-3 max-w-[400px] text-[13px] leading-[1.7] text-exp-muted sm:hidden"
              >
                {t("reviewPrompt.mobileDescription")}
              </p>
              <p
                id={`${descriptionId}-desktop`}
                className="mx-auto mt-3 hidden max-w-[400px] text-[14.5px] leading-[1.6] text-exp-muted sm:block"
              >
                {t("reviewPrompt.description")}
              </p>

              <div className="review-actions mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  ref={reviewButtonRef}
                  type="button"
                  onClick={onReview}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-[9px] px-4 text-[15px] font-bold text-[#1A130A] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background: "linear-gradient(180deg,#D8AF63,#B3812F)",
                    boxShadow: "0 12px 28px rgba(184,138,69,.32), inset 0 1px 0 rgba(255,255,255,.3)"
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="8" stroke="rgba(26,19,10,.25)" strokeWidth="2" />
                        <path d="M20 12a8 8 0 0 0-8-8" stroke="#1A130A" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      {t("reviewPrompt.loadingAction")}
                    </>
                  ) : (
                    <>
                      {t("reviewPrompt.reviewAction")}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M14 5h5v5M10 14 19 5M19 13v6H5V5h6" stroke="#1A130A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onLater}
                  disabled={isSubmitting}
                  className="min-h-[50px] flex-1 rounded-[9px] border px-4 text-[14px] font-semibold text-exp-parch transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[52px]"
                  style={{
                    borderColor: "rgba(213,195,154,.16)",
                    background: "transparent"
                  }}
                >
                  {t("reviewPrompt.laterAction")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
