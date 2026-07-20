# Game Overview и AI Review Brief: Find the Differences / Expedition Mysteries

Актуально на 2026-07-21. Это самодостаточное саммари проекта `anomaly-archive` как игры и вертикального среза для Yandex Games. Документ специально подготовлен так, чтобы его можно было целиком передать другой нейросети для продуктового обзора, поиска пробелов и проектирования новых фич.

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

## Что Считать Реальностью

В этом документе используются три статуса:

- **Реализовано** — существует доступный игроку flow и рабочая логика.
- **Частично реализовано** — данные или технический seam существуют, но полноценного пользовательского цикла нет.
- **Не реализовано** — этого нет в текущем продукте; при предложении фичи нужно проектировать систему с нуля.

Краткая карта текущего продукта:

| Область | Статус | Что есть сейчас |
|---|---|---|
| Core gameplay | Реализовано | Поиск всех отличий в A/B-паре, ошибки, accuracy, звезды, подсказки, таймер, timeout и retry. |
| Campaign progression | Реализовано | 3 последовательные кампании по 13 линейных уровней. |
| Narrative meta | Реализовано | Victory clue каждого campaign-уровня, 15 артефактов, 3 финальных отчета кампаний. |
| Daily | Реализовано, базовый слой | 7 дел в календарной ротации, ежедневная награда и числовой streak. |
| Hint economy | Реализовано | Баланс подсказок, earn/spend, rewarded fallback и продление времени. |
| Ads | Реализовано | Rewarded за подсказку и interstitial после каждого третьего нового campaign completion. |
| Collection | Реализовано | 15 предметов, locked/new/viewed, фильтры, detail и replay связанного уровня. |
| Save/cloud | Реализовано | Local mirror, Yandex Player Data, migration v1 -> v2, resume незавершенного уровня. |
| Settings | Частично реализовано | RU/EN и mobile compare scheme доступны; reduced motion и vibration есть в save, но не имеют полноценного UI управления. |
| Meta-currency | Частично реализовано | `archivePoints` записаны в level metadata, но не начисляются и не показываются игроку. |
| IAP/shop | Частично реализовано | Есть purchase flags/no-interstitial flag, но нет магазина и покупательского flow. |
| Audio/haptics | Не реализовано | Нет игровой музыки, SFX и вызываемой vibration/haptic механики. |
| Social/LiveOps | Не реализовано | Нет лидербордов, достижений, друзей, серверных событий, квестов или remote-config экспериментов в runtime. |

## Карта Экранов

| Экран / overlay | Роль и доступные действия |
|---|---|
| Bootstrap | Загружает save, язык, шрифты и критические превью; после первого интерактивного кадра сообщает Yandex о готовности. |
| First-run onboarding | Только для совершенно нового save перед первым уровнем; объясняет задачу и начинает игру. |
| Archive Hub / Home | Активное дело, продолжить, открыть журнал кампании, daily-карточка, мини-превью коллекции, список кампаний, подсказки, save status, settings. |
| Campaign Journal / Map | Карточки 13 уровней: locked/current/completed, лучший звездный результат, старт или replay, возврат домой, settings. |
| Game | A/B comparator, прогресс отличий, таймер, ошибки, streak-индикатор, подсказка/rewarded ad, settings, выход. |
| Victory overlay | Время, найденные отличия, 1–3 звезды, campaign progress, narrative clue, next/retry/map. Для daily — награда и возврат в hub. |
| Timeout overlay | Retry, возврат и продление на 30 секунд за 2 подсказки. |
| Artifact toast/reveal | Неблокирующий toast при находке связанного отличия, затем отдельная reveal-церемония после победы. |
| Campaign report | Одноразовый финал после уровня 13: восстановленные кадры, пять находок, вывод и переход дальше/в коллекцию. |
| Collection | Прогресс X/15, фильтры all/кампания, locked/open карточки, detail, снятие new badge, replay уровня. |
| Settings | RU/EN; на mobile — выбор slider или flip. |
| Review pre-prompt | После подходящей campaign-победы: оценить сейчас, позже или закрыть. |

## Игроковый Flow

