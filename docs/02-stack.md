# 02 — Technology stack

---

## Frontend

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| react | 19.x | UI library | `pnpm add react react-dom` |
| vite | 6.x | Bundler | `pnpm add -D vite @vitejs/plugin-react` |
| @material/web | 2.x | Material Design 3 Web Components | `pnpm add @material/web` |
| react-router-dom | 7.x | Client routing | `pnpm add react-router-dom` |
| @xyflow/react | 12.x | Graph visualization (tree) | `pnpm add @xyflow/react` |
| elkjs | 0.9.x | Tree layout algorithm | `pnpm add elkjs` |
| @tanstack/react-table | 8.x | Headless tables | `pnpm add @tanstack/react-table` |
| react-hook-form | 7.x | Form handling | `pnpm add react-hook-form @hookform/resolvers` |
| zod | 3.x | Validation (shared with server) | `pnpm add zod` |
| ky | 1.x | HTTP client (fetch wrapper) | `pnpm add ky` |
| lucide-react | 0.4x | Icons (fallback for custom) | `pnpm add lucide-react` |
| sonner | 1.x | Toast notifications | `pnpm add sonner` |
| yet-another-react-lightbox | 3.x | Photo lightbox | `pnpm add yet-another-react-lightbox` |
| clsx | 2.x | Conditional CSS classes | `pnpm add clsx` |
| tailwindcss | 4.x | Layout utilities (flex, grid, spacing) | `pnpm add -D tailwindcss @tailwindcss/vite` |

## Backend

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| hono | 4.x | HTTP framework | `pnpm add hono @hono/node-server` |
| drizzle-orm | 0.38.x | ORM (typed SQL) | `pnpm add drizzle-orm` |
| better-sqlite3 | 12.x | SQLite driver | `pnpm add better-sqlite3` |
| jose | 5.x | JWT (sign, verify) | `pnpm add jose` |
| bcryptjs | 3.x | Password hashing (no native module) | `pnpm add bcryptjs` |
| sharp | 0.33.x | Image processing | `pnpm add sharp` |
| exifr | 7.x | EXIF parsing | `pnpm add exifr` |
| archiver | 7.x | zip/tar.gz backups | `pnpm add archiver` |
| drizzle-kit | 0.30.x | DB migrations | `pnpm add -D drizzle-kit` |
| tsx | 4.x | TypeScript runner (dev) | `pnpm add -D tsx` |

## DevDependencies (shared)

| Package | Purpose |
|---------|---------|
| typescript | 5.7.x |
| @types/react | 19.x |
| @types/react-dom | 19.x |
| @types/better-sqlite3 | 7.x |
| @types/bcryptjs | 2.x |
| concurrently | Run dev servers in parallel |

## What we do not use

| Technology | Reason |
|-----------|--------|
| Next.js | No SSR needed; Vite SPA is native |
| Prisma | Heavy binary engine, high RAM |
| PostgreSQL | Separate process, 200+ MB RAM |
| Express | Legacy API, weaker typing |
| Axios | ky is lighter, fetch-based |
| Styled Components | MW uses CSS custom properties |
| MUI (Material UI for React) | React implementation; we use native @material/web |
| Ant Design | Own design language, conflicts with M3 |
| D3.js | Too low-level for interactive graph |
| dagre | No family-tree layout (couples side by side) |
