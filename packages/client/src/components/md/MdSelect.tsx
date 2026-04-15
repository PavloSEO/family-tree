import type { FormEventHandler, ReactNode } from "react";
import { mwHostStringValue } from "./mw-host-value.js";

export type MdSelectProps = {
  label: string;
  value: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  supportingText?: string;
  className?: string;
  children?: ReactNode;
};

export function MdSelect({
  label,
  value,
  onValueChange,
  disabled,
  required,
  error,
  errorText,
  supportingText,
  className,
  children,
}: MdSelectProps) {
  const onInput: FormEventHandler<HTMLElement> = (e) => {
    onValueChange?.(mwHostStringValue(e.currentTarget));
  };

  return (
    <md-outlined-select
      label={label}
      value={value}
      disabled={disabled}
      required={required}
      error={error}
      className={className}
      {...(errorText !== undefined ? { "error-text": errorText } : {})}
      {...(supportingText !== undefined
        ? { "supporting-text": supportingText }
        : {})}
      onInput={onInput}
    >
      {children}
    </md-outlined-select>
  );
}
