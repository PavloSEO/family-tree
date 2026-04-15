import type { TreeResponse } from "@family-tree/shared";

/** Subgraph without external persons (client “external collapsed” mode). */
export function treeResponseWithoutExternalNodes(
  data: TreeResponse,
): TreeResponse {
  const keepIds = new Set(
    data.nodes.filter((n) => !n.isExternal).map((n) => n.id),
  );
  const nodes = data.nodes.filter((n) => !n.isExternal);
  const edges = data.edges.filter(
    (e) => keepIds.has(e.source) && keepIds.has(e.target),
  );
  return { ...data, nodes, edges };
}
