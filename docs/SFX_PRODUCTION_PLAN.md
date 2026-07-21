# SFX-аудит и production-план

Статус: production proposal  
Дата аудита: 2026-07-21  
Основной приоритет: CrazyGames, затем общий HTML5/Yandex build

## 1. Итог ревью

Сейчас игра фактически полностью немая: в `public/assets` нет аудиоассетов, в `src` нет аудиосервиса и вызовов воспроизведения, а окно настроек управляет только языком и мобильной схемой сравнения. Поэтому проблема не решается добавлением пары `new Audio(...)`: проекту нужен небольшой, но системный audio layer с шинами, сохранёнными настройками, browser unlock, platform mute и контролем одновременных голосов.

Визуальная часть уже даёт очень хорошие точки синхронизации: найденное отличие и ошибка в `PhotoComparator`, подсказка, 200-мс переход к победе, таймаут, награды и отдельная 1400-мс церемония вскрытия печати артефакта. Звук должен усиливать именно эти действия. Главная цель первой версии — чтобы любое осмысленное действие игрока получало мгновенный, спокойный и различимый ответ.

Рекомендуемая очередность:

1. Создать аудиосервис и корректный CrazyGames lifecycle.
2. Озвучить core gameplay: correct, misclick, compare, hint, final difference, victory, timeout.
3. Озвучить мета-цикл: кнопки, карта, награды, артефакты, коллекция.
4. Добавить очень тихий ambient/music layer, не конкурирующий с поиском отличий.
5. Провести loudness-, mobile- и iframe-QA, после чего измерить влияние на прохождение первых уровней и длину сессии.

Это не аудиоревью существующего микса на слух — микса и исходных звуков пока нет. Это аудит текущего кода, игровых событий и production-ready спецификация для подбора, генерации, монтажа и интеграции звуков.

## 2. Что найдено в текущей версии

| Область            | Состояние                                                                                                     | Вывод                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Runtime audio      | Аудиосервис и вызовы звука отсутствуют                                                                        | Нужен единый typed API, а не вызовы из компонентов вразнобой                                                  |
| Аудиоассеты        | В `public/assets` звуков нет                                                                                  | Нужны master-файлы, web-версии, manifest и provenance                                                         |
| Настройки          | В save есть `vibration` и `reducedMotion`, но UI показывает язык и compare scheme; music/SFX/mute отсутствуют | Добавить master mute, music и SFX; vibration не выдавать за реализованную до появления haptics                |
| Gameplay           | Есть отдельные callbacks correct/misclick, hint flow, timeout и completion                                    | Core SFX можно подключить в небольшом числе стабильных точек                                                  |
| Compare mode       | Flip — дискретное действие; slider меняется непрерывно                                                        | Flip озвучивать; slider не «трещать» на каждом пикселе, только на захвате/центре/краях при необходимости      |
| Artifact reveal    | Печать визуально вскрывается через 1400 мс                                                                    | Есть готовая мини-сцена для трёхслойного synchronized SFX                                                     |
| Platform lifecycle | Gameplay start/stop уже централизован                                                                         | Аудио должно подписаться на тот же effective pause state                                                      |
| CrazyGames adapter | Нет поддержки `game.settings.muteAudio`; rewarded callback не сообщает audio layer о `adStarted`              | До Full Launch это обязательный integration gap                                                               |
| Реклама            | Interstitial блокирует UI после `adStarted`; rewarded имеет success/error flow                                | Все video ads должны давать platform mute только после фактического `adStarted` и снимать его на finish/error |
| Размер             | Существующий `dist` около 73 MB, аудио в него пока не входит                                                  | Аудио нельзя добавлять в initial download без бюджета и lazy loading                                          |

Точки аудиоинтеграции подтверждены в:

- `src/features/gameplay/PhotoComparator.tsx` — correct, misclick, flip/slider;
- `src/screens/GameScreen.tsx` — hint, completion, timeout, rewarded/interstitial, reward и navigation;
- `src/features/collection/ArtifactRevealOverlay.tsx` — 1400-мс sealed-to-revealed sequence;
- `src/screens/HomeScreen.tsx`, `MapScreen.tsx`, `CollectionScreen.tsx` — hub, campaign, node и collection actions;
- `src/services/platform/platformLifecycle.ts` и `crazyGamesPlatform.ts` — pause/gameplay/ad lifecycle;
- `src/entities/save/schema.ts` и `SettingsScreen.tsx` — будущий persisted audio contract.

