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

Новый игрок получает ровно **1 лупу** (`INITIAL_MAGNIFIERS` в `src/entities/save/schema.ts`).

Миграция сохранений не уменьшает уже накопленный баланс: существующие лупы переносятся как есть.

## Расход

- «Ориентир» — 1 лупа;
- продление времени на **60 секунд** — 2 лупы.

Баланс не может стать отрицательным.

## Источники луп

Автоматических бесплатных источников больше нет. Кампания, streak и daily
**не начисляют лупы сами по себе**. Лупы попадают на баланс только:

- после rewarded-просмотра в Daily Archive (ровно 1 лупа на календарную дату);
- после успешной покупки в магазине (`magnifiers_10`, `archive_starter_pack`);
- через dev-инструменты в development-режиме.

При нулевом балансе rewarded-подсказка «Ориентир» выдаётся **непосредственно в
уровне** и на баланс не зачисляется — её нельзя накопить на будущее.

## Ограничения

- нельзя продавать обязательный доступ к следующему уровню;
- нельзя создавать уровень, который практически невозможно пройти без подсказки;
- нельзя обнулять лупы за ошибку;
- нельзя автоматически тратить лупы;
- каждое расходование требует явного действия.

---

# 3. Rewarded-реклама

## Placement: area_hint_rewarded

Точка входа: у игрока закончились лупы, он сам нажал кнопку подсказки и подтвердил просмотр рекламы.

Награда: подсветить область одного ненайденного отличия.

Правила:

- заранее показать точную награду;
- одно активное рекламное обращение одновременно;
- при onRewarded выдать подсказку;
- onClose без onRewarded не выдаёт награду;
- onError возвращает игрока в уровень;
- состояние уровня не теряется;
- кнопка не остаётся бесконечно loading.

## Placement: timeout_extension

Точка входа: overlay «Время вышло».

Награда: **+60 секунд** к текущей попытке.

Правила:

- максимум одно rewarded-продление на одну попытку уровня;
- признак `inProgress.rewardedTimeExtensionUsed` сохраняется в save и переносится
  через `createLevelAttempt`, поэтому перезагрузка страницы и возврат из фона не
  открывают предложение повторно;
- «Начать заново» создаёт новую попытку и сбрасывает признак;
- награда выдаётся только после `onRewarded`;
- найденные отличия, ошибки и активное время попытки сохраняются;
- продление за 2 лупы остаётся доступным независимо от rewarded-продления.

Overlay предлагает четыре действия: «Реклама → +60 секунд», «Продлить за 2 лупы»,
«Начать заново», «Вернуться в архив».

## Placement: daily_reward

Точка входа: victory overlay первого за календарную дату прохождения Daily Archive.

Награда: ровно 1 лупа.

Правила:

- автоматического начисления за Daily больше нет;
- игрок выбирает «Получить 1 лупу за рекламу» или «Завершить без награды»;
- лупа начисляется только после `onRewarded` и сразу сохраняется с flush;
- дата фиксируется в `daily.lastAdRewardDate`, повторный клик и повторное
  прохождение вторую лупу не выдают;
- streak (`daily.lastClaimDate` / `daily.streak`) засчитывается независимо от рекламы;
- ошибка rewarded не выдаёт награду и не сбрасывает streak; доступны повтор и отказ;
- после rewarded interstitial не показывается;
- отказ пытается показать interstitial и в любом случае возвращает игрока в Archive Hub;
- `noForcedInterstitials` убирает interstitial при отказе, но не убирает саму
  добровольную rewarded-кнопку.

---

# 4. Interstitial-реклама

## Каденция кампании

Interstitial запрашивается **после каждых двух успешно завершённых campaign-уровней**
в рамках игровой сессии (placement `campaign_every_two_levels`).

Считаются:

- новые прохождения campaign-уровней;
- повторные прохождения campaign-уровней.

Не считаются:

- незавершённые попытки, выход из уровня, timeout без последующей победы;
- Daily Archive — у него отдельная логика (`daily_reward`, `daily_exit_interstitial`).

Схема внутри сессии: после 1-го завершения рекламы нет, после 2-го — запрос,
после 4-го — следующий, далее каждый второй. Счётчик
`interstitialRuntime.campaignCompletions` живёт в рамках сессии, потому что
`completedLevels.length` не умеет считать реплеи.

## Точка показа

Только после экрана победы, перед выбранной навигацией:

- перед переходом к следующему уровню;
- либо перед возвращением на карту / в Archive Hub.

