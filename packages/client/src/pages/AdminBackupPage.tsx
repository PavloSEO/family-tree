import type { ColumnDef } from "@tanstack/react-table";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  createBackup,
  deleteBackup,
  downloadBackupFile,
  fetchBackupsList,
  type BackupListItem,
} from "../api/backup.js";
import { DataTable } from "../components/data-table/index.js";
import { MdButton, MdDialog } from "../components/md/index.js";
import { useAppLocale } from "../hooks/useAppLocale.js";

function errorMessage(e: unknown, unknownLabel: string): string {
  if (e instanceof HTTPError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return unknownLabel;
}

async function httpErrorDetail(
  e: unknown,
  unknownLabel: string,
): Promise<string> {
  if (e instanceof HTTPError) {
    try {
      const body = (await e.response.clone().json()) as { error?: string };
      if (body.error && body.error.trim().length > 0) {
        return body.error;
      }
    } catch {
      /* не JSON */
    }
  }
  return errorMessage(e, unknownLabel);
}

function formatBytes(
  n: number,
  tr: (key: string, opts?: { n: string }) => string,
): string {
  if (n < 1024) {
    return tr("bytesB", { n: String(n) });
  }
  if (n < 1024 * 1024) {
    return tr("bytesKB", { n: (n / 1024).toFixed(1) });
  }
  return tr("bytesMB", { n: (n / (1024 * 1024)).toFixed(1) });
}

function formatDateTime(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminBackupPage() {
  const { t } = useTranslation("backup");
  const { t: tc } = useTranslation("common");
  const { dateLocale, collatorLocale } = useAppLocale();

  const [allRows, setAllRows] = useState<BackupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [sortColumnId, setSortColumnId] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<BackupListItem | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchBackupsList();
      setAllRows(list);
    } catch (e) {
      setError(await httpErrorDetail(e, t("common.unknownError")));
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchDraft.trim().toLowerCase());
    }, 300);
    return () => {
      window.clearTimeout(handle);
    };
  }, [searchDraft]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    if (search === "") {
      return allRows;
    }
    return allRows.filter((r) => r.filename.toLowerCase().includes(search));
  }, [allRows, search]);

  const sorted = useMemo(() => {
    const mult = sortOrder === "desc" ? -1 : 1;
    const col = sortColumnId;
    return [...filtered].sort((a, b) => {
      if (col === "sizeBytes") {
        return (a.sizeBytes - b.sizeBytes) * mult;
      }
      if (col === "filename") {
        return a.filename.localeCompare(b.filename, collatorLocale) * mult;
      }
      return (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0) * mult;
    });
  }, [filtered, sortColumnId, sortOrder, collatorLocale]);

  const total = sorted.length;
  const rows = useMemo(() => {
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }, [sorted, page, limit]);

  const onCreate = async () => {
    setCreateError(null);
    setCreating(true);
    try {
      await createBackup();
      await load();
      toast.success(t("toastCreated"));
    } catch (e) {
      setCreateError(await httpErrorDetail(e, t("common.unknownError")));
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) {
      return;
    }
    setDelBusy(true);
    setError(null);
    try {
      await deleteBackup(delTarget.filename);
      setDelOpen(false);
      setDelTarget(null);
      await load();
      toast.success(t("toastDeleted"));
    } catch (e) {
      setError(await httpErrorDetail(e, t("common.unknownError")));
    } finally {
      setDelBusy(false);
    }
  };

  const columns = useMemo<ColumnDef<BackupListItem>[]>(
    () => [
      {
        accessorKey: "filename",
        header: t("colFile"),
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "sizeBytes",
        header: t("colSize"),
        cell: ({ getValue }) => formatBytes(getValue() as number, t),
      },
      {
        accessorKey: "createdAt",
        header: t("colCreated"),
        cell: ({ getValue }) =>
          formatDateTime(getValue() as string, dateLocale),
      },
      {
        id: "actions",
        header: t("colActions"),
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-wrap gap-1">
              <md-icon-button
                title={t("downloadTitle")}
                aria-label={t("downloadTitle")}
                onClick={() => {
                  void downloadBackupFile(r.filename).catch(async (e) => {
                    setError(await httpErrorDetail(e, t("common.unknownError")));
                  });
                }}
              >
                <md-icon className="material-symbols-outlined">download</md-icon>
              </md-icon-button>
              <md-icon-button
                title={t("deleteTitle")}
                aria-label={t("deleteTitle")}
                onClick={() => {
                  setDelTarget(r);
                  setDelOpen(true);
                }}
              >
                <md-icon className="material-symbols-outlined">delete</md-icon>
              </md-icon-button>
            </div>
          );
        },
      },
    ],
    [t, dateLocale],
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
          {t("title")}
        </h1>
        <p className="md-typescale-body-medium m-0 mt-1 text-[var(--md-sys-color-on-surface-variant)]">
          {t("subtitleBefore")}{" "}
          <code className="rounded bg-[var(--md-sys-color-surface-container-high)] px-1 text-sm">
            docs/11-deployment.md
          </code>
          {t("subtitleAfter")}
        </p>
      </div>

      {creating ? (
        <div className="flex flex-col gap-2">
          <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("creating")}
          </p>
          <md-linear-progress indeterminate />
        </div>
      ) : null}

      {createError ? (
        <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-error)]">
          {createError}
        </p>
      ) : null}

      {error ? (
        <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-error)]">{error}</p>
      ) : null}

      <DataTable<BackupListItem>
        columns={columns}
        data={rows}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onSort={(col, order) => {
          setSortColumnId(col);
          setSortOrder(order);
          setPage(1);
        }}
        sortColumnId={sortColumnId}
        sortOrder={sortOrder}
        isLoading={loading}
        globalFilter={searchDraft}
        onGlobalFilterChange={setSearchDraft}
        searchPlaceholder={t("searchPlaceholder")}
        emptyIcon="backup"
        emptyText={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />

      <md-fab
        className={`fixed bottom-8 right-8 z-20${creating ? " pointer-events-none opacity-50" : ""}`}
        label={t("fabCreate")}
        onClick={() => {
          if (!creating) {
            void onCreate();
          }
        }}
      >
        <md-icon slot="icon" className="material-symbols-outlined">
          add
        </md-icon>
      </md-fab>

      <MdDialog
        open={delOpen}
        onOpenChange={(open) => {
          setDelOpen(open);
          if (!open) {
            setDelTarget(null);
          }
        }}
        className="min-w-[min(100vw-2rem,24rem)]"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 className="md-typescale-title-large m-0">{t("deleteConfirm")}</h2>
          <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {delTarget?.filename ?? ""}
          </p>
          <div className="flex justify-end gap-2">
            <MdButton
              variant="text"
              type="button"
              disabled={delBusy}
              onClick={() => {
                setDelOpen(false);
                setDelTarget(null);
              }}
            >
              {tc("cancel")}
            </MdButton>
            <MdButton
              variant="filled"
              type="button"
              disabled={delBusy}
              onClick={() => void confirmDelete()}
            >
              {tc("delete")}
            </MdButton>
          </div>
        </div>
      </MdDialog>
    </div>
  );
}
