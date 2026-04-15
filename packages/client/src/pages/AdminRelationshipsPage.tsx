import type { ColumnDef } from "@tanstack/react-table";
import type { Person, Relationship } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { deleteRelationship, fetchRelationships } from "../api/relationships.js";
import { fetchPersonsList } from "../api/persons.js";
import { DataTable } from "../components/data-table/index.js";
import { MdButton, MdDialog } from "../components/md/index.js";
import { useAppLocale } from "../hooks/useAppLocale.js";

function formatIsoDate(
  value: string | null | undefined,
  empty: string,
): string {
  if (!value) {
    return empty;
  }
  const dayPart = value.includes("T") ? value.split("T")[0] : value.split(" ")[0];
  const [y, m, d] = (dayPart ?? value).split("-");
  if (!y || !m || !d) {
    return value;
  }
  return `${d}.${m}.${y}`;
}

function relTypeLabel(
  relType: Relationship["type"],
  tr: (key: string) => string,
): string {
  return relType === "parent"
    ? tr("relationships.typeParent")
    : tr("relationships.typeSpouse");
}

function spouseMarriageStatus(
  r: Relationship,
  tr: (key: string) => string,
  dash: string,
): string {
  if (r.type !== "spouse") {
    return dash;
  }
  if (r.divorceDate != null && String(r.divorceDate).trim() !== "") {
    return tr("relationships.marriageDivorced");
  }
  if (r.marriageDate != null && String(r.marriageDate).trim() !== "") {
    return tr("relationships.marriageMarried");
  }
  if (r.isCurrentSpouse === true) {
    return tr("relationships.marriageCurrent");
  }
  if (r.isCurrentSpouse === false) {
    return tr("relationships.marriageN_a");
  }
  return dash;
}

function personLabel(map: Map<string, Person>, id: string): string {
  const p = map.get(id);
  if (!p) {
    return id.length > 12 ? `${id.slice(0, 8)}…` : id;
  }
  return `${p.firstName} ${p.lastName}`;
}

