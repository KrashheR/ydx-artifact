# VFX-аудит и production-план

Статус: implementation-ready proposal  
Дата аудита: 2026-07-21  
Область: core gameplay, результаты, артефакты, Home/Map/Collection, переходы и motion accessibility  
Целевой тон: живой экспедиционный архив — тактильный, точный, сдержанный

## 1. Итог ревью

В игре уже есть хорошая основа: кольцо найденного отличия, маркер промаха, пульс подсказки, hover/active-состояния части кнопок, fade между экранами, pop-модалки и полноценная церемония вскрытия печати артефакта. Это не «игра без VFX».

Главная проблема — эффекты существуют отдельными фрагментами и не складываются в единую систему отклика. Обычная находка почти не создаёт каскада «место на фотографии → обе версии сцены → счётчик → серия», большинство наград появляется одним pop, переходы не объясняют пространственную связь экранов, а touch-устройства получают заметно меньше feedback, чем desktop hover. В результате механика работает, но игра ощущается более статичной и дешёвой, чем её арт-направление.

Рекомендуемый фокус первой версии:

1. Собрать единый motion/VFX foundation и корректный reduced-motion режим.
2. Сделать безупречным feedback основного действия: correct, misclick, hint, A/B compare и последняя находка.
3. Построить короткие staged-церемонии результата, звёзд, артефакта и прогресса.
4. Оживить Home/Map/Collection через состояние и причинно-следственные переходы, а не через постоянное декоративное движение.
5. Добавить очень ограниченный ambient polish только после проверки core feedback и производительности.

Первый релиз VFX должен быть почти полностью CSS/SVG/Framer Motion. Новые bitmap-ассеты, canvas и тяжёлая particle-библиотека для P0 не нужны.

## 2. Что найдено в текущей версии

| Область | Что уже есть | Проблема / возможность |
| --- | --- | --- |
| Correct find | `DifferenceMarker` появляется с `game-ring` на найденной зоне | Нет локального burst, отдельного sync-акцента A/B, реакции HUD и серии; feedback визуально однослойный |
| Misclick | Локальный красный X/ring исчезает за 700 мс | Маркер читается, но нет мягкого surface-response; ошибка ощущается как наложенная иконка, а не реакция фотографии |
| Hint | Dashed ring и бесконечный `game-pulse`; на mobile есть glow/spin кнопки | Подсказка должна привлекать внимание конечным импульсом 2.5–3 с, затем успокаиваться; сейчас loop конкурирует с поиском |
| A/B compare | Рабочие flip/slider и синхронная камера | Переключение функционально, но слабо ощущается как работа с фотокарточками/оптическим прибором |
| Completion | Overlay открывается через 200 мс и использует общий `game-pop` | Последняя находка не успевает «дозвучать» визуально; результат появляется слишком быстро и целиком |
| Result | Есть итог, статистика и звёзды | Нет последовательного reveal: печать → заголовок → звёзды → статистика → CTA |
| Artifact | Сильная sealed-to-revealed сцена с 1400-мс паузой | Лучший текущий эталон редкой награды; нужно только подчистить staging и унифицировать reduced motion |
| Campaign report | Есть собственные keyframes и последовательность | Motion локален компоненту и не использует общие токены |
| Screen navigation | `AnimatePresence`, fade-out 180 мс, `initial={false}` | Вход почти не поставлен; все переходы одинаковы и не показывают связь Home → Map → Game |
| Home/Map | Hover lift, breathing current card, glow active marker | Desktop читается лучше mobile; мало pressed/selected/progression feedback, ambient loops не имеют общей политики |
| Collection | Hover lift и progress width transition | Открытие детали и фильтрация в основном мгновенные; новый артефакт недостаточно выделен как цель |
| Buttons | Набор локальных `transition`, hover и часть active states | Нет общей press-грамматики, focus/disabled/loading motion и единой длительности |
| Accessibility | Есть CSS `prefers-reduced-motion`; save уже содержит `settings.reducedMotion` | Учитывается не везде; часть inline/keyframe motion и app transitions живёт отдельно от сохранённой настройки |

