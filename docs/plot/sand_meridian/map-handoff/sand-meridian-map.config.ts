export type SandMeridianMapPoint = {
  order: number;
  id: string;
  titleRu: string;
  titleEn: string;
  promptFile: string;
  x: number;
  y: number;
  landmark: string;
  storyRole: string;
};

export const sandMeridianMapPoints: SandMeridianMapPoint[] = [
  {"order": 1, "id": "sm-01-desert-edge-camp", "titleRu": "Край барханов", "titleEn": "Desert Edge Camp", "promptFile": "01_desert-edge-camp.md", "x": 0.1, "y": 0.82, "landmark": "Стартовый лагерь на границе каменистой равнины и первых барханов", "storyRole": "Первый признак подмены маршрута"},
  {"order": 2, "id": "sm-02-caravan-trail", "titleRu": "След каравана", "titleEn": "Caravan Trail", "promptFile": "02_caravan-trail.md", "x": 0.2, "y": 0.72, "landmark": "Караванная тропа и временная точка перегрузки", "storyRole": "Груз тайно увели с официального пути"},
  {"order": 3, "id": "sm-03-dune-basin", "titleRu": "Чаша дюн", "titleEn": "Dune Basin", "promptFile": "03_dune-basin.md", "x": 0.32, "y": 0.8, "landmark": "Окружённая барханами впадина с частично раскрытым каменным ориентиром", "storyRole": "Первый знак солнца и линии меридиана"},
  {"order": 4, "id": "sm-04-dry-well", "titleRu": "Сухой колодец", "titleEn": "Dry Well", "promptFile": "04_dry-well.md", "x": 0.41, "y": 0.67, "landmark": "Старый каменный колодец с треногой и скрытой шахтой", "storyRole": "Намёк на подземную гидросистему"},
  {"order": 5, "id": "sm-05-rock-arch", "titleRu": "Каменная арка", "titleEn": "Rock Arch", "promptFile": "05_rock-arch.md", "x": 0.34, "y": 0.54, "landmark": "Массивная природная арка, используемая как геодезический ориентир", "storyRole": "Маршрутные метки выстраиваются по полуденной оси"},
  {"order": 6, "id": "sm-06-canyon-pass", "titleRu": "Каньонный проход", "titleEn": "Canyon Pass", "promptFile": "06_canyon-pass.md", "x": 0.46, "y": 0.44, "landmark": "Узкий красный каньон с грузовой переправой", "storyRole": "Скрытая перевозка оборудования"},
  {"order": 7, "id": "sm-07-abandoned-dig-site", "titleRu": "Заброшенный раскоп", "titleEn": "Abandoned Dig Site", "promptFile": "07_abandoned-dig-site.md", "x": 0.58, "y": 0.55, "landmark": "Полузасыпанный археологический раскоп с брошенными тентами", "storyRole": "Доказательство намеренного сворачивания работ"},
  {"order": 8, "id": "sm-08-oasis-iram", "titleRu": "Оазис Ирам", "titleEn": "Oasis Iram", "promptFile": "08_oasis-iram.md", "x": 0.69, "y": 0.41, "landmark": "Небольшой зелёный оазис с полевой водной станцией", "storyRole": "Подтверждение живой подпитки древней системы"},
  {"order": 9, "id": "sm-09-salt-flat", "titleRu": "Соляное зеркало", "titleEn": "Salt Flat", "promptFile": "09_salt-flat.md", "x": 0.81, "y": 0.49, "landmark": "Белая соляная равнина с геодезическими штативами", "storyRole": "Все точки складываются в идеальную меридианную линию"},
  {"order": 10, "id": "sm-10-ruined-observatory", "titleRu": "Разрушенная обсерватория", "titleEn": "Ruined Observatory", "promptFile": "10_ruined-observatory.md", "x": 0.87, "y": 0.32, "landmark": "Круглая разрушенная каменная обсерватория на плато", "storyRole": "Звёздная привязка раскрывает направление входа"},
  {"order": 11, "id": "sm-11-buried-temple-courtyard", "titleRu": "Двор засыпанного храма", "titleEn": "Buried Temple Courtyard", "promptFile": "11_buried-temple-courtyard.md", "x": 0.76, "y": 0.21, "landmark": "Частично раскопанный храмовый двор у скальной стены", "storyRole": "Архитектура подтверждает линию меридиана"},
  {"order": 12, "id": "sm-12-storm-ridge", "titleRu": "Гряда бури", "titleEn": "Storm Ridge", "promptFile": "12_storm-ridge.md", "x": 0.61, "y": 0.15, "landmark": "Высокая ветреная гряда с последним скрытым лагерем", "storyRole": "Раскрывается намеренная защита маршрута"},
  {"order": 13, "id": "sm-13-buried-meridian", "titleRu": "Погребённый меридиан", "titleEn": "Buried Meridian", "promptFile": "13_buried-meridian.md", "x": 0.47, "y": 0.25, "landmark": "Скрытая кратерообразная впадина с входом в подземный комплекс", "storyRole": "Финальная истина о древней гидросистеме"},
];

export const sandMeridianMapConfig = {
  chapterId: 'sand-meridian',
  aspectRatio: 16 / 10,
  coordinateSystem: 'normalized-top-left' as const,
  routePointIds: sandMeridianMapPoints.map((point) => point.id),
};
