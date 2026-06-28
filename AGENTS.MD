# AGENTS.md

Краткая инструкция для Codex и других coding-агентов. Цель файла - снизить расход токенов: сначала читать эту карту, затем открывать только те документы и исходники, которые нужны для текущей задачи.

## Проект

`anomaly-archive` - Vite + React + TypeScript vertical slice игры "Find the Differences: Anomaly Archive" для Yandex Games.

Ключевой игровой цикл: карта уровней -> поиск отличий в A/B сценах -> сохранение прогресса -> награды, коллекция, daily.

## Быстрый старт для агента

1. Прочитай `package.json`, `README.md`, этот файл и только релевантные документы из списка ниже.
2. Перед правками найди ближайшие файлы через `rg` / `rg --files`, не перечитывай весь проект.
3. Для типовых задач сначала открой `docs/AGENT_INDEX.md`; для контента - `docs/FLOWS/content-intake.md`, для UI - `docs/FLOWS/ui-change.md`.
4. После осмысленной правки кода, контента, ассетов, схем или поведения обнови документацию проекта, если изменение меняет пользовательское поведение, архитектуру, схемы, контент, ассеты или release-flow.
5. Запусти минимальные проверки, соответствующие изменению. Для широких агентных правок используй `pnpm agent:check`; для релизных - `pnpm agent:release-check` или `pnpm release:validate`.
6. В финальном ответе кратко перечисли измененные файлы, проверки и какие документы обновлены.

## Обязательное правило документации

После каждой осмысленной правки обновляй документацию рядом с измененной областью, если изменение меняет контракт, поведение, контент, ассеты, пользовательский flow или инструкции следующему агенту:

- Архитектура, потоки, сервисы: `ARCHITECTURE.md`, `YANDEX_INTEGRATION.md`, `INCIDENT_RUNBOOK.md`.
- Контент уровней, отличия, ассеты: `CONTENT_PIPELINE.md`, `ASSET_MANIFEST.md`, `ASSET_PROVENANCE.json`, `LEVEL_EDITOR.md`.
- Сохранения и миграции: `SAVE_SCHEMA.md`, `docs/starter-data/save.example.json`.
- Аналитика и LiveOps: `ANALYTICS_EVENTS.md`, `docs/07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md`.
- Релиз: `RELEASE_CHECKLIST.md`, `docs/08_RELEASE_READINESS_CHECKLIST.md`.
- Пользовательские инструкции и обзор проекта: `README.md`, `AGENTS.MD`, `CLAUDE.md`.
- Изменения, заметные пользователю или следующему агенту: `CHANGELOG.md`.

Если документация не требует изменения, явно укажи причину в финальном ответе.

Документация обычно не требуется для чистого форматирования, тестов без изменения поведения, внутренних переименований без изменения контракта и мелких refactor-only правок.

## Структура проекта

```text
src/
  app/                 App shell и глобальные стили
  screens/             Основные экраны: home, map, game, daily, collection, settings
  features/gameplay/   Игровой comparator и логика взаимодействия со сценами
  shared/lib/          Чистая доменная логика: hit testing, progression
  shared/store/        Zustand store, навигация, сохранение прогресса
  shared/ui/           Общие UI-компоненты
  entities/            Zod-схемы доменных сущностей
  services/            Platform/storage adapters
  content/             Data-driven уровни
  i18n/                RU/EN JSON-локализации
public/assets/         Runtime-ассеты, доступные через Vite
docs/                  Продуктовые, технические и дизайн-спецификации
tests/e2e/             Playwright e2e
scripts/               Валидация контента и релизные утилиты
```

## Документы: читать по необходимости

- `docs/game_concept.json` - источник истины по продукту и scope.
- `docs/09_DEVELOPMENT_ROADMAP.md` - порядок этапов и gates.
- `docs/03_TECHNICAL_STACK_AND_ART_PIPELINE.md` - стек, ассеты, production pipeline.
- `docs/design-reference/CODEX_HANDOFF.md` - дизайн-правила, responsive, UI states.
- `docs/05_MONETIZATION_I18N_AND_CLOUD_SAVE.md` - i18n, монетизация, cloud save.
- `docs/06_YANDEX_PLATFORM_RELEASE_AND_MODERATION.md` - Yandex SDK, модерация, релиз.
- `docs/08_RELEASE_READINESS_CHECKLIST.md` - чеклист перед публикацией.

Не загружай все документы в контекст без причины. Для локальной UI-правки обычно достаточно `CODEX_HANDOFF.md`, затронутого компонента и локализаций.

## Команды

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm validate:content
pnpm build
pnpm release:validate
pnpm agent:check
pnpm agent:release-check
```

Минимальные проверки:

- Чистая логика: `pnpm test` или точечный Vitest-файл.
- TypeScript/API/schema: `pnpm typecheck`.
- UI/layout: `pnpm lint`, `pnpm typecheck`, при риске регрессии - `pnpm test:e2e`.
- Контент уровней/ассеты: `pnpm validate:content`.
- Релизные изменения: `pnpm release:validate`.
- Широкие агентные правки: `pnpm agent:check`.
- Предрелизная агентная проверка: `pnpm agent:release-check`.

## Правила реализации

- Не расширяй scope без запроса. Следуй roadmap и текущим acceptance criteria.
- Не хардкодь видимые строки в компонентах; используй `src/i18n/ru/common.json` и `src/i18n/en/common.json`.
- Production locales: только `ru` и `en`; fallback `ru`.
- Не вызывай Yandex SDK напрямую из React-компонентов; работай через `src/services`.
- Сохранение не должно блокировать gameplay. Local fallback обязателен.
- Hit testing держи в `src/shared/lib/hitTesting.ts`; UI-компоненты не должны дублировать геометрию.
- Контент уровней должен оставаться data-driven и проходить Zod-валидацию.
- Scene art не заменяй внешними картинками без provenance/license записи.
- Для дизайна сверяйся с `docs/design-reference/tokens.json`; не меняй его без явной задачи.
- Для локальной проверки hitbox/layout используй `VITE_LAYOUT_DEBUG=true pnpm dev`; не оставляй debug-режим включенным в коде.
- Campaign asset folders, preview filenames and legacy folder spellings держи в `src/content/campaignManifest.ts`.

## Экономия токенов

- Начинай с `rg --files`, `rg "symbol"` и точечных чтений файлов.
- Сначала читай schemas/stores/tests рядом с изменяемой областью, потом общие документы.
- Не вставляй большие выдержки из документов в ответы; ссылайся на файл и конкретное решение.
- Не дублируй длинные спецификации в новых документах. Добавляй ссылки и краткие правила.
- Если задача затрагивает одну область, не проверяй весь pipeline без причины; выбери минимальный надежный набор команд.

## Git и рабочее дерево

- Не откатывай чужие изменения.
- Если `git status` блокируется из-за `safe.directory`, не меняй глобальный config без явной необходимости.
- Перед destructive-командами всегда получай явное подтверждение.
