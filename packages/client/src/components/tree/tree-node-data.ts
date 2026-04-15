/** Поля ноды дерева для кастомных React Flow нод (этап 30). */
export type TreePersonNodeData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  mainPhoto: string | null;
  country: string | null;
  isRoot: boolean;
  /** Подсветка при поиске по имени (`TreeFilters`, этап 33). */
  isHighlighted?: boolean;
};
