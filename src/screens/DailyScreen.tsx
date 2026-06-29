import { useTranslation } from "react-i18next";
import { dailyLevels } from "@/content/levels";
import { useGameStore } from "@/shared/store/gameStore";
import { Button } from "@/shared/ui/Button";
import { Panel } from "@/shared/ui/Panel";

function todaysDailyIndex() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % dailyLevels.length;
}

export function DailyScreen() {
  const { t } = useTranslation();
  const startLevel = useGameStore((state) => state.startLevel);
  const navigate = useGameStore((state) => state.navigate);
  const daily = useGameStore((state) => state.saveData.daily);
  const entry = dailyLevels[todaysDailyIndex()];

  return (
    <Panel className="max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-archive text-4xl">{t("actions.daily")}</h1>
        <Button variant="ghost" onClick={() => navigate({ kind: "home" })}>{t("actions.back")}</Button>
      </div>
      <p className="mt-4 text-graphite/70">
        {t("daily.sceneInfo", { title: t(entry.titleKey), streak: daily.streak })}
      </p>
      <Button className="mt-6" onClick={() => startLevel(entry.levelId, "daily")}>{t("actions.start")}</Button>
    </Panel>
  );
}
