import type { Person, Relationship, TreeEdge, TreeNode, TreeQuery } from "@family-tree/shared";
import { personSchema, treeQuerySchema } from "@family-tree/shared";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db/connection.js";
import { persons } from "../db/schema.js";
import { listRelationships } from "./relationship.service.js";

export class TreeRootNotFoundError extends Error {
  readonly code = "TREE_ROOT_NOT_FOUND";

  constructor(id: string) {
    super(`Карточка не найдена: ${id}`);
    this.name = "TreeRootNotFoundError";
  }
}

export class TreeRootFilteredOutError extends Error {
  readonly code = "TREE_ROOT_FILTERED_OUT";

  constructor() {
    super("Корневая карточка не подходит под выбранные фильтры");
    this.name = "TreeRootFilteredOutError";
  }
}

function parentsOf(rels: Relationship[], childId: string): string[] {
  return rels
    .filter((r) => r.type === "parent" && r.toPersonId === childId)
    .map((r) => r.fromPersonId);
}

function childrenOf(rels: Relationship[], parentId: string): string[] {
  return rels
    .filter((r) => r.type === "parent" && r.fromPersonId === parentId)
    .map((r) => r.toPersonId);
}

function spousesOf(rels: Relationship[], personId: string): string[] {
  const out: string[] = [];
  for (const r of rels) {
    if (r.type !== "spouse") {
      continue;
    }
    if (r.fromPersonId === personId) {
      out.push(r.toPersonId);
    } else if (r.toPersonId === personId) {
      out.push(r.fromPersonId);
    }
  }
  return out;
}

function expandUpBfs(
  rels: Relationship[],
  startIds: Iterable<string>,
  maxDepth: number,
  acceptParent: (parentId: string) => boolean,
): Set<string> {
  const collected = new Set<string>(startIds);
  let frontier = new Set<string>(startIds);
  for (let d = 0; d < maxDepth; d++) {
    const next = new Set<string>();
    for (const cid of frontier) {
      for (const pid of parentsOf(rels, cid)) {
        if (!acceptParent(pid)) {
          continue;
        }
        if (!collected.has(pid)) {
          collected.add(pid);
          next.add(pid);
        }
      }
    }
    frontier = next;
    if (frontier.size === 0) {
      break;
    }
  }
  return collected;
}

function expandDownBfs(
  rels: Relationship[],
  startIds: Iterable<string>,
  maxDepth: number,
): Set<string> {
  const collected = new Set<string>(startIds);
  let frontier = new Set<string>(startIds);
  for (let d = 0; d < maxDepth; d++) {
    const next = new Set<string>();
    for (const pid of frontier) {
      for (const cid of childrenOf(rels, pid)) {
        if (!collected.has(cid)) {
          collected.add(cid);
          next.add(cid);
        }
      }
    }
    frontier = next;
    if (frontier.size === 0) {
      break;
    }
  }
  return collected;
}

function spouseClosure(rels: Relationship[], s: Set<string>): void {
  let guard = 0;
  let added = true;
  while (added && guard++ < 100) {
    added = false;
    const snap = [...s];
    for (const p of snap) {
      for (const sp of spousesOf(rels, p)) {
        if (!s.has(sp)) {
          s.add(sp);
          added = true;
        }
      }
    }
  }
}

function passesCoreFilters(p: Person | undefined, q: TreeQuery): boolean {
  if (!p) {
    return false;
  }
  if (q.country != null && p.country !== q.country) {
    return false;
  }
  if (q.aliveOnly) {
    const d = p.dateOfDeath;
    if (d != null && String(d).trim().length > 0) {
      return false;
    }
  }
  return true;
}

async function loadPersonMap(ids: Set<string>): Promise<Map<string, Person>> {
  if (ids.size === 0) {
    return new Map();
  }
  const rows = await db
    .select()
    .from(persons)
    .where(inArray(persons.id, [...ids]));
  const m = new Map<string, Person>();
  for (const row of rows) {
    m.set(
      row.id,
      personSchema.parse({
        ...row,
        email: row.email ?? "",
      }),
    );
  }
  return m;
}

