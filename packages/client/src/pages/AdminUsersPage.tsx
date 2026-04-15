import type { ColumnDef } from "@tanstack/react-table";
import type { Person, User, UserCreate, UserUpdate } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { fetchPersonsList } from "../api/persons.js";
import {
  createUser,
  deleteUser,
  fetchUsersList,
  updateUser,
} from "../api/users.js";
import { DataTable } from "../components/data-table/index.js";
import {
  MdButton,
  MdDialog,
  MdSelect,
  MdSelectOption,
  MdTextField,
} from "../components/md/index.js";
import { getFamilyNameSortLocale } from "../lib/app-locale.js";
import { useAppLocale } from "../hooks/useAppLocale.js";
import { useAuth } from "../hooks/useAuth.js";

function errorMessage(e: unknown, unknownLabel: string): string {
  if (e instanceof HTTPError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return unknownLabel;
}

function formatDateTime(value: string | null | undefined, empty: string): string {
  if (!value) {
    return empty;
  }
  const normalized = value.replace("T", " ");
  const [d, timePart] = normalized.split(" ");
  if (!d) {
    return value;
  }
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) {
    return value;
  }
  const time = timePart?.trim().slice(0, 5) ?? "";
  return time.length > 0 ? `${day}.${m}.${y} ${time}` : `${day}.${m}.${y}`;
}

function roleLabel(
  role: User["role"],
  adminLabel: string,
  viewerLabel: string,
): string {
  return role === "admin" ? adminLabel : viewerLabel;
}

function statusLabel(
  status: User["status"],
  activeLabel: string,
  disabledLabel: string,
): string {
  return status === "active" ? activeLabel : disabledLabel;
}

