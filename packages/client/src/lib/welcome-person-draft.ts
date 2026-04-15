import type { PersonFormInput } from "../forms/person-form.js";

export const WELCOME_PERSON_DRAFT_KEY = "family-tree:welcome-person-draft";

export function loadWelcomePersonDraft(
  key: string,
): Partial<PersonFormInput> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed as Partial<PersonFormInput>;
  } catch {
    return null;
  }
}
