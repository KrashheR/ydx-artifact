# Technical stack, architecture and art production pipeline

Этот документ задаёт способ реализации и производства контента. Он обязателен для дизайнера, Codex и любой нейросети, которая создаёт ассеты.

---

# 1. Технологический стек

## Core

| Задача | Технология | Причина |
|---|---|---|
| Application shell | React | UI, экраны, модалки, локализация |
| Language | TypeScript strict | Контроль data-driven контента и SDK |
| Build | Vite | Быстрый browser-first pipeline |
| Styling | Tailwind CSS | Точное повторение дизайн-системы |
| State | Zustand | Простые независимые stores |
| Runtime validation | Zod | Проверка уровней, saves и platform payloads |
| UI motion | Framer Motion | Короткие переходы и reveal-анимации |
| I18n | i18next + react-i18next | RU/EN сейчас, расширяемая locale-архитектура |
| Photo gameplay | PixiJS либо изолированный Canvas2D | Zoom, pan, marker, hit testing |
| Unit tests | Vitest | Геометрия, save, progression |
| E2E | Playwright | Desktop/mobile flow |
| Package manager | pnpm | Воспроизводимая установка |

## Не использовать

- Unity WebGL;
- тяжёлый игровой движок;
- Three.js;
- серверный backend;
- Firebase;
- remote CMS;
- Redux Toolkit без необходимости;
- сотни overlay div поверх изображений;
- direct access к Yandex SDK из компонентов.

## Почему не нужен тяжёлый движок

Игра состоит из экранов, двух синхронизированных 2D-изображений, hit areas, маркеров, pan/zoom и лёгкой меты. React решает интерфейс, а один изолированный renderer — игровое поле. Полноценный engine увеличит bundle и сложность без продуктовой пользы.

---

# 2. Архитектура

## Слои

### App

- routing;
- initialization;
- SDK readiness;
- error boundary;
- localization bootstrap;
- theme;
- analytics session.

### Screens

Собирают feature-компоненты, но не содержат игровую логику.

### Features

- gameplay;
- hints;
- map;
- collection;
- daily;
- monetization;
- saves;
- settings.

### Entities

- Level;
- Difference;
- Chapter;
- Artifact;
- Player;
- LevelResult;
- DailyRecord.

### Services

- platform;
- storage;
- ads;
- purchases;
- analytics;
- asset loading.

### Content

Статические JSON-файлы, локальные assets и Zod schemas.

## State separation

Рекомендуемые stores:

- `useAppStore`;
- `usePlayerStore`;
- `useGameplayStore`;
- `useDailyStore`;
- `useSettingsStore`;
- `usePlatformStore`.

Не складывать весь проект в один store.

## Gameplay state machine

```text
loading
  -> intro
  -> playing
  -> hint-selection
  -> paused
  -> completed
  -> reward
  -> exit

any
  -> error
```

Переходы должны быть явными и тестируемыми.

---

# 3. PhotoComparator

## Coordinate system

Все координаты хранятся в диапазоне 0..1 относительно оригинального изображения.

Преобразования:

1. normalized scene coordinate;
2. source pixel coordinate;
3. camera-transformed coordinate;
4. viewport coordinate.

Hit testing переводит pointer обратно в normalized scene coordinate.

## Circle

Подходит для небольших предметов, круглых объектов и простых изменений.

## Polygon

Подходит для сложного силуэта, перемещённого объекта, отражения или области неправильной формы.

## Отдельные A/B hit areas

Если объект перемещён, координаты отличаются. Нельзя предполагать одинаковую область A и B.

## Pan versus click

Pointer считается поиском отличия только если:

- перемещение меньше threshold;
- жест не был drag;
- pointer не участвовал в pinch zoom;
- viewport не находится в inertia.

## Camera

- minZoom показывает всю сцену;
- maxZoom сохраняет читаемость;
- pan ограничен bounds;
- A/B используют одну camera state;
- camera state сохраняется в in-progress save.

---

# 4. Platform integration

## Adapter pattern

