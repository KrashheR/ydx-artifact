# Product analytics, LiveOps, support and content operations

Версия: 1.0  
Дата фиксации: 2026-06-25

Этот документ описывает, что происходит после того, как vertical slice технически готов.

---

# 1. Зачем нужен operations layer

Основной риск этой игры — не отсутствие функций, а четыре операционных проблемы:

1. плохая сцена незаметно ломает retention;
2. save/ad/purchase-баг быстро разрушает рейтинг;
3. без событий невозможно понять, где игроки уходят;
4. бессистемные обновления увеличивают объём контента, но не улучшают продукт.

Поэтому analytics, QA и support являются частью Definition of Done.

---

# 2. Главная продуктовая воронка

```text
catalog impression
→ game open
→ Game Ready
→ first interaction
→ tutorial start
→ tutorial complete
→ level 2
→ daily unlocked
→ level 3
→ first artifact
→ level 6
→ chapter complete
→ next-day return
```

Для каждого шага считать:

- unique players;
- conversion from previous step;
- time to step;
- device;
- locale;
- first/returning session;
- save mode: cloud/local-only.

---

# 3. Internal vertical-slice targets

Это внутренние ориентиры, а не обещания платформы.

| Метрика | Начальная цель |
|---|---:|
| Tutorial completion | ≥ 75% |
| Reach level 3 | ≥ 45% |
| Reach level 6 | ≥ 25% |
| Complete chapter | ≥ 12% |
| D1 return | около 15% и выше |
| Median first session | ≥ 8 минут |
| Player rating goal | 4.2+ |
| Crash-free sessions | ≥ 99.5% |
| Save error rate | < 0.5% |
| Purchase grant mismatch | 0 |

Не принимать решение по одной метрике или одному дню.

---

# 4. Level analytics

Для каждого level:

- starts;
- completions;
- abandonment;
- median/percentile duration;
- accuracy;
- misclick count;
- hint use;
- zoom use;
- mobile compare toggles;
- exit point;
- performance;
- retry count.

Для каждого difference:

- time from level start to find;
- find order;
- misclicks near area;
- area hint use;
- exact reveal use;
- viewport zoom when found.

## Bad difference detector

Difference отправляется на review, если выполняется одно из условий:

- exact-hint rate в 2 раза выше медианы уровня;
- median time-to-find заметно выше других;
- игроки часто нажимают в одну соседнюю незаявленную область;
- на mobile difference почти всегда находят только после zoom;
- отличается compression/noise, а не смысловой объект.

## Bad level detector

- abandonment spike;
- median duration выходит далеко за target;
- accuracy резко падает;
- save/performance errors привязаны к asset;
- жалобы называют конкретную сцену.

Дефектный level можно временно отключить через Remote Config.

---

# 5. Event quality rules

Каждое событие:

- имеет schema version;
- имеет timestamp;
- имеет anonymous session id;
- не содержит имени, email, Yandex profile data;
- не содержит полный save;
- не содержит raw error stack в пользовательскую аналитику;
- имеет environment: mock/draft/prod;
- имеет game version и content version.

Не отправлять `difference_found` на каждый frame или pointer move.

Errors дедуплицировать по fingerprint.

---

# 6. Performance telemetry

Собирать:

- SDK init duration;
- save load duration;
- Game Ready duration;
- scene fetch/decode duration;
- first input delay approximation;
- FPS sample during zoom/pan;
- memory warning where available;
- asset load failure;
- canvas context loss;
- long tasks;
- unhandled errors.

Targets:

- Game Ready p75 desktop <= 4 sec;
- Game Ready p75 mobile <= 6 sec;
- scene switch p75 <= 2 sec;
- input p95 <= 100 ms;
- p10 FPS on midrange mobile >= 45.

Если внешняя error telemetry не подключена, хранить компактный ring buffer последних ошибок локально для Copy diagnostics.

---

# 7. Copy diagnostics

Settings содержит действие «Скопировать данные диагностики».

Пример:

```json
{
  "gameVersion": "1.0.0+20260625.1",
  "contentVersion": "2026.06.1",
  "saveSchemaVersion": 3,
  "platformMode": "yandex",
  "deviceCategory": "mobile",
  "locale": "ru",
  "viewport": "390x844",
  "currentLevelId": "nr-06-polar-greenhouse",
  "saveMode": "cloud-synced",
  "lastErrorCode": "ASSET_DECODE_FAILED",
  "sessionId": "anonymous-random-id"
}
```

Не включать:

- Yandex user ID;
- имя;
- purchase token;
- полный save;
- browser history;
- device fingerprint.

---

# 8. Review prompt and review operations

## In-game request

Запрашивать rating только после positive moment:

- level 6 с хорошим completion;
- chapter completion.

Условия:

- `canReview()` true;
- нет ошибок в сессии;
- не сразу после рекламы;
- remote flag enabled.

Не выдавать reward.

## Работа с отзывами

Первый месяц:

- проверять дважды в неделю;
- группировать темы;
- отвечать на воспроизводимые проблемы;
- не спорить;
- не обвинять устройство пользователя;
- просить diagnostic code только без персональных данных.

После первого месяца:

- еженедельно.

Review taxonomy:

- save loss;
- ads;
- mobile control;
- scene unfairness;
- performance;
- translation;
- content volume;
- purchase;
- praise/request.

