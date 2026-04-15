/** Value from MW text field / select host after `input` / `change`. */
export function mwHostStringValue(target: EventTarget | null): string {
  return String((target as unknown as { value?: string }).value ?? "");
}
