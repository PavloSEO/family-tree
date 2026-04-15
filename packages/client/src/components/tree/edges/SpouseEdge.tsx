import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

/** Супруги: две параллельные линии, primary (`docs/08-tree-visualization.md`). */
export function SpouseEdge({
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
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * 2.5;
  const oy = (dx / len) * 2.5;
  const stroke = "var(--md-sys-color-primary)";

  return (
    <g>
      <g transform={`translate(${ox},${oy})`}>
        <BaseEdge id={`${id}-a`} path={path} style={{ stroke, strokeWidth: 2 }} />
      </g>
      <g transform={`translate(${-ox},${-oy})`}>
        <BaseEdge id={`${id}-b`} path={path} style={{ stroke, strokeWidth: 2 }} />
      </g>
    </g>
  );
}
