# 01 — Architecture

---

## Overview

```
Browser (SPA)                 Docker Container
+-------------------+         +-----------------------------+
|  React 19         |  fetch  |  Hono Server (port 3000)    |
|  @material/web    | ------> |                             |
|  React Flow       |         |  /api/*  -->  route handlers |
|  Vite build       |         |  /*      -->  static SPA    |
+-------------------+         |                             |
                              |  SQLite (file /data/db/)    |
                              |  Photos (dir /data/photos/) |
                              +-----------------------------+
                                        |
                              +-----------------------------+
                              |  Caddy (ports 80, 443)      |
                              |  reverse_proxy :3000        |
                              |  auto HTTPS (Let's Encrypt) |
                              +-----------------------------+
```

## Principles

**SPA-only.** All navigation, rendering, and state live on the client. The server is a pure API + static hosting. No SSR.

**Single process.** The Hono server in Node.js serves both the API and the SPA. SQLite is in-process via better-sqlite3.

**Monorepo.** Three packages in the pnpm workspace:

| Package | Purpose |
|---------|---------|
| `packages/shared` | Types, Zod schemas, utilities (BFS, zodiac). Used by server and client |
| `packages/server` | Hono API, Drizzle ORM, business logic, photo handling |
| `packages/client` | Vite + React SPA, Material Web, React Flow |

## Client routes

```
/login                        -- LoginPage (public)
/disabled                     -- DisabledPage (public)
/tree                         -- TreePage (auth: admin + viewer)
/person/:id                   -- PersonPage (auth: admin + viewer)
/albums                       -- AlbumsPage (auth: admin + viewer)
/album/:id                    -- AlbumPage (auth: admin + viewer)
/admin/persons                -- AdminPersonsPage (admin only)
/admin/persons/new            -- AdminPersonEditPage (admin only)
/admin/persons/:id/edit       -- AdminPersonEditPage (admin only)
/admin/relationships          -- AdminRelationshipsPage (admin only)
/admin/users                  -- AdminUsersPage (admin only)
/admin/albums                 -- AdminAlbumsPage (admin only)
/admin/settings               -- AdminSettingsPage (admin only)
/admin/backup                 -- AdminBackupPage (admin only)
/welcome                      -- WelcomePage (auth, empty DB)
```

## Data flows

**Auth:**
```
LoginPage --> POST /api/auth/login --> JWT token
          --> in-memory storage (+ localStorage when “Remember me”)
          --> all requests with Authorization: Bearer <token>
          --> middleware validates JWT + user status
```

**CRUD (example):**
```
PersonForm --> POST /api/persons (JSON) --> Zod validation --> Drizzle INSERT --> 201
```

**Tree:**
```
TreePage --> GET /api/tree/:rootId?mode=full --> BFS from root --> { nodes[], edges[] }
         --> ELK layout --> React Flow render
```
