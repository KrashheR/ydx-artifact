import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  artifactList,
  getChapterArtifacts,
  TOTAL_ARTIFACTS,
  type ArtifactDefinition,
} from "@/content/artifacts";
import { chapterList, getChapter, type ChapterId } from "@/content/chapters";
import { trackAnalyticsEvent } from "@/services/analytics/analytics";
import { getArtifactLevel } from "@/shared/lib/progression";
import { useGameStore } from "@/shared/store/gameStore";

type ArtifactState = "locked" | "newly-unlocked" | "viewed";
type CampaignFilter = "all" | ChapterId;

const CAMPAIGN_ACCENT: Record<ChapterId, string> = {
  "northern-route": "#6fa3c9",
  "sand-meridian": "#c98f4a",
  "emerald-meridian": "#5cab84",
};

function getArtifactState(
  states: Record<string, string>,
  artifactId: string,
): ArtifactState {
  const state = states[artifactId];
  return state === "newly-unlocked" || state === "viewed" ? state : "locked";
}

function BackIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function SealLockBadge({ size = 34 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 38% 32%, #caa05a, #7e5b2a 72%)",
        border: "1.5px solid rgba(255,236,196,.35)",
        boxShadow: "0 8px 18px rgba(0,0,0,.5)",
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.42}
        height={size * 0.42}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2a1d0c"
        strokeWidth="1.8"
      >
        <rect x="5" y="11" width="14" height="9.5" rx="1.6" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    </div>
  );
}

function CheckIcon({ color = "#6fc69e" }: { color?: string }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M5 12l5 5L20 6" />
    </svg>
  );
}