### Технические риски, которые нужно исправить до расширения эффектов

1. `game-ring` и `game-pulse` анимируют `transform` на элементах, где inline `transform` также хранит rotation фигуры. Анимация способна временно перезаписать поворот ellipse/polygon. Геометрию и motion следует разнести по двум вложенным wrapper-элементам.
2. Универсальный `game-pop` начинается с `scale(.3)` и перелетает до `1.08`. Для каждой модалки это выглядит аркадно и визуально обесценивает редкие награды. Обычным модалкам нужен спокойный opacity/translate; spring-scale оставить печати, звезде и артефакту.
3. CSS keyframes, inline `animation` и Framer Motion используют разные числа и easing. Настройка характера эффекта сейчас потребует правок во многих местах.
4. Бесконечные glow/pulse эффекты должны иметь лимит и выключаться при background/platform pause. Постоянным может быть только очень медленный, малоконтрастный ambient, максимум один-два слоя на экран.
5. Нельзя привязывать критичный feedback только к частицам или цвету. Check/X, изменение состояния и текст/счётчик остаются источником истины.

## 3. VFX-направление

### 3.1. Фантазия взаимодействия

Игрок не нажимает на «мобильные UI-кнопки», а исследует живой архив: отмечает фото карандашом, совмещает карточки на световом столе, водит лупой, ставит печати на дело и раскрывает конверты с уликами.

Каждый эффект должен принадлежать одной из материальных групп:

- бумага и фотокарточка: короткий сдвиг, сухой dust, след карандаша, проявляющаяся рамка;
- латунь и оптика: тёплый glint, тонкое кольцо, sweep линзы;
- чернила и печать: stamp, ink spread, progress mark;
- экспедиционная среда: очень медленные пыль, туман, плёночное зерно — только как необязательный ambient.

### 3.2. Иерархия интенсивности

| Уровень | События | Визуальный бюджет |
| --- | --- | --- |
| L0 — ambient | Home/current card, фон редкой церемонии | 1–2 медленных слоя, низкий контраст, без вспышек |
| L1 — input | press, flip, slider grab, filter select | 80–160 мс, 1 transform + color/shadow |
| L2 — confirmation | correct, misclick, hint target | 180–500 мс, локальный ring/burst + реакция HUD |
| L3 — progress | streak milestone, новая звезда, level unlock | 450–900 мс, 2–3 последовательных акцента |
| L4 — rare reward | final difference, artifact, campaign complete | 1.2–2.4 с, staged ceremony; не чаще редкого события |

Если L2 выглядит как L4, награды быстро теряют ценность. Обычная находка должна быть приятной, но не должна напоминать jackpot.

### 3.3. Палитра эффектов

- correct / progress: `success` + brass `#D8AF63`, без кислотно-зелёного;
- hint / discovery: brass + мягкое ivory-свечение;
- misclick / warning: `rust`, без full-screen red flash;
- daily / optical: `coldBlue` как вторичный акцент;
- rare artifact: ochre, wax-rust, paper-ivory;
- запрещено: rainbow, neon bloom, coin shower, confetti, lens flare на весь экран, сильный chromatic aberration.

## 4. Motion foundation

### 4.1. Общие токены

Источник истины по значениям — `docs/design-reference/tokens.json`. В runtime следует завести CSS custom properties или небольшой typed module, не меняя сам design token file без отдельного согласования:

```css
--motion-instant: 80ms;
--motion-fast: 120ms;
--motion-base: 200ms;
--motion-slow: 350ms;
--motion-reveal: 500ms;
--ease-standard: cubic-bezier(.4, 0, .2, 1);
--ease-out: cubic-bezier(0, 0, .2, 1);
--ease-in: cubic-bezier(.4, 0, 1, 1);
--ease-spring: cubic-bezier(.34, 1.56, .64, 1);
```

