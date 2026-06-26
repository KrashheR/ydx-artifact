# Development roadmap — «Найди отличия: Архив аномалий»

Версия: 1.0  
Дата фиксации: 2026-06-25

Этот документ задаёт обязательный порядок разработки vertical slice.

Он нужен для трёх целей:

1. не начинать производство всех 15 сцен до проверки движка и UX;
2. не подключать Yandex SDK, покупки и облако слишком поздно;
3. на каждом этапе иметь законченную проверяемую сборку.

## Как использовать документ

Каждый этап имеет:

- цель;
- входные условия;
- конкретные задачи;
- результат;
- критерии завершения;
- запреты;
- ответственного;
- ориентировочную трудоёмкость.

Нельзя переходить к следующему этапу, если не пройден gate предыдущего.

`game_concept.json` остаётся главным источником истины по продукту. Этот документ определяет только порядок реализации.

---

# Общая схема

```text
0. Product freeze
        ↓
1. UX и дизайн-система
        ↓
2. Арт-пайплайн и три тестовые сцены
        ↓
3. Репозиторий и технический каркас
        ↓
4. Core gameplay: PhotoComparator
        ↓
5. Прогресс, сохранения и Yandex lifecycle
        ↓
6. Карта, коллекция, daily и streak
        ↓
7. Монетизация и покупки
        ↓
8. Производство и интеграция всех сцен
        ↓
9. I18n, каталог и промоматериалы
        ↓
10. QA, производительность и модерационный проход
        ↓
11. Release candidate и публикация
        ↓
12. Первые 14 дней и решение scale / iterate / stop
```

---

# Этап 0. Заморозка продукта и подготовка рабочей среды

## Цель

Зафиксировать scope до начала дизайна и кода.

## Входные условия

- starter kit распакован;
- `game_concept.json` доступен;
- выбрана папка будущего репозитория.

## Задачи

### Ручная работа

1. Прочитать `game_concept.json`.
2. Проверить:
   - название;
   - число уровней;
   - четыре экспоната;
   - монетизацию;
   - RU/EN;
   - desktop/mobile;
   - out-of-scope.
3. Создать Git-репозиторий.
4. Добавить:
   - `main`;
   - рабочую ветку `develop`;
   - правила branch naming.
5. Зафиксировать package manager: `pnpm`.
6. Установить Node LTS, совместимый с выбранными пакетами.
7. Создать папки:
   - `design-reference/`;
   - `art/`;
   - `legal/`;
   - `release/`;
   - `docs/`.
8. Добавить starter kit в репозиторий.
9. Создать issue/task board по этапам этого документа.

### Codex

Пока не писать production-код. Разрешено только:

- проверить структуру starter kit;
- найти противоречия между документами;
- сформировать `OPEN_QUESTIONS.md`, если обнаружены реальные блокеры.

## Результат

- Git-репозиторий;
- starter kit в корне;
- product scope заморожен;
- создан task board.

## Gate

Этап завершён, если:

- нет нерешённых вопросов, меняющих жанр или scope;
- out-of-scope принят;
- нет идеи «заодно добавить» новую мету;
- все участники используют один `game_concept.json`.

## Запрещено

- начинать 15 сцен;
- писать gameplay;
- добавлять второй архив;
- менять жанр после старта следующего этапа.

## Трудоёмкость

4–8 часов.

---

# Этап 1. UX, визуальная система и кликабельный прототип

## Цель

Получить полный production-ready дизайн до начала массовой вёрстки.

## Исполнитель

Claude Design + ручной review.

## Входные условия

Передать Claude Design:

- `game_concept.json`;
- `01_CLAUDE_DESIGN_PROMPT.md`;
- `03_TECHNICAL_STACK_AND_ART_PIPELINE.md`;
- `05_MONETIZATION_I18N_AND_CLOUD_SAVE.md`;
- `06_YANDEX_PLATFORM_RELEASE_AND_MODERATION.md`;
- `07_PRODUCT_ANALYTICS_LIVEOPS_SUPPORT.md`.

## Подэтап 1.1. Информационная архитектура

