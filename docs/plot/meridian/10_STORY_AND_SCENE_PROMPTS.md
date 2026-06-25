# Story and scene-generation prompts
## Chapter 1 — «Белый меридиан»

Версия: 1.0  
Дата фиксации: 2026-06-25

Документ описывает сюжет первой главы, 12 сюжетных сцен и production prompts для создания пар изображений A/B.

---

# 1. Главная идея сюжета

В архив поступает запечатанный ящик с материалами северной научной экспедиции **«Полярная-7»**, пропавшей в 1978 году.

По официальной версии экспедиция:

- столкнулась с аномальной оттепелью;
- потеряла связь;
- покинула маршрут;
- не смогла вернуть большую часть материалов.

Но в ящике находятся две версии каждого фотоснимка:

- **Версия A** — исходный полевой снимок;
- **Версия B** — архивная копия, в которой отдельные детали изменены или удалены.

Игрок восстанавливает различия между снимками и постепенно выясняет, что экспедиция не погибла и не столкнулась с мистикой.

Учёные обнаружили в горах небольшую геотермальную долину, где даже зимой сохранялось тепло и рос редкий синий цветок. Руководитель экспедиции понял, что после публикации координат долину превратят в промышленный объект. Поэтому участники:

- подделали часть фотографий;
- убрали координаты и приборные показания;
- спрятали подлинную карту;
- инсценировали аварийное завершение маршрута;
- вывезли людей;
- оставили архивные доказательства в старом горном тоннеле.

Игрок не разоблачает преступление, а восстанавливает историю людей, которые решили сохранить уникальное место.

## Тон

- спокойная тайна;
- научная экспедиция;
- человеческое решение;
- без хоррора;
- без сверхъестественного объяснения;
- без смертей и насилия;
- финал должен оставлять чувство открытия, а не угрозы.

---

# 2. Сюжетная структура

## Акт 1 — Маршрут не сходится

Уровни 1–3.

Игрок замечает, что официальные фотографии скрывают дополнительные грузы, навигационные отметки и личный компас руководителя.

Открывается первый экспонат:

- **Латунный компас**.

## Акт 2 — Экспедиция шла не туда, куда указано в отчёте

Уровни 4–6.

Следы на железной дороге, метеопосту и леднике показывают, что группа продолжила путь после якобы объявленной эвакуации.

Открывается второй экспонат:

- **Полевая радиостанция**.

## Акт 3 — Они нашли тёплое место

Уровни 7–9.

Через тоннель, обсерваторию и теплицу игрок узнаёт о необычной температуре и синем растении.

Открывается третий экспонат:

- **Засушенный синий цветок**.

## Акт 4 — Исчезновение было прикрытием

Уровни 10–12.

Радиорубка, жилой модуль и скрытый архив показывают, что экспедиция ушла организованно, а координаты были спрятаны намеренно.

Открывается четвёртый экспонат:

- **Разорванная карта маршрута**.

---

# 3. Универсальные правила генерации

## Формат

- 1600 × 1000;
- aspect ratio 16:10;
- одна фиксированная камера;
- premium semi-realistic illustrated hidden-object scene;
- late-1970s northern scientific expedition;
- все игровые объекты в фокусе;
- средне-высокая детализация;
- ясные силуэты;
- без читаемого текста;
- без брендов;
- без логотипов;
- без интерфейса;
- без watermark.

## Критическое правило

**Версия B никогда не генерируется заново.**

Порядок:

1. создать Master A;
2. очистить ошибки;
3. зафиксировать композицию;
4. сделать копию;
5. применить отличия как отдельные локальные masked edits;
6. после каждого edit проверять изменения;
7. финально сравнить A/B через visual diff.

## Нельзя менять между A и B

- камеру;
- crop;
- освещение;
- общую цветокоррекцию;
- фактуру;
- снег;
- перспективу;
- положение всех незаявленных предметов;
- количество случайного мелкого мусора.

---

# 4. Уровень 1 — «Пристань Борея»

## Сюжетная роль

Экспедиция отправилась с северной пристани. Официальный снимок выглядит обычным, но исходный показывает дополнительный груз и личный компас руководителя.

