import type { TreeResponse } from "@family-tree/shared";

/** Подграф без внешних персон (для режима «внешние свернуты» на клиенте). */
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
