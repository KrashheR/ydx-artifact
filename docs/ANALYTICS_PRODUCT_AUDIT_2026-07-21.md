# Продуктовый аудит аналитики Anomaly Archive

Дата аудита: 2026-07-21  
Область: Яндекс Игры, Яндекс Метрика, gameplay-воронка, контент, retention, реклама, качество данных  
Цель: понять, достаточно ли текущей аналитики, чтобы после релиза решить, что исправлять, стоит ли развивать игру и стоит ли делать продолжение в другом сеттинге.

## Executive summary

**Короткий ответ: базовая аналитика уже хорошая для MVP, но для инвестиционного решения о продолжении покрытия пока недостаточно.**

Сейчас можно увидеть:

- запуск игры и достижение первого интерактивного экрана;
- старты, прохождения, таймауты, подсказки, ошибки кликов и явные выходы по каждому уровню;
- порядок и время нахождения каждого отличия;
- движение по кампаниям;
- воронки rewarded/interstitial-рекламы, daily и запроса оценки.

Но сейчас нельзя надежно ответить на наиболее важные вопросы:

- точная доля бросивших каждую попытку и причина бросания;
- сколько игроков потеряно на onboarding до реального gameplay;
- нравится ли конкретный сеттинг, а не просто доступен ли он игроку;
- ушел ли игрок из-за сложности сцены, плохого управления, загрузки, save-проблемы или рекламы;
- улучшила ли конкретная версия контента метрики;
- связаны ли подсказки, ретраи и исход уровня в рамках одной попытки.

Главная причина — отсутствует сущность **попытки уровня**: нет `attemptId`, нет единого `level_attempt_end` с взаимоисключающим исходом и нет надежного события для закрытия/фонового ухода. В текущем виде старты минус завершения дают только грубую оценку abandonment.

### Итоговая оценка

| Область | Оценка | Вывод |
|---|---:|---|
| Базовая gameplay-воронка | 7/10 | Старты и прохождения есть, но попытки не связаны |
| Диагностика сложности уровней | 6/10 | Есть время, ошибки и подсказки; нет корректной попытки, zoom и контекста misclick |
| Точное определение drop-off | 3/10 | Явный выход виден, закрытие вкладки и незавершенная попытка — нет |
| Onboarding/activation | 2/10 | Есть только позднее `first_run_onboarding_started`, нет impression/complete |
| Retention | 6/10 | Общий D1 и время даст Консоль Яндекс Игр; связать retention с игровым опытом трудно |
| Предпочтения сеттингов/контента | 3/10 | Клики есть, но нет корректного exposure denominator и прямого сигнала предпочтения |
| Монетизация | 7/10 | Технические рекламные воронки хорошие; нет эксперимента для оценки вреда retention |
| Техническое качество | 2/10 | Нет save/error/asset/performance telemetry на уровне продукта |
| Операционная готовность | 6/10 | Счетчик и 44 цели созданы, но release-gate и контроль схемы отсутствуют |
| Готовность принять решение о сиквеле | 4/10 | Сначала нужны P0-правки и минимум 14 дней чистых данных |

**Рекомендация:** не откладывать soft launch, но до направления заметного трафика закрыть P0 ниже. Текущие данные пригодны для первичной диагностики; без P0 велик риск принять решение о продолжении на искаженной воронке.

## Что было проверено

- Runtime-адаптер: `src/services/analytics/analytics.ts`.
- Все вызовы `trackAnalyticsEvent()` в `src/`.
- Gameplay/store-события: `src/shared/store/gameStore.ts`, `src/screens/GameScreen.tsx`.
- Навигация, кампании, daily и коллекция.
- Контракт `ANALYTICS_EVENTS.md`.
- Sync целей: `scripts/sync-metrica-goals.ts`.
- Production-конфигурация без раскрытия значений секретов.
- Фактическое состояние целей командой `pnpm metrika:goals`.
- Актуальные официальные возможности Яндекс Игр и Яндекс Метрики.

Подтверждено:

- в runtime есть **54 статических имени событий плюс 3 динамических исхода rewarded**, итого 57 возможных типов;
- sync-скрипт содержит **44 цели**;
- production ID счетчика присутствует и имеет числовой формат;
- все 44 цели из sync-скрипта уже созданы в счетчике (`Already exists: 44`, `Missing: 0`);
- отправка идет через `ym(counterId, "reachGoal", "aa_<event>", payload)`;
- без ID счетчика события остаются только в локальном буфере последних 100 событий.

