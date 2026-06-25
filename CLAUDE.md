# CLAUDE.md

Инструкция для Claude при работе с этим проектом. Используй ее как короткую карту контекста, а не как замену спецификациям.

## Роль

Проект - игра "Find the Differences: Anomaly Archive" на React/TypeScript для Yandex Games. Claude чаще всего нужен для дизайна, продуктовой проработки, текстов, структуры контента и ревью UX. При кодовых правках следуй тем же ограничениям, что и `AGENTS.MD`.

## Что читать сначала

Минимальный контекст:

1. `README.md`
2. `AGENTS.MD`
3. `docs/game_concept.json`
4. Только релевантные документы из раздела ниже

Релевантные документы:

- Дизайн и UX: `docs/design-reference/CODEX_HANDOFF.md`, `docs/design-reference/tokens.json`.
- Roadmap и scope: `docs/09_DEVELOPMENT_ROADMAP.md`.
- Технический стек и ассеты: `docs/03_TECHNICAL_STACK_AND_ART_PIPELINE.md`.
- i18n, монетизация, cloud save: `docs/05_MONETIZATION_I18N_AND_CLOUD_SAVE.md`.
- Yandex release/moderation: `docs/06_YANDEX_PLATFORM_RELEASE_AND_MODERATION.md`.
- Product analytics/liveops: `docs/07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md`.

Не читай весь `docs/` без причины. Для экономии контекста открывай только документы, напрямую связанные с задачей.

## Карта проекта

```text
src/app/               App shell, styles
src/screens/           Основные экраны приложения
src/features/gameplay/ PhotoComparator и gameplay UI
src/shared/store/      Zustand state, навигация, save lifecycle
src/shared/lib/        Чистая логика: hit testing, progression
src/shared/ui/         Переиспользуемые UI-компоненты
src/entities/          Zod-схемы level/save
src/services/          Platform и storage adapters
src/content/           Уровни и daily definitions
src/i18n/              RU/EN переводы
public/assets/         Runtime assets
docs/                  Спецификации, roadmap, дизайн-референсы
```

## Обязательное правило документации

После каждой правки обновляй документацию проекта. Это часть Definition of Done.

- Если меняется поведение или архитектура, обнови `ARCHITECTURE.md` или профильный документ в `docs/`.
- Если меняется контент, уровни или ассеты, обнови `CONTENT_PIPELINE.md`, `ASSET_MANIFEST.md` и при необходимости `ASSET_PROVENANCE.json`.
- Если меняется сохранение, обнови `SAVE_SCHEMA.md`.
- Если меняются UX-тексты, проверь обе локали: `src/i18n/ru/common.json` и `src/i18n/en/common.json`.
- Если изменение важно для следующего исполнителя, обнови `CHANGELOG.md`, `AGENTS.MD` или этот файл.

Если документация не менялась, в итоговом сообщении объясни почему.

## UX и продуктовые ограничения

- Основные full-screen views: Game Hub и Gameplay. Shop, collection, settings, results и story states должны быть overlays/panels, если roadmap не требует иначе.
- Production locales: `ru`, `en`; fallback `ru`.
- Не хардкодить видимые строки в компонентах.
- Тексты должны выдерживать английские строки на 20-40% длиннее русских.
- Touch targets минимум 44x44 px.
- Сохранение, реклама и SDK-ошибки не должны блокировать gameplay бесконечными состояниями.
- Цены и валюта покупок должны приходить из Yandex catalog, не из hardcode.

## Технические правила

- Команды проекта: `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm validate:content`, `pnpm build`.
- Не вызывай platform/Yandex SDK напрямую из UI; используй `src/services`.
- Геометрию отличий и hit testing держи в `src/shared/lib/hitTesting.ts`.
- Новые уровни должны быть data-driven и проходить schema validation.
- Scene assets требуют записи в manifest/provenance.
- Не меняй `docs/design-reference/tokens.json` без явного запроса.

## Экономия контекста

- Начинай с карты файлов и точечного поиска.
- Не копируй большие фрагменты спецификаций в ответ.
- Ссылайся на существующий документ вместо пересказа.
- Для ревью открывай только затронутые файлы, соседние тесты и профильные docs.
- Для небольших правок выбирай минимальные проверки, а не весь release pipeline.

