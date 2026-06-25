# Monetization, i18n and Yandex cloud-save specification

Версия: 1.0  
Дата фиксации: 2026-06-25

Этот документ является обязательным дополнением к `game_concept.json`.

При конфликте приоритет:

1. `game_concept.json`;
2. этот документ;
3. `02_CODEX_IMPLEMENTATION_PROMPT.md`;
4. остальные документы.

---

# 1. Монетизационная модель

## Цель

Монетизация должна окупать спокойную puzzle-игру, не создавая искусственных проигрышей, энергии, жизней или платных блокировок контента.

Основная модель:

- rewarded ads;
- аккуратно ограниченные interstitial;
- один non-consumable supporter pack;
- один consumable hint pack.

Sticky banner на запуске запрещён.

## Почему sticky banner отключён

Главный экран gameplay полностью занят сравнением фотографий. Баннер:

- уменьшает полезную площадь;
- ухудшает mobile readability;
- повышает риск случайного клика;
- конфликтует с эстетикой архива.

Sticky можно тестировать позднее только на карте или главном экране отдельным экспериментом.

---

# 2. Экономика луп

## Единственный расходуемый ресурс

`magnifiers` / «Лупы».

Лупы не являются обязательной валютой прогрессии. Игрок всегда может завершить уровень без них.

## Старт

Новый игрок получает 3 лупы.

## Расход

- «Ориентир» — 1 лупа;
- «Проявитель» — 2 лупы.

Баланс не может стать отрицательным.

## Бесплатные источники

- 1 лупа после первого прохождения уровней 3, 6, 9 и 12;
- streak day 1 — 1 лупа;
- streak day 2 — 2 лупы;
- добровольная post-level rewarded — 2 лупы;
- daily rewarded — удвоение magnifier-награды дня.

## Ограничения

- нельзя продавать обязательный доступ к следующему уровню;
- нельзя создавать уровень, который практически невозможно пройти без подсказки;
- нельзя обнулять лупы за ошибку;
- нельзя автоматически тратить лупы;
- каждое расходование требует явного действия.

---

# 3. Rewarded-реклама

## Placement: exact_hint

Точка входа: пользователь сам нажал «Проявитель» и выбрал рекламу.

Награда: раскрыть ровно одно ненайденное отличие.

Правила:

- заранее показать точную награду;
- одно активное рекламное обращение одновременно;
- при onRewarded выдать подсказку;
- onClose без onRewarded не выдаёт награду;
- onError возвращает игрока в уровень;
- состояние уровня не теряется;
- кнопка не остаётся бесконечно loading.

## Placement: post_level_bonus

Точка входа: экран результата первого прохождения уровня.

Награда: 2 лупы.

Правила:

- не показывать после tutorial;
- один раз на конкретный уровень;
- после получения кнопка заменяется состоянием «Получено»;
- отказ не мешает продолжить.

## Placement: daily_bonus

Точка входа: результат daily.

Награда: удвоить magnifier-награду daily.

Правила:

- один раз на серверную календарную дату;
- повторное прохождение не создаёт вторую награду;
- использовать Yandex server time;
- результат сохранять в cloud до закрытия result flow.

---

# 4. Interstitial-реклама

Запрашивать interstitial только на карте после логического завершения действия.

Все условия должны быть истинны:

- завершено минимум 4 уровня;
- текущая сессия длится минимум 8 минут;
- после прошлого interstitial прошло минимум 5 минут;
- после прошлого interstitial завершено минимум 2 уровня;
- пользователь находится на карте;
- нет purchase flow, save conflict, artifact reveal, daily result или chapter finale;
- entitlement `no_forced_ads` отсутствует.

Никогда не вызывать:

- внутри gameplay;
- при zoom/pan;
- перед первым действием;
- после tutorial;
- во время загрузки сцены;
- по `setInterval`;
- сразу после rewarded.

При `onOpen`:

- поставить gameplay/audio на pause;
- отключить input;
- сохранить локальную копию.

При `onClose` или `onError`:

- восстановить audio/input;
- вернуть пользователя на тот же экран;
- не менять награды и прогресс.

---

# 5. IAP-каталог

## Product: archive_supporter_pack

Тип: non-consumable.

Русское название: «Архивный набор».

Содержимое:

- entitlement `no_forced_ads`;
- 10 луп однократно;
- entitlement `exclusive_archive_frame`.

Описание должно ясно сообщать:

- принудительные внутриигровые объявления отключаются;
- добровольные rewarded-подсказки остаются;
- бонус луп выдаётся один раз.

Стартовая ценовая гипотеза в Developer Console: 99 единиц портальной валюты.

Это только гипотеза. UI обязан получать:

- title;
- description;
- price;
- priceCurrencyCode;
- currency icon

через `payments.getCatalog()`.

## Product: magnifiers_10

Тип: consumable.

Русское название: «Набор из 10 луп».

Содержимое: 10 луп.

Стартовая ценовая гипотеза: 29 единиц портальной валюты.

Порядок обработки:

1. `payments.purchase({ id: 'magnifiers_10' })`;
2. добавить grant в PlayerSave;
3. выполнить `player.setData(save, true)`;
4. обновить локальное зеркало;
5. только после подтверждённого сохранения вызвать `consumePurchase(token)`;
6. при ошибке consumption повторить обработку на следующем запуске без повторной выдачи.

Для защиты от двойной выдачи save хранит `processedPurchaseTokens` или эквивалентный idempotency ledger.

## Startup purchase recovery

На каждом запуске:

1. вызвать `payments.getPurchases()`;
2. восстановить non-consumable entitlements;
3. найти unprocessed consumables;
4. проверить idempotency ledger;
5. при необходимости выдать grant и сохранить cloud;
6. consume purchase;
7. логировать результат.

## No-ads semantics

После получения `no_forced_ads`:

- не вызывать in-game interstitial;
- не показывать sticky banner, если он появится в будущем;
- rewarded остаётся доступен только по желанию игрока;
- принудительный платформенный блок, не управляемый игрой, не имитировать и не учитывать как собственную рекламу.

---

# 6. Аналитика монетизации

События:

- monetization_offer_view;
- rewarded_request;
- rewarded_open;
- rewarded_reward_granted;
- rewarded_close_without_reward;
- rewarded_error;
- interstitial_eligible;
- interstitial_request;
- interstitial_open;
- interstitial_close;
- interstitial_error;
- shop_open;
- product_view;
- purchase_start;
- purchase_cancel;
- purchase_success;
- purchase_grant_saved;
- purchase_consumed;
- purchase_recovery_start;
- purchase_recovery_success;
- purchase_recovery_error;
- no_ads_entitlement_restored.

Параметры:

- placement;
- productId;
- levelId;
- sessionDuration;
- completedLevels;
- magnifierBalanceBefore;
- magnifierBalanceAfter;
- platformMode;
- locale;
- deviceCategory.

Не отправлять персональные данные.

---

# 7. I18n architecture

## Библиотеки

- `i18next`;
- `react-i18next`.

## Поддерживаемые production locale

- `ru`;
- `en`.

Другие языки пока не входят в build и не указываются в поле переводов Yandex Games.

Архитектура должна позволять позднее добавить `tr`, `ar`, `kk` без переписывания React-компонентов.

## Default и fallback

- default: `ru`;
- fallback: `ru`.

## Порядок выбора языка

1. сохранённый ручной выбор пользователя;
2. `ysdk.environment.i18n.lang`, если это `ru` или `en`;
3. язык браузера, если это `ru` или `en`;
4. `ru`.

## Инициализация

До показа первого пользовательского текста:

1. начать SDK init;
2. прочитать локально сохранённый locale;
3. если manual locale есть — использовать его немедленно;
4. иначе дождаться platform locale в пределах общего boot timeout;
5. инициализировать i18next;
6. только потом показывать splash text/main menu.

Нельзя сначала показать русский экран, а затем заметно переключить его на английский после начала gameplay.

## Namespaces

```text
common
home
gameplay
map
collection
daily
monetization
settings
errors
```

Структура:

```text
src/i18n/
  index.ts
  locale-config.ts
  locales/
    ru/
      common.json
      gameplay.json
      ...
    en/
      common.json
      gameplay.json
      ...
```

## Правила ключей

Хорошо:

```text
gameplay.differencesRemaining
monetization.rewarded.exactHint.description
errors.cloudSaveUnavailable
```

Плохо:

```text
text1
buttonNew
screen4_label
```

## Запрещено

- строки внутри JSX;
- конкатенация переводимых фрагментов;
- текст внутри scene PNG/WebP;
- отдельная логика компонента для каждого языка;
- автоматический машинный перевод в runtime;
- объявление языка на платформе до полной готовности.

## Форматирование

- `Intl.DateTimeFormat(locale)`;
- `Intl.NumberFormat(locale)`;
- i18next plural forms;
- placeholders вместо конкатенации;
- product title/description/price из Yandex catalog;
- fallback mock catalog локализуется локальными JSON.

## Ручной переключатель

Settings содержит:

- Русский;
- English.

После выбора:

1. язык меняется без reload;
2. выбор пишется в local mirror;
3. выбор записывается в Yandex cloud;
4. аналитика получает `language_changed`;
5. layout проходит повторный reflow без обрезаний.

## Проверки

Build должен проверять:

- parity ключей RU/EN;
- пустые значения;
- missing keys;
- использование неизвестного namespace;
- отсутствие hardcoded пользовательских строк;
- отсутствие locale кроме ru/en в production config.

E2E:

- Yandex mock ru;
- Yandex mock en;
- manual switch;
- reload persistence;
- unsupported language fallback;
- длинные английские строки на 360 px;
- отсутствие mixed-language screen.

---

# 8. Yandex cloud save — обязательный основной storage

## Источник истины

Основной и канонический storage прогресса:

- `ysdk.getPlayer()`;
- `player.getData()`;
- `player.setData(data, flush)`.

Он используется и для авторизованных, и для неавторизованных игроков.

`localStorage` не является единственным постоянным хранилищем.

## Локальный fallback

Приоритет:

1. `ysdk.getStorage()` / safeStorage;
2. `window.localStorage`, если safeStorage недоступен;
3. in-memory storage только на текущую сессию, если браузер блокирует оба варианта.

Локальный слой хранит полное зеркало save и metadata синхронизации.

## Save metadata

```ts
type SaveMeta = {
  schemaVersion: number;
  revision: number;
  updatedAt: number;
  deviceId: string;
  source: 'yandex' | 'safe-storage' | 'local-storage';
  lastCloudSyncAt?: number;
  pendingCloudSync: boolean;
};
```

## Boot sequence

1. Инициализировать Yandex SDK.
2. Получить safeStorage, если доступен.
3. Прочитать local mirror.
4. Валидировать и мигрировать local save.
5. Получить Player.
6. Прочитать Yandex cloud save.
7. Валидировать и мигрировать cloud save.
8. Выполнить deterministic merge.
9. Hydrate Zustand.
10. Перезаписать local mirror merged save.
11. Если merged save отличается от cloud — отправить cloud sync.
12. После успешной загрузки вызвать game ready API.

Общий blocking timeout cloud load: 4 секунды.

Если cloud не ответил:

- стартовать из local mirror;
- показать ненавязчивое состояние «Локальное сохранение»;
- повторять cloud sync в фоне;
- не заменять активный прогресс молча после позднего ответа;
- применять merge на безопасном экране.

## Сохранение после действий

### Difference found

- local mirror: сразу;
- Yandex: `setData(save, false)`;
- найденное отличие должно восстановиться после reload.

### Level complete / artifact / daily / purchase

- local mirror: сразу;
- Yandex: `setData(save, true)`;
- UI успеха не должен считаться окончательно завершённым до локального write;
- при cloud error успех сохраняется локально и ставится pending sync.

### Settings и camera

- local mirror: debounce;
- Yandex: coalesced debounce;
- не превышать platform request limits.

### Visibility hidden / pagehide

- local mirror: synchronous best effort;
- Yandex: best-effort `flush: true`;
- не полагаться только на этот момент.

## Размер

Целевой размер сериализованного save: до 120 KB.

Жёсткий guard:

- если больше 160 KB — warning в development;
- если больше 190 KB — production validation error.

Не сохранять:

- изображения;
- thumbnails;
- переводы;
- полные level JSON;
- analytics history;
- дублирующиеся derived values.

## Conflict merge

Monotonic union:

- completed levels;
- unlocked levels;
- artifacts;
- entitlements;
- purchases;
- granted one-time rewards.

Best-result merge:

1. больше печатей;
2. выше accuracy;
3. меньше exact hints;
4. меньше time.

In-progress:

- если levelId одинаковый — union found difference ids;
- если levelId разный — выбрать более новый `updatedAt`, не стирая completed state.

Settings:

- более новый save.

Locale:

- более новый manual locale.

Magnifiers:

- более новый save;
- но значение не может быть ниже суммы подтверждённых, ещё не отражённых purchase grants;
- purchase grant ledger предотвращает двойную выдачу.

## Account selection dialog

Подписаться на:

- `ACCOUNT_SELECTION_DIALOG_OPENED`;
- `ACCOUNT_SELECTION_DIALOG_CLOSED`.

При открытии:

- остановить cloud write queue;
- сохранить local mirror;
- поставить игру на pause.

При закрытии:

- заново получить Player;
- заново загрузить cloud;
- выполнить merge;
- вернуться в main menu или reload;
- возобновить sync только после re-hydration.

## UI состояния

- «Сохранено»;
- «Сохранение…»;
- «Прогресс сохранён локально»;
- «Облако временно недоступно»;
- «Синхронизация восстановлена»;
- conflict dialog только если deterministic merge невозможен.

Игрок не должен видеть технические слова `setData`, SDK, JSON или localStorage.

---

# 9. Обязательные тесты

## Save

- cloud newer than local;
- local newer than cloud;
- cloud missing;
- local missing;
- both invalid;
- SDK timeout;
- safeStorage unavailable;
- localStorage blocked;
- reload after each found difference;
- purchase grant before consume;
- crash between grant and consume;
- account selection events;
- save size guard;
- migration from previous schema.

## Monetization

- rewarded reward exactly once;
- close without reward;
- error recovery;
- no simultaneous ad calls;
- interstitial eligibility;
- no interstitial during gameplay;
- supporter pack removes forced ads;
- optional rewarded remains after no-ads;
- catalog unavailable;
- purchase cancel;
- unprocessed purchase recovery;
- consumable idempotency.

## I18n

- ru platform language;
- en platform language;
- unsupported platform language;
- manual ru/en selection;
- reload persistence;
- cloud locale restoration;
- key parity;
- 360 px English layout;
- no hardcoded visible text.

---

# 10. Official platform assumptions verified for this package

The implementation is based on the current Yandex Games SDK behavior documented for:

- Player Data and `player.getData/setData`;
- safeStorage through `ysdk.getStorage`;
- Advertising;
- In-app purchases and purchase consumption;
- Server time;
- Automatic language detection;
- Progress saving requirements;
- Account selection dialog events.

Codex must re-check the official SDK documentation if method signatures have changed at implementation time.
