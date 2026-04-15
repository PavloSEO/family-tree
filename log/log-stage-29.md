# Этап 29 — клиент: `FamilyTree`, React Flow

**ROADMAP:** холст **React Flow** (`@xyflow/react`), базовый рендер нод и рёбер, **zoom**, **pan**, **MiniMap**, **Controls**.

## Сделано

### Зависимости

- **`packages/client/package.json`** — **`@xyflow/react`** (стили **`@xyflow/react/dist/style.css`** в компоненте дерева).

### API

- **`packages/client/src/api/tree.ts`** — **`fetchTree(personId, query?)`**, разбор ответа через **`treeResponseSchema`**.

### Компоненты

- **`packages/client/src/components/tree/tree-graph-build.ts`** — преобразование **`TreeResponse`** в ноды/рёбра React Flow: ранги по рёбрам **parent** + выравнивание **spouse**, простая сетка по слоям (`treeResponseToFlowElements`, fallback без ELK).
- **`packages/client/src/components/tree/layout-tree-flow.ts`** — реэкспорт из **`tree-graph-build.ts`** (совместимость импортов).
- **`packages/client/src/components/tree/FamilyTree.tsx`** — **`ReactFlow`**, **`Background`**, **`Controls`**, **`MiniMap`**, **`ReactFlowProvider`**, **`fitView`** после загрузки; кастомные типы нод/рёбер и оверлеи из последующих этапов (**`useTreeLayout`**, **`TreeControls`**, **`TreeFilters`**, сворачивание внешних веток) подключены в том же файле.

### Страницы и роутинг

- **`packages/client/src/pages/TreePage.tsx`** — **`/tree/:personId`**, загрузка дерева, query-параметры API (как в `docs/06-api.md`), ссылки на карточку и на **`/tree`**.
- **`packages/client/src/pages/TreeLandingPage.tsx`** — **`/tree`**, подсказка и ссылка на **`/admin/persons`** для admin.
- **`packages/client/src/App.tsx`** — маршруты **`tree`** и **`tree/:personId`** вместо заглушки.
- **`packages/client/src/pages/PersonPage.tsx`** — ссылка **«Визуализация дерева»** → **`/tree/:id`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**30** — кастомные ноды и рёбра дерева — `ROADMAP.md`, [log-stage-30.md](./log-stage-30.md).
