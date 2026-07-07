import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getChapter, getLevelById } from "@/content/chapters";
import { dailyArchiveLevels } from "@/content/dailyArchive";
import { PhotoComparator } from "@/features/gameplay/PhotoComparator";
import { ArtifactFoundToast, type ArtifactToastVariant } from "@/features/gameplay/ArtifactFoundToast";
import { ArtifactRevealOverlay } from "@/features/collection/ArtifactRevealOverlay";
import { CampaignCaseReportModal } from "@/features/campaign-report/CampaignCaseReportModal";
import { LevelCompleteOverlay } from "@/features/gameplay/LevelCompleteOverlay";
import { LevelFailedOverlay } from "@/features/gameplay/LevelFailedOverlay";
import { getArtifactById } from "@/content/artifacts";
import { getArtifactForLevel } from "@/shared/lib/progression";
import { GameReviewPrePromptModal } from "@/features/review/GameReviewPrePromptModal";
import { runNativeReviewFlow } from "@/features/review/reviewFlow";
import { isReviewPrePromptLocallyEligible } from "@/features/review/reviewPrompt";
import { trackAnalyticsEvent } from "@/services/analytics/analytics";
import { mockPlatform } from "@/services/platform/mockPlatform";
import {
  getIsPlatformPaused,
  setGameplayActive,
  subscribePlatformPause,
} from "@/services/platform/platformLifecycle";
import { preloadImages } from "@/shared/lib/imagePreload";
import { useGameStore } from "@/shared/store/gameStore";
import { getNextCampaignReportChapterId } from "@/data/campaignReports";

const TIME_LIMIT = 300; // 5 minutes
const COMPLETE_OVERLAY_DELAY_MS = 200;
const HINT_PIP_COUNT = 5;
const DEBUG_LAYOUT_MODE = import.meta.env.VITE_LAYOUT_DEBUG === "true";
const FINAL_VALIDATE_MODE = import.meta.env.VITE_FINAL_VALIDATE === "true";
const ARCHIVE_VALIDATE_MODE = import.meta.env.VITE_ARCHIVE_VALIDATE === "true";
const noop = () => undefined;

function getDeviceType() {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1280) return "tablet";
  return "desktop";
}

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

function RewardedHintModal({
  failed,
  loading,
  backgroundSrc,
  onClose,
  onWatch,
}: {
  failed: boolean;
  loading: boolean;
  backgroundSrc: string;
  onClose: () => void;
  onWatch: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3">
      <img
        src={backgroundSrc}
        alt=""
        className="rewarded-hint-backdrop-image absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        style={{
          background:
            "radial-gradient(80% 80% at 50% 42%, rgba(13,18,15,.58), rgba(13,18,15,.9))",
        }}
        aria-label={t("actions.back")}
        onClick={loading ? undefined : onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rewarded-hint-title"
        className="modal-panel result-dialog rewarded-hint-dialog relative z-10 w-[496px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[22px] font-manrope"
        style={{
          background: "linear-gradient(180deg, #27302b, #1c241e)",
          border: "1px solid rgba(184,138,69,.35)",
          boxShadow:
            "0 50px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(213,195,154,.08)",
          animation: "game-pop .5s cubic-bezier(.2,.8,.3,1.2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, #d8af63, transparent)",
          }}
        />

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-[10px] text-exp-parch transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass disabled:opacity-45"
          style={{
            border: "1px solid rgba(213,195,154,.14)",
            background: "rgba(213,195,154,.05)",
          }}
          aria-label={t("settings.closeLabel")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="relative z-0 px-8 pb-8 pt-11 text-center sm:px-[46px]">
          <div
            className="mx-auto mb-[18px] flex h-[76px] w-[76px] items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 40% 34%, #d8af63, #8e642c 72%)",
              border: "2px dashed rgba(255,236,196,.5)",
              boxShadow:
                "0 14px 36px rgba(0,0,0,.5), 0 0 30px rgba(184,138,69,.32)",
            }}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a130a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18h6M10 21h4" />
              <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z" />
            </svg>
          </div>

          <div className="text-[11px] font-semibold tracking-[.28em] text-exp-brass">
            {t("game.rewardedHintEyebrow")}
          </div>
          <h2
            id="rewarded-hint-title"
            className="mt-2 font-cormorant text-[34px] font-semibold leading-tight text-exp-parch"
          >
            {t("game.rewardedHintTitle")}
          </h2>
          {!failed && (
            <div className="mt-4 inline-flex h-[38px] items-center gap-2 rounded-[11px] border border-[#B88A45]/35 bg-[#B88A45]/10 px-4">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D8AF63"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18h6M10 21h4" />
                <path d="M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.5 1 2.3h6c0-.8.3-1.7 1-2.3A7 7 0 0 0 12 2Z" />
              </svg>
              <span className="text-[14px] font-bold text-exp-brass2">
                {t("game.rewardedHintValue")}
              </span>
              <span className="text-[12px] font-semibold text-exp-muted">
                {t("game.rewardedHintValueScope")}
              </span>
            </div>
          )}
          <p className="mx-auto mt-2.5 max-w-[320px] text-[14px] leading-[1.55] text-exp-muted">
            {failed ? t("game.rewardedHintFailed") : t("game.rewardedHintBody")}
          </p>

          <button
            type="button"
            onClick={onWatch}
            disabled={loading}
            className="mt-7 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[10px] border-none px-5 text-[15px] font-bold text-[#1a130a] disabled:opacity-60"
            style={{
              background: "linear-gradient(180deg, #d8af63, #b3812f)",
              boxShadow:
                "0 12px 28px rgba(184,138,69,.32), inset 0 1px 0 rgba(255,255,255,.3)",
            }}
          >
            {loading
              ? t("game.rewardedHintLoading")
              : t("game.rewardedHintWatch")}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a130a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="m10 9 5 3-5 3V9Z" fill="#1a130a" stroke="none" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mt-2.5 flex min-h-11 w-full items-center justify-center rounded-[11px] bg-transparent px-5 text-[13.5px] font-semibold text-exp-muted transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass disabled:opacity-45"
          >
            {t("game.rewardedHintSkip")}
          </button>
        </div>
      </div>
    </div>
  );
}

