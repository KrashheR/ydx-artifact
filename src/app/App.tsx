import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CollectionScreen } from "@/screens/CollectionScreen";
import { DailyScreen } from "@/screens/DailyScreen";
import { GameScreen } from "@/screens/GameScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { MapScreen } from "@/screens/MapScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { useGameStore } from "@/shared/store/gameStore";

export function App() {
  const { i18n } = useTranslation();
  const screen = useGameStore((state) => state.screen);
  const hydrate = useGameStore((state) => state.hydrate);
  const save = useGameStore((state) => state.save);
  const locale = useGameStore((state) => state.saveData.settings.locale);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  useEffect(() => {
    const onPageHide = () => void save();
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
      case "settings":
        return <SettingsScreen />;
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
    </main>
  );
}
