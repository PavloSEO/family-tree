# Этап 30 — клиент: кастомные ноды и рёбра дерева

**ROADMAP:** **`PersonNode`** (фото, имя, годы, флаг), **`DeadPersonNode`** (ч/б фото, рамка outline), **`ExternalNode`** (пунктир, фон surface-container-low); рёбра **`SpouseEdge`** (двойная линия), **`ParentTreeEdge`** (сплошная 2px), **`ExternalTreeEdge`** (пунктир).

## Сделано

### Ноды (`docs/08-tree-visualization.md`)

- **`packages/client/src/components/tree/tree-node-data.ts`** — тип **`TreePersonNodeData`**.
- **`packages/client/src/components/tree/tree-node-helpers.ts`** — **`formatYearsLabel`**, **`countryFlagEmoji`**.
- **`packages/client/src/components/tree/nodes/PersonNode.tsx`** — аватар 48px, имя/фамилия, годы, эмодзи-флаг (как в `docs/08-tree-visualization.md`), рамка outline-variant, корень — primary + тень elevation-2 через **`treeRootNodeBoxShadow`** в **`tree-node-helpers.ts`**, плейсхолдер фото — **`md-icon`**.
- **`packages/client/src/components/tree/nodes/DeadPersonNode.tsx`** — **`grayscale`** на фото, рамка **`outline`**.
- **`packages/client/src/components/tree/nodes/ExternalNode.tsx`** — пунктирная рамка, фон **`surface-container-low`**, подпись «внешняя ветка».

### Рёбра

- **`packages/client/src/components/tree/edges/ParentTreeEdge.tsx`** — **`getSmoothStepPath`** + **`BaseEdge`**, stroke outline, 2px.
- **`packages/client/src/components/tree/edges/SpouseEdge.tsx`** — две смещённые копии пути, primary.
- **`packages/client/src/components/tree/edges/ExternalTreeEdge.tsx`** — пунктир **`6 4`**, outline-variant.

### Раскладка и холст

- **`packages/client/src/components/tree/tree-graph-build.ts`** — типы нод **`person` / `deadPerson` / `external`**, типы рёбер **`parentTree` / `spouse` / `externalTree`**, **`width`/`height`**, handles **`pt`/`pb`/`sl`/`sr`** для parent и spouse; **`layout-tree-flow.ts`** — реэкспорт из **`tree-graph-build.ts`**.
- **`packages/client/src/components/tree/FamilyTree.tsx`** — **`nodeTypes`**, **`edgeTypes`**, цвет нод в **`MiniMap`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**31** — **`useTreeLayout`**, ELK — `ROADMAP.md`, [log-stage-31.md](./log-stage-31.md).