function FirstRunOnboardingOverlay({
  title,
  backgroundSrc,
  differencesCount,
  onStart,
}: {
  title: string;
  backgroundSrc: string;
  differencesCount: number;
  onStart: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3">
      <img
        src={backgroundSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 80% at 50% 38%, rgba(13,18,15,.62), rgba(13,18,15,.94))",
        }}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-run-onboarding-title"
        className="relative z-10 w-[520px] max-w-[calc(100vw-32px)] rounded-[18px] border border-[#D5C39A]/18 bg-[#151B18]/92 px-7 py-7 text-center shadow-[0_38px_90px_rgba(0,0,0,.58)] sm:px-9 sm:py-8"
      >
        <p className="text-[10px] font-bold uppercase tracking-[.26em] text-exp-brass">
          {t("game.onboardingEyebrow")}
        </p>
        <h2
          id="first-run-onboarding-title"
          className="mt-2 font-cormorant text-[34px] font-semibold leading-tight text-exp-parch sm:text-[42px]"
        >
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-[360px] text-[16px] leading-[1.55] text-exp-muted">
          {t("game.onboardingDescription", { count: differencesCount })}
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-7 inline-flex min-h-[50px] w-full items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#D8AF63,#B3812F)] px-5 text-[15px] font-bold text-[#1A130A] shadow-[0_12px_28px_rgba(184,138,69,.32)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass sm:w-auto sm:min-w-[240px]"
        >
          {t("game.onboardingStart")}
        </button>
      </section>
    </div>
  );
}

