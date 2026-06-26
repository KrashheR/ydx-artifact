import { useTranslation } from "react-i18next";
import { getChapter } from "@/content/chapters";
import { isLevelUnlocked } from "@/shared/lib/progression";
import { useGameStore } from "@/shared/store/gameStore";
import { Button } from "@/shared/ui/Button";
import { Panel } from "@/shared/ui/Panel";

const artifactMilestones = new Set([3, 6, 9, 12]);

export function MapScreen() {
  const { t } = useTranslation();
  const screen = useGameStore((state) => state.screen);
  const saveData = useGameStore((state) => state.saveData);
  const startLevel = useGameStore((state) => state.startLevel);
  const navigate = useGameStore((state) => state.navigate);
  const chapterId = screen.kind === "map" ? screen.chapterId : "northern-route";
  const chapter = getChapter(chapterId);
  const routePoints = chapter.mapPoints
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((point) => `${point.x * 100},${point.y * 100}`)
    .join(" ");

  return (
    <Panel>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal">{t("campaigns.supra")}</p>
          <h1 className="font-archive text-4xl">{t(chapter.titleKey)}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate({ kind: "collection" })}>{t("actions.collection")}</Button>
          <Button variant="ghost" onClick={() => navigate({ kind: "home" })}>{t("actions.back")}</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-graphite/15 bg-graphite/10 p-2 shadow-inner">
        <div className="relative min-w-[980px] overflow-hidden rounded-xl" style={{ aspectRatio: chapter.aspectRatio }}>
          <img
            src={chapter.backgroundAsset}
            alt=""
            className="block h-full w-full select-none object-contain"
            draggable={false}
          />
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
              <polyline
                points={routePoints}
                fill="none"
                stroke="rgba(184,138,69,0.78)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1.4 2.2"
              />
            </svg>
            {chapter.levels.map((level) => {
              const unlocked = isLevelUnlocked(level.id, saveData);
              const completed = saveData.completedLevels.includes(level.id);
              const active = unlocked && !completed;
              const position = chapter.mapPoints.find((point) => point.id === level.id) ?? chapter.mapPoints[level.order - 1];
              const statusLabel = completed ? "completed" : unlocked ? "active" : "locked";

              return (
                <button
                  key={level.id}
                  disabled={!unlocked}
                  onClick={() => startLevel(level.id)}
                  aria-label={`${level.order}. ${t(level.titleKey)} (${statusLabel})`}
                  title={`${level.order}. ${t(level.titleKey)}`}
                  style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
                  className={`group absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-archive text-lg font-bold shadow-lg transition focus:outline-none focus:ring-4 focus:ring-ochre/50 ${
                    completed
                      ? "border-teal bg-teal text-ivory shadow-teal/25"
                      : active
                        ? "border-ochre bg-rust text-ivory shadow-rust/30 ring-4 ring-ochre/25 hover:scale-105"
                        : "border-graphite/25 bg-paper text-graphite/45 shadow-graphite/10"
                  } disabled:cursor-not-allowed`}
                >
                  <span>{level.order}</span>
                  {artifactMilestones.has(level.order) && (
                    <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border border-ivory bg-ochre shadow" />
                  )}
                  <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] hidden min-w-36 -translate-x-1/2 rounded-md border border-graphite/15 bg-ivory/95 px-2 py-1 text-center font-ui text-xs font-bold text-graphite shadow-md group-hover:block group-focus:block">
                    {level.order}. {t(level.titleKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
