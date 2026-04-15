# 05 — Database

---

## Engine

SQLite via `better-sqlite3` (synchronous driver) + `drizzle-orm`.

DB file: `/data/db/family-tree.db` (Docker volume).

Pragmas on connect:
```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```

## Tables

### users

| Column | Type | Constraints |
|---------|-----|------------|
| id | TEXT | PK, uuid |
| login | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| role | TEXT | NOT NULL, enum: admin / viewer |
| linked_person_id | TEXT | FK -> persons.id, ON DELETE SET NULL |
| status | TEXT | NOT NULL, enum: active / disabled |
| created_at | TEXT | NOT NULL, DEFAULT datetime('now') |
| last_login_at | TEXT | nullable |

### persons

| Column | Type | Constraints |
|---------|-----|------------|
| id | TEXT | PK, uuid |
| first_name | TEXT | NOT NULL |
| last_name | TEXT | NOT NULL |
| patronymic | TEXT | nullable |
| maiden_name | TEXT | nullable |
| gender | TEXT | NOT NULL, enum: male / female |
| date_of_birth | TEXT | nullable, ISO date |
| date_of_death | TEXT | nullable, ISO date |
| birth_place | TEXT | nullable |
| current_location | TEXT | nullable |
| country | TEXT | nullable, ISO 3166-1 alpha-2 |
| main_photo | TEXT | nullable, path |
| bio | TEXT | nullable |
| occupation | TEXT | nullable |
| blood_type | TEXT | nullable, enum: A+/A-/B+/B-/AB+/AB-/O+/O- |
| phone | TEXT | nullable |
| email | TEXT | nullable |
| localized_names | TEXT (JSON) | nullable, `{ "en": { "firstName": "...", "lastName": "..." } }` |
| hobbies | TEXT (JSON) | nullable, `["fishing", "chess"]` |
| social_links | TEXT (JSON) | nullable, `[{ "platform": "telegram", "url": "..." }]` |
| custom_fields | TEXT (JSON) | nullable, `{ "education": "BNTU, 2007" }` |
| created_at | TEXT | NOT NULL |
| updated_at | TEXT | NOT NULL |

### relationships

| Column | Type | Constraints |
|---------|-----|------------|
| id | TEXT | PK, uuid |
| type | TEXT | NOT NULL, enum: parent / spouse |
| from_person_id | TEXT | NOT NULL, FK -> persons.id, ON DELETE CASCADE |
| to_person_id | TEXT | NOT NULL, FK -> persons.id, ON DELETE CASCADE |
| marriage_date | TEXT | nullable, ISO date (spouse only) |
| divorce_date | TEXT | nullable, ISO date (spouse only) |
| is_current_spouse | INTEGER | nullable, boolean (spouse only) |
| notes | TEXT | nullable |
| created_at | TEXT | NOT NULL |

**For parent:** from_person_id = parent, to_person_id = child.
**For spouse:** order does not matter; the link is bidirectional.

### albums

| Column | Type | Constraints |
|---------|-----|------------|
| id | TEXT | PK, uuid |
| title | TEXT | NOT NULL |
| description | TEXT | nullable |
| year | INTEGER | nullable |
| owner_id | TEXT | nullable, FK -> persons.id, ON DELETE SET NULL |
| cover_photo_index | INTEGER | DEFAULT 0 |
| created_at | TEXT | NOT NULL |
| updated_at | TEXT | NOT NULL |

`owner_id = null` — shared album. Otherwise — album tied to a person card.

### photos

| Column | Type | Constraints |
|---------|-----|------------|
| id | TEXT | PK, uuid |
| album_id | TEXT | NOT NULL, FK -> albums.id, ON DELETE CASCADE |
| src | TEXT | NOT NULL, path to original |
| thumbnail | TEXT | nullable, path to preview |
| description | TEXT | nullable |
| date_taken | TEXT | nullable, ISO date |
| year | INTEGER | nullable |
| location | TEXT | nullable |
| sort_order | INTEGER | DEFAULT 0 |
| created_at | TEXT | NOT NULL |

### tagged_persons

| Column | Type | Constraints |
|---------|-----|------------|
| id | TEXT | PK, uuid |
| photo_id | TEXT | NOT NULL, FK -> photos.id, ON DELETE CASCADE |
| person_id | TEXT | NOT NULL, FK -> persons.id, ON DELETE CASCADE |
| x | REAL | NOT NULL, 0.0-1.0 |
| y | REAL | NOT NULL, 0.0-1.0 |
| width | REAL | NOT NULL, 0.0-1.0 |
| height | REAL | NOT NULL, 0.0-1.0 |

### settings

| Column | Type | Constraints |
|---------|-----|------------|
| key | TEXT | PK |
| value | TEXT | NOT NULL |

### login_attempts

| Column | Type | Constraints |
|---------|-----|------------|
| id | TEXT | PK, uuid |
| ip | TEXT | NOT NULL |
| login | TEXT | NOT NULL |
| attempted_at | TEXT | NOT NULL |
| success | INTEGER | NOT NULL, boolean, DEFAULT 0 |

## Indexes

```sql
CREATE INDEX idx_persons_name ON persons (first_name, last_name);
CREATE INDEX idx_rel_from ON relationships (from_person_id);
CREATE INDEX idx_rel_to ON relationships (to_person_id);
CREATE INDEX idx_rel_type ON relationships (type);
CREATE INDEX idx_photos_album ON photos (album_id);
CREATE INDEX idx_tagged_photo ON tagged_persons (photo_id);
CREATE INDEX idx_tagged_person ON tagged_persons (person_id);
CREATE INDEX idx_login_ip ON login_attempts (ip, attempted_at);
```

## Migrations

```bash
# Generate migrations after changing schema.ts
pnpm --filter server drizzle-kit generate

# Apply migrations (runs automatically on server start)
node server/db/migrate.js
```

## Seed (first run)

On first run `seed.ts` creates the admin user from `ADMIN_LOGIN` and `ADMIN_PASSWORD`. If an admin already exists, it skips.
