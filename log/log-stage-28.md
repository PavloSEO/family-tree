# Этап 28 — сервер: `tree.service.ts`, `GET /api/tree/:personId`

**ROADMAP:** построение подграфа от корня с учётом **mode**, **depth**, фильтров; ответ **`{ nodes[], edges[], rootId }`** (как в `docs/06-api.md`).

## Сделано

### Shared (контракт API)

- **`packages/shared/src/validation/tree.ts`** — **`treeQuerySchema`** (`mode`, `depthUp` / `depthDown`, `showExternal`, `externalDepth`, `country`, `aliveOnly`), **`treeNodeSchema`**, **`treeEdgeSchema`**, **`treeResponseSchema`**.
- **`packages/shared/src/types/tree.ts`** — реэкспорт типов и схем.
- **`packages/shared/src/tree-query.test.ts`** — парсинг query по умолчанию и с параметрами.

### Сервер

- **`packages/server/src/services/tree.service.ts`** — **`getTreeSubgraph`**: загрузка связей и персон, режимы **`full`**, **`ancestors`**, **`descendants`**, **`direct`** (прямая линия вверх: отец приоритетно), **`family`**, **`paternal`**, **`maternal`**; замыкание по супругам (кроме **`direct`**); фильтры **`country`** / **`aliveOnly`** по ядру; опционально **`showExternal`** + предки супругов вне ядра до **`externalDepth`**; **`TreeRootNotFoundError`** / **`TreeRootFilteredOutError`**.
- **`packages/server/src/routes/tree.ts`** — **`GET /api/tree/:personId`**, **`requireAuth`**, ответ **`{ data: { nodes, edges, rootId } }`**.
- **`packages/server/src/index.ts`** — монтирование **`/api/tree`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run test
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Следующий этап

**29** — клиент: **`FamilyTree`** (React Flow, базовый рендер) — `ROADMAP.md`, [log-stage-29.md](./log-stage-29.md).