export function AdminUsersPage() {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("common");
  const { collatorLocale } = useAppLocale();
  const { user: authUser } = useAuth();
  const selfId = authUser?.id ?? "";
  const dash = t("common.dash");

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [sortColumnId, setSortColumnId] = useState("login");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [formLogin, setFormLogin] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<User["role"]>("viewer");
  const [formStatus, setFormStatus] = useState<User["status"]>("active");
  const [formPersonId, setFormPersonId] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<User | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, personsRes] = await Promise.all([
        fetchUsersList(),
        fetchPersonsList({ page: 1, limit: 500 }),
      ]);
      setAllUsers(list);
      setPersons(personsRes.data);
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchDraft.trim().toLowerCase());
    }, 300);
    return () => {
      window.clearTimeout(t);
    };
  }, [searchDraft]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const personName = useCallback(
    (personId: string | null) => {
      if (!personId) {
        return dash;
      }
      const p = persons.find((x) => x.id === personId);
      return p ? `${p.firstName} ${p.lastName}` : personId.slice(0, 8);
    },
    [persons, dash],
  );

  const hasOtherAdmin = useMemo(
    () => allUsers.some((u) => u.role === "admin"),
    [allUsers],
  );

  const filtered = useMemo(() => {
    if (!search) {
      return allUsers;
    }
    return allUsers.filter((u) => u.login.toLowerCase().includes(search));
  }, [allUsers, search]);

  const sorted = useMemo(() => {
    const dir = sortOrder === "asc" ? 1 : -1;
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortColumnId) {
        case "login":
          cmp = a.login.localeCompare(b.login, collatorLocale);
          break;
        case "role":
          cmp = a.role.localeCompare(b.role, collatorLocale);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status, collatorLocale);
          break;
        case "linkedPerson": {
          const na = personName(a.linkedPersonId);
          const nb = personName(b.linkedPersonId);
          cmp = na.localeCompare(nb, getFamilyNameSortLocale());
          break;
        }
        case "createdAt":
          cmp = String(a.createdAt).localeCompare(String(b.createdAt), collatorLocale);
          break;
        case "lastLoginAt": {
          const la = a.lastLoginAt ?? "";
          const lb = b.lastLoginAt ?? "";
          cmp = la.localeCompare(lb, collatorLocale);
          break;
        }
        default:
          cmp = a.login.localeCompare(b.login, collatorLocale);
      }
      return cmp * dir;
    });
    return copy;
  }, [filtered, sortColumnId, sortOrder, personName, collatorLocale]);

  const total = sorted.length;
  const rows = useMemo(() => {
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }, [sorted, page, limit]);

  const resetForm = useCallback(() => {
    setFormLogin("");
    setFormPassword("");
    setFormRole("viewer");
    setFormStatus("active");
    setFormPersonId("");
    setFormError(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    resetForm();
    setFormOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((u: User) => {
    setEditing(u);
    setFormLogin(u.login);
    setFormPassword("");
    setFormRole(u.role);
    setFormStatus(u.status);
    setFormPersonId(u.linkedPersonId ?? "");
    setFormError(null);
    setFormOpen(true);
  }, []);

  const submitForm = async () => {
    setFormError(null);
    const login = formLogin.trim();
    if (login.length === 0) {
      setFormError(t("users.formLoginRequired"));
      return;
    }
    if (!editing && formPassword.trim().length < 8) {
      setFormError(t("users.formPasswordMin"));
      return;
    }
    if (editing && formPassword.trim().length > 0 && formPassword.trim().length < 8) {
      setFormError(t("users.formPasswordMin"));
      return;
    }

    setFormBusy(true);
    try {
      if (editing) {
        const body: UserUpdate = {
          login,
          role: formRole,
          status: formStatus,
          linkedPersonId:
            formPersonId === "" ? null : (formPersonId as UserUpdate["linkedPersonId"]),
        };
        if (formPassword.trim().length > 0) {
          body.password = formPassword.trim();
        }
        await updateUser(editing.id, body);
        toast.success(t("toast.userUpdated"));
      } else {
        const body: UserCreate = {
          login,
          password: formPassword.trim(),
          role: formRole,
          status: formStatus,
          linkedPersonId:
            formPersonId === "" ? undefined : (formPersonId as UserCreate["linkedPersonId"]),
        };
        await createUser(body);
        toast.success(t("toast.userCreated"));
      }
      setFormOpen(false);
      setEditing(null);
      resetForm();
      await load();
    } catch (e) {
      setFormError(errorMessage(e, t("common.unknownError")));
    } finally {
      setFormBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) {
      return;
    }
    setDelBusy(true);
    setError(null);
    try {
      await deleteUser(delTarget.id);
      setDelOpen(false);
      setDelTarget(null);
      await load();
      toast.success(t("toast.userDeleted"));
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
    } finally {
      setDelBusy(false);
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: "login", header: t("users.colLogin") },
      {
        accessorKey: "role",
        header: t("users.colRole"),
        cell: ({ getValue }) =>
          roleLabel(
            getValue() as User["role"],
            t("users.roleAdmin"),
            t("users.roleViewer"),
          ),
      },
      {
        accessorKey: "status",
        header: t("users.colStatus"),
        cell: ({ getValue }) =>
          statusLabel(
            getValue() as User["status"],
            t("users.statusActive"),
            t("users.statusDisabled"),
          ),
      },
      {
        id: "linkedPerson",
        header: t("users.colPerson"),
        accessorFn: (u) => personName(u.linkedPersonId),
        cell: ({ row }) => {
          const id = row.original.linkedPersonId;
          if (!id) {
            return dash;
          }
          return (
            <Link
              to={`/person/${id}`}
              className="text-[var(--md-sys-color-primary)] no-underline hover:underline"
            >
              {personName(id)}
            </Link>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("users.colCreated"),
        cell: ({ getValue }) =>
          formatDateTime(getValue() as string | null | undefined, dash),
      },
      {
        accessorKey: "lastLoginAt",
        header: t("users.colLastLogin"),
        cell: ({ getValue }) =>
          formatDateTime(getValue() as string | null | undefined, dash),
      },
      {
        id: "actions",
        header: t("users.colActions"),
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = u.id === selfId;
          return (
            <div className="flex flex-wrap gap-1">
              <md-icon-button
                title={t("users.editTitle")}
                aria-label={t("users.editTitle")}
                onClick={() => {
                  openEdit(u);
                }}
              >
                <md-icon className="material-symbols-outlined">edit</md-icon>
              </md-icon-button>
              <md-icon-button
                title={isSelf ? t("users.cannotDeleteSelf") : t("users.deleteTitle")}
                aria-label={isSelf ? t("users.cannotDeleteSelf") : t("users.deleteTitle")}
                disabled={isSelf}
                onClick={() => {
                  if (!isSelf) {
                    setDelTarget(u);
                    setDelOpen(true);
                  }
                }}
              >
                <md-icon className="material-symbols-outlined">delete</md-icon>
              </md-icon-button>
            </div>
          );
        },
      },
    ],
    [personName, selfId, openEdit, t, dash],
  );

  const adminSelectDisabled =
    hasOtherAdmin && (editing === null || editing.role !== "admin");

  return (
    <div className="p-6">
      <h1 className="md-typescale-headline-large m-0 mb-4">{t("users.title")}</h1>

      {error ? (
        <p className="md-typescale-body-medium mb-4 text-[var(--md-sys-color-error)]">
          {error}
        </p>
      ) : null}

      <DataTable<User>
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
        searchPlaceholder={t("users.searchPlaceholder")}
        emptyIcon="manage_accounts"
        emptyText={t("users.emptyTitle")}
        emptyDescription={t("users.emptyDescription")}
      />

      <md-fab
        className="fixed bottom-8 right-8 z-20"
        label={t("users.fabCreate")}
        onClick={openCreate}
      >
        <md-icon slot="icon" className="material-symbols-outlined">
          add
        </md-icon>
      </md-fab>

      <MdDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
            resetForm();
          }
        }}
        className="min-w-[min(100vw-2rem,26rem)]"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 className="md-typescale-title-large m-0">
            {editing ? t("users.dialogEditTitle") : t("users.dialogCreateTitle")}
          </h2>
          <MdTextField
            label={t("users.labelLogin")}
            value={formLogin}
            onValueChange={setFormLogin}
            required
            disabled={formBusy}
          />
          <MdTextField
            label={editing ? t("users.labelPasswordNew") : t("users.labelPassword")}
            value={formPassword}
            onValueChange={setFormPassword}
            type="password"
            supportingText={
              editing ? t("users.hintPasswordKeep") : t("users.hintPasswordMin")
            }
            disabled={formBusy}
          />
          <MdSelect
            label={t("users.labelRole")}
            value={formRole}
            onValueChange={(v) => {
              setFormRole(v as User["role"]);
            }}
            disabled={formBusy}
          >
            <MdSelectOption value="viewer" headline={t("users.roleViewer")} />
            <MdSelectOption
              value="admin"
              headline={t("users.roleAdmin")}
              disabled={adminSelectDisabled}
            />
          </MdSelect>
          {adminSelectDisabled ? (
            <p className="md-typescale-body-small m-0 text-[var(--md-sys-color-on-surface-variant)]">
              {t("users.adminSecondDisabled")}
            </p>
          ) : null}
          <MdSelect
            label={t("users.labelStatus")}
            value={formStatus}
            onValueChange={(v) => {
              setFormStatus(v as User["status"]);
            }}
            disabled={formBusy}
          >
            <MdSelectOption value="active" headline={t("users.statusActive")} />
            <MdSelectOption value="disabled" headline={t("users.statusDisabled")} />
          </MdSelect>
          <MdSelect
            label={t("users.labelLinkedPerson")}
            value={formPersonId}
            onValueChange={setFormPersonId}
            disabled={formBusy}
          >
            <MdSelectOption value="" headline={t("users.optionNotLinked")} />
            {persons.map((p) => (
              <MdSelectOption
                key={p.id}
                value={p.id}
                headline={`${p.firstName} ${p.lastName}`}
              />
            ))}
          </MdSelect>
          {formError ? (
            <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-error)]">
              {formError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <MdButton
              variant="text"
              type="button"
              disabled={formBusy}
              onClick={() => {
                setFormOpen(false);
              }}
            >
              {tc("cancel")}
            </MdButton>
            <MdButton
              variant="filled"
              type="button"
              disabled={formBusy}
              onClick={() => {
                void submitForm();
              }}
            >
              {editing ? t("users.submitSave") : t("users.submitCreate")}
            </MdButton>
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
          <h2 className="md-typescale-title-large m-0">{t("users.deleteConfirm")}</h2>
          <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {delTarget ? t("users.deleteBody", { login: delTarget.login }) : ""}
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
