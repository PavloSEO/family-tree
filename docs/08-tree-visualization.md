# 08 -- Визуализация дерева

---

## Стек

| Библиотека | Роль |
|-----------|------|
| @xyflow/react 12 | Рендер нод и ребер, зум, пан, миникарта, контролы |
| elkjs | Автоматический layout (позиции нод) |
| packages/shared/tree-compute.ts | BFS, вычисление названий связей |

## Ноды

Три типа кастомных нод:

### PersonNode (живой человек)

```
+------------------+
|   [ PHOTO ]      |   <- круглый аватар 48px, цветной
|   Имя            |   <- md-typescale-label-large
|   Фамилия        |
|   (1985-)        |   <- md-typescale-label-small, --md-sys-color-on-surface-variant
|   [flag]         |   <- emoji флаг страны (если есть)
+------------------+

Рамка: 2px solid, --md-sys-color-outline-variant
Фон: --md-sys-color-surface
Скругление: --md-sys-shape-corner-large (16px)
```

Корневая нода (от которой строится дерево): рамка `--md-sys-color-primary`, тень elevation-2.

### DeadPersonNode

То же что PersonNode, но:
- Фото: CSS `filter: grayscale(1)`
- Рамка: `--md-sys-color-outline` (приглушенная)
- Годы: `(1945-2010)`

### ExternalNode (внешняя ветка)

То же что PersonNode, но:
- Рамка: `border-style: dashed`
- Фон: `--md-sys-color-surface-container-low` (чуть темнее)

## Ребра

| Тип | Визуал |
|-----|--------|
| parent -> child | Сплошная линия, 2px, `--md-sys-color-outline` |
| spouse | Двойная линия (два параллельных path с gap 4px), `--md-sys-color-primary` |
| внешняя ветка | Пунктирная линия, `strokeDasharray: "6,4"`, `--md-sys-color-outline-variant` |

## ELK Layout

Конфигурация:
```typescript
{
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",                              // Предки сверху, потомки снизу
  "elk.layered.spacing.nodeNodeBetweenLayers": "120",   // Расстояние между поколениями
  "elk.spacing.nodeNode": "50",                         // Расстояние между нодами в одном слое
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP"
}
```

Размер ноды: 160x120px.

### Группировка пар (spouse)

ELK не группирует пары автоматически. Решение: перед передачей в ELK создавать compound node для каждой пары:

```typescript
// Пара = compound node, содержащий двух супругов
{
  id: "couple-uuid",
  layoutOptions: {
    "elk.direction": "RIGHT",              // Супруги горизонтально
    "elk.spacing.nodeNode": "20",          // Близко друг к другу
  },
  children: [
    { id: "husband-uuid", width: 160, height: 120 },
    { id: "wife-uuid", width: 160, height: 120 }
  ]
}
```

Дети пары подключаются к compound node.

## Режимы просмотра

| Режим | Алгоритм |
|-------|---------|
| Полное дерево | BFS вверх `depthUp` уровней + BFS вниз `depthDown` уровней от root |
| Только предки | BFS вверх, без потомков |
| Только потомки | BFS вниз, без предков |
| Прямая линия | Только parent->parent (мужская линия по умолчанию), без боковых |
| Семейная группа | root + spouse + дети + родители (1 уровень) |
| Отцовская линия | Только parent с gender=male вверх |
| Материнская линия | Только parent с gender=female вверх |

UI: `md-outlined-segmented-button-set` (labs) с 7 кнопками. На мобильных -- `md-outlined-select`.

## Фильтры

| Фильтр | Компонент | Логика |
|--------|----------|--------|
| По стране | `md-outlined-select` | Показать только нод с указанным `country` |
| По статусу | `md-outlined-select` (Все / Живые / Умершие) | Фильтр по `dateOfDeath` |
| По ветке | `md-outlined-select` (Все / Отцовская / Материнская) | Переключает режим |
| Поиск | `md-outlined-text-field` | Подсветка найденной ноды + fitView к ней |

## Навигация

- Клик на ноду: `navigate('/person/' + id)` -- открытие карточки
- Двойной клик: перестроить дерево от этой ноды как root
- Зум: колесо мыши / pinch на тач
- Пан: перетаскивание фона
- Миникарта: правый нижний угол

## Внешние ветки

По умолчанию свернуты. Видна только нода супруга + иконка "+" (`md-icon-button`, Material Symbol `unfold_more`). При клике -- анимированное раскрытие предков супруга до `externalDepth` уровней.

## BFS -- вычисление связей

Файл: `packages/shared/src/tree-compute.ts`

```typescript
// Тип шага в пути
type PathStep = {
  type: "parent" | "spouse";
  direction: "up" | "down" | "lateral";
  personId: string;
};

// BFS от fromId до toId
function findShortestPath(fromId, toId, relationships): PathStep[] | null

// Паттерн пути -> русское название
function getRelationshipLabel(steps, fromGender, toGender): string
```

### Паттерны путей

| Паттерн | Мужчина | Женщина |
|---------|---------|---------|
| U | Отец | Мать |
| D | Сын | Дочь |
| S | Муж | Жена |
| UU | Дедушка | Бабушка |
| DD | Внук | Внучка |
| UUU | Прадедушка | Прабабушка |
| DDD | Правнук | Правнучка |
| UD | Брат | Сестра |
| UUD | Дядя | Тетя |
| UDD | Племянник | Племянница |
| UUDD | Двоюродный брат | Двоюродная сестра |
| UUUDDD | Троюродный брат | Троюродная сестра |
| SU | Тесть/Свекор | Теща/Свекровь |
| DS | Зять | Невестка |
| SUD | Шурин/Деверь | Золовка/Свояченица |

`U` = parent вверх, `D` = parent вниз, `S` = spouse.

Путь длиннее 6 шагов или неизвестный паттерн: "Дальний родственник".

### Уточнение свойственников

Для SU (родители супруга) название зависит от пола исходного человека:
- from=male, to=male: Тесть (отец жены)
- from=male, to=female: Теща (мать жены)
- from=female, to=male: Свекор (отец мужа)
- from=female, to=female: Свекровь (мать мужа)

Реализация: `getRelationshipLabel(steps, fromGender, toGender)` принимает оба пола.