1. При первом запуске новый save сразу открывает White/Белый Meridian level 01 с мягким onboarding overlay.
2. Любой не новый save открывает Archive Hub, а не принудительный auto-resume.
3. Из Archive Hub игрок может продолжить активную кампанию, открыть журнал уровней кампании, пройти Daily Archive или перейти в коллекцию.
4. Campaign progression линейная: Белый меридиан -> Песчаный меридиан -> Изумрудный меридиан; внутри кампании уровни тоже открываются по порядку.
5. Уровень показывает пару снимков A/B. Desktop использует side-by-side сравнение. На mobile при первом запуске выбирается одна из двух схем: 16:10 before/after slider или один кадр с кнопкой A/B flip. Mobile portrait блокируется rotate-device gate, поэтому игровой layout рассчитан на landscape.
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

Фактические правила раунда:

- Нужно найти все authored differences; частичная победа невозможна.
- Нажатие на отличие засчитывается с любой стороны A/B и ставит found marker.
- Промах увеличивает `mistakes`; жизни или мгновенного проигрыша за ошибки нет.
- Accuracy считается как `found / (found + mistakes)`.
- Рейтинг: 3 звезды при accuracy `>= 0.85`, 2 звезды при `>= 0.60`, иначе 1 звезда.
- HUD показывает визуальный streak как `max(0, found - mistakes)`; это feedback-индикатор без отдельной награды или сохраненного combo multiplier.
- Одна подсказка стоит 1 magnifier и подсвечивает область следующего еще не найденного отличия. Пока активная подсказка не закрыта находкой, вторую платную подсказку вызвать нельзя.
- При нулевом балансе можно добровольно посмотреть rewarded video; подсказка выдается только при результате `rewarded`.
- Таймер жесткий: `TIME_LIMIT = 300` активных секунд. Он не идет при скрытой вкладке, системной/platform pause, settings и блокирующих overlay/ad flow.
- При timeout можно начать уровень заново, выйти или потратить 2 magnifiers, чтобы вернуть 30 секунд и продолжить текущий прогресс.
- Прогресс незавершенного уровня хранит найденные difference ids, mistakes и активное elapsed time; он переживает перезагрузку.
- После последней находки есть короткая визуальная задержка, затем результат фиксируется и показывается victory flow.

Лучший результат уровня сохраняется по приоритету: больше звезд -> выше accuracy -> меньше времени -> меньше ошибок. Плохой replay не ухудшает уже сохраненный результат.

Важно для продуктового ревью: в save есть `hintsUsed` и `seals`, но текущий completion всегда пишет `hintsUsed: 0`, а seal `no-intervention` добавляется независимо от фактического использования подсказки. Это не надежные живые механики достижений, а незавершенные поля.

## Награды И Экономика

- Новый save стартует с 1 подсказкой (`INITIAL_MAGNIFIERS = 1`).
- Campaign replay не выдает cadence-награды повторно.
- За каждый второй новый completed campaign level начисляется `+1` подсказка.
- Daily Archive выдает `+1` подсказку один раз за локальную дату.
- Баланс подсказок не имеет верхнего cap.
- Если подсказок нет, кнопка hint открывает rewarded ad flow; area hint применяется только после rewarded completion.
- `archivePoints` остаются в level reward metadata, но пока не представлены как видимая мета-валюта.
- Значения `reward.magnifiers` также присутствуют в контенте отдельных уровней, но фактическая campaign-награда сейчас рассчитывается глобальным правилом «+1 за каждый второй новый уровень», а не читается из level reward metadata.
- Подсказка одновременно является consumable для поиска и ресурсом продления времени: 1 единица за area hint, 2 единицы за +30 секунд после timeout.

## Реклама И Review

- Rewarded ad используется для zero-balance area hint и не блокирует core gameplay.
- Forced fullscreen interstitial ставится в очередь после каждого третьего нового campaign completion (`3, 6, 9...`).
- Interstitial показывается только с победного next-level CTA, не во время gameplay и не при возврате на карту.
- `purchases.noForcedInterstitials` в save отключает forced interstitial, но полноценный shop/IAP UI сейчас не является частью основного flow.
- Review pre-prompt показывается после позитивного post-victory момента, первая eligibility - после 4 новых completed campaign levels.
- Если игрок выбирает «позже», повторная eligibility сдвигается минимум на 5 новых completions и не раньше восьмого completed level; pre-prompt показывается максимум два раза. После завершенного native review flow больше не показывается.
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

Сохранение выполняется асинхронно и не должно блокировать gameplay. Частые изменения прогресса могут уходить без cloud flush; победа, важные переходы и уход страницы запрашивают flush. При загрузке валидируются local и cloud версии и выбирается более новая по `updatedAt`; cloud timeout не мешает начать игру.

Настройки и адаптивность:

