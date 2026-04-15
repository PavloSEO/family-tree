# Этап 32 — клиент: `TreeControls`

**ROADMAP:** панель управления деревом: режимы просмотра (**`md-outlined-segmented-button-set`**, labs), ползунок глубины (**`md-slider`**), кнопка **«Сбросить вид»** (сброс только viewport в React Flow).

## Сделано

### Компонент

- **`packages/client/src/components/tree/TreeControls.tsx`** — чтение/запись query (`mode`, `depthUp`, `depthDown`) через **`useSearchParams`** (`replace: true` при изменениях); режимы из **`treeViewModeSchema`**; для режима **`full`** параметр `mode` из URL убирается (дефолт сервера); один слайдер **«Глубина (вверх и вниз)»** задаёт оба параметра одинаковым значением (отображаемое значение — **`max(depthUp, depthDown)`**, если в URL были разные глубины); **`fitView`** через **`useReactFlow`**; кнопка сброса вида через **`MdButton`** (outlined).
- Событие выбора сегмента: **`segmented-button-set-selection`** на контейнере набора.

### Интеграция

- **`packages/client/src/components/tree/FamilyTree.tsx`** — оверлей поверх canvas: **`pointer-events-none`** на обёртке, **`pointer-events-auto`** на панели, чтобы не блокировать перетаскивание графа.

### Типы

- **`packages/client/src/types/material-web.d.ts`** — свойства **`label`**, **`selected`**, **`noCheckmark`** для **`md-outlined-segmented-button`**; **`multiselect`** для набора.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Заметки

- В ROADMAP указан обобщённый **`md-segmented-button-set`**; в проекте используется outlined-вариант из **`@material/web/labs/...`** — **`md-outlined-segmented-button-set`**, уже подключённый в **`material-imports.ts`**.
- У сегментов включён **`noCheckmark`**, чтобы компактнее поместить семь подписей; на узких экранах блок режимов с **`overflow-x-auto`**.

## Следующий этап

**33** — **`TreeFilters`** (`md-outlined-select`, поиск по имени) — `ROADMAP.md`, [log-stage-33.md](./log-stage-33.md).
