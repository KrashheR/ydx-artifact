import React from "react";
import { useTranslation } from "react-i18next";
import { chapters, getChapterLevels } from "@/content/chapters";
import { getChapterPreviewAsset } from "@/content/sceneAssets";
import { useGameStore } from "@/shared/store/gameStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignId = "white" | "sand" | "emerald";
type CampaignStatus = "available" | "in_progress" | "completed" | "locked";

interface Campaign {
  id: CampaignId;
  status: CampaignStatus;
  done: number;
  total: number;
  lastLevelName?: string | null;
  nextLevelId?: string;
  lockHint?: string;
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function CompassIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="18" cy="18" r="16" stroke="#B88A45" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2" fill="#B88A45" />
      <polygon points="18,6 20.5,18 18,22 15.5,18" fill="#D8AF63" />
      <polygon points="18,30 20.5,18 18,14 15.5,18" fill="#879087" />
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

function LockIcon({
  size = 18,
  color = "#879087",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="8"
        width="12"
        height="9"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M6 8V6a3 3 0 0 1 6 0v2"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({
  size = 14,
  color = "#6FC69E",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 7l3.5 3.5L12 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SnowflakeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="10"
        y1="2"
        x2="10"
        y2="18"
        stroke="#D5C39A"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="10"
        x2="18"
        y2="10"
        stroke="#D5C39A"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="4"
        x2="16"
        y2="16"
        stroke="#D5C39A"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="4"
        x2="4"
        y2="16"
        stroke="#D5C39A"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="2" fill="#D5C39A" />
    </svg>
  );
}

function SunIcon({ size = 20 }: { size?: number }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="3.5" stroke="#D5C39A" strokeWidth="1.4" />
      {rays.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 10 + 5 * Math.cos(rad);
        const y1 = 10 + 5 * Math.sin(rad);
        const x2 = 10 + 8 * Math.cos(rad);
        const y2 = 10 + 8 * Math.sin(rad);
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#D5C39A"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function LeafIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 18C10 18 3 13 3 8C3 4.5 6.5 2 10 2C13.5 2 17 4.5 17 8C17 13 10 18 10 18Z"
        stroke="#D5C39A"
        strokeWidth="1.4"
        fill="none"
      />
      <line
        x1="10"
        y1="18"
        x2="10"
        y2="8"
        stroke="#D5C39A"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Preview backgrounds ──────────────────────────────────────────────────────

const PREVIEW_BG: Record<CampaignId, string> = {
  white:
    "radial-gradient(ellipse at 50% -10%, #9FBAC3 0%, #274659 45%, #152431 100%)",
  sand: "linear-gradient(180deg, #3A2C18 0%, #7A5A2F 50%, #E3C489 100%)",
  emerald: "linear-gradient(180deg, #0E211A 0%, #1C3A2C 50%, #3C6F52 100%)",
};

const PREVIEW_IMAGE: Record<CampaignId, string> = {
  white: getChapterPreviewAsset("northern-route"),
  sand: getChapterPreviewAsset("sand-meridian"),
  emerald: getChapterPreviewAsset("emerald-meridian"),
};

const CAMPAIGN_SYMBOL: Record<
  CampaignId,
  (props: { size?: number }) => React.ReactElement
> = {
  white: SnowflakeIcon,
  sand: SunIcon,
  emerald: LeafIcon,
};

// ─── Status badge colours ─────────────────────────────────────────────────────

const STATUS_STYLE: Record<
  CampaignStatus,
  { accent: string; bg: string; border: string; text: string }
> = {
  in_progress: {
    accent: "#D8AF63",
    bg: "rgba(31,28,21,.72)",
    border: "rgba(216,175,99,.44)",
    text: "#F0D9A4",
  },
  available: {
    accent: "#6FC69E",
    bg: "rgba(23,38,32,.72)",
    border: "rgba(111,198,158,.42)",
    text: "#BCE7D0",
  },
  completed: {
    accent: "#9BD9BB",
    bg: "rgba(23,40,33,.72)",
    border: "rgba(155,217,187,.42)",
    text: "#CDEFD9",
  },
  locked: {
    accent: "#879087",
    bg: "rgba(31,35,33,.72)",
    border: "rgba(135,144,135,.36)",
    text: "#C8C5B8",
  },
};

// ─── Segmented progress bar ───────────────────────────────────────────────────

function SegmentBar({ done, total = 13 }: { done: number; total?: number }) {
  const complete = done === total;
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-[7px] flex-1 rounded-[2px]"
          style={{
            background:
              i < done
                ? complete
                  ? "linear-gradient(180deg,#6FC69E,#2F6A57)"
                  : "linear-gradient(180deg,#D8AF63,#A9762F)"
                : "rgba(213,195,154,0.10)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  label,
}: {
  status: CampaignStatus;
  label: string;
}) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="absolute left-2 top-2 inline-flex max-w-[calc(100%-16px)] items-center gap-1.5 rounded-[5px] border py-[3px] pl-[6px] pr-[8px] text-[9px] font-bold uppercase leading-none tracking-[.07em] sm:left-2.5 sm:top-2.5 sm:py-[4px] sm:pl-[7px] sm:pr-[9px] sm:text-[10px] md:hidden"
      style={{
        background: s.bg,
        borderColor: s.border,
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 12px rgba(0,0,0,.24)",
        color: s.text,
        textShadow: "0 1px 1px rgba(0,0,0,.55)",
      }}
    >
      <span
        className="h-[10px] w-[2px] flex-shrink-0 rounded-full sm:h-[11px]"
        style={{ background: s.accent }}
      />
      {label}
    </span>
  );
}

// ─── Lock info box ────────────────────────────────────────────────────────────

function LockInfoBox({ reason, hint }: { reason: string; hint: string }) {
  return (
    <div
      className="home-lock-info flex items-start gap-2.5 rounded-[8px] px-3 py-2.5"
      style={{
        background: "rgba(135,144,135,0.08)",
        border: "1px solid rgba(213,195,154,0.08)",
      }}
    >
      <span className="mt-[1px] flex-shrink-0">
        <LockIcon size={15} color="#879087" />
      </span>
      <div>
        <p className="text-[12.5px] leading-[1.5] text-exp-parch/70">
          {reason}
        </p>
        <p className="mt-0.5 text-[11px] text-exp-muted">{hint}</p>
      </div>
    </div>
  );
}

// ─── Brass primary button ─────────────────────────────────────────────────────

function BrassButton({
  onClick,
  height = 46,
  children,
}: {
  onClick?: () => void;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center rounded-[8px] text-[14px] font-bold text-[#1A130A] transition hover:opacity-90 active:opacity-80"
      style={{
        height,
        background: "linear-gradient(180deg,#D8AF63,#B88A45)",
        boxShadow:
          "0 8px 20px rgba(184,138,69,0.28), inset 0 1px 0 rgba(255,255,255,0.3)",
      }}
    >
      {children}
    </button>
  );
}

// ─── Round icon button ────────────────────────────────────────────────────────

// ─── Top bar ─────────────────────────────────────────────────────────────────

function CarouselArrow({
  direction,
  label,
  onClick,
}: {
  direction: "previous" | "next";
  label: string;
  onClick: () => void;
}) {
  const isPrevious = direction === "previous";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border transition active:scale-95 ${
        isPrevious ? "left-2" : "right-2"
      }`}
      style={{
        background: "rgba(21,27,24,0.78)",
        borderColor: "rgba(213,195,154,0.2)",
        boxShadow: "0 10px 24px rgba(0,0,0,.34)",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className={isPrevious ? "" : "rotate-180"}
      >
        <path
          d="M12.5 4.5 7 10l5.5 5.5"
          stroke="#D8AF63"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function TopBar({
  totalDone,
  totalAll,
  onOpenSettings,
}: {
  totalDone: number;
  totalAll: number;
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation();

  return (
    <header
      className="app-screen-topbar home-topbar flex items-center justify-between px-5 md:px-10"
      style={{
        height: 78,
        borderBottom: "1px solid rgba(213,195,154,0.12)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <CompassIcon size={34} />
        <div className="leading-none">
          <p className="text-[9px] font-bold uppercase tracking-[.28em] text-exp-brass2">
            {t("campaigns.supra")}
          </p>
          <p className="mt-[3px] text-[12px] font-medium text-exp-parch/80">
            {t("app.title")}
          </p>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Overall progress (desktop only) */}
        <div className="hidden flex-col items-end gap-1 md:flex">
          <p className="text-[11px] text-exp-muted">
            {t("campaigns.totalProgress", { done: totalDone, total: totalAll })}
          </p>
          <div
            className="h-[5px] w-24 overflow-hidden rounded-full"
            style={{ background: "rgba(213,195,154,0.12)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((totalDone / totalAll) * 100))}%`,
                background: "linear-gradient(90deg,#B88A45,#D8AF63)",
              }}
            />
          </div>
        </div>

        {/* Vertical divider (desktop) */}
        <div
          className="hidden h-6 w-px md:block"
          style={{ background: "rgba(213,195,154,0.15)" }}
        />
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={t("actions.settings")}
          title={t("actions.settings")}
          className="home-settings-button flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] text-exp-parch transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
          style={{
            border: "1px solid rgba(213,195,154,.14)",
            background: "rgba(213,195,154,.05)",
          }}
        >
          <SettingsGearIcon />
        </button>
      </div>
    </header>
  );
}

