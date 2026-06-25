# Architecture

React owns screens and UI state. Gameplay hit testing is isolated in `src/shared/lib/hitTesting.ts`; content is defined in `src/content/levels.ts` and validated before build.

Platform calls are routed through service modules under `src/services`. Current implementation uses local mock mode and `window.localStorage` as the save mirror.