```ts
interface PlatformService {
  init(): Promise<void>;
  getEnvironment(): Promise<PlatformEnvironment>;
  getPlayer(): Promise<PlayerIdentity | null>;
}

interface AdsService {
  showRewarded(placement: string): Promise<RewardedResult>;
  showInterstitial(placement: string): Promise<InterstitialResult>;
}

interface PurchaseService {
  getCatalog(): Promise<Product[]>;
  purchase(productId: string): Promise<PurchaseResult>;
  restorePurchases(): Promise<Purchase[]>;
}

interface SaveService {
  loadCloud(): Promise<unknown | null>;
  saveCloud(payload: unknown): Promise<void>;
}
```

UI общается только с интерфейсами.

## Mock mode

Mock mode позволяет менять:

- latency;
- rewarded success;
- rewarded unavailable;
- rewarded close;
- purchase success;
- purchase cancel;
- cloud timeout;
- cloud conflict;
- offline;
- authorized/guest.

---

# 5. Save strategy

## Yandex cloud canonical, local mirror first-write

1. применить действие;
2. обновить state;
3. сохранить локально;
4. поставить cloud save в debounce queue;
5. показать ненавязчивый status;
6. при ошибке не откатывать локальный прогресс.

## Versioning

Каждый save имеет:

- `version`;
- `updatedAt`;
- stable ids;
- migration path.

## Merge

Monotonic data:

- completed levels;
- artifacts;
- purchases.

Best result:

1. больше печатей;
2. выше accuracy;
3. меньше exact hints;
4. меньше time как tie-breaker.

Consumables:

- правило фиксируется явно;
- безопасная стратегия vertical slice: значение из более свежего save, но не ниже подтверждённого purchase grant;
- результат merge логируется.

---

# 6. Content structure

## Уровни

Один JSON на уровень.

```text
src/content/levels/northern-route/nr-01-night-train.json
public/assets/scenes/northern-route/nr-01/a.webp
public/assets/scenes/northern-route/nr-01/b.webp
public/assets/scenes/northern-route/nr-01/thumb.webp
```

## Почему один файл на уровень

- проще заменять;
- проще проверять Git diff;
- проще передавать ассет-мейкеру;
- ошибка не ломает всю главу;
- Codex не редактирует огромный монолит.

## Asset manifest

Каждый asset получает:

- id;
- path;
- kind;
- width;
- height;
- status;
- source;
- notes.

Статусы:

- placeholder;
- generated-draft;
- edited;
- validated;
- final.

---

# 7. Арт-направление игровых сцен

## Итоговый стиль

**Premium semi-realistic illustrated archival photography.**

Это не фотография и не мультфильм.

Визуальная формула:

- полуреалистичная 2D-иллюстрация;
- качество premium hidden-object art;
- документальная композиция;
- ясные предметные силуэты;
- контролируемая живописная фактура;
- северная экспедиция конца 1970-х;
- умеренная плотность деталей;
- предметы читаются на mobile;
- фон не превращается в шум;
- нет cinematic blur;
- все важные объекты резкие.

## Почему не чистый фотореализм

Фотореалистичная генерация часто создаёт случайные надписи, бессмысленные мелкие детали, нестабильные формы и множество непреднамеренных расхождений после inpaint. Полуреалистичная иллюстрация легче контролируется и лучше читается как puzzle.

## Эпоха и окружение

- конец 1970-х;
- условная северная научная экспедиция;
- техника без брендов;
- аналоговые приборы;
- бумажные карты без читаемого текста;
- лампы, радиоприёмники, металлические шкафы;
- тёплый interior light и холодный внешний свет;
- умеренные следы эксплуатации;
- никаких современных экранов и смартфонов.

## Композиция

- fixed camera;
- 16:10;
- eye level или лёгкий high angle;
- вся сцена в фокусе;
- 12–20 ясно разделимых объектов;
- минимум 30% визуально спокойной структуры;
- отличия распределены по кадру;
- не более двух отличий в одном малом секторе;
- избегать тесных куч мелкого инвентаря.

## Свет

Допустимо:

- мягкий пасмурный свет;
- тёплый свет лампы;
- холодный снег за окном;
- мягкие локальные тени.

Запрещено:

- жёсткий контровой силуэт;
- чрезмерная темнота;
- глубокие чёрные области;
- цветной неон;
- сильный bloom;
- depth of field.

## Цвет

Основная сцена:

- холодные сине-серые;
- приглушённый зелёный;
- старое дерево;
- ржаво-коричневый;
- тёплый янтарный свет;
- небольшие цветовые акценты.

Не накладывать на весь кадр сильный sepia-фильтр: цветовые отличия должны читаться.

## Персонажи

Предпочтительны пустые помещения.

Если персонаж нужен:

- не крупный портрет;
- лицо не является отличием;
- нейтральная поза;
- без узнаваемого реального человека;
- без анатомических искажений;
- персонаж не перекрывает предметы.

## Текст и символы

- нет читаемого текста;
- нет логотипов;
- нет брендов;
- номера приборов абстрактны или добавлены вручную;
- текстовые различия не использовать в vertical slice.

---

# 8. Главный принцип парных изображений

## Никогда не генерировать A и B независимо

Независимая генерация создаст десятки случайных расхождений.

Правильный pipeline:

1. создать image A;
2. вручную очистить ошибки;
3. зафиксировать master;
4. дублировать master;
5. создать image B только локальными edit/inpaint операциями;
6. изменить строго заданные области;
7. проверить pixel alignment;
8. провести automatic visual diff;
9. вручную проверить незаявленные изменения;
10. разметить hit areas;
11. протестировать desktop/mobile.

## Допустимые изменения

- удалить один предмет;
- изменить цвет крупного предмета;
- изменить форму;
- изменить количество;
- переместить предмет;
- изменить стрелку прибора;
- добавить небольшую аномалию;
- изменить отражение вручную вместе с объектом.

## Запрещённые изменения

- перегенерировать весь кадр;
- менять освещение сцены;
- менять camera;
- менять crop;
- менять перспективу;
- менять grain;
- делать global color grade;
- позволять inpaint менять соседние объекты.

---

# 9. Image generation workflow

## Этап A — scene brief

Для каждой сцены сначала создать brief:

```text
Scene ID:
Location:
Story purpose:
Camera:
Foreground objects:
Midground objects:
Background objects:
Lighting:
Palette:
Planned differences:
Forbidden accidental changes:
```

## Этап B — master prompt

```text
A premium semi-realistic 2D illustrated archival scene for a find-the-difference puzzle game.
Late-1970s northern scientific expedition, [LOCATION].
Fixed 16:10 composition, eye-level or slightly elevated camera, all important objects in focus.
Documentary, believable layout with clear object silhouettes and controlled medium-high detail.
Premium hidden-object game quality, subtle painterly texture, realistic materials, no cartoon exaggeration.
Cold muted northern palette with warm practical lamp accents.
Include: [OBJECT LIST].
Leave clean visual separation between objects and distribute points of interest across the frame.
No readable text, no logos, no brands, no watermark, no UI, no captions, no close-up faces.
No depth-of-field blur, no heavy fog, no extreme darkness, no neon, no horror, no fisheye distortion.
The image must be suitable as the unchanged master image A for a paired visual puzzle.
```

## Этап C — negative constraints

```text
Do not generate a second variation.
Do not add random letters, labels, posters, malformed clock numbers, brand marks or watermarks.
Do not create tiny clutter that cannot be read on a phone.
Do not use shallow depth of field.
Do not crop important objects.
Do not place essential differences near screen edges or under future UI.
```

## Этап D — cleanup

До B:

- исправить руки/лица, если есть;
- убрать мусорный текст;
- исправить приборы;
- проверить повторяющиеся объекты;
- исправить перспективу;
- унифицировать окна и рамки;
- сохранить PNG master без повторной JPEG-компрессии.

## Этап E — image B

Одна edit-операция — одно отличие.

```text
Edit the provided master image only inside the explicitly masked region.
Preserve the exact camera, composition, lighting, color grading, texture, sharpness, perspective and every unmasked object.
Make only this single controlled change: [CHANGE].
The edited result must remain pixel-aligned with the original outside the mask.
Do not reinterpret neighboring objects.
Do not add text, logos, new clutter or lighting changes.
```

