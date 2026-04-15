import type { MouseEventHandler } from "react";

export type MdChipFilterProps = {
  variant: "filter";
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onSelectedChange?: (selected: boolean) => void;
};

export type MdChipInputProps = {
  variant: "input";
  label: string;
  disabled?: boolean;
};

export type MdChipProps = MdChipFilterProps | MdChipInputProps;

export function MdChip(props: MdChipProps) {
  if (props.variant === "input") {
    return (
      <md-input-chip label={props.label} disabled={props.disabled} />
    );
  }

  const onClick: MouseEventHandler<HTMLElement> = (e) => {
    const selected = (e.currentTarget as unknown as { selected: boolean })
      .selected;
    props.onSelectedChange?.(selected);
  };

  return (
    <md-filter-chip
      label={props.label}
      selected={props.selected}
      disabled={props.disabled}
      onClick={onClick}
    />
  );
}
