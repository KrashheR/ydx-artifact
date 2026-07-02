export type AnalyticsPayloadValue = string | number | boolean | null | undefined;
export type AnalyticsPayload = Record<string, AnalyticsPayloadValue>;

export type AnalyticsEvent = {
  event: string;
  goal: string;
  payload: AnalyticsPayload;
};

type YandexMetrica = {
  (counterId: number, method: "init", options: Record<string, unknown>): void;
  (counterId: number, method: "reachGoal", target: string, params?: AnalyticsPayload): void;
  a?: unknown[];
  l?: number;
};

const ANALYTICS_SCHEMA_VERSION = 1;
const SESSION_STORAGE_KEY = "artifact.analytics.sessionId";
const METRIKA_GOAL_PREFIX = "aa_";
const SAFE_GOAL_PATTERN = /^[a-zA-Z0-9_]+$/;

declare global {
  interface Window {
    ym?: YandexMetrica;
    __artifactAnalyticsEvents?: AnalyticsEvent[];
  }
}

let metrikaInitialized = false;

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getSessionId() {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const next = createSessionId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, next);
    return next;
  } catch {
    return createSessionId();
  }
}

function getDeviceType() {
  if (typeof window === "undefined") return "unknown";
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1280) return "tablet";
  return "desktop";
}

function getCounterId() {
  const raw = import.meta.env.VITE_YANDEX_METRICA_ID;
  if (!raw || !/^\d+$/.test(raw)) return null;
  return Number(raw);
}

function ensureYandexMetrica(counterId: number) {
  if (typeof window === "undefined") return;

  if (!window.ym) {
    const queuedYm = ((...args: unknown[]) => {
      queuedYm.a = queuedYm.a ?? [];
      queuedYm.a.push(args);
    }) as YandexMetrica;
    queuedYm.l = Date.now();
    window.ym = queuedYm;
  }

  if (metrikaInitialized) return;
  metrikaInitialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.append(script);

  window.ym(counterId, "init", {
    clickmap: false,
    trackLinks: false,
    accurateTrackBounce: true
  });
}

function toGoalName(event: string) {
  const normalized = `${METRIKA_GOAL_PREFIX}${event}`;
  return SAFE_GOAL_PATTERN.test(normalized) ? normalized : null;
}

function sanitizePayload(payload: AnalyticsPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as AnalyticsPayload;
}

export function trackAnalyticsEvent(event: string, payload: AnalyticsPayload = {}) {
  const goal = toGoalName(event);
  if (!goal) {
    if (import.meta.env.DEV) {
      console.warn(`[analytics] skipped unsafe event name: ${event}`);
    }
    return;
  }

  const enrichedPayload = sanitizePayload({
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    sessionId: getSessionId(),
    event,
    timestamp: new Date().toISOString(),
    deviceType: getDeviceType(),
    platformMode: import.meta.env.VITE_PLATFORM_MODE ?? "auto",
    gameVersion: import.meta.env.VITE_APP_VERSION ?? "0.1.0",
    ...payload
  });
  const analyticsEvent = { event, goal, payload: enrichedPayload };

  if (typeof window !== "undefined") {
    window.__artifactAnalyticsEvents = window.__artifactAnalyticsEvents ?? [];
    window.__artifactAnalyticsEvents.push(analyticsEvent);
    window.__artifactAnalyticsEvents = window.__artifactAnalyticsEvents.slice(-100);
  }

  const counterId = getCounterId();
  if (counterId && typeof window !== "undefined") {
    try {
      ensureYandexMetrica(counterId);
      const ym = window.ym;
      ym?.(counterId, "reachGoal", goal, enrichedPayload);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[analytics] reachGoal failed", error);
      }
    }
  }

  if (import.meta.env.DEV || import.meta.env.VITE_ANALYTICS_DEBUG === "true") {
    console.debug(`[analytics] ${goal}`, enrichedPayload);
  }
}
