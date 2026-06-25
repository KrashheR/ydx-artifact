import { useTranslation } from "react-i18next";
import { mockPlatform } from "@/services/platform/mockPlatform";
import { useGameStore } from "@/shared/store/gameStore";
import { Button } from "@/shared/ui/Button";
import { Panel } from "@/shared/ui/Panel";

export function SettingsScreen() {
  const { t } = useTranslation();
  const saveData = useGameStore((state) => state.saveData);
  const setLocale = useGameStore((state) => state.setLocale);
  const resetSave = useGameStore((state) => state.resetSave);
  const navigate = useGameStore((state) => state.navigate);

  return (
    <Panel className="max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-archive text-4xl">{t("actions.settings")}</h1>
        <Button variant="ghost" onClick={() => navigate({ kind: "home" })}>{t("actions.back")}</Button>
      </div>
      <label className="mt-6 block font-bold" htmlFor="locale">Locale</label>
      <select
        id="locale"
        className="mt-2 rounded-xl border border-graphite/20 bg-ivory p-3"
        value={saveData.settings.locale}
        onChange={(event) => setLocale(event.target.value as "ru" | "en")}
      >
        <option value="ru">{t("language.ru")}</option>
        <option value="en">{t("language.en")}</option>
      </select>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => mockPlatform.copyDiagnostics({
          version: saveData.version,
          completedLevels: saveData.completedLevels.length,
          magnifiers: saveData.magnifiers,
          locale: saveData.settings.locale
        })}>
          {t("actions.copyDiagnostics")}
        </Button>
        <Button variant="ghost" onClick={() => void resetSave()}>{t("actions.resetSave")}</Button>
      </div>
    </Panel>
  );
}
