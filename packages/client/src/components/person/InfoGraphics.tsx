import type { Person } from "@family-tree/shared";
import {
  chineseZodiacAnimalFromIso,
  computeAgeYears,
  westernZodiacFromIso,
} from "@family-tree/shared";
import { useTranslation } from "react-i18next";

function hasText(s: string | null | undefined): boolean {
  return Boolean(s && String(s).trim().length > 0);
}

export function hasInfoGraphicsContent(person: Person): boolean {
  const age = computeAgeYears(person.dateOfBirth, {
    deathIso: person.dateOfDeath,
  });
  const west = westernZodiacFromIso(person.dateOfBirth);
  const cn = chineseZodiacAnimalFromIso(person.dateOfBirth);
  return (
    age != null ||
    west != null ||
    cn != null ||
    person.bloodType != null ||
    hasText(person.birthPlace) ||
    hasText(person.currentLocation)
  );
}

/** Строки инфографики: только при наличии данных. */
export function InfoGraphics({ person }: { person: Person }) {
  const { t } = useTranslation("person");
  const age = computeAgeYears(person.dateOfBirth, {
    deathIso: person.dateOfDeath,
  });
  const west = westernZodiacFromIso(person.dateOfBirth);
  const cn = chineseZodiacAnimalFromIso(person.dateOfBirth);

  return (
    <dl className="m-0 grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-3">
      {age != null ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("info.age")}
          </dt>
          <dd className="md-typescale-body-large m-0">
            {t("age.years", { count: age })}
          </dd>
        </>
      ) : null}
      {west != null ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("info.westernZodiac")}
          </dt>
          <dd className="md-typescale-body-large m-0">{west}</dd>
        </>
      ) : null}
      {cn != null ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("info.chineseZodiac")}
          </dt>
          <dd className="md-typescale-body-large m-0">
            {cn}
            <span className="md-typescale-body-small ml-1 text-[var(--md-sys-color-on-surface-variant)]">
              {t("zodiac.cnBirthYearNote")}
            </span>
          </dd>
        </>
      ) : null}
      {person.bloodType != null ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("info.bloodType")}
          </dt>
          <dd className="md-typescale-body-large m-0">{person.bloodType}</dd>
        </>
      ) : null}
      {hasText(person.birthPlace) ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("info.birthPlace")}
          </dt>
          <dd className="md-typescale-body-large m-0">{person.birthPlace}</dd>
        </>
      ) : null}
      {hasText(person.currentLocation) ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("info.currentLocation")}
          </dt>
          <dd className="md-typescale-body-large m-0">{person.currentLocation}</dd>
        </>
      ) : null}
    </dl>
  );
}
