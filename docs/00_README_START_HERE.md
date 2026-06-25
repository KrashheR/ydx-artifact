# Find the Differences: Anomaly Archive — starter kit

Этот архив является стартовым пакетом для создания publishable vertical slice игры для Yandex Games.

## Главный принцип

`game_concept.json` — единственный источник истины по продукту. Если промпт, дизайн или реализация противоречат ему, приоритет имеет JSON.

## Состав

- `game_concept.json` — зафиксированный концепт, scope и acceptance criteria.
- `01_CLAUDE_DESIGN_PROMPT.md` — промпт для Claude Design.
- `02_CODEX_IMPLEMENTATION_PROMPT.md` — основной промпт для Codex.
- `03_TECHNICAL_STACK_AND_ART_PIPELINE.md` — архитектура, стек, ассеты и production pipeline.
- `05_MONETIZATION_I18N_AND_CLOUD_SAVE.md` — обязательная спецификация рекламы, покупок, RU/EN i18n и Yandex cloud-save с локальным fallback.
- `06_YANDEX_PLATFORM_RELEASE_AND_MODERATION.md` — SDK lifecycle, Remote Config, ориентации, модерация, каталог и release process.
- `07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md` — продуктовая воронка, quality gates, LiveOps, отзывы, incidents и asset provenance.
- `08_RELEASE_READINESS_CHECKLIST.md` — единый чек-лист перед модерацией и публикацией.
- `09_DEVELOPMENT_ROADMAP.md` — обязательный поэтапный план разработки с gates, зависимостями и оценками.
- `starter-data/level.example.json` — пример data-driven уровня.
- `starter-data/asset-manifest.example.json` — пример манифеста ассетов.
- `assets/` — место для финальных сцен, экспонатов и UI-ассетов.
- `design-reference/` — сюда нужно положить экспорт, скриншоты или код прототипа Claude Design.

## Рекомендуемый порядок

1. Передай Claude Design:
   - `game_concept.json`;
   - `01_CLAUDE_DESIGN_PROMPT.md`;
   - `03_TECHNICAL_STACK_AND_ART_PIPELINE.md`;
   - `05_MONETIZATION_I18N_AND_CLOUD_SAVE.md`;
   - `06_YANDEX_PLATFORM_RELEASE_AND_MODERATION.md`;
   - `07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md`.

2. Сохрани результат Claude Design в `design-reference/`.

3. Проверь, что Claude Design учёл RU/EN, dynamic Yandex prices и состояния cloud/local save.

4. Подготовь хотя бы три пары игровых сцен:
   - tutorial;
   - standard;
   - hard.

5. Открой корень папки в Codex и передай ему содержимое `02_CODEX_IMPLEMENTATION_PROMPT.md`.

6. Codex обязан сначала прочитать весь пакет, создать `IMPLEMENTATION_PLAN.md`, а затем реализовывать проект без расширения scope.

## Что Codex может сделать без финальных изображений

Если игровые изображения ещё не готовы, Codex должен:

- создать локальные временные placeholder-сцены;
- не загружать изображения с внешних сайтов;
- сохранить корректные размеры и структуру путей;
- реализовать полностью работающий gameplay;
- создать dev-only редактор отличий;
- перечислить временные ассеты в `ASSET_MANIFEST.md`.

## Что не считается готовым vertical slice

- только главный экран;
- только красивый прототип без gameplay;
- одна hardcoded сцена;
- отсутствие сохранения найденных отличий;
- desktop layout, просто уменьшенный на mobile;
- прямые вызовы Yandex SDK из React-компонентов;
- сцены A и B, сгенерированные независимо;
- реклама, которая блокирует дальнейшую игру при ошибке.

## Базовые команды будущего проекта

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

## Стартовая инструкция для Codex

Открой корень папки и отправь:

> Прочитай все файлы стартового пакета. `game_concept.json` является источником истины. Выполни задачу из `02_CODEX_IMPLEMENTATION_PROMPT.md`. Не останавливайся после анализа или создания плана: последовательно собирай весь vertical slice, запускай проверки и исправляй ошибки до прохождения Definition of Done.


## Обязательные решения v1.1

- Yandex Player Data — канонический progress storage.
- `ysdk.getStorage()` — предпочтительное локальное зеркало.
- `window.localStorage` — последний fallback.
- Production locale: только `ru` и `en`.
- Default/fallback locale: `ru`.
- i18n: `i18next` + `react-i18next`.
- Launch IAP: `archive_supporter_pack` и `magnifiers_10`.
- Sticky banner на запуске отключён.
- Все цены и значки портальной валюты приходят из Yandex catalog.


## Дополнительные обязательные решения v1.2

- Supported platforms: Desktop + Android + iOS; TV выключен.
- Orientation в draft: Any.
- Mobile landscape: touch side-by-side comparator.
- `LoadingAPI.ready()` — ровно один раз после интерактивного Home.
- `GameplayAPI.start/stop` и `game_api_pause/resume` обязательны.
- Автоматическая реклама на старте учитывается через platform pause/resume.
- Yandex Remote Config используется для kill switches.
- Rating prompt — только через `canReview/requestReview`.
- Release хранит last-known-good ZIP и save migration fixtures.
- Все AI, audio и font assets имеют provenance/license ledger.
- Перед каждой модерацией проходит `08_RELEASE_READINESS_CHECKLIST.md`.


## С чего начинать разработку

Следовать `09_DEVELOPMENT_ROADMAP.md`.

Не отправлять Codex сразу строить весь проект одним непрерывным проходом. Рекомендуемый режим:

1. дать ему этап 3;
2. принять результат и запустить проверки;
3. дать этап 4;
4. не переходить к этапу 5, пока comparator не работает на desktop, portrait и landscape;
5. продолжать по gates дорожной карты.

`starter-data/development-roadmap.json` можно использовать для task board или автоматического progress tracking.