// ─── Route sequence ───────────────────────────────────────────────────────────

function RouteSequence({
  statuses,
  labels,
}: {
  statuses: CampaignStatus[];
  labels: string[];
}) {
  const isActive = (s: CampaignStatus) =>
    s === "available" || s === "in_progress" || s === "completed";

  return (
    <div className="flex items-center justify-center py-5">
      {statuses.map((status, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <div
              className="w-[110px]"
              style={{ borderTop: "1px dashed rgba(213,195,154,0.22)" }}
            />
          )}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
              style={
                isActive(status)
                  ? { background: "#B88A45", border: "1px solid #B88A45" }
                  : {
                      background: "transparent",
                      border: "1px solid rgba(213,195,154,0.28)",
                    }
              }
            >
              {status === "completed" ? (
                <CheckIcon size={10} color="#151B18" />
              ) : status === "locked" ? (
                <LockIcon size={10} color="rgba(213,195,154,0.35)" />
              ) : (
                <div className="h-[6px] w-[6px] rounded-full bg-exp-bg" />
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[.12em] text-exp-muted">
              {labels[i]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Desktop campaign card ────────────────────────────────────────────────────

function DesktopCard({
  campaign,
  onContinue,
  isLandscapeCarouselActive = true,
}: {
  campaign: Campaign;
  onContinue: () => void;
  isLandscapeCarouselActive?: boolean;
}) {
  const { t } = useTranslation();
  const locked = campaign.status === "locked";
  const isHighlighted =
    campaign.status === "in_progress" || campaign.status === "available";
  const Symbol = CAMPAIGN_SYMBOL[campaign.id];

  return (
    <div
      aria-hidden={!isLandscapeCarouselActive}
      className={`home-campaign-card flex flex-1 flex-col overflow-hidden rounded-[12px] transition-all duration-300 hover:-translate-y-0.5 ${
        isLandscapeCarouselActive
          ? "home-campaign-card--landscape-active"
          : "home-campaign-card--landscape-inactive"
      }`}
      style={{
        background: "#222A25",
        border: isHighlighted
          ? "1px solid rgba(184,138,69,0.28)"
          : "1px solid rgba(213,195,154,0.10)",
        boxShadow: isHighlighted
          ? "0 22px 50px rgba(0,0,0,.42)"
          : "0 16px 38px rgba(0,0,0,.32)",
      }}
    >
      {/* Preview */}
      <div
        className="relative h-[216px] overflow-hidden flex-shrink-0"
        style={{ background: PREVIEW_BG[campaign.id] }}
      >
        <img
          src={PREVIEW_IMAGE[campaign.id]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,transparent 50%,rgba(13,20,26,0.7) 100%)",
          }}
        />

        <StatusBadge
          status={campaign.status}
          label={t(`campaigns.status.${campaign.status}`)}
        />

        {locked ? (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle,rgba(21,27,24,.18),rgba(21,27,24,.66))",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-[74px] w-[74px] items-center justify-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle,rgba(40,50,45,0.88),rgba(21,27,24,0.96))",
                  boxShadow: "0 0 0 2px rgba(213,195,154,0.12)",
                }}
              >
                <LockIcon size={28} color="#879087" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="absolute right-3 top-3 flex h-[38px] w-[38px] items-center justify-center rounded-full md:hidden"
              style={{ background: "rgba(21,27,24,.62)" }}
            >
              <Symbol size={20} />
            </div>
            <p className="absolute bottom-2.5 right-3 text-[10px] font-bold tracking-[.12em] text-exp-parch/70">
              {t("campaigns.levelCount", { count: campaign.total })}
            </p>
          </>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-[18px_20px_20px]">
        {/* Title row */}
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-cormorant text-[27px] font-semibold leading-tight text-exp-parch md:text-[20px]">
            {t(`campaigns.${campaign.id}.title`)}
          </h2>
          <span
            className="home-campaign-progress flex-shrink-0 font-bold text-exp-brass"
            style={{ fontSize: 18 }}
          >
            {String(campaign.done).padStart(2, "0")}{" "}
            <span className="text-[13px] font-medium text-exp-muted">
              / {String(campaign.total).padStart(2, "0")}
            </span>
          </span>
        </div>

        {/* Description */}
        <p className="mt-2 min-h-[39px] text-[12.5px] leading-[1.55] text-exp-muted">
          {t(`campaigns.${campaign.id}.description`)}
        </p>

        {/* Footer section */}
        <div className="flex flex-1 flex-col pt-4">
          {!locked ? (
            <>
              <SegmentBar done={campaign.done} total={campaign.total} />
              {campaign.lastLevelName && (
                <p className="mt-2 text-[11px] text-exp-muted">
                  {t("campaigns.lastLevel", { name: campaign.lastLevelName })}
                </p>
              )}
              <div className="mt-auto pt-4">
                <BrassButton onClick={onContinue} height={46}>
                  {campaign.status === "in_progress"
                    ? t("actions.continue")
                    : t("actions.start")}
                </BrassButton>
              </div>
            </>
          ) : (
            <>
              <LockInfoBox
                reason={t(`campaigns.${campaign.id}.lockReason`)}
                hint={campaign.lockHint ?? ""}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile full card (active campaign) ──────────────────────────────────────

function MobileFullCard({
  campaign,
  onContinue,
}: {
  campaign: Campaign;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const Symbol = CAMPAIGN_SYMBOL[campaign.id];
  const locked = campaign.status === "locked";

  return (
    <div
      className="flex min-h-[360px] flex-col overflow-hidden rounded-[12px]"
      style={{
        background: "#222A25",
        border: locked
          ? "1px solid rgba(213,195,154,0.10)"
          : "1px solid rgba(184,138,69,0.28)",
        boxShadow: locked
          ? "0 12px 30px rgba(0,0,0,.3)"
          : "0 16px 38px rgba(0,0,0,.32)",
      }}
    >
      {/* Preview */}
      <div
        className="relative h-[128px] overflow-hidden"
        style={{ background: PREVIEW_BG[campaign.id] }}
      >
        <img
          src={PREVIEW_IMAGE[campaign.id]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,transparent 50%,rgba(13,20,26,0.7) 100%)",
          }}
        />
        <StatusBadge
          status={campaign.status}
          label={t(`campaigns.status.${campaign.status}`)}
        />
        {locked ? (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle,rgba(21,27,24,.18),rgba(21,27,24,.66))",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-[58px] w-[58px] items-center justify-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle,rgba(40,50,45,0.88),rgba(21,27,24,0.96))",
                  boxShadow: "0 0 0 2px rgba(213,195,154,0.12)",
                }}
              >
                <LockIcon size={23} color="#879087" />
              </div>
            </div>
          </>
        ) : (
          <div
            className="absolute right-3 top-3 flex h-[34px] w-[34px] items-center justify-center rounded-full"
            style={{ background: "rgba(21,27,24,.62)" }}
          >
            <Symbol size={18} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-cormorant text-[22px] font-semibold text-exp-parch">
            {t(`campaigns.${campaign.id}.title`)}
          </h2>
          <span className="flex-shrink-0 text-[15px] font-bold text-exp-brass">
            {String(campaign.done).padStart(2, "0")}{" "}
            <span className="text-[11px] font-medium text-exp-muted">
              / {String(campaign.total).padStart(2, "0")}
            </span>
          </span>
        </div>

        <p className="mt-2 text-[12px] leading-[1.55] text-exp-muted">
          {t(`campaigns.${campaign.id}.description`)}
        </p>

        {!locked && (
          <div className="mt-3">
            <SegmentBar done={campaign.done} total={campaign.total} />
            {campaign.lastLevelName && (
              <p className="mt-1.5 text-[11px] text-exp-muted">
                {t("campaigns.lastLevel", { name: campaign.lastLevelName })}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto pt-3">
          {locked ? (
            <LockInfoBox
              reason={t(`campaigns.${campaign.id}.lockReason`)}
              hint={campaign.lockHint ?? ""}
            />
          ) : (
            <BrassButton onClick={onContinue} height={50}>
              {campaign.status === "in_progress"
                ? t("actions.continue")
                : t("actions.start")}
            </BrassButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile compact card (locked campaign) ────────────────────────────────────

function MobileCampaignCarousel({
  campaigns,
  activeIndex,
  onSelect,
  onContinue,
}: {
  campaigns: Campaign[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onContinue: (campaignId: CampaignId) => void;
}) {
  const { t } = useTranslation();
  const selectPrevious = () => {
    onSelect((activeIndex - 1 + campaigns.length) % campaigns.length);
  };
  const selectNext = () => {
    onSelect((activeIndex + 1) % campaigns.length);
  };

  return (
    <div className="px-4 pb-36 pt-5 md:hidden">
      <div className="relative">
        <div className="home-mobile-campaign-stage">
          {campaigns.map((campaign, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={campaign.id}
                aria-hidden={!isActive}
                className={`home-mobile-campaign-slide ${
                  isActive
                    ? "home-mobile-campaign-slide--active"
                    : "home-mobile-campaign-slide--inactive"
                }`}
              >
                <MobileFullCard
                  campaign={campaign}
                  onContinue={() => onContinue(campaign.id)}
                />
              </div>
            );
          })}
        </div>
        <CarouselArrow
          direction="previous"
          label={t("actions.previous")}
          onClick={selectPrevious}
        />
        <CarouselArrow
          direction="next"
          label={t("actions.next")}
          onClick={selectNext}
        />
      </div>

      <div className="mt-4 flex h-11 items-center justify-center gap-2">
        {campaigns.map((campaign, index) => (
          <button
            key={campaign.id}
            type="button"
            aria-label={t(`campaigns.${campaign.id}.title`)}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => onSelect(index)}
            className="flex h-11 w-11 items-center justify-center rounded-full"
          >
            <span
              className="h-2.5 w-2.5 rounded-full transition"
              style={{
                background:
                  index === activeIndex ? "#D8AF63" : "rgba(213,195,154,0.22)",
                boxShadow:
                  index === activeIndex
                    ? "0 0 0 4px rgba(216,175,99,0.12)"
                    : "none",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function HomeScreen({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useGameStore((s) => s.navigate);
  const completedLevels = useGameStore((s) => s.saveData.completedLevels);

  const northernRouteLevels = getChapterLevels("northern-route");
  const sandMeridianLevels = getChapterLevels("sand-meridian");
  const emeraldMeridianLevels = getChapterLevels("emerald-meridian");
  const nrDone = northernRouteLevels.filter((l) =>
    completedLevels.includes(l.id),
  ).length;
  const nrTotal = northernRouteLevels.length;
  const nrStatus: CampaignStatus =
    nrDone === 0
      ? "available"
      : nrDone === nrTotal
        ? "completed"
        : "in_progress";
  const sandDone = sandMeridianLevels.filter((l) =>
    completedLevels.includes(l.id),
  ).length;
  const sandTotal = sandMeridianLevels.length;
  const sandUnlocked = nrDone === nrTotal;
  const sandStatus: CampaignStatus = !sandUnlocked
    ? "locked"
    : sandDone === 0
      ? "available"
      : sandDone === sandTotal
        ? "completed"
        : "in_progress";
  const emeraldDone = emeraldMeridianLevels.filter((l) =>
    completedLevels.includes(l.id),
  ).length;
  const emeraldTotal = emeraldMeridianLevels.length;
  const emeraldUnlocked = sandDone === sandTotal;
  const emeraldStatus: CampaignStatus = !emeraldUnlocked
    ? "locked"
    : emeraldDone === 0
      ? "available"
      : emeraldDone === emeraldTotal
        ? "completed"
        : "in_progress";

  const lastCompleted = [...northernRouteLevels]
    .reverse()
    .find((l) => completedLevels.includes(l.id));
  const sandLastCompleted = [...sandMeridianLevels]
    .reverse()
    .find((l) => completedLevels.includes(l.id));
  const emeraldLastCompleted = [...emeraldMeridianLevels]
    .reverse()
    .find((l) => completedLevels.includes(l.id));

  const totalAll = nrTotal + sandTotal + emeraldTotal;

  const campaigns: Campaign[] = [
    {
      id: "white",
      status: nrStatus,
      done: nrDone,
      total: nrTotal,
      lastLevelName: lastCompleted ? t(lastCompleted.titleKey) : null,
    },
    {
      id: "sand",
      status: sandStatus,
      done: sandDone,
      total: sandTotal,
      lastLevelName: sandLastCompleted ? t(sandLastCompleted.titleKey) : null,
      lockHint: sandUnlocked
        ? undefined
        : t("campaigns.sand.levelsLeft", { count: nrTotal - nrDone }),
    },
    {
      id: "emerald",
      status: emeraldStatus,
      done: emeraldDone,
      total: emeraldTotal,
      lastLevelName: emeraldLastCompleted
        ? t(emeraldLastCompleted.titleKey)
        : null,
      lockHint: emeraldUnlocked
        ? undefined
        : t("campaigns.emerald.levelsLeft", { count: sandTotal - sandDone }),
    },
  ];
  const [mobileCampaignIndex, setMobileCampaignIndex] = React.useState(0);
  const selectPreviousCampaign = () => {
    setMobileCampaignIndex(
      (index) => (index - 1 + campaigns.length) % campaigns.length,
    );
  };
  const selectNextCampaign = () => {
    setMobileCampaignIndex((index) => (index + 1) % campaigns.length);
  };

  const handleOpenCampaign = (campaignId: CampaignId) => {
    if (campaignId === "white") {
      navigate({ kind: "map", chapterId: chapters["northern-route"].id });
      return;
    }
    if (campaignId === "sand" && sandUnlocked) {
      navigate({ kind: "map", chapterId: chapters["sand-meridian"].id });
      return;
    }
    if (campaignId === "emerald" && emeraldUnlocked) {
      navigate({ kind: "map", chapterId: chapters["emerald-meridian"].id });
    }
  };
  return (
    <div className="home-screen min-h-screen bg-exp-bg font-manrope text-exp-parch">
      {/* Top bar */}
      <TopBar
        totalDone={completedLevels.length}
        totalAll={totalAll}
        onOpenSettings={onOpenSettings}
      />

      {/* Page header */}
      <section className="home-hero px-5 pb-2 pt-[34px] text-center md:px-10 md:pb-0">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[.34em] text-exp-brass">
          {t("campaigns.supra")}
        </p>
        <h1 className="font-cormorant text-[30px] font-semibold leading-tight text-exp-parch md:text-[50px]">
          {t("campaigns.heading")}
        </h1>
        <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-[1.55] text-exp-muted md:text-[14.5px]">
          {t("campaigns.subheading")}
        </p>
      </section>

      {/* Route sequence (desktop only) */}
      <div className="home-content mx-auto w-full max-w-[1460px]">
        <div className="home-route hidden md:block">
          <RouteSequence
            statuses={campaigns.map((c) => c.status)}
            labels={campaigns.map((c) =>
              t(`campaigns.${c.id}.title`).toUpperCase(),
            )}
          />
        </div>

        {/* ── Desktop card row ── */}
        <div className="home-campaign-carousel-shell relative">
          <div className="home-campaign-row hidden gap-[26px] px-10 pb-4 md:flex">
            {campaigns.map((campaign, index) => (
              <DesktopCard
                key={campaign.id}
                campaign={campaign}
                isLandscapeCarouselActive={index === mobileCampaignIndex}
                onContinue={() => handleOpenCampaign(campaign.id)}
              />
            ))}
          </div>
          <div className="home-campaign-landscape-controls hidden">
            <CarouselArrow
              direction="previous"
              label={t("actions.previous")}
              onClick={selectPreviousCampaign}
            />
            <CarouselArrow
              direction="next"
              label={t("actions.next")}
              onClick={selectNextCampaign}
            />
          </div>
        </div>

        {/* ── Mobile card stack ── */}
      </div>

      <MobileCampaignCarousel
        campaigns={campaigns}
        activeIndex={mobileCampaignIndex}
        onSelect={setMobileCampaignIndex}
        onContinue={handleOpenCampaign}
      />

      {/* Footer (desktop) */}
      <div className="mx-auto hidden w-full max-w-[1460px] md:block">
        <footer
          className="flex h-10 items-center justify-center gap-2 border-t"
          style={{ borderColor: "rgba(213,195,154,0.09)" }}
        >
          <CheckIcon size={12} color="#6FC69E" />
          <p className="text-[10.5px] text-exp-muted">
            {t("campaigns.autoSave")}
          </p>
        </footer>
      </div>
    </div>
  );
}
