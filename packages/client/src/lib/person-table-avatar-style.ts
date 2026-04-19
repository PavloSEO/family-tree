import type { Person } from "@family-tree/shared";

function isDeadPerson(person: Person): boolean {
  return (
    person.dateOfDeath != null &&
    person.dateOfDeath !== "" &&
    String(person.dateOfDeath).trim().length > 0
  );
}

/** Age-based photo tint (design handoff `brand-avatars.html`). */
export function personTableAvatarTintClass(person: Person): string {
  if (isDeadPerson(person)) {
    return "person-table-avatar__img--tint-dead";
  }
  const birth = person.dateOfBirth;
  if (!birth || birth.length < 4) {
    return "person-table-avatar__img--tint-mid";
  }
  const y = Number.parseInt(birth.slice(0, 4), 10);
  if (Number.isNaN(y)) {
    return "person-table-avatar__img--tint-mid";
  }
  const age = new Date().getFullYear() - y;
  if (age < 35) {
    return "person-table-avatar__img--tint-young";
  }
  if (age < 60) {
    return "person-table-avatar__img--tint-mid";
  }
  return "person-table-avatar__img--tint-old";
}

export function personTableAvatarGenderBgClass(gender: Person["gender"]): string {
  if (gender === "female") {
    return "person-table-avatar__pad--female";
  }
  if (gender === "male") {
    return "person-table-avatar__pad--male";
  }
  return "person-table-avatar__pad--neutral";
}

export function personTableAvatarLivingRingClass(person: Person): string {
  return isDeadPerson(person)
    ? "person-table-avatar__wrap--dead"
    : "person-table-avatar__wrap--living";
}
