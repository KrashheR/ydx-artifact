import { useTranslation } from "react-i18next";
import { levels } from "@/content/levels";
import { isLevelUnlocked } from "@/shared/lib/progression";
import { useGameStore } from "@/shared/store/gameStore";
import { Button } from "@/shared/ui/Button";
import { Panel } from "@/shared/ui/Panel";

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
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {levels.map((level) => {
          const unlocked = isLevelUnlocked(level.id, saveData);
          const completed = saveData.completedLevels.includes(level.id);
          return (
            <button
              key={level.id}
              disabled={!unlocked}
              onClick={() => startLevel(level.id)}
              className="rounded-2xl border border-graphite/15 bg-paper p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-45"
            >
              <img src={level.thumbnail} alt="" className="aspect-[16/10] w-full rounded-xl object-cover" />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{level.order}. {t(level.titleKey)}</p>
                  <p className="text-sm text-graphite/65">{level.requiredDifferences} differences</p>
                </div>
                <span className="rounded-full bg-ivory px-2 py-1 text-xs">{completed ? "✓" : unlocked ? "•" : "lock"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
