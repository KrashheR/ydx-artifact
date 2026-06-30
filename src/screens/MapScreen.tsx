import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getChapter, type ChapterId } from "@/content/chapters";
import { getCampaignCardPreviewAsset } from "@/content/sceneAssets";
import { GameReviewPrePromptModal } from "@/features/review/GameReviewPrePromptModal";
import { runNativeReviewFlow } from "@/features/review/reviewFlow";
import { isReviewPrePromptLocallyEligible } from "@/features/review/reviewPrompt";
import { trackAnalyticsEvent } from "@/services/analytics/analytics";
import { mockPlatform } from "@/services/platform/mockPlatform";
import { isLevelUnlocked } from "@/shared/lib/progression";
import { useGameStore } from "@/shared/store/gameStore";

function BackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({
  size = 16,
  color = "#879087",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="1.8"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="#1A130A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon({
  size = 12,
  color = "#1A130A",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M8 5V19L19 12Z" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#D8AF63" : "rgba(213,195,154,0.16)"}
      aria-hidden="true"
    >
      <path d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4Z" />
    </svg>
  );
}

type LevelCardState = {
  id: string;
  order: number;
  title: string;
  previewSrc: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
  footerLabel: string;
};

export function MapScreen() {
  const { t } = useTranslation();
  const screen = useGameStore((state) => state.screen);
  const saveData = useGameStore((state) => state.saveData);
  const startLevel = useGameStore((state) => state.startLevel);
  const navigate = useGameStore((state) => state.navigate);
  const reviewPromptRuntime = useGameStore(
    (state) => state.reviewPromptRuntime,
  );
  const interstitialRuntime = useGameStore(
    (state) => state.interstitialRuntime,
  );
  const clearPendingReviewPromptCheck = useGameStore(
    (state) => state.clearPendingReviewPromptCheck,
  );
  const clearPendingInterstitialCheck = useGameStore(
    (state) => state.clearPendingInterstitialCheck,
  );
  const setInterstitialNativeRequestInFlight = useGameStore(
    (state) => state.setInterstitialNativeRequestInFlight,
  );
  const setInterstitialResolved = useGameStore(
    (state) => state.setInterstitialResolved,
  );
  const markReviewPromptShown = useGameStore(
    (state) => state.markReviewPromptShown,
  );
  const dismissReviewPrompt = useGameStore(
    (state) => state.dismissReviewPrompt,
  );
  const setReviewNativeRequestInFlight = useGameStore(
    (state) => state.setReviewNativeRequestInFlight,
  );
  const setReviewNativeResolved = useGameStore(
    (state) => state.setReviewNativeResolved,
  );
  const setReviewUnavailableReason = useGameStore(
    (state) => state.setReviewUnavailableReason,
  );
  const mountedChapterIdRef = useRef<ChapterId>(
    screen.kind === "map" ? screen.chapterId : "northern-route",
  );
  const chapterId =
    screen.kind === "map" ? screen.chapterId : mountedChapterIdRef.current;
  const chapter = getChapter(chapterId);
  const [isReviewPromptOpen, setIsReviewPromptOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInterstitialActive, setIsInterstitialActive] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () =>
      typeof document === "undefined" || document.visibilityState === "visible",
  );
  const checkRunRef = useRef(0);
  const reviewSubmitGuardRef = useRef(false);
  const interstitialGuardRef = useRef(false);
  const completedLevelsCount = saveData.completedLevels.length;
  const promptOrdinal = Math.min(
    saveData.reviewPrompt.prePromptShownCount + 1,
    2,
  ) as 1 | 2;
  const analyticsPayload = useMemo(
    () => ({
      completedLevels: completedLevelsCount,
      campaignId: chapter.id,
      deviceType:
        window.innerWidth < 768
          ? "mobile"
          : window.innerWidth < 1280
            ? "tablet"
            : "desktop",
      language: saveData.settings.locale,
      promptOrdinal,
    }),
    [chapter.id, completedLevelsCount, promptOrdinal, saveData.settings.locale],
  );

  const levelCards = useMemo<LevelCardState[]>(
    () =>
      chapter.levels.map((level) => {
        const completed = saveData.completedLevels.includes(level.id);
        const unlocked = isLevelUnlocked(level.id, saveData);
        const current = unlocked && !completed;
        const locked = !unlocked;
        const footerLabel = locked
          ? t("campaigns.finishLevel", { level: level.order - 1 })
          : current
            ? t("actions.play")
            : t("campaigns.replay");

        return {
          id: level.id,
          order: level.order,
          title: t(level.titleKey),
          previewSrc: getCampaignCardPreviewAsset(chapter.id, level.order),
          completed,
          current,
          locked,
          footerLabel,
        };
      }),
    [chapter.id, chapter.levels, saveData, t],
  );

  const currentLevel =
    levelCards.find((level) => level.current) ??
    levelCards[levelCards.length - 1];
  const chapterCompleted = levelCards.filter((level) => level.completed).length;

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (screen.kind !== "map") return;

    const completedLevels = interstitialRuntime.pendingMapCheckCompletedLevels;
    if (completedLevels === null) return;

    if (saveData.purchases.noForcedInterstitials) {
      clearPendingInterstitialCheck();
      return;
    }

    if (
      completedLevels % 3 !== 0 ||
      completedLevels <= interstitialRuntime.lastResolvedCompletedLevels
    ) {
      clearPendingInterstitialCheck();
      return;
    }

    if (
      !isDocumentVisible ||
      isReviewPromptOpen ||
      reviewPromptRuntime.nativeRequestInFlight ||
      interstitialRuntime.nativeRequestInFlight ||
      interstitialGuardRef.current
    ) {
      return;
    }

    interstitialGuardRef.current = true;
    let cancelled = false;
    let requestStarted = false;

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        requestStarted = true;
        trackAnalyticsEvent("interstitial_eligible", {
          ...analyticsPayload,
          completedLevels,
        });
        trackAnalyticsEvent("interstitial_request", {
          ...analyticsPayload,
          completedLevels,
        });
        setInterstitialNativeRequestInFlight(true);

        const result = await mockPlatform.showInterstitial({
          onOpen: () => {
            if (cancelled) return;
            setIsInterstitialActive(true);
            trackAnalyticsEvent("interstitial_open", {
              ...analyticsPayload,
              completedLevels,
            });
          },
          onClose: () => {
            if (cancelled) return;
            setIsInterstitialActive(false);
            trackAnalyticsEvent("interstitial_close", {
              ...analyticsPayload,
              completedLevels,
            });
          },
          onError: () => {
            if (cancelled) return;
            setIsInterstitialActive(false);
            trackAnalyticsEvent("interstitial_error", {
              ...analyticsPayload,
              completedLevels,
            });
          },
        });

        if (!cancelled) {
          if (result === "failed") {
            setIsInterstitialActive(false);
          }
          setInterstitialResolved(completedLevels);
        }

        interstitialGuardRef.current = false;
      })();
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      if (!requestStarted) {
        cancelled = true;
        interstitialGuardRef.current = false;
      }
    };
  }, [
    analyticsPayload,
    clearPendingInterstitialCheck,
    interstitialRuntime.lastResolvedCompletedLevels,
    interstitialRuntime.nativeRequestInFlight,
    interstitialRuntime.pendingMapCheckCompletedLevels,
    isDocumentVisible,
    isReviewPromptOpen,
    reviewPromptRuntime.nativeRequestInFlight,
    saveData.purchases.noForcedInterstitials,
    screen,
    setInterstitialNativeRequestInFlight,
    setInterstitialResolved,
  ]);

  useEffect(() => {
    if (screen.kind !== "map") return;
    if (reviewPromptRuntime.pendingMapCheckCompletedLevels === null) return;

    const checkId = checkRunRef.current + 1;
    checkRunRef.current = checkId;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const locallyEligible = isReviewPrePromptLocallyEligible({
          completedLevels: completedLevelsCount,
          reviewState: saveData.reviewPrompt,
          isCampaignMapActive: screen.kind === "map",
          isDocumentVisible: document.visibilityState === "visible",
          hasBlockingOverlay: isReviewPromptOpen,
          isAdActive:
            isInterstitialActive || interstitialRuntime.nativeRequestInFlight,
          isPurchaseFlowActive: false,
          isTutorialActive: false,
          nativeRequestInFlight: reviewPromptRuntime.nativeRequestInFlight,
        });

        if (!locallyEligible) return;

        const availability = await mockPlatform.canReview();

        if (
          checkRunRef.current !== checkId ||
          useGameStore.getState().screen.kind !== "map"
        ) {
          return;
        }

        if (!availability.value) {
          setReviewUnavailableReason(availability.reason);
          clearPendingReviewPromptCheck();
          trackAnalyticsEvent("review_native_unavailable", {
            ...analyticsPayload,
            unavailableReason: availability.reason,
          });
          return;
        }

        trackAnalyticsEvent("review_prompt_eligible", analyticsPayload);
        markReviewPromptShown();
        setIsReviewPromptOpen(true);
        trackAnalyticsEvent("review_prompt_shown", analyticsPayload);
      })();
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [
    analyticsPayload,
    clearPendingReviewPromptCheck,
    completedLevelsCount,
    isDocumentVisible,
    isInterstitialActive,
    isReviewPromptOpen,
    markReviewPromptShown,
    interstitialRuntime.nativeRequestInFlight,
    reviewPromptRuntime.nativeRequestInFlight,
    reviewPromptRuntime.pendingMapCheckCompletedLevels,
    saveData.reviewPrompt,
    screen,
    setReviewUnavailableReason,
  ]);

  function handleLater() {
    dismissReviewPrompt();
    setIsReviewPromptOpen(false);
    trackAnalyticsEvent("review_prompt_later_clicked", analyticsPayload);
  }

  function handleClose() {
    dismissReviewPrompt();
    setIsReviewPromptOpen(false);
    trackAnalyticsEvent("review_prompt_closed", analyticsPayload);
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
    trackAnalyticsEvent("review_prompt_review_clicked", analyticsPayload);

    const availability = await mockPlatform.canReview();

    if (!availability.value) {
      setReviewUnavailableReason(availability.reason);
      setReviewNativeRequestInFlight(false);
      setIsSubmittingReview(false);
      setIsReviewPromptOpen(false);
      trackAnalyticsEvent("review_native_unavailable", {
        ...analyticsPayload,
        unavailableReason: availability.reason,
      });
      reviewSubmitGuardRef.current = false;
      return;
    }

    setIsReviewPromptOpen(false);
    trackAnalyticsEvent("review_native_requested", analyticsPayload);

    const result = await runNativeReviewFlow(mockPlatform);

    if (result.status === "sent") {
      setReviewNativeResolved(true);
      trackAnalyticsEvent("review_native_sent", analyticsPayload);
    } else if (result.status === "closed") {
      setReviewNativeResolved(true);
      trackAnalyticsEvent("review_native_closed", analyticsPayload);
    } else if (result.status === "unavailable") {
      setReviewUnavailableReason(result.reason);
      trackAnalyticsEvent("review_native_unavailable", {
        ...analyticsPayload,
        unavailableReason: result.reason,
      });
    } else {
      trackAnalyticsEvent("review_native_error", analyticsPayload);
    }

    setReviewNativeRequestInFlight(false);
    setIsSubmittingReview(false);
    reviewSubmitGuardRef.current = false;
  }

  return (
    <div className="map-screen h-dvh overflow-hidden bg-exp-bg font-manrope text-exp-parch">
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="map-topbar flex items-center gap-3 border-b border-[#D5C39A]/10 px-5 pb-4 pr-20 pt-3 md:px-10 md:pr-24">
          <button
            onClick={() => navigate({ kind: "home" })}
            aria-label={t("actions.back")}
            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#D5C39A]/15 bg-[#D5C39A]/5 text-[#D5C39A] transition hover:bg-[#D5C39A]/10"
          >
            <BackIcon />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[8.5px] font-bold uppercase tracking-[.18em] text-[#B88A45]">
              {t("campaigns.campaignLabel")}
            </p>
            <h1 className="truncate font-cormorant text-[28px] font-semibold leading-none md:text-[26px]">
              {t(chapter.titleKey)}
            </h1>
          </div>
          <div className="hidden min-w-[110px] flex-col items-end gap-1 md:flex">
            <span className="text-[12px] font-bold text-[#D8AF63]">
              {chapterCompleted} / {chapter.levels.length}
            </span>
            <div className="flex w-[110px] gap-[3px]">
              {levelCards.map((level) => (
                <span
                  key={level.id}
                  className="h-[4px] flex-1 rounded-[2px]"
                  style={{
                    background: level.completed
                      ? "linear-gradient(180deg,#D8AF63,#A9762F)"
                      : level.current
                        ? "linear-gradient(180deg,#E7C074,#B3812F)"
                        : "rgba(213,195,154,.1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <section className="map-hero px-5 pb-2 pt-[34px] text-center md:px-10 md:pb-0">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[.34em] text-exp-brass">
            {t("campaigns.journalLabel", { count: chapter.levels.length })}
          </p>
          <h2 className="font-cormorant text-[30px] font-semibold leading-tight text-exp-parch md:text-[50px]">
            {t("campaigns.routeLevels")}
          </h2>
        </section>

        <div className="map-content mx-auto flex min-h-0 w-full max-w-[1460px] flex-1 flex-col">
          <div className="map-desktop-journal hidden min-h-0 flex-1 px-10 pb-4 pt-5 md:block">
            <div className="map-journal-shell h-full min-h-0 overflow-hidden rounded-[20px] border border-[#D5C39A]/10 bg-[#101512]/70 px-4 py-4">
              <div className="map-scroll-area map-level-grid grid h-full min-h-0 grid-cols-2 gap-4 overflow-y-auto pr-1 xl:grid-cols-3">
                {levelCards.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    disabled={level.locked}
                    onClick={() => startLevel(level.id)}
                    aria-label={`${t("campaigns.levelCode", { order: level.order })} ${level.title}`}
                    className={`map-level-card group flex h-[338px] flex-col overflow-hidden rounded-[14px] bg-[#222A25] text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      level.current
                        ? "border-[1.5px] border-[#D8AF63] shadow-[0_22px_50px_rgba(0,0,0,.5),0_0_0_4px_rgba(184,138,69,.12)]"
                        : level.completed
                          ? "border border-[#B88A45]/30 shadow-[0_14px_30px_rgba(0,0,0,.35)]"
                          : "border border-[#D5C39A]/10 shadow-[0_12px_26px_rgba(0,0,0,.3)]"
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="map-level-preview relative h-[196px] overflow-hidden">
                      <img
                        src={level.previewSrc}
                        alt=""
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.58))]" />
                      <div className="absolute left-3 top-3 rounded-[6px] border border-[#D5C39A]/20 bg-[#101512]/66 px-2 py-1">
                        <span className="font-jetbrains text-[11px] font-bold text-[#D8AF63]">
                          {String(level.order).padStart(2, "0")}
                        </span>
                      </div>
                      {level.completed && (
                        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#FFECC4]/50 bg-[linear-gradient(180deg,#DCB360,#A9762F)]">
                          <CheckIcon />
                        </div>
                      )}
                      {level.current && (
                        <div className="absolute right-3 top-3 h-3 w-3 rounded-full bg-[#D8AF63] shadow-[0_0_10px_#D8AF63]" />
                      )}
                      {level.locked && (
                        <>
                          <div className="absolute inset-0 bg-[#101512]/62" />
                          <div className="absolute left-1/2 top-1/2 flex h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#FFECC4]/35 bg-[radial-gradient(circle_at_38%_32%,#CAA05A,#7E5B2A_72%)] shadow-[0_8px_20px_rgba(0,0,0,.5)]">
                            <LockIcon color="#2A1D0C" />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="map-level-body flex flex-1 flex-col px-4 py-3">
                      <p
                        className={`text-[8.5px] font-bold uppercase tracking-[.16em] ${
                          level.current
                            ? "text-[#D8AF63]"
                            : level.completed
                              ? "text-[#B88A45]"
                              : "text-[#879087]"
                        }`}
                      >
                        {level.current
                          ? t("campaigns.currentLevel")
                          : level.completed
                            ? t("campaigns.completed")
                            : t("campaigns.locked")}
                      </p>
                      <h3
                        className={`mt-1 font-cormorant text-[24px] font-semibold leading-[1.05] ${
                          level.locked ? "text-[#D5C39A]/55" : "text-[#D5C39A]"
                        }`}
                      >
                        {level.title}
                      </h3>

                      <div className="mt-auto">
                        {level.completed && (
                          <div className="flex items-center justify-between">
                            <div className="flex gap-[3px]">
                              <StarIcon filled />
                              <StarIcon filled />
                              <StarIcon filled />
                            </div>
                            <span className="text-[10.5px] font-semibold text-[#879087]">
                              {t("campaigns.replay")}
                            </span>
                          </div>
                        )}
                        {level.current && (
                          <div className="flex h-9 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(180deg,#D8AF63,#B3812F)] text-[12.5px] font-bold text-[#1A130A] shadow-[0_7px_16px_rgba(184,138,69,.32)]">
                            {t("actions.play")}
                            <PlayIcon />
                          </div>
                        )}
                        {level.locked && (
                          <div className="flex items-center gap-2">
                            <LockIcon
                              size={12}
                              color={
                                level.order === currentLevel.order + 1
                                  ? "#B88A45"
                                  : "#879087"
                              }
                            />
                            <span className="text-[10px] font-semibold text-[#879087]">
                              {level.footerLabel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="map-scroll-area map-mobile-level-list grid min-h-0 flex-1 content-start gap-3 overflow-y-auto px-4 pb-32 pt-5 md:hidden">
            {levelCards.map((level) => (
              <button
                key={level.id}
                type="button"
                disabled={level.locked}
                onClick={() => startLevel(level.id)}
                aria-label={`${t("campaigns.levelCode", { order: level.order })} ${level.title}`}
                className={`flex h-[152px] flex-col overflow-hidden rounded-[12px] bg-[#222A25] text-left transition-all duration-300 hover:-translate-y-0.5 ${
                  level.current
                    ? "border-[1.5px] border-[#D8AF63] shadow-[0_22px_50px_rgba(0,0,0,.5)]"
                    : level.completed
                      ? "border border-[#B88A45]/30 shadow-[0_14px_30px_rgba(0,0,0,.35)]"
                      : "border border-[#D5C39A]/10 shadow-[0_12px_26px_rgba(0,0,0,.3)]"
                } disabled:cursor-not-allowed`}
              >
                <div className="relative h-[74px] overflow-hidden">
                  <img
                    src={level.previewSrc}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.58))]" />
                  <div className="absolute left-2 top-2 rounded-[5px] border border-[#D5C39A]/20 bg-[#101512]/66 px-2 py-1">
                    <span className="font-jetbrains text-[9.5px] font-bold text-[#D8AF63]">
                      {String(level.order).padStart(2, "0")}
                    </span>
                  </div>
                  {level.completed && (
                    <div className="absolute right-2 top-2 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#FFECC4]/50 bg-[linear-gradient(180deg,#DCB360,#A9762F)]">
                      <CheckIcon size={10} />
                    </div>
                  )}
                  {level.current && (
                    <div className="absolute right-2 top-2 h-[9px] w-[9px] rounded-full bg-[#D8AF63] shadow-[0_0_8px_#D8AF63]" />
                  )}
                  {level.locked && (
                    <>
                      <div className="absolute inset-0 bg-[#101512]/62" />
                      <div className="absolute left-1/2 top-1/2 flex h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#FFECC4]/35 bg-[radial-gradient(circle_at_38%_32%,#CAA05A,#7E5B2A_72%)]">
                        <LockIcon size={14} color="#2A1D0C" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-1 flex-col px-3 py-2">
                  <p
                    className={`text-[7.5px] font-bold uppercase tracking-[.14em] ${
                      level.current
                        ? "text-[#D8AF63]"
                        : level.completed
                          ? "text-[#B88A45]"
                          : "text-[#879087]"
                    }`}
                  >
                    {level.current
                      ? t("campaigns.currentLevel")
                      : level.completed
                        ? t("campaigns.completed")
                        : t("campaigns.locked")}
                  </p>
                  <h3
                    className={`mt-1 font-cormorant text-[19px] font-semibold leading-[1.05] ${
                      level.locked ? "text-[#D5C39A]/55" : "text-[#D5C39A]"
                    }`}
                  >
                    {level.title}
                  </h3>
                  <div className="mt-auto">
                    {level.completed && (
                      <div className="flex gap-[2px]">
                        <StarIcon filled />
                        <StarIcon filled />
                        <StarIcon filled />
                      </div>
                    )}
                    {level.current && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#D8AF63]">
                        {t("actions.play")}
                        <PlayIcon size={9} color="#D8AF63" />
                      </div>
                    )}
                    {level.locked && (
                      <span className="text-[9.5px] font-semibold text-[#879087]">
                        {level.footerLabel}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-[linear-gradient(180deg,transparent,#151B18_50%)] px-4 pb-6 pt-5 md:hidden">
            <div className="mx-auto flex max-w-sm items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[8.5px] font-bold uppercase tracking-[.16em] text-[#B88A45]">
                  {t("campaigns.currentLevelSummary", {
                    progress: `${chapterCompleted} / ${chapter.levels.length}`,
                  })}
                </p>
                <p className="truncate font-cormorant text-[18px] font-semibold text-[#D5C39A]">
                  {currentLevel.title}
                </p>
              </div>
              <button
                onClick={() => startLevel(currentLevel.id)}
                className="flex h-[50px] flex-shrink-0 items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(180deg,#D8AF63,#B3812F)] px-5 text-[14px] font-bold text-[#1A130A] shadow-[0_8px_20px_rgba(184,138,69,.32)]"
              >
                {t("actions.play")}
                <PlayIcon size={14} />
              </button>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-[1460px] md:block">
            <footer className="mt-4 flex items-center justify-center gap-2 border-t border-[#D5C39A]/10 bg-[rgba(16,21,18,.5)] py-3 text-[10.5px] text-[#879087]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#879087"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("campaigns.autoSave")} ·{" "}
              {t("campaigns.levelsDone", { done: chapterCompleted })}
            </footer>
          </div>
        </div>
      </div>

      <GameReviewPrePromptModal
        isOpen={isReviewPromptOpen && isDocumentVisible}
        isSubmitting={isSubmittingReview}
        onReview={() => void handleReview()}
        onLater={handleLater}
        onClose={handleClose}
      />
    </div>
  );
}
