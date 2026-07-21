# CrazyGames pre-launch audit

Дата аудита: 2026-07-21  
Целевая платформа: CrazyGames  
Этап: подготовка к Basic Launch и последующему Full Launch

## Вердикт

В текущем виде игру не рекомендуется отправлять на модерацию. Технически архив уже близок к релизному, но остаются формальные риски, из-за которых можно получить отказ или испортить метрики Basic Launch.

| Этап | Готовность |
| --- | --- |
| CrazyGames Basic Launch | Около 75%; после исправления блокеров можно подавать |
| Full Launch с монетизацией | Пока не готов |
| Release ZIP | Технически валиден |

## Решение по рекламе

На Basic Launch реклама в любом случае отключается самой CrazyGames, дохода с неё не будет. Если Ads SDK уже интегрирован, QA специально проверяет, что отключённые объявления не оставляют бесполезных rewarded-кнопок и не замораживают переходы между уровнями. За нарушение игра может быть отклонена.

Официальные требования: <https://docs.crazygames.com/requirements/ads/>.

Рекомендация:

- не убирать CrazyGames SDK из Basic-сборки;
- убрать или скрыть все рекламные CTA и не отправлять ad requests в Basic-режиме;
- сохранить рекламный код для будущего Full Launch под отдельным build flag;
- interstitial после каждого третьего уровня сохранить как Full Launch placement: момент выбран правильно, между уровнями;
- rewarded-подсказку перед Full Launch переработать.

SDK важно сохранить из-за размера. Архив весит 75.7 MB. Без SDK CrazyGames считает initial download равным всему размеру, и сборка превысит базовый лимит 50 MB. С SDK initial download считается до `gameplayStart`; сейчас он ориентировочно составляет около 3 MB с первым уровнем и превью, то есть укладывается даже в рекомендуемые для мобильного трафика 20 MB.

Технические требования: <https://docs.crazygames.com/requirements/technical/>.

### Риски текущего rewarded flow

После исчерпания лупы игрок получает рекламное предложение прямо в активном уровне через `src/screens/GameScreen.tsx`. В Basic Launch запрос вернётся с `adsDisabledBasicLaunch`, после чего игрок увидит ошибку. Для QA это выглядит как rewarded-кнопка без результата.

Для будущего Full Launch также есть несоответствия:

- CrazyGames запрещает размещать rewarded request на активном gameplay-экране;
- в тестах предусмотрен повторный просмотр сразу после предыдущего rewarded, тогда как платформа требует ограничивать частоту;
- кнопка отказа визуально слабее основной, хотя CrazyGames требует одинаково честного оформления вариантов;
- rewarded лучше перенести на post-level, fail-screen или отдельный экран ресурсов.

Полные правила rewarded ads: <https://docs.crazygames.com/requirements/ads/>.

## Блокеры перед отправкой

### 1. Сделать отдельный Basic Launch ad mode

Нужно скрыть rewarded-рекламу, не вызывать midgame и покрыть сценарий `adsDisabledBasicLaunch` автоматическим тестом. Gameplay должен оставаться полностью проходимым.

### 2. Исправить локализацию CrazyGames

Сейчас `src/services/platform/crazyGamesPlatform.ts` не возвращает язык платформы, а `src/shared/lib/locale.ts` и `src/i18n.ts` используют русский fallback.

CrazyGames требует брать `window.CrazyGames.SDK.user.systemInfo.locale` и использовать English как fallback.

- SDK System Info: <https://docs.crazygames.com/sdk/user/>
- Требования к локализации: <https://docs.crazygames.com/requirements/gameplay/>

### 3. Исправить lint-gate

`npm run lint` падает на двух ошибках `no-useless-escape` в `vite.config.ts`. Ошибка небольшая, но формально release pipeline не зелёный.

### 4. Включить Progress Save/Data Module в Developer Portal

CrazyGames предупреждает, что без соответствующего переключателя Data Module отключён: <https://docs.crazygames.com/sdk/data/>.

Если `SDK.data` существует, но выбрасывает `dataModuleDisabled`, `src/services/storage/localSaveService.ts` теперь переключается на `localStorage`; это покрыто регрессионным тестом. Такой save остаётся local-only и не синхронизируется с аккаунтом, поэтому Data Module всё равно необходимо включить перед submission.

Необходимо:

- включить Progress Save и использование CrazyGames Data Module в форме подачи;
- проверить guest save после reload;
- проверить account sync;
- добавить тест ошибки `dataModuleDisabled` или гарантированный безопасный fallback для Basic Launch.

### 5. Провести QA в CrazyGames Preview

Текущий автотест проверяет только первый вход. В настоящем iframe ещё нужно проверить:

- guest reload и сохранение после завершения уровня;
- `adsDisabledBasicLaunch`;
- все ключевые размеры CrazyGames;
- Chromebook с 4 GB RAM;
- Safari и мобильный safe area;
- полное прохождение 39 campaign и 7 daily уровней;
- submission covers, descriptions и controls в Developer Portal.

## Что уже готово

