# План миграции на CrazyGames

Статус: готово к реализации  
Дата: 2026-07-21  
Цель: выпустить текущую HTML5-игру на CrazyGames, сохранив отдельный Yandex Games build и не меняя игровой loop, контент уровней или save schema без необходимости.

## 1. Рекомендуемая стратегия

1. Создать самостоятельный CrazyGames build profile, не заменяя Yandex-реализацию глобально.
2. Подать первую сборку как **Basic Launch**: игра должна быть полностью играбельна без рекламы и без обязательной платформенной монетизации.
3. После результатов Basic Launch подготовить **Full Launch**: CrazyGames SDK v3, cloud save и реклама.

Такой порядок важен: в Basic Launch реклама отключена, а в Full Launch SDK и корректные `Gameplay start`/`Gameplay stop` обязательны. Подробности: <https://docs.crazygames.com/requirements/intro/>.

## 2. Границы миграции

### Остаётся без изменения

- React/Vite/TypeScript стек;
- gameplay, hit testing, контент кампаний и daily;
- Zod-валидация и миграции SaveData;
- RU и EN локализации;
- продуктовые события из `src/services/analytics/eventRegistry.ts`.

### Заменяется или становится платформенным

| Область | Сейчас | CrazyGames-цель |
| --- | --- | --- |
| SDK | `/sdk.js`, `YaGames`, `ysdk` | `crazygames-sdk-v3.js`, `window.CrazyGames.SDK` |
| Lifecycle | LoadingAPI, GameplayAPI, pause events | `game.loadingStart/Stop`, `gameplayStart/Stop` |
| Rewarded / interstitial | Yandex `adv` | `ad.requestAd("rewarded" / "midgame")` |
| Save | Player Data + safe storage | `SDK.data` |
| Locale | Yandex environment language | browser + сохранённый выбор |
| Review prompt | Yandex feedback API | отключить на CrazyGames |
| Metrica | обязательна для Yandex build | не требовать в CrazyGames build |
| Release package | `dist-yandex.zip` | `dist-crazygames.zip` |

## 3. Целевая архитектура

Не оставлять в коде универсальную реализацию под именем `mockPlatform`. Ввести нейтральный контракт и адаптеры:

```text
src/services/platform/
  types.ts                 # PlatformAdapter, storage и ad-контракты
  platform.ts              # выбор адаптера по VITE_PLATFORM
  crazyGamesPlatform.ts    # CrazyGames SDK v3
  yandexPlatform.ts        # текущая Yandex-реализация
  localPlatform.ts         # Vite/test fallback
  platformLifecycle.ts     # lifecycle через общий adapter
```

Минимальный контракт адаптера:

```ts
type PlatformAdapter = {
  init(): Promise<{ sdkReady: boolean; localMock: boolean }>;
  getEnvironmentLanguage(): Promise<string | undefined>;
  getStorage(): Promise<StorageLike | null>;
  showRewarded(): Promise<"rewarded" | "closed" | "failed">;
  showInterstitial(callbacks?: InterstitialCallbacks): Promise<"closed" | "failed">;
  notifyLoadingStart(): Promise<void>;
  notifyLoadingReady(): Promise<void>;
  setGameplayActive(active: boolean): void;
  reportCompletion?(percent: number): void;
  setGameContext?(context: Record<string, string | number>): void;
};
```

React-компоненты и store не должны обращаться к `window.CrazyGames`, `window.ysdk` или рекламе напрямую.

## 4. Работы по этапам

### Этап 0. Подготовка ветки и baseline

1. Создать ветку `feature/crazygames-migration`.
2. Зафиксировать успешный baseline: `pnpm agent:check` и `pnpm test:e2e`.
3. Измерить текущий production bundle: общий размер, initial download, число файлов.
4. Добавить `VITE_PLATFORM=yandex|crazygames|local`; production-профили должны выбирать конкретную платформу, dev — `local` по умолчанию.

**Готово, когда:** текущий Yandex build работает без поведенческих изменений, а local/test не требуют внешнего SDK.

### Этап 1. Изолировать текущую Yandex-интеграцию

1. Перенести типы и текущую логику из `mockPlatform.ts` в `yandexPlatform.ts`.
2. Выделить нейтральные интерфейсы в `types.ts`.
3. Перевести `platformLifecycle.ts`, `localSaveService.ts`, `GameScreen.tsx` и boot-код на `getPlatformAdapter()`.
4. Сохранить тестовые overrides рекламных gateway, но перенести их в local/test adapter.

