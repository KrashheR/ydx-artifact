# Game Overview: Find the Differences / Expedition Mysteries

Актуальное саммари проекта `anomaly-archive` как игры и вертикального среза для Yandex Games.

Основные источники актуальности: `README.md`, `src/content/*`, `src/shared/store/gameStore.ts`, `src/shared/lib/progression.ts`, `src/entities/save/schema.ts`, `src/screens/*`, `src/features/gameplay/*`, `src/features/collection/*`, `src/features/campaign-report/*`, `src/data/campaignReports.ts`, `ANALYTICS_EVENTS.md`.

## Коротко

`Найди отличия: Тайны экспедиций` / `Spot the Differences: Expedition Mysteries` - спокойная визуальная головоломка "найди отличия" про восстановление архивных экспедиционных снимков. Игрок сравнивает оригинальный кадр и измененную архивную копию, находит все расхождения, открывает следующее дело, собирает артефакты и постепенно складывает историю трех меридианов.

Текущий срез уже содержит:

- 3 линейные кампании по 13 уровней: Белый, Песчаный и Изумрудный меридиан.
- 39 campaign-уровней с локальными WebP A/B-сценами и data-driven hitbox-геометрией.
- 7 Daily Archive дел из `public/assets/scenes/archive/1-7/` с детерминированной дневной ротацией.
- 15 коллекционных артефактов: по 5 milestone-находок на кампанию, открываются на уровнях 3, 6, 8, 10 и 13.
- Archive Hub как основной home screen: активное дело, daily, коллекция, список кампаний, счетчик подсказок и статус сохранения.
- Сохранения через Yandex Player Data с `localStorage`-fallback и версионированной схемой save v2.
- RU/EN локализацию, Yandex lifecycle, рекламу подсказок, queued interstitial, review pre-prompt и продуктовую аналитику.

Тон игры: архивная экспедиционная тайна без хоррора и агрессивного F2P. Центральная фантазия - игрок восстанавливает намеренно измененные фотодоказательства и понимает, зачем исчезнувшие экспедиции скрывали маршрут меридианной водной сети.

## Игроковый Flow

1. При первом запуске новый save сразу открывает White/Белый Meridian level 01 с мягким onboarding overlay.
2. Любой не новый save открывает Archive Hub, а не принудительный auto-resume.
3. Из Archive Hub игрок может продолжить активную кампанию, открыть журнал уровней кампании, пройти Daily Archive или перейти в коллекцию.
4. Campaign progression линейная: Белый меридиан -> Песчаный меридиан -> Изумрудный меридиан; внутри кампании уровни тоже открываются по порядку.
5. Уровень показывает пару снимков A/B. Desktop использует side-by-side сравнение; mobile portrait блокируется rotate-device gate; mobile landscape использует 16:10 before/after slider.
6. Игрок находит все отличия (`requiredDifferences` равно количеству authored differences), ошибки снижают accuracy, подсказка подсвечивает `hintArea`.
7. После нахождения всех отличий показывается victory/result flow: статистика, clue текущего уровня, награды, next/retry/map actions.
8. Если уровень является milestone, поверх victory показывается artifact reveal ceremony; затем артефакт остается в Collection со статусом `newly-unlocked`, пока игрок его не просмотрит.
9. После 13-го уровня кампании автоматически доступен Campaign Case Report: 13/13, пять findings кампании, вывод архивариуса и CTA к следующему делу или финальному архиву.
10. Daily completion возвращает игрока в Archive Hub и не пишет прогресс в `completedLevels` кампаний.

## Контент

### Кампании

| Campaign id | UI name | Runtime assets | Levels | Notes |
|---|---|---:|---:|---|
| `northern-route` | Белый меридиан / White Meridian | `public/assets/scenes/northern-route/` | 13 | Стартовая северная экспедиция и вход в меридианную тайну. |
| `sand-meridian` | Песчаный меридиан / Sand Meridian | `public/assets/scenes/sand-meredian/` | 13 | Пустынная линия Aster-9; runtime-папка сохраняет legacy spelling `sand-meredian`. |
| `emerald-meridian` | Изумрудный меридиан / Emerald Meridian | `public/assets/scenes/emerald-meridian/` | 13 | Тропическая финальная кампания текущего контента. |

Campaign metadata, runtime folders, preview filenames and map aspect ratios централизованы в `src/content/campaignManifest.ts`.

### Daily Archive

Daily Archive содержит 7 самостоятельных дел:

- `daily-archive-01` ... `daily-archive-07`;
- сцены лежат в `public/assets/scenes/archive/1-7/`;
- выбранное дело определяется по локальному `dayNumber % 7`;
- награда за первое daily completion в локальную дату: `+1` подсказка и увеличение streak;
- daily completion не открывает campaign levels, не влияет на campaign reports и не записывается в `completedLevels`.

### Коллекция

Коллекция содержит 15 артефактов:

- Белый меридиан: compass, field radio, red diary, echo recorder, descent rope.
- Песчаный меридиан: rune marker, descent helmets, hydraulic pump, bronze lamp, buried map.
- Изумрудный меридиан: botanical vials, tropical map, stone plaque, brass spyglass, evacuation aircraft.

Каждый artifact имеет `open.webp` и `closed.webp`, состояние в save (`locked`, `newly-unlocked`, `viewed`) и связь с campaign milestone level.

## Механики Уровня

Уровень описывается data-driven через Zod-схему:

- `imageA`, `imageB`, `thumbnail`;
- массив `differences`;
- `requiredDifferences`;
- reward metadata;
- optional `story` keys.