## 3. Звуковая идентичность

### 3.1. Основная идея

Игра должна звучать как работа с живым экспедиционным архивом: бумага, карандаш, картонная папка, фотоплёнка, линза, латунь, тихие реле, воск, дерево и редкие мягкие электронные тоны поздних 1970-х.

Три слова для всего саунд-дизайна: **тактильный, исследовательский, сдержанный**.

Звук не должен превращать игру в аркаду. Правильная находка приносит маленькое удовлетворение, ошибка мягко корректирует, артефакт ощущается редким и ценным, а фон поддерживает сосредоточенность.

### 3.2. Палитра

- Основа: сухая бумага, карточки, тонкий картон, карандаш, штамп, механика фотоаппарата.
- Акценты: латунный click, мягкое стекло, негромкий магнитофонный relay, едва слышный analog sine/chime.
- Воздух: спокойный ветер, помещение архива, далёкий radio noise, редкие природные текстуры кампании.
- Тональность UI и наград: тёплая, преимущественно середина; без яркой «мобильной» верхушки на 6–10 kHz.
- Стерео: интерфейс и gameplay feedback преимущественно mono/center; ambience и музыка — широкие, но без экстремального stereo widening.

### 3.3. Чего избегать

- casino win, slot machine, coin shower и fanfare;
- мультяшных boing/pop/spring;
- резких buzzer/error beep;
- хоррор-дронов, jumpscare и тревожных riser;
- тяжёлого cinematic boom на обычной находке;
- громкого секундного тиканья таймера;
- чрезмерно ярких колокольчиков, утомляющих после 20–30 находок;
- длинных UI-хвостов, которые наслаиваются при быстрых кликах;
- буквального звука для каждого hover и каждого пикселя slider.

## 4. Sound briefs для подбора или генерации

Все описания ниже задают **направление**, а не требуют буквальной записи одного объекта. Лучший результат обычно получается из 2–3 тихих слоёв. Для генераторов следует просить `isolated sound effect`, `no music`, `no voice`, `no reverb tail unless specified`, `clean studio recording`.

### 4.1. Core gameplay — релизный минимум

| ID / событие             | Как должен звучать                                                                                                                     | Техническая форма                                                | Варианты                                                                            | Поисковый запрос / prompt                                                                                                                                        | Не использовать                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `game.correct`           | Уверенный штрих мягкого карандаша по карточке + очень тихий латунный/стеклянный «ответ». Тёплый, точный, приятный, без ощущения монеты | 180–320 мс; атака до 15 мс; короткий хвост; mono                 | 5 вариантов; pitch random ±2–3%; последний найденный объект не включать в этот файл | `isolated satisfying soft pencil check mark on archival paper, tiny warm brass resonance, subtle premium puzzle game correct answer, dry studio, no music`       | coin, cash register, bright bell, applause    |
| `game.correct_sweetener` | Едва слышный tonal bloom, показывающий растущую серию; не самостоятельный звук                                                         | 250–450 мс; мягкая атака; уровень на 8–12 dB тише `game.correct` | 3 ступени по прогрессу, а не random                                                 | `very subtle warm analog tonal bloom, short, soft, investigative archive mood, no melody, no impact`                                                             | combo announcer, pitch ladder в стиле match-3 |
| `game.misclick`          | Тупой кончик карандаша касается плотной бумаги + приглушённый деревянный click. Ошибка понятна, но игрока не ругают                    | 120–220 мс; почти без хвоста; center                             | 3–4 варианта; cooldown 100–140 мс                                                   | `isolated soft blunt pencil tap on thick paper, muted wooden click, gentle wrong answer feedback, non-punishing, dry`                                            | buzzer, alarm, comic fail, low bass boom      |
| `compare.flip`           | Быстрый переворот фотокарточки/слайда и тихий механический щелчок рамки                                                                | 90–180 мс; быстрая атака; сухой                                  | 3 варианта; cooldown 70–100 мс                                                      | `isolated quick vintage photo card flip with subtle slide viewer mechanism click, clean, short, tactile, no music`                                               | page whoosh, camera shutter full, loud switch |
| `compare.slider_grab`    | Очень лёгкий захват металлической направляющей пальцем                                                                                 | 60–100 мс                                                        | 2 варианта; только pointer down                                                     | `tiny soft brass slider grab click, precision instrument, isolated UI sound, very subtle`                                                                        | ratchet на всём движении                      |
| `hint.activate`          | Линза поднимается со стола: короткий glass/metal handling + лёгкий воздушный вдох                                                      | 220–380 мс                                                       | 3 варианта                                                                          | `isolated vintage magnifying glass picked up, tiny brass and glass movement, soft airy reveal, archival investigation, no magic sparkle`                         | fantasy spell, громкий shimmer                |
| `hint.reveal`            | Мягкая фокусировка: короткий фильтрованный shimmer, будто изображение проявилось под линзой                                            | 450–700 мс; плавная атака 40–80 мс; неяркий high end             | 2–3 варианта                                                                        | `subtle focused discovery shimmer, warm analog and glass texture, short non-magical clue reveal, quiet premium puzzle game`                                      | magical harp, glitter cascade, sonar ping     |
| `game.final_difference`  | Сначала обычный correct, затем через 80–140 мс плотный архивный штамп и короткое тёплое разрешение                                     | 600–950 мс суммарно; удар без sub-bass                           | 2 варианта: campaign/daily                                                          | `satisfying archival rubber stamp on case file with restrained warm analog resolution, premium puzzle completion accent, no fanfare`                             | explosion, victory horn, coin shower          |
| `game.timeout`           | Механизм плёнки/магнитофона мягко останавливается, папка спокойно закрывается                                                          | 500–900 мс; нисходящее, но не мрачное движение                   | 2 варианта                                                                          | `vintage tape mechanism gently stopping and archival folder closing, calm timeout feedback, non-threatening, isolated`                                           | fail sting, siren, dramatic downward trombone |
| `game.extend_time`       | Механизм снова запускается: relay click + короткое раскручивание ленты                                                                 | 300–550 мс                                                       | 2 варианта                                                                          | `vintage tape recorder relay click and gentle restart, short hopeful continuation sound, isolated, no music`                                                     | power-up arcade, clock ticking                |
| `game.victory`           | Небольшой 2–3-нотный warm analog motif поверх бумаги/штампа. Чувство «дело восстановлено», не «джекпот»                                | 1.2–1.8 с; мягкий decay; peak ниже системной громкости UI        | 2 музыкальных варианта × campaign/daily ending layer                                | `short restrained puzzle solved stinger, warm late 1970s analog synth, archival paper and soft brass texture, calm accomplishment, no casino, no epic orchestra` | major fanfare, crowd, EDM riser               |