## Что уже можно измерять

### 1. Основная воронка

Можно построить:

```text
game_open
→ save_loaded
→ game_ready
→ level_start
→ first difference_found
→ level_complete
→ level_next_clicked
→ level_start следующего уровня
```

Для уровня доступны `levelId`, `campaignId`, `levelOrder`, `mode`, replay-флаг, число найденных отличий, ошибки, active time, accuracy и прогресс кампании.

### 2. Сложность уровня

Уже есть полезные прокси:

- `level_complete / level_start`;
- таймауты;
- явные выходы на карту;
- ретраи;
- медиана и распределение времени;
- число misclick;
- доля использования подсказки;
- порядок нахождения отличий;
- время до нахождения конкретного отличия.

Этого достаточно, чтобы находить грубые аномалии: например, уровень с высокой долей таймаутов, подсказок и низкой completion-конверсией.

### 3. Реклама и review flow

Rewarded-воронка покрыта от оффера до результата, interstitial — от eligibility до open/close/error. Это хороший фундамент для контроля технической доступности рекламы.

Review flow также покрыт подробно, но `review_native_sent` означает факт отправки, а не оценку или содержание отзыва. Качественные причины недовольства все равно нужно брать из отзывов в Консоли Яндекс Игр и собственной таксономии отзывов.

### 4. Общие platform-метрики