Выбор «Вернуться на карту» **не отменяет** поставленный interstitial: сначала
выполняется попытка показа, затем навигация. Переходы в коллекцию и в отчёт
кампании откладывают рекламу (pending сохраняется), а не отменяют её.

## Условия подавления

Реализованы в `resolveInterstitialDecision` (`src/shared/lib/adPolicy.ts`); каждое
отправляет `interstitial_suppressed` с полем `reason`:

- `no_forced_ads` — `saveData.purchases.noForcedInterstitials === true`;
- `recent_rewarded` — rewarded был фактически показан менее 90 секунд назад;
- `in_flight` — реклама уже обрабатывается;
- `already_resolved` — этот completion/navigation action уже обработан;
- `not_eligible` — нет поставленной рекламы либо игрок внутри gameplay.

## Отказ платформы

Если interstitial не был показан из-за `wasShown === false`, ошибки, offline или
рекламного cooldown Яндекса:

- навигация не блокируется;
- состояние игры не меняется;
- реклама не считается фактически показанной;
- следующая проверка происходит в следующей естественной точке после завершения
  уровня; автоматических повторных вызовов нет.

Защита от двойного запроса: `postLevelActionGuardRef` в `GameScreen`, флаг
`interstitialRuntime.nativeRequestInFlight` и ordinal-леджер `lastResolvedToken`.

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

Каталог из трёх товаров. Идентификаторы и стартовые цены **создаются вручную в
Yandex Developer Console**; приложение их не хардкодит. Цены, обозначение валюты и
иконка валюты в UI приходят исключительно из `payments.getCatalog()`.

| Product ID             | Тип                     | Стартовая цена (гипотеза для консоли) |
| ---------------------- | ----------------------- | ------------------------------------- |
| `no_forced_ads`        | non-consumable          | 99 ЯН                                 |
| `magnifiers_10`        | consumable              | 29 ЯН                                 |
| `archive_starter_pack` | non-consumable, one-off | 129 ЯН                                |

## Product: no_forced_ads

Содержимое: навсегда отключает все принудительные interstitial — и campaign, и
Daily. Добровольные rewarded остаются доступны.

Названия в интерфейсе (не «Убрать всю рекламу»):

- RU: «Без принудительной рекламы»;
- EN: «No forced ads».

Описание RU: «Убирает рекламу между уровнями. Добровольные награды за рекламу
останутся доступны.»

## Product: magnifiers_10

Consumable. Содержимое: 10 луп. Покупка может совершаться повторно.

## Product: archive_starter_pack

Одноразовый non-consumable набор: навсегда отключает принудительные interstitial
и **один раз** начисляет 20 луп. Помечен бейджем «Лучший выбор» / «Best value».
Без фальшивых таймеров, искусственной срочности и выдуманных скидок.

- если `no_forced_ads` уже куплен — набор скрывается, чтобы игрок не заплатил
  повторно за уже имеющееся преимущество;
- если куплен набор — отдельный `no_forced_ads` отображается как «Уже приобретено»,
  а принудительная реклама отключена;
- бонус 20 луп начисляется только один раз: последующие `getPurchases()` лишь
  восстанавливают entitlement `noForcedInterstitials` (защита —
  `purchases.grantedOneTimeProductIds`).

## Порядок обработки покупки

Реализация: `src/services/platform/purchaseService.ts`. UI никогда не вызывает
`ysdk.getPayments()`, `getCatalog()`, `purchase()`, `getPurchases()` или
`consumePurchase()` напрямую — всё идёт через `src/services/platform/payments.ts`.

1. `payments.purchase({ id })`;
2. проверить product ID и purchase token;
3. проверить idempotency ledger (`purchases.processedPurchaseTokens`) и
   `purchases.grantedOneTimeProductIds`;
4. начислить лупы и entitlement в save;
5. записать token в ledger **тем же изменением**, что и награду;
6. выполнить облачное сохранение с flush и убедиться, что оно прошло
   (`persistSave` возвращает `{ persisted }`);
7. только после успешного сохранения вызвать `consumePurchase(token)` — для
   consumable-товаров;
8. ошибка consume не фатальна: ledger уже блокирует повторную выдачу, а следующий
   startup recovery повторит consume.

Ledger ограничен `PROCESSED_PURCHASE_TOKEN_LIMIT = 100`; обрезаются самые старые
записи. Для non-consumable товаров дополнительной защитой служит
`grantedOneTimeProductIds`, поэтому вытеснение старого токена не приводит к
повторной выдаче. `productIds` **не** используется как единственная защита
consumable-покупок.

Параллельные покупки блокируются флагом `purchaseInFlight` в сервисе плюс
локальным состоянием кнопки в модалке.

