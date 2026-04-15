# Этап 27 — shared: `tree-compute.ts`, родственники на карточке

**ROADMAP:** BFS по неориентированному графу связей (`parent` + `spouse`), **`findShortestPath`**, **`getRelationshipLabel`** (русские названия по цепочке шагов), тесты; использование на сервере и клиенте; блок **«Родственники»** в **`PersonPage`**.

## Сделано

### Пакет `shared`

- **`packages/shared/src/tree-compute.ts`** — **`buildUndirectedAdjacency`**, **`findShortestPath`**, **`pathToKinshipSteps`**, **`kinshipStepsToLabel`**, **`getRelationshipLabel`**, **`collectConnectedPersonIds`**; экспорт из **`index.ts`**.
- **`packages/shared/src/tree-compute.test.ts`** — Vitest: путь к родителю/деду, супруг, шаги, подписи.
- **`packages/shared/package.json`** — скрипт **`test`** (**`vitest run`**), devDependency **`vitest`**.

### Сервер

- **`packages/server/src/services/person-relatives.service.ts`** — **`listRelativesForPerson`**: компонента связности, кратчайший путь, подпись через shared.
- **`packages/server/src/routes/persons.ts`** — **`GET /api/persons/:id/relatives`** (маршрут **выше** **`GET /api/persons/:id`**), **`requireAuth`**.

### Клиент

- **`packages/client/src/api/persons.ts`** — **`fetchPersonRelatives`**, тип **`PersonRelative`** (Zod).
- **`packages/client/src/pages/PersonPage.tsx`** — секция **«Родственники»** (**`md-elevated-card`**, **`SectionCard`**): загрузка, пустое состояние, список со ссылками **`/person/:id`** и подписью родства.

## Проверки

```bash
npx pnpm@9.15.4 install
npx pnpm@9.15.4 --filter @family-tree/shared run test
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
```

## Следующий этап

**28** — сервер: **`tree.service.ts`**, **`GET /api/tree/:personId`** — `ROADMAP.md`, [log-stage-28.md](./log-stage-28.md).
