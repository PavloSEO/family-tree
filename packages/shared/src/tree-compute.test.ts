import { describe, expect, it } from "vitest";
import type { RelationshipGraphEdge } from "./tree-compute.js";
import {
  collectConnectedPersonIds,
  findShortestPath,
  getRelationshipLabel,
  kinshipStepsToLabel,
  pathToKinshipSteps,
  stepsKey,
} from "./tree-compute.js";

const ids = {
  a: "10000000-0000-4000-8000-000000000001",
  b: "10000000-0000-4000-8000-000000000002",
  c: "10000000-0000-4000-8000-000000000003",
  d: "10000000-0000-4000-8000-000000000004",
} as const;

describe("findShortestPath", () => {
  it("возвращает одну вершину для совпадения from и to", () => {
    const rels: RelationshipGraphEdge[] = [];
    expect(findShortestPath(ids.a, ids.a, rels)).toEqual([ids.a]);
  });

  it("находит прямого родителя", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
    ];
    expect(findShortestPath(ids.a, ids.b, rels)).toEqual([ids.a, ids.b]);
  });

  it("находит дедушку (два шага вверх)", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
      { type: "parent", fromPersonId: ids.c, toPersonId: ids.b },
    ];
    expect(findShortestPath(ids.a, ids.c, rels)).toEqual([ids.a, ids.b, ids.c]);
  });

  it("учитывает супружеское ребро в обе стороны", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
      { type: "spouse", fromPersonId: ids.b, toPersonId: ids.c },
    ];
    expect(findShortestPath(ids.a, ids.c, rels)).toEqual([ids.a, ids.b, ids.c]);
  });

  it("возвращает null при отсутствии связи", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
    ];
    expect(findShortestPath(ids.a, ids.d, rels)).toBeNull();
  });
});

describe("pathToKinshipSteps", () => {
  it("классифицирует шаг к родителю и к ребёнку", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
      { type: "parent", fromPersonId: ids.c, toPersonId: ids.b },
    ];
    const path = [ids.a, ids.b, ids.c];
    expect(stepsKey(pathToKinshipSteps(path, rels))).toBe("to_parent,to_parent");
  });

  it("классифицирует супруга", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "spouse", fromPersonId: ids.a, toPersonId: ids.b },
    ];
    expect(stepsKey(pathToKinshipSteps([ids.a, ids.b], rels))).toBe("spouse");
  });
});

describe("kinshipStepsToLabel", () => {
  it("отец / мать", () => {
    expect(
      kinshipStepsToLabel(["to_parent"], {
        subjectGender: "male",
        targetGender: "male",
      }),
    ).toBe("отец");
    expect(
      kinshipStepsToLabel(["to_parent"], {
        subjectGender: "male",
        targetGender: "female",
      }),
    ).toBe("мать");
  });

  it("сын / дочь", () => {
    expect(
      kinshipStepsToLabel(["to_child"], {
        subjectGender: "female",
        targetGender: "male",
      }),
    ).toBe("сын");
  });

  it("брат / сестра (общий родитель)", () => {
    expect(
      kinshipStepsToLabel(["to_parent", "to_child"], {
        subjectGender: "male",
        targetGender: "female",
      }),
    ).toBe("сестра");
  });
});

describe("getRelationshipLabel", () => {
  it("склеивает путь и рёбра", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
    ];
    const path = [ids.a, ids.b];
    expect(
      getRelationshipLabel(path, rels, {
        subjectGender: "male",
        targetGender: "female",
      }),
    ).toBe("мать");
  });
});

describe("collectConnectedPersonIds", () => {
  it("собирает компоненту", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
      { type: "spouse", fromPersonId: ids.c, toPersonId: ids.d },
    ];
    const s = collectConnectedPersonIds(ids.a, rels);
    expect(s.has(ids.a)).toBe(true);
    expect(s.has(ids.b)).toBe(true);
    expect(s.has(ids.c)).toBe(false);
  });
});
