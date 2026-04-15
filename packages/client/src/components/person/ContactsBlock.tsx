import type { Person } from "@family-tree/shared";
import { useTranslation } from "react-i18next";

function hasText(s: string | null | undefined): boolean {
  return Boolean(s && String(s).trim().length > 0);
}

function displayEmail(p: Person): string | null {
  if (p.email == null) {
    return null;
  }
  const t = String(p.email).trim();
  return t.length > 0 ? t : null;
}

export function hasContactsContent(person: Person): boolean {
  return (
    hasText(person.phone) ||
    displayEmail(person) != null ||
    Boolean(person.socialLinks && person.socialLinks.length > 0)
  );
}

function telHref(phone: string): string {
  const core = String(phone).replace(/[\s()-]/g, "");
  return `tel:${encodeURIComponent(core)}`;
}

/** Иконка Material Symbols по названию площадки / URL. */
function socialIconForPlatform(platform: string, url: string): string {
  const p = `${platform} ${url}`.toLowerCase();
  if (p.includes("vk.com") || p.includes("vkontakte")) {
    return "groups";
  }
  if (p.includes("t.me") || p.includes("telegram")) {
    return "send";
  }
  if (p.includes("whatsapp") || p.includes("wa.me")) {
    return "chat";
  }
  if (p.includes("youtube") || p.includes("youtu.be")) {
    return "smart_display";
  }
  if (p.includes("instagram")) {
    return "photo_camera";
  }
  if (p.includes("facebook") || p.includes("fb.com")) {
    return "thumb_up";
  }
  if (p.includes("ok.ru") || p.includes("odnoklassniki")) {
    return "diversity_3";
  }
  if (p.includes("twitter") || p.includes("x.com")) {
    const xOnly = /\bx\.com\b/i.test(url) && !p.includes("twitter");
    return xOnly ? "tag" : "chat_bubble";
  }
  if (p.includes("linkedin")) {
    return "work";
  }
  if (p.includes("github")) {
    return "code";
  }
  return "link";
}

export function ContactsBlock({ person }: { person: Person }) {
  const { t } = useTranslation("person");
  const email = displayEmail(person);

  return (
    <dl className="m-0 grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-3">
      {hasText(person.phone) ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("contacts.phone")}
          </dt>
          <dd className="md-typescale-body-large m-0">
            <a
              href={telHref(person.phone as string)}
              className="text-[var(--md-sys-color-primary)] no-underline hover:underline"
            >
              {person.phone}
            </a>
          </dd>
        </>
      ) : null}
      {email ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("contacts.email")}
          </dt>
          <dd className="md-typescale-body-large m-0">
            <a
              href={`mailto:${email}`}
              className="text-[var(--md-sys-color-primary)] no-underline hover:underline"
            >
              {email}
            </a>
          </dd>
        </>
      ) : null}
      {person.socialLinks && person.socialLinks.length > 0 ? (
        <>
          <dt className="md-typescale-label-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("contacts.social")}
          </dt>
          <dd className="md-typescale-body-large m-0">
            <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
              {person.socialLinks.map((s, i) => {
                const icon = socialIconForPlatform(s.platform, s.url);
                return (
                  <li key={`${i}-${s.platform}-${s.url}`} className="flex flex-col items-center gap-1">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${s.platform}: ${s.url}`}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)] no-underline outline-none ring-offset-2 hover:bg-[var(--md-sys-color-surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                    >
                      <md-icon className="material-symbols-outlined text-2xl">
                        {icon}
                      </md-icon>
                    </a>
                    <span className="md-typescale-label-small max-w-[5.5rem] truncate text-center text-[var(--md-sys-color-on-surface-variant)]">
                      {s.platform}
                    </span>
                  </li>
                );
              })}
            </ul>
          </dd>
        </>
      ) : null}
    </dl>
  );
}
