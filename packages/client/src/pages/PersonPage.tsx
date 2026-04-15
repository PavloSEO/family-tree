import type { AlbumListItem, Person } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { fetchAlbumsList } from "../api/albums.js";
import {
  fetchPerson,
  fetchPersonRelatives,
  type PersonRelative,
} from "../api/persons.js";
import {
  ContactsBlock,
  hasContactsContent,
} from "../components/person/ContactsBlock.js";
import {
  CustomFieldsBlock,
  hasCustomFieldsContent,
} from "../components/person/CustomFieldsBlock.js";
import {
  InfoGraphics,
  hasInfoGraphicsContent,
} from "../components/person/InfoGraphics.js";
import { MdChip } from "../components/md/index.js";
import { useAuth } from "../hooks/useAuth.js";
import { albumCoverSrc } from "../lib/album-cover-src.js";
import { mainPhotoSrc } from "../lib/person-main-photo-src.js";

function formatIsoDateRu(
  value: string | null | undefined,
  emptyLabel: string,
): string {
  if (!value) {
    return emptyLabel;
  }
  const dayPart = value.includes("T") ? value.split("T")[0] : value.split(" ")[0];
  const [y, m, d] = (dayPart ?? value).split("-");
  if (!y || !m || !d) {
    return value;
  }
  return `${d}.${m}.${y}`;
}

function hasText(s: string | null | undefined): boolean {
  return Boolean(s && String(s).trim().length > 0);
}

function hasCountry(p: Person): boolean {
  return p.country != null && String(p.country).trim().length > 0;
}

function hasAboutSection(p: Person): boolean {
  return (
    hasText(p.bio) ||
    hasText(p.dateOfBirth) ||
    hasText(p.dateOfDeath) ||
    hasText(p.birthPlace) ||
    hasText(p.currentLocation)
  );
}

function hasWorkSection(p: Person): boolean {
  return hasText(p.occupation) || Boolean(p.hobbies && p.hobbies.length > 0);
}

function hasExtraSection(p: Person): boolean {
  const loc = p.localizedNames;
  const locKeys = loc && typeof loc === "object" ? Object.keys(loc).length : 0;
  return hasCountry(p) || locKeys > 0;
}

