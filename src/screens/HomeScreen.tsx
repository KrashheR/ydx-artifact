import React from "react";
import { useTranslation } from "react-i18next";
import {
  ARTIFACT_IDS,
  TOTAL_ARTIFACTS,
  artifactList
} from "@/content/artifacts";
import { chapters, getChapterLevels, type ChapterId } from "@/content/chapters";
import { dailyLevels } from "@/content/levels";
import { getChapterPreviewAsset } from "@/content/sceneAssets";
import { trackAnalyticsEvent } from "@/services/analytics/analytics";
import { useGameStore } from "@/shared/store/gameStore";

type CampaignId = "white" | "sand" | "emerald";
type CampaignStatus = "available" | "in_progress" | "completed" | "locked";

type Campaign = {
  id: CampaignId;
  chapterId: ChapterId;
  status: CampaignStatus;
  done: number;
  total: number;
  nextLevelTitle: string | null;
  lockHint?: string;
};

const CAMPAIGN_BY_ID: Record<CampaignId, ChapterId> = {
  white: "northern-route",
  sand: "sand-meridian",
  emerald: "emerald-meridian"
};

function todaysDailyIndex() {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % dailyLevels.length;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function CompassIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="16" stroke="#B88A45" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2" fill="#B88A45" />
      <path d="M18 5.5 21 18l-3 4.5L15 18 18 5.5Z" fill="#D8AF63" />
      <path d="M18 30.5 21 18l-3-4.5L15 18l3 12.5Z" fill="#879087" />
      <text
        x="18"
        y="11"
        textAnchor="middle"
        fill="#D5C39A"
        fontSize="5"
        style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700 }}
      >
        N
      </text>
    </svg>
  );
}

function SettingsGearIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.06-.4.1-.8.1-1.2Z" />
    </svg>
  );
}

function LockIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="1.6" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon({ size = 14, color = "#6FC69E" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 6" />
    </svg>
  );
}

function LightbulbIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6.5 6.5 0 0 0-3.8 11.8c.6.5 1.3 1.3 1.3 2.2h5a2.7 2.7 0 0 1 1.3-2.2A6.5 6.5 0 0 0 12 3Z" />
    </svg>
  );
}

function CalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3v4M17 3v4M4 9h16" />
      <rect x="4" y="5" width="16" height="16" rx="2" />
    </svg>
  );
}

function FlameIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#D8AF63" aria-hidden="true">
      <path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-2-1-3-1-5 3 2 5 5 5 8a7 7 0 0 1-14 0c0-6 6-8 7-12Z" />
    </svg>
  );
}

function FolderIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h6l2 2h8v10H4Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5Z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
      <path d="M9 4v13M15 6.5v13" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function SegmentBar({
  done,
  total,
  complete = false
}: {
  done: number;
  total: number;
  complete?: boolean;
}) {
  return (
    <div className="flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className="h-[6px] flex-1 rounded-[2px]"
          style={{
            background:
              index < done
                ? complete
                  ? "linear-gradient(180deg,#6FC69E,#2F6A57)"
                  : "linear-gradient(180deg,#D8AF63,#A9762F)"
                : "rgba(213,195,154,.1)"
          }}
        />
      ))}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  className = "",
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[7px] px-5 text-[13.5px] font-extrabold text-[#1A130A] transition hover:brightness-105 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      style={{
        background: "linear-gradient(180deg,#D8AF63,#B3812F)",
        boxShadow:
          "0 8px 18px rgba(184,138,69,.25), inset 0 1px 0 rgba(255,255,255,.3)"
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[7px] border border-exp-parch/[.2] bg-exp-parch/[.05] px-4 text-[13px] font-semibold text-exp-parch transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass ${className}`}
    >
      {children}
    </button>
  );
}

function TopBar({
  magnifiers,
  saveState,
  onOpenSettings
}: {
  magnifiers: number;
  saveState: "idle" | "saving" | "saved" | "local-only";
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation();
  const saveKey = saveState === "local-only" ? "localOnly" : saveState;

  return (
    <header className="home-topbar app-screen-topbar flex h-[70px] items-center justify-between px-5 md:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <CompassIcon size={34} />
        <div className="min-w-0 leading-none">
          <p className="text-[9px] font-bold uppercase tracking-[.28em] text-exp-brass">
            {t("campaigns.supra")}
          </p>
          <p className="mt-[3px] truncate text-[12px] font-medium text-exp-parch/80">
            {t("app.title")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="hidden items-center gap-2 text-[11px] font-semibold text-exp-muted sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${saveState === "saving" ? "animate-pulse bg-exp-brass2" : "bg-exp-success"}`}
            aria-hidden="true"
          />
          <span>{t(`homeHub.save.${saveKey}`)}</span>
        </div>
        <div
          className="flex h-10 items-center gap-2 rounded-[8px] border border-exp-brass/[.35] bg-exp-brass/[.08] px-3 text-exp-brass2"
          title={t("homeHub.hints")}
        >
          <LightbulbIcon size={16} />
          <span className="font-jetbrains text-[13px] font-bold">{magnifiers}</span>
          <span className="hidden text-[11px] font-semibold text-exp-parch/75 sm:inline">
            {t("homeHub.hintsShort")}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={t("actions.settings")}
          title={t("actions.settings")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] border border-exp-parch/[.14] bg-exp-parch/[.05] text-exp-parch transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
        >
          <SettingsGearIcon />
        </button>
      </div>
    </header>
  );
}

