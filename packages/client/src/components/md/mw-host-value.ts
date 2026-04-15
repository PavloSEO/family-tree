/** Значение с хоста MW text field / select после `input` / `change`. */
export function mwHostStringValue(target: EventTarget | null): string {
  return String((target as unknown as { value?: string }).value ?? "");
}
