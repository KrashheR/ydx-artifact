# Подключение метрик для Яндекс Игр

Файл гайда: `docs/YANDEX_METRICS_SETUP_GUIDE.md`.

## Самый короткий ответ

Да, подключить нужно, но **не через Консоль Яндекс Игр**.

Для кастомных игровых событий нужен отдельный сервис - **Яндекс Метрика**:

1. В Яндекс Метрике создаешь счетчик для игры.
2. Берешь номер счетчика, например `12345678`.
3. Перед сборкой игры передаешь этот номер в переменную `VITE_YANDEX_METRICA_ID`.
4. Собираешь архив игры.
5. В Метрике создаешь цели с именами вроде `aa_level_complete`.
6. Загружаешь архив в Консоль Яндекс Игр.

HTML-код счетчика вручную в `index.html` вставлять не нужно. В проекте уже есть код, который сам подключит Метрику, если при сборке указан `VITE_YANDEX_METRICA_ID`.

## Что где настраивается

| Что нужно | Где делать | Нужно ли уже лезть в код |
|---|---|---|
| Загрузка SDK Яндекс Игр | В коде игры, `index.html` | Уже сделано |
| `LoadingAPI.ready()` и `GameplayAPI.start()/stop()` | В сервисах игры | Уже сделано |
| Счетчик для продуктовых событий | В Яндекс Метрике | Нужно создать счетчик |
| ID счетчика | В переменной сборки `VITE_YANDEX_METRICA_ID` | Нужно указать перед build |
| Цели `aa_level_complete`, `aa_level_start` и т.д. | В Яндекс Метрике, раздел "Цели" | Нужно создать руками |
| Загрузка архива игры | В Консоли Яндекс Игр | Делается как обычный релиз |

## Что тебе нужно сделать один раз

### 1. Создать счетчик в Яндекс Метрике

1. Открой Яндекс Метрику: https://metrika.yandex.ru/
2. Нажми **Добавить счетчик**.
3. Название: `Anomaly Archive`.
4. Адрес сайта:
   - если игра уже опубликована: `https://yandex.ru/games/app/<APP_ID>`;
   - если `APP_ID` еще нет, можно временно указать будущий/тестовый адрес и потом исправить.
5. Сохрани счетчик.
6. Скопируй номер счетчика. Это число вида `12345678`.

### 2. Добавить ID счетчика в сборку

Самый удобный вариант - создать локальный файл `.env.production.local` в корне проекта:

```env
VITE_YANDEX_METRICA_ID=12345678
```

Где `12345678` - твой номер счетчика из Метрики.

Этот файл нужен только на твоем компьютере и не должен попадать в репозиторий, потому что это локальная настройка сборки.

Можно и без файла, одной командой в PowerShell:

```powershell
$env:VITE_YANDEX_METRICA_ID="12345678"
pnpm build
```

### 3. Собрать архив для Яндекс Игр

После того как ID счетчика задан:

```powershell
pnpm build
pnpm release:zip
```

На выходе должен получиться архив для загрузки в Яндекс Игры, обычно `dist-yandex.zip`.

### 4. Создать цели в Яндекс Метрике

Без целей события могут отправляться, но тебе будет неудобно смотреть нормальную воронку. Поэтому в Метрике нужно создать цели.

Для каждой цели:

1. Открой счетчик в Метрике.
2. Перейди в **Цели**.
3. Нажми **Добавить цель**.
4. Выбери тип **JavaScript-событие** или **Целевое событие**.
5. Условие: **совпадает**.
6. Идентификатор: например `aa_level_complete`.
7. Сохрани.

Для старта создай хотя бы эти цели:

```text
aa_game_ready
aa_level_start
aa_difference_found
aa_level_complete
aa_level_failed_timeout
aa_hint_revealed
aa_rewarded_hint_requested
aa_rewarded_hint_rewarded
aa_interstitial_open
aa_daily_reward_claimed
aa_review_native_sent
```

### 5. Загрузить игру в Консоль Яндекс Игр

В Консоли Яндекс Игр ничего специального для этих кастомных событий делать не нужно.

Там ты просто загружаешь архив игры как обычно. Главное, чтобы архив был собран с `VITE_YANDEX_METRICA_ID`.

### 6. Проверить, что все работает

Локально:

```powershell
$env:VITE_YANDEX_METRICA_ID="12345678"
$env:VITE_ANALYTICS_DEBUG="true"
pnpm dev
```