### 4.2. Артефакт и награды

| ID / событие          | Как должен звучать                                                                                | Техническая форма                                                  | Варианты                              | Поисковый запрос / prompt                                                                                                                                | Не использовать              |
| --------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `artifact.clue_found` | Маленький латунный glint и щелчок застёжки, сообщающий, что найден особый объект                  | 200–350 мс; на 3–5 dB тише correct                                 | 3 варианта                            | `tiny antique brass clasp click with subtle warm glint, rare clue discovered, isolated, understated`                                                     | treasure chest, coins        |
| `artifact.seal_set`   | Тяжёлая, но негромкая печать ставится на бумагу; слышны воск и картон                             | 350–600 мс; запуск вместе с sealed card                            | 2 варианта                            | `close-up wax seal pressed onto archival paper, soft dense wax, cardstock texture, ceremonial but quiet, isolated`                                       | молот, boom                  |
| `artifact.seal_break` | Сухой разлом воска на 2–3 небольших фрагмента                                                     | 180–350 мс; поставить примерно за 150–250 мс до визуального reveal | 3 вариантов слоя crack                | `close-up dry red wax seal cracking into a few pieces, delicate, tactile, isolated studio sound`                                                         | glass smash, bone crack      |
| `artifact.reveal`     | Бумажный пакет раскрывается, карточка мягко выдвигается; в конце один редкий тёплый resonant tone | 700–1100 мс; синхронно состоянию `revealed` на 1400 мс             | 3 material-варианта + 2 tonal endings | `archival evidence envelope opening and artifact card sliding out, subtle warm analog resonance, rare discovery, premium, no magic, no music bed`        | chest loot, angel choir      |
| `reward.hint`         | Один предмет добавлен в инвентарь: стеклянная линза кладётся в футляр                             | 300–500 мс                                                         | 3 варианта                            | `small magnifying glass placed into felt case, soft glass and brass click, reward received, isolated`                                                    | coin collect                 |
| `reward.daily`        | Тот же язык, но с лёгким штампом даты                                                             | 500–800 мс                                                         | 2 варианта                            | `small archival date stamp and soft magnifying glass case click, daily reward, restrained, isolated`                                                     | calendar alarm               |
| `campaign.complete`   | Расширенная версия победы: 3–4 тёплые analog notes, distant radio resolve, финальный штамп        | 2.5–4.0 с; использовать только после уровня 13                     | 1 основной + 3 campaign tails         | `restrained expedition archive campaign completion stinger, warm 1970s analog synth, distant radio resolving, final paper stamp, emotional but not epic` | trailer music, orchestra hit |

