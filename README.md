# Family Tree

[![CI](https://github.com/PavloSEO/family-tree/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/PavloSEO/family-tree/actions/workflows/ci.yml)

**Repository:** [github.com/PavloSEO/family-tree](https://github.com/PavloSEO/family-tree)

Private web service for maintaining a family tree: interactive relationship graph, personal profile cards, photo albums with face tagging, role-based access control, and a full admin panel.

Built with **React 19**, **Material Design 3** ([`@material/web`](https://github.com/material-components/material-web)), **Hono**, and **SQLite**.

---

## Features

- **Interactive tree** — zoomable, pannable graph powered by React Flow + ELK layout. Seven viewing modes (full tree, ancestors only, descendants only, direct line, family group, paternal line, maternal line).
- **Smart relationship labels** — only `parent` and `spouse` links are stored; everything else (siblings, uncles, cousins, in-laws) is computed automatically via BFS with kinship labels (default strings follow the Russian product locale; see `to-do/english-migration-notes.md` for EN/i18n follow-up).
- **Profile cards** — full personal profiles with infographics (zodiac, Chinese year, age), contacts, social links, custom fields. Empty sections are hidden automatically.
- **Photo albums** — upload with EXIF parsing (date, GPS), auto-thumbnails via Sharp, and face tagging with normalized coordinates.
- **Role-based access** — one admin (full CRUD) + unlimited viewers (read-only, no edit buttons in DOM). JWT auth, bcrypt-compatible hashing (**bcryptjs**), rate limiting.
- **Backup system** — on-demand or scheduled (Docker cron) tar.gz archives of the database and photos.
- **Bilingual UI (RU / EN)** — client i18n via i18next; see [`docs/i18n-client.md`](docs/i18n-client.md).
- **Light theme only** — Material Design 3 tokens, no dark mode, no `prefers-color-scheme`.

## Architecture

```
family-tree/
  packages/
    shared/    Types, Zod schemas, BFS utils (used by both client and server)
    client/    Vite 6 + React 19 SPA, @material/web components
    server/    Hono 4 REST API, Drizzle ORM + SQLite, Sharp
```

In Docker Compose, **Hono** serves the built SPA and `/api/*`; **`nginx`** (see `docker-compose.yml`) reverse-proxies host port **8080** to the app. For **HTTPS** with Docker, see **[`docker/nginx/README.md`](docker/nginx/README.md)** (Caddy, certs on nginx, or external TLS) and [`docs/11-deployment.md`](docs/11-deployment.md).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 6, `@material/web` 2.x, React Router 7, React Flow 12, ELK.js, TanStack Table 8 |
| Styling | Material Design 3 CSS tokens + Tailwind CSS 4 (layout utilities only) |
| Icons | Material Symbols (primary), Lucide React (social platform icons only) |
| Forms | React Hook Form + Zod |
| Backend | Hono 4, Node.js 22 LTS |
| Database | SQLite via better-sqlite3 + Drizzle ORM |
| Auth | JWT (jose) + bcryptjs |
| Photos | Sharp (resize, thumbnails, EXIF rotation), exifr (metadata parsing) |
| Deploy | Docker (multi-stage), optional Caddy for HTTPS |

## Requirements

- **Node.js** 22+ (LTS)
- **pnpm** 9.x — via Corepack (version pinned in root `package.json` as `packageManager`)

## Quick Start

```bash
git clone https://github.com/PavloSEO/family-tree.git
cd family-tree
corepack enable
pnpm install
```

Copy [`.env.example`](./.env.example) to `.env` and set at minimum:

```env
JWT_SECRET=your-random-string-at-least-32-characters
ADMIN_LOGIN=admin
ADMIN_PASSWORD=your-secure-password
```

Without **`JWT_SECRET`**, `docker compose` will not inject a secret into the service (see `docker-compose.yml`).

### Development

Run in two terminals from the project root:

```bash
pnpm run dev:server   # API on port 3000
pnpm run dev:client   # Vite on port 5173, proxies /api -> 3000
```

Or using workspace filters:

```bash
corepack pnpm --filter @family-tree/server dev
corepack pnpm --filter @family-tree/client dev
```

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm run typecheck
```

### Tests

```bash
corepack pnpm --filter @family-tree/shared test
```

## Docker

Full deployment guide, environment variables, backups, and Caddy setup: [`docs/11-deployment.md`](docs/11-deployment.md).

Quick start with a filled `.env`:

```bash
docker compose up -d --build
curl http://localhost:8080/health
```

Compose starts **two** containers: **`family-tree`** (Hono listens on **3000** inside the Docker network only) and **`nginx`** (host **http://localhost:8080** → app). Nginx sends **301** from **`www.`** host to the same host **without** `www`, merges duplicate slashes, then proxies to the app (**`docker/nginx/README.md`**).

To expose **3000** on the host as well (e.g. debugging), add under `family-tree`: `ports: ["3000:3000"]` in your local override file.

The app container runs migrations and seeds the admin user automatically on first start.

### Admin Password Reset

```bash
docker compose exec family-tree node dist/admin-password-cli.js
```

See [`docs/11-deployment.md`](docs/11-deployment.md) for details.

## Documentation

Full documentation index: **[`docs/README.md`](docs/README.md)**.

| Document | Contents |
|----------|----------|
| [`01-architecture.md`](docs/01-architecture.md) | SPA + API architecture, routing, data flows |
| [`02-stack.md`](docs/02-stack.md) | Full technology stack with reasoning |
| [`03-material-web.md`](docs/03-material-web.md) | `@material/web` integration with React 19 |
| [`04-component-map.md`](docs/04-component-map.md) | UI element to MW component mapping |
| [`05-database.md`](docs/05-database.md) | Drizzle schema, tables, indexes, migrations |
| [`06-api.md`](docs/06-api.md) | REST API endpoints reference |
| [`07-auth.md`](docs/07-auth.md) | Authentication, JWT, rate limiting |
| [`08-tree-visualization.md`](docs/08-tree-visualization.md) | React Flow + ELK, BFS algorithm, kinship labels |
| [`09-photo-system.md`](docs/09-photo-system.md) | Photo upload pipeline, EXIF, face tagging |
| [`10-admin-panel.md`](docs/10-admin-panel.md) | Admin UI wireframes and forms |
| [`11-deployment.md`](docs/11-deployment.md) | Docker, VPS, SSL, env variables, backups |
| [`12-backup.md`](docs/12-backup.md) | Backup archives, cron, retention |
| [`12-smoke-checklist.md`](docs/12-smoke-checklist.md) | Post-deploy manual test checklist |
| [`13-icons.md`](docs/13-icons.md) | Icon policy (Material Symbols, Lucide) |
| [`14-theming.md`](docs/14-theming.md) | M3 tokens, light theme |
| [`15-project-structure.md`](docs/15-project-structure.md) | Repository layout |
| [`16-custom-components.md`](docs/16-custom-components.md) | DataTable and custom UI |
| [`i18n-client.md`](docs/i18n-client.md) | RU/EN client i18n, namespaces, locales |
| [`dev-log.md`](docs/dev-log.md) | Short maintenance log for the repo |

## Contributing & security

- [CONTRIBUTING.md](CONTRIBUTING.md) — how to contribute; paths ignored in git (e.g. `log/`, `material-web-main/`).
- [SECURITY.md](SECURITY.md) — how to report vulnerabilities.

## License

[MIT](LICENSE)