Потом открой игру, пройди кусок геймплея и в DevTools Console введи:

```js
window.__artifactAnalyticsEvents
```

Если видишь массив событий `game_ready`, `level_start`, `difference_found`, `level_complete`, значит внутренняя отправка работает.

После публикации:

1. Открой опубликованную игру.
2. Пройди один уровень.
3. Открой Метрику.
4. Подожди, данные могут появиться не мгновенно.
5. Проверь цели `aa_game_ready`, `aa_level_start`, `aa_level_complete`.

## Частые вопросы

### Нужно ли вставлять код Метрики в `index.html`?

Нет. Вручную вставлять HTML-сниппет Метрики не нужно.

В игре уже есть адаптер `src/services/analytics/analytics.ts`. Он сам загрузит `https://mc.yandex.ru/metrika/tag.js`, если при сборке задан `VITE_YANDEX_METRICA_ID`.

### Нужно ли что-то включать в Консоли Яндекс Игр?

Для кастомных событий Метрики - нет.

Консоль Яндекс Игр нужна для загрузки архива, проверки SDK, рекламы, модерации и платформенных событий. Продуктовые цели `aa_level_complete` и похожие создаются в Яндекс Метрике.

### Нужно ли создавать цель на каждый уровень?

Нет. Не создавай `aa_level_1_complete`, `aa_level_2_complete` и так далее.

Создай одну цель `aa_level_complete`, а номер уровня уже уходит внутри payload как `levelId` и `levelOrder`.

### Что будет, если забыть `VITE_YANDEX_METRICA_ID`?

Игра будет работать, но в Метрику ничего не отправит. События останутся только в локальном debug-буфере `window.__artifactAnalyticsEvents`.

### Как понять, что я собрал игру правильно?

После сборки с ID счетчика в браузерной вкладке Network должны появляться запросы к `mc.yandex.ru`, когда игра отправляет события.

## Полная таблица целей для Яндекс Метрики

В Яндекс Метрике заводи цель так:

- тип цели: **JavaScript-событие** или **Целевое событие**;
- условие: **совпадает**;
- идентификатор: значение из колонки **Идентификатор цели**.

В поле названия цели можно вставлять человекочитаемое название из первой колонки.

| Нормальное название цели | Идентификатор цели |
|---|---|
| Открытие игры | `aa_game_open` |
| Сохранение загружено | `aa_save_loaded` |
| Игра готова | `aa_game_ready` |
| Просмотр экрана | `aa_screen_view` |
| Настройки открыты | `aa_settings_opened` |
| Настройки закрыты | `aa_settings_closed` |
| Язык изменен | `aa_settings_language_changed` |
| Кампания выбрана | `aa_campaign_selected` |
| Клик по закрытой кампании | `aa_locked_campaign_clicked` |
| Клик по карточке уровня | `aa_level_card_clicked` |
| Прогресс кампании | `aa_campaign_progress` |
| Старт уровня | `aa_level_start` |
| Отличие найдено | `aa_difference_found` |
| Ошибочный клик на уровне | `aa_level_misclick` |
| Подсказка показана | `aa_hint_revealed` |
| Лупы потрачены | `aa_magnifiers_spent` |
| Проигрыш по таймеру | `aa_level_failed_timeout` |
| Время уровня продлено | `aa_level_time_extended` |
| Повтор уровня | `aa_level_retry` |
| Выход с уровня на карту | `aa_level_exit_to_map` |
| Клик по следующему уровню | `aa_level_next_clicked` |
| Уровень завершен | `aa_level_complete` |
| Старт daily-уровня | `aa_daily_start_clicked` |
| Daily-награда получена | `aa_daily_reward_claimed` |
| Оффер rewarded-подсказки открыт | `aa_rewarded_hint_offer_opened` |
| Rewarded-подсказка запрошена | `aa_rewarded_hint_requested` |
| Rewarded-подсказка выдала награду | `aa_rewarded_hint_rewarded` |
| Rewarded-подсказка закрыта без награды | `aa_rewarded_hint_closed` |
| Rewarded-подсказка не загрузилась | `aa_rewarded_hint_failed` |
| Interstitial подходит по условиям | `aa_interstitial_eligible` |
| Interstitial запрошен | `aa_interstitial_request` |
| Interstitial открыт | `aa_interstitial_open` |
| Interstitial закрыт | `aa_interstitial_close` |
| Interstitial ошибка | `aa_interstitial_error` |
| Review prompt доступен | `aa_review_prompt_eligible` |
| Review prompt показан | `aa_review_prompt_shown` |
| Review prompt: нажата оценка | `aa_review_prompt_review_clicked` |
| Review prompt: нажато позже | `aa_review_prompt_later_clicked` |
| Review prompt закрыт | `aa_review_prompt_closed` |
| Native review запрошен | `aa_review_native_requested` |
| Native review отправлен | `aa_review_native_sent` |
| Native review закрыт без отправки | `aa_review_native_closed` |
| Native review недоступен | `aa_review_native_unavailable` |
| Native review ошибка | `aa_review_native_error` |

