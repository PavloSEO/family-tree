import type { Config } from "tailwindcss";

/**
 * Minimal config: no custom colors (see `docs/14-theming.md`).
 * Tailwind utilities allowed — only those listed in that doc.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
} satisfies Config;
