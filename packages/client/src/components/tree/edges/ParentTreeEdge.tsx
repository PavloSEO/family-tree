import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

/** Parent → child: solid 2px line (`docs/08-tree-visualization.md`). */
export function ParentTreeEdge({
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
        stroke: "var(--md-sys-color-outline)",
        strokeWidth: 2,
      }}
    />
  );
}
