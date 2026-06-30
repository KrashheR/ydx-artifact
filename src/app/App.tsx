import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CollectionScreen } from "@/screens/CollectionScreen";
import { DailyScreen } from "@/screens/DailyScreen";
import { GameScreen } from "@/screens/GameScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { MapScreen } from "@/screens/MapScreen";
import { SettingsModal } from "@/screens/SettingsScreen";
import { notifyGameReady } from "@/services/platform/platformLifecycle";
import { useGameStore } from "@/shared/store/gameStore";

function SettingsGearIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function App() {
  const { i18n, t } = useTranslation();
  const screen = useGameStore((state) => state.screen);
  const hydrate = useGameStore((state) => state.hydrate);
  const save = useGameStore((state) => state.save);
  const locale = useGameStore((state) => state.saveData.settings.locale);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateForSession() {
      await hydrate();
      if (!cancelled && import.meta.env.DEV && import.meta.env.VITE_DEV_VALIDATE_CHEAT === "true") {
        await useGameStore.getState().unlockAllDevContent();
      }
      if (!cancelled) {
        void notifyGameReady();
      }
    }

    void hydrateForSession();

    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  useEffect(() => {
    const onPageHide = () => void save({ flush: true });
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onPageHide);
    };
  }, [save]);

  const current = useMemo(() => {
    switch (screen.kind) {
      case "home":
        return <HomeScreen />;
      case "map":
        return <MapScreen />;
      case "game":
        return <GameScreen levelId={screen.levelId} mode={screen.mode} />;
      case "daily":
        return <DailyScreen />;
      case "collection":
        return <CollectionScreen />;
    }
  }, [screen]);

  return (
    <main className="min-h-screen bg-exp-bg text-graphite">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${screen.kind}-${"chapterId" in screen ? screen.chapterId : ""}-${"levelId" in screen ? screen.levelId : ""}`}
          className="min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {current}
        </motion.div>
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label={t("actions.settings")}
        className={`app-settings-button app-settings-button--${screen.kind} fixed right-4 top-4 z-[90] flex h-11 w-11 items-center justify-center rounded-[9px] text-exp-parch transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass`}
        style={{
          border: "1px solid rgba(213,195,154,.14)",
          background: "rgba(213,195,154,.05)",
        }}
      >
        <SettingsGearIcon />
      </button>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </main>
  );
}
