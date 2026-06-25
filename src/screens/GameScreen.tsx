import { useState } from "react";
import { useTranslation } from "react-i18next";
import { levels } from "@/content/levels";
import { PhotoComparator } from "@/features/gameplay/PhotoComparator";
import { useGameStore } from "@/shared/store/gameStore";
import { Button } from "@/shared/ui/Button";
import { Panel } from "@/shared/ui/Panel";

export function GameScreen({ levelId, mode }: { levelId: string; mode: "campaign" | "daily" }) {
  const { t } = useTranslation();
  const level = levels.find((candidate) => candidate.id === levelId) ?? levels[0];
  const saveData = useGameStore((state) => state.saveData);
  const recordDifference = useGameStore((state) => state.recordDifference);
  const recordMisclick = useGameStore((state) => state.recordMisclick);
  const completeLevel = useGameStore((state) => state.completeLevel);
  const spendMagnifiers = useGameStore((state) => state.spendMagnifiers);
  const claimDailyReward = useGameStore((state) => state.claimDailyReward);
  const navigate = useGameStore((state) => state.navigate);
  const [startedAt] = useState(() => Date.now());
  const [hintId, setHintId] = useState<string | undefined>();
  const [exactHintUsed, setExactHintUsed] = useState(false);
  const foundIds = saveData.inProgress?.levelId === levelId ? saveData.inProgress.foundDifferenceIds : [];
  const mistakes = saveData.inProgress?.levelId === levelId ? saveData.inProgress.mistakes : 0;
  const complete = foundIds.length >= level.requiredDifferences;
  const accuracy = Math.round((foundIds.length / Math.max(foundIds.length + mistakes, 1)) * 100);

  function handleDifference(differenceId: string) {
    recordDifference(levelId, differenceId);
    const nextFound = foundIds.length + 1;
    if (nextFound >= level.requiredDifferences) {
      completeLevel(levelId, Math.round((Date.now() - startedAt) / 1000), exactHintUsed);
      if (mode === "daily") claimDailyReward(new Date().toISOString().slice(0, 10));
    }
  }

  function revealExact() {
    const next = level.differences.find((difference) => !foundIds.includes(difference.id));
    if (!next) return;
    if (!spendMagnifiers(2)) return;
    setExactHintUsed(true);
    handleDifference(next.id);
  }

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal">{mode}</p>
          <h1 className="font-archive text-3xl">{t(level.titleKey)}</h1>
          <p className="text-sm text-graphite/65">{t("game.useWheel")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate({ kind: "map" })}>{t("actions.back")}</Button>
          <Button variant="secondary" disabled={complete} onClick={() => {
            const next = level.differences.find((difference) => !foundIds.includes(difference.id));
            if (next && spendMagnifiers(1)) setHintId(next.id);
          }}>{t("actions.hintArea")}</Button>
          <Button variant="secondary" disabled={complete} onClick={revealExact}>{t("actions.hintExact")}</Button>
        </div>
      </div>
      <div className="mb-4 grid gap-3 text-sm md:grid-cols-4" aria-live="polite">
        <span className="rounded-xl bg-paper px-3 py-2 font-bold">{t("game.found", { count: foundIds.length, total: level.requiredDifferences })}</span>
        <span className="rounded-xl bg-paper px-3 py-2">{t("game.mistakes", { count: mistakes })}</span>
        <span className="rounded-xl bg-paper px-3 py-2">{t("game.magnifiers", { count: saveData.magnifiers })}</span>
        <span className="rounded-xl bg-paper px-3 py-2">{t("game.accuracy", { value: accuracy })}</span>
      </div>
      {complete ? (
        <div className="mb-4 rounded-2xl border border-teal/30 bg-teal/10 p-4">
          <h2 className="font-archive text-3xl">{t("game.completed")}</h2>
          <Button className="mt-3" onClick={() => navigate({ kind: "map" })}>{t("actions.map")}</Button>
        </div>
      ) : null}
      <PhotoComparator
        level={level}
        foundIds={foundIds}
        hintId={hintId}
        onDifference={handleDifference}
        onMisclick={() => recordMisclick(levelId)}
      />
    </Panel>
  );
}
