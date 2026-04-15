# Family Tree — work phases

> 50 phases. Order is strict. Each phase = one commit.

---

## Phase 1: Bootstrap (phases 1–6)

- [x] **01** Create pnpm workspace: root `package.json`, `pnpm-workspace.yaml`, three packages: `packages/shared`, `packages/server`, `packages/client`
- [x] **02** Configure `packages/shared`: TypeScript, Zod schemas for Person, Relationship, User, Photo, Album. API response types (`ApiResponse<T>`, `PaginatedResponse<T>`). Export via `index.ts`
- [x] **03** Configure `packages/server`: Hono, better-sqlite3, Drizzle ORM. `db/schema.ts` with all tables (see `docs/05-database.md`). `db/connection.ts` with WAL. `drizzle.config.ts`
- [x] **04** Generate migrations (`drizzle-kit generate`), write `db/migrate.ts` for auto-apply. Write `db/seed.ts` to create admin from env
- [x] **05** Configure `packages/client`: Vite 6, React 19, TypeScript. Install `@material/web`. `index.html` with Roboto and Material Symbols. `global.css` with light M3 tokens (see `docs/14-theming.md`). Tailwind 4 (layout utilities only)
- [x] **06** Docker: `Dockerfile` (multi-stage: deps → build → runner on node:22-alpine), `docker-compose.yml` with volumes for `/data/db`, `/data/photos`, `/data/backups`. `.env.example`. Verify `docker compose up --build` runs clean

---

## Phase 2: Auth (phases 7–12)

- [x] **07** Server: auth service — `hashPassword`, `verifyPassword` (bcryptjs, cost 12), `signToken`, `verifyToken` (jose). JWT payload: `{ sub: userId, role: "admin"|"viewer", iat, exp }`
- [x] **08** Server: `POST /api/auth/login` — `{ login, password, remember }`, verify credentials, return JWT + user. `GET /api/auth/me` — current user from JWT
- [x] **09** Server: auth middleware — `Authorization: Bearer <token>`, load user, check `active`. Admin-only middleware for admin routes
- [x] **10** Server: rate limiting — `login_attempts` table, 5 attempts / 15 minutes per IP, 429 when exceeded
- [x] **11** Client: `AuthProvider` + `useAuth` — JWT in memory, persist to localStorage with “Remember me”, restore on load. API client (ky) with JWT interceptor and 401/403 handling
- [x] **12** Client: login page on Material Web (`md-outlined-text-field`, `md-filled-button`, `md-checkbox`). `ProtectedRoute`. Redirect to `/login` without token. “Access suspended” page for disabled users

---

## Phase 3: Layout and navigation (phases 13–16)

- [x] **13** Client: `AppShell` — sidebar (`md-list` + `md-list-item`) and main area. Sidebar: Material Symbols + text, active highlight via `md-ripple`
- [x] **14** Client: React Router 7 — all routes from `docs/01-architecture.md`. Nested `/(admin)/*` protected with `adminOnly`. Sidebar depends on role (admin sees all; viewer — Tree and Photo albums only)
- [x] **15** Client: UI primitives — wrappers over MW for React ergonomics. `MdButton`, `MdTextField`, `MdSelect`, `MdDialog`, `MdChip`. Custom element types in `types/material-web.d.ts` (see `docs/03-material-web.md`)
- [x] **16** Client: `DataTable` — TanStack Table + M3 (see `docs/16-custom-components.md`). Sorting, filters, pagination, empty state. Used on all admin tables

---

## Phase 4: Person CRUD (phases 17–22)

- [x] **17** Server: `person.service.ts` — CRUD with Zod. Search by name (LIKE). Filters: country, alive/deceased. Pagination
- [x] **18** Server: `GET/POST/PUT/DELETE /api/persons`, `GET /api/persons/:id`, `GET /api/persons/duplicates`. Mutations admin-only
- [x] **19** Client: `AdminPersonsPage` — DataTable: photo, first/last name, sex, birth date, country, status. Search, filters. FAB “Create”, edit, delete (confirm `md-dialog`)
- [x] **20** Client: `PersonForm` — create/edit. RHF + Zod. Required fields always visible; optional sections in accordions. All fields from main spec section 3
- [x] **21** Server: mainPhoto upload — `POST /api/persons/:id/photo`, sharp (300px thumb), save under `/data/photos/{personId}/main.{ext}`
- [x] **22** Client: `PersonPage` — read-only profile. Header with photo and name; sections About, Contacts, Work & hobbies, Extra. Hide empty sections. MW: `md-elevated-card` (labs), `md-divider`, `md-icon`, `md-chip` for hobbies

---

## Phase 5: Relationships (phases 23–27)

- [x] **23** Server: `relationship.service.ts` — CRUD with validation: no self-links, no duplicates, max 2 parents, no cycles (BFS), age warning
- [x] **24** Server: `GET/POST/PUT/DELETE /api/relationships`. Validation on mutations. Cascade delete when person removed
- [x] **25** Client: `AdminRelationshipsPage` — DataTable: type, person A, person B, wedding date (spouse), marriage status
- [x] **26** Client: `RelationshipForm` — two person search fields (`md-outlined-text-field` + `md-menu`), type (`md-radio`), spouse extras. Warnings in `md-dialog`
- [x] **27** Shared: `tree-compute.ts` — graph BFS, `findShortestPath`, `getRelationshipLabel` (path → display names). Tests. Used on server and client. Relatives block on `PersonPage`