Правила:

- press: 80–120 мс;
- обычный UI enter: 160–220 мс;
- gameplay confirmation: 220–450 мс;
- reward reveal: 500–900 мс на один beat;
- decorative loop: не быстрее 2.4 с;
- screen transition: 180–350 мс, без задержки управления после появления CTA.

### 4.2. Архитектура

Минимальная рекомендуемая структура:

```text
src/shared/motion/
  motion.ts                 # durations/easing и effective reduced-motion helper
  useReducedEffects.ts      # OS preference OR saved setting
src/shared/ui/
  MotionButton.tsx          # только если унификация не помещается в Button/styles
src/features/gameplay/vfx/
  DifferenceFeedback.tsx    # ring, check, restrained flecks
  HintFeedback.tsx          # lens sweep + finite target pulse
  ProgressFeedback.tsx      # HUD pip/streak reaction
```

Не создавать глобальный event bus в первой итерации. Core gameplay уже имеет стабильные локальные события; эффекты должны жить рядом с владельцем события. Общий imperative VFX manager имеет смысл только если после P1 появятся десятки одновременных world-space эффектов.

### 4.3. Частицы

Для P0 использовать 6–10 заранее описанных CSS/SVG flecks на correct и 10–16 на редкую награду. Частицы — небольшие точки, бумажные волокна или короткие латунные штрихи.

Ограничения:

- максимум 24 одновременно видимых DOM-particles на gameplay viewport;
- только `transform` и `opacity`; не анимировать `filter`, `width`, `height`, `box-shadow` больших областей;
- particle lifetime 300–650 мс;
- `pointer-events: none`, `aria-hidden`;
- не создавать случайные значения прямо во время React render; использовать фиксированный паттерн с небольшим seed от event sequence;
- не добавлять стороннюю particle dependency.

## 5. Каталог эффектов

### 5.1. Core gameplay — P0

| ID | Trigger / владелец | Эффект | Timing | Acceptance criteria |
| --- | --- | --- | --- | --- |
| `input.press` | Общие CTA, HUD controls | Scale `1 → .97 → 1`, тень ближе к поверхности, brightness не более +5% | 80/120 мс | Работает мышью, touch и keyboard; layout не двигается |
| `compare.flip` | `PhotoComparator` toggle | Верхняя фотокарточка сдвигается 6–10 px и crossfade; label A/B меняется на середине | 120–160 мс | Нет белого кадра; камера/zoom сохраняются; повторный tap не накапливает анимации |
| `compare.slider` | Slider | Handle слегка compress на grab; тонкий optical glint при пересечении центра 50% | 100–180 мс | Нет VFX на каждом pixel move; glint с cooldown |
| `game.correct` | `PhotoComparator.handlePointerUp` + found marker | 1) brass/success ring на точке; 2) check-stamp; 3) 6–10 коротких flecks; 4) синхронный более тихий ring на второй фотографии | 0–450 мс | Начало ≤50 мс после pointer up; оба изображения подтверждены; marker остаётся читаемым после burst |
| `game.progress_pip` | `GameScreen`, изменение `liveFoundIds.length` | Следующий HUD pip stamp-in; короткая волна по счётчику; без сложного «полёта» между responsive layouts | 120–420 мс | Анимируется только новый pip, старые не replay при re-render |
| `game.streak` | `displayStreak` milestone 2/3/5+ | Латунный underline/spark один раз на milestone; при ошибке тихо гаснет без punishment | 250–500 мс | Не срабатывает на каждый found после 5; не перекрывает HUD |
| `game.misclick` | `PhotoComparator.addWrongClick` | Rust ring быстро расширяется, карандашный X рисуется, поверхность локально nudges 2 px и возвращается | 0–360 мс, fade до 700 мс | Нет full-screen shake; повторные taps имеют cooldown; hit testing не блокируется |
| `hint.activate` | `revealNextAreaHint` | Кнопка лупы отдаёт один press/glint, в зоне появляется lens sweep и 2–3 уменьшающихся импульса | 0–3 с | Активная подсказка после 3 с остаётся отмеченной статично, но больше не пульсирует постоянно |
| `timer.warning` | `timeLeft` thresholds | При 30 с — один amber tick/pulse; при 10 с — rust ring раз в 2 с, без тряски цифр | 350 мс / loop 2 с | Событие порога срабатывает один раз; пауза/overlay останавливают loop |
| `game.final_difference` | Последняя required находка | Усиленный correct → мягкий vignette focus → архивная completion-печать; затем результат | 0–800 мс | Последняя находка полностью видна до overlay; input блокируется сразу; нет ощущения задержки/лага |

