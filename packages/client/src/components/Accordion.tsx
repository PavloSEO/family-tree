import type { ReactNode } from "react";
import { useId, useState } from "react";
import { MdButton } from "./md/MdButton.js";

type AccordionProps = {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function Accordion({ summary, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const panelId = `${id}-panel`;
  const headerId = `${id}-header`;

  return (
    <div className="accordion">
      <MdButton
        variant="text"
        type="button"
        className="accordion-header"
        trailingIcon
        id={headerId}
        ariaExpanded={open}
        ariaControls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="accordion-title md-typescale-title-medium">{summary}</span>
        <md-icon className="material-symbols-outlined accordion-chevron" slot="icon">
          {open ? "expand_less" : "expand_more"}
        </md-icon>
      </MdButton>
      {open ? (
        <div id={panelId} role="region" aria-labelledby={headerId} className="accordion-panel">
          {children}
        </div>
      ) : null}
    </div>
  );
}