### 4.3. UI, карта и коллекция

| ID / событие           | Как должен звучать                                                                      | Техническая форма | Варианты                                          | Поисковый запрос / prompt                                                                               | Не использовать                     |
| ---------------------- | --------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `ui.primary`           | Плотная архивная кнопка: короткий brass/wood click, уверенный и тёплый                  | 70–130 мс         | 4 вариантов round-robin                           | `short soft brass and wood button click, vintage archive equipment, premium UI, isolated dry`           | mouse click, bubble pop             |
| `ui.secondary`         | Более лёгкий бумажный tap                                                               | 60–110 мс         | 3 варианта                                        | `short soft cardstock tap, subtle UI confirmation, isolated dry`                                        | тот же громкий click, что у primary |
| `ui.back_close`        | Небольшой обратный сдвиг карточки/папки                                                 | 100–180 мс        | 3 варианта                                        | `short archival card sliding back into folder, subtle close UI sound, isolated`                         | whoosh длиной более 300 мс          |
| `ui.modal_open`        | Папка раскрылась и легла на стол                                                        | 180–300 мс        | 2 варианта                                        | `small archival folder opening on wooden desk, short and quiet, isolated`                               | cinematic whoosh                    |
| `ui.modal_close`       | Обратный, более короткий жест папки                                                     | 120–220 мс        | 2 варианта                                        | `small archival folder gently closing, short quiet UI sound, isolated`                                  | slam                                |
| `ui.tab`               | Перекладка карточки-разделителя                                                         | 70–130 мс         | 3 варианта                                        | `tiny paper index divider flick, short tactile tab switch, isolated`                                    | digital beep                        |
| `ui.locked`            | Закрытая латунная защёлка без негативного тона                                          | 140–240 мс        | 2 варианта; cooldown 250 мс                       | `small antique brass latch remains locked, gentle denied UI feedback, no alarm, isolated`               | error buzzer                        |
| `map.node_open`        | Булавка ставится на карту + карандашная линия                                           | 250–450 мс        | 3 варианта                                        | `map pin placed on paper map with short pencil route mark, expedition archive, isolated`                | quest fanfare                       |
| `map.node_unlock`      | Печать доступа снимается, карточка выдвигается                                          | 500–850 мс        | 2 варианта; только один раз на фактический unlock | `archival access seal released and index card sliding forward, subtle level unlocked sound, no fanfare` | chest unlock, bells                 |
| `collection.open`      | Небольшой деревянный каталожный ящик выдвигается                                        | 300–550 мс        | 2 варианта                                        | `small vintage wooden card catalog drawer opening, smooth, quiet, isolated studio`                      | большой скрипучий сундук            |
| `collection.item_open` | Карточка поднята с бархатной/бумажной подложки                                          | 150–280 мс        | 3 варианта                                        | `museum catalog card lifted from paper or felt backing, subtle tactile UI, isolated`                    | loot pickup                         |
| `settings.change`      | Тихий precision switch; сам звук сразу демонстрирует текущую SFX-громкость              | 70–120 мс         | 2 варианта                                        | `tiny precision instrument toggle click, warm mechanical UI, isolated`                                  | phone toggle pop                    |
| `save.visible_success` | Очень тихий карандашный check, только при явном пользовательском save-status transition | 100–180 мс        | 2 варианта                                        | `very quiet pencil check on paper, subtle saved confirmation, isolated`                                 | звук на каждом autosave             |
| `ui.error`             | Мягкий механический двойной click без диссонанса                                        | 160–260 мс        | 2 варианта                                        | `soft muted mechanical double click, subtle recoverable error UI, non-alarming, isolated`               | alarm, buzzer                       |

### 4.4. Правила выбора кандидатов

Каждый кандидат оценивается по шкале 1–5:

- читается ли он на динамике ноутбука при 30–40% системной громкости;
- не раздражает ли после 30 повторов за 3 минуты;
- совпадает ли материал с миром архива;
- различим ли он рядом с ambience;
- не обещает ли чрезмерную награду;
- хорошо ли режется до требуемой длительности;
- нет ли шума, clipping, чужой музыки, голоса или длинной комнаты.