Примечание к последней находке: текущие 200 мс до `LevelCompleteOverlay` недостаточны. Цель — 550–800 мс для standard motion и 0–100 мс для reduced motion. Состояние завершения и сохранение не должны зависеть от окончания CSS animation.

### 5.2. Result и награды — P0/P1

#### Победа уровня

Последовательность общей длительностью 1.1–1.5 с:

1. Scrim и panel входят через opacity + `translateY(12px)` за 200 мс.
2. Completion seal ставится за 350–500 мс. Это единственный spring-scale на обычном result.
3. Заголовок проявляется сразу после контакта печати.
4. Звёзды входят слева направо с шагом 100–130 мс; незаработанные звёзды остаются спокойными outlines.
5. Статистика поднимается группой за 200 мс.
6. CTA становится интерактивным сразу после появления, не дожидаясь завершения декоративного tail.

Не запускать все элементы одновременно. Не добавлять конфетти. Для perfect result разрешён один дополнительный brass ring и 10–12 paper flecks.

#### Поражение / таймаут

- мягкое затемнение и остановка активного timer ring;
- папка/панель входит без bounce;
- retry — самый визуально ясный CTA;
- не использовать красную вспышку, screen shake или падающие элементы;
- extend time подтверждается обратным запуском тонкой progress-line и cold-blue/brass pulse.

#### Артефакт

Сохранить существующую 1400-мс сцену как эталон L4 и улучшать точечно:

- при разломе печати добавить 8–12 wax/paper flecks, не яркие sparks;
- revealed card получает один ochre contour sweep;
- tag `collected` ставится отдельным stamp-beat;
- текст и CTA входят после раскрытия с шагом 80–120 мс;
- при reduced motion сразу показать раскрытый артефакт без искусственной 1400-мс паузы — текущее поведение уже близко к этому.

#### Campaign completion/report

- связать существующие локальные keyframes с общими токенами;
- восстановленные уровни считать короткой последовательностью сегментов, но cap анимации — 1.2 с независимо от числа уровней;
- артефакты раскрывать одной группой, не 13 отдельными вспышками;
- финальная печать должна быть самым сильным эффектом кампании, но оставаться архивной, не эпической.

### 5.3. Meta screens — P1

| Экран | Изменение | Зачем |
| --- | --- | --- |
| Home | Stagger только главных блоков при первом входе; current campaign получает медленный локальный light sweep не чаще раза в 8–12 с | Быстрее объяснить иерархию, не создавать постоянный шум |
| Home campaign selection | При выборе карточка получает selected border/glint до навигации; переход в Map использует shared preview/scale illusion 300–400 мс, если реализация надёжна | Создать причинность «открыли эту экспедицию» |
| Daily card | Холодно-синий optical sweep один раз при первом появлении; claimed state ставит спокойную печать | Daily отличается от campaign, но не выглядит рекламой |
| Map | При первом открытии нового прогресса сегмент route/progress draw; current card pulse ограничить 2–3 циклами; completed stamp-in | Карта показывает продвижение, а не просто список |
| Level unlock | Замок растворяется в 2–3 paper fragments, карточка меняет contrast и получает короткий brass edge sweep | Ясная награда за прогресс |
| Collection filter | Layout/crossfade 180–240 мс; без прыжка scroll | Коллекция ощущается цельной витриной |
| New artifact card | Один wax-seal pulse и corner tag stamp; эффект прекращается после просмотра | Направляет внимание к новому контенту |
| Artifact detail | Backdrop fade + card lift 12 px; изображение раскрывается до текста | Усиливает ценность предмета |
| Settings/review/modal | Единый modal enter/exit; backdrop и panel выходят синхронно | Убирает резкие монтажные склейки |