function collectCorePersonIds(
  rootId: string,
  rels: Relationship[],
  q: TreeQuery,
  personById: Map<string, Person>,
): Set<string> {
  let core = new Set<string>();

  switch (q.mode) {
    case "ancestors": {
      core = expandUpBfs(rels, [rootId], q.depthUp, () => true);
      spouseClosure(rels, core);
      break;
    }
    case "descendants": {
      core = expandDownBfs(rels, [rootId], q.depthDown);
      spouseClosure(rels, core);
      break;
    }
    case "full": {
      const up = expandUpBfs(rels, [rootId], q.depthUp, () => true);
      const down = expandDownBfs(rels, [rootId], q.depthDown);
      core = new Set([...up, ...down]);
      spouseClosure(rels, core);
      break;
    }
    case "family": {
      core.add(rootId);
      for (const p of parentsOf(rels, rootId)) {
        core.add(p);
      }
      for (const c of childrenOf(rels, rootId)) {
        core.add(c);
      }
      spouseClosure(rels, core);
      break;
    }
    case "paternal": {
      core = expandUpBfs(rels, [rootId], q.depthUp, (pid) => {
        const p = personById.get(pid);
        return p?.gender === "male";
      });
      spouseClosure(rels, core);
      break;
    }
    case "maternal": {
      core = expandUpBfs(rels, [rootId], q.depthUp, (pid) => {
        const p = personById.get(pid);
        return p?.gender === "female";
      });
      spouseClosure(rels, core);
      break;
    }
    case "direct": {
      core.add(rootId);
      let cur = rootId;
      for (let d = 0; d < q.depthUp; d++) {
        const pars = parentsOf(rels, cur);
        const male = pars.filter((id) => personById.get(id)?.gender === "male");
        const next = male[0] ?? pars[0];
        if (!next) {
          break;
        }
        core.add(next);
        cur = next;
      }
      break;
    }
  }

  return new Set(
    [...core].filter((id) => passesCoreFilters(personById.get(id), q)),
  );
}

function expandExternalAncestors(
  rels: Relationship[],
  core: Set<string>,
  externalDepth: number,
): Set<string> {
  const external = new Set<string>();
  for (const p of core) {
    for (const s of spousesOf(rels, p)) {
      if (!core.has(s)) {
        external.add(s);
      }
    }
  }
  let frontier = new Set(external);
  for (let d = 0; d < externalDepth; d++) {
    const next = new Set<string>();
    for (const id of frontier) {
      for (const par of parentsOf(rels, id)) {
        if (core.has(par) || external.has(par)) {
          continue;
        }
        external.add(par);
        next.add(par);
      }
    }
    frontier = next;
    if (frontier.size === 0) {
      break;
    }
  }
  return external;
}

function buildGraphEdges(
  rels: Relationship[],
  nodeIds: Set<string>,
  external: Set<string>,
): TreeEdge[] {
  const out: TreeEdge[] = [];
  for (const r of rels) {
    if (r.type === "parent") {
      const a = r.fromPersonId;
      const b = r.toPersonId;
      if (!nodeIds.has(a) || !nodeIds.has(b)) {
        continue;
      }
      const ext = external.has(a) || external.has(b);
      out.push({
        id: r.id,
        source: a,
        target: b,
        type: "parent",
        isExternal: ext,
      });
    } else {
      const a = r.fromPersonId;
      const b = r.toPersonId;
      if (!nodeIds.has(a) || !nodeIds.has(b)) {
        continue;
      }
      const ext = external.has(a) || external.has(b);
      out.push({
        id: r.id,
        source: a,
        target: b,
        type: "spouse",
        isExternal: ext,
      });
    }
  }
  return out;
}

function toTreeNode(p: Person, isExternal: boolean): TreeNode {
  return {
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth ?? null,
    dateOfDeath: p.dateOfDeath ?? null,
    mainPhoto: p.mainPhoto ?? null,
    country: p.country ?? null,
    isExternal,
  };
}

export async function getTreeSubgraph(
  rootId: string,
  queryInput: Record<string, string | undefined>,
): Promise<{ nodes: TreeNode[]; edges: TreeEdge[]; rootId: string }> {
  const q = treeQuerySchema.parse(queryInput);

  const rootRow = await db.query.persons.findFirst({
    where: eq(persons.id, rootId),
  });
  if (!rootRow) {
    throw new TreeRootNotFoundError(rootId);
  }

  const rels = await listRelationships();
  const allIds = new Set<string>([rootId]);
  for (const r of rels) {
    allIds.add(r.fromPersonId);
    allIds.add(r.toPersonId);
  }
  let personById = await loadPersonMap(allIds);

  let core = collectCorePersonIds(rootId, rels, q, personById);
  if (!core.has(rootId)) {
    throw new TreeRootFilteredOutError();
  }

  let external = new Set<string>();
  if (q.showExternal) {
    external = expandExternalAncestors(rels, core, q.externalDepth);
  }

  const nodeIds = new Set<string>([...core, ...external]);
  const missing = [...nodeIds].filter((id) => !personById.has(id));
  if (missing.length > 0) {
    const extra = await loadPersonMap(new Set(missing));
    personById = new Map([...personById, ...extra]);
  }

  const nodes: TreeNode[] = [];
  for (const id of nodeIds) {
    const p = personById.get(id);
    if (!p) {
      continue;
    }
    nodes.push(toTreeNode(p, external.has(id)));
  }

  const edges = buildGraphEdges(rels, nodeIds, external);

  nodes.sort((a, b) => a.lastName.localeCompare(b.lastName, "ru") || a.firstName.localeCompare(b.firstName, "ru"));

  return { nodes, edges, rootId };
}
