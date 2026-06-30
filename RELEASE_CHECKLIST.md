# Release Checklist

- [ ] Replace placeholder assets.
- [ ] Run `pnpm release:validate`.
- [ ] Verify Yandex SDK, cloud save, SDK language detection, rewarded ads and gameplay pause/resume in draft.
- [ ] Verify `LoadingAPI.ready()` fires once only after the final localized home screen is rendered and first-screen preview images are loaded.
- [ ] Verify production `dist/index.html` contains modern module scripts, legacy `nomodule` scripts and legacy polyfills.
- [ ] Confirm the Yandex draft has no in-app purchase products enabled for this first publication build.
- [ ] Run `pnpm release:zip` after `pnpm build`; verify `dist-yandex.zip` has `index.html` at the archive root and no `dist/`, `.DS_Store`, `__MACOSX`, `._*` or sourcemap entries.
- [ ] Generate final checksum.