---

# 9. Incident response

## SEV0

- потеря покупок;
- массовая потеря прогресса;
- двойное списание/невыдача purchase.

Действия:

1. отключить покупки remote flag;
2. не consume новые покупки до безопасного grant;
3. сохранить evidence;
4. подготовить hotfix;
5. проверить recovery всех pending purchases.

## SEV1

- игра не запускается;
- blocker level;
- бесконечный ad/save loader;
- black screen after ad.

Действия:

1. отключить feature или level flag;
2. проверить last-known-good;
3. hotfix;
4. smoke all platform lifecycle scenarios.

## SEV2

- break на одном device class;
- конкретная сцена;
- локализация;
- сильная просадка performance.

## SEV3

- cosmetic;
- copy;
- mild animation issue.

---

# 10. Release cadence

## Day 0–3

Только:

- crash;
- save;
- purchase;
- ad deadlock;
- blocker;
- severe layout.

Не добавлять новые systems.

## Day 4–14

Разрешено:

- onboarding copy;
- hitbox correction;
- difficulty;
- ad frequency;
- loading optimization;
- translation fixes.

## Day 14 decision

### Scale

Если:

- сохранения стабильны;
- рейтинг безопасен;
- tutorial/level funnel приемлем;
- нет массовых жалоб на mobile;
- session duration показывает реальную игру.

### Iterate

Если:

- первая сессия хорошая, return слабый;
- несколько плохих уровней портят funnel;
- monetization ухудшает retention;
- daily не даёт возврата.

### Stop/reposition

Если после исправлений:

- tutorial completion остаётся низким;
- большинство сессий < 60 sec;
- рейтинг движется к platform risk;
- AI scenes системно воспринимаются как некачественные.

---

# 11. Content cadence after validation

Если проект проходит go/no-go:

- выпускать по 6 сцен;
- один тематический mini-archive;
- один новый artifact set;
- сначала internal QA;
- затем build A/B или controlled update.

Не выпускать одиночную непроверенную сцену в production.

## Content pack checklist

- visual brief;
- master A;
- controlled B;
- diff validation;
- hitbox QA;
- mobile QA;
- difficulty pilot;
- localization;
- thumbnail;
- analytics metadata;
- asset provenance;
- content manifest version.

---

# 12. Stable IDs and content removal

Level IDs никогда не переиспользуются.

Если level удалён:

- completion сохраняется;
- reward не отнимается;
- map безопасно переходит к следующему узлу;
- in-progress save мигрируется;
- old ID остаётся в migration map.

Artifact IDs тоже стабильны.

---

# 13. Remote experiments

Одна гипотеза на эксперимент.

Хорошо:

- 8 vs 12 минут до первого interstitial;
- новая tutorial подсказка;
- portrait compare button placement;
- post-level rewarded prominence.

Плохо:

- одновременно новый tutorial, новая экономика, новый icon и частота рекламы.

Не менять major gameplay во время creative A/B.

---

# 14. Catalog conversion operations

После публикации можно A/B-тестировать icon и cover.

Оценивать не только CTR, но и:

- Conversion To Play;
- timespent per player;
- player-days;
- revenue;
- purchase metrics.

Креатив, который даёт высокий CTR и низкий play conversion, вероятно, обещает не ту игру.

---

# 15. AI asset provenance

Для каждого generated asset хранить ledger:

```json
{
  "assetId": "nr-01-master-a",
  "toolOrModel": "documented-tool-name",
  "generationDate": "2026-06-25",
  "sourcePromptPath": "art/prompts/nr-01.md",
  "sourceMasterPath": "art/source/nr-01-a.png",
  "humanEdits": [
    "removed malformed label",
    "fixed window perspective",
    "painted clock face manually"
  ],
  "licenseOrTermsSnapshot": "legal/ai-tool-terms-2026-06.pdf",
  "sha256": "...",
  "approvalStatus": "approved"
}
```

Проверять:

- права на использование;
- отсутствие logos;
- отсутствие real-person likeness;
- отсутствие political/religious/military symbols;
- отсутствие случайного copyrighted character design.

---

# 16. Legal/privacy minimum

Launch build:

- не собирает персональные данные;
- не отправляет Yandex profile externally;
- не требует email;
- не содержит external analytics by default;
- не содержит secrets;
- self-contained assets.

Если позже добавляется внешняя аналитика:

- privacy policy;
- CSP allowlist;
- data map;
- retention policy;
- opt-out where required;
- no raw player ID.

---

# 17. Maintenance files

Repository должен содержать:

- `CHANGELOG.md`;
- `RELEASE_CHECKLIST.md`;
- `INCIDENT_RUNBOOK.md`;
- `KNOWN_ISSUES.md`;
- `ASSET_PROVENANCE.json`;
- `THIRD_PARTY_NOTICES.md`;
- `release-manifest.json`;
- `content-manifest.json`;
- save fixtures per schema version.

---

# 18. Definition of operational readiness

Проект готов к релизу, если:

- есть owner для support inbox;
- есть last-known-good archive;
- remote kill switches проверены;
- purchase recovery проверен;
- save migrations проверены;
- bad level можно безопасно отключить;
- diagnostics копируются;
- version/content version видны в Settings;
- все production assets имеют provenance;
- RU/EN catalog materials готовы;
- release checklist проходит полностью.