После каждой операции сохранять промежуточную версию.

## Этап F — diff validation

Использовать:

- absolute pixel diff;
- threshold overlay;
- blink A/B;
- edge comparison;
- manual review at 100%;
- mobile preview.

Если diff показывает изменения вне масок, B не принимается.

---

# 10. Правила отличий

## Количество

- tutorial: 4;
- easy: 5–6;
- medium: 6–7;
- hard: 7–8.

## Размер

Ориентир:

- крупное: 6–12% ширины сцены;
- среднее: 3–6%;
- небольшое: 1.8–3%.

Не использовать меньше 1.8% ширины.

## Распределение

Разделить кадр на 3 × 3:

- не более двух отличий в одной ячейке;
- минимум одно слева;
- минимум одно справа;
- минимум одно в нижней половине;
- не прятать всё в центре.

## Честность

Игрок должен объяснить отличие словами:

- «на столе нет компаса»;
- «лампа синяя, а не зелёная»;
- «на приборе другая стрелка»;
- «ящик стоит у другой стены».

«Текстура немного другая» недопустимо.

---

# 11. Экспорт сцен

## Master

- PNG;
- 1600 × 1000;
- sRGB;
- без встроенного текста;
- хранится вне runtime build как source.

## Runtime

- WebP;
- 1600 × 1000;
- quality примерно 82–88;
- одинаковые dimensions A/B;
- желательно до 900 KB на пару, но качество важнее;
- thumbnail отдельный.

## Имена

```text
nr-01-night-train-a.webp
nr-01-night-train-b.webp
nr-01-night-train-thumb.webp
```

Не использовать пробелы, кириллицу и `final_final_2`.

---

# 12. Арт экспонатов

Стиль:

- музейная предметная иллюстрация;
- один предмет;
- нейтральный архивный фон;
- мягкая тень;
- те же материалы, что в сценах;
- без текста;
- узнаваемость в 160 px.

Source:

- 1200 × 1200 PNG;
- прозрачный фон допустим;
- runtime WebP или PNG.

Prompt:

```text
A museum-catalog illustration of [ARTIFACT], from a late-1970s northern scientific expedition.
Premium semi-realistic painted object rendering, centered, clear silhouette, realistic materials, subtle wear, soft neutral archive-paper backdrop, soft grounded shadow.
No readable text, no logos, no brand marks, no hands, no people, no watermark, no decorative frame.
Suitable for a collectible artifact card and a large reveal screen.
```

---

# 13. UI asset rules

Предпочитать CSS и SVG:

- route lines;
- seals;
- clips;
- paper corners;
- icons;
- map markers;
- hint symbols.

Не запекать текст в PNG.

SVG:

- currentColor, где возможно;
- корректный viewBox;
- без огромного metadata;
- пригоден для recolor;
- без внешних fonts.

---

# 14. Audio

## Музыка

- 45–90 секунд;
- seamless loop;
- quiet analog ambient;
- мягкий ветер;
- редкие низкие ноты;
- без horror tension;
- без навязчивой мелодии.

## SFX

- correct difference;
- misclick;
- compare toggle;
- hint area;
- exact reveal;
- seal stamp;
- artifact reveal;
- map node unlock;
- save success;
- subtle error.

Runtime:

- OGG или MP3;
- нормализованная громкость;
- без clipping.

---

# 15. Production checklist сцены

- [ ] Brief утверждён.
- [ ] Master A создан.
- [ ] Нет мусорного текста.
- [ ] Camera/crop зафиксированы.
- [ ] Объекты читаются на 390 px.
- [ ] Planned differences перечислены.
- [ ] B создан только edit-операциями.
- [ ] A/B одинакового размера.
- [ ] Diff overlay проверен.
- [ ] Незаявленных расхождений нет.
- [ ] HitAreaA размечены.
- [ ] HitAreaB размечены.
- [ ] HintArea размечены.
- [ ] Level JSON проходит Zod.
- [ ] Level протестирован без zoom.
- [ ] Level протестирован с zoom.
- [ ] Mobile toggle не дрожит.
- [ ] Отличия можно объяснить словами.
- [ ] WebP экспорт проверен.

---

