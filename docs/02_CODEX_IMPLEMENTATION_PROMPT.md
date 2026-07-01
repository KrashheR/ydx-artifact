# Production implementation prompt for Codex

## Роль и итог

Ты — senior frontend/game engineer, специализирующийся на React, TypeScript, браузерных 2D-играх и Yandex Games SDK.

Реализуй publishable vertical slice игры «Найди отличия: Архив аномалий». Нужен работающий end-to-end продукт, а не документ с рекомендациями и не один демонстрационный экран.

## Обязательный порядок

1. Прочитай все файлы стартового пакета.
2. Считай `game_concept.json` единственным источником истины.
3. Прочитай `03_TECHNICAL_STACK_AND_ART_PIPELINE.md`.
4. Прочитай `05_MONETIZATION_I18N_AND_CLOUD_SAVE.md`.
5. Прочитай `06_YANDEX_PLATFORM_RELEASE_AND_MODERATION.md`.
6. Прочитай `07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md`.
7. Используй `08_RELEASE_READINESS_CHECKLIST.md` как обязательный acceptance checklist.
8. Прочитай `09_DEVELOPMENT_ROADMAP.md` и выполняй этапы в заданном порядке.
9. Обновляй status каждого этапа в `IMPLEMENTATION_PLAN.md`.
8. Изучи всё содержимое `design-reference/`.
6. Создай `IMPLEMENTATION_PLAN.md` с этапами и чекбоксами.
6. После плана сразу приступай к реализации.
8. Не жди дополнительного подтверждения.
9. После каждого этапа запускай проверки.
10. Исправляй ошибки до прохождения Definition of Done.
11. Не расширяй scope.

Если финальных ассетов нет, создай локальные временные изображения с правильными размерами и путями. Не используй внешние hotlinks. Все placeholders перечисли в `ASSET_MANIFEST.md`.

## Стек

Используй:

- React;
- TypeScript strict;
- Vite;
- Tailwind CSS;
- Zustand;
- Zod;
- Framer Motion только для UI-анимаций;
- i18next;
- react-i18next;
- PixiJS или изолированный Canvas2D-модуль для PhotoComparator;
- Vitest;
- Playwright;
- ESLint;
- Prettier;
- pnpm.

Не используй тяжёлый игровой движок и серверный backend.

React управляет экранами и UI. Canvas/Pixi отвечает только за изображения, zoom, pan, маркеры, hint overlays и hit testing.

## Команды

Проект обязан поддерживать:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm validate:content
pnpm build
pnpm preview
```

## Архитектура

- Весь контент data-driven.
- Уровни, тексты, награды и координаты не хранятся в компонентах.
- Все JSON валидируются через Zod.
- Platform-specific вызовы только через adapters.
- Local mock mode обязателен.
- Gameplay flow представлен явной state machine или эквивалентной моделью.
- SDK, реклама, облако и ассеты имеют timeout и fallback.
- Бесконечные spinner запрещены.

Рекомендуемая структура:

```text
src/
  app/
  screens/
  features/
    gameplay/
    chapter-map/
    collection/
    daily/
    hints/
    monetization/
    save-system/
    settings/
  entities/
    level/
    chapter/
    artifact/
    player/
  services/
    yandex/
    analytics/
    storage/
    ads/
    purchases/
  content/
    chapters/
    levels/
    artifacts/
  i18n/
    ru/
    en/
  shared/
    ui/
    lib/
    hooks/
    types/
  dev/
    level-editor/

public/
  assets/
    scenes/
    artifacts/
    ui/
    audio/

tests/
  unit/
  integration/
  e2e/
```

## Полный flow

Реализуй:

- SDK initialization;
- новый главный экран;
- возвращающийся главный экран;
- короткое intro;
- tutorial;
- gameplay;
- pause;
- result;
- map;
- artifact reveal;
- collection;
- daily;
- streak;
- rewarded;
- interstitial eligibility;
- purchase;
- settings;
- save states;
- chapter completion;
- error and offline states.

Дизайн из `design-reference/` является визуальным источником истины. Не заменяй его generic UI.

## Модель уровня

Используй эквивалентные типы:

```ts
type NormalizedPoint = {
  x: number;
  y: number;
};

type HitShape =
  | {
      kind: "circle";
      cx: number;
      cy: number;
      radius: number;
    }
  | {
      kind: "polygon";
      points: NormalizedPoint[];
    };

type DifferenceDefinition = {
  id: string;
  hitAreaA: HitShape;
  hitAreaB: HitShape;
  hintArea: HitShape;
  difficulty: 1 | 2 | 3;
};