function PersonHeader({ person }: { person: Person }) {
  const { t } = useTranslation("person");
  const [broken, setBroken] = useState(false);
  const src = mainPhotoSrc(person.mainPhoto);
  const patronymic = hasText(person.patronymic)
    ? ` ${person.patronymic as string}`
    : "";
  const maiden = hasText(person.maidenName)
    ? t("maiden", { name: person.maidenName as string })
    : "";

  return (
    <md-elevated-card className="person-page__card block">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 justify-center sm:justify-start">
          {!src || broken ? (
            <div className="flex h-28 w-28 items-center justify-center rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-high)]">
              <md-icon className="material-symbols-outlined text-5xl text-[var(--md-sys-color-on-surface-variant)]">
                person
              </md-icon>
            </div>
          ) : (
            <img
              src={src}
              alt=""
              className="h-28 w-28 rounded-[var(--md-sys-shape-corner-medium)] object-cover"
              onError={() => {
                setBroken(true);
              }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="md-typescale-headline-medium m-0 text-[var(--md-sys-color-on-surface)]">
            {person.firstName}
            {patronymic} {person.lastName}
            {maiden ? (
              <span className="md-typescale-title-medium font-normal text-[var(--md-sys-color-on-surface-variant)]">
                {maiden}
              </span>
            ) : null}
          </h1>
          <p className="md-typescale-body-large m-0 mt-2 text-[var(--md-sys-color-on-surface-variant)]">
            {t("gender.prefix")}:{" "}
            {person.gender === "male" ? t("gender.male") : t("gender.female")}
          </p>
        </div>
      </div>
    </md-elevated-card>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <md-elevated-card className="person-page__card block overflow-hidden">
      <div className="p-6">
        <h2 className="md-typescale-title-large m-0 flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
          <md-icon className="material-symbols-outlined text-[var(--md-sys-color-primary)]">
            {icon}
          </md-icon>
          {title}
        </h2>
        <md-divider className="my-4" />
        {children}
      </div>
    </md-elevated-card>
  );
}

export function PersonPage() {
  const { t } = useTranslation("person");
  const tRef = useRef(t);
  tRef.current = t;
  const formatLoadError = useCallback((e: unknown): string => {
    if (e instanceof HTTPError) {
      return e.message;
    }
    if (e instanceof Error) {
      return e.message;
    }
    return tRef.current("page.unknownError");
  }, []);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatives, setRelatives] = useState<PersonRelative[] | null>(null);
  const [relativesLoading, setRelativesLoading] = useState(false);
  const [relativesError, setRelativesError] = useState<string | null>(null);
  const [ownedAlbums, setOwnedAlbums] = useState<AlbumListItem[]>([]);
  const [ownedAlbumsLoading, setOwnedAlbumsLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(tRef.current("page.noId"));
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const p = await fetchPerson(id);
        if (!cancelled) {
          setPerson(p);
        }
      } catch (e) {
        if (!cancelled) {
          setPerson(null);
          setError(formatLoadError(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, formatLoadError]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    setRelativesLoading(true);
    setRelativesError(null);
    void (async () => {
      try {
        const r = await fetchPersonRelatives(id);
        if (!cancelled) {
          setRelatives(r);
        }
      } catch (e) {
        if (!cancelled) {
          setRelatives(null);
          setRelativesError(formatLoadError(e));
        }
      } finally {
        if (!cancelled) {
          setRelativesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, formatLoadError]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    setOwnedAlbumsLoading(true);
    void (async () => {
      try {
        const list = await fetchAlbumsList({ ownerId: id });
        if (!cancelled) {
          setOwnedAlbums(list);
        }
      } catch {
        if (!cancelled) {
          setOwnedAlbums([]);
        }
      } finally {
        if (!cancelled) {
          setOwnedAlbumsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="md-typescale-body-large m-0">{t("page.loading")}</p>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="p-6">
        <p
          className="md-typescale-body-large m-0"
          style={{ color: "var(--md-sys-color-error)" }}
        >
          {error ?? t("page.notFound")}
        </p>
      </div>
    );
  }

  const p = person;
  const personActions = (
    <div className="mb-4 flex flex-wrap justify-end gap-x-6 gap-y-2">
      <Link
        to={`/tree/${p.id}`}
        className="md-typescale-label-large text-[var(--md-sys-color-primary)] no-underline hover:underline"
      >
        {t("page.treeViz")}
      </Link>
      {user?.role === "admin" ? (
        <Link
          to={`/admin/persons/${p.id}/edit`}
          className="md-typescale-label-large text-[var(--md-sys-color-primary)] no-underline hover:underline"
        >
          {t("page.edit")}
        </Link>
      ) : null}
    </div>
  );

  return (
    <div className="person-page mx-auto max-w-3xl p-6">
      {personActions}
      <div className="flex flex-col gap-4">
        <PersonHeader person={p} />

        {hasInfoGraphicsContent(p) ? (
          <SectionCard title={t("sections.infographics")} icon="insights">
            <InfoGraphics person={p} />
          </SectionCard>
        ) : null}

        {ownedAlbumsLoading ? (
          <SectionCard title={t("sections.photoAlbums")} icon="photo_library">
            <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
              {t("page.loading")}
            </p>
          </SectionCard>
        ) : ownedAlbums.length > 0 ? (
          <SectionCard title={t("sections.photoAlbums")} icon="photo_library">
            <ul className="m-0 list-none space-y-4 p-0">
              {ownedAlbums.map((a) => {
                const cover = albumCoverSrc(a.coverThumbnail);
                return (
                  <li key={a.id}>
                    <Link
                      to={`/album/${a.id}`}
                      className="flex gap-4 rounded-[var(--md-sys-shape-corner-medium)] no-underline outline-none ring-offset-2 hover:bg-[var(--md-sys-color-surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                    >
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-high)]">
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <md-icon className="material-symbols-outlined text-3xl text-[var(--md-sys-color-on-surface-variant)]">
                              collections
                            </md-icon>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <p className="md-typescale-title-medium m-0 text-[var(--md-sys-color-primary)]">
                          {a.title}
                        </p>
                        <p className="md-typescale-body-medium m-0 mt-1 text-[var(--md-sys-color-on-surface-variant)]">
                          {a.year != null
                            ? t("page.albumYear", { year: String(a.year) })
                            : t("page.albumYearUnknown")}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        ) : null}

        <SectionCard title={t("sections.relatives")} icon="family_restroom">
          {relativesLoading ? (
            <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
              {t("page.loading")}
            </p>
          ) : null}
          {relativesError ? (
            <p
              className="md-typescale-body-large m-0"
              style={{ color: "var(--md-sys-color-error)" }}
            >
              {relativesError}
            </p>
          ) : null}
          {!relativesLoading && !relativesError && relatives?.length === 0 ? (
            <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
              {t("page.relativesEmpty")}
            </p>
          ) : null}
          {!relativesLoading && !relativesError && relatives && relatives.length > 0 ? (
            <ul className="m-0 list-none space-y-3 p-0">
              {relatives.map((r) => (
                <li
                  key={r.personId}
                  className="flex flex-col gap-0.5 border-b border-[var(--md-sys-color-outline-variant)] pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <Link
                    to={`/person/${r.personId}`}
                    className="md-typescale-title-medium text-[var(--md-sys-color-primary)] no-underline hover:underline"
                  >
                    {r.displayName}
                  </Link>
                  <span className="md-typescale-body-medium text-[var(--md-sys-color-on-surface-variant)]">
                    {r.relationshipLabel}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </SectionCard>

        {hasAboutSection(p) ? (
          <SectionCard title={t("sections.about")} icon="person">
            <dl className="m-0 grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-3">
              {hasText(p.bio) ? (
                <>
                  <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("about.bio")}
                  </dt>
                  <dd className="md-typescale-body-large m-0 whitespace-pre-wrap">{p.bio}</dd>
                </>
              ) : null}
              {hasText(p.dateOfBirth) ? (
                <>
                  <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("about.dateOfBirth")}
                  </dt>
                  <dd className="md-typescale-body-large m-0">
                    {formatIsoDateRu(p.dateOfBirth, t("date.empty"))}
                  </dd>
                </>
              ) : null}
              {hasText(p.dateOfDeath) ? (
                <>
                  <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("about.dateOfDeath")}
                  </dt>
                  <dd className="md-typescale-body-large m-0">
                    {formatIsoDateRu(p.dateOfDeath, t("date.empty"))}
                  </dd>
                </>
              ) : null}
              {hasText(p.birthPlace) ? (
                <>
                  <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("about.birthPlace")}
                  </dt>
                  <dd className="md-typescale-body-large m-0 whitespace-pre-wrap">
                    {p.birthPlace}
                  </dd>
                </>
              ) : null}
              {hasText(p.currentLocation) ? (
                <>
                  <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("about.currentLocation")}
                  </dt>
                  <dd className="md-typescale-body-large m-0 whitespace-pre-wrap">
                    {p.currentLocation}
                  </dd>
                </>
              ) : null}
            </dl>
          </SectionCard>
        ) : null}

        {hasContactsContent(p) ? (
          <SectionCard title={t("sections.contacts")} icon="contact_mail">
            <ContactsBlock person={p} />
          </SectionCard>
        ) : null}

        {hasWorkSection(p) ? (
          <SectionCard title={t("sections.workHobbies")} icon="work">
            <div className="flex flex-col gap-4">
              {hasText(p.occupation) ? (
                <div>
                  <p className="md-typescale-label-large m-0 mb-1 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("work.occupation")}
                  </p>
                  <p className="md-typescale-body-large m-0">{p.occupation}</p>
                </div>
              ) : null}
              {p.hobbies && p.hobbies.length > 0 ? (
                <div>
                  <p className="md-typescale-label-large m-0 mb-2 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("work.hobbies")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.hobbies.map((h, i) => (
                      <MdChip key={`${i}-${h}`} variant="input" label={h} disabled />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>
        ) : null}

        {hasExtraSection(p) ? (
          <SectionCard title={t("sections.extra")} icon="info">
            <dl className="m-0 grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-3">
              {hasCountry(p) ? (
                <>
                  <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("extra.country")}
                  </dt>
                  <dd className="md-typescale-body-large m-0">{p.country}</dd>
                </>
              ) : null}
              {p.localizedNames && Object.keys(p.localizedNames).length > 0 ? (
                <>
                  <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
                    {t("extra.localizedNames")}
                  </dt>
                  <dd className="md-typescale-body-large m-0">
                    <ul className="m-0 list-none space-y-2 p-0">
                      {Object.entries(p.localizedNames).map(([lang, names]) => (
                        <li key={lang}>
                          <span className="font-medium">{lang}</span>:{" "}
                          {names.firstName} {names.lastName}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </>
              ) : null}
            </dl>
          </SectionCard>
        ) : null}

        {hasCustomFieldsContent(p) ? (
          <SectionCard title={t("sections.customFields")} icon="tune">
            <CustomFieldsBlock person={p} />
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}
