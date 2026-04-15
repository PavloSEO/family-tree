import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { MdButton, MdTextField } from "../md/index.js";
import "./DataTable.css";

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  total: number;
  /** Нумерация с 1 (как в `docs/16-custom-components.md`). */
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSort: (columnId: string, order: "asc" | "desc") => void;
  sortColumnId?: string;
  sortOrder?: "asc" | "desc";
  isLoading?: boolean;
  emptyIcon: string;
  emptyText: string;
  emptyDescription?: string;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  toolbarActions?: ReactNode;
};

export function DataTable<TData>({
  columns,
  data,
  total,
  page,
  limit,
  onPageChange,
  onSort,
  sortColumnId,
  sortOrder,
  isLoading = false,
  emptyIcon,
  emptyText,
  emptyDescription,
  globalFilter = "",
  onGlobalFilterChange,
  searchPlaceholder = "Поиск…",
  filters,
  toolbarActions,
}: DataTableProps<TData>) {
  const sorting: SortingState = useMemo(() => {
    if (!sortColumnId || !sortOrder) {
      return [];
    }
    return [{ id: sortColumnId, desc: sortOrder === "desc" }];
  }, [sortColumnId, sortOrder]);

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: Math.max(0, page - 1),
      pageSize: limit,
    }),
    [page, limit],
  );

  const pageCount = Math.max(1, Math.ceil(total / limit) || 1);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    manualPagination: true,
    manualSorting: true,
    /** Сервер всегда получает колонку + порядок; без «третьего клика» с пустым sorting. */
    enableSortingRemoval: false,
    pageCount,
    rowCount: total,
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting);
      const first = next[0];
      if (!first) {
        return;
      }
      onSort(first.id, first.desc ? "desc" : "asc");
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const showToolbar = Boolean(
    onGlobalFilterChange || filters || toolbarActions,
  );
  const isEmpty = !isLoading && data.length === 0;
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="data-table-layout relative">
      {isLoading ? (
        <div className="data-table-loading-overlay" aria-busy="true">
          <md-linear-progress indeterminate />
        </div>
      ) : null}

      {showToolbar ? (
        <div className="data-table-toolbar">
          {onGlobalFilterChange ? (
            <div className="data-table-toolbar__grow">
              <MdTextField
                label="Поиск"
                value={globalFilter}
                onValueChange={onGlobalFilterChange}
                placeholder={searchPlaceholder}
              />
            </div>
          ) : null}
          {filters}
          {toolbarActions ? (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {toolbarActions}
            </div>
          ) : null}
        </div>
      ) : null}

      {isEmpty ? (
        <div className="data-table-empty">
          <md-icon className="material-symbols-outlined data-table-empty__icon">
            {emptyIcon}
          </md-icon>
          <span className="md-typescale-title-medium">{emptyText}</span>
          {emptyDescription ? (
            <span className="md-typescale-body-medium data-table-empty__description max-w-md">
              {emptyDescription}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <MdButton
                          variant="text"
                          type="button"
                          className="data-table-sort-btn"
                          trailingIcon
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={isLoading}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <md-icon className="material-symbols-outlined text-base" slot="icon">
                            {header.column.getIsSorted() === "desc"
                              ? "arrow_downward"
                              : header.column.getIsSorted() === "asc"
                                ? "arrow_upward"
                                : "swap_vert"}
                          </md-icon>
                        </MdButton>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isEmpty ? (
        <div className="data-table-pagination md-typescale-body-small">
          <div className="data-table-pagination__nav">
            <md-icon-button
              disabled={!canPrev || isLoading}
              onClick={() => {
                onPageChange(1);
              }}
            >
              <md-icon className="material-symbols-outlined">first_page</md-icon>
            </md-icon-button>
            <md-icon-button
              disabled={!canPrev || isLoading}
              onClick={() => {
                onPageChange(page - 1);
              }}
            >
              <md-icon className="material-symbols-outlined">chevron_left</md-icon>
            </md-icon-button>
            <span className="px-2">
              Страница {page} из {pageCount}
            </span>
            <md-icon-button
              disabled={!canNext || isLoading}
              onClick={() => {
                onPageChange(page + 1);
              }}
            >
              <md-icon className="material-symbols-outlined">chevron_right</md-icon>
            </md-icon-button>
            <md-icon-button
              disabled={!canNext || isLoading}
              onClick={() => {
                onPageChange(pageCount);
              }}
            >
              <md-icon className="material-symbols-outlined">last_page</md-icon>
            </md-icon-button>
          </div>
          <span>Всего: {total}</span>
        </div>
      ) : null}
    </div>
  );
}
