# Changelog

- Added tactile A/B comparator feedback: flip mode now shifts and crossfades the photo card without blank frames or queued taps, while slider mode gives a throttled optical glint when crossing the midpoint. Added timer-warning VFX with one amber pulse at 30 seconds remaining and a calm rust rhythm during the final 10 seconds; both respect reduced motion and stop while gameplay is blocked.

## Unreleased

- Improved the mobile landscape side-by-side comparison layout: the level HUD now sits above the photos and hint/settings actions below them, so neither side rail takes width away from the two scenes.

- Added a third mobile compare mode: side-by-side photos with shared zoom and pan. The before/after slider and A/B flip are selectable alongside it in settings; the choice applies to mobile gameplay.

- Smoothed the mobile A/B flip control: scenes now use a 190 ms directional slide-dissolve with a subtle settling exposure instead of a lateral card jerk. Camera state, input lock and reduced-effects behavior are unchanged.

- Fixed the missed-click marker: its red cross now stays centered inside the circle even when visual animations are unavailable, and both fade out together faster.

- Completed the VFX production pass for meta and rare-reward surfaces: Home/Map now have finite mobile-safe state accents, campaign reports use the shared motion grammar, artifact reveals stage their contour/tag/content beats, and decorative animation pauses on platform or tab backgrounding.

- Added the first VFX foundation pass: shared motion timings, saved-or-system reduced-effects handling, tactile button press feedback, finite hint emphasis, dual-scene found markers with restrained brass flecks, HUD pip/streak response, calmer staged result entry and a 700 ms final-find beat before the victory overlay. The effects do not alter hit testing, rewards, saves or analytics.

- Added Collection VFX polish: filters now crossfade without reflowing the screen, new artifacts receive a single restrained seal/tag beat, and artifact details stage the image before their text while respecting reduced-effects preferences.

- Added `docs/SFX_PRODUCTION_PLAN.md`: a senior SFX audit, detailed cue briefs and generation/search prompts, audio architecture, CrazyGames mute/ad/iOS requirements, asset budgets, staged roadmap, QA matrix and release criteria.

- Fixed CrazyGames saves when the Developer Portal Data Module is disabled: `dataModuleDisabled` now falls back to browser storage and survives reload. Successful Data Module writes now show as synced instead of misleadingly showing “Local only”.

- Removed the first-launch mobile compare-mode modal. Flip is now the default for new and legacy unset saves; players can still switch between Flip and Slider in mobile settings.

- Added a CrazyGames Basic Launch ad profile: `build:crazygames` now disables all rewarded/midgame UI and requests while retaining SDK lifecycle and Data Module; `build:crazygames:full` is the explicit future monetization profile. Added Basic Launch regression coverage.
- Fixed CrazyGames locale handling to read `SDK.user.systemInfo.locale` and use English rather than Russian as its automatic fallback. Fixed the Vite SDK-script lint error.

- Added `docs/CRAZYGAMES_MIGRATION_PLAN.md`, an implementation-ready staged plan for maintaining the Yandex build while porting the game to CrazyGames Basic and Full Launch requirements.

- Added an optional, unrewarded four-option setting-interest survey to campaign reports. Selections emit the typed `setting_interest_selected` event for later comparison with campaign depth and retention.

- Fixed automatic startup locale selection: it now follows the Yandex Games priority of a manual saved choice, SDK language, browser language, then Russian fallback, instead of defaulting a missing SDK language to English.

- Rebuilt product analytics around persisted level attempts: every attempt now has an ID/number and one terminal outcome, onboarding and background abandonment are observable, hints/misclicks/time grants are summarized correctly, and active duration remains monotonic across timer extensions.

- Added typed analytics registry-driven Metrica goal sync, common build/content/locale/device dimensions, save/scene/fatal-error telemetry, campaign exposure/entry/completion events, consecutive daily streak semantics, and release validation that rejects missing counters or registry/docs/build drift.

- Added `pnpm dev:align`, a mobile landscape A/B registration dashboard with per-level, per-image 0.5px X/Y controls, local draft persistence, source Apply support, and runtime alignment shared by flip/slider images and their interaction overlays.

- Expanded `docs/GAME_OVERVIEW.md` into a current AI review brief with the complete implemented mechanics matrix, screen flow, scoring/timer/hint rules, partial systems, explicit non-features, extension constraints, and a reusable external-review prompt.

- Fixed the artifact reveal modal on short mobile landscape screens: it now uses a compact two-column layout with the artifact image kept fully visible, tighter copy spacing and 44px action buttons instead of forcing the player to scroll past the reveal image.

- Fixed broken campaign level select layout on small landscape phones (e.g. iPhone SE, 667x375): the landscape media query force-shows the desktop journal rail but the Tailwind `md:hidden` mobile level list stayed visible below the 768px breakpoint, so both lists rendered at once and split the screen height; the mobile list is now explicitly hidden in the landscape phone block.

