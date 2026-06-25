# Handoff: Найди отличия — Архив аномалий
Version: 1.0 · 2026-06-25

---

## About the Design Files

The `.dc.html` files in this bundle are **HTML design references** — high-fidelity prototypes showing intended look, layout, and interactive behaviour. They are **not production code** to copy directly. The task is to **recreate these designs in the target codebase** using its established framework, component library, and platform conventions (Yandex Games SDK, etc.). Open each file in a browser to inspect it live.

`support.js` is the DC runtime — required to render `.dc.html` files locally. It is not part of the production build.

---

## Fidelity

**High-fidelity.** All colours, typography, spacing, border-radii, shadows, motion timings, and copy are final. Implement pixel-accurately using `tokens.json` as the single source of truth for design tokens.

---

## File Index

| File | What to open it for |
|---|---|
| `Prototype.dc.html` | **Start here.** Clickable flow wiring all screens together |
| `Game Hub.dc.html` | Expedition map, sidebar, daily card, collection entry |
| `Gameplay.dc.html` | Desktop side-by-side, mobile portrait A/B, landscape HUD |
| `Modals.dc.html` | All modal overlays: intro, pre-level, result, artifact reveal, chapter end, rewarded ad |
| `Panels.dc.html` | All slide-in panels: collection, shop, daily, settings, save states, error overlays |
| `tokens.json` | Canonical design tokens — colours, type, spacing, radius, shadow, motion, z-index |
| `CODEX_HANDOFF.md` | Full technical spec: component API, responsive rules, motion spec, i18n, save UX, monetization UX, accessibility, platform lifecycle, implementation order |

---

## Architecture

```
Game Hub (full-screen)
  └── overlays: Pre-level card → Gameplay (full-screen)
                                    └── overlays: Hint selection, Pause
                                Gameplay → Result modal → Game Hub
                Collection panel (slide-in)
                Shop modal
                Daily modal
                Settings panel
                Save status toasts
                Error/lifecycle overlays
```

**Rule:** Never navigate to a separate page for map, shop, collection, settings, or results. All are modals/panels over the two primary views.

---

## Screens / Views (44 states)

See **Section 4** of `CODEX_HANDOFF.md` for the full screen table. Summary:

| # | Screen | Type |
|---|---|---|
| 01 | Splash / SDK init | Full-screen |
| 02–03 | Game Hub (new / returning) | Full-screen |
| 04 | Story intro | Modal |
| 05 | Pre-level card | Modal |
| 06–09 | Gameplay (tutorial, standard, mobile portrait, landscape) | Full-screen |
| 10–12 | Feedback: correct find, wrong tap, 3-error block | Toast / Inline |
| 13–14 | Hints (area active, selection panel) | Overlay |
| 15–17 | Rewarded ad (loading, unavailable, success) | Modal |
| 18 | Pause | Modal |
| 19–23 | Results, artifact reveal, chapter complete, next chapter | Modal |
| 24–26 | Collection panel + artifact detail + locked | Slide-in |
| 27–29 | Shop + purchase success + unavailable | Modal |
| 30–34 | Daily (pre-level, gameplay, result, streak, already-claimed) | Mixed |
| 35 | Settings panel | Slide-in |
| 36–40 | Save status toasts + conflict dialog + cloud unavailable | Toast / Modal |
| 41–44 | Error states (scene load, SDK failure, maintenance, level unavailable) | Modal / Toast |

---

## Design Tokens (summary)

Full values in `tokens.json`.

### Colours
| Token | Value | Usage |
|---|---|---|
| `paper` | `#E7DDC8` | Primary surface, backgrounds |
| `ivory` | `#F4EEDD` | Elevated surfaces, modals, cards |
| `graphite` | `#2F3231` | Primary text, icons |
| `teal` | `#496B68` | Primary CTA, active states, found markers |
| `tealDark` | `#344E4C` | Hover / pressed |
| `ochre` | `#B68A45` | Artifacts, collection, brass details |
| `rust` | `#9A4E3F` | Warnings, errors, misclick feedback |
| `coldBlue` | `#5F7684` | Daily, scene-frame accents |
| `muted` | `#7A7268` | Secondary text, disabled |
| `faint` | `#C8BFAD` | Dividers, borders |
| `success` | `#3B6E52` | Correct find, success states |
| `ink` | `#1A1F1E` | Gameplay background |

