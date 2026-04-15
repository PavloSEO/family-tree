# Этап 34 — клиент: взаимодействие с деревом

**ROADMAP:** клик по ноде — переход в карточку; двойной клик — дерево от выбранного корня; внешние ветки по умолчанию свернуты; кнопка **«+»** для раскрытия.

## Сделано

### Навигация (React Flow)

- **`packages/client/src/components/tree/FamilyTree.tsx`** — **`onNodeClick`**: отложенный переход на **`/person/:id`** (~260 ms, чтобы отличить от двойного клика); **`onNodeDoubleClick`**: переход на **`/tree/:id`** с сохранением текущего **query** (`searchParams`).
- Очистка таймера при размонтировании.

### Внешние ветки

- **`packages/client/src/components/tree/tree-collapse-external.ts`** — **`treeResponseWithoutExternalNodes`**: только ноды с **`isExternal === false`** и рёбра между оставшимися id.
- В **`FamilyTreeCanvas`**: состояние **`externalExpanded`** (по умолчанию **`false`**); при новом **`data`** сброс в **`false`**. В **`useTreeLayout`** передаётся **`layoutData`** (полный ответ или усечённый).
- Панель в оверлее (если в ответе есть внешние): подпись «Внешние ветки скрыты/показаны» и **`md-icon-button`** с **`add`** / **`remove`** (Material Symbols), **`title`** / **`aria-label`**.

### Ноды

- **`PersonNode`**, **`DeadPersonNode`**, **`ExternalNode`** — **`cursor-pointer`**, **`title`** с подсказкой про клик и двойной клик.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Заметки

- Скрытие внешних — **клиентское** поверх ответа API (режим «ветка» с **`showExternal`** по-прежнему задаётся в **`TreeFilters`**).
- Поиск и **`fitView`** после этапа 33 работают по **`layoutData`** (при свёрнутых внешних в поиске участвуют только видимые ноды).

## Следующий этап

**35** — сервер: альбомы, фото, загрузка — `ROADMAP.md`, [log-stage-35.md](./log-stage-35.md).
