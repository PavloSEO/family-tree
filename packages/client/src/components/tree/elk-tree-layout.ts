import type { TreeEdge, TreeResponse } from "@family-tree/shared";
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import { NODE_H, NODE_W } from "./tree-graph-build.js";

const COMPOUND_PREFIX = "compound__";

class UnionFind {
  private readonly parent = new Map<string, string>();

  constructor(ids: readonly string[]) {
    for (const id of ids) {
      this.parent.set(id, id);
    }
  }

  find(a: string): string {
    let root = a;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }
    let x = a;
    while (x !== root) {
      const next = this.parent.get(x)!;
      this.parent.set(x, root);
      x = next;
    }
    return root;
  }

  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) {
      this.parent.set(rb, ra);
    }
  }

  /** Группы с ≥2 участниками — пары/цепочки супругов. */
  spouseGroupsOfSizeAtLeast2(ids: readonly string[]): string[][] {
    const buckets = new Map<string, string[]>();
    for (const id of ids) {
      const r = this.find(id);
      const list = buckets.get(r) ?? [];
      list.push(id);
      buckets.set(r, list);
    }
    return [...buckets.values()]
      .filter((g) => g.length >= 2)
      .map((g) => [...new Set(g)].sort());
  }
}

function compoundIdForGroup(sortedIds: string[]): string {
  return `${COMPOUND_PREFIX}${sortedIds.join("__")}`;
}

function collectPersonPositions(
  node: ElkNode,
  offsetX: number,
  offsetY: number,
  out: Map<string, { x: number; y: number }>,
): void {
  const x = offsetX + (node.x ?? 0);
  const y = offsetY + (node.y ?? 0);
  if (node.children && node.children.length > 0) {
    for (const ch of node.children) {
      collectPersonPositions(ch, x, y, out);
    }
    return;
  }
  if (!node.id.startsWith(COMPOUND_PREFIX)) {
    out.set(node.id, { x, y });
  }
}

const ROOT_LAYOUT: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",
  "elk.layered.spacing.nodeNodeBetweenLayers": "120",
  "elk.spacing.nodeNode": "50",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
};

const COUPLE_LAYOUT: Record<string, string> = {
  "elk.algorithm": "box",
  "elk.direction": "RIGHT",
  "elk.spacing.nodeNode": "20",
  "elk.padding": "[top=8,left=8,bottom=8,right=8]",
};

function buildElkGraph(data: TreeResponse): ElkNode {
  const { nodes: treeNodes, edges: treeEdges } = data;
  const ids = treeNodes.map((n) => n.id);
  const uf = new UnionFind(ids);
  for (const e of treeEdges) {
    if (e.type === "spouse") {
      uf.union(e.source, e.target);
    }
  }
  const spouseGroups = uf.spouseGroupsOfSizeAtLeast2(ids);
  const inCouple = new Set<string>();
  for (const g of spouseGroups) {
    for (const id of g) {
      inCouple.add(id);
    }
  }

  const elkChildren: ElkNode[] = [];

  for (const group of spouseGroups) {
    const cid = compoundIdForGroup(group);
    elkChildren.push({
      id: cid,
      layoutOptions: COUPLE_LAYOUT,
      children: group.map((id) => ({
        id,
        width: NODE_W,
        height: NODE_H,
      })),
    });
  }

  for (const n of treeNodes) {
    if (!inCouple.has(n.id)) {
      elkChildren.push({
        id: n.id,
        width: NODE_W,
        height: NODE_H,
      });
    }
  }

  const elkEdges: ElkExtendedEdge[] = [];
  for (const e of treeEdges) {
    if (e.type !== "parent") {
      continue;
    }
    elkEdges.push({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    });
  }

  return {
    id: "elk-root",
    layoutOptions: ROOT_LAYOUT,
    children: elkChildren,
    edges: elkEdges,
  };
}

/**
 * Раскладка графа родства в ELK (layered DOWN + compound для супругов).
 * Возвращает абсолютные координаты левого верхнего угла каждой персоны.
 */
export async function runElkPersonLayout(
  data: TreeResponse,
): Promise<Map<string, { x: number; y: number }>> {
  const graph = buildElkGraph(data);
  const elk = new ELK();
  const laidOut = await elk.layout(graph);
  const out = new Map<string, { x: number; y: number }>();
  collectPersonPositions(laidOut, 0, 0, out);
  return out;
}
