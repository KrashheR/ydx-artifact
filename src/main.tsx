import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles.css";
import "@/i18n";
import { getChapterLevels } from "@/content/chapters";
import { getTestablePlatformAdapter } from "@/services/platform/platform";
import { initPlatformLifecycle } from "@/services/platform/platformLifecycle";
import { useGameStore } from "@/shared/store/gameStore";

void initPlatformLifecycle();
void getTestablePlatformAdapter().notifyLoadingStart();

if (import.meta.env.DEV) {
  window.__artifactDev = {
    unlockAllContent: async () => {
      const { unlockAllDevContent } = await import("@/dev/devContent");
      await unlockAllDevContent();
      const { completedLevels, purchases } = useGameStore.getState().saveData;

      return {
        unlockedLevels: completedLevels.length,
        purchases
      };
    },
    resetSave: async () => {
      await useGameStore.getState().resetSave();
      return useGameStore.getState().saveData;
    },
    setReviewMock: (mode) => {
      if (!mode) {
        getTestablePlatformAdapter().setReviewGatewayOverride?.(null);
        return;
      }

      getTestablePlatformAdapter().setReviewGatewayOverride?.({
        async canReview() {
          if (mode === "unavailable") {
            return { value: false, reason: "NO_AUTH" };
          }

          return { value: true };
        },
        async requestReview() {
          if (mode === "error") {
            throw new Error("Mock review request failed");
          }

          return { feedbackSent: mode === "sent" };
        }
      });
    },
    triggerReviewPromptDemo: async () => {
      const demoLevels = getChapterLevels("northern-route").slice(0, 4);
      const firstThreeLevels = demoLevels.slice(0, 3).map((level) => level.id);
      useGameStore.setState((state) => ({
        saveData: {
          ...state.saveData,
          completedLevels: firstThreeLevels,
          reviewPrompt: {
            ...state.saveData.reviewPrompt,
            prePromptShownCount: 0,
            nextEligibleCompletedLevel: 4,
            nativeReviewResolved: false,
            lastUnavailableReason: undefined
          }
        },
        reviewPromptRuntime: {
          ...state.reviewPromptRuntime,
          pendingMapCheckCompletedLevels: null,
          nativeRequestInFlight: false
        }
      }));
      useGameStore.getState().startLevel(demoLevels[3].id, "campaign");
      await useGameStore.getState().save({ flush: true });
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