Консоль Яндекс Игр уже дает игроков, новых игроков, время играния, время на игрока, конверсию по длительности сессии, D1, retention второй недели/месяца, Game Ready и TTI. Рейтинг игры формируется ориентировочно через две недели и не считается при дневной аудитории меньше 10 игроков. Это важно использовать как второй слой поверх кастомных gameplay-событий. См. [официальное описание метрик Яндекс Игр](https://yandex.ru/dev/games/doc/ru/concepts/metric).

## Матрица продуктовых вопросов

| Вопрос после релиза | Что есть сейчас | Достаточно? | Что добавить |
|---|---|---:|---|
| Доходит ли игрок до gameplay? | `game_ready`, ранний `level_start` | Нет | onboarding impression/start/complete и first gameplay interaction |
| На каком уровне бросают? | start, complete, timeout, explicit exit | Частично | attempt ID, единый outcome, resume и passive abandonment |
| Какой уровень слишком сложный? | duration, accuracy, hints, misclicks, timeout | Частично | корректное время, hints per attempt, zoom/scheme, attempt outcome |
| Какое отличие плохое? | find order/time, hint по `differenceId` | Частично | hint-assisted flag, nearby misclick bucket, zoom state |
| Какой сеттинг нравится? | campaign click/progress/report | Слабо | card impressions, eligible exposure, campaign entry/finish, survey |
| Почему игрок ушел? | только часть gameplay-прокси | Нет | технические ошибки, optional exit reason, отзывы/опрос |
| Работает ли daily на возврат? | start/reward и общий D1 | Частично | true consecutive streak, exposure, D1/D7 cohort by daily usage |
| Вредит ли реклама? | ad funnel и следующий level start | Частично | experiment/variant и контрольная группа |
| Стоит ли чинить текущую игру? | ранняя воронка и level quality proxies | После P0 | техническая телеметрия и чистая попытка |
| Стоит ли делать сиквел? | общая retention и глубина | Нет | preference evidence, mature cohorts, clean post-fix period |

## Критические находки

### P0. Нет модели попытки уровня

`level_start` не создает `attemptId`. `level_retry` очищает прогресс, но не создает новый `level_start`. Таймаут, продление времени, completion и выход нельзя надежно собрать в одну попытку.

Последствия:

- start-to-complete нельзя честно считать на уровне попыток;
- retry rate и число попыток до прохождения искажены;
- невозможно гарантировать один terminal outcome на попытку;
- последовательность hint → difference → completion приходится восстанавливать эвристически;
- replay, resume и новая попытка смешиваются.

Нужны:

- `attemptId`, создаваемый при новой попытке;
- `attemptNumber` для пары player + level;
- отдельный `level_resume`;
- единый `level_attempt_end` с `outcome`:
  `completed`, `timeout`, `explicit_exit`, `background_abandon`, `restart`, `technical_error`;
- итоговые поля: active time, wall time, found, hints, misclicks, rewarded use, compare scheme.

### P0. Реальный abandonment не наблюдается

`level_exit_to_map` отправляется только при явном нажатии кнопки выхода. На `pagehide` и `visibilitychange` вызывается сохранение, но аналитического terminal event нет (`src/app/App.tsx:235-243`, `src/screens/GameScreen.tsx:496-507`).

Поэтому игрок, который закрыл вкладку, перезагрузил iframe или ушел со страницы, выглядит как незавершенный start без причины. Текущий workaround — считать `started but no terminal event and no resume within 24h`, но для этого все равно нужен стабильный `attemptId`.

### P0. Onboarding-воронка искажена

Для нового игрока `level_start` отправляется до показа onboarding (`src/shared/store/gameStore.ts:243-262`). Событие `first_run_onboarding_started` отправляется только после нажатия кнопки «Начать расследование» (`src/screens/GameScreen.tsx:1192-1200`).

То есть текущий `level_start` не означает начало gameplay, а onboarding bounce увеличивает старты первого уровня. Нет событий:

- `onboarding_impression`;
- `onboarding_start_clicked`;
- `onboarding_completed` или `first_difference_found` как activation milestone;
- `onboarding_abandoned`.

### P0. Время прохождения не является точным active time

При продлении времени из накопленного `elapsedActiveSeconds` вычитается 30 секунд (`src/screens/GameScreen.tsx:1177-1189`). Completion получает это уменьшенное значение (`src/screens/GameScreen.tsx:795-803`). Документация при этом называет `durationSeconds` точным активным временем.

Следствие: игроки, использовавшие продление, искусственно выглядят быстрее, а duration buckets и сравнение сложности искажены.

Нужно разделить:

- монотонный `activeDurationSeconds`;
- отдельный `timerRemainingSeconds` или `timeGrantedSeconds`;
- `wallDurationSeconds` при необходимости.

### P0. Hint-результаты нельзя надежно интерпретировать

В сохраненный результат всегда записывается `hintsUsed: 0`, а seal `no-intervention` добавляется без проверки (`src/shared/store/gameStore.ts:350-361`). В `level_complete` число подсказок также отсутствует.

Даже если `hint_revealed` был отправлен, без `attemptId` его нельзя безопасно связать с конкретным completion. Это одновременно проблема аналитики и пользовательского результата уровня.

### P0. Нет данных, чтобы отделить плохой контент от технической проблемы

В проектной спецификации перечислены SDK init, save load, scene decode, FPS, asset failure, long tasks и unhandled errors, но в runtime таких продуктовых событий нет.

Особенно критично:

- ошибка save write ловится и переводит статус в local-only без аналитического события (`src/shared/store/gameStore.ts:203-214`);
- preload изображения намеренно резолвится и при ошибке;
- нет scene load/decode duration;
- нет `window.error` / `unhandledrejection` с безопасным fingerprint;
- нет технического outcome попытки.

Без этого провал уровня на mobile можно ошибочно принять за плохой дизайн отличий.

### P0. Release может молча выйти без продуктовой аналитики

Если `VITE_YANDEX_METRICA_ID` отсутствует или некорректен, приложение штатно продолжает работу и ничего наружу не отправляет (`src/services/analytics/analytics.ts:61-64`, `132-143`). Это разумный runtime fallback, но release pipeline не имеет обязательного analytics gate.

Перед релизом нужен CI/release-check:

1. production ID присутствует и числовой;
2. build содержит ID/инициализацию счетчика;
3. все обязательные события существуют в goal registry;
4. actual event names = typed registry = docs = sync list;
5. smoke session появилась в тестовом/production-счетчике.

## Существенные P1-проблемы

### 1. 13 runtime-событий отсутствуют в sync-списке целей

Не зарегистрированы как цели:

```text
artifact_toast_shown
artifact_unlock_collection_clicked
artifact_unlock_continue_clicked
artifact_unlock_modal_shown
artifact_unlock_queued
campaign_report_cta_clicked
campaign_report_shown
collection_artifact_viewed
collection_opened
collection_replay_level_clicked
daily_opened
first_run_onboarding_started
settings_comparator_scheme_changed
```

Метод `reachGoal` ожидает идентификатор цели, настроенный в счетчике. Поэтому эти вызовы не следует считать надежно доступными как goal conversions до синхронизации. См. [документацию `reachGoal`](https://yandex.ru/support/metrica/ru/objects/reachgoal) и [целевых событий](https://yandex.ru/support/metrica/ru/general/goal-js-event).

Корневая причина — `trackAnalyticsEvent(event: string, payload)` не имеет типизированного реестра, а список целей и документация поддерживаются отдельно.

### 2. Нет `contentVersion` и уникальной версии сборки

В общий payload входят schema, session, timestamp, viewport-based device type, platform mode и game version. `contentVersion` отсутствует. В production-конфигурации не задан `VITE_APP_VERSION`, поэтому используется fallback `0.1.0`; `VITE_PLATFORM_MODE` также не задан и остается `auto`.

После замены hitbox, сцены или сложности сравнение «до/после» будет смешивать версии. Нужны immutable `buildId` и `contentVersion` в каждом событии.

### 3. Device type ошибается на landscape mobile

`deviceType` определяется только по `window.innerWidth`: до 768 — mobile, до 1280 — tablet. Телефон в landscape с шириной 800–900 px попадет в tablet, хотя игра как раз требует landscape на mobile.

Для анализа использовать стандартное устройство Яндекс Метрики/Яндекс Игр или SDK/UA-derived category, а viewport хранить отдельно.

### 4. Нет game locale как общего измерения

Язык игры присутствует лишь в отдельных событиях. Browser/platform language Метрики не равен выбранной локали игры. `locale` должен быть общим полем всех событий.

### 5. Высокая кардинальность и лимиты параметров Метрики

Каждый `reachGoal` отправляет уникальный ISO timestamp и ряд динамических значений. `level_misclick` отправляется на каждый ошибочный клик. В длинной сессии это создает риск приблизиться к лимиту параметров визита: до 512 параметров и их значений; общий лимит событий визита — 1000. См. [официальные лимиты Метрики](https://yandex.ru/support/metrica/ru/general/limits).

Рекомендация:

- не передавать клиентский ISO timestamp как goal parameter — Метрика уже фиксирует время события;
- не дублировать имя event внутри параметров, если оно уже в goal;
- агрегировать misclick в attempt summary;
- для диагностики координат отправлять ограниченную выборку и безопасные buckets, а не каждый tap;
- контролировать число уникальных значений за визит.

### 6. Нет корректного exposure denominator для сеттингов

Есть `campaign_selected`, но нет impression видимых карточек. Кампании открываются последовательно, поэтому сравнение сырых кликов или completion между северным, песчаным и изумрудным сеттингами даст survivorship bias: до поздней кампании доходят самые вовлеченные игроки.

Нужны:

- `campaign_card_impression` с status/position;
- `campaign_unlocked`;
- `campaign_entered`;
- `campaign_first_level_completed`;
- `campaign_completed`;
- расчет только среди игроков, которым кампания была доступна и показана.

### 7. Daily `streak` — не последовательная серия дней

В коде streak увеличивается при любой новой дате, без проверки, что предыдущий claim был вчера (`src/shared/store/gameStore.ts:379-385`, `555-570`). Это cumulative claim count, а не consecutive streak. Использовать его как меру удержания нельзя, пока семантика не исправлена или поле не переименовано.

### 8. Production analytics debug включен

В `.env.production.local` включен `VITE_ANALYTICS_DEBUG=true`, поэтому production build пишет каждый event в console. Перед релизом лучше выключить: это не ломает сбор, но создает шум и раскрывает внутреннюю схему событий в пользовательской консоли.

## Как сейчас оценить drop-off, если релизить немедленно

До внедрения attempt model использовать только осторожную level-воронку по уникальным посетителям:

1. Фильтр: `mode=campaign`, `isReplay=false`.
2. Для каждого уровня считать уникальных посетителей с `level_start`.
3. Считать уникальных посетителей с `level_complete`.
4. Отдельно показывать `level_failed_timeout`, `level_exit_to_map`, `level_retry`, `hint_revealed`.
5. Для перехода дальше считать `level_complete(N) → level_start(N+1)`.
6. Первый уровень анализировать отдельно, потому что start происходит до onboarding.
7. Не называть `1 - completes / starts` точным abandonment; это **unresolved start rate**.

Яндекс Метрика автоматически присваивает браузеру анонимный ClientID; его можно использовать в группировках и Logs API, не отправляя Yandex profile ID. Разные браузеры остаются разными ClientID. См. [ClientID/UserID](https://yandex.ru/support/metrica/ru/general/clientid-userid) и [поля визитов Logs API](https://yandex.ru/dev/metrika/ru/logs/fields/visits).

Для глубокой событийной аналитики лучше ежедневно выгружать обезличенные данные через Logs API: он дает неагрегированные таблицы визитов и событий за предыдущий день. См. [Logs API](https://yandex.ru/support/metrica/ru/uploading-data/logs-api). Параметры целей можно оперативно смотреть в стандартном [отчете «Параметры целей»](https://yandex.ru/support/metrica/ru/reports/goal-params).

## Рекомендуемый минимальный контракт событий

### Общие поля

```text
schemaVersion
eventId
anonymousInstallId или Metrica ClientID из выгрузки
sessionId
eventSequence
eventTime
buildId
gameVersion
contentVersion
environment
locale
platformDeviceType
viewportWidth / viewportHeight
experimentId / variant (если применимо)
```

Не использовать имя, email, Yandex profile ID, полный save или raw stack trace.

### Activation

```text
game_open
game_ready
onboarding_impression
onboarding_start_clicked
onboarding_first_interaction
onboarding_completed
```

Activation milestone для этой игры лучше определить как первое честно найденное отличие, а onboarding completion — как завершение первого уровня или отдельного обучающего шага.

### Level attempt

```text
level_attempt_start
level_resume
difference_found
hint_revealed
level_attempt_end
```

`level_attempt_end`:

```json
{
  "attemptId": "uuid",
  "levelId": "...",
  "outcome": "completed | timeout | explicit_exit | background_abandon | restart | technical_error",
  "activeDurationSeconds": 123,
  "wallDurationSeconds": 150,
  "foundDifferences": 4,
  "requiredDifferences": 5,
  "misclicks": 7,
  "hintsUsed": 1,
  "rewardedHintsUsed": 0,
  "timeExtensionsUsed": 1,
  "compareScheme": "...",
  "isReplay": false
}
```

### Content preference

```text
campaign_card_impression
campaign_entered
campaign_first_level_completed
campaign_completed
campaign_report_action
collection_opened
artifact_viewed
```

### Quality

```text
save_load_result
save_write_failed
scene_load_result
game_ready_timing
fatal_error
performance_sample
```

Ошибки дедуплицировать по безопасному fingerprint; performance собирать sampling-ом, а не на каждый frame.

## Дашборды перед soft launch

### Dashboard 1. Acquisition and activation

- новые игроки;
- Conversion To Play и duration buckets из Консоли Яндекс Игр;
- `game_open → game_ready`;
- onboarding impression → start → first difference → L1 complete;
- срезы: platform device, locale, source/new user.

### Dashboard 2. Level health

Строка = level, колонки:

- eligible players;
- unique starts;
- completion rate;
- unresolved start rate;
- explicit exit, timeout, retry;
- median/P75/P90 active time;
- median misclicks;
- hint rate;
- next-level continuation;
- разница mobile/desktop.

### Dashboard 3. Difference health

- median/P90 time-to-find;
- find order;
- hint-assisted find rate;
- nearby misclick rate;
- completion impact;
- mobile/desktop и compare scheme.

### Dashboard 4. Retention and depth

- D1, week-2 retention и time per player из Яндекс Игр;
- deepest level in first session;
- reach L2/L3/L6/L13;
- campaign 1/2/3 entered/completed;
- D1 по deepest level, hint use, timeout и device.

### Dashboard 5. Ads and ratings

- rewarded offer → request → reward/error;
- interstitial eligible → open → close/error;
- `interstitial_close → next level start`;
- review prompt → native requested → sent;
- рейтинг и категории отзывов.

## Как решить «фиксить, развивать или делать сиквел»

### Не принимать решение по одному числу

Нужно одновременно смотреть четыре слоя:

1. **Core appeal:** время игры, L1/L3/L6 reach, completion и next-level continuation.
2. **Return value:** D1 и week-2 retention.
3. **Content quality:** нет ли отдельных cliff-уровней и bad differences.
4. **Player voice:** рейтинг, темы отзывов и прямой вопрос о желаемом сеттинге.

### Минимальное окно решения

- минимум 14 дней после релиза;
- D1-когорты должны полностью дозреть;
- после критичного фикса считать новое чистое окно отдельно;
- желательно не меньше 1000 новых игроков для общего решения; при меньшей выборке показывать confidence interval и сильнее опираться на отзывы/качественные тесты;
- поздние кампании оценивать только при достаточном числе eligible players.

### Scale / sequel

Сигналы:

- приемлемая activation-воронка и нет резкого провала после первого уровня;
- D1 и глубина не держатся только на небольшой группе hardcore игроков;
- игроки добровольно продолжают после рекламы и после завершения кампании;
- хотя бы один сеттинг имеет высокий entry/completion/continuation среди exposed eligible игроков;
- отзывы хвалят core loop, а основные жалобы локальны и исправимы;
- после завершения контента есть спрос на большее количество сцен/другой сеттинг.

Для выбора **нового сеттинга** одной поведенческой аналитики недостаточно. После кампании показывается короткий необязательный опрос из одного вопроса с четырьмя концептами и событием `setting_interest_selected`. Сопоставлять ответ с фактической глубиной и retention, не выдавая награду за конкретный вариант.

### Iterate current game

Сигналы:

- хорошие первые 3–5 минут и L1, но явный cliff на конкретных уровнях;
- mobile заметно хуже desktop;
- высокий hint/misclick концентрируется на нескольких differences;
- retention падает после рекламы или из-за daily/content cadence;
- отзывы называют исправимые причины: hitbox, масштаб, управление, перевод, загрузка.

Это лучший сценарий для точечных фиксов и controlled update, а не для отказа от концепта.

### Stop or reposition

Сигналы после исправления P0 и очевидных UX-багов:

- большинство новых игроков не доходит до первого честно найденного отличия;
- значительная доля игровых сессий остается короче 1 минуты;
- слабая L1/L2 continuation не объясняется техническими сбоями;
- D1 низкий во всех device/locale cohorts;
- отзывы отвергают сам core loop или качество визуального контента системно, а не отдельные сцены;
- разные сеттинги не меняют глубину и возврат.

## Приоритетный план

### До направления трафика: P0, ориентир 1–3 дня

1. Ввести `attemptId`, attempt number и единый terminal outcome.
2. Исправить active duration при продлении времени.
3. Добавить onboarding impression/start/activation/complete.
4. Передавать hints used в completion и исправить `no-intervention`.
5. Добавить build/content version, locale и корректный device source.
6. Добавить save/scene/error minimum telemetry.
7. Сделать typed event registry и автоматическое сравнение registry ↔ goals ↔ docs.
8. Добавить release smoke и запрет production build без счетчика для Yandex release mode.
9. Выключить analytics debug в production.

### Первая неделя после релиза

1. Проверять ingestion и объем событий ежедневно.
2. Собрать activation и level-health dashboards.
3. Исправлять только crashes, saves, blockers и очевидные hitbox/layout проблемы.
4. Вести taxonomy отзывов: core fun, unfair scene, controls, ads, performance, save, content amount, setting request.

### День 7–14

1. Выделить 3 худших уровня и 3 худших differences по нескольким сигналам одновременно.
2. Сравнить mobile/desktop и RU/EN.
3. Проверить влияние interstitial на continuation; при достаточной аудитории — controlled cadence experiment.
4. Оценить daily users против сопоставимой когорты, не делая причинный вывод без эксперимента.
5. Запустить короткий setting-interest survey после завершения кампании.

### После 14 дней

Принять одно из трех решений: scale/sequel, iterate current game или stop/reposition. Зафиксировать решение вместе с размером выборки, периодом, версиями build/content и таблицей метрик, чтобы не выбирать удобные показатели задним числом.

## Финальный вердикт

Текущая реализация — **хороший событийный фундамент, но не decision-grade система**. Для basic soft launch она пригодна: вы увидите воронку уровней, сложность, подсказки, рекламу и общий retention Яндекс Игр. Для ответа «на каком уровне и почему бросают» и тем более «делать ли продолжение в другом сеттинге» необходимо сначала закрыть attempt model, onboarding, корректность времени, versioning и technical telemetry.

Самая важная продуктовая мысль: **не измерять “любовь к сеттингу” сырыми кликами по кампании**. Поздние сеттинги видит отобранная вовлеченная аудитория. Нужен знаменатель exposed + eligible, completion/continuation и хотя бы один прямой preference-сигнал.

После этих правок игра будет хорошо подготовлена к выпуску как измеряемый продукт, а не просто как сборка с большим количеством событий.