## Отличия

1. На столе присутствует / отсутствует латунный компас.
2. Рядом с ящиками стоит четыре канистры вместо трёх.
3. На судовом спасательном круге есть тёмная полоса вместо светлой.
4. На дальнем причальном столбе сидит чайка / столб пуст.

## Master A prompt

```text
A premium semi-realistic 2D illustrated archival scene for a find-the-difference puzzle game.

Late-1970s northern expedition harbor named only through visual context, no readable signs. A small weathered research vessel is moored at a wooden pier surrounded by cold teal water and scattered sea ice. Snow-covered rocky coast, low warehouse buildings, stacked expedition crates, fuel canisters, rope coils, a portable field table, a brass compass resting clearly on the table, a life ring on the vessel, and a seagull perched on a distant mooring post.

Fixed 16:10 composition, slightly elevated eye-level camera, all important objects in focus. Documentary believable layout with clear object silhouettes and controlled medium-high detail. Premium hidden-object game quality, subtle painterly texture, realistic wood, metal, canvas and ice materials. Cold muted northern palette with warm rust and brass accents.

The scene must contain enough clean separation for four easy differences. Keep the foreground table, fuel canisters, life ring, and distant mooring post clearly visible.

No readable text, no logos, no brands, no watermark, no UI, no captions, no close-up faces, no depth-of-field blur, no extreme darkness, no neon, no horror, no fisheye distortion. This is the unchanged master image A.
```

## Version B edit prompt

```text
Edit the provided master image only through separate tightly masked local edits. Preserve the exact camera, composition, lighting, color grading, texture, perspective, snow patterns, water, and every unmasked object.

Apply exactly these four controlled changes:

1. Remove the brass compass from the field table, leaving a natural empty patch of tabletop.
2. Remove one fuel canister so that three remain instead of four.
3. Change the dark stripe on the vessel life ring to a light cream stripe while preserving the ring shape.
4. Remove the seagull from the distant mooring post, leaving the post intact.

Do not alter neighboring crates, ropes, vessel geometry, reflections, sky, ice, or shadows. Do not add text, logos, new clutter, or lighting changes. The result must remain pixel-aligned with image A outside the masked areas.
```

## Сюжетный вывод

В официальной версии убрали компас и часть груза. Экспедиция готовилась к более долгому маршруту, чем указано в документах.

---

# 5. Уровень 2 — «Береговой склад»

## Сюжетная роль

На складе обнаруживаются запасы, которых не было в официальном манифесте.

## Отличия

1. На верхней полке два спальных мешка вместо одного.
2. На ящике лежит моток синего троса / мотка нет.
3. У керосиновой лампы зелёный плафон вместо янтарного.
4. На стене висит пара снегоступов / одна снегоступа.
5. У двери стоит дополнительный деревянный ящик.

## Master A prompt

```text
A premium semi-realistic 2D illustrated archival interior for a find-the-difference puzzle game.

Inside a late-1970s northern expedition supply warehouse near an Arctic harbor. Wooden beams, frosted windows, metal shelving, stacked supply crates, canvas sleeping bags, rope coils, snowshoes, kerosene lanterns, insulated clothing, specimen cases and a heavy wooden door with tracked-in snow nearby.

Fixed 16:10 composition, eye-level camera, all important objects in focus. Documentary believable storage layout with clear silhouettes and controlled medium-high detail. Include two rolled sleeping bags on the upper shelf, a blue rope coil resting on a central crate, a kerosene lamp with a green glass shade, a complete pair of snowshoes hanging on the wall, and an extra small wooden crate beside the door.

Premium hidden-object illustration quality, subtle painterly texture, realistic timber, canvas, glass and metal. Cold daylight from frosted windows with one warm lamp accent.

No readable text, no logos, no brands, no watermark, no UI, no captions, no people, no blur, no horror, no neon. This is the unchanged master image A.
```

## Version B edit prompt

