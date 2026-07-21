import { AnimatePresence, motion } from "framer-motion";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { GameScreen } from "@/screens/GameScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { MapScreen } from "@/screens/MapScreen";
import { campaignManifestList } from "@/content/campaignManifest";
import { dailyArchiveLevels } from "@/content/dailyArchive";
import { getChapterPreviewAsset } from "@/content/sceneAssets";
import {
  getSafeErrorFingerprint,
  trackAnalyticsEvent,
} from "@/services/analytics/analytics";
import { mockPlatform } from "@/services/platform/mockPlatform";
import {
  getIsPlatformPaused,
  notifyGameReady,
  subscribePlatformPause,
} from "@/services/platform/platformLifecycle";
import { isMobileGameplayDevice } from "@/shared/lib/device";
import { preloadImage } from "@/shared/lib/imagePreload";
import { getBrowserLanguage, resolveInitialLocale } from "@/shared/lib/locale";
import { prefetchHomeIdleAssets } from "@/shared/lib/scenePrefetch";
import { useGameStore } from "@/shared/store/gameStore";
import { motion as motionSpec, motionDuration } from "@/shared/motion/motion";
import { useReducedEffects } from "@/shared/motion/useReducedEffects";

function nextFrame() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
      return;
    }
    window.setTimeout(resolve, 16);
  });
}

// Secondary surfaces load as separate chunks so they don't weigh down the
// initial bundle; home/map/game stay in the entry chunk as the critical path.
const CollectionScreen = lazy(() =>
  import("@/screens/CollectionScreen").then((module) => ({
    default: module.CollectionScreen,
  })),
);
const DailyScreen = lazy(() =>
  import("@/screens/DailyScreen").then((module) => ({
    default: module.DailyScreen,
  })),
);
const SettingsModal = lazy(() =>
  import("@/screens/SettingsScreen").then((module) => ({
    default: module.SettingsModal,
  })),
);
const ControlSchemeModal = lazy(() =>
  import("@/screens/ControlSchemeModal").then((module) => ({
    default: module.ControlSchemeModal,
  })),
);

async function preloadCriticalImages() {
  await Promise.all(
    campaignManifestList.map((campaign) =>
      preloadImage(getChapterPreviewAsset(campaign.id)),
    ),
  );
}

async function waitForFonts() {
  await document.fonts?.ready;
}