- Production locales: только `ru` и `en`, fallback — `ru`.
- На первом запуске язык берется из Yandex environment; ручной выбор сохраняется и больше не перезаписывается auto-detection.
- Mobile compare scheme (`slider` / `flip`) выбирается одноразовым modal при `null` и затем меняется в settings.
- `reducedMotion` влияет как минимум на artifact reveal и campaign report, но пользовательского переключателя сейчас нет.
- `vibration` хранится в схеме, но runtime haptics и UI-переключатель отсутствуют.

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

Ключевые наблюдаемые метрики уже можно строить по `level_start`, `difference_found`, `level_misclick`, `hint_revealed`, `level_failed_timeout`, `level_complete`, rewarded/interstitial, daily, artifact и review events. В payload есть level/campaign/mode, ошибки, active time, accuracy и источник подсказки, но нет персональных данных.

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
- Daily streak только увеличивается при первой награде новой локальной даты: пропущенный день не сбрасывает streak и отдельной reward ladder нет.
- Нет механики жизней/энергии, fail за число ошибок, score leaderboard, achievements, quests, level difficulty modes или пользовательского профиля.
- Нет audio/SFX/haptics; поля vibration/reducedMotion не следует считать завершенным settings flow.
- Нет рабочего магазина/IAP, хотя save заранее содержит purchase flags.
- Нет видимой системы `archivePoints`, расходования этой валюты или связанного meta-progression.
- Нет remote-config/feature flags и live event scheduler в runtime; любые сезонные/серверные фичи потребуют новой архитектурной части.
- Отдельный `DailyScreen` существует как простой маршрут, но основной Archive Hub запускает выбранное daily-дело напрямую; это не отдельный развитый daily hub.

## Ближайшие Логичные Улучшения

1. Принять решение по campaign timer: оставить как tension-механику, смягчить или убрать из campaign mode.
2. Превратить `archivePoints` в понятную мета-ценность либо удалить их из rewards, если они не нужны.
3. Усилить pre-level context: добавить компактную архивную карточку перед стартом уровня на основе уже подключенных story keys.
4. Развить daily reward/streak: больше состояний, но без агрессивного event hub.
5. Углубить collection/campaign reports как case archive: больше связей между артефактами, выводами кампаний и будущим контентом.
6. Использовать analytics для quality review конкретных differences: high hint rate, long time-to-find, high misclick rate.

## Ограничения Для Новых Фич

- Не ломать спокойный investigation tone и не превращать игру в агрессивный F2P.
- Core gameplay должен оставаться playable без обязательной рекламы или покупки.
- Новая механика должна работать с RU/EN и использовать i18n keys, а не строки в компонентах.
- Campaign/level content остается data-driven и проходит Zod/content validation.
- Сохранения должны быть обратно совместимы: новая persisted-механика требует schema migration и local fallback.
- Yandex SDK нельзя вызывать напрямую из React UI; нужны platform/service seams.
- Portrait gameplay сейчас отсутствует. Фича, требующая portrait, является отдельным layout-проектом, а не маленьким UI-изменением.
- Нельзя считать `archivePoints`, IAP, achievements, haptics или remote LiveOps уже существующими системами только потому, что рядом есть типы, поля или документы-концепты.

## Готовый Prompt Для Внешней Нейросети

Передай ей этот документ и добавь запрос:

> Проведи продуктовый и гейм-дизайн обзор текущей игры строго по описанному baseline. Сначала отдели реальные проблемы от вкусовых предпочтений. Затем предложи новые фичи в трех горизонтах: быстрые (до 2–3 дней), средние (до 1–2 недель) и крупные. Для каждой фичи укажи: какую проблему игрока она решает, место в текущем flow, необходимые UI/data/save/platform изменения, риски для спокойного positioning и монетизации, зависимости, минимальный MVP, analytics-события и критерий успеха. Не предполагай наличие backend, remote config, IAP, portrait gameplay, audio или archivePoints economy. Отдельно оцени конфликт 5-минутного таймера со спокойным positioning, качество retention-loop после прохождения 39 уровней и реальную ценность Daily/Collection. В конце дай приоритизированный backlog без дублирования уже реализованных механик.

Для code-level плана полезно дополнительно попросить нейросеть учитывать источники истины: `src/shared/store/gameStore.ts`, `src/shared/lib/progression.ts`, `src/entities/save/schema.ts`, `src/entities/level/schema.ts`, `src/content/*`, `src/screens/*`, `ANALYTICS_EVENTS.md`, `SAVE_SCHEMA.md` и `ARCHITECTURE.md`.