```text
Edit the supplied master image with five separate masked edits only. Preserve all unmasked pixels, camera, crop, lighting, texture, perspective and snow.

Make exactly these changes:

1. Remove one of the two rolled sleeping bags from the upper shelf.
2. Remove the blue rope coil from the central crate.
3. Change the kerosene lamp glass shade from green to muted amber, preserving shape and reflections.
4. Remove one snowshoe so only a single snowshoe remains on the wall.
5. Remove the small wooden crate beside the door, preserving the floor and door frame.

Do not reinterpret shelves, labels, neighboring boxes, window frost or shadows. No new objects, no global recoloring, no readable text.
```

## Сюжетный вывод

Количество зимнего снаряжения подтверждает: маршрут был рассчитан на большее число дней.

---

# 6. Уровень 3 — «Маяк Белой Чайки»

## Сюжетная роль

Маяк использовался не только для навигации судов. Положение сигнальных элементов указывает на скрытое направление маршрута.

## Отличия

1. Линза маяка повёрнута в другую сторону.
2. На столе есть латунный компас / компаса нет.
3. На крючке висят две сигнальные лампы вместо одной.
4. На карте одна красная метка отсутствует.
5. Оконная створка открыта / закрыта.

## Master A prompt

```text
A premium semi-realistic 2D illustrated interior of a remote Arctic lighthouse lantern room, designed for a find-the-difference puzzle.

Late-1970s northern expedition atmosphere. Circular lighthouse room with large glass windows, a visible snowy coastline and sea ice outside, brass Fresnel lens mechanism, a small navigation table, an abstract paper route map with no readable text, a brass compass on the table, two portable signal lamps hanging from a wall hook, metal stairs, maintenance tools and one window panel slightly open.

Fixed 16:10 composition, slightly elevated eye-level camera, all objects in focus. The lens orientation must be visually clear. The route map contains simple colored marks but no letters or readable labels. Include one clear red route mark.

Premium semi-realistic hidden-object illustration, restrained archival palette, brass and cold blue contrast, soft winter daylight, realistic glass and metal.

No readable text, no logos, no watermark, no people, no blur, no horror, no neon, no heavy fog. This is master image A.
```

## Version B edit prompt

```text
Perform exactly five local masked edits on the master image. Preserve the lighthouse room, camera, windows, outside landscape, lighting, reflections and all unmasked details.

1. Rotate the visible Fresnel lens mechanism so its main bright facet points in the opposite direction.
2. Remove the brass compass from the navigation table.
3. Remove one portable signal lamp from the wall hook, leaving one.
4. Remove the single red route mark from the abstract map while preserving the paper.
5. Close the previously open window panel while preserving the frame and frost.

Do not change the sea, coastline, stairs, tools, map shape, room geometry or global lighting. Maintain pixel alignment outside masks.
```

## Экспонат

**Латунный компас.**

## Сюжетный вывод

Компас руководителя появляется именно на маяке. Красная метка показывает, что группа свернула с официального маршрута.

---

# 7. Уровень 4 — «Ледовая железнодорожная платформа»

## Сюжетная роль

Старая грузовая ветка должна была быть закрыта, но экспедиция явно использовала её.

## Отличия

1. Стрелка рельсов направлена на боковую ветку / прямо.
2. На платформе пять бочек вместо четырёх.
3. Дверь вагона открыта / закрыта.
4. На скамье лежат меховые рукавицы / скамья пуста.
5. У фонаря красное стекло вместо белого.
6. Тележка стоит справа / слева от ящиков.

## Master A prompt

```text
A premium semi-realistic 2D illustrated late-1970s Arctic railway stop for a find-the-difference puzzle.

An isolated snow-covered narrow-gauge freight platform between rocky ice cliffs. A weathered rust-red expedition railcar stands beside a wooden shelter. Visible track switch, side spur disappearing toward the mountains, five fuel drums on the platform, stacked crates, a small cargo trolley to the right of the crates, an open railcar door, fur mittens on a wooden bench, and a signal lantern with red glass.

Fixed 16:10 composition, slightly elevated camera, all objects in focus, clear silhouettes and controlled detail. Cold overcast daylight, muted teal snow shadows, rust and wood accents, premium hidden-object illustration.

No readable text or destination boards, no logos, no people, no watermark, no blur, no neon, no horror. This is master image A.
```

## Version B edit prompt

