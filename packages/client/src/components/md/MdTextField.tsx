import type { FormEventHandler } from "react";
import { createElement } from "react";
import { mwHostStringValue } from "./mw-host-value.js";

export type MdTextFieldProps = {
  variant?: "outlined" | "filled";
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  supportingText?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
  id?: string;
};

export function MdTextField({
  variant = "outlined",
  label,
  value,
  onValueChange,
  type = "text",
  disabled,
  required,
  error,
  errorText,
  supportingText,
  placeholder,
  className,
  rows,
  id,
}: MdTextFieldProps) {
  const onInput: FormEventHandler<HTMLElement> = (e) => {
    onValueChange(mwHostStringValue(e.target));
  };

  const common: Record<string, unknown> = {
    label,
    value,
    type,
    disabled,
    required,
    error,
    className,
    onInput,
  };
  if (errorText !== undefined) {
    common["error-text"] = errorText;
  }
  if (supportingText !== undefined) {
    common["supporting-text"] = supportingText;
  }
  if (placeholder !== undefined) {
    common.placeholder = placeholder;
  }
  if (rows !== undefined) {
    common.rows = rows;
  }
  if (id !== undefined) {
    common.id = id;
  }

  if (variant === "filled") {
    return createElement("md-filled-text-field", common);
  }
  return createElement("md-outlined-text-field", common);
}
