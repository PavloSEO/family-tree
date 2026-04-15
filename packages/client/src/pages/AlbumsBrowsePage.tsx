import type { AlbumListItem } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fetchAlbumsList } from "../api/albums.js";
import { albumCoverSrc } from "../lib/album-cover-src.js";

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

export function AlbumsBrowsePage() {
  const { t } = useTranslation("albums");
  const { t: tc } = useTranslation("common");

  const [albums, setAlbums] = useState<AlbumListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
          {t("browse.title")}
        </h1>
        <p className="md-typescale-body-medium m-0 mt-1 text-[var(--md-sys-color-on-surface-variant)]">
          {t("browse.subtitle")}
        </p>
      </div>

      {loading ? (
        <p className="md-typescale-body-large m-0">{tc("loading")}</p>
      ) : error ? (
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-error)]">
          {error}
        </p>
      ) : albums.length === 0 ? (
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {t("browse.empty")}
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
                      ? t("browse.year", { year: String(a.year) })
                      : t("browse.yearUnknown")}
                  </p>
                </div>
              </md-outlined-card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
