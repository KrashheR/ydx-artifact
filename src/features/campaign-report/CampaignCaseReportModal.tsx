import { useTranslation } from "react-i18next";
import { getArtifactById } from "@/content/artifacts";
import type { CampaignReport, CollectibleId } from "@/data/campaignReports";
import { useGameStore } from "@/shared/store/gameStore";

type CampaignCaseReportModalProps = {
  report: CampaignReport;
  restoredLevels: number;
  totalLevels: number;
  unlockedArtifactCount: number;
  totalArtifactCount: number;
  artifactIds: CollectibleId[];
  onPrimary: () => void;
  onOpenCollection: () => void;
  onClose?: () => void;
};

function ReportDivider() {
  return (
    <div
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(184,138,69,.6), transparent)"
      }}
    />
  );
}

export function CampaignCaseReportModal({
  report,
  restoredLevels,
  totalLevels,
  unlockedArtifactCount,
  totalArtifactCount,
  artifactIds,
  onPrimary,
  onOpenCollection,
  onClose
}: CampaignCaseReportModalProps) {
  const { t } = useTranslation();
  const artifactStates = useGameStore((state) => state.saveData.artifacts);
  const reducedMotion = useGameStore((state) => state.saveData.settings.reducedMotion);
  const restoredPercent = Math.round((restoredLevels / Math.max(totalLevels, 1)) * 100);
  const allFindingsUnlocked = unlockedArtifactCount >= totalArtifactCount;
  const hookTitleKey = report.futureHookTitleKey ?? "campaignReport.nextHookLabel";
  const hookTextKey = report.futureHookTextKey ?? report.nextHookKey;

  return (
    <div className="absolute inset-0 z-[70] flex items-end justify-center bg-[#070908]/75 p-0 font-manrope sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t("campaignReport.closeLabel")}
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-report-title"
        className="relative z-10 max-h-[100dvh] w-full overflow-hidden rounded-t-[18px] border border-[#B88A45]/35 text-[#2f3231] shadow-[0_44px_110px_rgba(0,0,0,.68)] sm:max-h-[calc(100vh-32px)] sm:w-[min(960px,calc(100vw-32px))] sm:rounded-[18px]"
        style={{
          background:
            "radial-gradient(110% 70% at 50% -10%, rgba(244,238,221,.98), rgba(231,221,200,.98) 56%, rgba(208,192,160,.98)), repeating-linear-gradient(45deg, rgba(95,78,45,.035) 0 8px, rgba(255,255,255,.025) 8px 16px)",
          animation: reducedMotion
            ? undefined
            : "campaign-report-in .56s cubic-bezier(.2,.8,.25,1)"
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(75% 55% at 50% 8%, rgba(255,255,255,.35), transparent 58%), radial-gradient(70% 65% at 50% 100%, rgba(67,50,27,.2), transparent 68%)"
          }}
        />
        <div
          className="absolute left-4 right-4 top-3 h-[3px] rounded-full sm:left-8 sm:right-8"
          style={{ background: "linear-gradient(90deg, transparent, #b88a45, transparent)" }}
        />

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#6b5431]/20 bg-[#f4eedd]/70 text-[#5b4930] transition hover:bg-[#f4eedd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a45]"
            aria-label={t("campaignReport.closeLabel")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}

        <div className="relative z-10 max-h-[100dvh] overflow-y-auto px-5 pb-5 pt-8 sm:max-h-[calc(100vh-32px)] sm:px-8 sm:pb-8 sm:pt-9">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-7">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[.28em] text-[#8c6430]">
                {t(report.labelKey)}
              </p>
              <h2
                id="campaign-report-title"
                className="mt-2 font-cormorant text-[34px] font-semibold leading-none text-[#2b2418] sm:text-[52px]"
              >
                {t(report.titleKey)}
              </h2>
              <p className="mt-2 font-cormorant text-[22px] font-semibold leading-tight text-[#5c4a2d] sm:text-[28px]">
                {t(report.caseNameKey)}
              </p>
              <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55] text-[#625a4f] sm:text-[16px]">
                {t(report.shortResultKey)}
              </p>
            </div>

            <div className="rounded-[8px] border border-[#B88A45]/28 bg-[#fff7e8]/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.5)]">
              <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#8c6430]">
                    {t("campaignReport.progressLabel")}
                  </p>
                  <p className="mt-1 font-jetbrains text-[18px] font-bold text-[#2b2418]">
                    {t("campaignReport.photosCount", { restored: restoredLevels, total: totalLevels })}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#8c6430]">
                    {t("campaignReport.findingsLabel")}
                  </p>
                  <p className="mt-1 font-jetbrains text-[18px] font-bold text-[#2b2418]">
                    {t("campaignReport.findingsCount", {
                      unlocked: unlockedArtifactCount,
                      total: totalArtifactCount
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#8c6430]">
                    {t("campaignReport.accuracyLabel")}
                  </p>
                  <p className="mt-1 font-jetbrains text-[18px] font-bold text-[#2b2418]">
                    {restoredPercent}%
                  </p>
                </div>
              </div>
              <p className="mt-3 rounded-[6px] border border-[#B88A45]/24 bg-[#B88A45]/10 px-3 py-2 text-[12px] font-bold text-[#6a4a22]">
                {allFindingsUnlocked
                  ? t("campaignReport.perfectFindings")
                  : t("campaignReport.incompleteFindings")}
              </p>
            </div>
          </div>

          <ReportDivider />

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[.22em] text-[#8c6430]">
                {t("campaignReport.findingsLabel")}
              </h3>
              <span className="hidden h-px flex-1 bg-[#B88A45]/25 sm:block" />
            </div>
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
              {artifactIds.map((artifactId, index) => {
                const artifact = getArtifactById(artifactId);
                const artifactState = artifactStates[artifactId] ?? "locked";
                const unlocked = artifactState !== "locked";
                if (!artifact) return null;

                return (
                  <div
                    key={artifactId}
                    className="relative w-[118px] shrink-0 rounded-[8px] border border-[#6b5431]/18 bg-[#2d2519] p-1.5 shadow-[0_10px_24px_rgba(57,43,24,.24)] sm:w-[150px]"
                    style={{
                      animation: reducedMotion
                        ? undefined
                        : "campaign-report-artifact-in .48s cubic-bezier(.2,.8,.25,1) both",
                      animationDelay: `${120 + index * 70}ms`
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[6px]">
                      <img
                        src={unlocked ? artifact.openImage : artifact.closedImage}
                        alt={unlocked ? t(`artifacts.${artifact.id}.name`) : t("collection.detailLockedTitle")}
                        className={`h-full w-full object-cover ${unlocked ? "" : "opacity-70 grayscale"}`}
                        draggable={false}
                      />
                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#101512]/45">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FFECC4]/35 bg-[radial-gradient(circle_at_38%_32%,#CAA05A,#7E5B2A_72%)]">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2A1D0C" strokeWidth="2" aria-hidden="true">
                              <rect x="5" y="11" width="14" height="9.5" rx="1.6" />
                              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {artifactState === "newly-unlocked" && (
                        <span className="absolute right-1.5 top-1.5 rounded-[4px] border border-[#4d8f74] bg-[#151b18]/88 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[.1em] text-[#6fc69e]">
                          {t("campaignReport.newBadge")}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-[34px] text-[11px] font-bold leading-[1.25] text-[#f4eedd]">
                      {unlocked ? t(`artifacts.${artifact.id}.name`) : t("collection.detailLockedTitle")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)]">
            <article className="rounded-[8px] border border-[#5f4a2d]/16 bg-[#f4eedd]/52 p-4">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[.22em] text-[#8c6430]">
                {t("campaignReport.conclusionLabel")}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.65] text-[#4f493f] sm:text-[16px]">
                {t(report.conclusionKey)}
              </p>
            </article>
            <article className="relative overflow-hidden rounded-[8px] border border-[#B88A45]/28 bg-[#2a332d] p-4 text-exp-parch">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,transparent,#D8AF63,transparent)]" />
              <h3 className="text-[11px] font-extrabold uppercase tracking-[.22em] text-exp-brass">
                {t(hookTitleKey)}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.65] text-[#c6cdbf] sm:text-[15px]">
                {t(hookTextKey)}
              </p>
              {report.futureHookTextKey && report.nextHookKey !== report.futureHookTextKey && (
                <p className="mt-3 border-t border-[#D5C39A]/12 pt-3 text-[13px] leading-[1.55] text-[#aeb7aa]">
                  {t(report.nextHookKey)}
                </p>
              )}
              <div
                className="mt-4 inline-flex rotate-[-3deg] rounded-[5px] border-2 border-[#B88A45]/55 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#D8AF63]/85"
                style={{
                  animation: reducedMotion
                    ? undefined
                    : "campaign-report-stamp-in .5s ease-out .32s both"
                }}
              >
                {t("campaignReport.stamp")}
              </div>
            </article>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onOpenCollection}
              className="min-h-[52px] rounded-[10px] border border-[#5f4a2d]/22 bg-[#fff7e8]/45 px-5 text-[14px] font-extrabold text-[#4d3d25] transition hover:bg-[#fff7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a45] sm:min-w-[210px]"
            >
              {t(report.secondaryCtaKey)}
            </button>
            <button
              type="button"
              autoFocus
              onClick={onPrimary}
              className="min-h-[52px] rounded-[10px] border-none bg-[linear-gradient(180deg,#D8AF63,#B3812F)] px-6 text-[15px] font-extrabold text-[#1a130a] shadow-[0_12px_28px_rgba(184,138,69,.32),inset_0_1px_0_rgba(255,255,255,.3)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e5b2a] sm:min-w-[240px]"
            >
              {t(report.primaryCtaKey)}
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes campaign-report-in {
          from { opacity: 0; transform: translateY(24px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes campaign-report-artifact-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes campaign-report-stamp-in {
          from { opacity: 0; transform: translateY(8px) rotate(-3deg) scale(.94); }
          to { opacity: 1; transform: translateY(0) rotate(-3deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
