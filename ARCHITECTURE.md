# Architecture

React owns screens and UI state. Gameplay hit testing is isolated in `src/shared/lib/hitTesting.ts`.

Playable campaign content is chapter-driven:

- `src/content/levels.ts` contains authored `northern-route` gameplay levels.
- `src/content/sandMeridianLevels.ts` builds `sand-meridian` gameplay levels from the plot handoff package plus shared scaffold hitboxes.
- `src/content/chapters.ts` is the catalog layer used by Home, Map, progression and validation; each chapter provides level list, map background and normalized map nodes.

Platform calls are routed through service modules under `src/services`. Current implementation uses local mock mode and `window.localStorage` as the save mirror.
