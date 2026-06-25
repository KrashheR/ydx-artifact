# Release readiness checklist

Использовать перед каждой отправкой на модерацию и перед ручной публикацией.

---

## A. Product

- [ ] Tutorial понятен без внешних инструкций.
- [ ] Первое действие доступно не позднее 20 секунд при нормальной сети.
- [ ] Все 12 campaign levels проходимы.
- [ ] Все 3 daily scenes проходимы.
- [ ] Difficulty растёт постепенно.
- [ ] Нет pixel-hunt и случайных AI differences.
- [ ] Нет тупиковых экранов.
- [ ] Игрок всегда может продолжить без rewarded.
- [ ] Artifact reveal не повторяется после reload.
- [ ] Chapter completion не ломает дальнейшую навигацию.

## B. Saves

- [ ] Guest Yandex cloud save.
- [ ] Authorized Yandex cloud save.
- [ ] safeStorage fallback.
- [ ] window.localStorage fallback.
- [ ] Reload после одного difference.
- [ ] Reload после level completion.
- [ ] Reload после daily reward.
- [ ] Save merge local newer.
- [ ] Save merge cloud newer.
- [ ] Account selection dialog.
- [ ] Previous save schema migration.
- [ ] Save size below guard.
- [ ] No purchase/entitlement loss.

## C. Monetization

- [ ] Catalog loads RU.
- [ ] Catalog loads EN.
- [ ] Dynamic price/currency/icon.
- [ ] Rewarded exact hint success.
- [ ] Rewarded close without reward.
- [ ] Rewarded error recovery.
- [ ] Interstitial only on map.
- [ ] No interstitial after tutorial.
- [ ] No interstitial after rewarded.
- [ ] no_forced_ads disables interstitial.
- [ ] Optional rewarded remains after no_forced_ads.
- [ ] Consumable persisted before consume.
- [ ] Pending purchase recovery.
- [ ] Test purchase account verified.
- [ ] Remote purchases kill switch verified.

## D. SDK lifecycle

- [ ] SDK connected by current supported path.
- [ ] LoadingAPI.ready exactly once.
- [ ] No blocking loader when ready is sent.
- [ ] GameplayAPI start/stop correspond to real state.
- [ ] game_api_pause suspends audio/input/timer.
- [ ] game_api_resume restores correct state.
- [ ] Startup fullscreen ad scenario.
- [ ] Tab hide/show.
- [ ] Minimize/restore.
- [ ] Purchase dialog pause/resume.
- [ ] Ad dialog pause/resume.
- [ ] Account selection events unsubscribed on teardown.

## E. Responsive and browser behavior

- [ ] 360×640 portrait.
- [ ] 390×844 portrait.
- [ ] 640×360 landscape.
- [ ] 844×390 landscape.
- [ ] 768×1024 tablet.
- [ ] 1024×768 tablet.
- [ ] 1280×720 desktop.
- [ ] 1440×900 desktop.
- [ ] Resize during gameplay.
- [ ] Rotate during gameplay.
- [ ] No body scroll.
- [ ] No swipe-to-refresh.
- [ ] No context menu.
- [ ] No image drag.
- [ ] No accidental text selection.
- [ ] Browser/system shortcuts still work.
- [ ] Fullscreen enter/exit does not break layout.

## F. Localization

- [ ] Yandex language RU.
- [ ] Yandex language EN.
- [ ] Unsupported language falls back to RU.
- [ ] Manual language switch.
- [ ] Selection persists cloud/local.
- [ ] No mixed-language screen.
- [ ] No clipped English copy.
- [ ] No text in gameplay images.
- [ ] RU/EN key parity.
- [ ] Product catalog fallback localized.

## G. Performance and errors

- [ ] Game Ready budget.
- [ ] First scene does not wait for all content.
- [ ] Current + next preload only.
- [ ] Scene asset decode failure fallback.
- [ ] Canvas context loss fallback.
- [ ] No unhandled promise rejection.
- [ ] No console errors in normal flow.
- [ ] Memory does not grow across 12 levels.
- [ ] Textures released.
- [ ] Midrange mobile p10 FPS accepted.
- [ ] Input latency accepted.
- [ ] Offline after boot.
- [ ] SDK timeout.
- [ ] Remote flags timeout.

## H. Content/legal

- [ ] All assets owned/licensed.
- [ ] AI provenance ledger complete.
- [ ] Fonts licenses recorded.
- [ ] Audio licenses recorded.
- [ ] No brands/logos.
- [ ] No real-person likeness.
- [ ] No politics, religion or real conflict references.
- [ ] Fictional station/expedition names.
- [ ] No readable AI garbage text.
- [ ] No copyrighted franchise resemblance.
- [ ] Privacy policy decision documented.
- [ ] Third-party notices included.

## I. Catalog

- [ ] RU title.
- [ ] EN title.
- [ ] Name matches game UI.
- [ ] RU description.
- [ ] EN description.
- [ ] RU short description ≤ 70 characters.
- [ ] EN short description ≤ 70 characters.
- [ ] RU how-to-play.
- [ ] EN how-to-play.
- [ ] 512×512 icon.
- [ ] Cover.
- [ ] Maskable icon if used.
- [ ] RU screenshots.
- [ ] EN screenshots.
- [ ] Mobile screenshots.
- [ ] Desktop screenshots.
- [ ] Real gameplay ≥ 70% of screenshot.
- [ ] Icon/cover are not raw screenshots.
- [ ] Categories ≤ 2.
- [ ] Only RU/EN declared.
- [ ] Cloud save checkbox enabled.
- [ ] Desktop + Mobile selected.
- [ ] TV not selected.
- [ ] Orientation = Any.

## J. Build

- [ ] Semver + build number.
- [ ] `index.html` at ZIP root.
- [ ] One `index.html`.
- [ ] Uncompressed size ≤ 100 MB.
- [ ] ASCII filenames.
- [ ] No spaces in paths.
- [ ] No Cyrillic paths.
- [ ] No external hotlinks.
- [ ] CSP reviewed.
- [ ] release-manifest generated.
- [ ] asset-manifest generated.
- [ ] content-manifest generated.
- [ ] archive checksum generated.
- [ ] last-known-good archive retained.
- [ ] release notes written.
- [ ] all CI commands pass.

## K. Yandex testing

- [ ] Dev environment mock test.
- [ ] Prod local proxy test.
- [ ] Draft mode test.
- [ ] Debug panel SDK checks.
- [ ] Performance Game Ready check.
- [ ] Test purchases.
- [ ] Ads tested in platform environment.
- [ ] Moderation developer comment includes unusual test notes.
- [ ] Postpone publication enabled.

## L. Publish and monitor

- [ ] Verified build smoke-tested.
- [ ] Remote defaults captured.
- [ ] Support email monitored.
- [ ] Publish manually.
- [ ] First 2-hour smoke.
- [ ] First 24-hour metrics review.
- [ ] Save/ad/purchase errors reviewed.
- [ ] Rating/reviews reviewed when available.
- [ ] No simultaneous major creative and gameplay experiment.
