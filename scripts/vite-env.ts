import { loadEnv } from "vite";

export function loadProductionViteEnv() {
  const env = loadEnv("production", process.cwd(), "VITE_");

  for (const [key, value] of Object.entries(env)) {
    process.env[key] ??= value;
  }
}
