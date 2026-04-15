import type { Person } from "@family-tree/shared";
import {
  collectConnectedPersonIds,
  findShortestPath,
  getRelationshipLabel,
  personSchema,
} from "@family-tree/shared";
import { inArray } from "drizzle-orm";
import { db } from "../db/connection.js";
import { persons } from "../db/schema.js";
import { getPersonById } from "./person.service.js";
import { listRelationships } from "./relationship.service.js";

export type PersonRelativeRow = {
  personId: string;
  relationshipLabel: string;
  displayName: string;
};

function displayName(p: Person): string {
  const parts = [p.firstName, p.lastName].filter(
    (s) => s != null && String(s).trim().length > 0,
  );
  return parts.join(" ").trim() || p.id;
}

/**
 * Список родственников в компоненте связности графа (parent + spouse),
 * с русской подписью по кратчайшему пути от `subjectId`.
 */
export async function listRelativesForPerson(
  subjectId: string,
): Promise<PersonRelativeRow[] | null> {
  const subject = await getPersonById(subjectId);
  if (!subject) {
    return null;
  }

  const rels = await listRelationships();
  const edges = rels.map((r) => ({
    type: r.type,
    fromPersonId: r.fromPersonId,
    toPersonId: r.toPersonId,
  }));

  const component = collectConnectedPersonIds(subjectId, edges);
  const otherIds = [...component].filter((id) => id !== subjectId);
  if (otherIds.length === 0) {
    return [];
  }

  const rows = await db
    .select()
    .from(persons)
    .where(inArray(persons.id, otherIds));

  const personById = new Map<string, Person>();
  for (const row of rows) {
    personById.set(
      row.id,
      personSchema.parse({
        ...row,
        email: row.email ?? "",
      }),
    );
  }

  const out: PersonRelativeRow[] = [];
  for (const oid of otherIds) {
    const target = personById.get(oid);
    if (!target) {
      continue;
    }
    const path = findShortestPath(subjectId, oid, edges);
    if (!path) {
      continue;
    }
    const relationshipLabel = getRelationshipLabel(path, edges, {
      subjectGender: subject.gender,
      targetGender: target.gender,
    });
    out.push({
      personId: oid,
      relationshipLabel,
      displayName: displayName(target),
    });
  }

  const collator = new Intl.Collator("ru");
  out.sort(
    (a, b) =>
      collator.compare(a.relationshipLabel, b.relationshipLabel) ||
      collator.compare(a.displayName, b.displayName),
  );
  return out;
}
