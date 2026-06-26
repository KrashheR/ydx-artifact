# Codex Handoff — Найди отличия: Архив аномалий
Version: 1.0 · 2026-06-25

---

## 1. Design file index

| File | Purpose |
|---|---|
| `tokens.json` | Canonical design tokens (colors, type, spacing, radius, shadow, motion, z-index) |
| `Game Hub.dc.html` | Primary full-screen view: expedition map, sidebar, daily, collection |
| `Gameplay.dc.html` | Primary full-screen view: desktop side-by-side + mobile portrait A/B + landscape |
| `Modals.dc.html` | Overlay states: intro, pre-level, result (1/3 seals), artifact reveal, chapter end, rewarded ad |
| `Panels.dc.html` | Slide-in panels: collection, shop, daily, settings, save states, errors, rating prompt |
| `Prototype.dc.html` | Clickable flow prototype wiring all screens |

---

## 2. Architecture: two views + overlays

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

**Rule:** Never navigate to a separate page for map, shop, collection, settings, or results. These are always modals/panels over the two primary views.

---

## 3. Design tokens (summary)

See `tokens.json` for full values.

### Colors
| Token | Value | Usage |
|---|---|---|
| `paper` | `#E7DDC8` | Primary surface, backgrounds |
| `ivory` | `#F4EEDD` | Elevated surfaces, modals, cards |
| `graphite` | `#2F3231` | Primary text, icons |
| `teal` | `#496B68` | Primary CTA, active states, found markers |
| `tealDark` | `#344E4C` | Hover/pressed |
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
- Touch target minimum: **44×44px**
- Archive codes may be 12px when decorative only

### Motion
| Key | Value |
|---|---|
| Fast | 120ms cubic-bezier(0.4,0,0.2,1) |
| Base | 200ms cubic-bezier(0.4,0,0.2,1) |
| Slow | 350ms cubic-bezier(0,0,0.2,1) |
| Reveal | 500ms cubic-bezier(0.34,1.56,0.64,1) |
| Reduced motion | duration 0ms, no transforms |

---

## 4. Screen table

| # | Screen | Type | Trigger |
|---|---|---|---|
| 01 | Splash / SDK init | Full-screen | App open |
| 02 | Game Hub — new player | Full-screen | First launch |
| 03 | Game Hub — returning | Full-screen | Return visit |
| 04 | Story intro | Modal overlay | First launch after splash |
| 05 | Pre-level card | Modal overlay | Tap node on map |
| 06 | Tutorial gameplay desktop | Full-screen | Level 1 start |
| 07 | Standard gameplay desktop | Full-screen | Level 2+ start |
| 08 | Gameplay mobile portrait A/B | Full-screen | Same, mobile |
| 09 | Gameplay mobile landscape | Full-screen | Rotation |
| 10 | Correct find feedback | Toast | Successful tap |
| 11 | Wrong tap feedback | Inline marker | Misclick |
| 12 | 3 rapid errors → brief block | Inline state | 3rd rapid misclick |
| 13 | Hint: Ориентир active | Gameplay overlay | Area hint used |
| 14 | Hint selection panel | Bottom sheet | Hint button tap |
| 15 | Rewarded loading | Modal | Проявитель via ad |
| 16 | Rewarded unavailable | Modal | Ad SDK failure |
| 17 | Rewarded success | Modal | onRewarded |
| 18 | Pause | Modal | Pause button |
| 19 | Level result — 1 seal | Modal | Level complete |
| 20 | Level result — 3 seals | Modal | Perfect completion |
| 21 | Artifact reveal | Modal | After levels 3/6/9/12 |
| 22 | Chapter complete | Modal | Level 12 complete |
| 23 | Next chapter teaser | Modal | After chapter complete |
| 24 | Collection panel | Slide-in | Collection button |
| 25 | Found artifact detail | Within collection | Tap artifact card |
| 26 | Locked artifact | Within collection | Tap locked slot |
| 27 | Shop modal | Modal | Shop button |
| 28 | Purchase success | Modal | After buy |
| 29 | Purchase unavailable | Modal | Catalog failure |
| 30 | Daily pre-level | Modal | Daily card tap |
| 31 | Daily gameplay | Full-screen | Start daily |
| 32 | Daily result | Modal | Daily complete |
| 33 | Streak reward | Modal | After daily |
| 34 | Daily already-claimed | Within daily modal | Return visit same day |
| 35 | Settings panel | Slide-in | Settings button |
| 36 | Save: cloud synced | Toast | After save success |
| 37 | Save: saving | Toast | During cloud write |
| 38 | Save: local only | Toast | Cloud unavailable |
| 39 | Save: conflict dialog | Modal | Deterministic merge fails |
| 40 | Cloud unavailable | Toast | SDK timeout |
| 41 | Scene load error | Modal | Asset fetch failure |
| 42 | SDK failure fallback | Inline | No infinite spinner |
| 43 | Maintenance message | Modal | Remote Config flag |
| 44 | Level unavailable | Toast + map redirect | Remote Config disabled level |