Кандидат проходит, если средняя оценка не ниже 4 и ни один критерий не ниже 3. Для `correct`, `misclick`, `compare.flip` и `ui.primary` обязательно слушать 30 повторов подряд: красивый одиночный звук часто оказывается утомительным в реальной игре.

## 5. Музыка и ambience

Музыка — поддерживающий слой, не замена SFX. Для первого релиза достаточно одного hub loop и трёх campaign beds; отдельный трек на каждый из 39 уровней не нужен.

| Bed                 | Характер                                                                 | Brief / prompt                                                                                                                                               | Длительность     |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `music.archive_hub` | Тихий архив ночью: мягкий analog pad, воздух комнаты, редкая низкая нота | `seamless minimal ambient loop, late 1970s analog warmth, quiet archive room air, sparse low notes, calm investigation, no drums, no horror, no melody lead` | 60–90 с seamless |
| `ambience.northern` | Холодный ветер, далёкая радиомачта, редкий кабельный hum                 | `seamless quiet northern expedition ambience, soft cold wind, very distant radio tower hum, calm, no storm, no voices, no horror`                            | 45–75 с          |
| `ambience.sand`     | Сухой воздух, едва слышный песок, далёкий металлический резонанс         | `seamless subtle salt desert ambience, dry wind and faint distant metal resonance, calm scientific expedition, no dramatic gusts`                            | 45–75 с          |
| `ambience.emerald`  | Влажный воздух, мягкая листва, очень далёкая вода                        | `seamless restrained green expedition ambience, soft wet foliage and distant water, calm mysterious field recording, no birds foreground, no thunder`        | 45–75 с          |

Правила beds:

- никакого постоянного ритма и секундного тиканья;
- один заметный detail не чаще 12–20 секунд;
- loop point не должен быть слышен в наушниках;
- музыка автоматически duck на 2–4 dB под victory, artifact reveal и important reward;
- при открытии Settings можно duck на 2 dB, но не обрывать;
- смена экрана — crossfade 500–900 мс, platform mute/ad — быстрый fade 40–100 мс;
- после timeout не включать тревожный слой: игра позиционируется как спокойное наблюдение.

## 6. Предлагаемая runtime-архитектура

### 6.1. Сервис

Рекомендуется нативный Web Audio API без новой runtime-зависимости:

```text
src/services/audio/
  audioCatalog.ts       typed cue IDs, paths, variants, cooldowns, gain
  audioEngine.ts        AudioContext, preload/decode, buses, voice pool
  audioLifecycle.ts     user unlock, visibility, platform/ad mute
  audioState.ts         effective policy and persisted settings adapter
  *.test.ts

public/assets/audio/
  sfx/core/
  sfx/meta/
  ambience/
  music/
```

Публичный интерфейс должен оставаться маленьким:

```ts
audio.play("game.correct", { progress: 0.6, difficulty: 2 });
audio.play("artifact.reveal");
audio.setUserMix({ muted, musicVolume, sfxVolume });
audio.setPlatformMuted(true);
audio.setPaused(true);
```

Компоненты не должны знать пути файлов, создавать `AudioContext` или самостоятельно решать громкость. Каталог выбирает вариант, pitch, gain, cooldown и bus.

### 6.2. Шины

```text
Music ─────┐
Ambience ──┼─> Master ─> limiter ─> destination
Gameplay ──┤
UI ────────┘
```

- `Music`: музыкальные beds.
- `Ambience`: ветер, комната, природные слои.
- `Gameplay`: correct, misclick, hint, victory, artifact.
- `UI`: кнопки, tabs, modal, map.
- `Master`: user mute, platform mute, page/ad pause и safety limiter.

### 6.3. Состояние и приоритет mute

Effective audible state:

```text
userMuted === false
AND crazyGamesMuteAudio === false
AND adPlaying === false
AND platformPaused === false
AND documentVisible === true
AND AudioContext is unlocked/running
```

`CrazyGames.SDK.game.settings.muteAudio` имеет более высокий приоритет, чем внутриигровая настройка. Пользователь не должен суметь включить звук поверх platform mute. Platform/ad mute не записывается в save.

В save добавить с миграцией:

- `audioMuted: boolean`, default `false`;
- `musicVolume: number`, default `0.45`, диапазон 0–1;
- `sfxVolume: number`, default `0.75`, диапазон 0–1.

