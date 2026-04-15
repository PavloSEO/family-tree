/** Совпадает с `gender` персоны / ноды дерева; `other` — нейтральный силуэт. */
export type PersonPlaceholderGender = "male" | "female" | "other";

/** Сейчас в API только `male` | `female`; при появлении `other` вернуть `"other"`. */
export function genderToPlaceholderGender(
  g: "male" | "female",
): PersonPlaceholderGender {
  return g === "female" ? "female" : "male";
}

/** Путь под Vite `public/` (тот же origin, что и SPA). */
export function personPlaceholderPath(
  gender: PersonPlaceholderGender,
  dead: boolean,
): string {
  const key =
    gender === "female" ? "female" : gender === "male" ? "male" : "neutral";
  return dead
    ? `/placeholder-${key}-dead.svg`
    : `/placeholder-${key}.svg`;
}