## Startup purchase recovery

На каждом запуске после инициализации платформы (`recoverPurchases`):

1. вызвать `payments.getPurchases()`;
2. восстановить non-consumable entitlements;
3. найти необработанные consumable-покупки;
4. идемпотентно начислить их;
5. сохранить данные с flush;
6. consume только после успешного сохранения;
7. логировать результат (`purchase_recovered`).

Покупка доступна и неавторизованному игроку. Ошибки авторизации, закрытие окна,
недостаток средств и отсутствие Payments API обрабатываются без падения игры:
магазин показывает «Платежи сейчас недоступны» либо ошибку с кнопкой повтора.

## Save-поля

```jsonc
"purchases": {
  "noForcedInterstitials": false,
  "productIds": [],
  "processedPurchaseTokens": [],   // idempotency ledger, максимум 100 токенов
  "grantedOneTimeProductIds": []   // одноразовые payload'ы, например бонус набора
}
```

Существующие `noForcedInterstitials` и `productIds` сохранены и мигрируют без
потерь. Новые поля добавлены через `.default([])`, поэтому `SAVE_VERSION` остаётся
`3` и старые сохранения не сбрасываются.

## Магазин

Кнопка «Магазин» / «Shop» находится в верхней панели Archive Hub рядом с балансом
луп (touch target 44x44, работает в mobile landscape и на desktop). Она открывает
модалку «Архивная лавка» / «Archive Shop», собранную из существующих токенов
проекта: те же градиенты, рамки, радиусы, тени и `game-pop` анимация, что и у
остальных модалок. Модалка содержит заголовок, текущий баланс луп, три карточки
товаров, кнопку закрытия и состояния loading / недоступности платежей / ошибки /
выполняющейся покупки / подтверждения успеха.

Интерфейсные строки, статусы и бейджи живут в `shop.*` в обеих локалях. Названия и
описания товаров берутся из i18n, чтобы RU и EN гарантированно совпадали с
требованиями; цена, код валюты и изображение приходят из каталога.

## No-ads semantics

После получения `no_forced_ads`:

- не вызывать in-game interstitial;
- не показывать sticky banner, если он появится в будущем;
- rewarded остаётся доступен только по желанию игрока;
- принудительный платформенный блок, не управляемый игрой, не имитировать и не учитывать как собственную рекламу.

---

# 6. Аналитика монетизации

Единый типизированный источник истины по именам событий —
`src/services/analytics/eventRegistry.ts`. Полный список с payload'ами и
placement'ами описан в `ANALYTICS_EVENTS.md`; ниже только монетизационный срез.

Rewarded (общий для всех placement'ов, каждое событие несёт `placement` и `wasShown`):

- `rewarded_offer_opened`;
- `rewarded_requested`;
- `rewarded_opened`;
- `rewarded_rewarded`;
- `rewarded_closed`;
- `rewarded_failed`.

Legacy-воронка area hint (`rewarded_hint_*`) продолжает отправляться параллельно,
чтобы не ломать существующие дашборды.

Interstitial:

- `interstitial_eligible`;
- `interstitial_request`;
- `interstitial_open`;
- `interstitial_close`;
- `interstitial_error`;
- `interstitial_suppressed` с `reason`: `no_forced_ads`, `recent_rewarded`,
  `in_flight`, `already_resolved`, `not_eligible`.

Daily:

- `daily_reward_claimed` (streak, без луп);
- `daily_ad_reward_offered`;
- `daily_ad_reward_granted`;
- `daily_ad_reward_declined`.

Магазин и покупки:

- `shop_opened`;
- `shop_closed`;
- `shop_catalog_loaded`;
- `shop_catalog_failed`;
- `purchase_requested`;
- `purchase_succeeded`;
- `purchase_cancelled`;
- `purchase_failed`;
- `purchase_reward_granted`;
- `purchase_consumed`;
- `purchase_recovered`;
- `purchase_already_owned`.

Placement'ы: `campaign_every_two_levels`, `daily_reward`,
`daily_exit_interstitial`, `timeout_extension`, `area_hint_rewarded`
(`src/shared/lib/adPolicy.ts`).

Параметры, где уместно: `placement`, `productId`, `priceValue`,
`priceCurrencyCode`, `source`, `magnifiersBefore`, `magnifiersAfter`, `resultType`
или безопасная категория ошибки, `levelId`, `completedLevels`, `wasShown`.

Не отправлять персональные данные. **Purchase token и другие чувствительные
данные в аналитику не попадают.**

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
monetization.rewarded.areaHint.description
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