Настройки: master toggle, SFX slider, music slider. Изменение SFX slider проигрывает `settings.change`; music slider меняет bed в реальном времени. Ноль на обоих sliders не обязан менять persisted master mute.

### 6.4. Unlock, resume и загрузка

- Создать/возобновить `AudioContext` только после первого `pointerup`, `touchend` или клавиатурного подтверждения.
- Первый жест одновременно снимает browser lock и разрешает тихий UI cue; отсутствие unlock не должно блокировать gameplay.
- После iOS interruption `visibilitychange` недостаточно: следующий реальный `touchend/click` должен вызвать `audioContext.resume()`.
- Ошибка decode/load не показывает modal и не ломает игру; фиксируется один diagnostic event.
- Core bank грузить раньше meta/beds, но не задерживать `gameplayStart`.
- Активный campaign bed грузить лениво; beds других кампаний не держать декодированными в памяти.

### 6.5. Антиспам и вариативность

- `misclick`: максимум один voice каждые 100–140 мс, максимум 2 одновременно.
- `compare.flip`: cooldown 70–100 мс, максимум 1 voice.
- `ui.primary/secondary`: максимум 4 UI voices суммарно.
- `correct`: round-robin 5 вариантов, не повторять последний вариант; максимум 3 voices.
- Random pitch: обычно ±2–3%, random gain не более ±1 dB.
- Slider: не воспроизводить звук на каждом `pointermove`/`onChange`.
- Autosave: никогда не озвучивать периодические сохранения; только явный редкий visible transition, если он действительно полезен.

## 7. CrazyGames-specific требования

Это часть Definition of Done, а не дополнительный polish.

1. Реализовать `CrazyGames.SDK.game.settings.muteAudio` и settings change listener. Platform mute всегда сильнее внутреннего toggle.
2. На `adStarted` поставить audio master в platform mute. На `adFinished` и `adError` снять только ad mute и пересчитать effective state, не игнорируя user/platform mute.
3. Не выключать звук в момент `requestAd`: реклама может не заполниться, и бессобытийный провал музыки будет выглядеть как баг.
4. Rewarded flow тоже должен получать `adStarted`; текущий adapter обрабатывает только finished/error.
5. Gameplay и audio pause должны использовать согласованный lifecycle, но `gameplayStart/Stop` не следует превращать в прямой music play/stop без fade.
6. Для iOS/CrazyGames App проверять восстановление AudioContext после background, звонка и возврата по следующему жесту.
7. Аудио не должно раздувать initial download. CrazyGames ограничивает initial download 50 MB, а для mobile homepage — 20 MB; момент измеряется до первого `gameplayStart`.
8. Basic Launch не содержит ads, но `muteAudio`, browser lifecycle и audio QA всё равно должны работать. Full Launch дополнительно проходит ad mute matrix.

Актуальные официальные требования:

