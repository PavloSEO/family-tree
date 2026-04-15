# 06 — REST API

---

Base URL: `/api`. All responses are JSON. All mutations require `Authorization: Bearer <token>`.

## Response shape

```typescript
// Success
{ "data": T }

// Success with pagination
{ "data": T[], "total": number, "page": number, "limit": number }

// Error
{ "error": "Error message" }

// Warning (non-blocking)
{ "data": T, "warnings": ["Parent is younger than child"] }
```

## Auth

| Method | Path | Role | Request body | Response |
|-------|------|------|-------------|-------|
| POST | `/auth/login` | — | `{ login, password, remember }` | `{ token, user }` / 401 / 429 |
| GET | `/auth/me` | any | — | `{ user }` / 401 |

## Users

All routes are **admin** only. There is at most **one** user with role `admin`; you cannot delete or deactivate the last administrator. You cannot delete or deactivate **your own** account or remove your own admin role.

| Method | Path | Role | Description |
|-------|------|------|----------|
| GET | `/users` | admin | List users (`User[]`, no password) |
| GET | `/users/:id` | admin | Single user |
| POST | `/users` | admin | Create. Body: `UserCreate` (login, password ≥8, role, optional `linkedPersonId`, `status`). **409** if login taken or a second admin when `role: admin` |
| PUT | `/users/:id` | admin | Update. Body: `UserUpdate` (partial: login, password, role, `linkedPersonId`, `status`). Same constraints for second admin and last admin |
| DELETE | `/users/:id` | admin | Delete. **400** if last admin or self-delete |

## Persons

| Method | Path | Role | Description |
|-------|------|------|----------|
| GET | `/persons` | any | List. Query: `?search=&country=&alive=&page=&limit=&sort=&order=` |
| GET | `/persons/:id` | any | One card (all fields) |
| GET | `/persons/:id/relatives` | any | Computed relatives (BFS) |
| GET | `/persons/duplicates` | admin | Possible duplicates (firstName+lastName+dateOfBirth) |
| POST | `/persons` | admin | Create. Body: PersonCreate (Zod) |
| PUT | `/persons/:id` | admin | Update. Body: PersonUpdate (Zod) |
| DELETE | `/persons/:id` | admin | Delete + cascade links. Requires confirmation |
| POST | `/persons/:id/photo` | admin | Upload mainPhoto (multipart) |

## Relationships

| Method | Path | Role | Description |
|-------|------|------|----------|
| GET | `/relationships` | any | All links |
| GET | `/relationships/:id` | any | One link |
| POST | `/relationships` | admin | Create (with validation) |
| PUT | `/relationships/:id` | admin | Update meta (wedding dates) |
| DELETE | `/relationships/:id` | admin | Delete |

**Validation on POST /relationships:**

1. `fromPersonId !== toPersonId` — else 400
2. No duplicate — else 409
3. For parent: at most 2 parent links for `toPersonId` — else 400
4. For parent: no cycles (BFS) — else 400
5. For parent: age check — warning (non-blocking)
6. For parent: gender check — warning (non-blocking)

## Tree

| Method | Path | Role | Description |
|-------|------|------|----------|
| GET | `/tree/:personId` | any | Subgraph from given root |

Query params:

| Param | Type | Default | Description |
|----------|-----|---------|----------|
| mode | string | full | full / ancestors / descendants / direct / family / paternal / maternal |
| depthUp | number | 3 | Depth upward |
| depthDown | number | 3 | Depth downward |
| showExternal | boolean | false | Show external branches |
| externalDepth | number | 2 | Depth of external branches |
| country | string | — | Filter by ISO country |
| aliveOnly | boolean | false | Living only |

For **viewer**, **`showExternal`** and **`externalDepth`** from the request are **ignored** — response always has no external branches (as with `showExternal=false`).

Response (same `data` wrapper as other successful GETs):
```typescript
{
  "data": {
  "nodes": Array<{
    id: string;
    firstName: string;
    lastName: string;
    gender: "male" | "female";
    dateOfBirth: string | null;
    dateOfDeath: string | null;
    mainPhoto: string | null;
    country: string | null;
    isExternal: boolean;
  }>;
  "edges": Array<{
    id: string;
    source: string;
    target: string;
    type: "parent" | "spouse";
    isExternal: boolean;
  }>;
  "rootId": string;
  }
}
```

## Albums

| Method | Path | Role | Description |
|-------|------|------|----------|
| GET | `/albums` | any | List **`AlbumListItem[]`** (album fields + **`coverThumbnail`** — relative path to preview or `null`). Query: `?ownerId=&year=` |
| GET | `/albums/:id` | any | `{ album, photos[] }` |
| POST | `/albums` | admin | Create |
| PUT | `/albums/:id` | admin | Update |
| DELETE | `/albums/:id` | admin | Delete + cascade photos |

## Photos

| Method | Path | Role | Description |
|-------|------|------|----------|
| POST | `/photos/upload` | admin | Upload (multipart: `albumId`, `file`). Sharp: preview + EXIF rotation; exifr: date/GPS in DB; MIME: JPEG/PNG/WebP |
| GET | `/photos/:id` | any | Photo metadata + **`tags`**: `{ ...Photo, tags: PhotoTag[] }` |
| PUT | `/photos/:id` | admin | Update description, `dateTaken`, `year`, `location`, `sortOrder` (no file swap) |
| DELETE | `/photos/:id` | admin | Delete file + row |
| POST | `/photos/:id/tag` | admin | Tag: `{ personId, x, y, width, height }` — normalized 0–1 |
| DELETE | `/photos/:id/tag/:tagId` | admin | Remove tag |
| GET | `/photos/file/person/:personId/:fileName` | any | `main.*` in person dir (no `..`) |
| GET | `/photos/file/album/:albumId/:fileName` | any | Album JPEG (`uuid.jpg` / `uuid_thumb.jpg`) |
| GET | `/photos/file/:path` | any | Single segment: `encodeURIComponent(rel)` — same rules as **`resolvePhotoFile`** (no traversal) |

## Settings

| Method | Path | Role | Description |
|-------|------|------|----------|
| GET | `/settings` | any | All settings: `{ data: AppSettings }` |
| PUT | `/settings` | admin | Partial update: JSON object with any subset of keys (listed fields only) |

**`AppSettings`** fields: `siteName`, `defaultRootPersonId` (`null` if unset), `defaultDepthUp`, `defaultDepthDown`, `showExternalBranches`, `externalBranchDepth`, `accentColor` (`#RRGGBB`), `sessionTtlDays`.

## Backup

Prefix: **`/api/backup`**. Directory: **`BACKUPS_PATH`** (see `.env.example`). Filenames: only **`*.tar.gz`**, safe basename (`[a-zA-Z0-9._-]`).

| Method | Path | Role | Description |
|-------|------|------|----------|
| POST | `/backup` | admin | Create backup; response **`{ data: { filename, sizeBytes, createdAt } }`** (201) |
| GET | `/backup` | admin | List: **`{ data: BackupListItem[] }`** |
| GET | `/backup/:filename` | admin | Download (`Content-Type: application/gzip`) |
| DELETE | `/backup/:filename` | admin | Delete (204) |

Archive contents: **`db/family-tree.db`** (SQLite after `wal_checkpoint(FULL)`) and **`photos/`** directory (contents of **`PHOTOS_PATH`** if it exists).