Спроектировать карту переходов:

- boot;
- home;
- intro;
- gameplay;
- result;
- map;
- collection;
- daily;
- shop;
- settings;
- errors;
- chapter finale.

### Gate 1.1

Нет экранов, из которых нельзя вернуться или продолжить.

## Подэтап 1.2. Design tokens

Зафиксировать:

- цвета;
- типографику;
- spacing;
- radii;
- shadows;
- border styles;
- icon grid;
- motion durations;
- z-index layers;
- desktop/mobile breakpoints.

### Gate 1.2

Все экраны строятся из общей системы, а не отдельными несвязанными макетами.

## Подэтап 1.3. Gameplay UX

Обязательно подготовить:

- desktop side-by-side;
- mobile portrait A/B toggle;
- mobile landscape side-by-side;
- zoom;
- pan;
- found marker;
- misclick;
- area hint;
- exact reveal;
- pause;
- ad loading/error;
- rotation.

### Gate 1.3

На размере 360 × 640 фотография остаётся главным объектом, а управление доступно одним пальцем.

## Подэтап 1.4. Полный state coverage

Подготовить все состояния из `01_CLAUDE_DESIGN_PROMPT.md`, включая:

- first user;
- returning user;
- local-only save;
- cloud recovered;
- rewarded unavailable;
- purchase cancel;
- disabled level;
- maintenance;
- rating request;
- diagnostics.

## Подэтап 1.5. Handoff

Положить в `design-reference/`:

- PNG основных экранов;
- responsive rules;
- component inventory;
- design tokens;
- motion notes;
- flow diagram;
- экспорт прототипа или исходники;
- каталоговые макеты.

## Результат

Полный кликабельный прототип и handoff для Codex.

## Gate

- Пройден весь первый сеанс.
- Пройден flow возвращающегося игрока.
- Есть desktop, portrait и landscape.
- Есть RU и representative EN.
- Все ошибки имеют выход.
- Нет экранов, противоречащих `game_concept.json`.

## Запрещено

- передавать Codex только 3–4 красивых экрана;
- оставлять mobile на усмотрение разработчика;
- использовать текст внутри игровых изображений.

## Трудоёмкость

18–30 часов с review и правками.

---

# Этап 2. Арт-пайплайн и три эталонные пары сцен

## Цель

Проверить, что производство контента реально масштабируется и сцены честно работают на mobile.

## Исполнитель

Ручная работа + image generation/editing tools.

## Почему только три сцены

До готового PhotoComparator нельзя производить все 15 пар. Иначе можно получить десятки красивых, но непригодных изображений.

## Эталонные сцены

1. Tutorial:
   - `nr-01-night-train`;
   - 4 крупных отличия.
2. Standard:
   - одна сцена средней сложности;
   - 6 отличий.
3. Hard:
   - одна плотная сцена;
   - 8 отличий.

## Подэтап 2.1. Scene briefs

Для каждой сцены:

- композиция;
- объектный список;
- lighting;
- planned differences;
- запрещённые изменения;
- позиции будущего HUD;
- mobile readability check.

## Подэтап 2.2. Master A

- создать master;
- убрать случайный текст;
- исправить перспективу;
- сохранить lossless source;
- записать provenance.

## Подэтап 2.3. Version B

Каждое отличие:

- отдельная mask/edit операция;
- сохранение промежуточной версии;
- отсутствие global rerender;
- отсутствие изменений вне mask.

## Подэтап 2.4. Diff validation

Проверить:

- blink A/B;
- pixel diff;
- threshold overlay;
- edge diff;
- 100% manual review;
- preview 390 px.

## Подэтап 2.5. Runtime export

- 1600 × 1000 WebP;
- A/B одинакового размера;
- отдельная thumbnail;
- ASCII paths;
- manifest;
- provenance checksum.

## Результат

Три production-quality пары сцен.

## Gate

- Незаявленных отличий нет.
- Все отличия объясняются словами.
- Tutorial виден без zoom.
- Hard-сцена проходима на телефоне.
- Runtime-пара не превышает разумный asset budget.
- Пайплайн задокументирован и повторяем.

