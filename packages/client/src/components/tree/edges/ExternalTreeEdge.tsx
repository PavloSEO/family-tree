import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

/** External branch: dashed edge (`docs/08-tree-visualization.md`). */
export function ExternalTreeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: "var(--md-sys-color-outline-variant)",
        strokeWidth: 2,
        strokeDasharray: "6 4",
      }}
    />
  );
}
