import type {
  PaginatedResponse,
  Person,
  PersonCreate,
  PersonDuplicateGroup,
  PersonListQuery,
  PersonUpdate,
} from "@family-tree/shared";
import {
  personCreateSchema,
  personListQuerySchema,
  personSchema,
  personUpdateSchema,
} from "@family-tree/shared";
import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "../db/connection.js";
import { persons } from "../db/schema.js";

export class PersonNotFoundError extends Error {
  readonly code = "PERSON_NOT_FOUND";

  constructor(id: string) {
    super(`Карточка не найдена: ${id}`);
    this.name = "PersonNotFoundError";
  }
}

type PersonRow = typeof persons.$inferSelect;

function mapRowToPerson(row: PersonRow): Person {
  return personSchema.parse({
    ...row,
    email: row.email ?? "",
  });
}

function buildListWhere(query: PersonListQuery): SQL | undefined {
  const parts: SQL[] = [];

  if (query.search) {
    const esc = query.search
      .replaceAll("\\", "\\\\")
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_");
    const pattern = `%${esc}%`;
    parts.push(
      sql`(
        ${persons.firstName} LIKE ${pattern} ESCAPE ${"\\"}
        OR ${persons.lastName} LIKE ${pattern} ESCAPE ${"\\"}
      )`,
    );
  }

  if (query.country) {
    parts.push(eq(persons.country, query.country));
  }

  if (query.alive === true) {
    parts.push(
      sql`(${persons.dateOfDeath} IS NULL OR ${persons.dateOfDeath} = '')`,
    );
  } else if (query.alive === false) {
    parts.push(
      sql`(${persons.dateOfDeath} IS NOT NULL AND ${persons.dateOfDeath} != '')`,
    );
  } else if (query.status === "alive") {
    parts.push(
      sql`(${persons.dateOfDeath} IS NULL OR ${persons.dateOfDeath} = '')`,
    );
  } else if (query.status === "dead") {
    parts.push(
      sql`(${persons.dateOfDeath} IS NOT NULL AND ${persons.dateOfDeath} != '')`,
    );
  }

  if (parts.length === 0) {
    return undefined;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return and(...parts);
}

function listOrderBy(query: PersonListQuery) {
  const sort = query.sort ?? "lastName";
  const orderDesc = query.order === "desc";
  const col =
    (
      {
        firstName: persons.firstName,
        lastName: persons.lastName,
        dateOfBirth: persons.dateOfBirth,
        country: persons.country,
        createdAt: persons.createdAt,
        gender: persons.gender,
      } as const
    )[sort] ?? persons.lastName;
  const primary = orderDesc ? desc(col) : asc(col);
  return [primary, asc(persons.lastName), asc(persons.firstName), asc(persons.id)];
}

export async function listPersons(
  rawQuery: unknown,
): Promise<PaginatedResponse<Person>> {
  const query = personListQuerySchema.parse(rawQuery ?? {});
  const whereExpr = buildListWhere(query);
  const offset = (query.page - 1) * query.limit;
  const orderByExpr = listOrderBy(query);

  const countQ = db.select({ n: count() }).from(persons);
  const countRows = await (whereExpr ? countQ.where(whereExpr) : countQ);
  const total = Number(countRows[0]?.n ?? 0);

  const listQ = db.select().from(persons);
  const rows = await (whereExpr ? listQ.where(whereExpr) : listQ)
    .orderBy(...orderByExpr)
    .limit(query.limit)
    .offset(offset);

  return {
    data: rows.map(mapRowToPerson),
    total,
    page: query.page,
    limit: query.limit,
  };
}

export async function getPersonById(id: string): Promise<Person | null> {
  const row = await db.query.persons.findFirst({
    where: eq(persons.id, id),
  });
  return row ? mapRowToPerson(row) : null;
}

function insertValuesFromCreate(
  id: string,
  parsed: PersonCreate,
): typeof persons.$inferInsert {
  return {
    id,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    patronymic: parsed.patronymic ?? null,
    maidenName: parsed.maidenName ?? null,
    gender: parsed.gender,
    dateOfBirth: parsed.dateOfBirth ?? null,
    dateOfDeath: parsed.dateOfDeath ?? null,
    birthPlace: parsed.birthPlace ?? null,
    currentLocation: parsed.currentLocation ?? null,
    country: parsed.country ?? null,
    mainPhoto: null,
    bio: parsed.bio ?? null,
    occupation: parsed.occupation ?? null,
    bloodType: parsed.bloodType ?? null,
    phone: parsed.phone ?? null,
    email:
      parsed.email === undefined || parsed.email === "" || parsed.email === null
        ? null
        : parsed.email,
    localizedNames: parsed.localizedNames ?? null,
    hobbies: parsed.hobbies ?? null,
    socialLinks: parsed.socialLinks ?? null,
    customFields: parsed.customFields ?? null,
  };
}

export async function createPerson(input: unknown): Promise<Person> {
  const parsed = personCreateSchema.parse(input);
  const id = randomUUID();
  await db.insert(persons).values(insertValuesFromCreate(id, parsed));
  const created = await getPersonById(id);
  if (!created) {
    throw new Error("Не удалось прочитать созданную карточку");
  }
  return created;
}

export async function updatePerson(
  id: string,
  input: unknown,
): Promise<Person> {
  const existing = await db.query.persons.findFirst({
    where: eq(persons.id, id),
  });
  if (!existing) {
    throw new PersonNotFoundError(id);
  }

  const patch = personUpdateSchema.parse(input);
  const updates: Partial<typeof persons.$inferInsert> = {};

  const assign = <K extends keyof PersonCreate>(key: K, v: unknown) => {
    if (v === undefined) {
      return;
    }
    (updates as Record<string, unknown>)[key] = v;
  };

  assign("firstName", patch.firstName);
  assign("lastName", patch.lastName);
  assign("patronymic", patch.patronymic);
  assign("maidenName", patch.maidenName);
  assign("gender", patch.gender);
  assign("dateOfBirth", patch.dateOfBirth);
  assign("dateOfDeath", patch.dateOfDeath);
  assign("birthPlace", patch.birthPlace);
  assign("currentLocation", patch.currentLocation);
  assign("country", patch.country);
  assign("bio", patch.bio);
  assign("occupation", patch.occupation);
  assign("bloodType", patch.bloodType);
  assign("phone", patch.phone);
  if (patch.email !== undefined) {
    updates.email =
      patch.email === "" || patch.email === null ? null : patch.email;
  }
  if (patch.localizedNames !== undefined) {
    updates.localizedNames = patch.localizedNames;
  }
  if (patch.hobbies !== undefined) {
    updates.hobbies = patch.hobbies;
  }
  if (patch.socialLinks !== undefined) {
    updates.socialLinks = patch.socialLinks;
  }
  if (patch.customFields !== undefined) {
    updates.customFields = patch.customFields;
  }

  if (Object.keys(updates).length === 0) {
    return mapRowToPerson(existing);
  }

  await db
    .update(persons)
    .set({
      ...(updates as Record<string, unknown>),
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(persons.id, id));

  const updated = await getPersonById(id);
  if (!updated) {
    throw new PersonNotFoundError(id);
  }
  return updated;
}

export async function deletePerson(id: string): Promise<void> {
  const existing = await db.query.persons.findFirst({
    where: eq(persons.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new PersonNotFoundError(id);
  }
  await db.delete(persons).where(eq(persons.id, id));
}

/**
 * Groups with the same (case-insensitive) first name, last name, and birth date
 * where more than one row exists (`docs/06-api.md`: GET `/persons/duplicates`).
 */
export async function findPersonDuplicates(): Promise<PersonDuplicateGroup[]> {
  const all = await db.select().from(persons);
  const map = new Map<string, PersonRow[]>();
  for (const row of all) {
    const k = `${row.firstName.toLowerCase()}\0${row.lastName.toLowerCase()}\0${row.dateOfBirth ?? ""}`;
    const list = map.get(k) ?? [];
    list.push(row);
    map.set(k, list);
  }
  return [...map.values()]
    .filter((list) => list.length > 1)
    .sort((a, b) => {
      const ra = a[0];
      const rb = b[0];
      if (!ra || !rb) {
        return 0;
      }
      return ra.lastName.localeCompare(rb.lastName, "ru", {
        sensitivity: "base",
      });
    })
    .map((list) => ({
      persons: list
        .map(mapRowToPerson)
        .sort((p1, p2) =>
          p1.firstName.localeCompare(p2.firstName, "ru", {
            sensitivity: "base",
          }),
        ),
    }));
}