```text
Apply six separate tightly masked edits to the supplied master image. Preserve camera, crop, snow, tracks, cliffs, light, texture and every unmasked object.

1. Change the track switch so the rails visually lead straight instead of toward the side spur.
2. Remove one fuel drum so four remain.
3. Close the railcar door.
4. Remove the fur mittens from the bench.
5. Change the signal lantern glass from red to pale white.
6. Move the cargo trolley from the right side of the crates to the left side, preserving scale and perspective.

Do not change the railcar body, shelter, other crates, footprints or global snow patterns.
```

## Сюжетный вывод

Группа ушла по заброшенной боковой ветке уже после официальной даты эвакуации.

---

# 8. Уровень 5 — «Метеорологическая станция»

## Сюжетная роль

Показания приборов показывают локальную аномальную оттепель, скрытую в официальной копии.

## Отличия

1. Стрелка термометра показывает более высокое положение.
2. Флюгер направлен на запад / восток.
3. На столе две кружки вместо одной.
4. На карте погоды есть синяя круговая отметка / её нет.
5. У снегомерной рейки видны три красные секции вместо двух.
6. Дверца барометра открыта / закрыта.

## Master A prompt

```text
A premium semi-realistic 2D illustrated interior and partial exterior view of a late-1970s Arctic weather station for a find-the-difference puzzle.

A compact research room with frosted windows overlooking snow and a rooftop weather mast. Inside: a large analog thermometer with its pointer in an unusually high position, a wall barometer with an open protective cover, a field table with two enamel mugs, an abstract weather map with one blue circular anomaly mark and no readable text, instrument cabinets, cables and notebooks. Through the window, a wind vane clearly points west and a snow-depth gauge shows three red painted sections.

Fixed 16:10 composition, all important instruments readable as shapes, no numbers required. Documentary scientific layout, premium hidden-object quality, soft cold daylight with warm desk lamp.

No readable labels, no logos, no people, no UI, no watermark, no blur, no neon, no horror. This is master image A.
```

## Version B edit prompt

```text
Edit only six explicitly masked regions in the master image. Preserve camera, room geometry, window view, lighting, reflections, paper texture and all unmasked instruments.

1. Move the analog thermometer pointer to a visibly lower position.
2. Rotate the wind vane outside so it points east instead of west.
3. Remove one enamel mug from the table.
4. Remove the blue circular anomaly mark from the weather map.
5. Change the snow-depth gauge so only two red sections are visible instead of three.
6. Close the protective cover of the wall barometer.

Do not alter any other instrument pointers, snow, clouds, furniture, cables or map paper.
```

## Сюжетный вывод

В районе гор температура была выше нормы. Это не ошибка измерения: данные специально занизили.

---

# 9. Уровень 6 — «Лагерь у ледника»

## Сюжетная роль

На леднике группа взяла образцы и установила полевую радиостанцию, хотя по отчёту связь уже была потеряна.

## Отличия

1. Полевая рация стоит на ящике / отсутствует.
2. У палатки две пары лыж вместо одной.
3. В лотке есть голубой ледяной керн / лоток пуст.
4. Флажок на леднике синий / жёлтый.
5. Санный груз стоит ближе к палатке / дальше.
6. На снегу есть цепочка следов к трещине / следов нет.

## Master A prompt

```text
A premium semi-realistic 2D illustrated Arctic glacier expedition camp for a find-the-difference puzzle.

Late-1970s scientific field camp on a broad glacier under overcast northern light. One canvas expedition tent, stacked specimen crates, a field radio clearly placed on top of a wooden case, two pairs of skis leaning beside the tent, a metal sample tray containing a blue ice core, a blue survey flag near a safe ice crack, a loaded sled positioned close to the tent, and a clear line of boot prints leading toward the crack.

Fixed 16:10 composition, slightly elevated camera, all important objects in focus, clear snow silhouettes and controlled detail. Premium hidden-object illustration, realistic canvas, snow, ice, wood and metal, muted cold palette with warm equipment accents.

No readable text, no logos, no people, no UI, no watermark, no blur, no storm obscuring details, no horror. This is master image A.
```

## Version B edit prompt