## Запрещено

- генерировать A и B отдельно;
- начинать остальные 12 сцен;
- считать AI output финальным без ручной проверки.

## Трудоёмкость

20–35 часов.

---

# Этап 3. Репозиторий и технический каркас

## Цель

Создать воспроизводимую основу, на которой можно безопасно собирать все системы.

## Исполнитель

Codex.

## Входные условия

- утверждённый design handoff;
- три эталонные сцены;
- starter kit;
- чистый репозиторий.

## Задачи

1. Создать проект:
   - React;
   - TypeScript strict;
   - Vite;
   - Tailwind;
   - Zustand;
   - Zod;
   - i18next;
   - Vitest;
   - Playwright.
2. Настроить:
   - ESLint;
   - Prettier;
   - path aliases;
   - environment modes;
   - mock/yandex platform modes.
3. Создать архитектурные модули.
4. Реализовать:
   - App shell;
   - ErrorBoundary;
   - route/screen state;
   - theme;
   - locale bootstrap;
   - mock platform panel.
5. Создать JSON schemas:
   - level;
   - chapter;
   - artifact;
   - save;
   - monetization;
   - remote flags.
6. Реализовать content validation.
7. Добавить CI-команды.
8. Создать документацию:
   - README;
   - ARCHITECTURE;
   - IMPLEMENTATION_PLAN.

## Результат

Приложение запускается, показывает Home из дизайна и работает в mock mode.

## Gate

