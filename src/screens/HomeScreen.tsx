import { useTranslation } from "react-i18next";
import { levels } from "@/content/levels";
import { Button } from "@/shared/ui/Button";
import { Panel } from "@/shared/ui/Panel";
import { useGameStore } from "@/shared/store/gameStore";

export function HomeScreen() {
  const { t } = useTranslation();
  const startLevel = useGameStore((state) => state.startLevel);
  const navigate = useGameStore((state) => state.navigate);
  const completed = useGameStore((state) => state.saveData.completedLevels.length);
  const saveStatus = useGameStore((state) => state.saveStatus);
  const firstUnlocked = levels.find((level) => !useGameStore.getState().saveData.completedLevels.includes(level.id)) ?? levels[0];

  return (
    <div className="grid min-h-[calc(100vh-2.5rem)] place-items-center">
      <Panel className="relative w-full max-w-5xl overflow-hidden">
        <div className="absolute right-[-5rem] top-[-6rem] h-72 w-72 rounded-full bg-cold/30 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-teal/15 px-3 py-1 text-sm font-bold text-teal">
              {completed > 0 ? t("home.returning") : t("home.new")}
            </p>
            <h1 className="font-archive text-5xl leading-tight md:text-7xl">{t("app.title")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-graphite/75">{t("app.pitch")}</p>
            <p className="mt-3 text-sm text-graphite/60">{t("home.mock")} · {t(`save.${saveStatus === "local-only" ? "localOnly" : "saved"}`)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => startLevel(firstUnlocked.id)}>
                {completed > 0 ? t("actions.continue") : t("actions.start")}
              </Button>
              <Button variant="secondary" onClick={() => navigate({ kind: "map" })}>
                {t("actions.map")}
              </Button>
              <Button variant="ghost" onClick={() => navigate({ kind: "daily" })}>
                {t("actions.daily")}
              </Button>
              <Button variant="ghost" onClick={() => navigate({ kind: "settings" })}>
                {t("actions.settings")}
              </Button>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-graphite/20 bg-paper p-4">
            <img
              src={levels[0].thumbnail}
              alt=""
              className="aspect-[16/10] w-full rounded-2xl border border-graphite/20 object-cover"
              draggable={false}
            />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <span className="rounded-xl bg-ivory p-3">12 levels</span>
              <span className="rounded-xl bg-ivory p-3">3 daily</span>
              <span className="rounded-xl bg-ivory p-3">4 artifacts</span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