```text
Apply exactly six separate masked edits. Preserve camera, glacier, tent, sky, snow texture, shadows and every unmasked object.

1. Remove the field radio from the wooden case.
2. Remove one pair of skis so only one pair remains beside the tent.
3. Remove the blue ice core from the sample tray, leaving the tray empty.
4. Change the survey flag from blue to muted yellow while preserving fabric shape.
5. Move the loaded sled farther away from the tent along the same perspective line.
6. Remove the line of boot prints leading toward the ice crack.

Do not alter the crack, other footprints, crates, tent ropes or overall lighting.
```

## Экспонат

**Полевая радиостанция.**

## Сюжетный вывод

Связь не была потеряна полностью. Кто-то продолжал передавать сообщения после официального завершения экспедиции.

---

# 10. Уровень 7 — «Старый горный тоннель»

## Сюжетная роль

Тоннель ведёт в закрытую часть маршрута. Видно, что им недавно пользовались.

## Отличия

1. На стене горит одна дополнительная лампа.
2. Кабель подключён к распределительной коробке / висит свободно.
3. На полу стоит деревянный ящик / ящика нет.
4. Вентиляционная заслонка открыта / закрыта.
5. На снегу у входа есть следы саней / нет.
6. Красный аварийный фонарь висит справа / слева.
7. На дальней двери есть круглый символ / дверь пустая.

## Master A prompt

```text
A premium semi-realistic 2D illustrated abandoned mountain tunnel used by a late-1970s northern scientific expedition, for a find-the-difference puzzle.

View from just inside a snow-lined tunnel entrance. Rough rock walls reinforced with old metal ribs, a narrow maintenance track, electrical cables, a distribution box with one cable visibly connected, several industrial lamps including one extra lit lamp deeper inside, a wooden supply crate on the floor, an open ventilation shutter, sled tracks in the snow near the entrance, a red emergency lantern hanging on the right wall, and a distant metal door marked only with a simple circular symbol, no readable text.

Fixed 16:10 composition, all important objects visible, controlled medium-high detail, soft cold entrance light and warm practical lamps. Premium semi-realistic hidden-object illustration, atmospheric but not horror.

No readable text, no logos, no people, no darkness hiding gameplay objects, no watermark, no blur, no neon. This is master image A.
```

## Version B edit prompt

```text
Perform seven precise local masked edits while preserving camera, tunnel geometry, rock texture, snow, lighting and every unmasked object.

1. Turn off and remove the glow from the extra lamp deeper in the tunnel while keeping the fixture.
2. Disconnect the cable from the distribution box so it hangs freely.
3. Remove the wooden supply crate from the floor.
4. Close the ventilation shutter.
5. Remove the sled tracks from the snow near the entrance.
6. Move the red emergency lantern from the right wall to the corresponding left wall position.
7. Remove the circular symbol from the distant metal door.

Do not change other lamps, rails, cables, doorway shape, rock shadows or overall brightness.
```

## Сюжетный вывод

Тоннель был активен. Через него перевозили оборудование, а дверь с круговым знаком скрывала внутренний сектор.

---

# 11. Уровень 8 — «Купол обсерватории»

## Сюжетная роль

Обсерватория отслеживала не звёзды, а тепловую активность долины.

## Отличия

1. Телескоп направлен в другую сторону.
2. На столе лежит красный блокнот / отсутствует.
3. Малый люк открыт / закрыт.
4. На схеме есть золотая точка / её нет.
5. Стул стоит у телескопа / у стола.
6. На объективе есть защитная крышка / нет крышки.
7. Часы показывают другое положение стрелок.

## Master A prompt

```text
A premium semi-realistic 2D illustrated interior of a late-1970s Arctic observatory dome for a find-the-difference puzzle.

A circular scientific room under a partially open dome, with a large analog telescope aimed toward a low mountain valley rather than the sky, mechanical controls, a research desk with a red field notebook, an abstract thermal-or-star diagram with one small golden point and no readable text, an open maintenance hatch, a chair beside the telescope, a protective lens cap attached to the front of a secondary optical instrument, and a large analog wall clock.

Fixed 16:10 composition, slightly elevated eye-level camera, all important objects in focus. Cold twilight through the dome slit, warm instrument lamps, premium hidden-object illustration, realistic brass, steel, paper and painted wood.

No readable text or numbers, no logos, no people, no UI, no watermark, no blur, no neon, no horror. This is master image A.
```

