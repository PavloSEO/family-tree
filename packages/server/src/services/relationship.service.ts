import type { Person, Relationship } from "@family-tree/shared";
import {
  personSchema,
  relationshipCreateSchema,
  relationshipSchema,
  relationshipUpdateSchema,
} from "@family-tree/shared";
import { randomUUID } from "node:crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "../db/connection.js";
import { persons, relationships } from "../db/schema.js";

export class RelationshipNotFoundError extends Error {
  readonly code = "RELATIONSHIP_NOT_FOUND";

  constructor(id: string) {
    super(`Связь не найдена: ${id}`);
    this.name = "RelationshipNotFoundError";
  }
}

/** Duplicate pair (type + people) — HTTP 409, phase 24. */
export class RelationshipDuplicateError extends Error {
  readonly code = "RELATIONSHIP_DUPLICATE";

  constructor(message = "Такая связь уже существует") {
    super(message);
    this.name = "RelationshipDuplicateError";
  }
}

/** Cycle in parent → child graph. */
export class RelationshipCycleError extends Error {
  readonly code = "RELATIONSHIP_CYCLE";

  constructor() {
    super("Связь создаёт цикл в дереве предков");
    this.name = "RelationshipCycleError";
  }
}

/** Child already has two parent-type edges. */
export class RelationshipTooManyParentsError extends Error {
  readonly code = "TOO_MANY_PARENTS";

  constructor() {
    super("У ребёнка не может быть больше двух родителей");
    this.name = "RelationshipTooManyParentsError";
  }
}

/** Person not found (for relationship validation). */
export class RelationshipPersonNotFoundError extends Error {
  readonly code = "PERSON_NOT_FOUND";

  constructor(id: string) {
    super(`Карточка не найдена: ${id}`);
    this.name = "RelationshipPersonNotFoundError";
  }
}

/** fromPersonId === toPersonId. */
export class RelationshipSelfReferenceError extends Error {
  readonly code = "RELATIONSHIP_SELF";

  constructor() {
    super("Нельзя связать карточку саму с собой");
    this.name = "RelationshipSelfReferenceError";
  }
}

type RelationshipRow = typeof relationships.$inferSelect;

function mapRowToRelationship(row: RelationshipRow): Relationship {
  return relationshipSchema.parse({
    ...row,
    marriageDate: row.marriageDate ?? null,
    divorceDate: row.divorceDate ?? null,
    isCurrentSpouse: row.isCurrentSpouse ?? null,
    notes: row.notes ?? null,
  });
}

async function requirePerson(id: string): Promise<void> {
  const row = await db.query.persons.findFirst({
    where: eq(persons.id, id),
    columns: { id: true },
  });
  if (!row) {
    throw new RelationshipPersonNotFoundError(id);
  }
}

/** YYYY-MM-DD date or prefix; lexicographic compare for same format. */
function compareIsoDates(a: string | null, b: string | null): number | null {
  if (!a || !b) {
    return null;
  }
  const da = a.split("T")[0]?.split(" ")[0] ?? a;
  const db = b.split("T")[0]?.split(" ")[0] ?? b;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(da) || !/^\d{4}-\d{2}-\d{2}$/.test(db)) {
    return null;
  }
  if (da < db) {
    return -1;
  }
  if (da > db) {
    return 1;
  }
  return 0;
}

function parentChildAgeWarnings(parent: Person, child: Person): string[] {
  const w: string[] = [];
  const cmp = compareIsoDates(parent.dateOfBirth, child.dateOfBirth);
  if (cmp === 1) {
    w.push(
      "Дата рождения «родителя» позже даты рождения «ребёнка» — проверьте корректность карточек.",
    );
  }
  if (parent.gender === child.gender) {
    w.push(
      "У родителя и ребёнка в карточках указан один и тот же пол — при необходимости проверьте данные.",
    );
  }
  return w;
}

async function findDuplicateSpouse(
  a: string,
  b: string,
): Promise<RelationshipRow | undefined> {
  return db.query.relationships.findFirst({
    where: and(
      eq(relationships.type, "spouse"),
      or(
        and(
          eq(relationships.fromPersonId, a),
          eq(relationships.toPersonId, b),
        ),
        and(
          eq(relationships.fromPersonId, b),
          eq(relationships.toPersonId, a),
        ),
      ),
    ),
  });
}

async function findDuplicateParent(
  fromPersonId: string,
  toPersonId: string,
): Promise<RelationshipRow | undefined> {
  return db.query.relationships.findFirst({
    where: and(
      eq(relationships.type, "parent"),
      eq(relationships.fromPersonId, fromPersonId),
      eq(relationships.toPersonId, toPersonId),
    ),
  });
}

async function countParentsOfChild(childId: string): Promise<number> {
  const rows = await db
    .select({ id: relationships.id })
    .from(relationships)
    .where(
      and(
        eq(relationships.type, "parent"),
        eq(relationships.toPersonId, childId),
      ),
    );
  return rows.length;
}