# 16. Порядок производства

## Milestone 1 — технический скелет

- app shell;
- mock platform;
- routing;
- theme;
- localization;
- placeholder scene;
- PhotoComparator.

## Milestone 2 — vertical gameplay

- tutorial;
- one standard level;
- one hard level;
- hints;
- result;
- save reload.

## Milestone 3 — meta

- map;
- artifacts;
- collection;
- daily;
- streak.

## Milestone 4 — monetization/platform

- rewarded;
- interstitial policy;
- purchase;
- cloud adapter;
- analytics.

## Milestone 5 — content

- 12 campaign levels;
- three daily scenes;
- artifact art;
- UI assets;
- audio.

## Milestone 6 — hardening

- validation;
- unit;
- integration;
- E2E;
- performance;
- mobile;
- SDK failure;
- save conflict;
- production build.

---

# 17. Критические риски

## Random AI differences

Решение: master-edit pipeline и diff validation.

## Mobile readability

Решение: A/B toggle UX, medium-sized differences, проверка на 390 px.

## Save loss

Решение: local-first, versioning, monotonic merge, reload/cloud failure tests.

## Scope creep

Решение: `game_concept.json`. Всё вне `verticalSliceScope` не реализуется.

## Ad dead ends

Любая ошибка рекламы возвращает управление игроку.

## Design drift

Codex использует `design-reference/` и не заменяет проект generic UI.


---

# 18. Mandatory monetization, i18n and save decisions

Полная спецификация находится в `05_MONETIZATION_I18N_AND_CLOUD_SAVE.md`.

Кратко:

- canonical progress storage: Yandex Player Data;
- local mirror: `ysdk.getStorage()`, затем `window.localStorage`;
- production locales: `ru`, `en`;
- default/fallback: `ru`;
- i18n: `i18next` + `react-i18next`;
- launch products: `archive_supporter_pack`, `magnifiers_10`;
- sticky banner disabled;
- interstitial only on map at logical breaks;
- product price/currency/icon only from Yandex catalog;
- purchase grants are saved to Yandex before consumable token consumption.


---

# 19. Platform lifecycle and release architecture

Полная спецификация находится в:

- `06_YANDEX_PLATFORM_RELEASE_AND_MODERATION.md`;
- `07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md`;
- `08_RELEASE_READINESS_CHECKLIST.md`.

Обязательные services:

- `PlatformLifecycleService`;
- `RemoteConfigService`;
- `FeedbackService`;
- `ShortcutService`;
- `DiagnosticsService`;
- `ReleaseManifestService`.

## Lifecycle state

```ts
type PlatformPauseReason =
  | 'startup-ad'
  | 'fullscreen-ad'
  | 'rewarded-ad'
  | 'purchase'
  | 'tab-hidden'
  | 'platform-event'
  | 'account-selection';

type PlatformLifecycleState = {
  sdkReady: boolean;
  loadingReadySent: boolean;
  gameplayMarkedActive: boolean;
  pauseReasons: Set<PlatformPauseReason>;
  audioAllowed: boolean;
};
```

Gameplay resumes only when `pauseReasons.size === 0` and gameplay state is active.

## Remote Config parsing

All Yandex flags are string values. Convert with explicit parsers:

- boolean: only `true`/`false`;
- integer with min/max clamp;
- CSV stable IDs;
- localization key;
- enum.

No `JSON.parse` of arbitrary remote strings without validation.

## Mobile landscape

Use side-by-side touch comparator.

- each viewport has minimum readable width;
- if available width is too small, use a shared single viewport toggle;
- safe-area insets;
- compact HUD;
- one-finger pan;
- pinch zoom;
- no browser page zoom conflict.

## Build/release budget

- uncompressed archive <= 100 MB;
- target initial transfer <= 4 MB;
- first interaction does not wait for all levels;
- only ASCII paths;
- no spaces;
- one index.html at ZIP root;
- content and asset manifests generated deterministically.

## Asset provenance

Production build validation reads `ASSET_PROVENANCE.json`.

Every final asset must have:

- rights/source;
- tool/model where applicable;
- prompt/source path;
- human edits;
- checksum;
- approval status.
