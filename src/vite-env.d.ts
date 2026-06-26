/// <reference types="vite/client" />

declare global {
  interface Window {
    __artifactDev?: {
      unlockAllContent: () => Promise<{
        unlockedLevels: number;
        purchases: {
          noForcedInterstitials: boolean;
          productIds: string[];
        };
      }>;
      resetSave: () => Promise<import("@/entities/save/schema").SaveData>;
    };
  }
}

export {};