`DailyScreen.tsx` выглядит как упрощённый отдельный экран, тогда как активный Home flow запускает daily из карточки. До polish этого файла агент обязан подтвердить, что маршрут реально достижим; не тратить VFX-бюджет на мёртвый/legacy flow.

### 5.4. Ambient — P2, только после профилирования

Допустимы:

- 1 слой редкой пыли/волокон над Home или result;
- медленный градиент света внутри активной campaign preview;
- почти незаметный film-grain с фиксированной текстурой и низкой opacity;
- campaign-specific fog/dust только внутри preview, не поверх functional UI.

Запрещено:

- постоянно двигать сами gameplay-фотографии — это мешает поиску отличий;
- анимировать фон под pointer во время gameplay;
- бесконечные крупные `filter: blur()`/`drop-shadow()` на mobile;
- более двух ambient loops на одном экране;
- загружать video/WebGL только ради живого фона.

## 6. Screen transitions

Переходы должны отражать структуру приложения:

| Flow | Рекомендуемый переход |
| --- | --- |
| Home → Map | selected campaign/card scale `1 → 1.02`, затем crossfade/zoom в journal; 280–400 мс |
| Map → Game | выбранная scene preview слегка расширяется, HUD/photo fade-in; без долгого cinematic intro; 250–350 мс |
| Game → Result | final-difference ceremony, затем overlay из той же сцены; gameplay background остаётся контекстом |
| Result → next Game | overlay fade-out, следующая заранее загруженная сцена crossfade-in; 220–320 мс |
| Result → Map | panel уходит вниз на 8 px, map появляется с акцентом на completed/current card |
| Any → Settings | backdrop 150 мс, panel 200 мс; exit короче enter |

Не пытаться делать true shared-layout transition для тяжёлых scene images в первой задаче. Сначала реализовать надёжную иллюзию через scale/crossfade; shared element добавлять только после mobile/Safari проверки.

## 7. Reduced motion и доступность

Эффективная настройка:

```text
reducedEffects = OS prefers-reduced-motion OR saveData.settings.reducedMotion
```

В reduced mode:

- decorative particles, shake/nudge, route draw, ambient и stagger отключены;
- состояние меняется мгновенно или через opacity до 100 мс;
- correct/misclick сохраняют статичный check/X и цветовой контраст;
- hint сразу показывает спокойный outline без pulse/sweep;
- result сразу показывает итоговую композицию;
- artifact сразу раскрыт, без задержки;
- screen transitions не блокируют input;
- spinner/loading может вращаться только если это необходимо для понимания процесса; предпочтительнее opacity pulse.

Дополнительно:

- не использовать более трёх ярких flashes в секунду;
- не делать full-screen luminance flash;
- focus-visible остаётся сильнее декоративного glow;
- animation callbacks не должны быть единственным способом совершить save/navigation/reward.

## 8. Производительность

Цель: стабильные 60 fps на обычном desktop и 30–60 fps без заметных stalls на бюджетном mobile landscape.

Бюджеты:

- initial JS: не добавлять новую VFX dependency;
- core VFX CSS/SVG: ориентир до 12 KB gzip поверх текущей версии;
- новые bitmap assets в P0: 0;
- одновременно активные particles: ≤24 gameplay, ≤32 rare ceremony;
- full-screen animated layers: максимум 1, opacity/transform only;
- крупный animated blur: 0;
- idle loops: максимум 2 на meta screen, 0 на gameplay scene;
- эффект correct должен создаваться/удаляться без накопления DOM nodes и timers.

Проверять Chrome performance trace на серии из 10 быстрых misclick/correct interactions, смене A/B и открытии result. Искать long tasks >50 мс, layout thrashing, постоянно растущие timers/nodes и paint больших viewport-областей.

## 9. План реализации для coding-агента

### Этап 0 — baseline и контракт, 0.5–1 день

- Снять reference screenshots/video текущих Home, Map, Game, correct, misclick, hint, result, artifact, Collection в desktop и 844×390/640×360 landscape.
- Зафиксировать active routes и не полировать недостижимые экраны.
- Создать checklist motion events и таблицу фактических владельцев состояния.
- Согласовать, что P0 не меняет rewards, hit testing, economy или analytics semantics.

Gate: есть baseline и список точек интеграции; эффектам не требуется менять доменную модель.

### Этап 1 — motion foundation, 1 день

- Добавить runtime motion tokens без изменения canonical `tokens.json`.
- Реализовать `useReducedEffects` на OS + save setting.
- Применить единый modal/screen enter/exit к общим flows.
- Разделить geometry и animation wrappers в found/hint markers.
- Добавить общие press states для touch, mouse и keyboard.
- Ограничить/остановить бесконечные loops при reduced motion и platform pause.

Gate: нет transform-конфликтов; existing hitboxes визуально совпадают; reduced mode полностью статичен.

### Этап 2 — core gameplay feedback, 2–3 дня

- Реализовать `game.correct` с sync A/B, restrained flecks и persistent marker.
- Добавить отдельную реакцию нового HUD pip и capped streak milestones.
- Улучшить misclick без screen shake.
- Сделать finite hint sequence.
- Добавить tactile flip/slider feedback.
- Реализовать timer threshold states без изменения таймера.
- Поставить final-difference sequence и адаптивную delay для reduced motion.

Gate: каждое основное действие имеет response ≤50 мс; 10 быстрых interactions не вызывают визуального мусора или падения input responsiveness.

### Этап 3 — results/rewards, 2–3 дня

- Переписать generic result pop на staged victory choreography.
- Добавить последовательное появление звёзд и perfect variant.
- Привести timeout к спокойному fail feedback.
- Дополнить artifact reveal wax/paper flecks, contour и content stagger.
- Унифицировать Campaign Report motion tokens.

Gate: уровни L2/L3/L4 визуально различимы; CTA доступны без ожидания декоративного tail; редкие награды сильнее обычной находки.

### Этап 4 — meta polish, 2 дня

- Home selected/current feedback и restrained entrance hierarchy.
- Map progress/unlock/completed motion.
- Collection filter/detail/new-item motion.
- Причинные screen transitions с безопасным crossfade fallback.

Gate: mobile получает не меньше feedback, чем desktop; UI не зависит от hover.

### Этап 5 — ambient и optimization, 1–2 дня

- Добавлять только ambient, прошедший distraction review.
- Профилировать 844×390 и desktop.
- Удалить эффекты, которые не усиливают hierarchy или ухудшают frame time.
- Сверить VFX cue timing с `docs/SFX_PRODUCTION_PLAN.md`, чтобы visual/audio beats совпадали, но системы не зависели друг от друга.

Gate: соблюдены particle/loop/asset budgets; нет regressions при tab hide, platform pause, ads и смене экрана.

## 10. Рекомендуемое разбиение на PR

