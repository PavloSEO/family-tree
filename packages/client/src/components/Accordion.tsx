import type { ReactNode } from "react";
import { useId, useState } from "react";

type AccordionProps = {
  summary: string;
  /** Icon key for inline SVG (design system kit) */
  icon?: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="currentColor"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transition: "transform 0.2s",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    </svg>
  );
}

const ICON_MAP: Record<string, string> = {
  person:
    "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  calendar_today:
    "M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z",
  photo_camera:
    "M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zm0-8.2c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2z",
  contact_mail:
    "M21 8V7l-3 2-3-2v1l3 2 3-2zm1-5H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm8-6h-8V6h8v6z",
  description:
    "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  work: "M20 6h-2.18c.07-.44.18-.86.18-1 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 .14.11.56.18 1H8c-1.11 0-1.99.89-1.99 2L6 19c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6-3c1.1 0 2 .9 2 2 0 .14-.11.56-.18 1h-3.64C12.11 5.56 12 5.14 12 5c0-1.1.9-2 2-2zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
  favorite:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  tune:
    "M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z",
};

function SectionIcon({ name }: { name: string }) {
  const path = ICON_MAP[name];
  if (!path) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d={path} />
    </svg>
  );
}

export function Accordion({ summary, icon, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const panelId = `${id}-panel`;
  const headerId = `${id}-header`;

  return (
    <div
      className="ft-accordion"
      style={{
        borderRadius: "var(--md-sys-shape-corner-medium)",
        border: "1px solid var(--md-sys-color-outline-variant)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "12px 16px",
          background: open
            ? "var(--md-sys-color-surface-container)"
            : "var(--md-sys-color-surface-container-low)",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--md-sys-color-on-surface)",
          transition: "background 0.15s",
        }}
      >
        {icon ? (
          <span style={{ color: "var(--md-sys-color-primary)" }}>
            <SectionIcon name={icon} />
          </span>
        ) : null}
        <span
          className="md-typescale-title-small"
          style={{ flex: 1, color: "var(--md-sys-color-on-surface)" }}
        >
          {summary}
        </span>
        <span style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
          <ChevronIcon open={open} />
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "var(--md-sys-color-surface)",
            borderTop: "1px solid var(--md-sys-color-outline-variant)",
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