function CurrentCaseCard({
  campaign,
  onContinue,
  onOpenMap
}: {
  campaign: Campaign;
  onContinue: () => void;
  onOpenMap: () => void;
}) {
  const { t } = useTranslation();
  const complete = campaign.status === "completed";
  const almostComplete = campaign.total - campaign.done <= 2 && !complete;
  const previewSrc = getChapterPreviewAsset(campaign.chapterId);

  return (
    <section
      className="home-case-card relative flex min-h-[320px] flex-col overflow-hidden rounded-[12px] border p-5 sm:p-6"
      style={{
        background: "#222A25",
        borderColor: almostComplete
          ? "rgba(216,175,99,.5)"
          : complete
            ? "rgba(111,198,158,.4)"
            : "rgba(184,138,69,.3)",
        boxShadow: "0 14px 32px rgba(0,0,0,.32)"
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: complete
            ? "linear-gradient(90deg,#6FC69E,#2F6A57)"
            : "linear-gradient(90deg,#D8AF63,#A9762F)"
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[.26em] text-exp-brass">
          {complete ? t("homeHub.currentCase.completeEyebrow") : t("homeHub.currentCase.eyebrow")}
        </span>
        <span className="rounded-[4px] border border-exp-parch/[.16] px-2 py-0.5 font-jetbrains text-[10px] text-exp-muted">
          {t("homeHub.currentCase.caseNumber")}
        </span>
      </div>
      <div className="mt-4 aspect-[16/9] w-full overflow-hidden rounded-[8px] border border-exp-parch/[.12] bg-exp-ink">
        <img
          src={previewSrc}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
      <h1 className="mt-3 font-cormorant text-[38px] font-semibold leading-none text-exp-parch sm:text-[46px]">
        {t(`campaigns.${campaign.id}.title`)}
      </h1>
      <p className="mt-2 text-[13px] font-medium leading-[1.5] text-exp-muted">
        {t("homeHub.currentCase.restored", {
          done: campaign.done,
          total: campaign.total
        })}
      </p>
      <div className="mt-4">
        <SegmentBar done={campaign.done} total={campaign.total} complete={complete} />
      </div>
      <div className="mt-5 flex flex-col gap-2 text-[12px] font-medium text-exp-muted">
        <div className="flex items-center gap-2">
          <span className="text-exp-brass2">
            <PinIcon />
          </span>
          <span>
            {t("homeHub.currentCase.nextPoint")}{" "}
            <span className="font-semibold text-exp-parch">
              {campaign.nextLevelTitle ?? t("homeHub.currentCase.closed")}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-exp-brass2">
            <FolderIcon size={13} />
          </span>
          <span>
            {complete
              ? t("homeHub.currentCase.nextCaseUnlocked")
              : t("homeHub.currentCase.toFind", {
                  count: Math.max(1, campaign.total - campaign.done)
                })}
          </span>
        </div>
      </div>
      <div className="mt-auto flex gap-2 pt-6">
        <PrimaryButton onClick={onContinue} className="flex-1">
          <PlayIcon />
          {complete ? t("homeHub.currentCase.openReport") : t("homeHub.currentCase.continue")}
        </PrimaryButton>
        <SecondaryButton onClick={onOpenMap} className="w-[52px] px-0" >
          <MapIcon />
        </SecondaryButton>
      </div>
    </section>
  );
}

function DailyArchiveCard({
  title,
  streak,
  claimed,
  onOpen
}: {
  title: string;
  streak: number;
  claimed: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="flex min-h-[168px] flex-col rounded-[12px] border border-exp-parch/[.14] bg-exp-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-exp-brass">
          <CalendarIcon size={15} />
          <span className="text-[10px] font-bold uppercase tracking-[.2em]">
            {t("homeHub.daily.eyebrow")}
          </span>
        </div>
        <span className="inline-flex h-[22px] items-center gap-1 rounded-[5px] border border-exp-brass/[.35] bg-exp-brass/[.14] px-2 text-[9px] font-bold text-exp-brass2">
          <FlameIcon size={11} />
          {t("homeHub.daily.streak", { count: streak })}
        </span>
      </div>
      <h2 className="mt-3 font-cormorant text-[23px] font-semibold leading-tight text-exp-parch">
        {title}
      </h2>
      <p className="mt-1 text-[12px] font-medium text-exp-muted">
        {claimed ? t("homeHub.daily.claimed") : t("homeHub.daily.reward")}
      </p>
      <div className="mt-auto pt-4">
        <PrimaryButton onClick={onOpen} disabled={claimed} className="w-full min-h-[40px] text-[12px]">
          {claimed ? <CheckIcon size={13} color="#1A130A" /> : <LightbulbIcon size={14} />}
          {claimed ? t("homeHub.daily.claimedCta") : t("homeHub.daily.open")}
        </PrimaryButton>
      </div>
    </section>
  );
}

function ArchiveSlot({
  unlocked,
  isNew,
  image,
  label
}: {
  unlocked: boolean;
  isNew: boolean;
  image: string;
  label: string;
}) {
  return (
    <div
      className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[4px]"
      style={{
        background: unlocked
          ? "#2b2115"
          : "repeating-linear-gradient(45deg,rgba(184,138,69,.05) 0 6px,rgba(213,195,154,.02) 6px 12px)",
        border: unlocked
          ? "1px solid rgba(184,138,69,.4)"
          : "1px dashed rgba(213,195,154,.22)",
        boxShadow: unlocked ? "0 3px 8px rgba(0,0,0,.35)" : "none",
        transform: unlocked ? "rotate(-2deg)" : undefined
      }}
      aria-label={label}
      title={label}
    >
      {unlocked ? (
        <>
          <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
          <span className="absolute bottom-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-exp-success" />
          {isNew && (
            <span
              className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 30%,#C96A44,#832F18)",
                boxShadow: "0 2px 5px rgba(0,0,0,.5)"
              }}
            />
          )}
        </>
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-exp-parch/[.18] font-cormorant text-[13px] font-semibold text-[#5D655D]">
          ?
        </span>
      )}
    </div>
  );
}

function FieldArchiveCard({
  collectionDone,
  collectionHasNew,
  artifactStates,
  onOpen
}: {
  collectionDone: number;
  collectionHasNew: boolean;
  artifactStates: Record<string, string>;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const previewArtifacts = artifactList.slice(0, 8);

  return (
    <section className="relative flex min-h-[168px] flex-col rounded-[3px_12px_12px_12px] border border-exp-parch/[.14] bg-exp-panel p-4 pt-5">
      <div className="absolute -top-[11px] left-3 flex items-center gap-1.5 rounded-[3px_6px_0_0] border border-b-0 border-exp-parch/[.16] bg-[#262E28] px-2 py-[3px] pb-[6px] text-exp-brass">
        <FolderIcon size={11} />
        <span className="text-[9px] font-bold uppercase tracking-[.16em]">
          {t("homeHub.archive.tab")}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[.2em] text-exp-brass">
          {t("homeHub.archive.eyebrow")}
        </h2>
        <span className="font-jetbrains text-[13px] font-semibold text-exp-brass2">
          {collectionDone}
          <span className="text-exp-muted">/{TOTAL_ARTIFACTS}</span>
        </span>
      </div>
      <p className="mt-1 text-[11.5px] font-medium text-exp-muted">
        {t("homeHub.archive.progress", {
          done: collectionDone,
          total: TOTAL_ARTIFACTS
        })}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {previewArtifacts.map((artifact) => {
          const state = artifactStates[artifact.id] ?? "locked";
          const unlocked = state !== "locked";
          return (
            <ArchiveSlot
              key={artifact.id}
              unlocked={unlocked}
              isNew={state === "newly-unlocked"}
              image={unlocked ? artifact.openImage : artifact.closedImage}
              label={t(`artifacts.${artifact.id}.name`)}
            />
          );
        })}
      </div>
      <div className="mt-auto pt-4">
        <SecondaryButton onClick={onOpen} className="relative w-full">
          {collectionHasNew && (
            <span className="absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#C0533A]" />
          )}
          {t("homeHub.archive.open")}
        </SecondaryButton>
      </div>
    </section>
  );
}

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { t } = useTranslation();
  const style =
    status === "completed"
      ? "border-exp-success/[.35] bg-exp-success/[.1] text-exp-success"
      : status === "locked"
        ? "border-exp-parch/[.18] bg-exp-parch/[.06] text-exp-muted"
        : status === "available"
          ? "bg-[#B85C38] text-[#F5EFE0] border-transparent"
          : "border-exp-success/[.35] bg-exp-success/[.1] text-exp-success";

  return (
    <span className={`inline-flex h-[20px] items-center rounded-[5px] border px-2 text-[8.5px] font-bold uppercase tracking-[.08em] ${style}`}>
      {t(`homeHub.campaignStatus.${status}`)}
    </span>
  );
}

function CampaignMiniList({
  campaigns,
  onOpenCampaign
}: {
  campaigns: Campaign[];
  onOpenCampaign: (id: CampaignId) => void;
}) {
  const { t } = useTranslation();
  const nearest = campaigns.find((campaign) => campaign.status !== "completed");

  return (
    <section className="home-campaign-list flex min-h-[320px] flex-col gap-2.5 rounded-[12px] border border-exp-parch/[.1] bg-exp-panel/60 p-4">
      <span className="text-[10px] font-bold uppercase tracking-[.2em] text-exp-brass">
        {t("homeHub.campaigns.eyebrow")}
      </span>
      {campaigns.map((campaign) => {
        const locked = campaign.status === "locked";
        return (
          <button
            key={campaign.id}
            type="button"
            onClick={() => onOpenCampaign(campaign.id)}
            className="flex min-h-[56px] items-center gap-3 rounded-[9px] border px-3 py-2.5 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
            style={{
              background: locked ? "rgba(213,195,154,.03)" : "rgba(213,195,154,.05)",
              borderColor:
                campaign.status === "in_progress"
                  ? "rgba(184,138,69,.35)"
                  : "rgba(213,195,154,.1)"
            }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-exp-brass2">
              {campaign.status === "completed" ? (
                <CheckIcon size={13} />
              ) : locked ? (
                <LockIcon size={14} color="#879087" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-exp-success" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block truncate text-[13px] font-semibold ${locked ? "text-[#9AA398]" : "text-exp-parch"}`}>
                {t(`campaigns.${campaign.id}.title`)}
              </span>
              <span className={`mt-0.5 block text-[10.5px] ${locked ? "text-[#6D756C]" : "font-jetbrains text-exp-brass2"}`}>
                {locked
                  ? campaign.lockHint
                  : t("homeHub.campaigns.progress", {
                      done: campaign.done,
                      total: campaign.total
                    })}
              </span>
            </span>
            <CampaignStatusBadge status={campaign.status} />
          </button>
        );
      })}
      <div className="mt-auto flex items-center gap-2 pt-2 text-[11px] font-medium text-exp-muted">
        <span className="text-exp-brass2">
          <FolderIcon size={13} />
        </span>
        <span>
          {t("homeHub.campaigns.nearest")}{" "}
          <span className="font-semibold text-exp-brass2">
            {nearest ? t(`campaigns.${nearest.id}.title`) : t("homeHub.currentCase.closed")}
          </span>
        </span>
      </div>
    </section>
  );
}

function getCampaignProgress(
  chapterId: ChapterId,
  completedLevels: string[],
  t: ReturnType<typeof useTranslation>["t"]
) {
  const levels = getChapterLevels(chapterId);
  const done = levels.filter((level) => completedLevels.includes(level.id)).length;
  const nextLevel = levels.find((level) => !completedLevels.includes(level.id));
  return {
    done,
    total: levels.length,
    nextLevelTitle: nextLevel ? t(nextLevel.titleKey) : null
  };
}

export function HomeScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { t } = useTranslation();
  const navigate = useGameStore((state) => state.navigate);
  const completedLevels = useGameStore((state) => state.saveData.completedLevels);
  const artifactStates = useGameStore((state) => state.saveData.artifacts);
  const daily = useGameStore((state) => state.saveData.daily);
  const magnifiers = useGameStore((state) => state.saveData.magnifiers);
  const saveStatus = useGameStore((state) => state.saveStatus);

  const whiteProgress = getCampaignProgress("northern-route", completedLevels, t);
  const sandProgress = getCampaignProgress("sand-meridian", completedLevels, t);
  const emeraldProgress = getCampaignProgress("emerald-meridian", completedLevels, t);

  const sandUnlocked = whiteProgress.done === whiteProgress.total;
  const emeraldUnlocked = sandProgress.done === sandProgress.total;

  const campaigns: Campaign[] = [
    {
      id: "white",
      chapterId: "northern-route",
      status:
        whiteProgress.done === 0
          ? "available"
          : whiteProgress.done === whiteProgress.total
            ? "completed"
            : "in_progress",
      ...whiteProgress
    },
    {
      id: "sand",
      chapterId: "sand-meridian",
      status: !sandUnlocked
        ? "locked"
        : sandProgress.done === 0
          ? "available"
          : sandProgress.done === sandProgress.total
            ? "completed"
            : "in_progress",
      lockHint: sandUnlocked
        ? undefined
        : t("campaigns.sand.levelsLeft", {
            count: whiteProgress.total - whiteProgress.done
          }),
      ...sandProgress
    },
    {
      id: "emerald",
      chapterId: "emerald-meridian",
      status: !emeraldUnlocked
        ? "locked"
        : emeraldProgress.done === 0
          ? "available"
          : emeraldProgress.done === emeraldProgress.total
            ? "completed"
            : "in_progress",
      lockHint: emeraldUnlocked
        ? undefined
        : t("campaigns.emerald.levelsLeft", {
            count: sandProgress.total - sandProgress.done
          }),
      ...emeraldProgress
    }
  ];

  const activeCampaign =
    campaigns.find((campaign) => campaign.status === "in_progress") ??
    campaigns.find((campaign) => campaign.status === "available") ??
    campaigns[campaigns.length - 1];

  const collectionDone = ARTIFACT_IDS.filter(
    (artifactId) => (artifactStates[artifactId] ?? "locked") !== "locked"
  ).length;
  const collectionHasNew = ARTIFACT_IDS.some(
    (artifactId) => artifactStates[artifactId] === "newly-unlocked"
  );
  const dailyEntry = dailyLevels[todaysDailyIndex()];
  const dailyClaimed = daily.lastClaimDate === todayKey();

  const openCollection = (source: string) => {
    trackAnalyticsEvent("collection_opened", {
      source,
      unlockedArtifacts: collectionDone,
      hasNew: collectionHasNew
    });
    navigate({ kind: "collection" });
  };

  const openCampaign = (campaignId: CampaignId) => {
    const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId);
    trackAnalyticsEvent("campaign_selected", {
      campaignCardId: campaignId,
      campaignStatus: selectedCampaign?.status,
      completedInCampaign: selectedCampaign?.done,
      totalInCampaign: selectedCampaign?.total
    });

    if (!selectedCampaign || selectedCampaign.status === "locked") {
      trackAnalyticsEvent("locked_campaign_clicked", {
        campaignCardId: campaignId,
        campaignStatus: selectedCampaign?.status,
        completedInCampaign: selectedCampaign?.done,
        totalInCampaign: selectedCampaign?.total
      });
      return;
    }

    navigate({ kind: "map", chapterId: chapters[CAMPAIGN_BY_ID[campaignId]].id });
  };

  const openDaily = () => {
    trackAnalyticsEvent("daily_opened", {
      source: "home_hub",
      streak: daily.streak,
      claimed: dailyClaimed
    });
    navigate({ kind: "daily" });
  };

  return (
    <div className="home-screen min-h-screen overflow-hidden bg-exp-bg font-manrope text-exp-parch">
      <TopBar
        magnifiers={magnifiers}
        saveState={saveStatus}
        onOpenSettings={onOpenSettings}
      />

      <main className="home-hub-shell mx-auto flex h-[calc(100dvh-70px)] w-full max-w-[1440px] flex-col px-5 py-5 md:px-8 md:py-6">
        <section className="home-hub-header mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[.34em] text-exp-brass">
            {t("homeHub.eyebrow")}
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-cormorant text-[34px] font-semibold leading-none text-exp-parch md:text-[44px]">
                {t("homeHub.title")}
              </h1>
              <p className="mt-2 max-w-[620px] text-[13.5px] leading-[1.5] text-exp-muted">
                {t("homeHub.subtitle")}
              </p>
            </div>
            <div className="hidden rounded-[7px] border border-exp-parch/[.12] bg-exp-parch/[.04] px-3 py-2 font-jetbrains text-[11px] text-exp-muted md:block">
              {t("homeHub.totalProgress", {
                done: completedLevels.length,
                total: campaigns.reduce((sum, campaign) => sum + campaign.total, 0)
              })}
            </div>
          </div>
        </section>

        <div className="home-hub-grid grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(260px,.72fr)_minmax(300px,.78fr)]">
          <CurrentCaseCard
            campaign={activeCampaign}
            onContinue={() => openCampaign(activeCampaign.id)}
            onOpenMap={() => openCampaign(activeCampaign.id)}
          />

          <div className="home-side-grid grid min-h-0 grid-rows-2 gap-4">
            <DailyArchiveCard
              title={t(dailyEntry.titleKey)}
              streak={daily.streak}
              claimed={dailyClaimed}
              onOpen={openDaily}
            />
            <FieldArchiveCard
              collectionDone={collectionDone}
              collectionHasNew={collectionHasNew}
              artifactStates={artifactStates}
              onOpen={() => openCollection("home_field_archive")}
            />
          </div>

          <CampaignMiniList campaigns={campaigns} onOpenCampaign={openCampaign} />
        </div>
      </main>
    </div>
  );
}
