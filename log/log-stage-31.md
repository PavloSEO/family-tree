# Этап 31 — клиент: `useTreeLayout`, ELK

**ROADMAP:** хук **`useTreeLayout`**, раскладка **ELK**: layered, **DOWN**, группировка пар супругов (compound), интервалы между поколениями по `docs/08-tree-visualization.md`.

## Сделано

### Зависимости

- **`packages/client/package.json`** — **`elkjs`**; импорт **`elkjs/lib/elk.bundled.js`** (без отдельного worker).

### Раскладка

- **`packages/client/src/components/tree/tree-graph-build.ts`** — общая сборка **`Node`/`Edge`**: типы нод/рёбер, **`simpleRankPositionMap`** (fallback-сетка), **`buildTreeNodes`**, **`buildTreeEdges`**, **`treeResponseToFlowElements`**.
- **`packages/client/src/components/tree/elk-tree-layout.ts`** — **`runElkPersonLayout`**: union-find по рёбрам **spouse**, compound-ноды **`compound__…`** с **`elk.algorithm: box`**, **`elk.direction: RIGHT`**, корневой граф **layered** / **DOWN** и опции из ТЗ; в ELK передаются только рёбра **parent**; обход результата → абсолютные **`x,y`** персон.
- **`packages/client/src/components/tree/useTreeLayout.ts`** — хук: асинхронный ELK, при ошибке или пустом результате — **fallback** на **`treeResponseToFlowElements`**; поле **`layoutError`** (пока без UI).
- **`packages/client/src/components/tree/layout-tree-flow.ts`** — реэкспорт для старых импортов.

### Интеграция

- **`packages/client/src/components/tree/FamilyTree.tsx`** — данные из **`useTreeLayout`**, синхронизация в **`useNodesState`/`useEdgesState`**, **`fitView`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Заметки

- Сборка клиента подтянула крупный **bundled** ELK (~2.6 MB JS); при необходимости позже можно вынести в **dynamic import** и отдельный chunk.

## Следующий этап

**32** — **`TreeControls`** (режимы, глубина, «Сбросить вид») — `ROADMAP.md`, [log-stage-32.md](./log-stage-32.md).
