import type { TreeResponse } from "@family-tree/shared";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type EdgeTypes,
  type NodeTypes,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ExternalTreeEdge } from "./edges/ExternalTreeEdge.js";
import { ParentTreeEdge } from "./edges/ParentTreeEdge.js";
import { SpouseEdge } from "./edges/SpouseEdge.js";
import { DeadPersonNode } from "./nodes/DeadPersonNode.js";
import { ExternalNode } from "./nodes/ExternalNode.js";
import { PersonNode } from "./nodes/PersonNode.js";
import { NODE_H, NODE_W } from "./tree-graph-build.js";
import type { TreePersonNodeData } from "./tree-node-data.js";
import { treeResponseWithoutExternalNodes } from "./tree-collapse-external.js";
import { findFirstMatchingPersonId } from "./tree-search-match.js";
import { useAuth } from "../../providers/AuthProvider.js";
import { TreeControls } from "./TreeControls.js";
import { TreeFilters } from "./TreeFilters.js";
import { useTreeLayout } from "./useTreeLayout.js";

const nodeTypes = {
  person: PersonNode,
  deadPerson: DeadPersonNode,
  external: ExternalNode,
} satisfies NodeTypes;

const edgeTypes = {
  parentTree: ParentTreeEdge,
  spouse: SpouseEdge,
  externalTree: ExternalTreeEdge,
} satisfies EdgeTypes;

const NODE_CLICK_NAV_DELAY_MS = 260;

function FamilyTreeCanvas({
  data,
  findQuery,
}: {
  data: TreeResponse;
  findQuery: string;
}) {
  const { t } = useTranslation("tree");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navigateClickTimer = useRef<number | undefined>(undefined);
  const { user } = useAuth();
  const canToggleExternalBranches = user?.role === "admin";

  const hasExternalInResponse = useMemo(
    () => data.nodes.some((n) => n.isExternal),
    [data.nodes],
  );
  const [externalExpanded, setExternalExpanded] = useState(false);

  useEffect(() => {
    setExternalExpanded(false);
  }, [data]);

  useEffect(() => {
    if (!canToggleExternalBranches) {
      setExternalExpanded(false);
    }
  }, [canToggleExternalBranches, data]);

  useEffect(() => {
    return () => {
      if (navigateClickTimer.current !== undefined) {
        clearTimeout(navigateClickTimer.current);
      }
    };
  }, []);

  const layoutData = useMemo(() => {
    if (!hasExternalInResponse || externalExpanded) {
      return data;
    }
    return treeResponseWithoutExternalNodes(data);
  }, [data, externalExpanded, hasExternalInResponse]);

  const { nodes: laidOutNodes, edges: laidOutEdges } = useTreeLayout(layoutData);
  const matchId = useMemo(
    () => findFirstMatchingPersonId(layoutData.nodes, findQuery),
    [layoutData.nodes, findQuery],
  );
  const laidOutWithHighlight = useMemo(
    () =>
      laidOutNodes.map((n) => ({
        ...n,
        data: {
          ...(n.data as TreePersonNodeData),
          isHighlighted: n.id === matchId,
        },
      })),
    [laidOutNodes, matchId],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(laidOutWithHighlight);
  const [edges, setEdges, onEdgesChange] = useEdgesState(laidOutEdges);
  const { fitView, getNode, setCenter } = useReactFlow();

  useEffect(() => {
    setNodes(laidOutWithHighlight);
    setEdges(laidOutEdges);
  }, [laidOutWithHighlight, laidOutEdges, setNodes, setEdges]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 200 });
    });
    return () => {
      cancelAnimationFrame(t);
    };
  }, [layoutData, fitView, nodes.length, edges.length]);

  useEffect(() => {
    const q = findQuery.trim();
    if (!q) {
      return;
    }
    const id = findFirstMatchingPersonId(layoutData.nodes, q);
    if (!id) {
      return;
    }
    const handle = window.setTimeout(() => {
      const node = getNode(id);
      if (!node) {
        return;
      }
      const w = node.width ?? NODE_W;
      const h = node.height ?? NODE_H;
      void setCenter(node.position.x + w / 2, node.position.y + h / 2, {
        duration: 300,
        zoom: 1.05,
      });
    }, 80);
    return () => {
      clearTimeout(handle);
    };
  }, [findQuery, layoutData.nodes, nodes, getNode, setCenter]);

  const onNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      if (navigateClickTimer.current !== undefined) {
        clearTimeout(navigateClickTimer.current);
      }
      navigateClickTimer.current = window.setTimeout(() => {
        navigateClickTimer.current = undefined;
        navigate(`/person/${node.id}`);
      }, NODE_CLICK_NAV_DELAY_MS);
    },
    [navigate],
  );

  const onNodeDoubleClick = useCallback(
    (_: MouseEvent, node: Node) => {
      if (navigateClickTimer.current !== undefined) {
        clearTimeout(navigateClickTimer.current);
        navigateClickTimer.current = undefined;
      }
      const qs = searchParams.toString();
      navigate(qs.length > 0 ? `/tree/${node.id}?${qs}` : `/tree/${node.id}`);
    },
    [navigate, searchParams],
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        className="h-full w-full"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background gap={20} color="var(--md-sys-color-outline-variant)" />
        <Controls />
        <MiniMap
          className="!rounded-lg !border !border-[var(--md-sys-color-outline-variant)]"
          maskColor="rgba(180, 180, 180, 0.4)"
          nodeStrokeWidth={2}
          nodeColor={(n) => {
            switch (n.type) {
              case "person":
                return "var(--md-sys-color-primary)";
              case "deadPerson":
                return "var(--md-sys-color-outline)";
              case "external":
                return "var(--md-sys-color-outline-variant)";
              default:
                return "var(--md-sys-color-outline)";
            }
          }}
        />
      </ReactFlow>
      <div className="pointer-events-none absolute inset-0 z-10 flex justify-center overflow-y-auto p-2">
        <div className="pointer-events-auto flex w-full max-w-[min(100%,56rem)] flex-col gap-2 self-start">
          <TreeControls />
          <TreeFilters />
          {hasExternalInResponse && canToggleExternalBranches ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] px-3 py-2">
              <span className="md-typescale-label-large text-[var(--md-sys-color-on-surface-variant)]">
                {externalExpanded
                  ? t("externalBranchesShown")
                  : t("externalBranchesHidden")}
              </span>
              {externalExpanded ? (
                <md-icon-button
                  title={t("hideExternalAncestors")}
                  aria-label={t("hideExternalAncestors")}
                  onClick={() => {
                    setExternalExpanded(false);
                  }}
                >
                  <md-icon className="material-symbols-outlined">remove</md-icon>
                </md-icon-button>
              ) : (
                <md-icon-button
                  title={t("showExternalAncestors")}
                  aria-label={t("showExternalAncestors")}
                  onClick={() => {
                    setExternalExpanded(true);
                  }}
                >
                  <md-icon className="material-symbols-outlined">add</md-icon>
                </md-icon-button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FamilyTree({
  data,
  findQuery = "",
}: {
  data: TreeResponse;
  findQuery?: string;
}) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <FamilyTreeCanvas data={data} findQuery={findQuery} />
      </ReactFlowProvider>
    </div>
  );
}
