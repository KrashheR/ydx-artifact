import { useTranslation } from "react-i18next";
import { levels } from "@/content/levels";
import { isLevelUnlocked } from "@/shared/lib/progression";
import { useGameStore } from "@/shared/store/gameStore";
import { Button } from "@/shared/ui/Button";
import { Panel } from "@/shared/ui/Panel";

const mapNodePositions = [
  { x: 27.2, y: 83.6 },
  { x: 31.5, y: 66.1 },
  { x: 43.1, y: 56.7 },
  { x: 31.4, y: 45.8 },
  { x: 35.2, y: 30.9 },
  { x: 57.3, y: 29.3 },
  { x: 66.0, y: 16.7 },
  { x: 79.5, y: 24.1 },
  { x: 88.6, y: 17.2 },
  { x: 84.7, y: 41.8 },
  { x: 76.8, y: 58.7 },
  { x: 59.8, y: 73.4 }
] as const;

const artifactMilestones = new Set([3, 6, 9, 12]);

export function MapScreen() {
  const { t } = useTranslation();
  const saveData = useGameStore((state) => state.saveData);
  const startLevel = useGameStore((state) => state.startLevel);
  const navigate = useGameStore((state) => state.navigate);

  return (
    <Panel>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal">{t("app.subtitle")}</p>
          <h1 className="font-archive text-4xl">{t("actions.map")}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate({ kind: "collection" })}>{t("actions.collection")}</Button>
          <Button variant="ghost" onClick={() => navigate({ kind: "home" })}>{t("actions.back")}</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-graphite/15 bg-graphite/10 p-2 shadow-inner">
        <div className="relative min-w-[980px] overflow-hidden rounded-xl">
          <img
            src="/assets/scenes/northern-route/background.png"
            alt=""
            className="block w-full select-none"
            draggable={false}
          />
          <div className="absolute inset-0">
            {levels.map((level) => {
              const unlocked = isLevelUnlocked(level.id, saveData);
              const completed = saveData.completedLevels.includes(level.id);
              const active = unlocked && !completed;
              const position = mapNodePositions[level.order - 1];
              const statusLabel = completed ? "completed" : unlocked ? "active" : "locked";

              return (
                <button
                  key={level.id}
                  disabled={!unlocked}
                  onClick={() => startLevel(level.id)}
                  aria-label={`${level.order}. ${t(level.titleKey)} (${statusLabel})`}
                  title={`${level.order}. ${t(level.titleKey)}`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
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
