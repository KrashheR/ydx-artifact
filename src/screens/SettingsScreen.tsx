import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useGameStore } from "@/shared/store/gameStore";

const LANGS = [
  { code: "ru" as const, native: "Русский", english: "Russian" },
  { code: "en" as const, native: "English", english: "English" },
] as const;

type Props = { isOpen: boolean; onClose: () => void };

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#879087" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9.3" />
      <path d="M3 12h18M12 2.7c2.6 2.5 4 5.8 4 9.3s-1.4 6.8-4 9.3c-2.6-2.5-4-5.8-4-9.3s1.4-6.8 4-9.3Z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2a1d0c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7L17 17M7 7L5.3 5.3" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a130a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function SettingsModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const locale = useGameStore((s) => s.saveData.settings.locale);
  const setLocale = useGameStore((s) => s.setLocale);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const els = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex=\"-1\"])"
        )
      );
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) {
        e.preventDefault();
        els[els.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === els[els.length - 1]) {
        e.preventDefault();
        els[0].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal
          aria-labelledby={titleId}
          className="fixed inset-0 z-[120] flex items-end sm:items-center sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            onClick={onClose}
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(13,18,15,.5), rgba(13,18,15,.85))",
              backdropFilter: "blur(3px) brightness(.5)",
            }}
          />

          {/* Panel */}
          <motion.div
            ref={dialogRef}
            className="relative flex w-full flex-col overflow-hidden sm:mx-auto sm:max-w-[560px] sm:rounded-2xl"
            initial={prefersReducedMotion ? { opacity: 0 } : { y: "100%" }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: [0.2, 0.8, 0.3, 1.05] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, #27302b, #1d251f)",
              border: "1px solid rgba(184,138,69,.35)",
              borderBottom: "none",
              borderRadius: "16px 16px 0 0",
              boxShadow:
                "0 -20px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(213,195,154,.08)",
            }}
          >
            {/* Top gold accent line */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-0 h-[3px]"
              aria-hidden="true"
              style={{
                background: "linear-gradient(90deg, transparent, #d8af63, transparent)",
              }}
            />

            {/* Mobile drag handle */}
            <div
              className="mx-auto mt-3 h-1 w-10 flex-shrink-0 rounded-full sm:hidden"
              aria-hidden="true"
              style={{ background: "rgba(213,195,154,.25)" }}
            />

            {/* Header */}
            <div
              className="flex flex-shrink-0 items-center gap-3.5 px-7 pb-5 pt-4 sm:pb-[22px] sm:pt-[26px]"
              style={{ borderBottom: "1px solid rgba(213,195,154,.1)" }}
            >
              <div
                aria-hidden="true"
                className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 38% 32%, #caa05a, #7e5b2a 72%)",
                  border: "2px solid rgba(255,236,196,.4)",
                  boxShadow:
                    "0 10px 24px rgba(0,0,0,.5), inset 0 2px 6px rgba(255,236,196,.4)",
                }}
              >
                <GearIcon />
              </div>

              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[.32em] text-exp-brass">
                  {t("settings.eyebrow")}
                </p>
                <h2
                  id={titleId}
                  className="mt-0.5 font-cormorant text-[30px] font-semibold leading-none text-exp-parch"
                >
                  {t("actions.settings")}
                </h2>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={t("settings.closeLabel")}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-exp-muted transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
                style={{
                  border: "1px solid rgba(213,195,154,.14)",
                  background: "rgba(213,195,154,.04)",
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Language section label */}
            <div className="flex flex-shrink-0 items-center gap-2.5 px-7 pb-2 pt-5">
              <GlobeIcon />
              <span className="text-[11px] font-bold uppercase tracking-[.2em] text-exp-muted">
                {t("settings.languageSection")}
              </span>
              <div
                className="h-px flex-1"
                aria-hidden="true"
                style={{ background: "rgba(213,195,154,.1)" }}
              />
              <span className="hidden text-[10px] font-semibold tracking-[.06em] text-exp-brass sm:block">
                {t(`language.${locale}`)}
              </span>
            </div>

            {/* Language list */}
            <div
              className="flex-1 overflow-y-auto px-[22px] pb-1.5 pt-2 sm:max-h-[368px] sm:flex-none"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(184,138,69,.4) rgba(213,195,154,.05)",
              }}
            >
              {LANGS.map((lang) => {
                const selected = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLocale(lang.code)}
                    className="relative mb-1.5 flex w-full items-center gap-3.5 rounded-[10px] px-4 py-3.5 text-left transition hover:brightness-110 active:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
                    style={{
                      border: selected
                        ? "1.5px solid rgba(184,138,69,.6)"
                        : "1px solid rgba(213,195,154,.08)",
                      background: selected
                        ? "linear-gradient(180deg, rgba(184,138,69,.16), rgba(184,138,69,.05))"
                        : "rgba(21,27,24,.3)",
                    }}
                  >
                    {selected && (
                      <>
                        <div
                          className="pointer-events-none absolute bottom-3.5 left-0 top-3.5 w-[3px] rounded-r-[3px]"
                          aria-hidden="true"
                          style={{
                            background: "linear-gradient(180deg, #d8af63, #a9762f)",
                          }}
                        />
                        <div
                          className="pointer-events-none absolute inset-0 rounded-[10px]"
                          aria-hidden="true"
                          style={{ boxShadow: "0 0 0 1px rgba(184,138,69,.12)" }}
                        />
                      </>
                    )}

                    <span
                      className="relative w-7 flex-shrink-0 font-jetbrains text-[11px] font-semibold uppercase leading-none text-exp-brass"
                      style={{ letterSpacing: ".04em" }}
                    >
                      {lang.code.toUpperCase()}
                    </span>

                    <span className="relative flex-1">
                      <span className="block text-[15px] font-semibold leading-snug text-exp-parch">
                        {lang.native}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-medium text-exp-muted">
                        {lang.english}
                      </span>
                    </span>

                    <span
                      className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                      aria-hidden="true"
                      style={
                        selected
                          ? {
                              background:
                                "linear-gradient(180deg, #d8af63, #b3812f)",
                              boxShadow: "0 4px 10px rgba(184,138,69,.4)",
                            }
                          : {
                              border: "1.5px solid rgba(213,195,154,.16)",
                            }
                      }
                    >
                      {selected && <CheckmarkIcon />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="flex flex-shrink-0 items-center justify-between gap-4 px-7 pb-8 pt-4 sm:pb-6"
              style={{ borderTop: "1px solid rgba(213,195,154,.1)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-[5px] w-[5px] rounded-full"
                  aria-hidden="true"
                  style={{
                    background: "#6fc69e",
                    boxShadow: "0 0 8px #6fc69e",
                    animation: "pulse-dot 2.6s ease-in-out infinite",
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: "rgba(135,144,135,.8)" }}
                >
                  {t("settings.savedToProfile")}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-[46px] rounded-[9px] px-7 text-[14px] font-bold text-[#1a130a] transition hover:brightness-105 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass sm:px-[30px]"
                style={{
                  background: "linear-gradient(180deg, #d8af63, #b3812f)",
                  boxShadow:
                    "0 10px 24px rgba(184,138,69,.3), inset 0 1px 0 rgba(255,255,255,.3)",
                }}
              >
                {t("settings.done")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
