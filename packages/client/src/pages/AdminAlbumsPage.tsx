import type { AlbumCreate, AlbumListItem, Person } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createAlbum, fetchAlbumsList } from "../api/albums.js";
import { fetchPersonsList } from "../api/persons.js";
import { albumCoverSrc } from "../lib/album-cover-src.js";
import {
  MdButton,
  MdDialog,
  MdSelect,
  MdSelectOption,
  MdTextField,
} from "../components/md/index.js";

function errorMessage(e: unknown, unknownLabel: string): string {
  if (e instanceof HTTPError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return unknownLabel;
}

function CoverImage({ rel }: { rel: string | null }) {
  const [broken, setBroken] = useState(false);
  const src = albumCoverSrc(rel);
  if (!src || broken) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-[var(--md-sys-color-surface-container-high)]">
        <md-icon className="material-symbols-outlined text-5xl text-[var(--md-sys-color-on-surface-variant)]">
          collections
        </md-icon>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="aspect-video w-full object-cover"
      onError={() => {
        setBroken(true);
      }}
    />
  );
}

export function AdminAlbumsPage() {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("common");

  const [albums, setAlbums] = useState<AlbumListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [description, setDescription] = useState("");
  const [yearStr, setYearStr] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [persons, setPersons] = useState<Person[]>([]);
  const [personsLoading, setPersonsLoading] = useState(false);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlbumsList();
      setAlbums(data);
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadAlbums();
  }, [loadAlbums]);

  useEffect(() => {
    if (!createOpen) {
      return;
    }
    let cancelled = false;
    setPersonsLoading(true);
    void (async () => {
      try {
        const res = await fetchPersonsList({ limit: 500, page: 1 });
        if (!cancelled) {
          setPersons(res.data);
        }
      } catch {
        if (!cancelled) {
          setPersons([]);
        }
      } finally {
        if (!cancelled) {
          setPersonsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createOpen]);

  function resetCreateForm() {
    setAlbumTitle("");
    setDescription("");
    setYearStr("");
    setOwnerId("");
    setCreateError(null);
  }

  async function submitCreate() {
    const titleTrim = albumTitle.trim();
    if (!titleTrim) {
      setCreateError(t("albums.createErrorTitle"));
      return;
    }
    let year: number | null | undefined;
    if (yearStr.trim() !== "") {
      const y = Number(yearStr.trim());
      if (!Number.isFinite(y) || !Number.isInteger(y)) {
        setCreateError(t("albums.createErrorYear"));
        return;
      }
      year = y;
    } else {
      year = undefined;
    }
    const body: AlbumCreate = {
      title: titleTrim,
      description: description.trim() === "" ? null : description.trim(),
      year: year === undefined ? undefined : year,
      ownerId:
        ownerId === "" ? undefined : (ownerId as AlbumCreate["ownerId"]),
    };
    setCreateBusy(true);
    setCreateError(null);
    try {
      await createAlbum(body);
      setCreateOpen(false);
      resetCreateForm();
      await loadAlbums();
      toast.success(t("toast.albumCreated"));
    } catch (e) {
      setCreateError(errorMessage(e, t("common.unknownError")));
    } finally {
      setCreateBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
            {t("albums.title")}
          </h1>
          <p className="md-typescale-body-medium m-0 mt-1 text-[var(--md-sys-color-on-surface-variant)]">
            {t("albums.subtitle")}
          </p>
        </div>
        <MdButton
          variant="filled"
          type="button"
          onClick={() => {
            resetCreateForm();
            setCreateOpen(true);
          }}
        >
          {t("albums.newButton")}
        </MdButton>
      </div>

      {loading ? (
        <p className="md-typescale-body-large m-0">{tc("loading")}</p>
      ) : error ? (
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-error)]">
          {error}
        </p>
      ) : albums.length === 0 ? (
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {t("albums.emptyList")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <Link
              key={a.id}
              to={`/album/${a.id}`}
              className="block min-w-0 rounded-xl no-underline outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
            >
              <md-outlined-card className="block h-full overflow-hidden">
                <CoverImage rel={a.coverThumbnail} />
                <div className="flex flex-col gap-1 p-4">
                  <p className="md-typescale-title-medium m-0 text-[var(--md-sys-color-on-surface)]">
                    {a.title}
                  </p>
                  <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
                    {a.year != null
                      ? t("albums.year", { year: String(a.year) })
                      : t("albums.yearUnknown")}
                  </p>
                </div>
              </md-outlined-card>
            </Link>
          ))}
        </div>
      )}

      <MdDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
        className="min-w-[min(100vw-2rem,28rem)]"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 className="md-typescale-title-large m-0">{t("albums.dialogTitle")}</h2>
          <MdTextField
            label={t("albums.labelTitle")}
            value={albumTitle}
            onValueChange={setAlbumTitle}
            required
          />
          <MdTextField
            label={t("albums.labelDescription")}
            value={description}
            onValueChange={setDescription}
            type="textarea"
            rows={3}
          />
          <MdTextField
            label={t("albums.labelYear")}
            value={yearStr}
            onValueChange={setYearStr}
            type="number"
            supportingText={t("albums.yearOptional")}
          />
          <MdSelect
            label={t("albums.labelOwner")}
            value={ownerId}
            onValueChange={setOwnerId}
            disabled={personsLoading}
          >
            <MdSelectOption value="" headline={t("albums.ownerNone")} />
            {persons.map((p) => (
              <MdSelectOption
                key={p.id}
                value={p.id}
                headline={`${p.lastName} ${p.firstName}`}
              />
            ))}
          </MdSelect>
          {createError ? (
            <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-error)]">
              {createError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <MdButton
              variant="text"
              type="button"
              disabled={createBusy}
              onClick={() => {
                setCreateOpen(false);
              }}
            >
              {tc("cancel")}
            </MdButton>
            <MdButton
              variant="filled"
              type="button"
              disabled={createBusy}
              onClick={() => {
                void submitCreate();
              }}
            >
              {t("albums.submitCreate")}
            </MdButton>
          </div>
        </div>
      </MdDialog>
    </div>
  );
}