function errorMessage(e: unknown, unknownLabel: string): string {
  if (e instanceof HTTPError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return unknownLabel;
}

async function loadAllPersonsIntoMap(): Promise<Map<string, Person>> {
  const map = new Map<string, Person>();
  let page = 1;
  const limit = 100;
  let total = Infinity;
  while (page === 1 || map.size < total) {
    const res = await fetchPersonsList({ page, limit });
    for (const p of res.data) {
      map.set(p.id, p);
    }
    total = res.total;
    if (res.data.length < limit) {
      break;
    }
    page += 1;
    if (page > 200) {
      break;
    }
  }
  return map;
}

function sortKeyFor(rel: Relationship, col: string): string {
  if (col === "type") {
    return rel.type === "parent" ? "0" : "1";
  }
  if (col === "marriageDate") {
    return rel.marriageDate ?? "";
  }
  if (col === "createdAt") {
    return rel.createdAt;
  }
  if (col === "fromPersonId") {
    return rel.fromPersonId;
  }
  if (col === "toPersonId") {
    return rel.toPersonId;
  }
  return rel.createdAt;
}

function compareRel(
  a: Relationship,
  b: Relationship,
  col: string,
  desc: boolean,
  collatorLocale: string,
): number {
  const va = sortKeyFor(a, col);
  const vb = sortKeyFor(b, col);
  const base = va.localeCompare(vb, collatorLocale, { sensitivity: "base" });
  return desc ? -base : base;
}

export function AdminRelationshipsPage() {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("common");
  const { collatorLocale } = useAppLocale();
  const dash = t("common.dash");
  const navigate = useNavigate();
  const [rawRows, setRawRows] = useState<Relationship[]>([]);
  const [personMap, setPersonMap] = useState<Map<string, Person>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sortColumnId, setSortColumnId] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<Relationship | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchDraft.trim().toLowerCase());
    }, 400);
    return () => {
      window.clearTimeout(t);
    };
  }, [searchDraft]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rels, pmap] = await Promise.all([
        fetchRelationships(),
        loadAllPersonsIntoMap(),
      ]);
      setRawRows(rels);
      setPersonMap(pmap);
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
      setRawRows([]);
      setPersonMap(new Map());
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search) {
      return rawRows;
    }
    return rawRows.filter((r) => {
      const hay = [
        relTypeLabel(r.type, t),
        r.fromPersonId,
        r.toPersonId,
        personLabel(personMap, r.fromPersonId),
        personLabel(personMap, r.toPersonId),
        r.marriageDate ?? "",
        spouseMarriageStatus(r, t, dash),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(search);
    });
  }, [rawRows, search, personMap, t, dash]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      compareRel(a, b, sortColumnId, sortOrder === "desc", collatorLocale),
    );
  }, [filtered, sortColumnId, sortOrder, collatorLocale]);

  const total = sorted.length;
  const pageRows = useMemo(() => {
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }, [sorted, page, limit]);

  const columns = useMemo<ColumnDef<Relationship>[]>(
    () => [
      {
        accessorKey: "type",
        header: t("relationships.colType"),
        cell: ({ getValue }) =>
          relTypeLabel(getValue() as Relationship["type"], t),
      },
      {
        accessorKey: "fromPersonId",
        header: t("relationships.colPersonA"),
        cell: ({ row }) => {
          const r = row.original;
          const label = personLabel(personMap, r.fromPersonId);
          return (
            <Link
              to={`/person/${r.fromPersonId}`}
              className="text-[var(--md-sys-color-primary)] no-underline hover:underline"
            >
              {label}
            </Link>
          );
        },
      },
      {
        accessorKey: "toPersonId",
        header: t("relationships.colPersonB"),
        cell: ({ row }) => {
          const r = row.original;
          const label = personLabel(personMap, r.toPersonId);
          return (
            <Link
              to={`/person/${r.toPersonId}`}
              className="text-[var(--md-sys-color-primary)] no-underline hover:underline"
            >
              {label}
            </Link>
          );
        },
      },
      {
        accessorKey: "marriageDate",
        header: t("relationships.colWeddingDate"),
        cell: ({ row }) => {
          const r = row.original;
          if (r.type !== "spouse") {
            return dash;
          }
          return formatIsoDate(r.marriageDate, dash);
        },
      },
      {
        id: "marriageStatus",
        header: t("relationships.colMarriageStatus"),
        enableSorting: false,
        cell: ({ row }) => spouseMarriageStatus(row.original, t, dash),
      },
      {
        id: "actions",
        header: t("relationships.colActions"),
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <md-icon-button
              title={t("relationships.deleteTitle")}
              aria-label={t("relationships.deleteTitle")}
              onClick={() => {
                setDelTarget(r);
                setDelOpen(true);
              }}
            >
              <md-icon className="material-symbols-outlined">delete</md-icon>
            </md-icon-button>
          );
        },
      },
    ],
    [personMap, t, dash],
  );

  async function confirmDelete() {
    if (!delTarget) {
      return;
    }
    setDelBusy(true);
    setError(null);
    try {
      await deleteRelationship(delTarget.id);
      setDelOpen(false);
      setDelTarget(null);
      await load();
      toast.success(t("toast.relationshipDeleted"));
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
    } finally {
      setDelBusy(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="md-typescale-headline-large m-0 mb-4">
        {t("relationships.title")}
      </h1>

      {error ? (
        <p
          className="md-typescale-body-medium mb-4"
          style={{ color: "var(--md-sys-color-error)" }}
        >
          {error}
        </p>
      ) : null}

      <DataTable<Relationship>
        columns={columns}
        data={pageRows}
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
        searchPlaceholder={t("relationships.searchPlaceholder")}
        emptyIcon="family_history"
        emptyText={t("relationships.emptyTitle")}
        emptyDescription={t("relationships.emptyDescription")}
      />

      <md-fab
        className="fixed bottom-8 right-8 z-20"
        label={t("relationships.fabCreate")}
        onClick={() => {
          navigate("/admin/relationships/new");
        }}
      >
        <md-icon slot="icon" className="material-symbols-outlined">add</md-icon>
      </md-fab>

      <MdDialog
        open={delOpen}
        onOpenChange={(open) => {
          setDelOpen(open);
          if (!open) {
            setDelTarget(null);
          }
        }}
      >
        <div className="flex max-w-sm flex-col gap-4 p-6">
          <h2 className="md-typescale-title-large m-0">
            {t("relationships.deleteConfirm")}
          </h2>
          <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {delTarget
              ? t("relationships.deleteBody", {
                  type: relTypeLabel(delTarget.type, t),
                  from: personLabel(personMap, delTarget.fromPersonId),
                  to: personLabel(personMap, delTarget.toPersonId),
                })
              : ""}
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
              onClick={() => {
                void confirmDelete();
              }}
            >
              {tc("delete")}
            </MdButton>
          </div>
        </div>
      </MdDialog>
    </div>
  );
}
