export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

export function trackAnalyticsEvent(event: string, payload: AnalyticsPayload = {}) {
  if (import.meta.env.DEV) {
    console.debug(`[analytics] ${event}`, payload);
  }
}
