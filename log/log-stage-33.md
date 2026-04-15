# Этап 33 — клиент: `TreeFilters`

**ROADMAP:** фильтры **`md-outlined-select`**: страна, статус, ветка; поиск по имени через **`md-outlined-text-field`** с подсветкой найденной ноды и прокруткой к ней.

## Сделано

### Фильтры и поиск

- **`packages/client/src/components/tree/TreeFilters.tsx`** — три **`MdSelect`** (страна из общего списка, статус «Все / Только живые» → `aliveOnly`, ветка «Только ядро / Внешние предки глубина 0…10» → `showExternal` + `externalDepth`); **`MdTextField`** (outlined) для поиска; строка **`find`** в URL с **debounce 400 ms** (`replace: true`).
- **`packages/client/src/lib/country-select-options.ts`** — общий список стран для формы и дерева; **`PersonForm`** переведён на импорт оттуда (пустой код — «Не указано» в форме, в дереве подпись первой опции переопределена на **«Все страны»**).

### API query / страница дерева

- **`packages/client/src/api/tree.ts`** — **`treeQueryParamsFromSearchParams`**, **`treeQueryCacheKey`**: только параметры запроса к API (без **`find`**), стабильная строка для ключа и эффекта загрузки.
- **`packages/client/src/pages/TreePage.tsx`** — ключ **`FamilyTree`**: `personId|treeQueryCacheKey(...)`; **`useEffect`** загрузки дерева зависит от этого ключа (смена **`find`** не перезагружает API и не перемонтирует canvas).

### Подсветка и auto-scroll

- **`packages/client/src/components/tree/tree-search-match.ts`** — **`findFirstMatchingPersonId`**: первая нода по подстроке в «имя фамилия», порядок как у сортировки имён на сервере.
- **`packages/client/src/components/tree/FamilyTree.tsx`** — проп **`findQuery`**; слияние **`isHighlighted`** в **`data`** нод после раскладки; **`setCenter`** по центру найденной ноды (с задержкой после обновления нод).
- **`tree-node-data.ts`**, **`PersonNode`**, **`DeadPersonNode`**, **`ExternalNode`** — опциональный **`isHighlighted`**, контур **`outline`** (tertiary).

### Интеграция UI

- Панель **`TreeFilters`** в оверлее под **`TreeControls`**, общий столбец с прокруткой при нехватке высоты.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Заметки

- Поиск только по **текущему** ответу дерева (клиент); параметр **`find`** не уходит на сервер.
- При нескольких совпадениях выбирается одна нода по фиксированному порядку сортировки.

## Следующий этап

**34** — клик / двойной клик по ноде, сворачивание внешних веток — `ROADMAP.md`, [log-stage-34.md](./log-stage-34.md).
