import type { Photo, PhotoTag } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { fetchAlbumWithPhotos } from "../api/albums.js";
import { fetchPersonsList } from "../api/persons.js";
import { fetchPhotoWithTags } from "../api/photos.js";
import { PhotoGallery, type PhotoGallerySlide } from "../components/PhotoGallery.js";
import { PhotoUploader } from "../components/PhotoUploader.js";
import { MdButton } from "../components/md/index.js";
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

export function AlbumPage() {
  const { id } = useParams();
  const { t } = useTranslation("albums");
  const { t: tc } = useTranslation("common");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoTags, setPhotoTags] = useState<PhotoTag[][]>([]);
  const [personNames, setPersonNames] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const load = useCallback(async () => {
    if (!id) {
      setError(t("albumPage.errorNoAlbumId"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { album, photos: list } = await fetchAlbumWithPhotos(id);
      setTitle(album.title);
      setPhotos(list);
    } catch (e) {
      setError(errorMessage(e, t("common.unknownError")));
      setTitle("");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (photos.length === 0) {
      setPhotoTags([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const rows = await Promise.all(
        photos.map(async (p) => {
          try {
            const f = await fetchPhotoWithTags(p.id);
            return f.tags;
          } catch {
            return [] as PhotoTag[];
          }
        }),
      );
      if (!cancelled) {
        setPhotoTags(rows);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photos]);

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
        /* подписи к тегам опциональны */
      }
    })();
  }, []);

  const personLabel = useCallback(
    (personId: string) => personNames.get(personId) ?? personId.slice(0, 8),
    [personNames],
  );

  const gallerySlides = useMemo((): PhotoGallerySlide[] => {
    return photos.map((p, i) => {
      const src =
        albumCoverSrc(p.src) ?? albumCoverSrc(p.thumbnail ?? "") ?? "";
      return {
        src,
        alt: "",
        tags: photoTags[i] ?? [],
        photoId: p.id,
      };
    });
  }, [photos, photoTags]);

  const onPhotoUploaded = useCallback((photo: Photo) => {
    setPhotos((prev) => {
      const next = [...prev, photo];
      next.sort((a, b) => a.sortOrder - b.sortOrder);
      return next;
    });
  }, []);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  if (!id) {
    return (
      <div className="p-6">
        <p className="md-typescale-body-large m-0">{t("albumPage.invalidUrl")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin ? (
            <Link
              to="/admin/albums"
              className="md-typescale-label-large inline-flex items-center rounded-lg px-2 py-1 text-[var(--md-sys-color-primary)] no-underline outline-none ring-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
            >
              {t("albumPage.backToAlbums")}
            </Link>
          ) : null}
          <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
            {loading
              ? t("albumPage.titleLoading")
              : title || t("albumPage.titleFallback")}
          </h1>
        </div>
      </div>

      {loading ? (
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {tc("loading")}
        </p>
      ) : error ? (
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-error)]">
          {error}
        </p>
      ) : (
        <>
          {isAdmin ? (
            <section className="flex flex-col gap-3">
              <h2 className="md-typescale-title-medium m-0 text-[var(--md-sys-color-on-surface)]">
                {t("albumPage.sectionUpload")}
              </h2>
              <PhotoUploader albumId={id} onUploaded={onPhotoUploaded} />
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <h2 className="md-typescale-title-medium m-0 text-[var(--md-sys-color-on-surface)]">
              {t("albumPage.sectionPhotos")}
            </h2>
            {photos.length === 0 ? (
              <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
                {t("albumPage.emptyPhotos")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {photos.map((p, i) => {
                  const src = albumCoverSrc(p.thumbnail ?? p.src);
                  return (
                    <div
                      key={p.id}
                      className="relative min-w-0 overflow-hidden rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]"
                    >
                      <MdButton
                        variant="text"
                        type="button"
                        ariaLabel={t("albumPage.openFullscreenAria")}
                        className="block w-full min-h-0 !h-auto cursor-zoom-in rounded-none border-0 bg-transparent p-0 text-left shadow-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                        onClick={() => {
                          openGallery(i);
                        }}
                      >
                        {src ? (
                          <img
                            src={src}
                            alt=""
                            className="pointer-events-none aspect-square w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square w-full items-center justify-center bg-[var(--md-sys-color-surface-container-high)]">
                            <md-icon className="material-symbols-outlined text-3xl text-[var(--md-sys-color-on-surface-variant)]">
                              image
                            </md-icon>
                          </div>
                        )}
                      </MdButton>
                      {isAdmin ? (
                        <Link
                          to={`/album/${id}/photo/${p.id}`}
                          className="md-typescale-label-small absolute bottom-1 right-1 z-10 rounded-md bg-[color-mix(in_srgb,var(--md-sys-color-inverse-surface)_88%,transparent)] px-2 py-1 text-[var(--md-sys-color-inverse-on-surface)] no-underline outline-none ring-offset-1 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                        >
                          {t("albumPage.taggingLink")}
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <PhotoGallery
        open={galleryOpen}
        index={galleryIndex}
        slides={gallerySlides}
        onClose={() => {
          setGalleryOpen(false);
        }}
        onIndexChange={setGalleryIndex}
        personLabel={personLabel}
      />
    </div>
  );
}