- Production CrazyGames build успешно собирается.
- ZIP содержит корневой `index.html` и относительные пути.
- Размер сборки: 75,669,115 байт.
- Количество файлов: 178.
- Initial bundle по автоматической проверке: 2,042,755 байт.
- С фактически загружаемыми стартовыми изображениями initial download всё равно значительно меньше 20 MB.
- CrazyGames SDK v3 подключён корректным способом.
- Новый игрок попадает сразу в первый уровень и начинает игру одним кликом, что соответствует Full Launch UX.
- Interstitial находится в логичном разрыве между уровнями и не прерывает поиск.
- Нет сторонней рекламы, внешних ссылок и собственного fullscreen-контрола.
- Контентная и provenance-валидация проходит.

## Результаты проверок

| Проверка | Результат |
| --- | --- |
| CrazyGames production build | Пройдено |
| CrazyGames ZIP validation | Пройдено |
| TypeScript | Пройдено |
| Unit tests | 94/94 |
| Desktop/mobile Playwright smoke | 2/2 |
| Content validation | 39 campaign + 7 daily |
| Analytics contract | Пройдено |
| Lint | Не пройдено: 2 ошибки в `vite.config.ts` |

## Сильные стороны продукта для Basic Launch

- Быстрый вход: новый игрок оказывается в gameplay максимум через один осмысленный клик.
- Initial download существенно ниже мобильного ориентира 20 MB.
- Контента достаточно для сессий длиннее 10 минут: три кампании по 13 уровней и 7 Daily Archive сцен.
- Есть постоянная прогрессия, коллекция и daily hook.
- Реклама не является обязательной для прохождения.
- Межуровневый interstitial placement не прерывает gameplay.
- RU и EN локализации уже существуют, требуется только исправить определение языка и fallback.

Отдельный продуктовый риск: в игре нет звука и SFX. Это не формальный блокер модерации, но может снизить ощущение полировки, среднюю длину сессии и D1 retention.

## План прохождения Basic Launch

CrazyGames ориентируется прежде всего на average playtime, D1 retention и conversion. В официальном руководстве приведены ориентиры для сильных игр:

- average playtime: 10+ минут;
- D1 retention: около 10–15%;
- conversion в минуту gameplay: 80%+;
- загрузка: менее 10 секунд;
- рекомендуемый размер initial download: менее 20 MB.

Это ориентиры, а не гарантированные пороги прохождения.

Официальное руководство: <https://docs.crazygames.com/resources/basic-launch-metrics/>.

### До подачи

1. Исправить Basic Launch ad mode, CrazyGames locale, English fallback и lint.
2. Включить Data Module в Developer Portal.
3. Проверить guest reload и сохранение прогресса в CrazyGames Preview.
4. Пройти desktop и mobile smoke в iframe.
5. Проверить первые три уровня вручную на понятность, сложность и отсутствие pixel hunt.
6. Проверить covers, English description, controls и выбранные устройства/orientation.
7. Загрузить проверенный `dist-crazygames.zip`.

### Первые 48 часов

- не менять игру, кроме критических багов;
- проверить старт, сохранение, ошибки SDK и достижимость первого уровня;
- дождаться нормального объёма данных, прежде чем менять onboarding или сложность;
- не включать рекламу и не проводить несколько экспериментов одновременно.

### Диагностика метрик

Если conversion ниже 80%:

- проверить реальное время загрузки;
- проверить первый экран и понятность CTA;
- убедиться, что onboarding не перекрывает gameplay и работает на всех размерах;
- проверить console/runtime errors в iframe.

Если average playtime ниже 10 минут:

- посмотреть ранние таймауты и выходы;
- проверить сложность первых трёх уровней;
- проверить понятность A/B comparator;
- оценить частоту использования и нехватки подсказок;
- не пытаться лечить playtime добавлением рекламы.

Если D1 retention ниже 10%:

- первым делом проверить сохранение после reload и входа в аккаунт;
- проверить заметность Daily Archive;
- оценить понятность прогрессии кампаний и коллекции;
- проверить, не теряет ли игрок прогресс при ошибке Data Module.

### Обновления во время Basic Launch

- изменять одну крупную переменную за раз;
- сначала исправлять технические и onboarding-проблемы;
- не смешивать одновременно изменение сложности, наград, интерфейса и порядка уровней;
- после обновления дождаться нового полного дня данных;
- сохранять журнал версии, времени обновления и ожидаемого эффекта.

## План подготовки Full Launch

После успешного Basic Launch:

1. Включить рекламные placements только в Full Launch build profile.
2. Оставить midgame только между уровнями.
3. Перенести rewarded из активного уровня в разрешённую точку flow.
4. Добавить cooldown или ограничение частоты rewarded.
5. Сделать варианты «смотреть» и «продолжить без рекламы» визуально равноправными.
6. Проверить rewarded success, `adError`, `adblock` и повторные callbacks.
7. Проверить `gameplayStart`/`gameplayStop` на уровне, результате, настройках и рекламе.
8. Проверить Data Module guest/account sync.
9. Повторно пройти Full Implementation QA в CrazyGames Preview.

## Итоговое решение

Текущий `dist-crazygames.zip` технически валиден, но ещё не является рекомендуемым кандидатом на отправку. После устранения Basic Launch ad UI, исправления CrazyGames locale/English fallback, зелёного lint и подтверждения сохранения через Data Module игру можно подавать на Basic Launch.

Для Basic Launch следует отключить именно рекламные placements и рекламный UI, но сохранить CrazyGames SDK, lifecycle и Data Module. Для Full Launch текущий interstitial можно развивать дальше, а rewarded flow необходимо переработать под строгие правила платформы.