- Fixed black frames in the mobile A/B flip compare mode: `PhotoComparator` now keeps both scene images mounted in the flipping canvas and toggles their visibility instead of swapping the single `<img src>`, so switching sides no longer shows the empty dark frame while the other image loads/decodes; also gave the landscape flip photo column an explicit width so the frame cannot collapse.

- Added a selectable mobile compare scheme: a first-launch modal on mobile devices asks the player to choose between the before/after slider (previous behavior) and a new single-frame A/B flip mode for landscape gameplay; the choice is stored in the save (`settings.comparatorScheme`), applied by `PhotoComparator`, and can be changed later from a new "Compare mode" section in the settings modal (mobile only).

- Refreshed `docs/GAME_OVERVIEW.md` into an up-to-date game summary covering the current Archive Hub, 39 campaign levels, 7 Daily Archive cases, collection, campaign reports, save/platform systems and remaining product decisions.

- Moved the in-game artifact discovery toast lower so it no longer overlaps the gameplay header.

- Fixed gameplay pausing while the settings modal is open: the active level timer, difference clicks, misclicks and hint actions now stop accumulating/registering whenever the settings gear icon opens the language modal, matching the existing platform-pause behavior.

- Changed campaign hint rewards to grant +1 hint after every second newly completed campaign level; replays no longer grant the campaign cadence reward.

- Changed the home hub primary "Continue expedition" action to launch the active campaign's next unfinished level directly; the separate map icon still opens the campaign level journal.

- Added per-level campaign story beats to the completion result flow: all 39 campaign levels now carry RU/EN intro, victory and clue keys in a checked 4-act structure, and the result modal shows the restored photo's concrete clue instead of only the generic completion copy.

- Synchronized the canonical narrative docs with the current 3-campaign Meridian Archive scope, including 39 campaign levels, 7 Daily Archive cases, 15 milestone artifacts, Aster-9 naming for Sand Meridian and the non-supernatural finale premise that the complete meridian map is dangerous without archive protection.

- Elevated the RU/EN campaign storyline with a stronger cross-campaign mystery: restored photos are now framed as deliberately edited archive copies, the vanished expeditions become protectors of a dangerous meridian water network, and campaign cards, artifact reveals and final reports share the same investigative arc.

- Polished RU/EN player-facing copy for clearer expedition storytelling, Russian-only UI wording, and more precise A/B gameplay labels.

- Reworked the artifact reveal ceremony sealed state: the broken-looking placeholder is replaced with a CSS/SVG archive wax seal that stamps in, splits open and reveals the collected artifact card.

- Removed the maximum hint balance cap: loaded saves preserve large magnifier balances and level/daily rewards keep accumulating above 5.

- Changed startup routing so only a brand-new save opens White Meridian level 01 directly; returning saves now open the archive hub/main menu instead of auto-resuming gameplay.

- Added authoring controls to the local hitbox validation editor: the bottom bar can add a new hitbox, editable markers have a confirmation-backed delete X, and Apply now keeps northern-route `requiredDifferences` in sync when hitboxes are added or removed.

- Added `pnpm validate:archive`, a final A/B hitbox validation server for Daily Archive cases that opens case 1 directly, exposes a 1-7 in-game switcher, and lets the hitbox editor Apply changes back into `src/content/dailyArchive.ts`.

- Extended browser-input suppression from active gameplay to the whole app shell: native context menus, text selection and browser drag gestures are now blocked across menus, overlays and levels.

- Changed hint economy: new saves now start with 1 hint, completing a Daily Archive case grants +1 hint once per local date through the shared level-completion flow, and the daily victory result now tells the player they won one hint.

- Changed the Archive Hub daily card to open the current Daily Archive case directly in shared gameplay, preserving the archive rotation, daily reward tracking and campaign progression isolation without the intermediate Daily screen.

- Wired the `public/assets/scenes/archive/1-7` scene package into 7 standalone Daily Archive cases with hitboxes transcribed from `3.webp` markup references, deterministic local `dayNumber % 7` rotation, Archive Hub entry, main-menu-only post-completion return, and campaign progression isolation.

- Converted the pending `public/assets/scenes/archive/1-7` scene intake from owner-provided PNG sources to lossless WebP derivatives with unchanged 1586x992 dimensions, then removed the source PNG files from runtime assets.

- Added the Campaign Case Report finale flow after level 13 of each campaign: a parchment archive report with 13/13 progress, five campaign findings, archivist conclusion, next-case/final-archive CTA, one-time auto-show save state, RU/EN copy and analytics events.

- Added the active campaign preview image above the current-case title on the archive home screen.

- Hardened gameplay browser-input suppression for Yandex moderation: active levels now prevent native context menus, text selection, and browser drag gestures across desktop and mobile scene interactions.