Если не хочется заводить все 44 цели сразу, начни с минимального набора:

```text
aa_game_ready
aa_level_start
aa_difference_found
aa_level_complete
aa_level_failed_timeout
aa_hint_revealed
aa_rewarded_hint_requested
aa_rewarded_hint_rewarded
aa_interstitial_open
aa_daily_reward_claimed
aa_review_native_sent
```

## Автоматическое создание целей через скрипт

Цели можно не заводить руками. В проекте есть команда:

```powershell
pnpm metrika:goals
```

По умолчанию команда работает безопасно: она делает **dry-run**, то есть только показывает, каких целей не хватает. Реально создать цели она сможет только с флагом `--apply`.

### 1. Что нужно для скрипта

Нужно две вещи:

1. ID счетчика Метрики.
2. OAuth-токен Яндекса с доступом на запись в Метрику.

ID счетчика - это число вида `12345678`.

OAuth-токен нужен, потому что скрипт обращается к Management API Метрики и создает цели от твоего имени.

### 2. Как сохранить настройки локально

Создай в корне проекта файл `.env.metrica.local`:

```env
YANDEX_METRICA_COUNTER_ID=12345678
YANDEX_OAUTH_TOKEN=твой_oauth_токен
```

Этот файл не должен попадать в git. Он уже закрыт правилом `.env*.local` в `.gitignore`.

Можно не создавать файл и передать переменные через PowerShell:

```powershell
$env:YANDEX_METRICA_COUNTER_ID="12345678"
$env:YANDEX_OAUTH_TOKEN="твой_oauth_токен"
pnpm metrika:goals
```

### 3. Как получить правильный OAuth-токен

Ошибка `403 Access is denied` почти всегда означает одно из трех:

1. OAuth-приложение создано без прав Метрики.
2. Токен выпущен до того, как ты добавил права Метрики.
3. Токен выпущен под Яндекс-аккаунтом, у которого нет доступа к счетчику.

Правильный путь:

1. Открой https://oauth.yandex.ru/client/new
2. Выбери тип приложения **Для доступа к API или отладки**.
3. Заполни название, например `Anomaly Archive Metrica Goals`.
4. В блоке доступов найди Яндекс Метрику.
5. Обязательно включи два доступа:
   - `metrika:read` - чтение счетчиков и целей;
   - `metrika:write` - изменение счетчиков, создание целей.
6. Создай приложение.
7. Скопируй `ClientID`.
8. Проверь, что приложение реально имеет нужные права:

```text
https://oauth.yandex.ru/client/<CLIENT_ID>/info
```

Вместо `<CLIENT_ID>` подставь свой ClientID. В списке доступов должны быть `metrika:read` и `metrika:write`.

9. Открой ссылку выдачи токена:

```text
https://oauth.yandex.ru/authorize?response_type=token&client_id=<CLIENT_ID>&scope=metrika:read%20metrika:write&force_confirm=yes
```

10. Войди именно в тот Яндекс-аккаунт, который владеет счетчиком Метрики или имеет доступ на редактирование счетчика.
11. Разреши доступ.
12. Скопируй новый OAuth-токен.
13. Сохрани его в `.env.metrica.local`:

```env
YANDEX_METRICA_COUNTER_ID=110340617
YANDEX_OAUTH_TOKEN=сюда_новый_токен
```

Токен нельзя выкладывать в репозиторий, отправлять в чат или вставлять в клиентский код игры.

Важно: если ты сначала создал OAuth-приложение без `metrika:write`, потом добавил права, старый токен не обновится сам. Нужно открыть ссылку авторизации заново и выпустить новый токен.

Если счетчик создан на другом аккаунте, зайди в Метрику под аккаунтом-владельцем и добавь текущий аккаунт в доступы счетчика с правом редактирования. Для API управления недостаточно просто иметь чужой ClientID: права проверяются по владельцу токена.

### 4. Проверить, что скрипт видит цели