## Version B edit prompt

```text
Apply seven separate tightly masked edits. Preserve the observatory geometry, dome, lighting, mountains, controls and every unmasked object.

1. Rotate the main telescope so it points toward the opposite side of the dome.
2. Remove the red field notebook from the desk.
3. Close the maintenance hatch.
4. Remove the small golden point from the abstract diagram.
5. Move the chair from beside the telescope to beside the desk.
6. Remove the protective lens cap from the secondary optical instrument.
7. Change the wall clock hands to a clearly different time while preserving the clock face.

Do not alter any other controls, diagram lines, reflections or global illumination.
```

## Сюжетный вывод

Приборы были направлены на горную впадину. Учёные наблюдали источник тепла, а не небесное явление.

---

# 12. Уровень 9 — «Полярная теплица»

## Сюжетная роль

Теплица подтверждает существование устойчивого тёплого микроклимата и редкого растения.

## Отличия

1. В центральном горшке растёт синий цветок / обычное зелёное растение.
2. На верхней полке четыре горшка вместо трёх.
3. У одной лампы холодно-белый свет вместо тёплого.
4. Лейка стоит слева / справа от стола.
5. На стекле есть круглая область без конденсата / стекло равномерно запотевшее.
6. Стрелка термометра выше / ниже.
7. Один металлический лоток открыт / закрыт.

## Master A prompt

```text
A premium semi-realistic 2D illustrated interior of a late-1970s polar greenhouse inside a geodesic glass dome, for a find-the-difference puzzle.

A believable experimental greenhouse surrounded by snow outside. Metal planting tables, warm grow lamps, condensation on glass panels, pipes, analog temperature instruments, four plant pots on an upper shelf, a watering can on the left side of the central table, one open metal specimen tray, and a central pot containing a distinctive but natural-looking small blue flower. One grow lamp emits a cooler white light than the others. A round clear patch appears in the condensation on one glass panel. The thermometer pointer is visibly high.

Fixed 16:10 composition, all important objects in focus, premium semi-realistic hidden-object quality, rich but controlled plant detail, warm interior versus cold exterior contrast.

No readable labels, no logos, no people, no watermark, no fantasy glow, no neon, no blur. The blue flower must look biologically plausible rather than magical. This is master image A.
```

## Version B edit prompt

```text
Perform seven controlled local edits on the supplied master image. Preserve camera, dome geometry, plants, condensation outside masked areas, lighting and every unmasked object.

1. Replace the small blue flower in the central pot with an ordinary green leafy plant of the same size and silhouette.
2. Remove one pot from the upper shelf so three remain.
3. Change the cool-white grow lamp to the same warm tone as the other lamps.
4. Move the watering can from the left side of the central table to the right side.
5. Remove the round clear patch from the glass condensation so the panel is evenly fogged.
6. Move the thermometer pointer to a visibly lower position.
7. Close the open metal specimen tray.

Do not alter neighboring plants, snow outside, dome framing, shadows or global color grade.
```

## Экспонат

**Засушенный синий цветок.**

## Сюжетный вывод

Синий цветок существовал. Его скрыли из официальной версии, как и высокую температуру внутри станции.

---

# 13. Уровень 10 — «Радиорелейная башня»

## Сюжетная роль

Последние сигналы шли не наружу, а между внутренними станциями маршрута.

## Отличия

1. Параболическая антенна направлена в другую сторону.
2. На пульте горит зелёный индикатор / красный.
3. Полевая рация лежит на стуле / отсутствует.
4. Один кабель подключён к верхнему разъёму / нижнему.
5. На подоконнике лежит катушка провода / её нет.
6. Сигнальная лампа снаружи включена / выключена.
7. На схеме маршрута есть дополнительная линия / линии нет.

## Master A prompt