- Replaced the home campaign-selection screen with the new archive hub from `docs/design_handoff_archive_hub`: current-case CTA, daily archive card, filed-finds archive preview, compact campaign list, hint/save status topbar and landscape-phone responsive layout.

- Added the artifact collection flow ("Коллекция находок") from the design handoff: a data-driven catalog of 15 collectible artifacts (`src/content/artifacts.ts`, milestone levels 3/6/8/10/13 per campaign), an in-gameplay discovery toast, a post-victory reveal ceremony modal (`ArtifactRevealOverlay`), a fully redesigned `CollectionScreen` (progress header, campaign filter tabs, card grids with `open`/`closed` artifact images, detail modal with clue text and level replay), Home topbar / landscape-phone entry points, RU+EN texts sourced from `docs/expedition_narrative_collection_ru.json`, save reconciliation for pre-collection saves, and normalized artifact asset filenames (`closed.webp`).

- Converted the new artifact state images under `public/assets/artifacts/` from PNG to 512x512 lossless WebP.

- Restored `public/assets/scenes/northern-route/13/1.webp` from the historical updated A-scene blob so White Meridian level 13 uses distinct A/B gameplay images again.

- Changed startup routing so first launch opens White Meridian level 01 directly with an onboarding overlay, returning saves resume in-progress or next campaign gameplay, and fully completed saves open the collection/case screen instead of the home menu.

- Added rotated ellipse hitbox support to gameplay and the local hitbox editor. `pnpm dev:validate` and `pnpm validate:final` now expose a top rotate handle for ellipse markers, persist `rotation` degrees in content, and keep Apply support for northern, sand and emerald campaign modules.

- Added a temporary `pending-hitbox-12` authoring placeholder to `northern-route` level 12 and raised the level to 8 required differences so it can be positioned through the hitbox editor.

- Moved forced fullscreen interstitials from campaign-map entry to the post-victory next-level CTA: the cadence still queues on every third new campaign completion, but the ad shows only before starting the next level and is cleared when the player exits to the map.

- Moved the review pre-prompt from the campaign map to the post-victory result flow, changed the first eligibility threshold to four newly completed campaign levels, and fixed the review modal's decorative layer so "Rate the game" / "Later" buttons remain clickable.

- Made `pnpm release:zip` a one-command release archive pipeline: it now creates a fresh production build before validating and writing `dist-yandex.zip`.

- Added `pnpm assets:optimize` for dry-run gated WebP recompression of runtime gameplay scene pairs and applied the q97 pass to six oversized scene files, reducing gameplay scene weight from 52.0 MB to 44.4 MB while preserving dimensions and paths.

- Restored gameplay scene pairs (`public/assets/scenes/*/*/1.webp` and `2.webp`) to each file's first committed runtime WebP blob (`361c921`, `61b1f77`, or `78d3b0d`); gameplay images keep the same 1586x992 dimensions but use the original higher-quality runtime files again.

- Fixed Yandex ZIP startup by building production with relative Vite asset links (`./assets/...`) and deriving runtime scene paths from `import.meta.env.BASE_URL`; `pnpm release:zip` now rejects root-relative `/assets` script/style references.

- Removed obsolete campaign-folder map background assets (`bg.webp` / `background.webp`) from runtime wiring, content validation, prefetch and asset provenance; campaign maps now rely on card previews and configured route aspect ratios only.

- Vite command wrappers now load production-local `VITE_*` env from `.env.production.local` for `pnpm dev`, `pnpm dev:validate` and `pnpm build`, so `VITE_YANDEX_METRICA_ID` is included consistently in local, build and release validation flows. `pnpm metrika:goals` also reads the counter ID from `.env.production.local`.