Сначала запусти без создания:

```powershell
pnpm metrika:goals
```

Если все настроено, скрипт покажет примерно:

```text
Counter: 12345678
Already exists: 0
Missing: 44
Dry run. Add --apply to create missing goals:
...
```

### 5. Создать отсутствующие цели

Когда dry-run выглядит правильно:

```powershell
pnpm metrika:goals -- --apply
```

Важно: двойной дефис `--` нужен, чтобы `pnpm` передал флаг `--apply` внутрь скрипта.

Скрипт:

- читает существующие цели из счетчика;
- сравнивает их по идентификатору `aa_...`;
- создает только отсутствующие;
- не удаляет и не переименовывает уже существующие цели.

### 6. Просто вывести список целей

Если нужен только список "название -> идентификатор":

```powershell
pnpm metrika:goals -- --list
```

### 7. Частые ошибки скрипта

`Set YANDEX_METRICA_COUNTER_ID or VITE_YANDEX_METRICA_ID.`

Не указан ID счетчика. Добавь `YANDEX_METRICA_COUNTER_ID` в `.env.metrica.local`.

`No YANDEX_OAUTH_TOKEN found.`

Не указан OAuth-токен. Добавь `YANDEX_OAUTH_TOKEN` в `.env.metrica.local`.

`401 Unauthorized`

Токен неправильный, истек или создан без доступа к Метрике.

`403 Forbidden`

Проверь по чеклисту:

1. В `.env.metrica.local` указан правильный счетчик:

```env
YANDEX_METRICA_COUNTER_ID=110340617
```

2. OAuth-приложение имеет оба scope: `metrika:read` и `metrika:write`.
3. Токен выпущен заново после добавления этих scope.
4. Токен выпущен под аккаунтом, у которого есть доступ к счетчику `110340617`.
5. Если счетчик принадлежит другому аккаунту, этот аккаунт должен выдать тебе доступ на редактирование счетчика.

Актуально на 2026-07-02.

В проекте есть два разных слоя метрик:

1. **Платформенная разметка Яндекс Игр** через SDK: `LoadingAPI.ready()` и `GameplayAPI.start()/stop()`. Она уже подключена и нужна для модерации, рекомендаций и базовых метрик в Консоли разработчика Яндекс Игр.
2. **Продуктовая аналитика игры** через Яндекс Метрику: кастомные события вроде `level_start`, `difference_found`, `level_complete`, `rewarded_hint_rewarded`. Именно она нужна, чтобы смотреть воронку геймплея и качество уровней.

Кастомные события не настраиваются в Консоли Яндекс Игр. Для них нужен отдельный счетчик Яндекс Метрики.

## Что уже сделано в коде

- `src/services/analytics/analytics.ts` опционально подключает счетчик Метрики, только если при сборке задан `VITE_YANDEX_METRICA_ID`.
- `src/services/analytics/analytics.ts` отправляет события как JavaScript-цели:

```ts
ym(counterId, "reachGoal", "aa_level_complete", payload);
```

- Без `VITE_YANDEX_METRICA_ID` игра ничего наружу не отправляет, но пишет события в `window.__artifactAnalyticsEvents`.
- Все события описаны в `ANALYTICS_EVENTS.md`.

## Шаг 1. Проверить SDK Яндекс Игр

Для публикации архивом на сервер Яндекса в `index.html` должен быть относительный SDK path:

```html
<script src="/sdk.js"></script>
```

В этом проекте он уже стоит.

После загрузки первого интерактивного экрана проект вызывает:

- `ysdk.features.LoadingAPI.ready()`
- `ysdk.features.GameplayAPI.start()` при активном геймплее
- `ysdk.features.GameplayAPI.stop()` при завершении/паузе/рекламе/выходе

Проверка в Яндекс Играх:

1. Загрузить build в Консоль разработчика.
2. Открыть игру с debug-панелью из Консоли или добавить `debug-mode=16` к URL.
3. Убедиться, что SDK инициализируется, а Game Ready уходит после появления интерактивного home screen.

## Шаг 2. Создать счетчик Яндекс Метрики

1. Открыть Яндекс Метрику.
2. Создать новый счетчик.
3. В поле сайта указать URL игры после публикации, например `https://yandex.ru/games/app/<APP_ID>`.
4. Скопировать номер счетчика.

Для dev-сборок можно использовать тот же счетчик, но лучше создать отдельный счетчик `Anomaly Archive Dev`, чтобы тестовые клики не смешивались с продом.

