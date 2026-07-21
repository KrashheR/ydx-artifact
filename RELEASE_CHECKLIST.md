# Release Checklist

- [ ] Replace placeholder assets.
- [ ] Run `pnpm release:validate`.
- [ ] Confirm `VITE_YANDEX_METRICA_ID` is numeric; release validation must pass registry/runtime/docs and built-counter checks.
- [ ] Run `pnpm metrika:goals` / `pnpm metrika:goals:publish` and confirm all registry goals exist in the target counter.
- [ ] Run one draft smoke session and verify `game_open`, `game_ready`, `level_attempt_start` and `level_attempt_end` ingestion in the target counter.
- [ ] Confirm production analytics debug logging is disabled.
- [ ] Verify Yandex SDK, cloud save, SDK language detection, rewarded ads and gameplay pause/resume in draft.
- [ ] Verify `LoadingAPI.ready()` fires once only after the final localized home screen is rendered and first-screen preview images are loaded.
- [ ] Verify production `dist/index.html` contains modern module scripts, legacy `nomodule` scripts and legacy polyfills.
- [ ] Verify production `dist/index.html` uses relative `./assets/...` Vite bundle links; keep only the Yandex SDK as root `/sdk.js`.
- [ ] Confirm the Yandex draft has no in-app purchase products enabled for this first publication build.
- [ ] Run `pnpm release:zip`; it creates a fresh production build and verifies `dist-yandex.zip` has `index.html` at the archive root and no `dist/`, `.DS_Store`, `__MACOSX`, `._*` or sourcemap entries.
- [ ] Generate final checksum.
