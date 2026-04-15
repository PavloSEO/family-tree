import type { MouseEventHandler, ReactNode } from "react";
import { createElement } from "react";

export type MdButtonVariant = "filled" | "outlined" | "text" | "elevated";

export type MdButtonProps = {
  variant?: MdButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  href?: string;
  target?: string;
  trailingIcon?: boolean;
  id?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
};

const TAGS = {
  filled: "md-filled-button",
  outlined: "md-outlined-button",
  text: "md-text-button",
  elevated: "md-elevated-button",
} as const;

export function MdButton({
  variant = "filled",
  type = "button",
  disabled,
  href,
  target,
  trailingIcon,
  id,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  className,
  children,
  onClick,
}: MdButtonProps) {
  const tag = TAGS[variant];
  const props: Record<string, unknown> = {
    type,
    disabled,
    href,
    target,
    className,
    onClick,
  };
  if (id !== undefined) {
    props.id = id;
  }
  if (ariaLabel !== undefined) {
    props["aria-label"] = ariaLabel;
  }
  if (ariaExpanded !== undefined) {
    props["aria-expanded"] = ariaExpanded;
  }
  if (ariaControls !== undefined) {
    props["aria-controls"] = ariaControls;
  }
  if (trailingIcon !== undefined) {
    props.trailingIcon = trailingIcon;
  }
  return createElement(tag, props, children);
}
