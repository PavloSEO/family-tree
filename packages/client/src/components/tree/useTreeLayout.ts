import type { TreeResponse } from "@family-tree/shared";
import type { Edge, Node } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { runElkPersonLayout } from "./elk-tree-layout.js";
import {
  buildTreeEdges,
  buildTreeNodes,
  treeResponseToFlowElements,
} from "./tree-graph-build.js";

/**
 * ELK-раскладка дерева (этап 31). При ошибке или пустом результате — сетка по рангам (как на этапе 29–30).
 */
export function useTreeLayout(data: TreeResponse): {
  nodes: Node[];
  edges: Edge[];
  layoutError: Error | null;
} {
  const fallback = useMemo(() => treeResponseToFlowElements(data), [data]);
  const [elkPositions, setElkPositions] = useState<Map<
    string,
    { x: number; y: number }
  > | null>(null);
  const [layoutError, setLayoutError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setElkPositions(null);
    setLayoutError(null);
    void runElkPersonLayout(data)
      .then((pos) => {
        if (!cancelled && pos.size > 0) {
          setElkPositions(pos);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLayoutError(e instanceof Error ? e : new Error(String(e)));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [data]);

  return useMemo(() => {
    if (layoutError != null || elkPositions == null || elkPositions.size === 0) {
      return {
        nodes: fallback.nodes,
        edges: fallback.edges,
        layoutError,
      };
    }
    const nodes = buildTreeNodes(data, elkPositions);
    const edges = buildTreeEdges(data, nodes);
    return { nodes, edges, layoutError: null };
  }, [data, elkPositions, layoutError, fallback]);
}