function BootstrapScreen() {
  return (
    <main
      className="app-bootstrap-screen"
      aria-busy="true"
      aria-label="Loading"
    >
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

function OrientationGate() {
  const { t } = useTranslation();

  return (
    <aside className="orientation-gate" role="dialog" aria-modal="true">
      <div className="orientation-gate__mark" aria-hidden="true">
        <svg
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <rect x="11" y="7" width="22" height="30" rx="5" />
          <path d="M15 28h14" strokeLinecap="round" />
          <path d="M30 12c5 2 8 6 8 11" strokeLinecap="round" />
          <path
            d="M36 20l2 3 2-3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="orientation-gate__eyebrow">{t("orientation.eyebrow")}</p>
      <h1>{t("orientation.title")}</h1>
      <p>{t("orientation.description")}</p>
    </aside>
  );
}

export function App() {
  const { i18n, t } = useTranslation();
  const screen = useGameStore((state) => state.screen);
  const hydrate = useGameStore((state) => state.hydrate);
  const openStartupScreen = useGameStore((state) => state.openStartupScreen);
  const save = useGameStore((state) => state.save);
  const setAutoLocale = useGameStore((state) => state.setAutoLocale);
  const locale = useGameStore((state) => state.saveData.settings.locale);
  const comparatorScheme = useGameStore(
    (state) => state.saveData.settings.comparatorScheme,
  );
  const reducedEffects = useReducedEffects();
  const [effectsPaused, setEffectsPaused] = useState(
    () => getIsPlatformPaused() || document.visibilityState === "hidden",
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Keeps the lazy settings chunk out of the initial load: the modal is
  // mounted on first open and stays mounted so close animations still play.
  const [settingsMounted, setSettingsMounted] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const preventBrowserGameGesture = (event: Event) => event.preventDefault();
    const listenerOptions = { capture: true };

    window.addEventListener(
      "contextmenu",
      preventBrowserGameGesture,
      listenerOptions,
    );
    document.addEventListener(
      "selectstart",
      preventBrowserGameGesture,
      listenerOptions,
    );
    document.addEventListener(
      "dragstart",
      preventBrowserGameGesture,
      listenerOptions,
    );
    return () => {
      window.removeEventListener(
        "contextmenu",
        preventBrowserGameGesture,
        listenerOptions,
      );
      document.removeEventListener(
        "selectstart",
        preventBrowserGameGesture,
        listenerOptions,
      );
      document.removeEventListener(
        "dragstart",
        preventBrowserGameGesture,
        listenerOptions,
      );
    };
  }, []);

  const openSettings = useCallback(
    (source: string) => {
      trackAnalyticsEvent("settings_opened", { source, screen: screen.kind });
      setSettingsMounted(true);
      setSettingsOpen(true);
    },
    [screen.kind],
  );

  const closeSettings = useCallback(() => {
    trackAnalyticsEvent("settings_closed", { screen: screen.kind });
    setSettingsOpen(false);
  }, [screen.kind]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const bootStartedAt = performance.now();
      trackAnalyticsEvent("game_open", {
        language: i18n.resolvedLanguage ?? i18n.language,
      });

      // Save hydration + locale resolution is independent from asset warmup,
      // so the three run in parallel instead of serially.
      const applyLocale = async () => {
        await hydrate();
        const sdkLanguage = await mockPlatform.getEnvironmentLanguage();
        if (cancelled) return i18n.resolvedLanguage ?? i18n.language;

        const savedSettings = useGameStore.getState().saveData.settings;
        const nextLocale =
          savedSettings.localeSource === "manual"
            ? savedSettings.locale
            : resolveInitialLocale(sdkLanguage, getBrowserLanguage());
        if (savedSettings.localeSource !== "manual") {
          setAutoLocale(nextLocale);
        }
        await i18n.changeLanguage(nextLocale);
        document.documentElement.lang = nextLocale;
        document.title = i18n.t("app.title");

        if (
          !cancelled &&
          import.meta.env.DEV &&
          import.meta.env.VITE_DEV_VALIDATE_CHEAT === "true"
        ) {
          const { unlockAllDevContent } = await import("@/dev/devContent");
          await unlockAllDevContent();
        }

        if (
          !cancelled &&
          import.meta.env.DEV &&
          import.meta.env.VITE_ARCHIVE_VALIDATE === "true"
        ) {
          useGameStore.getState().startLevel(dailyArchiveLevels[0].id, "daily");
          return nextLocale;
        }

        if (!cancelled && useGameStore.getState().screen.kind === "home") {
          openStartupScreen();
        }

        return nextLocale;
      };

      const [nextLocale] = await Promise.all([
        applyLocale(),
        preloadCriticalImages(),
        waitForFonts(),
      ]);
      if (cancelled) return;

      setBootstrapped(true);
      await nextFrame();
      await nextFrame();
      if (!cancelled) {
        await notifyGameReady();
        trackAnalyticsEvent("game_ready", {
          language: nextLocale,
        });
        trackAnalyticsEvent("game_ready_timing", {
          durationMs: Math.round(performance.now() - bootStartedAt),
          language: nextLocale,
        });
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [hydrate, i18n, openStartupScreen, setAutoLocale]);

  useEffect(() => {
    const reportFatalError = (
      source: "window_error" | "unhandled_rejection",
      error: unknown,
    ) => {
      const currentScreen = useGameStore.getState().screen;
      trackAnalyticsEvent("fatal_error", {
        source,
        fingerprint: getSafeErrorFingerprint(error),
        screen: currentScreen.kind,
        levelId:
          currentScreen.kind === "game" ? currentScreen.levelId : undefined,
      });
      if (currentScreen.kind === "game") {
        useGameStore
          .getState()
          .endLevelAttempt(currentScreen.levelId, "technical_error");
      }
    };
    const onError = (event: ErrorEvent) =>
      reportFatalError("window_error", event.error ?? event.message);
    const onUnhandledRejection = (event: PromiseRejectionEvent) =>
      reportFatalError("unhandled_rejection", event.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  // Once the home screen is visible, warm the map card previews and likely
  // next level scenes in the background, so opening a campaign shows
  // already-cached images. Idle-scheduled and non-blocking.
  useEffect(() => {
    if (!bootstrapped) return;
    const start = () =>
      void prefetchHomeIdleAssets(useGameStore.getState().saveData);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 1000);
    return () => window.clearTimeout(id);
  }, [bootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (i18n.resolvedLanguage !== locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
    document.title = i18n.t("app.title");
  }, [bootstrapped, i18n, locale]);

  useEffect(() => {
    const onPageHide = () => void save({ flush: true });
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onPageHide);
    };
  }, [save]);

  // Decorative effects pause with the platform and background tab. Gameplay
  // state keeps its own lifecycle contract; this only prevents idle CSS loops.
  useEffect(() => {
    const syncVisibility = () =>
      setEffectsPaused(
        getIsPlatformPaused() || document.visibilityState === "hidden",
      );
    const unsubscribe = subscribePlatformPause(syncVisibility);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  const current = useMemo(() => {
    switch (screen.kind) {
      case "home":
        return (
          <HomeScreen onOpenSettings={() => openSettings("home_topbar")} />
        );
      case "map":
        return <MapScreen onOpenSettings={() => openSettings("map_topbar")} />;
      case "game":
        return (
          <GameScreen
            levelId={screen.levelId}
            mode={screen.mode}
            showOnboarding={screen.showOnboarding ?? false}
            onOpenSettings={() => openSettings("game_hud")}
            isSettingsOpen={settingsOpen}
          />
        );
      case "daily":
        return (
          <Suspense fallback={<BootstrapScreen />}>
            <DailyScreen />
          </Suspense>
        );
      case "collection":
        return (
          <Suspense fallback={<BootstrapScreen />}>
            <CollectionScreen />
          </Suspense>
        );
    }
  }, [openSettings, screen, settingsOpen]);

  if (!bootstrapped) {
    return <BootstrapScreen />;
  }

  return (
    <main className={`min-h-screen bg-exp-bg text-graphite ${reducedEffects ? "vfx-reduced" : ""} ${effectsPaused ? "vfx-paused" : ""}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${screen.kind}-${"chapterId" in screen ? screen.chapterId : ""}-${"levelId" in screen ? screen.levelId : ""}`}
          className="min-h-screen"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedEffects ? 0 : -4 }}
          transition={{ duration: motionDuration(motionSpec.base, reducedEffects), ease: motionSpec.easeStandard }}
        >
          {current}
        </motion.div>
      </AnimatePresence>
      {screen.kind !== "game" &&
        screen.kind !== "map" &&
        screen.kind !== "home" && (
          <button
            type="button"
            onClick={() => openSettings(`${screen.kind}_floating`)}
            aria-label={t("actions.settings")}
            className={`app-settings-button app-settings-button--${screen.kind} fixed z-[90] flex items-center justify-center text-exp-parch transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass`}
            style={{
              border: "1px solid rgba(213,195,154,.14)",
              background: "rgba(213,195,154,.05)",
            }}
          >
            <SettingsGearIcon />
          </button>
        )}
      {settingsMounted && (
        <Suspense fallback={null}>
          <SettingsModal isOpen={settingsOpen} onClose={closeSettings} />
        </Suspense>
      )}
      {/*
       * The first-run briefing is the first modal a new player must see.
       * Showing the control picker globally used to put its higher z-index
       * above that briefing on phones, effectively hiding onboarding. Once
       * the player starts the first level, the picker is shown immediately
       * before gameplay can begin.
       */}
      {screen.kind === "game" &&
        !screen.showOnboarding &&
        comparatorScheme === null &&
        isMobileGameplayDevice() && (
        <Suspense fallback={null}>
          <ControlSchemeModal />
        </Suspense>
      )}
      <OrientationGate />
    </main>
  );
}