- Added an idle background prefetch after the home screen appears: level card previews of unlocked campaigns (plus the likely next levels' scene pairs) are warmed one image at a time via `src/shared/lib/scenePrefetch.ts`, so opening a campaign map shows already-cached images; skipped when the browser reports data-saver.

- Loading performance pass: home/map cards now use generated compressed previews (`pnpm assets:previews` creates `card.webp` per level and `preview-sm.webp` per campaign, ~74% smaller; full-size `preview.webp` and `3.webp` are excluded from the production build), map card images are lazy-loaded, app bootstrap runs save hydration, preview warmup and font readiness in parallel, GameScreen preloads both scene images on level start and prefetches the next level's pair from the completion overlay, and Collection/Daily/Settings ship as lazy chunks outside the entry bundle.

- Fixed the mobile landscape campaign card overlapping the right carousel arrow: the card's right edge now sits left of the arrow (shell narrowed, `home-content` right padding increased, arrow offsets adjusted so both arrows stay fully outside the card).

- Restored campaign-card texts in mobile landscape (description clamped to two lines, progress counter and locked-campaign info box are visible again; the title selector now targets the redesigned `h2`), and widened mobile map level cards from 210px to 240px.

- Redesigned the mobile landscape hint control after the "Кнопка подсказки - варианты" design (variants 2a/2b): with hints left the FAB shows a glowing ring plus charge pips and an "N left" caption; with no hints left it shows a rotating dashed ring with a text-only "Watch ad" badge.

- Added a `durationBucket` field to `level_complete` analytics so Yandex Metrica can segment level completion speed alongside the exact `durationSeconds` value.

- Added privacy-safe gameplay analytics coverage for Yandex publication: optional Yandex Metrica `reachGoal` transport via `VITE_YANDEX_METRICA_ID`, local QA buffering in `window.__artifactAnalyticsEvents`, events across app readiness, campaign selection, level flow, differences, hints, ads, daily rewards and review prompts, plus `docs/YANDEX_METRICS_SETUP_GUIDE.md`.

- Added `pnpm metrika:goals` to dry-run and create missing Yandex Metrica JavaScript-event goals from the documented analytics goal list.

- Added a `--cheat` flag to `pnpm dev` (via the new `scripts/dev.ts` wrapper) that runs the plain dev server with the all-content dev unlock applied, without the hitbox layout-debug overlay. Use `pnpm dev --cheat` (or `npm run dev -- --cheat`).

- Updated the desktop v3 UI pass from `docs/new_desk`: campaign selection hides locked progress counts and darkens locked previews, the route journal adds a labeled segmented progress tracker plus clearer current/completed/locked cards, gameplay uses a single top differences tracker with elapsed-time display and a streak footer, and the rewarded hint modal now uses a blurred scene backdrop with a free-hint value chip and skip action.

- Replaced the zero-magnifier rewarded hint browser prompt with an in-game modal that explains the ad reward, uses a top-right close button, and shows ad-unavailable errors inside the modal.

- Polished mobile landscape gameplay controls: the hint FAB now has its label in the right rail, the found counter is vertically aligned, and the before/after slider handle can be dragged directly on the scene.

- Reworked phone landscape layouts against `docs/mobile-redesign`: gameplay now uses a single 16:10 before/after slider instead of the A/B flip card, with side rails for level status and hint/settings controls; campaign selection, campaign map and settings spacing now track the 896x414 mobile mockups more closely while settings keeps only the language option.

- Removed two extra upper-right hitboxes (`bird-glyph`, `incense-sticks`) from `emerald-meridian` level 8, reducing the level to 9 required differences.

- Removed two extra upper-right hitboxes (`top-foliage`, `stone-step`) from `emerald-meridian` level 5, reducing the level to 5 required differences.

- Removed three extra upper-right hitboxes (`carabiner`, `ladder-foot`, `right-edge`) from `emerald-meridian` level 4, reducing the level to 7 required differences.

- Removed the extra upper-right `hanging-leaves` hitbox from `emerald-meridian` level 3, reducing the level to 8 required differences.

- Pruned extra `sand-meridian` hitboxes from levels 11, 12 and 13, and made levels 12/13 editable through the local hitbox Apply endpoint by keeping their overrides inline.

- Made `pnpm release:zip` independent from system `zip` / `unzip` binaries by replacing the shell-out packaging step with a Node-based ZIP writer and in-script entry validation.

- Fixed replay completion ratings so improved attempts update the saved best stars, worse attempts no longer downgrade the best result, and campaign cards render the saved star count.

- Normalized mobile landscape gameplay HUD controls to 38px height with 12px text.

- Moved the home campaign-selection and campaign-map settings buttons into their topbars instead of rendering them as fixed overlay controls.

- Standardized the desktop header height, horizontal padding and settings button size/offset across home, campaign journal and gameplay screens.

- Moved the gameplay settings button into the HUD controls and removed the pause button from gameplay.

- Removed the Exact Reveal / "Проявитель" gameplay mechanic; the gameplay gear button now opens settings on mobile instead of spending magnifiers.

- Reworked level success/failure result modals for phone landscape so the summary, progress and actions fit within the compact gameplay viewport.

- Changed campaign carousel paging to crossfade cards instead of hiding and replacing them instantly.

- Added the mobile landscape home campaign carousel, kept the desktop campaign row independent from carousel state, and blocked phone portrait with a rotate-device gate.

- Centered and widened the mobile landscape home campaign card, and moved carousel arrows farther away from the card edges.

- Fixed the app bootstrap locale sync so the shell no longer repeatedly calls `i18n.changeLanguage()` after the active locale is already applied.

- Guarded comparator frame-size and pan synchronization against repeated no-op state updates.

- Reduced the gameplay timer font to 16px on mobile while keeping the larger HUD timer on wider screens.

- Restored the mobile landscape A/B flip button label while keeping the control in the right-edge safe-area slot.

- Tightened mobile gameplay and level-card typography, and moved the mobile landscape A/B flip control into a side control slot so it no longer covers the scene image.

- Pinned the mobile home campaign CTA to the bottom of each active campaign card.

- Fixed gameplay comparator sizing so 16:10 scene images keep their real aspect ratio on desktop, mobile portrait and mobile landscape instead of stretching into square-ish play slots.

- Renamed the Russian mobile A/B compare button to "Перевернуть".
- Fixed gameplay image panning so zoomed scenes keep the same drag overscroll allowance on the bottom edge as on the top, left and right edges.
- Fixed the campaign mission journal so level lists scroll inside the game viewport with a custom brass scrollbar instead of relying on blocked page scrolling.
- Matched mission level-card hover motion to campaign cards on the campaign journal.
- Delayed `LoadingAPI.ready()` behind a single bootstrap gate: save hydration, SDK/manual locale resolution, i18n/title/lang updates, first-screen preview image preload, font readiness and two rendered frames now complete before the interactive home screen replaces the loader; added regression coverage for the SDK `en` startup path.
- Added Vite legacy build support for `Safari >= 9`, `iOS >= 9` and `Android >= 5` via `@vitejs/plugin-legacy`, including legacy bundles, `nomodule` scripts and polyfills in production output.
- Fixed Yandex prepublication blockers: `pnpm release:zip` now creates `dist-yandex.zip` from the contents of `dist/` and validates root `index.html` plus forbidden macOS/system/source-map entries.
- Regenerated `northern-route` level 13 scene A from the owner-provided PNG as a compressed WebP, removed the source PNG from runtime assets, and kept A/B validation passing for the 9-difference finale.
- Removed the unfinished campaign paywall from production UI. Locked campaigns now only explain gameplay unlock requirements; purchase CTA, modal, restore button and stub price are gone.
- Added first-run locale detection from `ysdk.environment.i18n.lang`, persisted manual locale source, `<html lang>` updates and localized `document.title`.
- Migrated saves to version 2 with `elapsedActiveSeconds` for in-progress levels, safe v1 migration and active-time-only gameplay timer persistence.
- Made zero-magnifier hint CTA explicit for rewarded ads and added a confirmation prompt before showing rewarded video.
- Split hitbox editor controls into a dev-only lazy chunk, removed production internal REF labels, and replaced `structuredClone` with a JSON-compatible clone helper.
- Added adaptive modal max-height scrolling and tightened the gameplay HUD safe-area layout for small mobile viewports.
- Extended content validation with A/B hash comparison, WebP dimension checks and normalized hotspot bounds checks.

- Added Yandex Games launch lifecycle handling for moderation readiness: production now loads `/sdk.js`, sends `LoadingAPI.ready()` once after hydration, subscribes to `game_api_pause` / `game_api_resume`, and centralizes `GameplayAPI.start()` / `stop()` around active gameplay.

- Removed the Google Fonts runtime hotlink from `index.html`, switched Tailwind font stacks to system/local fallbacks, and strengthened production browser behavior by suppressing page scroll, image drag, text selection and gameplay context menus.

- Extended the production build cleanup to exclude unused scene placeholder SVGs alongside local `3.webp` markup references.

- Recompressed all WebP scene assets under `public/assets/scenes/` in place again, preserving dimensions and paths while reducing total WebP weight from 43.2 MB to 25.5 MB.

- Disabled production sourcemap emission by default to reduce the release build size; diagnostic builds can still opt in with `BUILD_SOURCEMAP=true pnpm build`.

- Updated the layout-debug hitbox editor so dragging or resizing either A/B marker synchronously updates both side hitboxes and the shared hint area.

- Added `pnpm dev:validate:cheat`, which starts the hitbox validation dev server and automatically applies the existing all-content dev unlock.

- Excluded scene markup reference files named `3.webp` from production Vite build output while keeping them in `public` for content validation and local hitbox review.

- Added a local hitbox authoring flow to layout-debug gameplay: `pnpm dev:validate` now lets reviewers drag visible difference markers, resize them from a bottom-right corner handle, applies edits immediately, persists them per level in localStorage, and exports the edited `differences` JSON for committing into `src/content/*`.

- Added an "Apply" action to the layout-debug hitbox editor. In `pnpm dev:validate`, the browser now posts edited hitboxes to a dev-only Vite endpoint that writes them back into the matching `src/content/*` campaign module.

- Added one-axis resize handles to the layout-debug hitbox editor: right and bottom handles resize width/height independently, while the corner handle still resizes both axes.

- Added zero-balance area hints through Yandex rewarded ads: the hint button switches to an ad icon when magnifiers reach `0`, calls `ysdk.adv.showRewardedVideo()`, applies the hint only after a rewarded completion, and remains available for another ad-backed hint while more unrevealed differences exist.

- Fixed area hints so their pulse no longer shifts away from authored `hintArea` bounds, made the hint ring more visible, and prevented repeated magnifier spending while an existing unfound hint is already active.

- Corrected the `northern-route` level 4 switch hitbox from an aspect-scaled circle to an ellipse so the clickable zone matches the lower markup ring instead of covering extra vertical space.

- Switched gameplay scene rendering from stretched `object-fit: fill` to `object-fit: contain` and anchored hit testing, found markers, hints and wrong-click feedback to the measured contained image plane so normalized hitboxes stay aligned with the visible image.

- Recompressed all runtime WebP scene assets under `public/assets/scenes/` in place, preserving dimensions and paths while reducing total runtime image weight from about 101.6 MB to 43.2 MB; also whitespace-minified the project SVG images.

- Made campaign level journal cards wider in the `map-level-grid`, including compact mobile landscape, so the cards read closer to square instead of tall rectangles.

- Reworked mobile landscape layouts against `docs/landscape_review`: campaign selection, level journal, settings, paywall, and gameplay now use compact 896x414-oriented compositions; gameplay mobile landscape uses the variant-2 A/B flip-card instead of side-by-side photos.

- Renamed the game to its official title everywhere it is shown to players: RU "Найди отличия: Тайны экспедиций", EN "Spot the Differences: Expedition Mysteries". Updated `src/i18n/{ru,en}/common.json` (`app.title` and the header brand tag `campaigns.supra` → "ТАЙНЫ ЭКСПЕДИЦИЙ" / "EXPEDITION MYSTERIES"), the `index.html` `<title>`, the e2e heading assertion in `tests/e2e/app.spec.ts`, and the store listing `title` fields in `docs/starter-data/catalog-copy.example.json` and `docs/starter-data/i18n/{ru,en}/common.json`.
- Added the missing `ladder-foot` hitbox to `emerald-meridian` level 4 (`em-04-flooded-bridge`) in `src/content/emeraldMeridianLevels.ts`: a 10th annotation ring at the foot of the bridge ladder was drawn in `4/3.webp` but had no hit area. Transcribed it (`circle` at `cx 0.707, cy 0.712, r 0.046`, least-squares fit to the ring, verified via red overlay render), bringing level 4 to 10 rings so `requiredDifferences` now equals 10.
- Added `pnpm validate:final`, a final A/B hitbox review server that draws the editable hitbox overlay over real `1.*` and `2.*` gameplay images while keeping the same drag, resize, copy and apply controls as `pnpm dev:validate`.
- Fixed all 13 `emerald-meridian` chapter hitboxes in `src/content/emeraldMeridianLevels.ts` to match the rings drawn on each level's `3.webp` annotation image — both the count and the position/size/shape of every hit area were transcribed and visually verified against red overlay renders. Made the chapter find-ALL: removed the `differenceCounts` table and the "find any subset" comment, and set `requiredDifferences` to `perLevelDiffs[order - 1].length` so the required count always equals the number of drawn rings (per-level ring counts: 10, 9, 9, 9, 7, 9, 9, 11, 9, 10, 9, 9, 9). Fixes the prior `pnpm validate:content` failure where `requiredDifferences` did not match the number of differences.

- Moved the settings entry point into the app shell so the gear button is always clickable in the top-right corner on every screen and opens the shared settings modal.

- Fixed the gameplay result modal's "Level Select" / "К выбору уровней" action so it returns to the current campaign level journal after completion.
- Removed the collection button from the campaign map header and fixed the home settings control so the gear button opens the settings modal reliably.

- Redesigned settings as a `SettingsModal` overlay (bottom sheet on mobile, centered modal on desktop) matching the Expedition design system; removed "Reset save" and "Copy diagnostics" dev buttons from production UI; removed `{ kind: "settings" }` from the `Screen` union and `App.tsx` routing — settings is now opened via local `useState` in `HomeScreen`.
- Moved the remaining visible daily and settings strings into `src/i18n/{ru,en}/common.json`, and switched `DailyScreen` / `SettingsScreen` to the new translation keys.
- Added Yandex fullscreen interstitial handling on the campaign map after every third newly completed campaign level, with no-ads entitlement suppression and focused MapScreen coverage.
- Added Yandex Player Data cloud saves with `ysdk.getStorage()` / `localStorage` mirroring, newest-`updatedAt` cloud/local hydration, 4-second cloud load timeout and focused storage tests.
- Corrected `northern-route` level 12 hitboxes for the radio room scene, including the sled, steam plume, pressed flower case and lower drawer markup rings.
- Corrected `northern-route` level 7 hitboxes so the gameplay markers align with the white `3.webp` markup rings.
- Reduced the gameplay completion modal delay from 1 second to 0.7 seconds after the final difference is found.
- Added `npm run dev:validate` / `pnpm dev:validate`, which starts Vite dev/HMR with scene images swapped to `3.*` markup references and all gameplay hitboxes visible for visual alignment review.
- Added ellipse hitbox support and corrected stretched first-campaign markup rings for `northern-route` levels 2 and 9 so clickable areas match the visible authoring circles more closely.
- Delayed the gameplay completion modal by 1 second after the final difference so the last found marker appears before the win result opens.
- Converted all runtime PNG scene, preview and map background assets under `public/assets/scenes/` to compressed WebP, updated content wiring to `.webp`, and removed the old PNG runtime copies.
- Added missing `seagull-13` difference to `northern-route` level 13 (`src/content/levels.ts`): seagull is present in `1.png` but absent in `2.png`, its circle is marked in `3.png`, and `requiredDifferences` updated from 8 to 9.
- Added agent workflow routing docs (`docs/AGENT_INDEX.md`, `docs/FLOWS/content-intake.md`, `docs/FLOWS/ui-change.md`) plus `pnpm agent:check` and `pnpm agent:release-check`.
- Centralized campaign runtime metadata in `src/content/campaignManifest.ts` and documented the legacy `sand-meredian` asset folder mapping.
- Made gameplay layout-debug mode opt-in via `VITE_LAYOUT_DEBUG=true` instead of always-on, and expanded content validation to cover locales, provenance, markup references, known asset folders and debug-flag usage.
- Excluded generated design-reference HTML/support files from ESLint so agent checks focus on maintained project code.
- Smoothed app-level screen transitions to fade without vertical movement, removing the visible layout jump when moving between levels.
- Fixed campaign map exit transitions so returning from `sand-meridian` or `emerald-meridian` no longer flashes the first `northern-route` / White Meridian campaign before the home menu appears.
- Fixed `sand-meridian` level 13 to use its own `public/assets/scenes/sand-meredian/13/1.png` and `2.png` runtime scene pair with hitboxes transcribed from `13/3.png`, removing the old folder 12 fallback.
- Added the missing lower-left tool-cloth hitbox for `sand-meridian` level 3 so all 9 circles from `public/assets/scenes/sand-meredian/3/3.png` are playable.
- Added the missing marked hitboxes for `sand-meridian` levels 7, 11 and 12; level 13 also inherits the corrected level 12 fallback hitboxes.
- Wired the expedition home/paywall campaign cards to the new `public/assets/scenes/<chapter>/preview.png` images, keeping gradient backgrounds as fallbacks and documenting the preview assets.
- Fixed gameplay difference overlays so found markers and hint rings scale from authored `hitArea` / `hintArea` geometry instead of fixed pixel circles; scene images no longer crop away from normalized hitbox coordinates, circle hit testing now respects image aspect ratio, and the confirmation checkmark stays centered inside the authored hitbox even while layout-debug markers are visible.
- Rechecked and corrected first-campaign (`northern-route`) hitboxes against the visible `3.*` markup circles for scenes with confirmed drift.
- Switched `northern-route` campaign journal/map card previews to the existing `1.webp` runtime assets instead of the shared `1.png` helper default, while leaving the PNG-based later campaigns unchanged.
- Restored corrupted Russian level titles for the final `northern-route` level and every `sand-meridian` / `emerald-meridian` level card, plus fixed broken RU count labels in the locale dictionary.
- Enabled a temporary `GameScreen` layout-debug mode that renders all difference markers immediately and swaps comparator scene assets from `1/2` to the local `3.*` markup reference, making it easier to adjust button and marker positions visually.
- Removed the light mobile tap-flash on buttons, cards and map interactions by disabling the browser tap highlight for interactive elements and pinning the app shell background during screen transitions.
- Re-transcribed `northern-route` hitboxes for levels 5-12 from the provided `3.webp` markup references, replacing the shared scaffold coordinates with per-scene click zones.
- Replaced the campaign node map screen with a level-journal layout based on `docs/menu-design/new_campaign_menu.html`, including responsive desktop/mobile card grids and direct level launch from cards.
- Matched the campaign journal shell to `HomeScreen` spacing and width rules, and switched its page background to the same expedition backdrop used on the main screen.
- Added `src/content/sceneAssets.ts` to centralize campaign card preview image paths, so the per-card scene filename can be changed in one place later.
- Fixed campaign 1 map node alignment by switching chapter map containers from a hardcoded `16:10` frame to the real background image aspect ratios, so level points sit back on the painted circles.
- Removed the yellow dashed route line between campaign map nodes so the map shows standalone points only.
- Re-transcribed `sand-meridian` hitboxes across the full current art package in `public/assets/scenes/sand-meredian/`, using each scene's `3.png` markup reference for levels 1-12 and reusing level 12 coordinates for the level 13 fallback.
- Connected the third campaign, `emerald-meridian`, into the playable chapter catalog with 13 routed map nodes, scaffold level definitions, localized titles, and sequential unlock after `sand-meridian`.
- Updated the expedition home screen so the third campaign now shows real progress, unlock messaging, and map navigation instead of a permanently locked stub.
- Added a campaign-map review pre-prompt modal based on `docs/rate-modal-design`, shown after the third completed campaign level and rescheduled once after a soft dismissal.
- Extended the platform seam with Yandex review gateway support (`canReview` / `requestReview`), safe local fallbacks, and Vite dev helpers for review-flow testing.
- Persisted `reviewPrompt` state in the save schema, wired review analytics event hooks, and covered the flow with unit, component, and integration tests.

- Redesigned GameScreen to the dark "Expedition" visual theme matching the `Игровой экран.dc.html` artboard: full-screen dark layout, top HUD with timer/found counter/hint button, image panel with A/B labels and divider, bottom tracker with found squares and accuracy bar.
- Added 5-minute countdown timer with visual warning (red text) when ≤ 30 seconds remain. Pause button stops the timer.
- Added `LevelCompleteOverlay` — modal with green seal, stats (time/found/stars), chapter progress bar, and next-level/retry/map buttons.
- Added `LevelFailedOverlay` — modal with red clock seal, stats, differences tracker, retry and +30-sec (spends 2 magnifiers) buttons.
- Redesigned `PhotoComparator`: dark image panels, gold-ring-with-checkmark found markers (with entrance animation), pulsing dashed hint marker, brief red-X wrong-click animation.
- Added `resetLevelProgress(levelId)` to the game store for clean retry flow.
- Added `font-jetbrains` (JetBrains Mono) Tailwind utility; updated Google Fonts link to include JetBrains Mono and italic Cormorant Garamond weights.
- Added `game.levelBadge`, `game.labelOriginal/Copy`, `game.completedBadge/Title/Desc`, `game.timeoutBadge/Title/Desc`, and related stat/action keys to both `ru` and `en` locales.

- Limited the desktop HomeScreen content width so expedition cards and footer stop overexpanding on very wide displays.
- Added a Vite dev-only console cheat via `window.__artifactDev.unlockAllContent()` to mark all implemented levels complete, unlock campaign access locally, and persist the result in the save.
- Added a matching `window.__artifactDev.resetSave()` helper for quickly returning to a clean local save during development.
- Added a chapter catalog in `src/content/chapters.ts` so map backgrounds, node placement and level lists are configured per campaign instead of hardcoded in `MapScreen`.
- Connected the `sand-meridian` campaign from `docs/plot/sand_meridian/map-handoff/sand-meridian-map-layout.json`, including a routed map, 13 playable scene entries and localized level titles.
- Updated validation to cover all playable chapters and verify that each chapter has 13 levels and a matching set of map nodes.
- Added dark "Expedition" palette (`exp-*` tokens) to Tailwind config alongside the existing light palette; tokens follow `docs/menu-design` design spec.
- Added Cormorant Garamond and Manrope Google Fonts (`font-cormorant`, `font-manrope` Tailwind utilities).
- Rewrote HomeScreen as a three-campaign expedition selector (desktop card row + mobile stacked layout) per `docs/menu-design` artboards 1 and 4.
- App.tsx now renders HomeScreen full-bleed (no padding / max-width constraint); other screens are unchanged.
- Added `campaigns.*` i18n keys to both `ru` and `en` locales.
- Implemented Paywall modal (artboards 2 and 5): desktop 600px centered modal + mobile bottom sheet (690px, border-radius 26px 26px 0 0). Triggered by "Открыть все кампании" in top-bar and locked campaign cards. Closes on X button, backdrop click, or Escape key. Price is a stub (`—`); wire to Yandex billing catalog when available.
- Added `campaigns.paywall.*` i18n keys to both `ru` and `en` locales (supra, heading, subheading, cta, skip, restore, 5 benefit strings). Desktop shows all 5 benefits; mobile shows 3.

## 0.1.0

- Initial local vertical-slice scaffold.
- Added root `AGENTS.MD` and `CLAUDE.md` handoff guides to reduce token usage and document required update workflow.
- Updated Chapter 1 map point titles from the Meridian plot prompts and restored readable RU locale text.
- Made locked campaign map nodes fully opaque for clearer unavailable level markers.
- Fixed a campaign map crash caused by the 13th level missing a node position, and added a regression test for map node coverage.
- Documented the three-image WebP intake workflow for authoring new levels and hitboxes.
- Authored the first campaign level from the provided scene images, including WebP runtime assets, hitboxes and provenance records.
- Connected campaign scenes 2, 3 and 4 from the provided image folders, exported their runtime WebP assets and authored hitboxes for all marked differences.
- Exported runtime WebP assets for campaign scenes 5-12 and wired those levels to their real scene pairs instead of placeholder images.
- Added campaign scene 13 with runtime WebP assets, localized title, map/UI support and authored hitboxes from the provided markup image.
# 2026-07-21 — CrazyGames platform profile

- Added isolated `local`, `yandex`, and `crazygames` platform adapters with CrazyGames SDK v3 lifecycle, Data Module persistence and ad mappings.
- Added CrazyGames build/release commands and ZIP size/file validation while retaining the Yandex package flow.