```text
A premium semi-realistic 2D illustrated interior of a late-1970s Arctic radio relay station for a find-the-difference puzzle.

A compact high-altitude communications room with frost-lined windows, analog radio consoles, cable racks, a chair holding a portable field radio, a wire spool on the windowsill, an abstract route diagram with one additional connecting line and no readable text, and a large exterior parabolic antenna visible through the window pointing toward an inland mountain sector. A green status indicator glows on the console. One main cable is connected to the upper socket. An exterior signal lamp is visibly lit.

Fixed 16:10 composition, all important objects clearly visible, premium semi-realistic hidden-object illustration, realistic analog equipment, warm console light against cold blue snow.

No readable text, no logos, no brands, no people, no watermark, no blur, no neon, no horror. This is master image A.
```

## Version B edit prompt

```text
Apply exactly seven masked edits while preserving room geometry, camera, snow, windows, console layout, lighting and all unmasked equipment.

1. Rotate the exterior parabolic antenna toward the opposite direction.
2. Change the console status indicator from green to red.
3. Remove the portable field radio from the chair.
4. Move the main cable connection from the upper socket to the lower socket.
5. Remove the wire spool from the windowsill.
6. Turn off the exterior signal lamp while preserving the fixture.
7. Remove the additional connecting line from the abstract route diagram.

Do not alter any other console lights, antenna structure, frost patterns, furniture or shadows.
```

## Сюжетный вывод

Связь продолжалась внутри маршрута. Сообщение «меридиан тёплый» означало координатную линию к долине.

---

# 14. Уровень 11 — «Жилой модуль»

## Сюжетная роль

Комната показывает, что люди не бежали в панике. Они собрали вещи и ушли по плану.

## Отличия

1. Одна кровать аккуратно заправлена / смята.
2. На столе стоят три кружки вместо двух.
3. На вешалке нет одной куртки.
4. Шахматная фигура стоит на доске / лежит рядом.
5. Дверца шкафчика открыта / закрыта.
6. У печки лежит связка дров / отсутствует.
7. На подоконнике стоит маленький горшок с ростком / пусто.
8. У выхода находятся две пары ботинок вместо одной.

## Master A prompt

```text
A premium semi-realistic 2D illustrated late-1970s Arctic expedition living module for a find-the-difference puzzle.

A compact but orderly shared room inside a polar station. Metal bunk beds, one neatly made bed, one used bed, a central table with three enamel mugs and a small chessboard with one piece standing on the board, insulated jackets on wall hooks, an open storage locker, a small iron stove with a bundle of firewood beside it, a tiny potted green sprout on the windowsill, and two pairs of heavy expedition boots near the exit.

The room should feel recently vacated in an organized way, not abandoned in panic. Fixed 16:10 composition, eye-level camera, all objects in focus, warm practical light and blue snow through the window. Premium semi-realistic hidden-object illustration.

No readable text, no logos, no people, no photographs with recognizable faces, no watermark, no blur, no horror, no destruction. This is master image A.
```

## Version B edit prompt

```text
Perform eight precise local masked edits. Preserve camera, room layout, lighting, furniture, window view and every unmasked object.

1. Change the neatly made bed so the blanket appears rumpled.
2. Remove one enamel mug so two remain on the table.
3. Remove one insulated jacket from the wall hooks.
4. Move the standing chess piece from the board to the table beside it.
5. Close the open storage locker door.
6. Remove the bundle of firewood beside the stove.
7. Remove the small potted sprout from the windowsill.
8. Remove one pair of expedition boots so only one pair remains near the exit.

Do not change the other bed, chessboard pattern, stove, floor objects or global shadows.
```

## Сюжетный вывод

Комната была оставлена спокойно. Часть одежды и обуви забрали. Экспедиция ушла организованно.

---

# 15. Уровень 12 — «Скрытый архив долины»

## Сюжетная роль

Финальная комната находится за дверью тоннеля. Здесь хранились подлинные карты, образцы и объяснение решения экспедиции.

## Отличия

1. На столе лежит собранная карта / один фрагмент отсутствует.
2. Латунный компас указывает на север / на восток.
3. В витрине есть засушенный синий цветок / витрина пуста.
4. Радиопередатчик включён / выключен.
5. На стене горит одна дополнительная лампа.
6. В ящике лежат три образца породы вместо двух.
7. У двери стоят сани / саней нет.
8. За окном виден пар от геотермального источника / пара нет.