---

## Phase 6: Tree (phases 28–34)

- [x] **28** Server: `tree.service.ts` — subgraph from root with mode, depth, filters. `GET /api/tree/:personId`. Response `{ nodes[], edges[], rootId }`
- [x] **29** Client: `FamilyTree` — React Flow canvas. Basic nodes/edges. Zoom, pan, minimap, controls
- [x] **30** Client: custom nodes — `PersonNode`, `DeadPersonNode` (grayscale), `ExternalNode` (dashed). Edges: `SpouseEdge` (double), default solid, dashed for external
- [x] **31** Client: `useTreeLayout` — ELK. Layered, DOWN, couple grouping, generation spacing
- [x] **32** Client: `TreeControls` — `md-segmented-button-set` (labs) for modes. `md-slider` for depth. “Reset view” button
- [x] **33** Client: `TreeFilters` — `md-outlined-select` (country, status, branch). Name search `md-outlined-text-field` with highlight + auto-scroll
- [x] **34** Client: interactions — click node → card; double-click rebuilds tree from node. External branches collapsed by default, “+” to expand

---

## Phase 7: Photo albums (phases 35–40)

- [x] **35** Server: CRUD albums/photos. `POST /api/photos/upload` (multipart). Sharp: thumb + EXIF rotate. exifr: date/GPS. MIME validation
- [x] **36** Server: `GET /api/photos/file/:path` — static photos, traversal guard. `POST /api/photos/:id/tag` — face tags
- [x] **37** Client: `AdminAlbumsPage` — album grid (cover, title, year). Create album `md-dialog`
- [x] **38** Client: `PhotoUploader` — drag & drop, preview, `md-linear-progress`, multi-upload
- [x] **39** Client: `PhotoTagger` — rectangles on canvas overlay, `md-menu` with search to pick person, show existing tags
- [x] **40** Client: `PhotoGallery` — lightbox (yet-another-react-lightbox). Swipe, zoom. Tag overlay (frames, names on hover). Shared + person albums

---

## Phase 8: Users and settings (phases 41–44)

- [x] **41** Server: user CRUD (admin). No second admin. Disable, delete. `GET/POST/PUT/DELETE /api/users`
- [x] **42** Client: `AdminUsersPage` — DataTable: login, role, status, linked card, created, last login. Create `md-dialog`
- [x] **43** Server: `GET/PUT /api/settings` — key/value: siteName, defaultRootPersonId, tree depth, external branches, accent, session TTL
- [x] **44** Client: `AdminSettingsPage` — `md-outlined-text-field`, `md-slider`, `md-switch`, color picker

---

## Phase 9: Infographics (phases 45–46)

- [x] **45** Shared: `zodiac.ts`, `chinese-year.ts` (MVP year-only), `age.ts`, `date-format.ts` (locale-aware formatting)
- [x] **46** Client: `InfoGraphics` on card — age, zodiac, Chinese year, blood type, birth place, current location (only if data). `ContactsBlock` — tel/mail, social icons. `CustomFieldsBlock` — key/value

---

## Phase 10: Backups and wrap-up (phases 47–50)

- [x] **47** Server: backup service — SQLite + photos → tar.gz. `POST/GET/GET/:file/DELETE /api/backup`
- [x] **48** Client: `AdminBackupPage` — DataTable, FAB “Create backup”, download, delete. `md-linear-progress` on create. Docker: daily cron (03:00), 30-day retention
- [x] **49** Client: `WelcomePage` — empty DB onboarding. Draft form in sessionStorage on session expiry. Toasts (sonner, M3-styled)
- [x] **50** Final: `docker compose up --build`, smoke all pages, auth, CRUD, tree with fixtures, VPS deploy. Document CLI password reset

---

## Audit follow-ups (outside the 50 phases)

Items moved from `to-do/AUDIT.md` (file removed after partial completion).

- **Docker smoke** — confirm `docker compose up --build` with daemon running; health, SPA, login.
- **mainPhoto** — keep original on disk (`original.{ext}`) plus compressed `main.jpg` / `main_thumb.jpg` per spec.
- **Persons on client** — `GET /api/persons/search` and replace bulk loads in forms and `AdminRelationshipsPage` (names in relationship API response).
- **gender: "other"** — shared schema, Drizzle, migration, UI, `tree-compute`, neutral placeholder.
- **Responsive** — manual pass on key screens (sidebar, tables, tree, forms).
- **Chinese zodiac** — optional: CNY-based dates instead of year-only.
- **HTTPS** — deploy without Caddy: explicit redirect or docs for chosen proxy.

Done during audit (short list): Lucide in `ContactsBlock`, dual sliders `depthUp` / `depthDown` in `TreeControls`, dynamic ELK import, sample `Caddyfile`, sonner toasts on main admin pages and `PhotoTagger` / `PhotoUploader`, `archiver` check in backup-cli bundle.