**Готово, когда:** unit-тесты Yandex flow проходят, а в core/store/screens нет импортов Yandex SDK типов.

### Этап 2. Подключить CrazyGames SDK v3 и lifecycle

1. В CrazyGames `index.html` подключать до кода игры:

   ```html
   <script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
   ```

2. В `crazyGamesPlatform.init()` вызвать и дождаться `window.CrazyGames.SDK.init()`.
3. В начале bootstrap вызвать `SDK.game.loadingStart()`.
4. После гидрации save, локализации, готовности первого интерактивного экрана и первого render вызвать `SDK.game.loadingStop()` только один раз.
5. В активном уровне/после resume вызвать `SDK.game.gameplayStart()`; на паузе, меню, результате уровня и рекламе — `SDK.game.gameplayStop()`.
6. Не реализовывать отдельный stop/start лишь из-за blur/visibility: CrazyGames управляет потерей фокуса сам.
7. При старте уровня добавлять `setGameContext({ level })`, при выходе очищать контекст; после прогресса сообщать `reportGameCompletedPercentage`.

Справка: <https://docs.crazygames.com/sdk/intro/> и <https://docs.crazygames.com/sdk/game/>.

**Готово, когда:** нет вызовов `LoadingAPI`/`GameplayAPI` в CrazyGames bundle; QA лог показывает корректную пару loading и gameplay событий без дублей.

### Этап 3. Перенести save на CrazyGames Data Module

1. Для `VITE_PLATFORM=crazygames` использовать только `CrazyGames.SDK.data` как persistent storage.
2. Сохранить существующий ключ `anomaly-archive-save-v1` и JSON/Zod migration.
3. До первого чтения/записи обязательно завершить `SDK.init()`.
4. Не делать race/merge между самостоятельным `localStorage` и cloud на CrazyGames: Data Module сам использует localStorage для гостя и синхронизирует данные после login.
5. Ловить ошибки Data Module, в том числе лимит 1 MB; при ошибке не блокировать игровой loop, но выставлять понятный `saveStatus`.
6. В форме подачи игры включить Progress Save / Data Module; иначе storage будет отключён.
7. Для dev/test при отсутствии SDK оставить localStorage fallback.

Справка: <https://docs.crazygames.com/sdk/data/>.

**Готово, когда:** guest progress переживает reload, авторизованный sandbox/user получает кросс-девайс save, а размер сериализованного SaveData покрыт тестом и меньше 1 MB.

### Этап 4. Заменить рекламу и сохранить честную экономику

1. Rewarded area hint вызывает `SDK.ad.requestAd("rewarded", callbacks)` только после явного подтверждения игрока.
2. Награду выдавать один раз после `adFinished`; `adError` и закрытие не выдают hint и возвращают игрока в тот же state.
3. Interstitial вызывать как `SDK.ad.requestAd("midgame", callbacks)` только между уровнями и не на кнопках навигации/настройках.
4. На `adStarted` ставить на pause timer/audio/input и показывать blocking state; на `adFinished`/`adError` снимать блокировку.
5. Добавить единый ad cooldown: не пытаться показать midgame чаще 3 минут. Не считать `adError` успешным показом.
6. Для Basic Launch предусмотреть fallback: игра и переходы не зависают при отключённой рекламе; rewarded CTA не обещает недоступную награду.
7. Сохранить правило: добровольный rewarded не блокирует прохождение, interstitial никогда не прерывает активный поиск отличий.

Справка: <https://docs.crazygames.com/sdk/video-ads/> и <https://docs.crazygames.com/requirements/ads/>.

**Готово, когда:** покрыты тестами rewarded success/error, midgame success/error/cooldown и Basic Launch без рекламы.

### Этап 5. Локализация, review и продуктовый flow

1. Сохранить приоритет языка: ручной выбор -> browser `ru`/`en` -> `ru` fallback. Не обращаться к Yandex environment в CrazyGames build.
2. Оставить English как полностью поддерживаемую локаль: CrazyGames QA ожидает English-language support.
3. Yandex review pre-prompt на CrazyGames не показывать; старые save-поля не удалять до отдельной миграции schema.
4. Проверить onboarding: для Full Launch новый игрок должен попадать в gameplay сразу или максимум после одного осмысленного действия.
5. Проверить mobile safe areas, landscape layout, touch gestures, `user-select: none` и отсутствие browser context menu в gameplay.

