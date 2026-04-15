import type { Person } from "@family-tree/shared";
import { personCreateSchema, personUpdateSchema, type PersonCreate, type PersonUpdate } from "@family-tree/shared";
import type { PersonFormInput } from "./person-form.js";

function trimOrUndef(s: string): string | undefined {
  const t = s.trim();
  return t === "" ? undefined : t;
}

function parseIsoDate(s: string): string | undefined {
  const t = s.trim();
  if (t === "") return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return undefined;
  const d = new Date(`${t}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return t;
}

function parseHobbies(lines: string): string[] | undefined {
  const items = lines
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function parseJsonField<T>(raw: string, fallback: T): T {
  const t = raw.trim();
  if (t === "") return fallback;
  try {
    return JSON.parse(t) as T;
  } catch {
    return fallback;
  }
}

export function personToFormInput(p: Person): PersonFormInput {
  const hobbiesLines = p.hobbies?.length ? p.hobbies.join("\n") : "";
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    gender: p.gender,
    patronymic: p.patronymic ?? "",
    maidenName: p.maidenName ?? "",
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "",
    dateOfDeath: p.dateOfDeath ? p.dateOfDeath.slice(0, 10) : "",
    birthPlace: p.birthPlace ?? "",
    currentLocation: p.currentLocation ?? "",
    country: p.country ?? "",
    phone: p.phone ?? "",
    email: p.email ?? "",
    bio: p.bio ?? "",
    occupation: p.occupation ?? "",
    bloodType: p.bloodType ?? "",
    hobbiesLines,
    localizedNamesJson: p.localizedNames ? JSON.stringify(p.localizedNames, null, 2) : "",
    socialLinksJson: p.socialLinks ? JSON.stringify(p.socialLinks, null, 2) : "[]",
    customFieldsJson: p.customFields ? JSON.stringify(p.customFields, null, 2) : "{}",
  };
}

export function formInputToPersonCreate(f: PersonFormInput): PersonCreate {
  const countryRaw = f.country.trim().toUpperCase();
  const country = countryRaw.length === 2 ? countryRaw : undefined;
  const bloodType = f.bloodType === "" ? undefined : f.bloodType;
  const localizedNames = parseJsonField(f.localizedNamesJson.trim(), null);
  const socialLinks = parseJsonField(f.socialLinksJson.trim(), []);
  const customFields = parseJsonField(f.customFieldsJson.trim(), {});

  return personCreateSchema.parse({
    firstName: f.firstName.trim(),
    lastName: f.lastName.trim(),
    gender: f.gender,
    patronymic: trimOrUndef(f.patronymic),
    maidenName: trimOrUndef(f.maidenName),
    dateOfBirth: parseIsoDate(f.dateOfBirth),
    dateOfDeath: parseIsoDate(f.dateOfDeath),
    birthPlace: trimOrUndef(f.birthPlace),
    currentLocation: trimOrUndef(f.currentLocation),
    country,
    phone: trimOrUndef(f.phone),
    email: trimOrUndef(f.email),
    bio: trimOrUndef(f.bio),
    occupation: trimOrUndef(f.occupation),
    bloodType,
    hobbies: parseHobbies(f.hobbiesLines),
    localizedNames,
    socialLinks,
    customFields,
  });
}

export function formInputToPersonUpdate(f: PersonFormInput): PersonUpdate {
  const create = formInputToPersonCreate(f);
  return personUpdateSchema.parse(create);
}
