# Этап 16 — клиент: `DataTable` (TanStack Table + M3)

**ROADMAP:** «`DataTable` — кастомный компонент на TanStack Table, стилизованный под M3 (`docs/16-custom-components.md`). Поддержка: сортировка, фильтры, пагинация, пустое состояние».

## Сделано

### Зависимость

- **`@tanstack/react-table@8.21.3`** в **`packages/client`**.

### Компонент

- **`packages/client/src/components/data-table/DataTable.tsx`** + **`DataTable.css`** + **`index.ts`**.
- **TanStack Table 8:** `useReactTable`, **`manualPagination`**, **`manualSorting`**, **`getCoreRowModel`**, `flexRender`.
- **Пропсы (расширение ТЗ):** опционально **`sortColumnId` / `sortOrder`** (контролируемая сортировка), **`globalFilter` / `onGlobalFilterChange`** + **`MdTextField`** «Поиск», слоты **`filters`**, **`toolbarActions`**, **`emptyDescription`**, **`searchPlaceholder`**.
- **Сортировка:** клик по заголовку с `getCanSort()` — иконки Material Symbols (`swap_vert` / `arrow_upward` / `arrow_downward`); **`enableSortingRemoval: false`**, чтобы при `manualSorting` не было третьего клика с пустым sorting без вызова `onSort`.
- **Пагинация:** страница с **1** (как в доке), навигация first / prev / next / last, **`md-icon-button`**.
- **Пустое состояние:** иконка + заголовок + описание при **`!isLoading && data.length === 0`**.
- **Загрузка:** полупрозрачный оверлей + **`md-linear-progress`** indeterminate.

### Стили

- Таблица и панель пагинации по токенам из **`docs/16-custom-components.md`** (`surface-container`, `outline-variant`, типографика заголовков ячеек).

### Демо

- Демо-страница списка на этапе 16 заменена на **`AdminPersonsPage`** с реальным API (этап **19**, см. [log-stage-19.md](./log-stage-19.md)).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**17** — сервер: **`person.service.ts`** (CRUD persons, поиск, фильтры, пагинация) — `ROADMAP.md`, [log-stage-17.md](./log-stage-17.md).
