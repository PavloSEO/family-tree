import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

/** Родитель → ребёнок: сплошная линия 2px (`docs/08-tree-visualization.md`). */
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