- [CrazyGames Game module: `muteAudio`, settings listener и gameplay lifecycle](https://docs.crazygames.com/sdk/game/)
- [CrazyGames video ads: pause/mute на ad callbacks](https://docs.crazygames.com/sdk/video-ads/)
- [CrazyGames ad requirements](https://docs.crazygames.com/requirements/ads/)
- [CrazyGames technical requirements: размеры и iOS audio resume](https://docs.crazygames.com/requirements/technical/)
- [CrazyGames quality guidelines: согласованные уровни и уместная музыка](https://docs.crazygames.com/requirements/quality/)

## 8. Форматы, loudness и бюджет

### 8.1. Исходники и runtime

- Master: WAV, 48 kHz, 24-bit, без normalization в 0 dBFS.
- One-shots: mono, если стерео не несёт художественной информации.
- Music/ambience: stereo, seamless edit с отдельно проверенной петлёй.
- Runtime baseline: MP3 96–128 kbps для коротких SFX и 96–128 kbps stereo для beds; OGG добавлять только при подтверждённой пользе и согласованном browser fallback.
- Удалить стартовую/конечную тишину, DC offset, клики на границах и лишний room tail.
- Хранить editable masters вне runtime или в source-assets package; в `public` помещать только web deliverables.

### 8.2. Целевая иерархия микса

- Master true peak: не выше −1 dBTP.
- Music bed: ориентир −26…−22 LUFS integrated до пользовательского slider.
- Ambience: на 3–6 dB ниже music или едва слышимо без музыки.
- Частые UI/SFX: peaks примерно −18…−12 dBFS.
- Correct/hint: на 2–4 dB выше обычного UI.
- Victory/artifact: самые заметные, но не более чем на 3–5 dB выше correct.
- Misclick: на 2–3 dB тише correct.

LUFS здесь — стартовая точка, а не замена слуховому миксу. Финальный баланс проверяется на laptop speakers, дешёвом Android, iPhone/iPad и наушниках при 30–50% системной громкости.

### 8.3. Web-бюджет

| Пакет                            | Цель                                                  |
| -------------------------------- | ----------------------------------------------------- |
| Critical first-interaction bank  | 150–300 KB: primary, correct, misclick, compare, hint |
| Все one-shot SFX                 | 0.8–1.5 MB                                            |
| Один активный music/ambience set | 1.0–2.0 MB                                            |
| Полная audio library             | Желательно не более 6–8 MB compressed                 |
| Одновременно decoded beds        | Не более одного music + одного ambience set           |

Аудио уже сжато и почти не выигрывает от gzip/brotli. Вес проверяется по реальным файлам и network waterfall, а не по размеру исходных WAV.

## 9. Дорожная карта

### Этап 0 — выбор языка и temp bank, 0.5–1 день

- Утвердить 6 референсов: correct, misclick, flip, hint, victory, artifact reveal.
- Подобрать или сгенерировать по 3 кандидата на каждый.
- Сделать быстрый temp mix прямо поверх записи gameplay.
- Зафиксировать naming, license/provenance и громкостную иерархию.

Готово, когда один 3–5-минутный gameplay capture можно смотреть с temp SFX без раздражения и без потери спокойного тона.

### Этап 1 — фундамент и core feedback, 2–4 дня

- Реализовать audio service, typed catalog, buses, unlock/resume и error fallback.
- Добавить save migration и master/music/SFX controls.
- Подключить correct, misclick, flip, hint, final difference, timeout, extend time, victory.
- Добавить cooldown, voice limits, round-robin и music ducking seam.
- Покрыть engine/state unit-тестами.

Готово, когда первый уровень полностью читается по звуку, mute мгновенный, быстрые клики не создают clipping, а отсутствие/ошибка аудиофайла не ломает gameplay.

### Этап 2 — CrazyGames lifecycle, 1–2 дня

- Расширить platform adapter поддержкой `muteAudio` и change listener.
- Передать `adStarted` из rewarded и interstitial в общий audio policy.
- Проверить adFinished/adError, user mute, tab background и iOS resume.
- Проверить, что audio preload не задерживает первый `gameplayStart`.

Готово, когда ни один тестовый сценарий не допускает одновременного звука рекламы и игры, а после возврата слышимость соответствует user/platform settings.

### Этап 3 — artifacts, map, collection и UI, 2–4 дня

- Озвучить artifact clue/seal/break/reveal по таймлайну 0–1400 мс.
- Добавить reward, map node, unlock, collection drawer/item.
- Ввести небольшую глобальную UI-палитру без звука на каждый hover.
- Добавить campaign completion и daily variation.

Готово, когда редкие награды звучат ценнее частых действий, а один и тот же UI cue не маскирует gameplay feedback.

### Этап 4 — ambience/music, 3–5 дней

- Подготовить hub loop и три campaign ambience set.
- Реализовать lazy loading, crossfade, unload и ducking.
- Свести игру целиком на 10–15-минутной сессии.
- Проверить seamless loops и длительное прослушивание.

Готово, когда ambience заметен при mute/unmute, но не требует уменьшать его для концентрации и не маскирует correct/misclick.

### Этап 5 — polish, QA и release gate, 2–3 дня

- Loudness pass на четырёх классах устройств.
- Browser/iframe/CrazyGames Preview matrix.
- Проверка initial download, total audio weight, missing files и licenses.
- Проверка RU/EN settings layout и save migration.
- Добавить release/content validation для audio manifest.

Оценка полного цикла: примерно 2–3 рабочие недели одного инженера/саунд-дизайнера с учётом asset selection и двух итераций обратной связи. Core SFX без музыки можно довести до релизного состояния за 4–7 рабочих дней.

## 10. QA-матрица

| Сценарий                    | Ожидаемый результат                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| Первый запуск без жеста     | Игра не блокируется; после первого жеста context запускается и следующие cues слышны       |
| 30 быстрых correct/misclick | Нет clipping, voice explosion, одинакового machine-gun timbre                              |
| Быстрый A/B flip            | Короткий feedback без хвостового шума и наложения десятков voices                          |
| Slider drag                 | Нет непрерывного ratchet/noise на каждом пикселе                                           |
| Последнее отличие           | Correct остаётся мгновенным, затем приходит final resolve и victory без конфликтующих атак |
| Artifact reveal             | Seal, crack и reveal попадают в видимые фазы 1400-мс sequence                              |
| User mute                   | Всё аудио замолкает через короткий fade; настройка переживает reload                       |
| CrazyGames `muteAudio=true` | Внутренний toggle не может вернуть звук                                                    |
| Ad unfilled / `adError`     | Нет случайного провала до `adStarted`; игра и корректный mix восстанавливаются             |
| Ad started/finished         | Game audio не звучит вместе с рекламой; после неё соблюдены user settings                  |
| Background/foreground iOS   | После следующего touch/click AudioContext возобновляется                                   |
| Missing/corrupt asset       | Ошибка диагностируется один раз, gameplay продолжается без modal                           |
| Slow network                | Core gameplay не ждёт music/ambience                                                       |
| Laptop/phone speakers       | Correct и misclick различимы, high end не режет, ambience не превращается в шум            |
| Headphones                  | Нет слышимых loop seams, DC click, чрезмерной стереоширины и резких транзиентов            |

## 11. Аналитика и критерии успеха

Не следует отправлять событие на каждый звук: это засорит аналитику и продублирует уже существующие gameplay events. Достаточно:

- `audio_unlock_result`: один раз за сессию, success/failure и platform/device;
- `audio_load_result`: агрегат по bank, duration и failed assets;
- `audio_settings_changed`: master/music/SFX с bucketed значениями;
- в существующий `level_complete`/attempt summary добавить `audioEnabled` и, при необходимости, volume buckets;
- diagnostic error для resume/decode failure с дедупликацией.

Рекомендуемый rollout:

1. Internal QA и 100% core SFX.
2. Basic Launch cohort с SFX, но без одновременного крупного изменения сложности/рекламы.
3. После накопления данных сравнить с предыдущей стабильной версией или провести A/B, если платформа и объём это позволяют.

Целевые продуктовые сигналы, а не гарантии:

- completion первых трёх уровней: +3 процентных пункта;
- average playtime: +5–10%;
- misclick bursts снижаются, потому что ошибка лучше читается;
- доля сессий с добровольным master mute не превышает 20–25%; высокий mute rate означает усталость, громкость или неверную стилистику;
- audio load/resume errors: менее 0.5% поддерживаемых сессий;
- нет ухудшения first-play conversion более чем на 1 п.п. из-за загрузки.

## 12. Deliverables и документация

Для каждого принятого ассета нужны:

- стабильный cue ID и runtime filename;
- source/license/author/generator/model/date/prompt;
- разрешение на commercial web distribution;
- master WAV и web derivative;
- duration, channels, sample rate, compressed bytes;
- loop points для beds;
- loudness/peak measurement;
- список variants и gameplay owner;
- пометка, если генеративный сервис требует attribution или запрещает redistribution исходника.

При реализации обновить:

- `ASSET_MANIFEST.md` и `ASSET_PROVENANCE.json` — все аудиофайлы и лицензии;
- `SAVE_SCHEMA.md` и `docs/starter-data/save.example.json` — audio settings/migration;
- `ARCHITECTURE.md` — audio service, buses и lifecycle;
- `CRAZYGAMES_INTEGRATION.md` или актуальный CrazyGames integration doc — `muteAudio` и ads;
- `ANALYTICS_EVENTS.md` — только добавленные агрегированные события/поля;
- `RELEASE_CHECKLIST.md` и `docs/08_RELEASE_READINESS_CHECKLIST.md` — audio QA gate;
- RU/EN localization для Settings;
- `CHANGELOG.md` — пользовательское изменение.

## 13. Definition of Done

SFX upgrade считается завершённым, когда:

- core gameplay, timeout, victory, rewards и artifact reveal имеют утверждённый feedback;
- все cues проходят 30-repeat fatigue test и сведены в единой loudness hierarchy;
- master/music/SFX settings сохраняются и мигрируют без потери старых saves;
- user mute, CrazyGames mute, ads, visibility и iOS interruption корректно композируются;
- звук никогда не блокирует старт, gameplay, save или восстановление после ошибки;
- initial download и полный build остаются в CrazyGames limits;
- есть Chrome, Edge, Safari/iOS, Android и CrazyGames Preview QA evidence;
- каждый runtime asset имеет provenance/license запись;
- документация, тесты и release validation отражают фактическую реализацию.
