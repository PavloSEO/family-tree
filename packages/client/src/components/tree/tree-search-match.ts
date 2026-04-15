import type { TreeNode } from "@family-tree/shared";
import { comparePersonNames } from "../../lib/app-locale.js";

/** Первое совпадение по подстроке в «Имя Фамилия» (детерминированный порядок). */
export function findFirstMatchingPersonId(
  nodes: readonly TreeNode[],
  needle: string,
): string | null {
  const q = needle.trim().toLowerCase();
  if (!q) {
    return null;
  }
  const sorted = [...nodes].sort((a, b) => comparePersonNames(a, b));
  for (const n of sorted) {
    const hay = `${n.firstName} ${n.lastName}`.toLowerCase();
    if (hay.includes(q)) {
      return n.id;
    }
  }
  return null;
}
