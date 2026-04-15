import type { ColumnDef } from "@tanstack/react-table";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Person } from "@family-tree/shared";
import { deletePerson, fetchPersonsList } from "../api/persons.js";
import { mainPhotoSrc } from "../lib/person-main-photo-src.js";
import { DataTable } from "../components/data-table/index.js";
import {
  MdButton,
  MdDialog,
  MdSelect,
  MdSelectOption,
  MdTextField,
} from "../components/md/index.js";

function formatIsoDate(
  value: string | null | undefined,
  empty: string,
): string {
  if (!value) {
    return empty;
  }
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) {
    return value;
  }
  return `${d}.${m}.${y}`;
}

function genderLabel(
  g: Person["gender"],
  maleShort: string,
  femaleShort: string,
): string {
  return g === "male" ? maleShort : femaleShort;
}

function statusLabel(
  p: Person,
  deadLabel: string,
  aliveLabel: string,
): string {
  const dead =
    p.dateOfDeath != null &&
    p.dateOfDeath !== "" &&
    String(p.dateOfDeath).trim().length > 0;
  return dead ? deadLabel : aliveLabel;
}

function PhotoCell({ person }: { person: Person }) {
  const [broken, setBroken] = useState(false);
  const src = mainPhotoSrc(person.mainPhoto);
  if (!src || broken) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--md-sys-color-surface-container)]">
        <md-icon className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)]">
          person
        </md-icon>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="h-10 w-10 rounded-sm object-cover"
      onError={() => {
        setBroken(true);
      }}
    />
  );
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

export function AdminPersonsPage() {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("common");
  const navigate = useNavigate();
  const [rows, setRows] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [countryDraft, setCountryDraft] = useState("");
  const [aliveFilter, setAliveFilter] = useState<"all" | "alive" | "dead">(
    "all",
  );
  const [sortColumnId, setSortColumnId] = useState("lastName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<Person | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchDraft.trim());
    }, 400);
    return () => {
      window.clearTimeout(t);
    };
  }, [searchDraft]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const countryParam =
    countryDraft.trim().length === 2
      ? countryDraft.trim().toUpperCase()
      : undefined;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPersonsList({
        search: search || undefined,
        country: countryParam,
        alive:
          aliveFilter === "all"
            ? undefined
            : aliveFilter === "alive"
              ? true
              : false,
        page,
        limit,
        sort: sortColumnId,
        order: sortOrder,
      });
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    countryParam,
    aliveFilter,
    page,
    limit,
    sortColumnId,
    sortOrder,
    t,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const dash = t("common.dash");

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: "mainPhoto",
        header: t("persons.colPhoto"),
        enableSorting: false,
        cell: ({ row }) => <PhotoCell person={row.original} />,
      },
      { accessorKey: "firstName", header: t("persons.colFirstName") },
      { accessorKey: "lastName", header: t("persons.colLastName") },
      {
        accessorKey: "gender",
        header: t("persons.colGender"),
        cell: ({ getValue }) =>
          genderLabel(
            getValue() as Person["gender"],
            t("persons.genderMaleShort"),
            t("persons.genderFemaleShort"),
          ),
      },
      {
        accessorKey: "dateOfBirth",
        header: t("persons.colBirthDate"),
        cell: ({ getValue }) =>
          formatIsoDate(getValue() as string | null | undefined, dash),
      },
      {
        accessorKey: "country",
        header: t("persons.colCountry"),
        cell: ({ getValue }) => {
          const c = getValue() as string | null | undefined;
          return c ?? dash;
        },
      },
      {
        id: "status",
        header: t("persons.colStatus"),
        enableSorting: false,
        cell: ({ row }) =>
          statusLabel(
            row.original,
            t("persons.lifeStatusDead"),
            t("persons.lifeStatusAlive"),
          ),
      },
      {
        id: "actions",
        header: t("persons.colActions"),
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex flex-wrap gap-1">
              <md-icon-button
                title={t("persons.editTitle")}
                onClick={() => {
                  navigate(`/admin/persons/${p.id}/edit`);
                }}
              >
                <md-icon className="material-symbols-outlined">edit</md-icon>
              </md-icon-button>
              <md-icon-button
                title={t("persons.deleteTitle")}
                onClick={() => {
                  setDelTarget(p);
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
    [navigate, t, dash],
  );

  async function confirmDelete() {
    if (!delTarget) {
      return;
    }
    setDelBusy(true);
    setError(null);
    try {
      await deletePerson(delTarget.id);
      setDelOpen(false);
      setDelTarget(null);
      await load();
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
    } finally {
      setDelBusy(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="md-typescale-headline-large m-0 mb-4">{t("persons.title")}</h1>

      {error ? (
        <p
          className="md-typescale-body-medium mb-4"
          style={{ color: "var(--md-sys-color-error)" }}
        >
          {error}
        </p>
      ) : null}

      <DataTable<Person>
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
        onGlobalFilterChange={(v) => {
          setSearchDraft(v);
        }}
        searchPlaceholder={t("persons.searchPlaceholder")}
        emptyIcon="badge"
        emptyText={t("persons.emptyTitle")}
        emptyDescription={t("persons.emptyDescription")}
        filters={
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-28">
              <MdTextField
                label={t("persons.countryLabel")}
                value={countryDraft}
                onValueChange={(v) => {
                  setCountryDraft(v.toUpperCase().slice(0, 2));
                  setPage(1);
                }}
                placeholder="RU"
              />
            </div>
            <div className="min-w-[11rem]">
              <MdSelect
                label={t("persons.statusLabel")}
                value={aliveFilter}
                onValueChange={(v) => {
                  setAliveFilter(v as "all" | "alive" | "dead");
                  setPage(1);
                }}
              >
                <MdSelectOption value="all" headline={t("persons.statusAll")} />
                <MdSelectOption value="alive" headline={t("persons.statusAlive")} />
                <MdSelectOption value="dead" headline={t("persons.statusDead")} />
              </MdSelect>
            </div>
          </div>
        }
      />

      <md-fab
        className="fixed bottom-8 right-8 z-20"
        label={t("persons.fabCreate")}
        onClick={() => {
          navigate("/admin/persons/new");
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
          <h2 className="md-typescale-title-large m-0">{t("persons.deleteConfirm")}</h2>
          <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {delTarget
              ? t("persons.deleteBody", {
                  name: `${delTarget.firstName} ${delTarget.lastName}`,
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
