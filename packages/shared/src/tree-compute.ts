/**
 * Неориентированный граф родства: рёбра parent (родитель → ребёнок) и spouse
 * трактуются как двусторонние для поиска кратчайшего пути.
 */

export type RelationshipGraphEdge = {
  type: "parent" | "spouse";
  fromPersonId: string;
  toPersonId: string;
};

export type KinshipStep = "to_parent" | "to_child" | "spouse";

export type KinshipGender = "male" | "female";

/** Смежность для BFS по неориентированному графу родства. */
export function buildUndirectedAdjacency(
  relationships: RelationshipGraphEdge[],
): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  const add = (a: string, b: string) => {
    const la = adj.get(a) ?? [];
    la.push(b);
    adj.set(a, la);
  };
  for (const r of relationships) {
    if (r.type === "spouse") {
      add(r.fromPersonId, r.toPersonId);
      add(r.toPersonId, r.fromPersonId);
    } else {
      add(r.fromPersonId, r.toPersonId);
      add(r.toPersonId, r.fromPersonId);
    }
  }
  return adj;
}

function findRelBetween(
  a: string,
  b: string,
  rels: RelationshipGraphEdge[],
): RelationshipGraphEdge | undefined {
  for (const r of rels) {
    if (r.type === "spouse") {
      if (
        (r.fromPersonId === a && r.toPersonId === b) ||
        (r.fromPersonId === b && r.toPersonId === a)
      ) {
        return r;
      }
    } else if (
      (r.fromPersonId === a && r.toPersonId === b) ||
      (r.fromPersonId === b && r.toPersonId === a)
    ) {
      return r;
    }
  }
  return undefined;
}

/** Шаг по пути вершин `path[i] → path[i+1]`. */
export function pathToKinshipSteps(
  path: string[],
  relationships: RelationshipGraphEdge[],
): KinshipStep[] {
  if (path.length < 2) {
    return [];
  }
  const steps: KinshipStep[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i]!;
    const v = path[i + 1]!;
    const r = findRelBetween(u, v, relationships);
    if (!r) {
      throw new Error(`Нет связи между ${u} и ${v}`);
    }
    if (r.type === "spouse") {
      steps.push("spouse");
    } else if (r.fromPersonId === u && r.toPersonId === v) {
      steps.push("to_child");
    } else {
      steps.push("to_parent");
    }
  }
  return steps;
}

/**
 * Кратчайший путь по рёбрам (BFS). Возвращает список id включая концы
 * или `null`, если цели нет в компоненте связности.
 */
export function findShortestPath(
  fromPersonId: string,
  toPersonId: string,
  relationships: RelationshipGraphEdge[],
): string[] | null {
  if (fromPersonId === toPersonId) {
    return [fromPersonId];
  }
  const adj = buildUndirectedAdjacency(relationships);
  if (!adj.has(fromPersonId) || !adj.has(toPersonId)) {
    return null;
  }
  const prev = new Map<string, string | null>();
  prev.set(fromPersonId, null);
  const q: string[] = [fromPersonId];
  while (q.length > 0) {
    const u = q.shift()!;
    if (u === toPersonId) {
      break;
    }
    for (const v of adj.get(u) ?? []) {
      if (!prev.has(v)) {
        prev.set(v, u);
        q.push(v);
      }
    }
  }
  if (!prev.has(toPersonId)) {
    return null;
  }
  const path: string[] = [];
  let cur: string | null = toPersonId;
  while (cur != null) {
    path.push(cur);
    cur = prev.get(cur) ?? null;
  }
  path.reverse();
  return path;
}

function parentWord(g: KinshipGender): string {
  return g === "male" ? "отец" : "мать";
}

function childWord(g: KinshipGender): string {
  return g === "male" ? "сын" : "дочь";
}

function spouseWord(subject: KinshipGender, target: KinshipGender): string {
  if (subject === "male") {
    return target === "male" ? "муж" : "жена";
  }
  return target === "male" ? "муж" : "жена";
}

function grandparentWord(g: KinshipGender): string {
  return g === "male" ? "дедушка" : "бабушка";
}

function grandchildWord(g: KinshipGender): string {
  return g === "male" ? "внук" : "внучка";
}

function siblingWord(g: KinshipGender): string {
  return g === "male" ? "брат" : "сестра";
}

/** Сравнение цепочек шагов (для тестов и отладки). */
export function stepsKey(steps: KinshipStep[]): string {
  return steps.join(",");
}

/**
 * Русское обозначение родства относительно субъекта (владелец карточки)
 * к целевой персоне по кратчайшему пути.
 */
export function kinshipStepsToLabel(
  steps: KinshipStep[],
  opts: { subjectGender: KinshipGender; targetGender: KinshipGender },
): string {
  const { subjectGender: _sg, targetGender: tg } = opts;
  void _sg;
  const k = stepsKey(steps);

  const map: Record<string, string> = {
    "to_parent": parentWord(tg),
    "to_child": childWord(tg),
    spouse: spouseWord(opts.subjectGender, tg),
    "to_parent,to_parent": grandparentWord(tg),
    "to_child,to_child": grandchildWord(tg),
    "to_parent,to_child": siblingWord(tg),
    "to_child,to_parent": "родитель общего ребёнка",
    "spouse,to_parent": tg === "male" ? "свёкр / тесть" : "свекровь / тёща",
    "to_parent,spouse": "супруг(а) родителя",
    "to_child,spouse": tg === "male" ? "зять" : "невестка",
    "spouse,to_child": "ребёнок супруга",
  };

  if (map[k]) {
    return map[k]!;
  }

  if (steps.length === 0) {
    return "тот же человек";
  }

  return `Родственник (${steps.length} шаг.)`;
}

export function getRelationshipLabel(
  path: string[],
  relationships: RelationshipGraphEdge[],
  opts: { subjectGender: KinshipGender; targetGender: KinshipGender },
): string {
  if (path.length === 0) {
    return "—";
  }
  if (path.length === 1) {
    return "тот же человек";
  }
  const steps = pathToKinshipSteps(path, relationships);
  return kinshipStepsToLabel(steps, opts);
}

/** Все id в той же компоненте связности, что и `personId` (включая его). */
export function collectConnectedPersonIds(
  personId: string,
  relationships: RelationshipGraphEdge[],
): Set<string> {
  const adj = buildUndirectedAdjacency(relationships);
  const seen = new Set<string>();
  const stack = [personId];
  seen.add(personId);
  while (stack.length > 0) {
    const u = stack.pop()!;
    for (const v of adj.get(u) ?? []) {
      if (!seen.has(v)) {
        seen.add(v);
        stack.push(v);
      }
    }
  }
  return seen;
}
