import type { ColumnDef } from "@tanstack/react-table";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Person } from "@family-tree/shared";
import {
  deletePerson,
  fetchPersonsList,
  importPersonsBulkJson,
} from "../api/persons.js";
import { personAvatarSrc } from "../lib/person-avatar-src.js";
import { genderToPlaceholderGender } from "../lib/person-placeholder.js";
import {
  personTableAvatarGenderBgClass,
  personTableAvatarLivingRingClass,
  personTableAvatarTintClass,
} from "../lib/person-table-avatar-style.js";
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
  const isDead = Boolean(
    person.dateOfDeath && String(person.dateOfDeath).trim().length > 0,
  );
  const avatarSrc = personAvatarSrc({
    mainPhoto: person.mainPhoto,
    gender: genderToPlaceholderGender(person.gender),
    dead: isDead,
    photoBroken: broken,
  });
  const ringClass = personTableAvatarLivingRingClass(person);
  const tintClass = personTableAvatarTintClass(person);
  const genderPadClass = personTableAvatarGenderBgClass(person.gender);
  return (
    <div className="person-table-avatar">
      <div className={`person-table-avatar__wrap ${ringClass}`}>
        <div className={`person-table-avatar__pad ${genderPadClass}`}>
          <img
            src={avatarSrc}
            alt=""
            className={`person-table-avatar__img ${tintClass}`}
            onError={() => {
              setBroken(true);
            }}
          />
        </div>
        <span
          aria-hidden
          className={`person-table-avatar__badge ${isDead ? "person-table-avatar__badge--dead" : "person-table-avatar__badge--living"}`}
        />
      </div>
    </div>
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

async function importApiErrorMessage(
  e: unknown,
  unknownLabel: string,
): Promise<string> {
  if (e instanceof HTTPError) {
    try {
      const body = (await e.response.json()) as { error?: string };
      if (body.error) {
        return body.error;
      }
    } catch {
      /* ignore */
    }
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
  const [importOpen, setImportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [importLocalError, setImportLocalError] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

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
        cell: ({ row }) => {
          const p = row.original;
          const dead =
            p.dateOfDeath != null &&
            p.dateOfDeath !== "" &&
            String(p.dateOfDeath).trim().length > 0;
          const label = statusLabel(
            p,
            t("persons.lifeStatusDead"),
            t("persons.lifeStatusAlive"),
          );
          return (
            <span
              className={`person-table-status ${dead ? "person-table-status--dead" : "person-table-status--living"}`}
            >
              {label}
            </span>
          );
        },
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
                aria-label={t("persons.editTitle")}
                onClick={() => {
                  navigate(`/admin/persons/${p.id}/edit`);
                }}
              >
                <md-icon className="material-symbols-outlined">edit</md-icon>
              </md-icon-button>
              <md-icon-button
                title={t("persons.deleteTitle")}
                aria-label={t("persons.deleteTitle")}
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
      toast.success(t("toast.personDeleted"));
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
    } finally {
      setDelBusy(false);
    }
  }

  async function submitJsonImport() {
    setImportLocalError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(importJsonText) as unknown;
    } catch {
      setImportLocalError(t("persons.importJsonParseError"));
      return;
    }
    setImportBusy(true);
    try {
      const n = await importPersonsBulkJson(parsed);
      setImportOpen(false);
      setImportJsonText("");
      await load();
      toast.success(t("toast.personsBulkImported", { count: n }));
    } catch (e) {
      setImportLocalError(
        await importApiErrorMessage(e, t("common.unknownError")),
      );
    } finally {
      setImportBusy(false);
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
        toolbarActions={
          <MdButton
            variant="outlined"
            type="button"
            className="min-w-fit shrink-0"
            onClick={() => {
              setImportLocalError(null);
              setImportOpen(true);
            }}
          >
            {t("persons.importJson")}
          </MdButton>
        }
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
        open={importOpen}
        quick
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) {
            setImportLocalError(null);
            setImportBusy(false);
          }
        }}
      >
        <div className="flex max-w-2xl flex-col gap-4 p-6">
          <h2 className="md-typescale-title-large m-0">
            {t("persons.importJsonTitle")}
          </h2>
          <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("persons.importJsonHint")}
          </p>
          <input
            ref={importFileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-hidden
            onChange={(ev) => {
              const f = ev.target.files?.[0];
              ev.target.value = "";
              if (!f) {
                return;
              }
              void f.text().then(setImportJsonText).catch(() => {
                setImportLocalError(t("persons.importJsonParseError"));
              });
            }}
          />
          <MdTextField
            label={t("persons.importJsonFieldLabel")}
            type="textarea"
            rows={12}
            value={importJsonText}
            onValueChange={setImportJsonText}
            placeholder={t("persons.importJsonPlaceholder")}
            className="w-full font-mono text-sm"
            disabled={importBusy}
          />
          {importLocalError ? (
            <p
              className="md-typescale-body-medium m-0"
              style={{ color: "var(--md-sys-color-error)" }}
            >
              {importLocalError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <MdButton
              variant="text"
              type="button"
              disabled={importBusy}
              onClick={() => {
                importFileRef.current?.click();
              }}
            >
              {t("persons.importJsonChooseFile")}
            </MdButton>
            <div className="flex gap-2">
              <MdButton
                variant="text"
                type="button"
                disabled={importBusy}
                onClick={() => {
                  setImportOpen(false);
                }}
              >
                {tc("cancel")}
              </MdButton>
              <MdButton
                variant="filled"
                type="button"
                disabled={importBusy}
                onClick={() => {
                  void submitJsonImport();
                }}
              >
                {t("persons.importJsonSubmit")}
              </MdButton>
            </div>
          </div>
        </div>
      </MdDialog>

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
