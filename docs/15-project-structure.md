# 15 — Project structure

---

```
family-tree/
|-- README.md                       <- Main overview
|-- ROADMAP.md                      <- Work phases
|-- docs/                           <- Documentation (this folder)
|-- package.json                    <- Root workspace
|-- pnpm-workspace.yaml
|-- pnpm-lock.yaml
|-- docker-compose.yml
|-- Dockerfile
|-- Caddyfile
|-- .env.example
|-- .gitignore
|
|-- packages/
|   |-- shared/                     <- Shared types and utilities
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- src/
|   |       |-- index.ts
|   |       |-- types/
|   |       |   |-- person.ts          Person, PersonCreate, PersonUpdate
|   |       |   |-- relationship.ts    Relationship, RelType
|   |       |   |-- user.ts            User, UserRole, AuthPayload
|   |       |   |-- photo.ts           Photo, Album, TaggedPerson
|   |       |   |-- api.ts             ApiResponse<T>, PaginatedResponse<T>
|   |       |-- validation/
|   |       |   |-- person.ts          Zod schemas
|   |       |   |-- relationship.ts
|   |       |   |-- user.ts
|   |       |   |-- photo.ts
|   |       |-- utils/
|   |       |   |-- tree-compute.ts    BFS, findShortestPath
|   |       |   |-- relationship-labels.ts  Pattern -> display label
|   |       |   |-- zodiac.ts          Western zodiac sign
|   |       |   |-- chinese-year.ts    Chinese zodiac year
|   |       |   |-- age.ts             Age calculation
|   |       |   |-- date-format.ts     Date formatting / locale
|   |       |   |-- countries.ts       ISO -> flag
|   |
|   |-- server/                     <- Hono API
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- drizzle.config.ts
|   |   |-- src/
|   |       |-- index.ts               Entry, Hono app
|   |       |-- db/
|   |       |   |-- schema.ts          Drizzle schema (all tables)
|   |       |   |-- connection.ts      SQLite + pragmas
|   |       |   |-- seed.ts            Create admin
|   |       |   |-- migrate.ts         Auto migrations
|   |       |   |-- migrations/        Generated SQL
|   |       |-- routes/
|   |       |   |-- auth.ts            POST /login, GET /me
|   |       |   |-- persons.ts         CRUD /persons
|   |       |   |-- relationships.ts   CRUD /relationships
|   |       |   |-- tree.ts            GET /tree/:personId
|   |       |   |-- albums.ts          CRUD /albums
|   |       |   |-- photos.ts          Upload, tag, file serving
|   |       |   |-- users.ts           CRUD /users (admin)
|   |       |   |-- settings.ts        GET/PUT /settings
|   |       |   |-- backup.ts          Backup CRUD
|   |       |-- middleware/
|   |       |   |-- auth.ts            JWT check, roles
|   |       |   |-- rate-limit.ts      Login attempt limits
|   |       |   |-- upload.ts          Multipart, MIME validation
|   |       |-- services/
|   |       |   |-- auth.service.ts    JWT sign/verify, bcryptjs
|   |       |   |-- person.service.ts  CRUD + duplicate search
|   |       |   |-- relationship.service.ts  CRUD + validation + BFS
|   |       |   |-- tree.service.ts    Subgraph build
|   |       |   |-- photo.service.ts   sharp, exifr, filesystem
|   |       |   |-- user.service.ts    User CRUD
|   |       |   |-- backup.service.ts  Archive, list, delete
|   |       |-- utils/
|   |           |-- errors.ts          AppError class
|   |           |-- file.ts            Paths, MIME, traversal guard
|   |
|   |-- client/                     <- Vite + React SPA
|       |-- package.json
|       |-- tsconfig.json
|       |-- vite.config.ts
|       |-- index.html                 Fonts, Material Symbols
|       |-- src/
|           |-- main.tsx               ReactDOM.createRoot + Router, typescale
|           |-- material-imports.ts    Side-effect @material/web imports
|           |-- App.tsx                Router, AuthProvider
|           |-- styles/
|           |   |-- global.css         M3 tokens, Tailwind
|           |-- types/
|           |   |-- material-web.d.ts  JSX declarations for <md-*>
|           |-- api/
|           |   |-- client.ts          ky instance + JWT interceptor
|           |   |-- persons.ts         API helpers
|           |   |-- relationships.ts
|           |   |-- albums.ts
|           |   |-- photos.ts
|           |   |-- users.ts
|           |   |-- tree.ts
|           |   |-- auth.ts
|           |   |-- settings.ts
|           |   |-- backup.ts
|           |-- hooks/
|           |   |-- useAuth.ts         AuthProvider + useAuth
|           |   |-- usePersons.ts
|           |   |-- useTree.ts
|           |   |-- useDebounce.ts
|           |-- components/
|           |   |-- ui/
|           |   |   |-- DataTable.tsx      TanStack Table + M3
|           |   |   |-- Accordion.tsx      Collapsible section
|           |   |   |-- FileDropzone.tsx   Drag & drop upload
|           |   |   |-- EmptyState.tsx     Empty state
|           |   |   |-- ConfirmDialog.tsx  md-dialog confirmations
|           |   |   |-- SearchField.tsx    md-outlined-text-field + debounce
|           |   |   |-- ColorPicker.tsx    Accent color picker
|           |   |-- layout/
|           |   |   |-- AppShell.tsx       Sidebar + main
|           |   |   |-- Sidebar.tsx        Navigation
|           |   |   |-- Header.tsx         Page title
|           |   |   |-- ProtectedRoute.tsx Auth guard
|           |   |-- tree/
|           |   |   |-- FamilyTree.tsx     React Flow canvas
|           |   |   |-- PersonNode.tsx     Custom node
|           |   |   |-- DeadPersonNode.tsx Grayscale node
|           |   |   |-- ExternalNode.tsx   Dashed border node
|           |   |   |-- SpouseEdge.tsx     Double line edge
|           |   |   |-- TreeControls.tsx   Modes, filters
|           |   |   |-- TreeFilters.tsx    Country, status, search
|           |   |   |-- useTreeLayout.ts   ELK layout hook
|           |   |-- person/
|           |   |   |-- PersonCard.tsx     Full profile
|           |   |   |-- PersonHeader.tsx   Header
|           |   |   |-- RelativesBlock.tsx Computed relatives
|           |   |   |-- InfoGraphics.tsx   Zodiac, age
|           |   |   |-- BioBlock.tsx
|           |   |   |-- ContactsBlock.tsx
|           |   |   |-- CustomFieldsBlock.tsx
|           |   |   |-- PersonAlbums.tsx
|           |   |-- admin/
|           |   |   |-- PersonForm.tsx
|           |   |   |-- PersonsTable.tsx
|           |   |   |-- RelationshipForm.tsx
|           |   |   |-- RelationshipsTable.tsx
|           |   |   |-- UserForm.tsx
|           |   |   |-- UsersTable.tsx
|           |   |   |-- AlbumForm.tsx
|           |   |   |-- PhotoUploader.tsx
|           |   |   |-- PhotoTagger.tsx
|           |   |   |-- SettingsForm.tsx
|           |   |-- photo/
|           |       |-- AlbumGrid.tsx
|           |       |-- PhotoGallery.tsx
|           |       |-- PhotoOverlay.tsx
|           |       |-- PhotoMeta.tsx
|           |-- pages/
|           |   |-- LoginPage.tsx
|           |   |-- DisabledPage.tsx
|           |   |-- TreePage.tsx
|           |   |-- PersonPage.tsx
|           |   |-- AlbumsPage.tsx
|           |   |-- AlbumPage.tsx
|           |   |-- WelcomePage.tsx
|           |   |-- admin/
|           |       |-- AdminPersonsPage.tsx
|           |       |-- AdminPersonEditPage.tsx
|           |       |-- AdminRelationshipsPage.tsx
|           |       |-- AdminUsersPage.tsx
|           |       |-- AdminAlbumsPage.tsx
|           |       |-- AdminSettingsPage.tsx
|           |       |-- AdminBackupPage.tsx
|           |-- lib/
|               |-- tree-compute.ts    Re-export from shared
|               |-- cn.ts             clsx + tailwind-merge
|
|-- scripts/
|   |-- backup.sh                   Cron backup script
|
|-- data/                           <- Docker volume (not in git)
    |-- db/
    |   |-- family-tree.db
    |-- photos/
    |-- backups/
```
