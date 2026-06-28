import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles.css";
import "@/i18n";
import { getChapterLevels } from "@/content/chapters";
import { mockPlatform } from "@/services/platform/mockPlatform";
import { useGameStore } from "@/shared/store/gameStore";

if (import.meta.env.DEV) {
  window.__artifactDev = {
    unlockAllContent: async () => {
      await useGameStore.getState().unlockAllDevContent();
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
        mockPlatform.setReviewGatewayOverride(null);
        return;
      }

      mockPlatform.setReviewGatewayOverride({
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
      const firstThreeLevels = getChapterLevels("northern-route").slice(0, 3).map((level) => level.id);
      useGameStore.setState((state) => ({
        screen: { kind: "map", chapterId: "northern-route" },
        saveData: {
          ...state.saveData,
          completedLevels: firstThreeLevels,
          reviewPrompt: {
            ...state.saveData.reviewPrompt,
            prePromptShownCount: 0,
            nextEligibleCompletedLevel: 3,
            nativeReviewResolved: false,
            lastUnavailableReason: undefined
          }
        },
        reviewPromptRuntime: {
          ...state.reviewPromptRuntime,
          pendingMapCheckToken: state.reviewPromptRuntime.pendingMapCheckToken + 1,
          pendingMapCheckCompletedLevels: 3,
          nativeRequestInFlight: false
        }
      }));
      await useGameStore.getState().save();
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
