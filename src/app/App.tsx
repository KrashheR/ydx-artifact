import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CollectionScreen } from "@/screens/CollectionScreen";
import { DailyScreen } from "@/screens/DailyScreen";
import { GameScreen } from "@/screens/GameScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { MapScreen } from "@/screens/MapScreen";
import { SettingsModal } from "@/screens/SettingsScreen";
import { campaignManifestList } from "@/content/campaignManifest";
import { getChapterPreviewAsset } from "@/content/sceneAssets";
import { mockPlatform } from "@/services/platform/mockPlatform";
import { notifyGameReady } from "@/services/platform/platformLifecycle";
import { resolveInitialLocale } from "@/shared/lib/locale";
import { useGameStore } from "@/shared/store/gameStore";

function nextFrame() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
      return;
    }
    window.setTimeout(resolve, 16);
  });
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

async function preloadCriticalImages() {
  await Promise.all(campaignManifestList.map((campaign) => preloadImage(getChapterPreviewAsset(campaign.id))));
}

async function waitForFonts() {
  await document.fonts?.ready;
}

function BootstrapScreen() {
  return (
    <main className="app-bootstrap-screen" aria-busy="true" aria-label="Loading">
      <div className="app-bootstrap-mark" aria-hidden="true" />
    </main>
  );
}

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
  const setAutoLocale = useGameStore((state) => state.setAutoLocale);
  const locale = useGameStore((state) => state.saveData.settings.locale);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await hydrate();
      const sdkLanguage = await mockPlatform.getEnvironmentLanguage();
      if (cancelled) return;

      const savedSettings = useGameStore.getState().saveData.settings;
      const nextLocale = savedSettings.localeSource === "manual" ? savedSettings.locale : resolveInitialLocale(sdkLanguage);
      if (savedSettings.localeSource !== "manual") {
        setAutoLocale(nextLocale);
      }
      await i18n.changeLanguage(nextLocale);
      document.documentElement.lang = nextLocale;
      document.title = i18n.t("app.title");

      if (!cancelled && import.meta.env.DEV && import.meta.env.VITE_DEV_VALIDATE_CHEAT === "true") {
        const { unlockAllDevContent } = await import("@/dev/devContent");
        await unlockAllDevContent();
      }

      await preloadCriticalImages();
      await waitForFonts();
      if (cancelled) return;

      setBootstrapped(true);
      await nextFrame();
      await nextFrame();
      if (!cancelled) {
        await notifyGameReady();
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [hydrate, i18n, setAutoLocale]);

  useEffect(() => {
    if (!bootstrapped) return;
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.title = t("app.title");
  }, [bootstrapped, i18n, locale, t]);

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

  if (!bootstrapped) {
    return <BootstrapScreen />;
  }

  return (
    <main className="min-h-screen bg-exp-bg text-graphite">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${screen.kind}-${"chapterId" in screen ? screen.chapterId : ""}-${"levelId" in screen ? screen.levelId : ""}`}
          className="min-h-screen"
          initial={false}
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
