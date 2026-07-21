/// <reference types="vite/client" />

declare global {
  const __YANDEX_METRICA_URL__: string;
  interface ImportMetaEnv {
    readonly VITE_LAYOUT_DEBUG?: string;
    readonly VITE_FINAL_VALIDATE?: string;
    readonly VITE_SCENE_ALIGNMENT_DEBUG?: string;
    readonly VITE_DEV_VALIDATE_CHEAT?: string;
    readonly VITE_YANDEX_METRICA_ID?: string;
    readonly VITE_ANALYTICS_DEBUG?: string;
    readonly VITE_PLATFORM_MODE?: string;
    readonly VITE_PLATFORM?: "yandex" | "crazygames" | "local";
    readonly VITE_APP_VERSION?: string;
    readonly VITE_BUILD_ID?: string;
    readonly VITE_CONTENT_VERSION?: string;
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