---

## 5. Responsive rules

### Breakpoints
| Name | Width | Layout |
|---|---|---|
| mobile-sm | 360px | Mobile portrait A/B toggle |
| mobile | 390px | Mobile portrait A/B toggle |
| tablet | 768px | Portrait → A/B toggle; Landscape → side-by-side |
| desktop-sm | 1280px | Side-by-side, compact sidebar |
| desktop | 1440px | Side-by-side, full sidebar |

### Game Hub
- **≥1280px:** Sidebar (260px fixed) + map area. 12-node route visible in full.
- **768–1279px:** Sidebar collapses to top strip or drawer. Map scrolls vertically.
- **<768px:** Full-screen vertical scroll. Continue CTA pinned to top. Map as vertical list.

### Gameplay
- **≥768px landscape / ≥1280px:** Two photos side-by-side, sync zoom/pan, click on either.
- **<768px portrait / tablet portrait:** Single photo full-screen. Compare button at bottom thumb zone. Tap = toggle A/B. Hold = peek other version. Release = return.
- **<768px landscape (844×390, 640×360):** Side-by-side touch. Compact right-edge HUD strip (60px). Safe-area insets respected.

### Minimum sizes
- Body text mobile: 16px
- HUD labels: 12px minimum
- Touch targets: 44×44px
- Comparator viewport: never below 280px wide per side on desktop

---

## 6. Component API

### ArchiveButton / PrimaryAction
```
Props: label, onClick, disabled, loading, variant ('primary'|'secondary'|'ghost')
States: default, hover, pressed, focus, disabled, loading
Sizes: sm (36h), md (44h), lg (52h)
Colors: primary → teal bg / white text; secondary → ivory bg / graphite text; ghost → transparent / teal text
```

### PhotoComparator
```
Props: sceneA (URL), sceneB (URL), differences (DifferenceZone[]), foundIds (string[]),
       mode ('desktop'|'mobile-portrait'|'mobile-landscape'), onTap (normalized xy → void)
States: loading, ready, zoomed, panning, hint-active
Internal: shared CameraState { x, y, scale }, normalized coords 0..1
Hit test: pointer → normalized → check circle/polygon zones → emit found/misclick
Misclick: 3 rapid within 700ms → temporaryInputLockMs(700), reducesAccuracy
```

### DifferenceCounter
```
Props: found (number), total (number)
Display: "Найдите {remaining} расхождений" + dot row (teal=found, faint=remaining)
```

### HintButton
```
Props: type ('area'|'exact'), cost (1|2), magnifierBalance, onUse, rewardedAvailable
States: available, insufficient-balance, rewarded-offer, loading-ad, used
```

### ArchiveSeal
```
Props: type ('completed'|'accurate-eye'|'no-intervention'), earned (boolean)
Animation: stampIn 500ms easingSpring when earned=true first renders
```

### MapNode
```
Props: order (1-12), status ('completed'|'active'|'locked'), seals (0-3),
       isArtifactMilestone (boolean), title, onTap
```

### ArtifactCard
```
Props: id, title, archiveNumber, discoveredAt, description, status ('found'|'locked'),
       lockedUntilLevel (number|null)
```

### DailyCard
```
Props: sceneTitle, date, streakDays, claimed (boolean), onPlay, onClose
```

### RewardModal (Rewarded Ad)
```
Props: placement ('exact_hint'|'post_level_bonus'|'daily_bonus'), reward (string),
       state ('loading'|'unavailable'|'success'), onWatch, onFallback, onClose
Rule: onClose without onRewarded → no reward granted; onError → return to level
```

### PurchaseCard
```
Props: productId, title, description, price (string|null), currency (string|null),
       contents (string[]), state ('available'|'loading'|'success'|'unavailable'|'catalog-error')
Rule: never hardcode price; always from Yandex catalog; show fallback if catalog unavailable
```

### SaveStatus
```
States: synced (green dot), saving (spinner), local-only (amber dot), 
        cloud-unavailable (amber warning), resync-restored (green banner)
Display: always non-blocking; never prevents gameplay continuation
```

### Toast
```
Props: message, type ('success'|'info'|'warning')
Animation: slideUp 200ms → hold 2s → slideDown 200ms
Rule: never stack more than 2; dismiss on tap
```

---