/**
 * Existing parent edges: from → to (parent → child).
 * Cycle check: when adding from→to, if from `to` you can reach `from` following parent→child edges, it would cycle.
 */
async function wouldCreateParentCycle(
  newFrom: string,
  newTo: string,
): Promise<boolean> {
  const rows = await db
    .select({
      fromPersonId: relationships.fromPersonId,
      toPersonId: relationships.toPersonId,
    })
    .from(relationships)
    .where(eq(relationships.type, "parent"));

  const adj = new Map<string, string[]>();
  for (const r of rows) {
    const list = adj.get(r.fromPersonId) ?? [];
    list.push(r.toPersonId);
    adj.set(r.fromPersonId, list);
  }

  const stack = [newTo];
  const seen = new Set<string>(stack);
  while (stack.length > 0) {
    const u = stack.pop()!;
    if (u === newFrom) {
      return true;
    }
    for (const v of adj.get(u) ?? []) {
      if (!seen.has(v)) {
        seen.add(v);
        stack.push(v);
      }
    }
  }
  return false;
}

async function getPersonByIdForRel(id: string): Promise<Person | null> {
  const row = await db.query.persons.findFirst({
    where: eq(persons.id, id),
  });
  if (!row) {
    return null;
  }
  return personSchema.parse({
    ...row,
    email: row.email ?? "",
  });
}

export async function listRelationships(): Promise<Relationship[]> {
  const rows = await db
    .select()
    .from(relationships)
    .orderBy(desc(relationships.createdAt));
  return rows.map(mapRowToRelationship);
}

export async function getRelationshipById(
  id: string,
): Promise<Relationship | null> {
  const row = await db.query.relationships.findFirst({
    where: eq(relationships.id, id),
  });
  return row ? mapRowToRelationship(row) : null;
}

export type CreateRelationshipResult = {
  data: Relationship;
  warnings: string[];
};

export async function createRelationship(
  input: unknown,
): Promise<CreateRelationshipResult> {
  const parsed = relationshipCreateSchema.parse(input);
  const { type, fromPersonId, toPersonId } = parsed;

  if (fromPersonId === toPersonId) {
    throw new RelationshipSelfReferenceError();
  }

  await requirePerson(fromPersonId);
  await requirePerson(toPersonId);

  if (type === "spouse") {
    const dup = await findDuplicateSpouse(fromPersonId, toPersonId);
    if (dup) {
      throw new RelationshipDuplicateError();
    }
  } else {
    const dup = await findDuplicateParent(fromPersonId, toPersonId);
    if (dup) {
      throw new RelationshipDuplicateError();
    }
    const n = await countParentsOfChild(toPersonId);
    if (n >= 2) {
      throw new RelationshipTooManyParentsError();
    }
    const cycle = await wouldCreateParentCycle(fromPersonId, toPersonId);
    if (cycle) {
      throw new RelationshipCycleError();
    }
  }

  const warnings: string[] = [];
  if (type === "parent") {
    const parent = await getPersonByIdForRel(fromPersonId);
    const child = await getPersonByIdForRel(toPersonId);
    if (parent && child) {
      warnings.push(...parentChildAgeWarnings(parent, child));
    }
  }

  const id = randomUUID();
  await db.insert(relationships).values({
    id,
    type,
    fromPersonId,
    toPersonId,
    marriageDate: parsed.marriageDate ?? null,
    divorceDate: parsed.divorceDate ?? null,
    isCurrentSpouse: parsed.isCurrentSpouse ?? null,
    notes: parsed.notes ?? null,
  });

  const created = await getRelationshipById(id);
  if (!created) {
    throw new Error("Не удалось прочитать созданную связь");
  }
  return { data: created, warnings };
}

export async function updateRelationship(
  id: string,
  input: unknown,
): Promise<Relationship> {
  const existing = await db.query.relationships.findFirst({
    where: eq(relationships.id, id),
  });
  if (!existing) {
    throw new RelationshipNotFoundError(id);
  }

  const patch = relationshipUpdateSchema.parse(input);
  const updates: Partial<typeof relationships.$inferInsert> = {};

  if (patch.marriageDate !== undefined) {
    updates.marriageDate = patch.marriageDate;
  }
  if (patch.divorceDate !== undefined) {
    updates.divorceDate = patch.divorceDate;
  }
  if (patch.isCurrentSpouse !== undefined) {
    updates.isCurrentSpouse = patch.isCurrentSpouse;
  }
  if (patch.notes !== undefined) {
    updates.notes = patch.notes;
  }

  if (Object.keys(updates).length === 0) {
    return mapRowToRelationship(existing);
  }

  await db
    .update(relationships)
    .set(updates)
    .where(eq(relationships.id, id));

  const updated = await getRelationshipById(id);
  if (!updated) {
    throw new RelationshipNotFoundError(id);
  }
  return updated;
}

export async function deleteRelationship(id: string): Promise<void> {
  const existing = await db.query.relationships.findFirst({
    where: eq(relationships.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new RelationshipNotFoundError(id);
  }
  await db.delete(relationships).where(eq(relationships.id, id));
}
