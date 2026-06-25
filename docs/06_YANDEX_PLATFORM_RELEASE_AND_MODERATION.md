# Yandex Games platform, release and moderation specification

Версия: 1.0  
Дата фиксации: 2026-06-25

Этот документ закрывает платформенный lifecycle, модерацию, публикацию, rollback и каталоговые материалы.

Приоритет документов:

1. `game_concept.json`;
2. этот документ;
3. `05_MONETIZATION_I18N_AND_CLOUD_SAVE.md`;
4. `02_CODEX_IMPLEMENTATION_PROMPT.md`;
5. остальные документы.

---

# 1. Поддерживаемые платформы

В черновике Yandex Games отметить:

- Desktop;
- Mobile → Android;
- Mobile → iOS.

Не отмечать:

- TV.

Причина: launch build использует IAP, а TV-версия по требованиям платформы не должна содержать внутриигровые покупки. Отдельный TV-port возможен только позже как отдельная продуктовая задача.

## Orientation

В черновике выбрать `Any`.

Обязательные layouts:

- mobile portrait — полноэкранный A/B toggle;
- mobile landscape — две touch-фотографии рядом;
- tablet portrait — toggle либо адаптивный split;
- tablet landscape — side-by-side;
- desktop — side-by-side.

Поворот устройства не должен:

- сбрасывать уровень;
- повторно засчитывать отличие;
- менять активную сцену;
- терять timer daily;
- сбрасывать zoom в случайную точку;
- открывать системную прокрутку.

---

# 2. SDK lifecycle

## Initialization order

1. Подключить SDK по актуальному пути.
2. Подписаться на `game_api_pause` и `game_api_resume` как можно раньше.
3. Инициализировать Yandex SDK.
4. Получить `deviceInfo`, environment language и safeStorage.
5. Начать параллельно:
   - загрузку local save;
   - загрузку cloud save;
   - получение remote flags;
   - загрузку shell assets и locale.
6. Выполнить merge save.
7. Отрисовать полностью интерактивный Home или Continue screen.
8. Вызвать `ysdk.features.LoadingAPI.ready()` ровно один раз.
9. Не начинать gameplay, пока платформа находится в pause из-за стартовой рекламы.

## LoadingAPI.ready

Вызов разрешён, когда:

- нет blocking loader;
- первая кнопка работает;
- локализация готова;
- основной шрифт не вызывает layout shift;
- SDK failure имеет fallback;
- можно начать tutorial или продолжить игру.

Не ждать:

- загрузки всех сцен;
- полного альбома;
- optional audio;
- будущих глав.

Добавить guard:

```ts
let loadingReadySent = false;

function notifyGameReady(): void {
  if (loadingReadySent) return;
  loadingReadySent = true;
  ysdk.features.LoadingAPI?.ready();
}
```

## GameplayAPI

`start()`:

- фактически начался level;
- level resumed;
- закрыт pause menu;
- закрылась реклама/покупка и level действительно активен;
- пользователь вернулся на активную вкладку с gameplay.

`stop()`:

- level завершён;
- открыт pause/menu;
- начинается rewarded/interstitial;
- открывается purchase dialog;
- вкладка скрыта;
- получен platform pause event.

Создать единый `GameplayActivityController`. Нельзя вызывать методы хаотично из разных компонентов.

---

# 3. Автоматическая реклама на старте

Yandex может показывать fullscreen ad при запуске без прямых callbacks ad API.

Поэтому:

- `game_api_pause` полностью глушит звук;
- gameplay и timer не стартуют;
- canvas input заблокирован;
- `game_api_resume` разрешает продолжение;
- audio context возобновляется только корректно и с учётом browser gesture policy.

Тестировать сценарии:

- startup ad до Home;
- startup ad во время boot;
- resume до завершения cloud load;
- tab hide во время startup ad;
- двойной pause/resume.

---

# 4. Browser behavior

В gameplay area:

- `contextmenu` предотвращается;
- `user-select: none`;
- `-webkit-user-drag: none`;
- изображения не перетаскиваются браузером;
- body не скроллится;
- overscroll/swipe-to-refresh подавляется;
- pinch zoom браузера не конфликтует с zoom игры;
- long press не выделяет изображение;
- системные shortcuts не перехватываются.

Не блокировать:

- accessibility keyboard navigation;
- Tab;
- Escape, если он нужен для pause;
- системные комбинации браузера и ОС.

## Fullscreen

- игра должна работать без fullscreen;
- запрос fullscreen только после действия пользователя;
- учитывать platform fullscreen button;
- resize после входа/выхода не ломает layout.

---

# 5. Device detection

Основной источник:

```ts
const deviceInfo = ysdk.deviceInfo();
```

Fallback:

- CSS media queries;
- pointer/hover capabilities;
- viewport aspect ratio.

Не использовать user-agent как единственный источник.

Layout выбирается по реальной доступной области, а не только по метке mobile/desktop.

---

# 6. Remote Config

Запрашивать flags один раз на старте:

```ts
const flags = await ysdk.getFlags({
  defaultFlags: LOCAL_DEFAULT_FLAGS
});
```

Все значения строковые и проходят Zod/parser.

Launch flags:

```json
{
  "rewarded_enabled": "true",
  "interstitial_enabled": "true",
  "purchases_enabled": "true",
  "rating_prompt_enabled": "true",
  "shortcut_prompt_enabled": "false",
  "daily_enabled": "true",
  "max_interstitials_per_session": "2",
  "min_session_seconds_before_interstitial": "480",
  "disabled_level_ids": "",
  "disabled_daily_level_ids": "",
  "maintenance_message_key": "",
  "catalog_offer_enabled": "true"
}
```

## Kill switches

Remote Config должен позволять без нового build:

- отключить interstitial;
- отключить rewarded;
- скрыть покупки при проблеме каталога;
- временно отключить daily;
- исключить дефектный level/daily scene;
- отключить rating prompt;
- показать локализованное maintenance message.

Remote Config не может:

- удалить купленный entitlement;
- уменьшить сохранённый баланс;
- менять save schema;
- закрывать уже пройденный уровень;
- менять смысл продукта после покупки.

---

# 7. Rating prompt

Использовать только:

- `ysdk.feedback.canReview()`;
- `ysdk.feedback.requestReview()`.

Внутренняя eligibility:

- завершён level 6 или chapter;
- текущая сессия не содержит save/purchase/ad error;
- prompt появляется после result/reward, не после рекламы;
- не в tutorial;
- remote flag включён;
- один раз на сессию максимум.

Запрещено:

- собственное окно «поставьте 5 звёзд»;
- фильтрация только довольных пользователей через вопрос «вам понравилось?»;
- награда за оценку;
- блокировка интерфейса.

---

# 8. Desktop shortcut

В launch build код адаптера можно реализовать, но flag оставить `false`.

Будущая eligibility:

- desktop;
- вторая или более поздняя сессия;
- после daily/chapter positive moment;
- `canShowPrompt()` возвращает true;
- remote flag включён.

Не обещать награду за shortcut в первой версии.

---

# 9. Archive and build requirements

ZIP:

- `index.html` в корне;
- один `index.html`;
- uncompressed <= 100 MB;
- только ASCII paths;
- без пробелов в путях;
- без кириллицы в именах файлов/папок.

Build создаёт:

- `dist/`;
- `release-manifest.json`;
- `asset-manifest.json`;
- `THIRD_PARTY_NOTICES.md`;
- `release-notes.md`;
- checksum archive.

Version:

```text
1.0.0+20260625.1
```

Сохранять:

- текущий source tag;
- last-known-good ZIP;
- last-known-good save fixtures;
- migration fixtures;
- screenshot proof of smoke test.

---

# 10. Pre-moderation rehearsal

До отправки выполнить вручную и автоматизированно:

- чистый guest launch;
- authorized launch;
- local-only fallback;
- reload после одного найденного отличия;
- reload после покупки grant;
- startup ad pause/resume;
- rewarded error;
- interstitial error;
- rotation portrait ↔ landscape;
- minimize/restore;
- tab switch;
- resize;
- long press;
- right click;
- offline after boot;
- cloud timeout;
- account selection dialog;
- RU/EN;
- no console errors;
- no dead end;
- no browser scroll;
- all purchase content matches offers.

Использовать Yandex debug panel и prod local proxy before moderation.

---

# 11. Publication workflow

## First release

1. Freeze content.
2. Run all checks.
3. Produce release archive and checksum.
4. Test draft mode.
5. Add test-purchase account.
6. Test actual Yandex catalog and purchases.
7. Enable `Postpone publication`.
8. Submit for moderation.
9. After approval, run final verified-build smoke.
10. Publish manually.
11. Monitor for 2 hours.
12. Monitor after 24 hours.

## Update

Every update requires:

- release notes;
- save migration review;
- no core concept replacement;
- test of existing player save;
- test of owned purchases;
- test of disabled remote flags;
- updated version field.

## A/B build test

Use for:

- economy change;
- onboarding change;
- interstitial frequency;
- major comparator UX change.

Do not combine several unrelated hypotheses.

## Creative A/B

Use icon/cover tests separately. Do not change major gameplay during the same window, otherwise retention/conversion conclusions become ambiguous.

---

# 12. Catalog materials

Required RU and EN:

- title;
- SEO description;
- description;
- short description;
- how to play;
- icon;
- cover;
- screenshots.

## Requirements

- game name identical across game and all materials;
- screenshot contains at least 70% real gameplay;
- icon and cover are not raw screenshots;
- RU screenshots use RU;
- EN screenshots use EN;
- no fake UI or mechanics;
- no other game's assets;
- no horror/political/religious/military emphasis.

## Asset specs included in this package

- icon: 512 × 512 PNG;
- IAP icon: 256 × 256 PNG;
- vertical promo video: 9:16, up to 28 seconds.

Current draft form remains the final source for any field sizes that change.

---

# 13. CSP and external services

Default launch build should be self-contained.

Any external host requires:

- documented purpose;
- privacy review;
- CSP allowlist;
- timeout and fallback;
- no dependency for core gameplay.

Do not load:

- external images;
- external fonts;
- YouTube players;
- unapproved analytics scripts;
- remote JSON required for levels.

Yandex remote flags, player data, ads and purchases use the SDK.

---

# 14. Official documentation snapshot

Implementation decisions were checked against official Yandex Games documentation current on 2026-06-25:

- Game requirements;
- LoadingAPI and GameplayAPI;
- SDK events;
- Player data;
- Remote configuration;
- Game rating;
- Desktop shortcut;
- Environment and promotion referrer;
- Draft configuration;
- Testing;
- Build and creative A/B tests;
- Purchases and ads.

Codex must re-check signatures in official documentation if the SDK has changed.
