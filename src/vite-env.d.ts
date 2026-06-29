/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_LAYOUT_DEBUG?: string;
    readonly VITE_DEV_VALIDATE_CHEAT?: string;
  }

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
      setReviewMock?: (mode: "sent" | "closed" | "unavailable" | "error" | null) => void;
      triggerReviewPromptDemo?: () => Promise<void>;
    };
  }
}

export {};
