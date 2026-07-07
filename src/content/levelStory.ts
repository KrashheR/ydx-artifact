import type { LevelDefinition } from "../entities/level/schema";

export type StoryCampaignKey = "white" | "sand" | "emerald";

function getStoryAct(order: number): 1 | 2 | 3 | 4 {
  if (order <= 3) return 1;
  if (order <= 7) return 2;
  if (order <= 10) return 3;
  return 4;
}

export function getLevelStory(campaign: StoryCampaignKey, order: number): NonNullable<LevelDefinition["story"]> {
  const levelKey = `${campaign}${order.toString().padStart(2, "0")}`;
  return {
    act: getStoryAct(order),
    introKey: `story.levels.${levelKey}.intro`,
    victoryKey: `story.levels.${levelKey}.victory`,
    clueKey: `story.levels.${levelKey}.clue`
  };
}