## 7. Motion specification

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Difference marker appear | scale 0→1 + ring pulse | 200ms + 400ms | easingSpring |
| Sync mark on both images | simultaneous ring | 200ms | easingOut |
| A/B toggle | crossfade opacity | 120ms | easingOut |
| Hint area | pulsing dashed outline | 2s loop, 3s max | linear |
| Archive seal stamp | scale 1.6→0.92→1 + rotate | 500ms | easingSpring |
| Artifact reveal | card lifts + ochre ring | 600ms | easingSpring |
| Map route draw | SVG stroke-dashoffset | 400ms per segment | easingOut |
| Rewarded loading spinner | rotate loop | 1.2s | linear |
| Save status toast | translateY 20→0 | 200ms | easingOut |
| Modal enter | opacity+translateY 16→0 | 200ms | easingOut |
| Modal exit | opacity+translateY 0→8 | 150ms | easingIn |
| Wrong tap | translateX shake | 300ms | ease |
| Correct toast | slideUp | 200ms | easingOut |

**Reduced motion:** all durations → 0ms, no transforms. Use opacity only.

---

## 8. i18n rules

- Production locales: **ru** (default + fallback), **en**
- Language selector in Settings: Русский / English
- Language change: instant without reload; written to local mirror + Yandex cloud
- Never hardcode visible strings in components
- Never assemble sentences from separate translated fragments
- Product title/description/price always from Yandex catalog API
- Archive codes, accession numbers, coordinates: not translated
- Date format: `Intl.DateTimeFormat(locale)`
- Plural forms: i18next plural rules
- English strings are typically 20-40% longer — all layouts must accommodate

### Key namespaces
`common` · `home` · `gameplay` · `map` · `collection` · `daily` · `monetization` · `settings` · `errors`

---

## 9. Save UX rules

- **Never** block gameplay on save error
- **Never** show SDK/JSON/localStorage/setData to player
- **Never** create an infinite save spinner
- Cloud save timeout = 4s → fall back to local mirror silently
- Show save status as small non-blocking toast only
- Conflict dialog: rare; show only when deterministic merge impossible
- All states: cloud synced → saving → local only → cloud unavailable → resync restored

---

## 10. Platform lifecycle UX

| Platform event | UI response |
|---|---|
| `game_api_pause` (startup ad) | Mute audio, block input, show subtle loading state |
| `game_api_resume` | Restore audio (respecting browser gesture policy), unblock input |
| Tab hidden / visibility hidden | Local save best-effort sync, pause gameplay timer |
| Account selection dialog | Stop cloud write queue, pause game, re-hydrate on close |
| LoadingAPI.ready | Call ONCE after first interactive frame — do NOT wait for all scenes |
| GameplayAPI.start | On level start, level resume, close pause, close ad |
| GameplayAPI.stop | On level complete, open pause, start ad, open purchase, tab hidden |

---

## 11. Monetization UX rules

### Rewarded ads
- Always show what reward will be given BEFORE requesting ad
- Loading state must have timeout — never infinite
- onError/onClose-without-reward → return player to level, no penalty
- Post-level bonus: show once per level, once per first completion only

### Interstitial
- Only on map screen after logical break
- All conditions must be true: ≥4 levels, ≥8 min session, ≥5 min since last, no active purchase/artifact/daily/finale
- Never during tutorial, gameplay, loading, or immediately after rewarded

### Purchases
- Title/description/price/currency from `payments.getCatalog()` only
- Show catalog-error fallback if unavailable
- Non-consumable: check on every boot via `getPurchases()`
- Consumable: save grant before consuming; idempotency ledger prevents double-grant

---

## 12. Accessibility

- All interactive elements: 44×44px minimum touch target
- Focus states required on all interactive elements (visible outline)
- States must differ by more than color alone (shape, icon, label)
- `prefers-reduced-motion`: all animations disabled, opacity-only fallback
- `aria-label` on all icon-only buttons
- `user-select: none` on game canvas; never block Tab or Escape
- Do not place any text inside scene PNG/WebP images

---

## 13. Files Codex should NOT touch

- `uploads/` — source documents only
- Scene art files — use placeholder until validated art is ready
- `tokens.json` — read-only reference; derive Tailwind config from this

---

## 14. Critical implementation order

1. App shell + mock platform + routing + theme
2. PhotoComparator (zoom, pan, hit test, misclick) — no scenes yet
3. Tutorial level end-to-end (1 validated scene pair)
4. Yandex cloud save adapter + conflict merge
5. Full progression: map, seals, artifacts
6. Daily + streak
7. Rewarded ads + interstitial policy
8. IAP: archive pack + magnifiers
9. All 13 campaign levels (validated)
10. QA: save, ads, purchases, rotation, offline, platform lifecycle
