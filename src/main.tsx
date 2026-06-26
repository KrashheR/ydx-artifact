import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles.css";
import "@/i18n";
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
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
