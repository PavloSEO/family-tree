export type MdSelectOptionProps = {
  value: string;
  headline: string;
  disabled?: boolean;
};

export function MdSelectOption({
  value,
  headline,
  disabled,
}: MdSelectOptionProps) {
  return (
    <md-select-option value={value} headline={headline} disabled={disabled} />
  );
}
