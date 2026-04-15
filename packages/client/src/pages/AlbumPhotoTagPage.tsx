import type { PhotoTag } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { fetchPersonsList } from "../api/persons.js";
import {
  fetchPhotoWithTags,
  type PhotoWithTags,
} from "../api/photos.js";
import { PhotoTagger } from "../components/PhotoTagger.js";
import { useAuth } from "../hooks/useAuth.js";
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

export function AlbumPhotoTagPage() {
  const { t } = useTranslation("albums");
  const { t: tc } = useTranslation("common");
  const { albumId, photoId } = useParams<{
    albumId: string;
    photoId: string;
  }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [photo, setPhoto] = useState<PhotoWithTags | null>(null);
  const [tags, setTags] = useState<PhotoTag[]>([]);
  const [personNames, setPersonNames] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!albumId || !photoId) {
      setError(t("tagPage.errorBadParams"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPhotoWithTags(photoId);
      if (data.albumId !== albumId) {
        setError(t("tagPage.errorWrongAlbum"));
        setPhoto(null);
        setTags([]);
        return;
      }
      setPhoto(data);
      setTags(data.tags);
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
      setPhoto(null);
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [albumId, photoId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchPersonsList({ page: 1, limit: 500 });
        const m = new Map<string, string>();
        for (const p of res.data) {
          m.set(p.id, `${p.firstName} ${p.lastName}`);
        }
        setPersonNames(m);
      } catch {
        /* подписи опциональны */
      }
    })();
  }, []);

  const personLabel = useMemo(() => {
    return (id: string) => personNames.get(id) ?? id.slice(0, 8);
  }, [personNames]);

  const imageSrc = useMemo(() => {
    if (!photo) {
      return "";
    }
    return albumCoverSrc(photo.src) ?? "";
  }, [photo]);

  if (!albumId || !photoId) {
    return (
      <div className="p-6">
        <p className="md-typescale-body-large m-0">{t("tagPage.invalidUrl")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/album/${albumId}`}
          className="md-typescale-label-large inline-flex items-center rounded-lg px-2 py-1 text-[var(--md-sys-color-primary)] no-underline outline-none ring-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
        >
          {t("tagPage.backToAlbum")}
        </Link>
        <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
          {t("tagPage.title")}
        </h1>
      </div>

      {loading ? (
        <p className="md-typescale-body-large m-0">{tc("loading")}</p>
      ) : error ? (
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-error)]">
          {error}
        </p>
      ) : photo && imageSrc ? (
        <PhotoTagger
          photoId={photo.id}
          imageSrc={imageSrc}
          tags={tags}
          personLabel={personLabel}
          canEdit={isAdmin}
          onTagsChange={setTags}
        />
      ) : (
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {t("tagPage.emptyDisplay")}
        </p>
      )}
    </div>
  );
}