## Шаг 3. Собрать игру с ID счетчика

PowerShell:

```powershell
$env:VITE_YANDEX_METRICA_ID="12345678"
pnpm build
pnpm release:zip
```

Где `12345678` - номер счетчика Метрики.

Локальная проверка с консольным логом:

```powershell
$env:VITE_YANDEX_METRICA_ID="12345678"
$env:VITE_ANALYTICS_DEBUG="true"
pnpm dev
```

В браузере можно проверить буфер:

```js
window.__artifactAnalyticsEvents
```

## Шаг 4. Создать цели в Метрике

В Метрике:

1. Открыть счетчик.
2. Перейти в **Цели**.
3. Нажать **Добавить цель**.
4. Выбрать тип **Целевое событие / JavaScript-событие**.
5. Для условия выбрать **совпадает**.
6. Вставить идентификатор цели, например `aa_level_complete`.
7. Сохранить.

Рекомендуемые цели для старта:

| Цель в Метрике | Что показывает |
|---|---|
| `aa_game_ready` | Игра дошла до первого интерактивного экрана. |
| `aa_level_start` | Игрок начал уровень. |
| `aa_difference_found` | Игрок нашел отличие. |
| `aa_level_complete` | Игрок прошел уровень. |
| `aa_level_failed_timeout` | Игрок проиграл по таймеру. |
| `aa_hint_revealed` | Игрок использовал подсказку. |
| `aa_rewarded_hint_requested` | Игрок запросил rewarded-рекламу за подсказку. |
| `aa_rewarded_hint_rewarded` | Rewarded-реклама выдала награду. |
| `aa_interstitial_open` | Открылась полноэкранная реклама. |
| `aa_daily_reward_claimed` | Daily награда получена. |
| `aa_review_native_sent` | Игрок отправил отзыв/оценку через native flow. |

Не создавай отдельную цель под каждый `levelId` или `differenceId`: у Метрики есть лимит целей на счетчик, а детализация уже уходит в payload события.

## Шаг 5. Что смотреть после публикации

Минимальная продуктовая воронка:

```text
aa_game_ready
-> aa_level_start
-> aa_difference_found
-> aa_level_complete
-> aa_level_start с levelOrder=2
-> aa_level_complete с completedLevels=3
-> aa_daily_reward_claimed
```

Качество уровней:

- `aa_level_complete`: `durationSeconds`, `accuracy`, `mistakes`, `levelId`
- `aa_level_failed_timeout`: где игроки не успевают
- `aa_hint_revealed`: какие уровни чаще требуют подсказку
- `aa_difference_found`: порядок и время нахождения отличий
- `aa_level_exit_to_map`: где игроки уходят до завершения

Монетизация без вреда для геймплея:

- `aa_rewarded_hint_requested` -> `aa_rewarded_hint_rewarded`
- `aa_interstitial_open` после `completedLevels=3,6,9...`
- сравнивать `level_complete` до/после рекламы, чтобы не ломать retention

## Шаг 6. Проверка перед релизом

1. Собрать с `VITE_YANDEX_METRICA_ID`.
2. Запустить `pnpm build`.
3. Открыть preview/dev build и пройти один уровень.
4. В консоли проверить `window.__artifactAnalyticsEvents`.
5. В Network проверить запросы к `mc.yandex.ru`.
6. В Метрике проверить, что цели начали получать данные. Обычно это появляется не мгновенно.
7. Загрузить `dist-yandex.zip` в Консоль Яндекс Игр и открыть игру с debug-панелью.

## Важные ограничения

- Не отправлять персональные данные, Yandex user ID, email, имя, полный save, purchase token.
- Не отправлять событие на каждый frame/pointer move.
- Не создавать сотни целей в Метрике. События уровней анализировать через payload.
- Если счетчик не задан, игра должна оставаться полностью рабочей и проходить модерацию.

## Ссылки

- Yandex Games SDK connection: https://yandex.ru/dev/games/doc/ru/sdk/sdk-about
- Yandex Games LoadingAPI/GameplayAPI: https://yandex.ru/dev/games/doc/ru/sdk/sdk-game-events
- Yandex Games SDK events: https://yandex.ru/dev/games/doc/ru/sdk/sdk-events
- Yandex Metrica JavaScript goal event: https://yandex.ru/support/metrica/ru/general/goal-js-event
- Yandex Metrica `reachGoal`: https://yandex.ru/support/metrica/ru/objects/reachgoal
