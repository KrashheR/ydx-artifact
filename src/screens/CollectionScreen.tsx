import { useTranslation } from "react-i18next";
import { useGameStore } from "@/shared/store/gameStore";
import { Button } from "@/shared/ui/Button";
import { Panel } from "@/shared/ui/Panel";

const artifactIds = ["brass-compass", "field-radio", "blue-flower", "torn-map"] as const;

export function CollectionScreen() {
  const { t } = useTranslation();
  const artifacts = useGameStore((state) => state.saveData.artifacts);
  const navigate = useGameStore((state) => state.navigate);

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-archive text-4xl">{t("actions.collection")}</h1>
        <Button variant="ghost" onClick={() => navigate({ kind: "home" })}>{t("actions.back")}</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {artifactIds.map((id) => (
          <article key={id} className="rounded-2xl border border-graphite/15 bg-paper p-5 text-center">
            <div className="mx-auto grid aspect-square w-28 place-items-center rounded-full bg-ivory text-5xl">
              {artifacts[id] === "locked" ? "?" : "◆"}
            </div>
            <h2 className="mt-4 font-bold">{t(`artifacts.${id}`)}</h2>
            <p className="text-sm text-graphite/60">{artifacts[id]}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
