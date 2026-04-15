import type { Config } from "tailwindcss";

/**
 * Минимальный конфиг: без кастомных цветов (см. `docs/14-theming.md`).
 * Разрешённые утилиты Tailwind — только перечисленные в том документе.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
} satisfies Config;
