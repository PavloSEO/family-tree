import type { TreeEdge, TreeNode, TreeResponse } from "@family-tree/shared";
import type { Edge, Node } from "@xyflow/react";

export const NODE_W = 160;
export const NODE_H = 120;

const SIMPLE_GAP_X = 220;
const SIMPLE_GAP_Y = 130;

function computeParentRanks(rootId: string, edges: TreeEdge[]): Map<string, number> {
  const rank = new Map<string, number>();
  rank.set(rootId, 0);
  const parentEdges = edges.filter((e) => e.type === "parent");
  const maxIter = Math.max(parentEdges.length, 1) + 4;
  for (let i = 0; i < maxIter; i++) {
    for (const e of parentEdges) {
      const rp = rank.get(e.source);
      const rc = rank.get(e.target);
      if (rp != null && (rc == null || rc > rp + 1)) {
        rank.set(e.target, rp + 1);
      }
      if (rc != null && (rp == null || rp < rc - 1)) {
        rank.set(e.source, rc - 1);
      }
    }
  }
  return rank;
}

function assignSpouseRanks(rank: Map<string, number>, edges: TreeEdge[]): void {
  const spouseEdges = edges.filter((e) => e.type === "spouse");
  const maxIter = Math.max(spouseEdges.length, 1) + 4;
  for (let i = 0; i < maxIter; i++) {
    for (const e of spouseEdges) {
      const ra = rank.get(e.source);
      const rb = rank.get(e.target);
      if (ra != null && rb == null) {
        rank.set(e.target, ra);
      } else if (rb != null && ra == null) {
        rank.set(e.source, rb);
      }
    }
  }
}

function isDeadPerson(n: TreeNode): boolean {
  return Boolean(n.dateOfDeath && String(n.dateOfDeath).trim().length > 0);
}

export function flowNodeType(n: TreeNode): "person" | "deadPerson" | "external" {
  if (n.isExternal) {
    return "external";
  }
  if (isDeadPerson(n)) {
    return "deadPerson";
  }
  return "person";
}

export function flowEdgeType(e: TreeEdge): "parentTree" | "spouse" | "externalTree" {
  if (e.isExternal) {
    return "externalTree";
  }
  if (e.type === "spouse") {
    return "spouse";
  }
  return "parentTree";
}

/** Простая сетка по рангам (fallback без ELK). */
export function simpleRankPositionMap(data: TreeResponse): Map<string, { x: number; y: number }> {
  const { nodes: treeNodes, edges: treeEdges, rootId } = data;
  const rank = computeParentRanks(rootId, treeEdges);
  assignSpouseRanks(rank, treeEdges);

  const byRank = new Map<number, TreeNode[]>();
  for (const n of treeNodes) {
    const r = rank.get(n.id) ?? 0;
    const list = byRank.get(r) ?? [];
    list.push(n);
    byRank.set(r, list);
  }

  const ranks = [...byRank.keys()].sort((a, b) => a - b);
  const minR = ranks.length > 0 ? Math.min(...ranks) : 0;
  const pos = new Map<string, { x: number; y: number }>();

  for (const r of ranks) {
    const list = (byRank.get(r) ?? []).sort((a, b) =>
      a.lastName !== b.lastName
        ? a.lastName.localeCompare(b.lastName, "ru")
        : a.firstName.localeCompare(b.firstName, "ru"),
    );
    list.forEach((n, i) => {
      pos.set(n.id, {
        x: i * SIMPLE_GAP_X,
        y: (r - minR) * SIMPLE_GAP_Y,
      });
    });
  }
  return pos;
}

export function buildTreeNodes(
  data: TreeResponse,
  positions: Map<string, { x: number; y: number }>,
): Node[] {
  const { nodes: treeNodes, rootId } = data;
  return treeNodes.map((n) => {
    const p = positions.get(n.id) ?? { x: 0, y: 0 };
    return {
      id: n.id,
      type: flowNodeType(n),
      position: { x: p.x, y: p.y },
      width: NODE_W,
      height: NODE_H,
      data: {
        firstName: n.firstName,
        lastName: n.lastName,
        dateOfBirth: n.dateOfBirth,
        dateOfDeath: n.dateOfDeath,
        mainPhoto: n.mainPhoto,
        country: n.country,
        isRoot: n.id === rootId,
      },
    };
  });
}

export function buildTreeEdges(data: TreeResponse, nodes: Node[]): Edge[] {
  const posById = new Map(nodes.map((n) => [n.id, n.position]));
  const { edges: treeEdges } = data;

  return treeEdges.map((e) => {
    const t = flowEdgeType(e);
    const edge: Edge = {
      id: e.id,
      source: e.source,
      target: e.target,
      type: t,
      zIndex: e.type === "spouse" && !e.isExternal ? 2 : 0,
    };

    if (t === "parentTree") {
      edge.sourceHandle = "pb";
      edge.targetHandle = "pt";
    } else if (t === "spouse") {
      const ps = posById.get(e.source);
      const pt = posById.get(e.target);
      if (ps && pt) {
        if (ps.x <= pt.x) {
          edge.sourceHandle = "sr";
          edge.targetHandle = "sl";
        } else {
          edge.sourceHandle = "sl";
          edge.targetHandle = "sr";
        }
      }
    }

    return edge;
  });
}

export function treeResponseToFlowElements(data: TreeResponse): {
  nodes: Node[];
  edges: Edge[];
} {
  const pos = simpleRankPositionMap(data);
  const nodes = buildTreeNodes(data, pos);
  const edges = buildTreeEdges(data, nodes);
  return { nodes, edges };
}
