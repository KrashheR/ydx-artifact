# 02 — Техническая архитектура

Как мета ложится на текущий код. Ссылки на реальные модули репозитория; агент обязан проверить актуальность перед правкой.

## 0. Опорные точки текущего кода

- Save: `src/entities/save/schema.ts` — Zod, `SAVE_VERSION = 2`, миграции v1→v2 уже есть; merge-правила cloud/local описаны в `SAVE_SCHEMA.md`.
- Store: `src/shared/store/gameStore.ts` (~740 строк) — Zustand, навигация через `route`, `completeLevel` уже начисляет лупы/daily/streak/interstitial-очередь.
- Прогрессия: `src/shared/lib/progression.ts` — `starsForAccuracy`, `isBetterLevelResult`, `unlockedArtifactsForCompleted`.
- Контент: `src/content/*` — data-driven, схемы в `src/entities/level`, валидация `pnpm validate:content`.
- Экраны: `src/screens/HomeScreen.tsx` (хаб), `CollectionScreen.tsx`, оверлеи в `src/features/gameplay/`.
- Reveal-очередь артефактов уже реализована (модалка + тост) — образец для «ритуала возврата».

## 1. Save schema v3

Новый блок `cabinet` в `saveSchema`, `SAVE_VERSION = 3`, миграция v2→v3 (детерминированная: всё вычислимо из существующих `completedLevels`/`bestResults`/`daily`):

```ts
cabinet: z.object({
  schemaVersion: z.literal(1),
  // Стена: качество снимка выводится из bestResults, хранить не нужно.
  // Храним только то, что игрок сделал сам:
  hungPrintLevelIds: z.array(z.string()),        // повешенные снимки (для ритуала «нового»)
  boardLinks: z.array(z.object({                  // решённые связи на доске
    fromClueId: z.string(),
    toClueId: z.string()
  })),
  stamps: z.array(z.object({                      // штамп-альбом
    date: z.string(),                             // YYYY-MM-DD
    kind: z.enum(["daily", "weekly-special", "seal-7", "seal-14", "seal-30"])
  })),
  rankPoints: z.number().int().nonnegative(),
  claimedRankRewards: z.array(z.string()),
  mapFragments: z.array(z.string()),              // fragment ids
  caseSeals: z.array(z.string()),                 // chapterId печатей дел
  pendingReveals: z.array(z.string())             // очередь ритуала возврата
})
```

Принципы:

- **Derive, don't store.** Качество отпечатка, доступные фрагменты, ранг — выводятся селекторами из save; храним только выбор игрока и очереди. Меньше миграций и конфликтов.
- Merge-правила (дополнить `SAVE_SCHEMA.md`): union по всем массивам, max по `rankPoints`. Консервативно и без потерь — в духе существующих правил.
- Streak-эскалация: расширить `daily` полем `bestStreak` (для «восстановить серию» и наград 7/14/30).

## 2. Контент-модули (новые файлы в `src/content/`)

- `cabinetLayout.ts` — слоты кабинета: id, зона, координаты в проценты от интерьера, условие разблокировки (rank id). Тот же паттерн, что `campaignManifest.ts`.
- `boardGraphs.ts` — граф улик на кампанию: узлы (artifactId | levelId), правильные рёбра, дистракторы, текст вывода (ключи i18n). Zod-схема + включение в `pnpm validate:content` (проверка: все id существуют, граф связен, дистракторы не совпадают с правильными).
- `ranks.ts` — пороги рангов, награды (id декор-слотов).
- `mapFragments.ts` — фрагменты карты: id, условие (levelId+3★ | caseSeal), позиция на карте.
- `dailyModifiers.ts` — детерминированный выбор сцены и модификатора по дате (расширение текущей логики `dailyArchive.ts`; выходные — архивные сцены).

## 3. Store

Не раздувать `gameStore.ts` дальше — выделить slice-файлы, собираемые в тот же store (Zustand поддерживает композицию):

- `src/shared/store/cabinetSlice.ts` — действия: `hangPrint`, `attemptBoardLink`, `claimStamp`, `claimRankReward`, `enqueueReveal`/`consumeReveal`.
- Хук в `completeLevel` (существующий): после подсчёта результата — начислить rankPoints, mapFragments, поставить pendingReveals. Только чистые функции из `src/shared/lib/cabinetProgression.ts` (новый модуль, рядом с `progression.ts`, с юнит-тестами).
- Навигация: новый `route` `{ kind: "cabinet" }` + оверлеи `wall | board | album | map` как состояние внутри кабинета, не отдельные routes (правило концепта: full-screen только Hub и Gameplay).

## 4. UI

- `src/screens/CabinetScreen.tsx` — интерьер: один фон-изображение + абсолютные слоты (проценты), как PhotoComparator позиционирует маркеры. Touch-цели ≥44px.
- `src/features/cabinet/` — `WallOverlay.tsx`, `BoardOverlay.tsx`, `StampAlbumOverlay.tsx`, `MeridianMapOverlay.tsx`, `RevealRitual.tsx` (переиспользовать паттерн ArtifactFoundToast/reveal-модалки).
- Нить на доске: SVG-полилинии поверх фона доски; анимация — Framer Motion (уже в стеке). Никакого canvas для MVP.
- Все строки — через i18n (`src/i18n/ru|en/common.json`), EN на 20–40% длиннее — проверять переполнение.

## 5. Фотолаборатория (T5)

- Зеркальная печать: flip контейнера сцены CSS-transform + зеркалирование хитбоксов в `hitTesting.ts` (чистая функция `mirrorDifference(d, sceneWidth)` с тестами; вся геометрия остаётся в hitTesting — правило CLAUDE.md).
- Ночной негатив: CSS-фильтр на изображениях сцены; проверить читаемость на 3–5 сценах прежде чем включать глобально.
- Виньетка: оверлей-маска, следующая за камерой компаратора.
- Режим задаётся параметром запуска уровня (`mode: "lab"`, `modifier`), результат не пишет в `bestResults` кампании — отдельный `labResults`.

## 6. Миграции и риски

| Риск | Митигция |
|---|---|
| Конфликт cloud/local при выкатке v3 | Union-merge массивов; миграция идемпотентна; тест на save v1/v2/v3 во всех комбинациях |
| Рост бандла (интерьер, доска) | WebP, `pnpm assets:optimize`; интерьер лениво после LoadingAPI.ready |
| Ритуал возврата раздражает | Максимум 3 reveal за вход, остальное молча; skip по тапу |
| `gameStore.ts` превращается в монолит | Slices + чистые функции в `shared/lib`, ревью-гейт в тирах |
| Регресс существующих флоу (interstitial, review prompt) | Существующие тесты `MapScreen.*.test.tsx`, `gameStore.test.ts` должны проходить без правок ожиданий, кроме осознанных |

## 7. Definition of Done любой кодовой задачи меты

`pnpm lint && pnpm typecheck && pnpm test && pnpm validate:content` зелёные; новые чистые функции покрыты юнит-тестами; строки в обеих локалях; обновлены `SAVE_SCHEMA.md`/`CONTENT_PIPELINE.md`/`ARCHITECTURE.md` при затрагивании; чекбокс в `05_PROGRESSION_TIERS.md` проставлен.