export function GameScreen({
  levelId,
  mode,
  showOnboarding = false,
  onOpenSettings = noop,
}: {
  levelId: string;
  mode: "campaign" | "daily";
  showOnboarding?: boolean;
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
  const resetLevelProgress = useGameStore((s) => s.resetLevelProgress);
  const reviewPromptRuntime = useGameStore((s) => s.reviewPromptRuntime);
  const interstitialRuntime = useGameStore((s) => s.interstitialRuntime);
  const clearPendingReviewPromptCheck = useGameStore(
    (s) => s.clearPendingReviewPromptCheck,
  );
  const clearPendingInterstitialCheck = useGameStore(
    (s) => s.clearPendingInterstitialCheck,
  );
  const setInterstitialNativeRequestInFlight = useGameStore(
    (s) => s.setInterstitialNativeRequestInFlight,
  );
  const setInterstitialResolved = useGameStore((s) => s.setInterstitialResolved);
  const markReviewPromptShown = useGameStore((s) => s.markReviewPromptShown);
  const dismissReviewPrompt = useGameStore((s) => s.dismissReviewPrompt);
  const setReviewNativeRequestInFlight = useGameStore(
    (s) => s.setReviewNativeRequestInFlight,
  );
  const setReviewNativeResolved = useGameStore((s) => s.setReviewNativeResolved);
  const setReviewUnavailableReason = useGameStore(
    (s) => s.setReviewUnavailableReason,
  );
  const artifactRevealQueue = useGameStore((s) => s.artifactRevealQueue);
  const dismissArtifactReveal = useGameStore((s) => s.dismissArtifactReveal);
  const markCampaignReportViewed = useGameStore((s) => s.markCampaignReportViewed);
  const shouldShowCampaignReport = useGameStore((s) => s.shouldShowCampaignReport);
  const getCampaignReportForCompletedCampaign = useGameStore(
    (s) => s.getCampaignReportForCompletedCampaign,
  );

  const [timedOut, setTimedOut] = useState(false);
  const [platformPaused, setPlatformPaused] = useState(getIsPlatformPaused);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [hintId, setHintId] = useState<string | undefined>();
  const [rewardedHintInFlight, setRewardedHintInFlight] = useState(false);
  const [rewardedHintModal, setRewardedHintModal] = useState<
    "offer" | "failed" | null
  >(null);
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
  const [isReviewPromptOpen, setIsReviewPromptOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInterstitialActive, setIsInterstitialActive] = useState(false);
  const [postLevelActionInFlight, setPostLevelActionInFlight] = useState(false);
  const [startupOnboardingOpen, setStartupOnboardingOpen] = useState(showOnboarding);
  const [artifactToast, setArtifactToast] = useState<ArtifactToastVariant | null>(null);
  const artifactToastTimerRef = useRef<number | null>(null);
  const completeOverlayDelayRef = useRef<number | null>(null);
  const activeTimerSaveCounterRef = useRef(0);
  const timeoutTrackedRef = useRef(false);
  const reviewCheckRunRef = useRef(0);
  const reviewSubmitGuardRef = useRef(false);
  const postLevelActionGuardRef = useRef(false);

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
  const pendingRevealArtifact =
    artifactRevealQueue.length > 0 ? getArtifactById(artifactRevealQueue[0]) ?? null : null;
  const showArtifactReveal = showComplete && pendingRevealArtifact !== null;
  const campaignReport =
    level &&
    chapter &&
    mode === "campaign" &&
    showComplete &&
    !showArtifactReveal &&
    level.order === chapter.levels.length &&
    shouldShowCampaignReport(level.chapterId)
      ? getCampaignReportForCompletedCampaign(level.chapterId)
      : null;
  const showCampaignReport = campaignReport !== null;
  const showRewardedHintModal = rewardedHintModal !== null;
  const showStartupOnboarding = mode === "campaign" && startupOnboardingOpen && !showComplete && !timedOut;
  const showOverlay =
    showComplete || timedOut || showRewardedHintModal || isReviewPromptOpen || showStartupOnboarding || showCampaignReport;
  const gameplayBlocked =
    platformPaused ||
    !pageVisible ||
    showStartupOnboarding ||
    showRewardedHintModal ||
    rewardedHintInFlight ||
    isReviewPromptOpen ||
    isSubmittingReview ||
    isInterstitialActive ||
    postLevelActionInFlight ||
    showComplete ||
    completionPending ||
    timedOut;
  const completedLevelsCount = saveData.completedLevels.length;
  const promptOrdinal = Math.min(
    saveData.reviewPrompt.prePromptShownCount + 1,
    2,
  ) as 1 | 2;
  const postLevelPromptPayload = useMemo(
    () => ({
      completedLevels: completedLevelsCount,
      campaignId: level?.chapterId,
      deviceType: getDeviceType(),
      language: saveData.settings.locale,
      promptOrdinal,
    }),
    [completedLevelsCount, level?.chapterId, promptOrdinal, saveData.settings.locale],
  );

  useEffect(() => subscribePlatformPause(setPlatformPaused), []);

  useEffect(() => {
    setStartupOnboardingOpen(showOnboarding);
  }, [levelId, showOnboarding]);

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
    const preventBrowserGameGesture = (event: Event) => event.preventDefault();
    const listenerOptions = { capture: true };

    window.addEventListener(
      "contextmenu",
      preventBrowserGameGesture,
      listenerOptions,
    );
    document.addEventListener(
      "selectstart",
      preventBrowserGameGesture,
      listenerOptions,
    );
    document.addEventListener(
      "dragstart",
      preventBrowserGameGesture,
      listenerOptions,
    );
    return () => {
      window.removeEventListener(
        "contextmenu",
        preventBrowserGameGesture,
        listenerOptions,
      );
      document.removeEventListener(
        "selectstart",
        preventBrowserGameGesture,
        listenerOptions,
      );
      document.removeEventListener(
        "dragstart",
        preventBrowserGameGesture,
        listenerOptions,
      );
    };
  }, []);

  // Warm both scene images up front: only one side is mounted in mobile
  // portrait, so without this the B image starts downloading on first toggle.
  useEffect(() => {
    if (!level) return;
    void preloadImages([level.imageA, level.imageB]);
  }, [level]);

  // While the completion overlay is open, prefetch the next level's pair so
  // "next level" starts with warm images.
  useEffect(() => {
    if (mode !== "campaign" || !showComplete || !level || !chapter) return;
    const upcoming = chapter.levels.find((l) => l.order === level.order + 1);
    if (upcoming) void preloadImages([upcoming.imageA, upcoming.imageB]);
  }, [mode, showComplete, level, chapter]);

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
    if (timeLeft === 0 && !showComplete && !completionPending) {
      setTimedOut(true);
      if (!timeoutTrackedRef.current) {
        timeoutTrackedRef.current = true;
        trackAnalyticsEvent("level_failed_timeout", {
          levelId,
          campaignId: level?.chapterId,
          mode,
          foundDifferences: liveFoundIds.length,
          mistakes: liveMistakes,
          elapsedActiveSeconds: liveElapsedActiveSeconds,
        });
      }
    }
  }, [
    completionPending,
    level?.chapterId,
    levelId,
    liveElapsedActiveSeconds,
    liveFoundIds.length,
    liveMistakes,
    mode,
    showComplete,
    timeLeft,
  ]);

  useEffect(() => {
    return () => {
      if (completeOverlayDelayRef.current !== null) {
        window.clearTimeout(completeOverlayDelayRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showComplete || mode !== "campaign" || !level) return;
    if (reviewPromptRuntime.pendingMapCheckCompletedLevels === null) return;

    const checkId = reviewCheckRunRef.current + 1;
    reviewCheckRunRef.current = checkId;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const locallyEligible = isReviewPrePromptLocallyEligible({
          completedLevels: completedLevelsCount,
          reviewState: saveData.reviewPrompt,
          isCampaignMapActive: false,
          isPostLevelVictoryActive: true,
          isDocumentVisible: pageVisible && document.visibilityState === "visible",
          hasBlockingOverlay: isReviewPromptOpen || showArtifactReveal || showCampaignReport,
          isAdActive:
            isInterstitialActive ||
            interstitialRuntime.nativeRequestInFlight ||
            postLevelActionInFlight,
          isPurchaseFlowActive: false,
          isTutorialActive: false,
          nativeRequestInFlight: reviewPromptRuntime.nativeRequestInFlight,
        });

        if (!locallyEligible) return;

        const availability = await mockPlatform.canReview();
        const currentScreen = useGameStore.getState().screen;

        if (
          reviewCheckRunRef.current !== checkId ||
          currentScreen.kind !== "game" ||
          currentScreen.levelId !== levelId
        ) {
          return;
        }

        if (!availability.value) {
          setReviewUnavailableReason(availability.reason);
          clearPendingReviewPromptCheck();
          trackAnalyticsEvent("review_native_unavailable", {
            ...postLevelPromptPayload,
            unavailableReason: availability.reason,
          });
          return;
        }

        trackAnalyticsEvent("review_prompt_eligible", postLevelPromptPayload);
        markReviewPromptShown();
        setIsReviewPromptOpen(true);
        trackAnalyticsEvent("review_prompt_shown", postLevelPromptPayload);
      })();
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [
    clearPendingReviewPromptCheck,
    completedLevelsCount,
    interstitialRuntime.nativeRequestInFlight,
    isInterstitialActive,
    isReviewPromptOpen,
    level,
    levelId,
    markReviewPromptShown,
    mode,
    pageVisible,
    postLevelActionInFlight,
    postLevelPromptPayload,
    reviewPromptRuntime.nativeRequestInFlight,
    reviewPromptRuntime.pendingMapCheckCompletedLevels,
    saveData.reviewPrompt,
    setReviewUnavailableReason,
    showArtifactReveal,
    showCampaignReport,
    showComplete,
  ]);

  // Reveal ceremony analytics: once per queued artifact.
  const revealShownRef = useRef<string | null>(null);
  useEffect(() => {
    if (!showArtifactReveal || !pendingRevealArtifact) return;
    if (revealShownRef.current === pendingRevealArtifact.id) return;
    revealShownRef.current = pendingRevealArtifact.id;
    trackAnalyticsEvent("artifact_unlock_modal_shown", {
      artifactId: pendingRevealArtifact.id,
      levelId,
      campaignId: pendingRevealArtifact.chapterId,
    });
  }, [levelId, pendingRevealArtifact, showArtifactReveal]);

  useEffect(() => {
    return () => {
      if (artifactToastTimerRef.current !== null) {
        window.clearTimeout(artifactToastTimerRef.current);
      }
    };
  }, []);

  const reportShownRef = useRef<string | null>(null);
  const reportRestoredLevels =
    chapter?.levels.filter((candidate) => saveData.completedLevels.includes(candidate.id)).length ?? 0;
  const reportTotalLevels = chapter?.levels.length ?? 0;
  const reportUnlockedArtifactCount =
    campaignReport?.artifactIds.filter((artifactId) => (saveData.artifacts[artifactId] ?? "locked") !== "locked")
      .length ?? 0;
  const reportTotalArtifactCount = campaignReport?.artifactIds.length ?? 0;

  useEffect(() => {
    if (!showCampaignReport || !campaignReport) return;
    if (reportShownRef.current === campaignReport.id) return;
    reportShownRef.current = campaignReport.id;
    trackAnalyticsEvent("campaign_report_shown", {
      campaignId: campaignReport.campaignId,
      reportId: campaignReport.id,
      restoredLevels: reportRestoredLevels,
      artifactCount: reportUnlockedArtifactCount
    });
  }, [
    campaignReport,
    reportRestoredLevels,
    reportUnlockedArtifactCount,
    showCampaignReport,
  ]);

  if (!level || !chapter) return null;

  const nextLevel =
    mode === "campaign"
      ? chapter.levels.find((l) => l.order === level.order + 1) ?? null
      : null;
  const magnifiers = saveData.magnifiers;
  const displayFoundIds = showComplete
    ? level.differences.map((d) => d.id)
    : liveFoundIds;
  const activeHintIsUnfound =
    hintId !== undefined && !liveFoundIds.includes(hintId);
  const chapterId = level.chapterId;

  const levelArtifact = getArtifactForLevel(levelId);

  function showArtifactToast(differenceId: string) {
    if (levelArtifact?.differenceId !== differenceId) return;
    const artifactState = saveData.artifacts[levelArtifact.id] ?? "locked";
    const variant: ArtifactToastVariant = artifactState === "locked" ? "new" : "replay";
    setArtifactToast(variant);
    if (artifactToastTimerRef.current !== null) {
      window.clearTimeout(artifactToastTimerRef.current);
    }
    artifactToastTimerRef.current = window.setTimeout(() => {
      setArtifactToast(null);
      artifactToastTimerRef.current = null;
    }, 2600);
    trackAnalyticsEvent("artifact_toast_shown", {
      artifactId: levelArtifact.id,
      levelId,
      campaignId: levelArtifact.chapterId,
      variant,
    });
  }

  function handleDifference(differenceId: string) {
    if (completionPending || showComplete || timedOut || platformPaused || showStartupOnboarding) return;
    if (hintId === differenceId) setHintId(undefined);
    showArtifactToast(differenceId);
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
        completeOverlayDelayRef.current = null;
      }, COMPLETE_OVERLAY_DELAY_MS);
    }
  }

  function revealNextAreaHint({
    spendMagnifier,
    skipActiveHint,
    source,
  }: {
    spendMagnifier: boolean;
    skipActiveHint: boolean;
    source: "magnifier" | "rewarded";
  }) {
    if (showComplete || completionPending) return undefined;
    if (activeHintIsUnfound && !skipActiveHint) return undefined;
    const next = level!.differences.find(
      (d) =>
        !liveFoundIds.includes(d.id) && (!skipActiveHint || d.id !== hintId),
    );
    if (!next) return undefined;
    if (spendMagnifier && !spendMagnifiers(1)) return undefined;
    setHintId(next.id);
    trackAnalyticsEvent("hint_revealed", {
      levelId,
      campaignId: level!.chapterId,
      levelOrder: level!.order,
      mode,
      differenceId: next.id,
      source,
      foundDifferences: liveFoundIds.length,
      mistakes: liveMistakes,
      elapsedActiveSeconds: liveElapsedActiveSeconds,
    });
    return next.id;
  }

  async function handleAreaHint() {
    if (
      showComplete ||
      showStartupOnboarding ||
      completionPending ||
      rewardedHintInFlight ||
      platformPaused
    )
      return;
    if (magnifiers > 0) {
      revealNextAreaHint({
        spendMagnifier: true,
        skipActiveHint: false,
        source: "magnifier",
      });
      return;
    }

    setRewardedHintModal("offer");
    trackAnalyticsEvent("rewarded_hint_offer_opened", {
      levelId,
      campaignId: level!.chapterId,
      levelOrder: level!.order,
      mode,
      foundDifferences: liveFoundIds.length,
      mistakes: liveMistakes,
      elapsedActiveSeconds: liveElapsedActiveSeconds,
    });
  }

  async function handleRewardedHintWatch() {
    if (
      showComplete ||
      showStartupOnboarding ||
      completionPending ||
      rewardedHintInFlight ||
      platformPaused ||
      magnifiers > 0 ||
      !hasRewardedAreaHintTarget
    )
      return;
    void save({ flush: true });
    setRewardedHintInFlight(true);
    setRewardedHintModal("offer");
    trackAnalyticsEvent("rewarded_hint_requested", {
      levelId,
      campaignId: level!.chapterId,
      levelOrder: level!.order,
      mode,
      foundDifferences: liveFoundIds.length,
      mistakes: liveMistakes,
      elapsedActiveSeconds: liveElapsedActiveSeconds,
    });
    try {
      const result = await mockPlatform.showRewarded();
      if (result === "rewarded") {
        revealNextAreaHint({
          spendMagnifier: false,
          skipActiveHint: true,
          source: "rewarded",
        });
        setRewardedHintModal(null);
      } else if (result === "closed") {
        setRewardedHintModal(null);
      } else if (result === "failed") {
        setRewardedHintModal("failed");
      }
      trackAnalyticsEvent(`rewarded_hint_${result}`, {
        levelId,
        campaignId: level!.chapterId,
        levelOrder: level!.order,
        mode,
        foundDifferences: liveFoundIds.length,
        mistakes: liveMistakes,
        elapsedActiveSeconds: liveElapsedActiveSeconds,
      });
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

  async function showQueuedInterstitialBeforeNextLevel() {
    const runtime = useGameStore.getState().interstitialRuntime;
    const completedLevels = runtime.pendingMapCheckCompletedLevels;
    if (completedLevels === null) return;

    if (saveData.purchases.noForcedInterstitials) {
      clearPendingInterstitialCheck();
      return;
    }

    if (
      completedLevels % 3 !== 0 ||
      completedLevels <= runtime.lastResolvedCompletedLevels
    ) {
      clearPendingInterstitialCheck();
      return;
    }

    trackAnalyticsEvent("interstitial_eligible", {
      ...postLevelPromptPayload,
      completedLevels,
    });
    trackAnalyticsEvent("interstitial_request", {
      ...postLevelPromptPayload,
      completedLevels,
    });
    setInterstitialNativeRequestInFlight(true);

    const result = await mockPlatform.showInterstitial({
      onOpen: () => {
        setIsInterstitialActive(true);
        trackAnalyticsEvent("interstitial_open", {
          ...postLevelPromptPayload,
          completedLevels,
        });
      },
      onClose: () => {
        setIsInterstitialActive(false);
        trackAnalyticsEvent("interstitial_close", {
          ...postLevelPromptPayload,
          completedLevels,
        });
      },
      onError: () => {
        setIsInterstitialActive(false);
        trackAnalyticsEvent("interstitial_error", {
          ...postLevelPromptPayload,
          completedLevels,
        });
      },
    });

    if (result === "failed") {
      setIsInterstitialActive(false);
    }
    setInterstitialResolved(completedLevels);
  }

  async function handleNext() {
    if (
      !nextLevel ||
      postLevelActionGuardRef.current ||
      isReviewPromptOpen ||
      isSubmittingReview ||
      interstitialRuntime.nativeRequestInFlight
    )
      return;

    postLevelActionGuardRef.current = true;
    setPostLevelActionInFlight(true);
    trackAnalyticsEvent("level_next_clicked", {
      levelId,
      nextLevelId: nextLevel.id,
      campaignId: chapterId,
      mode,
    });
    void save({ flush: true });

    try {
      await showQueuedInterstitialBeforeNextLevel();
    } finally {
      postLevelActionGuardRef.current = false;
      setPostLevelActionInFlight(false);
    }

    startLevel(nextLevel.id, "campaign");
  }

  function handleArtifactRevealContinue() {
    if (!pendingRevealArtifact) return;
    trackAnalyticsEvent("artifact_unlock_continue_clicked", {
      artifactId: pendingRevealArtifact.id,
      levelId,
      campaignId: pendingRevealArtifact.chapterId,
    });
    dismissArtifactReveal(pendingRevealArtifact.id);
  }

  function handleArtifactRevealCollection() {
    if (!pendingRevealArtifact) return;
    trackAnalyticsEvent("artifact_unlock_collection_clicked", {
      artifactId: pendingRevealArtifact.id,
      levelId,
      campaignId: pendingRevealArtifact.chapterId,
    });
    dismissArtifactReveal(pendingRevealArtifact.id);
    void save({ flush: true });
    clearPendingInterstitialCheck();
    clearPendingReviewPromptCheck();
    navigate({ kind: "collection" });
  }

  function completeCampaignReportAction(action: "next_campaign" | "collection" | "archive" | "close") {
    if (!campaignReport) return;
    markCampaignReportViewed(campaignReport.id);
    clearPendingInterstitialCheck();
    clearPendingReviewPromptCheck();
    trackAnalyticsEvent("campaign_report_cta_clicked", {
      campaignId: campaignReport.campaignId,
      reportId: campaignReport.id,
      action
    });
    void save({ flush: true });
  }

  function handleCampaignReportPrimary() {
    if (!campaignReport) return;
    const nextChapterId = getNextCampaignReportChapterId(campaignReport);
    completeCampaignReportAction(nextChapterId ? "next_campaign" : "archive");
    if (nextChapterId) {
      navigate({ kind: "map", chapterId: nextChapterId });
      return;
    }
    navigate({ kind: "home" });
  }

  function handleCampaignReportCollection() {
    if (!campaignReport) return;
    completeCampaignReportAction("collection");
    navigate({ kind: "collection" });
  }

  function handleCampaignReportClose() {
    if (!campaignReport) return;
    completeCampaignReportAction("close");
    navigate({ kind: "map", chapterId });
  }

  function handleMap() {
    if (completionPending) return;
    void save({ flush: true });
    clearPendingInterstitialCheck();
    clearPendingReviewPromptCheck();
    trackAnalyticsEvent("level_exit_to_map", {
      levelId,
      campaignId: chapterId,
      mode,
      foundDifferences: liveFoundIds.length,
      mistakes: liveMistakes,
      elapsedActiveSeconds: liveElapsedActiveSeconds,
      completed: showComplete,
    });
    navigate(mode === "daily" ? { kind: "home" } : { kind: "map", chapterId });
  }

  function handleArchiveValidationLevel(nextLevelId: string) {
    if (nextLevelId === levelId || completionPending) return;
    setPendingFinalStats(null);
    setFinalStats(null);
    setTimedOut(false);
    setHintId(undefined);
    startLevel(nextLevelId, "daily");
  }

  function handleReviewLater() {
    dismissReviewPrompt();
    setIsReviewPromptOpen(false);
    trackAnalyticsEvent("review_prompt_later_clicked", postLevelPromptPayload);
  }

  function handleReviewClose() {
    dismissReviewPrompt();
    setIsReviewPromptOpen(false);
    trackAnalyticsEvent("review_prompt_closed", postLevelPromptPayload);
  }

  async function handleReview() {
    if (
      reviewSubmitGuardRef.current ||
      isSubmittingReview ||
      reviewPromptRuntime.nativeRequestInFlight
    )
      return;

    reviewSubmitGuardRef.current = true;
    setIsSubmittingReview(true);
    setReviewNativeRequestInFlight(true);
    trackAnalyticsEvent("review_prompt_review_clicked", postLevelPromptPayload);

    const availability = await mockPlatform.canReview();

    if (!availability.value) {
      setReviewUnavailableReason(availability.reason);
      setReviewNativeRequestInFlight(false);
      setIsSubmittingReview(false);
      setIsReviewPromptOpen(false);
      trackAnalyticsEvent("review_native_unavailable", {
        ...postLevelPromptPayload,
        unavailableReason: availability.reason,
      });
      reviewSubmitGuardRef.current = false;
      return;
    }

    setIsReviewPromptOpen(false);
    trackAnalyticsEvent("review_native_requested", postLevelPromptPayload);

    const result = await runNativeReviewFlow(mockPlatform);

    if (result.status === "sent") {
      setReviewNativeResolved(true);
      trackAnalyticsEvent("review_native_sent", postLevelPromptPayload);
    } else if (result.status === "closed") {
      setReviewNativeResolved(true);
      trackAnalyticsEvent("review_native_closed", postLevelPromptPayload);
    } else if (result.status === "unavailable") {
      setReviewUnavailableReason(result.reason);
      trackAnalyticsEvent("review_native_unavailable", {
        ...postLevelPromptPayload,
        unavailableReason: result.reason,
      });
    } else {
      trackAnalyticsEvent("review_native_error", postLevelPromptPayload);
    }

    setReviewNativeRequestInFlight(false);
    setIsSubmittingReview(false);
    reviewSubmitGuardRef.current = false;
  }

  function handleExtendTime() {
    if (!spendMagnifiers(2)) return;
    setTimedOut(false);
    timeoutTrackedRef.current = false;
    addActiveLevelTime(levelId, -30, { save: true, flush: true });
    trackAnalyticsEvent("level_time_extended", {
      levelId,
      campaignId: chapterId,
      mode,
      foundDifferences: liveFoundIds.length,
      mistakes: liveMistakes,
      elapsedActiveSeconds: liveElapsedActiveSeconds,
    });
  }

  function handleStartOnboarding() {
    setStartupOnboardingOpen(false);
    trackAnalyticsEvent("first_run_onboarding_started", {
      levelId,
      campaignId: chapterId,
      mode,
      requiredDifferences: level!.requiredDifferences
    });
  }

  const campaignTitle =
    mode === "daily" ? t("actions.daily").toUpperCase() : t(chapter.titleKey).toUpperCase();
  const levelBadgeTotal = mode === "daily" ? 7 : chapter.levels.length;
  const hasRewardedAreaHintTarget = level.differences.some(
    (d) => !liveFoundIds.includes(d.id) && d.id !== hintId,
  );
  const canUseAreaHint =
    !showComplete &&
    !completionPending &&
    !rewardedHintInFlight &&
    liveFoundIds.length < level.requiredDifferences &&
    (magnifiers > 0 ? !activeHintIsUnfound : hasRewardedAreaHintTarget);
  const displayStreak = Math.max(0, liveFoundIds.length - liveMistakes);
  const showArchiveValidationNav =
    import.meta.env.DEV && ARCHIVE_VALIDATE_MODE && mode === "daily";

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
                  total: levelBadgeTotal,
                })}
              </div>
              <div className="text-[22px] font-semibold leading-tight tracking-[.01em] text-exp-parch">
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
                style={{ color: "#D5C39A" }}
              >
                {formatTime(liveElapsedActiveSeconds)}
              </span>
              <span className="hidden text-[9.5px] font-semibold uppercase tracking-[.14em] text-exp-muted lg:inline">
                {t("game.timeLabel")}
              </span>
            </div>

            {/* Found counter */}
            <div
              className="flex h-[48px] items-center rounded-[11px] gap-2 flex-col px-5 md:flex-row justify-center"
              style={{
                border: "1px solid rgba(184,138,69,.4)",
                background:
                  "linear-gradient(180deg, rgba(184,138,69,.16), rgba(184,138,69,.05))",
              }}
            >
              <div className="flex items-center gap-[6px] rounded-[11px]">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d8af63"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <div className="flex shrink-0 items-center gap-1 whitespace-nowrap leading-none">
                  <span className="font-manrope text-[24px] font-bold text-exp-brass2 md:text-[17px]">
                    {liveFoundIds.length}
                  </span>
                  <span
                    className="whitespace-nowrap font-manrope text-[15px] font-semibold"
                    style={{ color: "rgba(213,195,154,.5)" }}
                  >
                    / {level.requiredDifferences}
                  </span>
                </div>
              </div>
              <span className="hidden font-manrope text-[10.5px] font-semibold tracking-[.12em] text-exp-muted sm:block md:text-[12px]">
                {t("game.diffCount")}
              </span>
              <div className="hidden gap-[5px] xl:flex">
                {Array.from({ length: level.requiredDifferences }).map(
                  (_, i) => (
                    <span
                      key={i}
                      className="flex h-5 w-5 items-center justify-center rounded-[6px]"
                      style={
                        i < liveFoundIds.length
                          ? { background: "#D8AF63" }
                          : { border: "1px dashed rgba(213,195,154,.3)" }
                      }
                    >
                      {i < liveFoundIds.length && (
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1A130A"
                          strokeWidth="3.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-[10px]">
            <button
              onClick={handleAreaHint}
              disabled={!canUseAreaHint}
              className="game-hint-button flex min-h-[44px] items-center gap-2 rounded-[9px] px-4 font-manrope text-[13px] font-bold text-exp-brass2 disabled:opacity-40"
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
              <span className="game-hint-button-desktop flex items-center gap-2">
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
                <span className="hidden sm:inline">{t("game.hintLabel")}</span>
                {magnifiers > 0 ? (
                  <span
                    className="inline-flex min-w-[20px] items-center justify-center rounded-[6px] px-[5px] font-manrope text-[11px] font-bold text-[#1a130a]"
                    style={{ height: "20px", background: "#d8af63" }}
                  >
                    {magnifiers}
                  </span>
                ) : (
                  <>
                    <span
                      className="inline-flex min-w-[20px] items-center justify-center rounded-[6px] px-[5px] font-manrope text-[11px] font-bold text-[#1a130a]"
                      style={{ height: "20px", background: "#d8af63" }}
                    >
                      0
                    </span>
                    <span className="h-[18px] w-px bg-[#D8AF63]/30" />
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
                  </>
                )}
              </span>
              <span
                className={
                  magnifiers > 0
                    ? "game-hint-fab-ring game-hint-fab-ring--charged"
                    : "game-hint-fab-ring game-hint-fab-ring--ad"
                }
                aria-hidden="true"
              />
              <span className="game-hint-fab-core" aria-hidden="true">
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18h6M10 21h4" />
                  <path d="M12 3a6 6 0 0 0-4 10.5c.6.5 1 1.3 1 2.1v.4h6v-.4c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
                </svg>
              </span>
            </button>
            <div className="game-hint-rail-meta hidden">
              {magnifiers > 0 ? (
                <>
                  <span className="game-hint-pips" aria-hidden="true">
                    {Array.from({ length: HINT_PIP_COUNT }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < magnifiers
                            ? "game-hint-pip game-hint-pip--lit"
                            : "game-hint-pip"
                        }
                      />
                    ))}
                  </span>
                  <span className="game-hint-rail-caption">
                    {t("game.hintChargesLeft", { value: magnifiers })}
                  </span>
                </>
              ) : (
                <>
                  <span className="game-hint-ad-badge">
                    {t("game.rewardedHintBadge")}
                  </span>
                  <span className="game-hint-rail-caption">
                    {t("game.hintLabel")}
                  </span>
                </>
              )}
            </div>

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
        {showArchiveValidationNav ? (
          <nav
            className="archive-validation-nav z-30 flex shrink-0 items-center justify-center gap-2 px-4 py-2"
            style={{
              borderBottom: "1px solid rgba(213,195,154,.1)",
              background: "rgba(12,16,14,.78)",
            }}
            aria-label="Archive hitbox validation levels"
          >
            <span className="hidden font-jetbrains text-[10px] font-semibold tracking-[.16em] text-exp-success sm:inline">
              ARCHIVE HITBOXES
            </span>
            <div className="flex items-center gap-1.5">
              {dailyArchiveLevels.map((archiveLevel) => {
                const active = archiveLevel.id === levelId;
                return (
                  <button
                    key={archiveLevel.id}
                    type="button"
                    className="flex h-8 min-w-8 items-center justify-center rounded-[7px] px-2 font-jetbrains text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
                    style={
                      active
                        ? {
                            background: "#6fc69e",
                            color: "#102016",
                          }
                        : {
                            border: "1px solid rgba(213,195,154,.18)",
                            background: "rgba(213,195,154,.06)",
                            color: "#d5c39a",
                          }
                    }
                    aria-current={active ? "page" : undefined}
                    onClick={() => handleArchiveValidationLevel(archiveLevel.id)}
                  >
                    {archiveLevel.order}
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}

        <div
          className="game-mobile-title flex shrink-0 items-center justify-between px-4 pb-[10px] pt-[6px] sm:hidden"
          style={{ borderBottom: "1px solid rgba(213,195,154,.08)" }}
        >
          <div className="min-w-0 flex-1 text-center">
            <div className="font-manrope text-[8.5px] font-bold tracking-[.16em] text-exp-brass">
              {mode === "daily" ? t("actions.daily") : t(chapter.titleKey)} ·{" "}
              {t("actions.map")} {level.order}
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
        <div className="game-play-area flex flex-1 overflow-hidden px-4 pb-0 pt-3 sm:px-[34px] sm:pt-[22px]">
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

        {artifactToast && !showComplete && !timedOut && (
          <ArtifactFoundToast variant={artifactToast} />
        )}

        {/* ── BOTTOM TRACKER ─────────────────────────────────────────── */}
        <footer
          className="game-footer hidden shrink-0 items-center justify-between px-[30px] sm:flex"
          style={{
            height: "64px",
            borderTop: "1px solid rgba(213,195,154,.12)",
            background:
              "linear-gradient(0deg, rgba(34,42,37,.9), rgba(21,27,24,.3))",
          }}
        >
          <div className="flex items-center gap-2.5 text-exp-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 3l7.5 18 2.5-7.5L20.5 11z" />
            </svg>
            <span className="font-manrope text-[13.5px] font-medium">
              {t("game.gameplayInstruction")}
            </span>
          </div>

          <div className="flex h-10 items-center gap-2.5 rounded-[11px] border border-[#B88A45]/35 bg-[#B88A45]/10 px-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="#D8AF63"
              stroke="#D8AF63"
              strokeWidth="1"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
            </svg>
            <span className="text-[12px] font-bold uppercase tracking-[.06em] text-exp-muted">
              {t("game.streakLabel")}
            </span>
            <span className="text-[16px] font-bold text-exp-brass2">
              ×{displayStreak}
            </span>
            {liveMistakes === 0 && displayStreak > 0 && (
              <span className="ml-0.5 text-[12px] font-semibold text-exp-success">
                {t("game.streakClean")}
              </span>
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
          onRetry={mode === "daily" ? null : handleRetry}
          onMap={handleMap}
          isDaily={mode === "daily"}
          returnLabel={mode === "daily" ? t("game.toArchiveHub") : undefined}
        />
      )}

      {showArtifactReveal && pendingRevealArtifact && (
        <ArtifactRevealOverlay
          artifact={pendingRevealArtifact}
          backgroundSrc={level.imageB}
          onContinue={handleArtifactRevealContinue}
          onOpenCollection={handleArtifactRevealCollection}
        />
      )}

      {showCampaignReport && campaignReport && (
        <CampaignCaseReportModal
          report={campaignReport}
          restoredLevels={reportRestoredLevels}
          totalLevels={reportTotalLevels}
          unlockedArtifactCount={reportUnlockedArtifactCount}
          totalArtifactCount={reportTotalArtifactCount}
          artifactIds={campaignReport.artifactIds}
          onPrimary={handleCampaignReportPrimary}
          onOpenCollection={handleCampaignReportCollection}
          onClose={handleCampaignReportClose}
        />
      )}

      {showStartupOnboarding && (
        <FirstRunOnboardingOverlay
          title={t(level.titleKey)}
          backgroundSrc={level.imageA}
          differencesCount={level.requiredDifferences}
          onStart={handleStartOnboarding}
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
          mapLabel={mode === "daily" ? t("game.toArchiveHub") : undefined}
        />
      )}

      {showRewardedHintModal && (
        <RewardedHintModal
          failed={rewardedHintModal === "failed"}
          loading={rewardedHintInFlight}
          backgroundSrc={level.imageA}
          onClose={() => setRewardedHintModal(null)}
          onWatch={handleRewardedHintWatch}
        />
      )}

      <GameReviewPrePromptModal
        isOpen={isReviewPromptOpen && pageVisible}
        isSubmitting={isSubmittingReview}
        onReview={() => void handleReview()}
        onLater={handleReviewLater}
        onClose={handleReviewClose}
      />
    </div>
  );
}