### Typography
| Family | Usage |
|---|---|
| `Playfair Display` | Titles and chapter headings ONLY |
| `IBM Plex Mono` | Archive codes, dates, coordinates, level numbers |
| `Inter` | All functional UI: buttons, HUD, nav, descriptions |

- Mobile body minimum: **16px**
- HUD labels minimum: **12px**
- Touch targets minimum: **44 × 44 px**

### Motion
| Key | Value |
|---|---|
| Fast | 120 ms cubic-bezier(0.4, 0, 0.2, 1) |
| Base | 200 ms cubic-bezier(0.4, 0, 0.2, 1) |
| Slow | 350 ms cubic-bezier(0, 0, 0.2, 1) |
| Reveal | 500 ms cubic-bezier(0.34, 1.56, 0.64, 1) |
| Reduced motion | 0 ms, opacity only, no transforms |

---

## Key Components

See **Section 6** of `CODEX_HANDOFF.md` for full component API. Components to implement:

- **ArchiveButton / PrimaryAction** — variants: primary, secondary, ghost; sizes: sm/md/lg
- **PhotoComparator** — zoom/pan sync, normalised hit-test, misclick lock, hint overlay
- **DifferenceCounter** — found / total dot row
- **HintButton** — area vs exact, rewarded ad fallback
- **ArchiveSeal** — stamp-in animation on earn
- **MapNode** — 12-node route, status states, artifact milestones
- **ArtifactCard** — found / locked states
- **DailyCard** — streak, claimed state
- **RewardModal** — loading / unavailable / success, reward-before-ad rule
- **PurchaseCard** — never hardcode price; always from Yandex catalog
- **SaveStatus** — 5 non-blocking states
- **Toast** — slideUp/hold/slideDown, max 2 stacked

---

## Responsive Breakpoints

| Name | Width | Layout |
|---|---|---|
| mobile-sm | 360 px | Mobile portrait A/B |
| mobile | 390 px | Mobile portrait A/B |
| tablet | 768 px | Portrait → A/B; Landscape → side-by-side |
| desktop-sm | 1280 px | Side-by-side, compact sidebar |
| desktop | 1440 px | Side-by-side, full sidebar |

---

## Critical Implementation Order

1. App shell + mock platform + routing + theme
2. PhotoComparator (zoom, pan, hit test, misclick) — no scenes yet
3. Tutorial level end-to-end (1 validated scene pair)
4. Yandex cloud save adapter + conflict merge
5. Full progression: map, seals, artifacts
6. Daily + streak
7. Rewarded ads + interstitial policy
8. IAP: archive pack + magnifiers
9. All 12 campaign levels (validated)
10. QA: save, ads, purchases, rotation, offline, platform lifecycle

---

## Do Not Touch

- Scene art files — use placeholder until validated art is ready
- `tokens.json` — read-only reference; derive Tailwind / CSS vars config from this
- `uploads/` — source documents only

---

## Accessibility Requirements

- All interactive elements: 44 × 44 px minimum touch target
- Visible focus states on all interactive elements
- States differ by more than colour alone (shape + icon + label)
- `prefers-reduced-motion`: all durations → 0 ms, opacity-only fallbacks
- `aria-label` on all icon-only buttons
- `user-select: none` on game canvas; never block Tab or Escape
- No text inside scene PNG/WebP images

---

## i18n

- Production locales: **ru** (default + fallback), **en**
- Never hardcode visible strings in components
- English strings ~20–40% longer — all layouts must accommodate
- Prices/titles always from Yandex catalog API
- Dates via `Intl.DateTimeFormat(locale)`

---

*Full technical spec, monetisation UX rules, save UX rules, and platform lifecycle handling: see `CODEX_HANDOFF.md`.*
