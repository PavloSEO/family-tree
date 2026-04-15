import type { Person } from "@family-tree/shared";
import type { ReactNode } from "react";
import {
  Facebook,
  Github,
  Instagram,
  Link2,
  Linkedin,
  MessageCircle,
  Music2,
  Send,
  UsersRound,
  Youtube,
} from "lucide-react";
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

const lucideIcon = "size-5 shrink-0 text-[var(--md-sys-color-primary)]";

/** Логотип VK (монохром, `currentColor`). */
function VkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.48 14.27h-1.5c-.57 0-.74-.45-1.76-1.47-.89-.86-1.28-.98-1.5-.98-.19 0-.5.12-.5.68v1.39c0 .49-.16.78-1.44.78-2.11 0-4.45-1.28-6.09-3.66-1.66-2.42-2.56-4.66-2.56-5.36 0-.27.12-.52.68-.52h1.5c.51 0 .7.23.9.78 1.03 2.77 2.62 5.19 3.3 5.19.31 0 .45-.19.45-.78v-2.14c-.08-1.44-.84-1.56-.84-2.06 0-.25.2-.5.53-.5h2.36c.41 0 .56.22.56.69v3.82c0 .41.19.56.31.56.19 0 .37-.12.75-.57 1.15-1.63 1.97-4.12 1.97-4.12.16-.27.31-.52.73-.52h1.5c.45 0 .55.23.45.68-.19.9-2.06 3.55-2.06 3.55-.17.27-.23.37 0 .75.17.23.75.9 1.13 1.47.71 1.03 1.25 1.76 1.97 1.76h1.5c.45 0 .68-.23.56-.68-.12-.41-.57-.9-1.16-1.47-.71-.57-1.27-1.16-1.49-1.63-.19-.27-.19-.41 0-.53l.9-1.16c.71-.9 1.25-1.63 1.63-2.62.12-.33-.08-.57-.53-.57z"
      />
    </svg>
  );
}

function socialIcon(platform: string, url: string): ReactNode {
  const p = `${platform} ${url}`.toLowerCase();
  if (p.includes("vk.com") || p.includes("vkontakte")) {
    return <VkIcon className={lucideIcon} />;
  }
  if (p.includes("t.me") || p.includes("telegram")) {
    return <Send className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("whatsapp") || p.includes("wa.me")) {
    return <MessageCircle className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("youtube") || p.includes("youtu.be")) {
    return <Youtube className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("instagram")) {
    return <Instagram className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("facebook") || p.includes("fb.com")) {
    return <Facebook className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("ok.ru") || p.includes("odnoklassniki")) {
    return <UsersRound className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("twitter") || p.includes("x.com")) {
    return <Link2 className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("linkedin")) {
    return <Linkedin className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("tiktok")) {
    return <Music2 className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  if (p.includes("github")) {
    return <Github className={lucideIcon} strokeWidth={2} aria-hidden />;
  }
  return <Link2 className={lucideIcon} strokeWidth={2} aria-hidden />;
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
              {person.socialLinks.map((s, i) => (
                <li
                  key={`${i}-${s.platform}-${s.url}`}
                  className="flex flex-col items-center gap-1"
                >
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${s.platform}: ${s.url}`}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)] no-underline outline-none ring-offset-2 hover:bg-[var(--md-sys-color-surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                  >
                    {socialIcon(s.platform, s.url)}
                  </a>
                  <span className="md-typescale-label-small max-w-[5.5rem] truncate text-center text-[var(--md-sys-color-on-surface-variant)]">
                    {s.platform}
                  </span>
                </li>
              ))}
            </ul>
          </dd>
        </>
      ) : null}
    </dl>
  );
}