type LevelDefinition = {
  id: string;
  chapterId: string;
  order: number;
  titleKey: string;
  descriptionKey: string;
  imageA: string;
  imageB: string;
  thumbnail: string;
  differences: DifferenceDefinition[];
  requiredDifferences: number;
  parTimeSeconds?: number;
  reward: {
    archivePoints: number;
    magnifiers?: number;
    artifactId?: string;
  };
};
```

Используй `starter-data/level.example.json` только как ориентир структуры.

## PhotoComparator

### Desktop

- две версии рядом;
- синхронный zoom;
- синхронный pan;
- hit testing по hitAreaA/hitAreaB;
- marker на обеих версиях;
- mouse, wheel, touchpad и keyboard zoom;
- bounds камеры.

### Mobile

Основной режим:

- одна версия почти на весь экран;
- tap по «Сравнить» переключает A/B;
- hold временно показывает другую версию;
- release возвращает предыдущую;
- camera transform сохраняется;
- активная версия обозначена;
- markers одинаковы.

Дополнительный режим:

- vertical split;
- включается в настройках.

### Общие правила

- координаты нормализованы;
- circle и polygon;
- misclick не возникает после pan;
- найденное отличие не срабатывает повторно;
- сохранение после каждого найденного отличия;
- A/B не дрожат и не меняют размер;
- gameplay status и controls остаются в DOM.

## Gameplay state

Минимальные состояния:

- loading;
- intro;
- playing;
- hint-selection;
- paused;
- completed;
- reward;
- error.

Не распределяй переходы по случайным `useEffect`.

## Кампания

- Нет campaign timer.
- Нет energy.
- Нет lives.
- Нет окончательного проигрыша.
- Ошибка снижает accuracy.
- Три быстрых misclick блокируют input на 700 ms.
- Pan gesture не считается misclick.
- Печати: completed, accuracy >= 85%, exact hint not used.
- Сохраняется лучший результат.

Глава `northern-route`:

- 12 последовательных уровней;
- daily после уровня 2;
- экспонаты после 3, 6, 9 и 12;
- финал после уровня 12.

## Подсказки

### Ориентир

- одна лупа;
- подсвечивает hintArea;
- не открывает точное отличие.

## Коллекция

Экспонаты:

- brass-compass;
- field-radio;
- blue-flower;
- torn-map.

Состояния:

- locked;
- newly-unlocked;
- viewed.

Reveal не повторяется после reload.

## Daily

- три сцены;
- deterministic selection по локальной календарной дате;
- reward once per day;
- replay allowed;
- streak;
- смена даты в открытой вкладке;
- already-claimed;
- missed day;
- rewarded unavailable.

## Save system

Создай versioned schema и migrations.

Сохраняй:

- completed levels;
- unlocked levels;
- best results;
- in-progress level;
- found difference ids;
- elapsed time;
- mistakes;
- camera state;
- magnifiers;
- artifacts;
- daily;
- streak;
- settings;
- purchases.

Режимы:

- local guest save;
- cloud through adapter.

Точки сохранения:

- difference found;
- level complete;
- artifact unlock;
- purchase;
- visibilitychange;
- pagehide.

Merge rules:

- union completed levels;
- union artifacts;
- purchases never lost;
- better result wins;
- consumable merge rule документируется и тестируется.

## Yandex adapter

Создай интерфейсы:

- PlatformService;
- PlayerService;
- SaveService;
- AdsService;
- PurchaseService;
- AnalyticsService.

Режимы:

- Yandex;
- local mock.

Переменная:

```env
VITE_PLATFORM_MODE=mock
```

Mock позволяет симулировать:

- rewarded success;
- rewarded failure;
- rewarded close;
- purchase success;
- purchase cancel;
- auth change;
- cloud failure;
- cloud conflict;
- offline.

Игра полностью работает локально без Yandex SDK.

## Монетизация

Rewarded:

- exact hint;
- post-level bonus;
- missed daily reward.

Interstitial — строго по условиям `game_concept.json`.

Покупка:

- `archive_starter_pack`;
- no forced interstitials;
- five magnifiers;
- cosmetic frame.

Название и цена из каталога. Hardcode цены запрещён.

## I18n и локализация

Используй `i18next` + `react-i18next`.

Production locale:

- `ru`;
- `en`.

Default и fallback:

- `ru`.

Detection priority:

1. сохранённый manual locale;
2. `ysdk.environment.i18n.lang`, если поддержан;
3. browser language, если поддержан;
4. `ru`.

Требования:

- все строки вынесены по namespaces;
- parity validation ru/en;
- missing key — production validation error;
- даты и числа через Intl;
- plural forms;
- никакой конкатенации переводимых фрагментов;
- нет текста внутри сцен;
- manual switch без reload;
- locale сохраняется в Yandex cloud и local mirror;
- другие locale не входят в production config;
- RTL не реализовывать.

## Аналитика

Создай единый adapter и все события из `game_concept.json`.

`level_complete` передаёт:

- levelId;
- duration;
- accuracy;
- mistakes;
- hintsUsed;
- rewardedUsed;
- deviceCategory;
- inputMode;
- photoMode;
- sessionDuration.

## Dev-only level editor

Маршрут:

```text
/dev/level-editor
```

Функции:

- загрузка A/B;
- проверка размеров;
- toggle A/B;
- split preview;
- circle;
- polygon;
- отдельные hitAreaA/hitAreaB;
- hintArea;
- перемещение точек;
- удаление;
- test hitboxes;
- desktop preview;
- mobile toggle preview;
- JSON import/export;
- Zod validation errors;
- visual diff overlay.

Редактор не входит в production bundle.

## Content validation

Команда:

```bash
pnpm validate:content
```

Проверяет:

- unique ids;
- asset existence;
- equal A/B dimensions;
- coordinates 0..1;
- valid polygon;
- required difference count;
- translation keys;
- artifact references;
- level order;
- thumbnail existence.

Critical error останавливает build.

## Производительность

- Не загружай все сцены при старте.
- Preload current и next.
- Освобождай textures.
- Не используй base64 для крупных изображений.
- Lazy-load collection, shop и dev editor.
- Первая сцена не ждёт всю главу.
- Не допускай layout shift.
- Не допускай input lag при zoom/pan/toggle.

## Accessibility

- keyboard navigation;
- visible focus;
- reduced motion;
- sound and vibration settings;
- 44 px touch targets;
- состояния не только цветом;
- aria-label;
- gameplay status в DOM;
- zoom buttons;
- читаемый adult UI.

## Тесты

### Unit

- circle hit test;
- polygon hit test;
- transforms;
- zoom limits;
- save migrations;
- save merge;
- progression;
- seals;
- daily selection;
- streak;
- interstitial eligibility;
- content validation.

### Integration

- level JSON load;
- level completion;
- in-progress restoration;
- rewarded success/failure;
- purchase success;
- cloud failure.

### Playwright

1. новый пользователь проходит tutorial;
2. завершает уровень и возвращается на карту;
3. прогресс остаётся после reload;
4. mobile A/B toggle работает;
5. rewarded unavailable не блокирует игру;
6. artifact reveal запускается один раз;
7. daily reward не выдаётся повторно;
8. noAds отключает interstitial eligibility.

## Документация

Создай:

- README.md;
- IMPLEMENTATION_PLAN.md;
- ARCHITECTURE.md;
- CONTENT_PIPELINE.md;
- YANDEX_INTEGRATION.md;
- ANALYTICS_EVENTS.md;
- SAVE_SCHEMA.md;
- LEVEL_EDITOR.md;
- ASSET_MANIFEST.md.

## Запреты

- server backend;
- обязательная регистрация;
- procedural scenes;
- hardcoded levels;
- hardcoded price;
- multiple currencies;
- energy;
- lives;
- PvP;
- battle pass;
- restoration room;
- autoplay ads;
- direct SDK calls from components;
- external image hotlinks;
- silent save failure;
- production dev editor;
- generic redesign вместо design-reference.

## Definition of Done

Работа завершена только когда:

- полный flow реализован;
- 12 campaign entries и 3 daily entries существуют;
- gameplay работает на desktop и mobile;
- progress survives reload;
- local mock полностью функционален;
- Yandex adapter подключён;
- rewarded failure не создаёт dead end;
- content validation проходит;
- lint проходит;
- typecheck проходит;
- unit tests проходят;
- e2e tests проходят;
- production build проходит;
- критических console errors нет;
- README запускает проект с нуля;
- основные экраны соответствуют design-reference;
- временные ассеты перечислены;
- scope не расширен.


## Обязательная реализация Yandex cloud-save

`SaveService` не является абстрактным placeholder. Реализуй реальный adapter:

```ts
interface SaveService {
  loadCloud(): Promise<unknown | null>;
  saveCloud(payload: unknown, options: { flush: boolean }): Promise<void>;
  loadLocal(): Promise<unknown | null>;
  saveLocal(payload: unknown): Promise<void>;
  syncPending(): Promise<void>;
}
```

Storage priority:

1. Yandex `player.getData/setData` — canonical;
2. `ysdk.getStorage()` — local mirror;
3. `window.localStorage` — fallback;
4. memory — session emergency fallback.

Boot:

- load local;
- load cloud with 4-second timeout;
- validate/migrate;
- deterministic merge;
- hydrate;
- persist merged local;
- queue cloud sync if needed.

Writes:

- difference found: local immediate + `setData(..., false)`;
- level/artifact/daily/purchase: local immediate + `setData(..., true)`;
- settings/camera: debounced/coalesced;
- hidden/pagehide: best-effort critical flush.

Handle Yandex account-selection open/close events exactly as specified in `05_MONETIZATION_I18N_AND_CLOUD_SAVE.md`.

Target save size <= 120 KB. Add dev warnings and production guards near platform limit.

## Monetization guardrails

- Sticky banner disabled in launch build.
- No interstitial during gameplay.
- No timer-based `setInterval` ad calls.
- No simultaneous ad calls.
- Pause/resume audio and input on ad callbacks.
- Reward exactly once.
- Rewarded close without reward does not grant.
- No-ads entitlement disables all forced in-game ads.
- Purchase recovery and consumption are tested.


## Platform lifecycle — обязательная реализация

Создай единый `PlatformLifecycleService`.

Он отвечает за:

- раннюю подписку на `game_api_pause` / `game_api_resume`;
- startup ad pause/resume;
- `LoadingAPI.ready()` exactly once;
- `GameplayAPI.start()` / `stop()` idempotently;
- visibilitychange;
- audio suspend/resume;
- timer pause/resume;
- input lock;
- account selection lifecycle;
- fullscreen state;
- deviceInfo.

Не вызывай LoadingAPI или GameplayAPI напрямую из React screen components.

## Orientation и device support

Production draft:

- desktop;
- mobile Android;
- mobile iOS;
- orientation any;
- no TV.

Реализуй mobile landscape side-by-side comparator и E2E rotation test.

Game state and camera survive orientation change.

## Browser shell requirements

- disable context menu only in game area;
- prevent image dragging and selection;
- prevent body scrolling and swipe-to-refresh;
- touch-action configured intentionally;
- preserve keyboard accessibility;
- do not hijack OS/browser shortcuts;
- fullscreen works but is not required for layout.

## Remote Config

Создай `RemoteConfigService` на базе `ysdk.getFlags()`.

- request once at startup;
- embedded local defaults;
- Zod parsing;
- all values are strings;
- unknown flags ignored;
- timeouts and fallback.

Implement flags from `starter-data/remote-flags.example.json`.

A disabled level is safely skipped/redirected without removing completed progress.

## Rating and shortcut adapters

Implement:

- `FeedbackService.canReview/requestReview`;
- `ShortcutService.canShowPrompt/showPrompt`.

Rating eligibility follows `game_concept.json`.

Shortcut code is implemented but launch flag defaults to false.

## Release tooling

Add commands:

```bash
pnpm release:validate
pnpm release:manifest
pnpm release:zip
pnpm release:checksum
```

Generate:

- release manifest;
- content manifest;
- asset manifest;
- SHA-256;
- third-party notices;
- release notes template.

Reject release if:

- ZIP structure invalid;
- uncompressed > 100 MB;
- path has spaces/Cyrillic;
- multiple index.html files;
- content or i18n invalid;
- save migration fixture fails;
- provenance missing for production asset.

## Diagnostics and support

Settings includes Copy diagnostics.

Implement a privacy-safe diagnostic payload described in `07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md`.

Do not include user ID, purchase token, profile name or full save.

Add local ring buffer for recent normalized errors.

## Operational repository files

Create and maintain:

- CHANGELOG.md;
- RELEASE_CHECKLIST.md;
- INCIDENT_RUNBOOK.md;
- KNOWN_ISSUES.md;
- THIRD_PARTY_NOTICES.md;
- ASSET_PROVENANCE.json;
- release-manifest.json;
- content-manifest.json;
- save migration fixtures.

## Additional E2E

- LoadingAPI ready sent once;
- startup platform pause before first screen;
- gameplay markup state;
- mobile portrait to landscape rotation;
- context menu blocked in gameplay;
- page does not scroll during gameplay;
- disabled level remote flag;
- maintenance message remote flag;
- rating eligibility and unavailable state;
- Copy diagnostics contains no PII;
- existing save survives content version update.


## Обязательный режим поэтапной реализации

Следуй `09_DEVELOPMENT_ROADMAP.md`.

Для каждого engineering-этапа:

1. перенеси задачи этапа в `IMPLEMENTATION_PLAN.md`;
2. отметь входные условия;
3. реализуй задачи;
4. запусти указанные проверки;
5. запиши найденные ограничения;
6. не отмечай этап завершённым при непройденном gate.

Не перескакивай к карте, monetization или массовому контенту до завершения соответствующих зависимостей.

Если Codex запущен только на один этап, заверши все задачи и проверки этого этапа, но не начинай следующий без явного задания пользователя.
