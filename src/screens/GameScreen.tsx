import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getChapter, getLevelById } from "@/content/chapters";
import { PhotoComparator } from "@/features/gameplay/PhotoComparator";
import { LevelCompleteOverlay } from "@/features/gameplay/LevelCompleteOverlay";
import { LevelFailedOverlay } from "@/features/gameplay/LevelFailedOverlay";
import { mockPlatform } from "@/services/platform/mockPlatform";
import {
  getIsPlatformPaused,
  setGameplayActive,
  subscribePlatformPause,
} from "@/services/platform/platformLifecycle";
import { useGameStore } from "@/shared/store/gameStore";

const TIME_LIMIT = 300; // 5 minutes
const COMPLETE_OVERLAY_DELAY_MS = 200;
const DEBUG_LAYOUT_MODE = import.meta.env.VITE_LAYOUT_DEBUG === "true";
const FINAL_VALIDATE_MODE = import.meta.env.VITE_FINAL_VALIDATE === "true";
const noop = () => undefined;

function formatTime(s: number) {
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function SettingsGearIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function GameScreen({
  levelId,
  mode,
  onOpenSettings = noop,
}: {
  levelId: string;
  mode: "campaign" | "daily";
  onOpenSettings?: () => void;
}) {
  const { t } = useTranslation();

  const saveData = useGameStore((s) => s.saveData);
  const navigate = useGameStore((s) => s.navigate);
  const startLevel = useGameStore((s) => s.startLevel);
  const recordDiff = useGameStore((s) => s.recordDifference);
  const recordMiss = useGameStore((s) => s.recordMisclick);
  const completeLevel = useGameStore((s) => s.completeLevel);
  const spendMagnifiers = useGameStore((s) => s.spendMagnifiers);
  const addActiveLevelTime = useGameStore((s) => s.addActiveLevelTime);
  const save = useGameStore((s) => s.save);
  const claimDailyReward = useGameStore((s) => s.claimDailyReward);
  const resetLevelProgress = useGameStore((s) => s.resetLevelProgress);

  const [timedOut, setTimedOut] = useState(false);
  const [platformPaused, setPlatformPaused] = useState(getIsPlatformPaused);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [hintId, setHintId] = useState<string | undefined>();
  const [rewardedHintInFlight, setRewardedHintInFlight] = useState(false);
  const [pendingFinalStats, setPendingFinalStats] = useState<{
    found: number;
    mistakes: number;
    elapsed: number;
  } | null>(null);
  const [finalStats, setFinalStats] = useState<{
    found: number;
    mistakes: number;
    elapsed: number;
  } | null>(null);
  const completeOverlayDelayRef = useRef<number | null>(null);
  const activeTimerSaveCounterRef = useRef(0);

  const level = getLevelById(levelId);
  const chapter = level ? getChapter(level.chapterId) : null;

  const liveFoundIds =
    saveData.inProgress?.levelId === levelId
      ? saveData.inProgress.foundDifferenceIds
      : [];
  const liveMistakes =
    saveData.inProgress?.levelId === levelId ? saveData.inProgress.mistakes : 0;
  const liveElapsedActiveSeconds =
    saveData.inProgress?.levelId === levelId
      ? saveData.inProgress.elapsedActiveSeconds
      : 0;
  const timeLeft = Math.max(0, TIME_LIMIT - liveElapsedActiveSeconds);
  const completionPending = pendingFinalStats !== null;
  const showComplete = finalStats !== null;
  const showOverlay = showComplete || timedOut;
  const gameplayBlocked =
    platformPaused ||
    !pageVisible ||
    rewardedHintInFlight ||
    showComplete ||
    completionPending ||
    timedOut;

  useEffect(() => subscribePlatformPause(setPlatformPaused), []);

  useEffect(() => {
    const syncVisibility = () => {
      setPageVisible(!document.hidden);
      void save({ flush: true });
    };
    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("pagehide", syncVisibility);
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("pagehide", syncVisibility);
    };
  }, [save]);

  useEffect(() => {
    setGameplayActive(!gameplayBlocked);
    return () => setGameplayActive(false);
  }, [gameplayBlocked]);

  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    window.addEventListener("contextmenu", preventContextMenu);
    return () => window.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  // Active gameplay timer.
  useEffect(() => {
    if (gameplayBlocked) return;
    const id = window.setInterval(() => {
      activeTimerSaveCounterRef.current += 1;
      addActiveLevelTime(levelId, 1, {
        save: activeTimerSaveCounterRef.current % 5 === 0,
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [addActiveLevelTime, gameplayBlocked, levelId]);

  // Detect timeout
  useEffect(() => {
    if (timeLeft === 0 && !showComplete && !completionPending)
      setTimedOut(true);
  }, [timeLeft, showComplete, completionPending]);

  useEffect(() => {
    return () => {
      if (completeOverlayDelayRef.current !== null) {
        window.clearTimeout(completeOverlayDelayRef.current);
      }
    };
  }, []);

  if (!level || !chapter) return null;

  const nextLevel =
    chapter.levels.find((l) => l.order === level.order + 1) ?? null;
  const magnifiers = saveData.magnifiers;
  const displayFoundIds = showComplete
    ? level.differences.map((d) => d.id)
    : liveFoundIds;
  const activeHintIsUnfound =
    hintId !== undefined && !liveFoundIds.includes(hintId);
  const accuracyPct = Math.round(
    (liveFoundIds.length / Math.max(liveFoundIds.length + liveMistakes, 1)) *
      100,
  );
  const chapterId = level.chapterId;

  function handleDifference(differenceId: string) {
    if (completionPending || showComplete || timedOut || platformPaused) return;
    if (hintId === differenceId) setHintId(undefined);
    recordDiff(levelId, differenceId);
    const nextFound = liveFoundIds.length + 1;
    if (nextFound >= level!.requiredDifferences && !finalStats) {
      const elapsed = liveElapsedActiveSeconds;
      const stats = { found: nextFound, mistakes: liveMistakes, elapsed };
      setPendingFinalStats(stats);
      completeOverlayDelayRef.current = window.setTimeout(() => {
        setPendingFinalStats(null);
        setFinalStats(stats);
        completeLevel(levelId, elapsed, mode);
        if (mode === "daily")
          claimDailyReward(new Date().toISOString().slice(0, 10));
        completeOverlayDelayRef.current = null;
      }, COMPLETE_OVERLAY_DELAY_MS);
    }
  }

  function revealNextAreaHint({
    spendMagnifier,
    skipActiveHint,
  }: {
    spendMagnifier: boolean;
    skipActiveHint: boolean;
  }) {
    if (showComplete || completionPending) return;
    if (activeHintIsUnfound && !skipActiveHint) return;
    const next = level!.differences.find(
      (d) =>
        !liveFoundIds.includes(d.id) && (!skipActiveHint || d.id !== hintId),
    );
    if (!next) return;
    if (spendMagnifier && !spendMagnifiers(1)) return;
    setHintId(next.id);
  }

  async function handleAreaHint() {
    if (
      showComplete ||
      completionPending ||
      rewardedHintInFlight ||
      platformPaused
    )
      return;
    if (magnifiers > 0) {
      revealNextAreaHint({ spendMagnifier: true, skipActiveHint: false });
      return;
    }

    const confirmed = window.confirm(t("game.rewardedHintConfirm"));
    if (!confirmed) return;
    void save({ flush: true });
    setRewardedHintInFlight(true);
    try {
      const result = await mockPlatform.showRewarded();
      if (result === "rewarded") {
        revealNextAreaHint({ spendMagnifier: false, skipActiveHint: true });
      } else if (result === "failed") {
        window.alert(t("game.rewardedHintFailed"));
      }
    } finally {
      setRewardedHintInFlight(false);
    }
  }

  function handleRetry() {
    if (completeOverlayDelayRef.current !== null) {
      window.clearTimeout(completeOverlayDelayRef.current);
      completeOverlayDelayRef.current = null;
    }
    resetLevelProgress(levelId);
    setPendingFinalStats(null);
    setFinalStats(null);
    setTimedOut(false);
    setHintId(undefined);
  }

  function handleNext() {
    if (nextLevel) startLevel(nextLevel.id, "campaign");
  }

  function handleMap() {
    if (completionPending) return;
    void save({ flush: true });
    navigate({ kind: "map", chapterId });
  }

  function handleExtendTime() {
    if (!spendMagnifiers(2)) return;
    setTimedOut(false);
    addActiveLevelTime(levelId, -30, { save: true, flush: true });
  }

  const campaignTitle = t(chapter.titleKey).toUpperCase();
  const hasRewardedAreaHintTarget = level.differences.some(
    (d) => !liveFoundIds.includes(d.id) && d.id !== hintId,
  );
  const canUseAreaHint =
    !showComplete &&
    !completionPending &&
    !rewardedHintInFlight &&
    liveFoundIds.length < level.requiredDifferences &&
    (magnifiers > 0 ? !activeHintIsUnfound : hasRewardedAreaHintTarget);

  return (
    <div className="game-screen fixed inset-0 flex flex-col overflow-hidden bg-exp-bg font-manrope text-exp-parch">
      {/* ── Game content (blurred when overlay active) ─────────────────── */}
      <div
        className="flex flex-1 flex-col"
        style={
          showOverlay
            ? { filter: "blur(4px) brightness(0.42)", pointerEvents: "none" }
            : undefined
        }
      >
        {/* ── TOP HUD ──────────────────────────────────────────────────── */}
        <header
          className="app-screen-topbar game-hud relative flex shrink-0 items-center justify-between gap-2 pl-[30px] pr-[86px]"
          style={{
            minHeight: "78px",
            paddingLeft: "max(40px, calc(40px + env(safe-area-inset-left)))",
            paddingRight: "max(40px, calc(40px + env(safe-area-inset-right)))",
            paddingTop: "max(0px, env(safe-area-inset-top))",
            borderBottom: "1px solid rgba(213,195,154,.12)",
            background:
              "linear-gradient(180deg, rgba(34,42,37,.92), rgba(21,27,24,.4))",
          }}
        >
          {/* Left: back + title */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleMap}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-[9px] text-exp-parch"
              style={{
                border: "1px solid rgba(213,195,154,.14)",
                background: "rgba(213,195,154,.05)",
              }}
              aria-label={t("actions.back")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div
              style={{
                width: "1px",
                height: "32px",
                background: "rgba(213,195,154,.12)",
              }}
            />
            <div className="hidden sm:block">
              <div className="font-manrope text-[10px] font-bold tracking-[.22em] text-exp-brass">
                {t("game.levelBadge", {
                  campaign: campaignTitle,
                  current: level.order,
                  total: chapter.levels.length,
                })}
              </div>
              <div className="font-cormorant text-[22px] font-semibold leading-tight tracking-[.01em] text-exp-parch">
                {t(level.titleKey)}
              </div>
            </div>
          </div>

          {/* Center: timer + found counter */}
          <div className="flex items-center gap-[14px]">
            {/* Timer */}
            <div
              className="flex h-[48px] items-center gap-[9px] rounded-[11px] px-[18px]"
              style={{
                border: "1px solid rgba(213,195,154,.14)",
                background: "rgba(21,27,24,.6)",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#879087"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 2" strokeLinecap="round" />
                <path d="M9 2h6" strokeLinecap="round" />
              </svg>
              <span
                className="font-jetbrains text-[16px] font-semibold tracking-[.04em] sm:text-[22px]"
                style={{ color: timeLeft <= 30 ? "#e08a78" : "#D5C39A" }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Found counter */}
            <div
              className="flex h-[48px] items-center gap-[11px] rounded-[11px] px-5"
              style={{
                border: "1px solid rgba(184,138,69,.4)",
                background:
                  "linear-gradient(180deg, rgba(184,138,69,.16), rgba(184,138,69,.05))",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d8af63"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <div className="flex items-baseline gap-0.5">
                <span className="font-manrope text-[24px] font-bold text-exp-brass2 md:text-[17px]">
                  {liveFoundIds.length}
                </span>
                <span
                  className="font-manrope text-[15px] font-semibold"
                  style={{ color: "rgba(213,195,154,.5)" }}
                >
                  / {level.requiredDifferences}
                </span>
              </div>
              <span className="hidden font-manrope text-[10.5px] font-semibold tracking-[.12em] text-exp-muted sm:block md:text-[12px]">
                {t("game.diffCount")}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-[10px]">
            <button
              onClick={handleAreaHint}
              disabled={!canUseAreaHint}
              className="flex min-h-[44px] items-center gap-2 rounded-[9px] px-4 font-manrope text-[13px] font-bold text-exp-brass2 disabled:opacity-40"
              style={{
                border: "1px solid rgba(184,138,69,.45)",
                background: "rgba(184,138,69,.08)",
              }}
              aria-busy={rewardedHintInFlight}
              aria-label={
                magnifiers > 0
                  ? t("game.hintLabel")
                  : t("game.rewardedHintLabel")
              }
              title={
                magnifiers > 0
                  ? t("game.hintLabel")
                  : t("game.rewardedHintLabel")
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18h6M10 21h4" />
                <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z" />
              </svg>
              <span className="hidden sm:inline">
                {magnifiers > 0
                  ? t("game.hintLabel")
                  : t("game.rewardedHintShort")}
              </span>
              {magnifiers > 0 ? (
                <span
                  className="inline-flex min-w-[20px] items-center justify-center rounded-[6px] px-[5px] font-manrope text-[11px] font-bold text-[#1a130a]"
                  style={{ height: "20px", background: "#d8af63" }}
                >
                  {magnifiers}
                </span>
              ) : (
                <span
                  className="inline-flex h-[20px] w-[24px] items-center justify-center rounded-[6px] text-[#1a130a]"
                  style={{ background: "#d8af63" }}
                  aria-hidden="true"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path
                      d="m10 9 5 3-5 3V9Z"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="app-settings-button app-settings-button--game flex h-[44px] w-[44px] items-center justify-center rounded-[9px] text-exp-parch transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
              style={{
                border: "1px solid rgba(213,195,154,.14)",
                background: "rgba(213,195,154,.05)",
              }}
              aria-label={t("actions.settings")}
              title={t("actions.settings")}
            >
              <SettingsGearIcon />
            </button>

          </div>
        </header>

        {/* ── MOBILE COMPACT HUD ──────────────────────────────────────── */}
        <div
          className="game-mobile-title flex shrink-0 items-center justify-between px-4 pb-[10px] pt-[6px] sm:hidden"
          style={{ borderBottom: "1px solid rgba(213,195,154,.08)" }}
        >
          <div className="min-w-0 flex-1 text-center">
            <div className="font-manrope text-[8.5px] font-bold tracking-[.16em] text-exp-brass">
              {t(chapter.titleKey)} · {t("actions.map")} {level.order}
            </div>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap font-cormorant text-[16px] font-semibold text-exp-parch">
              {t(level.titleKey)}
            </div>
          </div>
        </div>

        {/* Mobile found row */}
        <div className="game-mobile-found flex shrink-0 items-center justify-between px-4 pb-[10px] sm:hidden">
          <div className="flex items-center gap-2">
            <span className="font-manrope text-[19px] font-bold text-exp-brass2">
              {liveFoundIds.length}
            </span>
            <span
              className="font-manrope text-[13px] font-semibold"
              style={{ color: "rgba(213,195,154,.5)" }}
            >
              / {level.requiredDifferences}
            </span>
            <span className="font-manrope text-[9px] font-semibold tracking-[.12em] text-exp-muted">
              {t("game.diffCount")}
            </span>
          </div>
          <div className="flex gap-[5px]">
            {Array.from({ length: level.requiredDifferences }).map((_, i) => (
              <span
                key={i}
                className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px]"
                style={
                  i < liveFoundIds.length
                    ? { background: "#d8af63" }
                    : { border: "1px dashed rgba(213,195,154,.28)" }
                }
              >
                {i < liveFoundIds.length && (
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1a130a"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ── PLAY AREA ──────────────────────────────────────────────── */}
        <div className="game-play-area flex flex-1 overflow-hidden px-4 pb-0 pt-3 sm:px-[30px] sm:pt-[26px]">
          <PhotoComparator
            level={level}
            foundIds={displayFoundIds}
            hintId={hintId}
            onDifference={handleDifference}
            onMisclick={() => {
              if (!completionPending && !platformPaused) recordMiss(levelId);
            }}
            labelA={t("game.labelOriginal")}
            labelB={t("game.labelCopy")}
            debugShowAllDifferences={DEBUG_LAYOUT_MODE || FINAL_VALIDATE_MODE}
            debugUseMarkupReference={DEBUG_LAYOUT_MODE}
            debugEnableHitboxEditor={DEBUG_LAYOUT_MODE || FINAL_VALIDATE_MODE}
          />
        </div>

        {/* ── BOTTOM TRACKER ─────────────────────────────────────────── */}
        <footer
          className="game-footer hidden shrink-0 items-center justify-between px-[30px] sm:flex"
          style={{
            height: "74px",
            borderTop: "1px solid rgba(213,195,154,.12)",
            background:
              "linear-gradient(0deg, rgba(34,42,37,.9), rgba(21,27,24,.3))",
          }}
        >
          {/* Found squares */}
          <div className="flex items-center gap-[14px]">
            <span className="font-manrope text-[10.5px] font-semibold tracking-[.16em] text-exp-muted">
              {t("game.foundLabel")}
            </span>
            <div className="flex gap-2">
              {Array.from({ length: level.requiredDifferences }).map((_, i) => (
                <span
                  key={i}
                  className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px]"
                  style={
                    i < liveFoundIds.length
                      ? { background: "#d8af63" }
                      : {
                          border: "1px dashed rgba(213,195,154,.25)",
                          background: "rgba(213,195,154,.04)",
                        }
                  }
                >
                  {i < liveFoundIds.length && (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1a130a"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Accuracy + mistakes */}
          <div className="flex items-center gap-[22px]">
            <div className="flex items-center gap-[9px]">
              <span className="font-manrope text-[10.5px] font-semibold tracking-[.14em] text-exp-muted">
                {t("game.accuracyLabel")}
              </span>
              <div
                className="h-[6px] w-[120px] overflow-hidden rounded-[3px]"
                style={{ background: "rgba(213,195,154,.12)" }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${accuracyPct}%`,
                    background: "linear-gradient(90deg, #6fc69e, #2F6A57)",
                    transition: "width .3s",
                  }}
                />
              </div>
              <span className="font-manrope text-[12px] font-bold text-exp-success">
                {accuracyPct}%
              </span>
            </div>
            {liveMistakes > 0 && (
              <div className="flex items-center gap-[7px]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#e08a78"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
                <span className="font-manrope text-[12px] text-exp-muted">
                  {liveMistakes}{" "}
                  {t("game.mistakes", { count: liveMistakes }).toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* ── OVERLAYS ─────────────────────────────────────────────────────── */}
      {showComplete && finalStats && (
        <LevelCompleteOverlay
          level={level}
          chapter={chapter}
          found={finalStats.found}
          required={level.requiredDifferences}
          mistakes={finalStats.mistakes}
          elapsedSeconds={finalStats.elapsed}
          completedLevelIds={saveData.completedLevels}
          nextLevelOrder={nextLevel?.order}
          nextLevelTitle={nextLevel ? t(nextLevel.titleKey) : undefined}
          onNext={nextLevel ? handleNext : null}
          onRetry={handleRetry}
          onMap={handleMap}
        />
      )}

      {timedOut && !showComplete && (
        <LevelFailedOverlay
          level={level}
          found={liveFoundIds.length}
          canExtend={magnifiers >= 2}
          onRetry={handleRetry}
          onExtend={handleExtendTime}
          onMap={handleMap}
        />
      )}
    </div>
  );
}