Все команды проходят:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:content
pnpm build
```

Дополнительно:

- отсутствуют hardcoded пользовательские строки;
- RU/EN переключаются;
- никакой gameplay пока не симулируется fake-компонентами.

## Запрещено

- смешивать всё в одном Zustand store;
- вызывать Yandex SDK из компонентов;
- встраивать уровни в TSX.

## Трудоёмкость

14–22 часа.

---

# Этап 4. Core gameplay — PhotoComparator

## Цель

Сделать основную механику полностью рабочей на всех устройствах.

## Исполнитель

Codex + ручное тестирование.

## Подэтап 4.1. Renderer

- Canvas2D или PixiJS;
- A/B textures;
- decode/loading states;
- viewport;
- resize;
- cleanup.

## Подэтап 4.2. Camera

- normalized coordinates;
- zoom;
- pan;
- bounds;
- synchronized A/B;
- camera persistence.

## Подэтап 4.3. Hit testing

- circle;
- polygon;
- separate A/B areas;
- touch/mouse coordinates;
- pan threshold;
- no repeated hit.

## Подэтап 4.4. Desktop UX

- side-by-side;
- mouse wheel;
- drag;
- keyboard zoom;
- markers on both images.

## Подэтап 4.5. Mobile portrait

- A/B toggle;
- hold compare;
- shared camera;
- one-hand controls;
- no accidental browser gestures.

## Подэтап 4.6. Mobile landscape

- side-by-side touch;
- pinch;
- pan;
- compact HUD;
- rotation preservation.

## Подэтап 4.7. Gameplay rules

- found difference;
- misclick;
- accuracy;
- rapid misclick lock;
- area hint;
- exact reveal;
- level completion;
- seals.

## Подэтап 4.8. Dev level editor

- import A/B;
- draw circle/polygon;
- separate hit areas;
- hint area;
- mobile preview;
- diff overlay;
- export JSON.

## Результат

Три эталонных уровня полностью проходимы.

## Gate

- desktop, portrait и landscape работают;
- reload после найденного отличия готов к интеграции;
- hitbox tests проходят;
- pan не считается misclick;
- no layout shift;
- textures освобождаются;
- E2E проходит на 390 × 844 и 844 × 390.

## Запрещено

- переходить к карте до стабильного comparator;
- использовать DOM-overlay на каждый пиксельный объект;
- игнорировать mobile landscape.

## Трудоёмкость

30–45 часов.

---

# Этап 5. Прогресс, Yandex cloud-save и platform lifecycle

## Цель

Сделать прогресс надёжным до добавления меты и покупок.

## Исполнитель

Codex.

## Подэтап 5.1. Platform lifecycle

- ранняя SDK subscription;
- startup ad;
- LoadingAPI.ready once;
- GameplayAPI;
- pause/resume;
- visibility;
- audio suspend;
- input lock.

## Подэтап 5.2. Local mirror

Priority:

1. `ysdk.getStorage()`;
2. `window.localStorage`;
3. memory fallback.

## Подэтап 5.3. Yandex cloud

- `getPlayer`;
- `getData`;
- `setData`;
- guest;
- authorized;
- timeout;
- retry;
- flush strategy.

## Подэтап 5.4. Merge and migrations

- versioned save;
- local/cloud merge;
- best results;
- union progress;
- purchase ledger placeholders;
- migration fixtures.

## Подэтап 5.5. Save UI

- saving;
- saved;
- local only;
- retrying;
- recovered;
- conflict.

## Подэтап 5.6. Account selection

- pause sync;
- local save;
- reload Player;
- merge;
- safe navigation.

## Результат

Три уровня можно закрывать и продолжать на другом запуске без потери прогресса.

## Gate

Обязательные тесты:

- reload после каждого difference;
- cloud newer;
- local newer;
- SDK timeout;
- localStorage blocked;
- safeStorage unavailable;
- account switch;
- old schema migration;
- pagehide;
- startup ad before save load.

Не переходить дальше при любой воспроизводимой потере прогресса.

## Трудоёмкость

26–40 часов.

---

# Этап 6. Прогрессия и лёгкая мета

## Цель

Собрать полноценный вертикальный игровой цикл вокруг core gameplay.

## Исполнитель

Codex.

## Подэтап 6.1. Chapter map

- 12 узлов;
- locked/available/completed;
- seals;
- artifact milestones;
- disabled level redirect.

## Подэтап 6.2. Results

- completion;
- three seals;
- rewards;
- first-completion state;
- no duplicate rewards.

## Подэтап 6.3. Artifacts

- four artifacts;
- locked/new/viewed;
- reveal;
- album;
- no repeated reveal after reload.

## Подэтап 6.4. Daily

- deterministic scene by server date;
- soft timer;
- reward once;
- replay;
- date rollover;
- disabled daily scene fallback.

## Подэтап 6.5. Streak

- day 1;
- day 2;
- day 3 cosmetic;
- missed day;
- cloud persistence.

## Подэтап 6.6. Chapter finale

- final artifact;
- restored route;
- teaser;
- safe return home.

## Результат

Полный first-session и returning-session flow на трёх тестовых сценах и placeholder nodes.

## Gate

- нельзя получить reward дважды;
- daily не ломается при смене даты;
- artifact reveal не повторяется;
- disabled node не блокирует campaign;
- progression сохраняется в Yandex.

## Трудоёмкость

24–36 часов.

---

# Этап 7. Монетизация, покупки и Remote Config

## Цель

Подключить доход без риска потери покупок и прогресса.

## Исполнитель

Codex + ручное тестирование в Yandex environment.

## Подэтап 7.1. Remote Config

- local defaults;
- Yandex flags;
- validation;
- kill switches;
- maintenance;
- disabled levels;
- ad frequency.

## Подэтап 7.2. Rewarded

- exact hint;
- post-level magnifiers;
- daily multiplier;
- success/close/error;
- exactly-once reward.

## Подэтап 7.3. Interstitial

- eligibility;
- map only;
- pause/resume;
- no simultaneous ads;
- no forced ads entitlement.

## Подэтап 7.4. Catalog

- dynamic product title;
- description;
- price;
- currency;
- icon;
- fallback state.

## Подэтап 7.5. Purchases

- supporter pack;
- consumable magnifiers;
- cloud grant before consume;
- idempotency ledger;
- startup recovery;
- cancel/error.

## Подэтап 7.6. Test account

- add Yandex test purchase account;
- perform actual platform tests;
- verify pending purchase recovery.

## Результат

Полная monetization работает в mock и draft environment.

## Gate

- purchase grant mismatch = 0;
- supporter pack survives reload;
- no forced ads after entitlement;
- rewarded remains optional;
- consumable crash-between-grant-and-consume test passes;
- flags can disable monetization.

## Запрещено

- тестировать покупки только в mock;
- consume до cloud save;
- переходить к production content при потере purchase.

## Трудоёмкость

20–32 часа.

---

# Этап 8. Производство и интеграция полного контента

## Цель

Заменить placeholder content на все 12 campaign и 3 daily scenes.

## Исполнитель

Арт-пайплайн + Codex integration + ручной QA.

## Производственный порядок

Не делать все изображения одним большим batch.

### Batch A

- уровни 1–3;
- один artifact;
- полная интеграция;
- difficulty review.

### Batch B

- уровни 4–6;
- второй artifact;
- progression review.

### Batch C

- уровни 7–9;
- третий artifact;
- mobile performance review.

### Batch D

- уровни 10–12;
- финальный artifact;
- chapter finale.

### Batch E

- 3 daily scenes.

## Для каждой сцены

1. brief;
2. master A;
3. cleanup;
4. B edits;
5. diff validation;
6. export;
7. provenance;
8. hitboxes;
9. JSON;
10. desktop QA;
11. mobile portrait QA;
12. mobile landscape QA;
13. analytics metadata;
14. difficulty check.

## Результат

Все 15 сцен production-ready.

## Gate каждого batch

- content validation проходит;
- assets не выходят за budget;
- нет незаявленных differences;
- level completion rate на internal testers приемлем;
- save compatibility сохранена;
- disabled-level fallback работает.

## Трудоёмкость

70–120 часов.

Это самый ручной и наименее автоматизируемый этап.

---

# Этап 9. I18n, тексты, каталог и промоматериалы

## Цель

Подготовить полный RU/EN продукт и карточку Yandex Games.

## Исполнитель

Ручная редактура + Claude Design + Codex validation.

## Подэтап 9.1. Runtime i18n

- RU;
- EN;
- parity;
- plural;
- dates;
- product fallback;
- manual switch;
- cloud persistence.

## Подэтап 9.2. Copy QA

Проверить:

- естественный русский;
- естественный английский;
- отсутствие машинных кальк;
- длину кнопок;
- 360 px;
- отсутствие mixed language.

## Подэтап 9.3. Catalog

Подготовить:

- title;
- short description;
- full description;
- how to play;
- categories;
- age;
- cloud checkbox;
- platform/orientation settings.

## Подэтап 9.4. Creatives

- 512 icon;
- cover;
- RU desktop screenshots;
- EN desktop screenshots;
- RU mobile screenshots;
- EN mobile screenshots;
- landscape screenshot;
- optional vertical video.

## Результат

Готовая RU/EN карточка и полный runtime translation.

## Gate

- в Yandex draft объявлены только RU/EN;
- name identical everywhere;
- screenshots показывают реальный gameplay;
- short description limits соблюдены;
- no fake UI;
- i18n E2E проходит.

## Трудоёмкость

16–28 часов.

---

# Этап 10. QA, производительность, accessibility и модерационный проход

## Цель

Превратить feature-complete build в release candidate.

## Исполнитель

Codex automation + ручное тестирование.

## Подэтап 10.1. Automated

- unit;
- integration;
- E2E;
- content validation;
- save fixtures;
- release validation;
- path validation;
- archive size;
- provenance;
- i18n.

## Подэтап 10.2. Browser matrix

Проверить матрицу из `game_concept.json`.

## Подэтап 10.3. Performance

- Game Ready;
- first scene;
- scene switch;
- p10 FPS;
- memory over 13 levels;
- input latency;
- decode failure;
- canvas loss.

## Подэтап 10.4. Accessibility

- keyboard;
- focus;
- reduced motion;
- sound/vibration;
- touch targets;
- color-independent states;
- readable text.

## Подэтап 10.5. Platform scenarios

- startup ad;
- rewarded;
- interstitial;
- purchase;
- tab hide;
- rotation;
- fullscreen;
- account switch;
- cloud failure;
- remote maintenance.

## Подэтап 10.6. Internal moderation rehearsal

Полностью пройти `08_RELEASE_READINESS_CHECKLIST.md`.

## Результат

Release candidate без known blocker issues.

## Gate

- все обязательные команды зелёные;
- no SEV0/SEV1;
- no console errors;
- no dead ends;
- no save loss;
- no purchase mismatch;
- checklist завершён;
- last-known-good archive создан.

## Трудоёмкость

35–55 часов.

---

# Этап 11. Release candidate, модерация и публикация

## Цель

Безопасно выпустить игру и сохранить возможность rollback.

## Исполнитель

Ручная работа + Codex release tooling.

## Подэтап 11.1. Freeze

- content freeze;
- code freeze;
- version;
- release notes;
- checksum;
- Git tag.

## Подэтап 11.2. Final archive

Сгенерировать:

- ZIP;
- release manifest;
- asset manifest;
- content manifest;
- checksum;
- third-party notices.

## Подэтап 11.3. Yandex testing

- local proxy;
- draft;
- debug panel;
- test purchases;
- ads;
- save;
- RU/EN.

## Подэтап 11.4. Moderation

- включить postponed publication;
- приложить developer notes;
- отправить;
- не запускать параллельную moderation/A-B submission.

## Подэтап 11.5. Approved build smoke

После одобрения:

- открыть именно проверенную сборку;
- tutorial;
- save;
- ad;
- purchase catalog;
- rotation;
- locale.

## Подэтап 11.6. Publish

- ручная публикация;
- первые 2 часа мониторинга;
- проверка через 24 часа.

## Результат

Игра опубликована, rollback archive сохранён.

## Gate

- опубликована проверенная версия;
- remote kill switches доступны;
- support inbox работает;
- purchase recovery работает.

## Трудоёмкость

8–16 часов без времени ожидания модерации.

---

# Этап 12. Первые 14 дней после релиза

## Цель

Понять, стоит ли масштабировать проект.

## День 0–3

Исправлять только:

- launch blocker;
- save;
- purchase;
- ad deadlock;
- severe layout;
- bad level blocker.

## День 4–7

Анализировать:

- Game Ready;
- tutorial;
- level 3;
- session duration;
- save errors;
- rating;
- reviews;
- mobile complaints.

Допустимы:

- copy;
- hitbox;
- difficulty;
- loading;
- ad frequency.

## День 8–14

Анализировать:

- D1/D7;
- daily use;
- chapter completion;
- rewarded;
- purchases;
- bad differences;
- repeat sessions.

## Решение Day 14

### Scale

Запуск производства следующего content pack, если:

- save/purchases стабильны;
- rating безопасен;
- funnel приемлем;
- есть возвращаемость;
- mobile complaints не системные.

### Iterate

Ещё один короткий цикл, если:

- люди играют долго, но не возвращаются;
- проблема сосредоточена в daily или нескольких уровнях;
- interstitial снижает retention;
- onboarding можно улучшить.

### Stop/reposition

Не производить десятки новых сцен, если:

- tutorial стабильно проваливается;
- большинство сессий меньше минуты;
- рейтинг опасно низок;
- качество сцен вызывает массовый негатив;
- save trust не восстановлен.

## Трудоёмкость

12–24 часа анализа и правок в течение двух недель.

---

# Параллельные потоки

Некоторые задачи можно выполнять параллельно, но только после нужных gates.

## После Gate 1

Параллельно:

- Codex начинает этап 3;
- арт начинается с трёх сцен этапа 2.

## После Gate 4

Параллельно:

- gameplay hardening;
- производство Batch A;
- подготовка карты и коллекции.

## После Gate 5

Параллельно:

- meta;
- monetization adapters;
- дальнейший scene production.

## Нельзя параллелить

- все 15 сцен до проверки comparator;
- production purchases до cloud-save;
- massive content до stable save;
- moderation до полного release checklist.

---

# Рекомендуемый task board

## Epic 0 — Product foundation

- P0-01 Product freeze
- P0-02 Repository
- P0-03 Starter kit verification

## Epic 1 — Design

- D1-01 User flow
- D1-02 Tokens
- D1-03 Gameplay desktop
- D1-04 Mobile portrait
- D1-05 Mobile landscape
- D1-06 Meta screens
- D1-07 Monetization/save states
- D1-08 Handoff

## Epic 2 — Art pipeline

- A2-01 Tutorial master
- A2-02 Tutorial B
- A2-03 Standard pair
- A2-04 Hard pair
- A2-05 Diff validation
- A2-06 Provenance

## Epic 3 — Foundation

- E3-01 Project bootstrap
- E3-02 Architecture
- E3-03 Validation
- E3-04 I18n bootstrap
- E3-05 Mock platform
- E3-06 CI

## Epic 4 — Gameplay

- G4-01 Renderer
- G4-02 Camera
- G4-03 Hit testing
- G4-04 Desktop
- G4-05 Portrait
- G4-06 Landscape
- G4-07 Hints
- G4-08 Results
- G4-09 Editor

## Epic 5 — Platform and saves

- S5-01 Lifecycle
- S5-02 Local mirror
- S5-03 Cloud
- S5-04 Merge
- S5-05 Migrations
- S5-06 Account switch
- S5-07 Save UI

## Epic 6 — Meta

- M6-01 Map
- M6-02 Results
- M6-03 Artifacts
- M6-04 Daily
- M6-05 Streak
- M6-06 Finale

## Epic 7 — Monetization

- MON7-01 Remote flags
- MON7-02 Rewarded
- MON7-03 Interstitial
- MON7-04 Catalog
- MON7-05 Supporter pack
- MON7-06 Consumable
- MON7-07 Recovery

## Epic 8 — Content

- C8-A Batch 1–3
- C8-B Batch 4–6
- C8-C Batch 7–9
- C8-D Batch 10–12
- C8-E Daily
- C8-F Artifacts

## Epic 9 — Launch preparation

- L9-01 RU/EN QA
- L9-02 Catalog
- L9-03 Creatives
- L9-04 Performance
- L9-05 Moderation rehearsal
- L9-06 RC
- L9-07 Publish

---

# Общая оценка трудоёмкости

Оценка предполагает активное использование Claude Design и Codex, но включает ручную проверку.

| Направление | Оценка |
|---|---:|
| Product setup | 4–8 ч |
| Design и handoff | 18–30 ч |
| Арт-пайплайн и три эталона | 20–35 ч |
| Engineering foundation | 14–22 ч |
| Core gameplay | 30–45 ч |
| Saves и Yandex lifecycle | 26–40 ч |
| Meta | 24–36 ч |
| Monetization | 20–32 ч |
| Остальной контент | 70–120 ч |
| I18n и каталог | 16–28 ч |
| QA и release hardening | 35–55 ч |
| Release | 8–16 ч |
| Первые 14 дней | 12–24 ч |

**Итого:** примерно 297–491 человеко-час.

Более реалистичный календарный диапазон для одного разработчика:

- full-time: 8–12 недель;
- неполный день: 14–22 недели.

Главная переменная — скорость производства и ручной проверки 15 пар изображений. Код с AI-инструментами ускоряется сильнее, чем честный арт-контент и QA.

---

# Критический путь

Эти задачи определяют минимальную длительность проекта:

```text
Design gameplay UX
→ three validated scene pairs
→ PhotoComparator
→ Yandex cloud-save
→ progression
→ purchases
→ 15 validated scenes
→ full QA
→ moderation
```

Ускорение задач вне этой цепочки почти не сокращает дату релиза.

---

# Главное правило управления проектом

На каждом этапе должна существовать рабочая сборка:

- после этапа 3 — работает Home;
- после этапа 4 — работает gameplay;
- после этапа 5 — gameplay переживает reload;
- после этапа 6 — работает полный игровой цикл;
- после этапа 7 — работает бизнес-модель;
- после этапа 8 — готов полный контент;
- после этапа 10 — готов release candidate.

Нельзя компенсировать неготовую базовую систему количеством экранов или сцен.
