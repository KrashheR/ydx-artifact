import type { ChapterId } from "@/content/chapters";
import type { ArtifactId as CollectibleId } from "@/content/artifacts";

export type { CollectibleId };

export type CampaignReportId =
  | "white-meridian-report"
  | "sand-meridian-report"
  | "emerald-meridian-report";

export type CampaignReportCampaignId =
  | "white-meridian"
  | "sand-meridian"
  | "emerald-meridian";

export type CampaignReport = {
  id: CampaignReportId;
  campaignId: CampaignReportCampaignId;
  titleKey: string;
  caseNameKey: string;
  labelKey: string;
  shortResultKey: string;
  conclusionKey: string;
  nextHookKey: string;
  futureHookTitleKey?: string;
  futureHookTextKey?: string;
  artifactIds: CollectibleId[];
  primaryCtaKey: string;
  secondaryCtaKey: string;
  nextCampaignId?: "sand-meridian" | "emerald-meridian";
  isFinalCurrentContent?: boolean;
};

export const CAMPAIGN_REPORT_IDS: CampaignReportId[] = [
  "white-meridian-report",
  "sand-meridian-report",
  "emerald-meridian-report"
];

export const campaignReportChapterIds: Record<CampaignReportCampaignId, ChapterId> = {
  "white-meridian": "northern-route",
  "sand-meridian": "sand-meridian",
  "emerald-meridian": "emerald-meridian"
};

const chapterIdToReportCampaignId = Object.fromEntries(
  Object.entries(campaignReportChapterIds).map(([campaignId, chapterId]) => [chapterId, campaignId])
) as Record<ChapterId, CampaignReportCampaignId>;

export const campaignReports: CampaignReport[] = [
  {
    id: "white-meridian-report",
    campaignId: "white-meridian",
    titleKey: "campaignReport.reports.white.title",
    caseNameKey: "campaignReport.reports.white.caseName",
    labelKey: "campaignReport.label",
    shortResultKey: "campaignReport.reports.white.shortResult",
    conclusionKey: "campaignReport.reports.white.conclusion",
    nextHookKey: "campaignReport.reports.white.nextHook",
    artifactIds: [
      "white-compass",
      "white-field-radio",
      "white-red-diary",
      "white-echo-recorder",
      "white-descent-rope"
    ],
    primaryCtaKey: "campaignReport.primaryNextCampaign",
    secondaryCtaKey: "campaignReport.secondaryCollection",
    nextCampaignId: "sand-meridian"
  },
  {
    id: "sand-meridian-report",
    campaignId: "sand-meridian",
    titleKey: "campaignReport.reports.sand.title",
    caseNameKey: "campaignReport.reports.sand.caseName",
    labelKey: "campaignReport.label",
    shortResultKey: "campaignReport.reports.sand.shortResult",
    conclusionKey: "campaignReport.reports.sand.conclusion",
    nextHookKey: "campaignReport.reports.sand.nextHook",
    artifactIds: [
      "sand-rune-marker",
      "sand-descent-helmets",
      "sand-hydraulic-pump",
      "sand-bronze-lamp",
      "sand-buried-map"
    ],
    primaryCtaKey: "campaignReport.primaryNextCampaign",
    secondaryCtaKey: "campaignReport.secondaryCollection",
    nextCampaignId: "emerald-meridian"
  },
  {
    id: "emerald-meridian-report",
    campaignId: "emerald-meridian",
    titleKey: "campaignReport.reports.emerald.title",
    caseNameKey: "campaignReport.reports.emerald.caseName",
    labelKey: "campaignReport.label",
    shortResultKey: "campaignReport.reports.emerald.shortResult",
    conclusionKey: "campaignReport.reports.emerald.conclusion",
    nextHookKey: "campaignReport.reports.emerald.nextHook",
    futureHookTitleKey: "campaignReport.reports.emerald.futureHookTitle",
    futureHookTextKey: "campaignReport.reports.emerald.futureHookText",
    artifactIds: [
      "emerald-botanical-vials",
      "emerald-tropical-map",
      "emerald-stone-plaque",
      "emerald-brass-spyglass",
      "emerald-evacuation-aircraft"
    ],
    primaryCtaKey: "campaignReport.primaryFinal",
    secondaryCtaKey: "campaignReport.secondaryCollection",
    isFinalCurrentContent: true
  }
];

export const campaignReportById = new Map(campaignReports.map((report) => [report.id, report]));

export function normalizeCampaignReportCampaignId(
  campaignId: CampaignReportCampaignId | ChapterId
): CampaignReportCampaignId {
  return chapterIdToReportCampaignId[campaignId as ChapterId] ?? (campaignId as CampaignReportCampaignId);
}

export function getCampaignReportForCampaign(
  campaignId: CampaignReportCampaignId | ChapterId
) {
  const normalizedCampaignId = normalizeCampaignReportCampaignId(campaignId);
  return campaignReports.find((report) => report.campaignId === normalizedCampaignId) ?? null;
}

export function getCampaignReportChapterId(report: CampaignReport) {
  return campaignReportChapterIds[report.campaignId];
}

export function getNextCampaignReportChapterId(report: CampaignReport) {
  return report.nextCampaignId ? campaignReportChapterIds[report.nextCampaignId] : null;
}