## Master A prompt

```text
A premium semi-realistic 2D illustrated hidden archive chamber belonging to a late-1970s northern scientific expedition, for the final find-the-difference level.

A protected room built inside a mountain tunnel, warm and orderly rather than secretive or threatening. A large field table holds a reassembled torn route map with abstract lines and no readable text, a brass compass pointing north, sample boxes, and an active analog radio transmitter with a green power light. A glass specimen case contains one pressed blue flower. Three rock samples sit in an open drawer. An extra wall lamp is lit. A compact expedition sled stands near the exit. Through a reinforced window or open observation slit, a snowy hidden valley is visible with a faint plume of steam rising from a geothermal spring.

Fixed 16:10 composition, slightly elevated eye-level camera, all important objects in focus. Premium semi-realistic hidden-object illustration, warm archive light contrasted with cold blue valley, realistic wood, brass, paper, glass and stone.

No readable text, no logos, no people, no watermark, no magical glow, no horror, no neon, no blur. The room must communicate preservation and scientific care. This is master image A.
```

## Version B edit prompt

```text
Apply exactly eight separate masked edits to the final master image. Preserve the exact camera, room geometry, lighting, window view outside masked areas, textures and every unmasked object.

1. Remove one fragment from the reassembled route map, leaving a clear missing section.
2. Rotate the brass compass needle so it points east instead of north.
3. Remove the pressed blue flower from the glass specimen case.
4. Turn off the radio transmitter and its green power light while preserving the equipment.
5. Turn off and remove the glow from the extra wall lamp while keeping the fixture.
6. Remove one rock sample from the drawer so two remain.
7. Remove the expedition sled from beside the exit.
8. Remove the geothermal steam plume from the hidden valley view while preserving the landscape.

Do not change other map lines, furniture, radio controls, drawer shape, snow, mountains or global color grading. Maintain pixel alignment outside the edited masks.
```

## Экспонат

**Разорванная карта маршрута.**

## Финальный сюжетный вывод

Подлинная карта подтверждает существование тёплой долины.

Экспедиция не исчезла. Она уничтожила прямые координаты, вывезла людей и скрыла материалы, чтобы сохранить долину от немедленной промышленной разработки.

Игрок завершает главу не публикацией координат, а созданием защищённой архивной записи:

> «Местоположение не разглашается. Материалы сохранены для будущего научного совета».

---

# 16. Финальная сцена после главы

После закрытия уровня 12 показать короткую модалку:

## Заголовок

**Белый меридиан восстановлен**

## Текст

«Экспедиция “Полярная-7” не пропала. Она изменила собственный архив, чтобы скрыть долину, способную пережить полярную зиму. Координаты остаются запечатанными, но история экспедиции больше не потеряна».

## Награда

- четвёртый экспонат;
- завершённая карта;
- эксклюзивная архивная печать;
- teaser следующего архива.

---

# 17. Важное замечание по сюжетным отличиям

Не каждое отличие обязано быть ключевой уликой.

Распределение:

- 1–2 отличия уровня — сюжетно важные;
- остальные — поддерживают механику, атмосферу и сложность;
- после уровня интерфейс выделяет только главную найденную улику.

Это не перегружает сюжет и позволяет использовать честные визуальные различия.

---

# 18. Рекомендуемые story beats в интерфейсе

После уровня показывать одну короткую строку.

1. «Груза было больше, чем указано в манифесте».
2. «Запасов хватало не на три дня, а минимум на две недели».
3. «На маяке отмечен другой маршрут».
4. «Закрытая железнодорожная ветка использовалась после эвакуации».
5. «Температурные данные намеренно занизили».
6. «Радиопередачи продолжались».
7. «Тоннель был открыт и снабжался электричеством».
8. «Обсерватория следила за долиной».
9. «Синий цветок существовал».
10. «Сигналы шли между внутренними станциями».
11. «Экспедиция ушла организованно».
12. «Исчезновение было способом защитить долину».