function ArtifactCard({
  artifact,
  state,
  onOpen,
}: {
  artifact: ArtifactDefinition;
  state: ArtifactState;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const unlocked = state !== "locked";
  const accent = CAMPAIGN_ACCENT[artifact.chapterId];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative flex min-h-[44px] flex-col overflow-hidden rounded-[12px] text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
      style={{
        background: unlocked ? "#222A25" : "rgba(34,42,37,.6)",
        border: unlocked
          ? "1px solid rgba(184,138,69,.3)"
          : "1px solid rgba(213,195,154,.1)",
        boxShadow: "0 12px 26px rgba(0,0,0,.32)",
      }}
      aria-label={
        unlocked
          ? t(`artifacts.${artifact.id}.name`)
          : t("collection.detailLockedTitle")
      }
    >
      {state === "newly-unlocked" && (
        <span
          className="absolute left-2.5 top-2.5 z-[2] flex h-5 items-center rounded-[5px] px-2 text-[9.5px] font-extrabold tracking-[.08em]"
          style={{ background: "#c0533a", color: "#fbe9df" }}
        >
          {t("collection.newBadge")}
        </span>
      )}

      <div className="relative h-[104px] md:h-[160px] sm:h-[320px]">
        {unlocked ? (
          <div
            className="absolute inset-[10px] overflow-hidden rounded-[6px]"
            style={{
              background: "linear-gradient(160deg, #2b2115, #1c150c)",
              border: "1px solid rgba(184,138,69,.4)",
            }}
          >
            <img
              src={artifact.openImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ) : (
          <>
            <div
              className="absolute inset-[10px] overflow-hidden rounded-[6px]"
              style={{ border: "1px dashed rgba(213,195,154,.2)" }}
            >
              <img
                src={artifact.closedImage}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover opacity-60"
                style={{ filter: "saturate(.55) brightness(.75)" }}
                draggable={false}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <SealLockBadge />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-[5px] px-[13px] pb-3.5 pt-3">
        <div
          className="font-jetbrains text-[8.5px] font-bold tracking-[.08em]"
          style={{ color: unlocked ? accent : "#6d756c" }}
        >
          {t("collection.levelLabel", { order: artifact.unlockLevelOrder })}
        </div>
        <div
          className="min-h-[38px] font-cormorant text-[15.5px] font-semibold leading-[1.15]"
          style={{ color: unlocked ? "#D5C39A" : "#9aa398" }}
        >
          {unlocked
            ? t(`artifacts.${artifact.id}.name`)
            : t("collection.detailLockedTitle")}
        </div>
        <div className="text-[10.5px] font-medium leading-[1.4] text-[#6d756c]">
          {unlocked
            ? t("collection.cardUnlockedHint")
            : t("collection.cardLockedHint")}
        </div>
      </div>
    </button>
  );
}

function ArtifactDetailModal({
  artifact,
  state,
  onClose,
  onReplayLevel,
}: {
  artifact: ArtifactDefinition;
  state: ArtifactState;
  onClose: () => void;
  onReplayLevel: (() => void) | null;
}) {
  const { t } = useTranslation();
  const unlocked = state !== "locked";
  const chapter = getChapter(artifact.chapterId);
  const campaignTitle = t(chapter.titleKey);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(0,0,0,.55)" }}
        aria-label={t("collection.closeLabel")}
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="artifact-detail-title"
        className="relative z-10 grid w-[900px] max-w-[calc(100vw-32px)] grid-cols-1 overflow-hidden rounded-[16px] sm:grid-cols-[minmax(240px,340px)_1fr]"
        style={{
          background: "#222A25",
          border: "1px solid rgba(184,138,69,.35)",
          boxShadow: "0 44px 90px rgba(0,0,0,.6)",
          maxHeight: "calc(100vh - 32px)",
        }}
      >
        {/* Image column */}
        <div
          className="flex items-center justify-center p-6 sm:p-[30px]"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgba(213,195,154,.03) 0 14px, transparent 14px 28px)",
          }}
        >
          <div
            className="relative h-[160px] w-[160px] overflow-hidden rounded-[8px] sm:h-[220px] sm:w-[220px]"
            style={{
              background: "linear-gradient(160deg, #2b2115, #1c150c)",
              border: unlocked
                ? "1px solid rgba(184,138,69,.4)"
                : "1px dashed rgba(213,195,154,.25)",
              boxShadow: "0 20px 40px rgba(0,0,0,.5)",
            }}
          >
            <img
              src={unlocked ? artifact.openImage : artifact.closedImage}
              alt=""
              className="h-full w-full object-cover"
              style={
                unlocked
                  ? undefined
                  : { filter: "saturate(.55) brightness(.75)" }
              }
              draggable={false}
            />
            {!unlocked && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <SealLockBadge size={52} />
              </div>
            )}
          </div>
        </div>

        {/* Text column */}
        <div className="flex flex-col overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex items-start justify-between gap-3">
            <span
              className="inline-flex h-6 items-center gap-1.5 rounded-[6px] px-2.5 text-[10.5px] font-bold tracking-[.06em]"
              style={
                unlocked
                  ? {
                      color: "#6fc69e",
                      background: "rgba(111,198,158,.1)",
                      border: "1px solid rgba(111,198,158,.35)",
                    }
                  : {
                      color: "#9aa398",
                      background: "rgba(213,195,154,.06)",
                      border: "1px solid rgba(213,195,154,.16)",
                    }
              }
            >
              {unlocked && <CheckIcon />}
              {unlocked
                ? t("collection.detailStatusUnlocked")
                : t("collection.detailStatusLocked")}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-exp-parch transition hover:bg-white/5"
              style={{
                border: "1px solid rgba(213,195,154,.14)",
                background: "rgba(213,195,154,.05)",
              }}
              aria-label={t("collection.closeLabel")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <h2
            id="artifact-detail-title"
            className="mt-3 font-cormorant text-[26px] font-semibold leading-tight text-exp-parch sm:text-[34px]"
          >
            {unlocked
              ? t(`artifacts.${artifact.id}.name`)
              : t("collection.detailLockedTitle")}
          </h2>
          <div className="mt-1.5 font-jetbrains text-[11px] font-semibold tracking-[.08em] text-exp-muted">
            {t("collection.detailMeta", {
              campaign: campaignTitle,
              order: artifact.unlockLevelOrder,
            })}
          </div>

          <p
            className="mt-4 text-[13.5px] leading-[1.6]"
            style={{ color: "#a9b0a6" }}
          >
            {unlocked
              ? t(`artifacts.${artifact.id}.description`)
              : t("collection.detailLockedBody")}
          </p>

          <div
            className="mt-4 rounded-[10px] px-4 py-3 text-[12.5px] italic leading-[1.5]"
            style={{
              border: "1px dashed rgba(184,138,69,.45)",
              background: "rgba(184,138,69,.07)",
              color: "#c9a869",
            }}
          >
            {unlocked
              ? t(`artifacts.${artifact.id}.clue`)
              : t("collection.detailLockedHint", {
                  campaign: campaignTitle,
                  order: artifact.unlockLevelOrder,
                })}
          </div>

          {unlocked && (
            <div className="mt-2.5 text-[11.5px] font-medium text-exp-muted">
              {t(`artifacts.${artifact.id}.foundAt`)}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2.5 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] flex-1 rounded-[9px] text-[13.5px] font-semibold text-exp-parch"
              style={{
                border: "1px solid rgba(213,195,154,.2)",
                background: "rgba(213,195,154,.05)",
              }}
            >
              {t("collection.detailBack")}
            </button>
            {unlocked && onReplayLevel && (
              <button
                type="button"
                onClick={onReplayLevel}
                className="min-h-[46px] flex-1 rounded-[9px] border-none text-[14px] font-extrabold text-[#1a130a]"
                style={{
                  background: "linear-gradient(180deg, #d8af63, #b3812f)",
                  boxShadow:
                    "0 10px 26px rgba(184,138,69,.28), inset 0 1px 0 rgba(255,255,255,.3)",
                }}
              >
                {t("collection.detailReplay")}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function CollectionScreen() {
  const { t } = useTranslation();
  const navigate = useGameStore((state) => state.navigate);
  const startLevel = useGameStore((state) => state.startLevel);
  const markArtifactViewed = useGameStore((state) => state.markArtifactViewed);
  const artifactStates = useGameStore((state) => state.saveData.artifacts);
  const completedLevels = useGameStore(
    (state) => state.saveData.completedLevels,
  );

  const [filter, setFilter] = useState<CampaignFilter>("all");
  const [openedArtifactId, setOpenedArtifactId] = useState<string | null>(null);

  const totalUnlocked = useMemo(
    () =>
      artifactList.filter(
        (artifact) =>
          getArtifactState(artifactStates, artifact.id) !== "locked",
      ).length,
    [artifactStates],
  );

  const visibleChapters = chapterList.filter(
    (chapter) => filter === "all" || chapter.id === filter,
  );

  const openedArtifact = openedArtifactId
    ? (artifactList.find((artifact) => artifact.id === openedArtifactId) ??
      null)
    : null;

  function handleOpenArtifact(artifact: ArtifactDefinition) {
    setOpenedArtifactId(artifact.id);
    markArtifactViewed(artifact.id);
  }

  function handleReplayLevel(artifact: ArtifactDefinition) {
    const level = getArtifactLevel(artifact);
    if (!level) return;
    trackAnalyticsEvent("collection_replay_level_clicked", {
      artifactId: artifact.id,
      levelId: level.id,
      campaignId: artifact.chapterId,
    });
    setOpenedArtifactId(null);
    startLevel(level.id, "campaign");
  }

  const progressPct = Math.round((totalUnlocked / TOTAL_ARTIFACTS) * 100);

  return (
    <div className="h-dvh overflow-hidden bg-exp-bg font-manrope text-exp-parch">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(120% 60% at 50% -10%, rgba(47,106,87,.12), transparent 55%)",
        }}
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* Header */}
        <header
          className="app-screen-topbar relative flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-[34px]"
          style={{
            minHeight: 74,
            borderBottom: "1px solid rgba(213,195,154,.11)",
            background:
              "linear-gradient(180deg, rgba(34,42,37,.9), rgba(21,27,24,.35))",
          }}
        >
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate({ kind: "home" })}
              className="flex h-11 w-11 items-center justify-center rounded-[10px] text-exp-parch transition hover:bg-white/5"
              style={{
                border: "1px solid rgba(213,195,154,.14)",
                background: "rgba(213,195,154,.05)",
              }}
              aria-label={t("actions.back")}
            >
              <BackIcon />
            </button>
            <div>
              <div className="text-[10px] font-bold tracking-[.24em] text-exp-brass">
                {t("collection.eyebrow")}
              </div>
              <h1 className="mt-px font-cormorant text-[24px] font-semibold leading-tight text-exp-parch sm:text-[28px]">
                {t("collection.title")}
              </h1>
            </div>
          </div>
          {/* pr clears the floating settings gear pinned to the viewport corner */}
          <div className="flex flex-col items-end gap-1.5 pr-[36px] md:pr-[58px]">
            <span className="text-[15px] font-bold text-exp-brass2">
              {t("collection.progress", {
                done: totalUnlocked,
                total: TOTAL_ARTIFACTS,
              })}
            </span>
            <div
              className="h-1.5 w-[160px] overflow-hidden rounded-[2px] sm:w-[220px]"
              style={{ background: "rgba(213,195,154,.1)" }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #d8af63, #a9762f)",
                }}
              />
            </div>
          </div>
        </header>

        {/* Subtitle + filters */}
        <div className="relative shrink-0 px-5 pb-1.5 pt-[22px] md:pt-[8px] sm:px-[34px]">
          <p className="max-w-[700px] text-[13.5px] leading-[1.5] text-exp-muted">
            {t("collection.subtitle")}
          </p>
          <div className="mt-[18px] md:mt-[4px] flex flex-wrap gap-2.5">
            {[
              { key: "all" as const, label: t("collection.filterAll") },
              ...chapterList.map((chapter) => ({
                key: chapter.id,
                label: t(chapter.titleKey),
              })),
            ].map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className="flex h-11 md:h-8 items-center rounded-[8px] px-[18px] text-[12.5px] font-semibold transition"
                  style={
                    active
                      ? {
                          background: "rgba(184,138,69,.16)",
                          border: "1px solid rgba(184,138,69,.45)",
                          color: "#d8af63",
                          fontWeight: 700,
                        }
                      : {
                          border: "1px solid rgba(213,195,154,.14)",
                          background: "rgba(213,195,154,.04)",
                          color: "#a9b0a6",
                        }
                  }
                  aria-pressed={active}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Campaign sections */}
        <div className="map-scroll-area relative flex min-h-0 flex-1 flex-col gap-[26px] overflow-y-auto px-5 pb-[34px] pt-3 sm:px-[34px]">
          {visibleChapters.map((chapter) => {
            const chapterArtifacts = getChapterArtifacts(chapter.id);
            const unlockedCount = chapterArtifacts.filter(
              (artifact) =>
                getArtifactState(artifactStates, artifact.id) !== "locked",
            ).length;
            const accent = CAMPAIGN_ACCENT[chapter.id];
            const allCollected = unlockedCount === chapterArtifacts.length;

            return (
              <section key={chapter.id} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-[2px]"
                    style={{ transform: "rotate(45deg)", background: accent }}
                    aria-hidden="true"
                  />
                  <h2 className="font-cormorant text-[18px] font-semibold text-exp-parch sm:text-[20px]">
                    {t(chapter.titleKey)}
                  </h2>
                  {allCollected ? (
                    <span
                      className="inline-flex h-6 items-center gap-1.5 rounded-[6px] px-2.5 text-[11px] font-bold"
                      style={{
                        color: "#6fc69e",
                        background: "rgba(111,198,158,.1)",
                        border: "1px solid rgba(111,198,158,.35)",
                      }}
                    >
                      <CheckIcon />
                      {t("collection.campaignComplete", {
                        done: unlockedCount,
                        total: chapterArtifacts.length,
                      })}
                    </span>
                  ) : (
                    <span
                      className="font-jetbrains text-[12px] font-bold"
                      style={{ color: accent }}
                    >
                      {t("collection.campaignProgress", {
                        done: unlockedCount,
                        total: chapterArtifacts.length,
                      })}
                    </span>
                  )}
                  <div
                    className="h-px flex-1"
                    style={{ background: "rgba(213,195,154,.1)" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {chapterArtifacts.map((artifact) => (
                    <ArtifactCard
                      key={artifact.id}
                      artifact={artifact}
                      state={getArtifactState(artifactStates, artifact.id)}
                      onOpen={() => handleOpenArtifact(artifact)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {openedArtifact && (
        <ArtifactDetailModal
          artifact={openedArtifact}
          state={getArtifactState(artifactStates, openedArtifact.id)}
          onClose={() => setOpenedArtifactId(null)}
          onReplayLevel={(() => {
            const level = getArtifactLevel(openedArtifact);
            return level && completedLevels.includes(level.id)
              ? () => handleReplayLevel(openedArtifact)
              : null;
          })()}
        />
      )}
    </div>
  );
}