Каждое отличие содержит:

- `id`;
- `hitAreaA`;
- `hitAreaB`;
- `hintArea`;
- `difficulty`.

Hit testing поддерживает `circle`, `ellipse` с optional `rotation` и `polygon`. Логика геометрии должна оставаться в `src/shared/lib/hitTesting.ts`; UI не должен дублировать математику.

Таймер уровня сейчас жесткий: `TIME_LIMIT = 300` секунд. При timeout показывается failure overlay; если у игрока есть минимум 2 подсказки, он может продлить попытку. Это остается важным продуктовым решением, потому что исходный тон игры спокойный, а timer добавляет давление.

## Награды И Экономика

- Новый save стартует с 1 подсказкой (`INITIAL_MAGNIFIERS = 1`).
- Campaign replay не выдает cadence-награды повторно.
- За каждый второй новый completed campaign level начисляется `+1` подсказка.
- Daily Archive выдает `+1` подсказку один раз за локальную дату.
- Баланс подсказок не имеет верхнего cap.
- Если подсказок нет, кнопка hint открывает rewarded ad flow; area hint применяется только после rewarded completion.
- `archivePoints` остаются в level reward metadata, но пока не представлены как видимая мета-валюта.

## Реклама И Review

- Rewarded ad используется для zero-balance area hint и не блокирует core gameplay.
- Forced fullscreen interstitial ставится в очередь после каждого третьего нового campaign completion (`3, 6, 9...`).
- Interstitial показывается только с победного next-level CTA, не во время gameplay и не при возврате на карту.
- `purchases.noForcedInterstitials` в save отключает forced interstitial, но полноценный shop/IAP UI сейчас не является частью основного flow.
- Review pre-prompt показывается после позитивного post-victory момента, первая eligibility - после 4 новых completed campaign levels.
- Native review, ads, cloud save and SDK lifecycle идут через сервисы/adapters, не напрямую из React-компонентов.

## Сохранения, Platform И Analytics

Save schema version: `2`.

Save хранит:

- `completedLevels`;
- `bestResults`;
- `inProgress` с `elapsedActiveSeconds`;
- `magnifiers`;
- `artifacts`;
- `viewedCampaignReportIds`;
- `daily`;
- `settings`;
- `reviewPrompt`;
- `purchases`.

Platform layer:

- production подключает Yandex `/sdk.js`;
- вызывает `LoadingAPI.ready()` один раз после bootstrap/hydration readiness;
- централизует `GameplayAPI.start()` / `stop()` вокруг активного gameplay;
- использует Yandex Player Data cloud save с local mirror/fallback;
- берет стартовый язык из `ysdk.environment.i18n.lang`, если нет manual override.

Analytics:

- события приватно-безопасные;
- локально доступны через QA buffer;
- опционально уходят в Yandex Metrica через `VITE_YANDEX_METRICA_ID`;
- покрывают app readiness, screen navigation, campaign/map flow, gameplay, hints, ads, daily reward, artifacts, campaign reports and review prompts.

## Dev И Release Support

Основные команды:

- `pnpm dev` - обычный dev server.
- `pnpm dev --cheat` - dev server с unlock all content.
- `pnpm dev:validate` - hitbox-alignment view на `3.webp` markup references.
- `pnpm validate:final` - hitbox editor на финальных `1.webp` / `2.webp`.
- `pnpm validate:archive` - hitbox editor для 7 Daily Archive cases.
- `pnpm validate:content` - content/assets/locales/provenance validation.
- `pnpm agent:check` - lint, typecheck, content validation.
- `pnpm release:validate` и `pnpm release:zip` - production validation and Yandex archive packaging.

Production build исключает `3.webp` markup references, unused placeholders and sourcemaps by default; release ZIP uses relative asset links for Yandex hosting.

## Текущее Состояние

Реализовано и должно считаться текущим baseline:

- playable archive hub;
- 3 campaign journals with 39 levels total;
- 7 daily archive cases;
- full data-driven scene assets and hitboxes for current content;
- desktop and mobile-landscape gameplay layouts;
- first-run onboarding into level 01;
- local/cloud save, migration and fallback;
- collection flow with artifact toast, reveal ceremony and collection screen;
- campaign finale reports;
- daily reward and streak tracking;
- hint economy with rewarded fallback;
- queued interstitial and review pre-prompt;
- Yandex lifecycle and optional Metrica transport;
- local hitbox authoring tools.

Не до конца закрыто или требует продуктового решения:

- `archivePoints` технически есть в rewards, но не являются видимой мета-ценностью.
- 5-минутный timer может конфликтовать со спокойным positioning игры.
- Daily reward ladder пока простая: одно daily completion в дату дает `+1` hint.
- Shop/IAP не оформлен как полноценный пользовательский flow, хотя purchase flags в save уже есть.
- Pre-level story пока не вынесен в отдельный экран; narrative раскрывается через level result clue, artifacts and campaign reports.

## Ближайшие Логичные Улучшения

1. Принять решение по campaign timer: оставить как tension-механику, смягчить или убрать из campaign mode.
2. Превратить `archivePoints` в понятную мета-ценность либо удалить их из rewards, если они не нужны.
3. Усилить pre-level context: добавить компактную архивную карточку перед стартом уровня на основе уже подключенных story keys.
4. Развить daily reward/streak: больше состояний, но без агрессивного event hub.
5. Углубить collection/campaign reports как case archive: больше связей между артефактами, выводами кампаний и будущим контентом.
6. Использовать analytics для quality review конкретных differences: high hint rate, long time-to-find, high misclick rate.