**Готово, когда:** сценарий clean save проходит RU и EN, а первый уровень достижим не более чем за один клик от входа.

### Этап 6. Аналитика и release pipeline

1. Оставить `eventRegistry` и debug buffer как общую телеметрию.
2. Разделить текущий Metrica transport от ядра аналитики: `debug`, `yandex-metrica`, `none` (в дальнейшем — выбранный провайдер).
3. В CrazyGames release profile не грузить `mc.yandex.ru`, не требовать `VITE_YANDEX_METRICA_ID`, не запускать `metrika:goals`.
4. Добавить команды:

   ```bash
   pnpm build:crazygames
   pnpm release:crazygames:validate
   pnpm release:crazygames:zip
   ```

5. ZIP должен содержать `index.html` в корне, использовать относительные ссылки на bundle и не содержать sourcemap, `.DS_Store`, `__MACOSX`, `._*`.
6. Добавить проверку общего веса, initial-download веса и числа файлов в release validation.

CrazyGames limits: общий размер до 250 MB, до 1500 файлов, initial download до 50 MB (до 20 MB для mobile homepage). Справка: <https://docs.crazygames.com/requirements/technical/>.

**Готово, когда:** `release:crazygames:validate` проходит без Yandex env vars и формирует загружаемый архив.

### Этап 7. QA, submission и Full Launch

1. Прогнать unit, typecheck, content validation и e2e на local/Yandex/CrazyGames профилях.
2. Проверить игру в iframe: Chrome, Edge, Safari; desktop, phone landscape и tablet.
3. Проверить adblock и отсутствие SDK: игра остаётся проходимой.
4. Подготовить Developer Portal материалы: English description, controls, thumbnail/covers, trailer при наличии, разрешённые orientation/device settings.
5. Подать Basic Launch, включив только реально используемые возможности.
6. После допуска к Full Launch включить ads и Data Module, повторить QA sandbox/prod и обновить build.

## 5. Матрица проверки

| Сценарий | Ожидаемый результат |
| --- | --- |
| Local dev без SDK | Игра запускается, save и mock ads работают |
| CrazyGames Basic Launch | Нет freeze из-за disabled ads; gameplay доступен |
| Rewarded success | Ровно одна подсказка после `adFinished` |
| Rewarded error / adblock | Нет награды, level и input восстановлены |
| Midgame ad | Только между уровнями, input/timer/audio заблокированы |
| Midgame cooldown | Новая попытка не происходит раньше 3 минут |
| Guest save | Save переживает reload |
| Account save | Прогресс синхронизируется Data Module |
| Gameplay lifecycle | Start на level/resume, stop на паузе/результате/рекламе |
| First-time player | Gameplay максимум через один клик |
| Mobile | Landscape, safe-area и touch не ломают A/B comparator |
| Release ZIP | Корневой `index.html`, относительные пути, размер/число файлов в лимите |

## 6. Обязательные документы после реализации

- создать `CRAZYGAMES_INTEGRATION.md` с фактическим SDK contract;
- переименовать или разделить Yandex-only части `docs/05_MONETIZATION_I18N_AND_CLOUD_SAVE.md`;
- обновить `RELEASE_CHECKLIST.md` и `docs/08_RELEASE_READINESS_CHECKLIST.md`;
- обновить `README.md`, `ANALYTICS_EVENTS.md`, `CHANGELOG.md`;
- при изменении save contract обновить `SAVE_SCHEMA.md` и `docs/starter-data/save.example.json`.

## 7. Definition of Done

Миграция готова, когда:

- Yandex и CrazyGames собираются отдельными командами;
- core gameplay не зависит от SDK конкретной платформы;
- CrazyGames Basic Launch проходит без рекламы и потери прогресса;
- CrazyGames Full Launch корректно использует lifecycle, Data Module и ads SDK;
- нет Yandex SDK/Metrica сетевых зависимостей в CrazyGames bundle;
- проходят `pnpm agent:check`, целевые тесты adapter/storage/ads, e2e и CrazyGames release validation;
- подготовлены submission assets и заполнен checklist Developer Portal.
