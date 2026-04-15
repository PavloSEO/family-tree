import type { TreeNode } from "@family-tree/shared";

/** Первое совпадение по подстроке в «Имя Фамилия» (детерминированный порядок). */
export function findFirstMatchingPersonId(
  nodes: readonly TreeNode[],
  needle: string,
): string | null {
  const q = needle.trim().toLowerCase();
  if (!q) {
    return null;
  }
  const sorted = [...nodes].sort(
    (a, b) =>
      a.lastName.localeCompare(b.lastName, "ru") ||
      a.firstName.localeCompare(b.firstName, "ru"),
  );
  for (const n of sorted) {
    const hay = `${n.firstName} ${n.lastName}`.toLowerCase();
    if (hay.includes(q)) {
      return n.id;
    }
  }
  return null;
}
