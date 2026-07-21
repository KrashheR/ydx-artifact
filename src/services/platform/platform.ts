import { crazyGamesPlatform } from "./crazyGamesPlatform";
import { localPlatform } from "./localPlatform";
import type { PlatformId, TestablePlatformAdapter } from "./types";
import { yandexPlatform } from "./yandexPlatform";

function resolvePlatform(): PlatformId {
  const configured = import.meta.env.VITE_PLATFORM ?? import.meta.env.VITE_PLATFORM_MODE;
  if (configured === "crazygames" || configured === "yandex" || configured === "local") return configured;
  if (configured === "mock") return "local";
  if (typeof window !== "undefined" && (window.ysdk || window.YaGames)) return "yandex";
  return import.meta.env.DEV ? "local" : "yandex";
}

function adapterFor(platformId: PlatformId) {
  return platformId === "crazygames" ? crazyGamesPlatform : platformId === "yandex" ? yandexPlatform : localPlatform;
}
export function getPlatformAdapter() { return adapterFor(resolvePlatform()); }
export function getPlatformId() { return resolvePlatform(); }
export function getTestablePlatformAdapter() { return getPlatformAdapter() as TestablePlatformAdapter; }
