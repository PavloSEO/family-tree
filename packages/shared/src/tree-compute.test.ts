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
  it("returns single vertex when from equals to", () => {
    const rels: RelationshipGraphEdge[] = [];
    expect(findShortestPath(ids.a, ids.a, rels)).toEqual([ids.a]);
  });

  it("finds direct parent", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
    ];
    expect(findShortestPath(ids.a, ids.b, rels)).toEqual([ids.a, ids.b]);
  });

  it("finds grandparent (two steps up)", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
      { type: "parent", fromPersonId: ids.c, toPersonId: ids.b },
    ];
    expect(findShortestPath(ids.a, ids.c, rels)).toEqual([ids.a, ids.b, ids.c]);
  });

  it("traverses spouse edge in both directions", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
      { type: "spouse", fromPersonId: ids.b, toPersonId: ids.c },
    ];
    expect(findShortestPath(ids.a, ids.c, rels)).toEqual([ids.a, ids.b, ids.c]);
  });

  it("returns null when disconnected", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
    ];
    expect(findShortestPath(ids.a, ids.d, rels)).toBeNull();
  });
});

describe("pathToKinshipSteps", () => {
  it("classifies step to parent and to child", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "parent", fromPersonId: ids.b, toPersonId: ids.a },
      { type: "parent", fromPersonId: ids.c, toPersonId: ids.b },
    ];
    const path = [ids.a, ids.b, ids.c];
    expect(stepsKey(pathToKinshipSteps(path, rels))).toBe("to_parent,to_parent");
  });

  it("classifies spouse step", () => {
    const rels: RelationshipGraphEdge[] = [
      { type: "spouse", fromPersonId: ids.a, toPersonId: ids.b },
    ];
    expect(stepsKey(pathToKinshipSteps([ids.a, ids.b], rels))).toBe("spouse");
  });
});

describe("kinshipStepsToLabel", () => {
  it("father / mother", () => {
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

  it("son / daughter", () => {
    expect(
      kinshipStepsToLabel(["to_child"], {
        subjectGender: "female",
        targetGender: "male",
      }),
    ).toBe("сын");
  });

  it("brother / sister (shared parent)", () => {
    expect(
      kinshipStepsToLabel(["to_parent", "to_child"], {
        subjectGender: "male",
        targetGender: "female",
      }),
    ).toBe("сестра");
  });
});

describe("getRelationshipLabel", () => {
  it("combines path and edges", () => {
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
  it("collects connected component", () => {
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
