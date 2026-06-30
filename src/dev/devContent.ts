import { allLevels } from "@/content/chapters";
import { buildUnlockedDevSave } from "@/shared/lib/devCheats";
import { useGameStore } from "@/shared/store/gameStore";

export async function unlockAllDevContent() {
  const currentSave = useGameStore.getState().saveData;
  const allLevelsAlreadyCompleted = allLevels.every((level) =>
    currentSave.completedLevels.includes(level.id)
  );
  const saveData = allLevelsAlreadyCompleted ? currentSave : buildUnlockedDevSave(currentSave);

  useGameStore.setState({ saveData });
  await useGameStore.getState().save({ flush: true });
}
