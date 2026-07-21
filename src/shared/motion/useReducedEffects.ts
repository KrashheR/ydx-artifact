import { useEffect, useState } from "react";
import { useGameStore } from "@/shared/store/gameStore";

function getSystemPreference() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

/** Saved accessibility preference always supplements the operating-system setting. */
export function useReducedEffects() {
  const savedPreference = useGameStore((state) => state.saveData.settings.reducedMotion);
  const [systemPreference, setSystemPreference] = useState(getSystemPreference);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemPreference(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  return savedPreference || systemPreference;
}