1. **PR VFX-01 — Foundation:** tokens, reduced effects, wrapper fix, button/modal motion.
2. **PR VFX-02 — Gameplay:** correct, misclick, hint, compare, HUD progress, timer.
3. **PR VFX-03 — Completion:** final difference, victory/fail, stars.
4. **PR VFX-04 — Rare rewards:** artifact reveal и campaign report.
5. **PR VFX-05 — Meta:** Home, Map, Collection, screen transitions.
6. **PR VFX-06 — Ambient/perf:** только если первые пять PR прошли визуальный QA.

Не объединять весь план в один большой PR: VFX требуют визуальной калибровки, а не только прохождения typecheck.

## 11. Проверки и визуальный QA

После каждого PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Для gameplay/layout и финального объединения:

```bash
pnpm test:e2e
pnpm agent:check
```

Обязательная ручная матрица:

| Viewport | Экраны / состояния |
| --- | --- |
| 1440×900 | Home, Map grid, Game A/B, result, artifact, Collection |
| 1280×720 | Compact desktop, overlays по высоте |
| 896×414 | Home carousel, Map cards, flip/slider gameplay, result |
| 844×390 | Основной mobile landscape stress case |
| 640×360 | Минимальная высота, HUD/overlay clipping |

Сценарии:

- correct на A и B, несколько находок подряд, final difference;
- 10 быстрых misclick, затем correct;
- hint с балансом и rewarded hint;
- flip/slider во время zoom/pan;
- timeout, extend, retry;
- 1/2/3-star result;
- artifact и campaign completion;
- быстрое повторное нажатие CTA;
- OS reduced motion и saved reduced motion;
- tab hide/resume, platform pause/resume, ad start/finish;
- RU/EN, keyboard focus и touch.

Автотесты должны проверять состояние, lifecycle и отсутствие зависания, а не пиксельную форму анимации. Для motion regression использовать стабильные screenshots конечных состояний и отдельное ручное/video review промежуточных кадров.

## 12. Definition of Done

VFX-проход считается завершённым, когда:

- correct, misclick, hint, compare, final difference и result имеют различимый мгновенный feedback;
- найденное отличие подтверждается на обеих фотографиях и в HUD;
- редкая награда заметно сильнее обычной находки, но не выглядит как casino/candy UI;
- touch, mouse и keyboard получают эквивалентный response;
- ни одна анимация не меняет hit testing, reward timing или save correctness;
- reduced motion охватывает CSS, Framer Motion и inline-driven sequences;
- на gameplay scene нет постоянного ambient движения;
- нет transform-конфликтов с rotation/position geometry;
- particle и loop budgets соблюдены;
- проверки проходят, а visual QA выполнен на desktop и двух mobile landscape размерах;
- пользовательские изменения отражены в `CHANGELOG.md`, архитектурные motion-правила — в `ARCHITECTURE.md`, а новые assets (если появятся после P0) — в `ASSET_MANIFEST.md` и `ASSET_PROVENANCE.json`.

## 13. Файлы первой волны

Основные точки реализации:

- `src/features/gameplay/PhotoComparator.tsx` — correct, misclick, hint, compare;
- `src/screens/GameScreen.tsx` — HUD, timer, final difference, overlay sequencing;
- `src/features/gameplay/LevelCompleteOverlay.tsx` — victory choreography;
- `src/features/gameplay/LevelFailedOverlay.tsx` — timeout/extend;
- `src/features/collection/ArtifactRevealOverlay.tsx` — rare reward polish;
- `src/features/campaign-report/CampaignCaseReportModal.tsx` — shared motion tokens;
- `src/app/App.tsx` — screen transitions;
- `src/app/styles.css` — tokens/keyframes/responsive/reduced motion;
- `src/screens/HomeScreen.tsx`, `MapScreen.tsx`, `CollectionScreen.tsx` — meta polish;
- `src/shared/ui/Button.tsx` и локальные CTA — unified press states;
- `src/entities/save/schema.ts`, `src/screens/SettingsScreen.tsx` — существующий reduced-motion contract/UI, если настройка выводится игроку.

Связанный audio timing: `docs/SFX_PRODUCTION_PLAN.md`.
