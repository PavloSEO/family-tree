import type { Person } from "@family-tree/shared";
import { useAppLocale } from "../../hooks/useAppLocale.js";

export function hasCustomFieldsContent(person: Person): boolean {
  const cf = person.customFields;
  return Boolean(cf && typeof cf === "object" && Object.keys(cf).length > 0);
}

export function CustomFieldsBlock({ person }: { person: Person }) {
  const { collatorLocale } = useAppLocale();
  const cf = person.customFields;
  if (!cf || typeof cf !== "object") {
    return null;
  }
  const entries = Object.entries(cf).sort(([a], [b]) =>
    a.localeCompare(b, collatorLocale),
  );

  return (
    <dl className="m-0 grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-3">
      {entries.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {k}
          </dt>
          <dd className="md-typescale-body-large m-0 whitespace-pre-wrap break-words">
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
