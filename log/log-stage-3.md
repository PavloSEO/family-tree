# Этап 03 — `packages/server`: Hono, SQLite, Drizzle

**ROADMAP:** «Настроить `packages/server`: Hono, better-sqlite3, Drizzle ORM. Файл `db/schema.ts` со всеми таблицами (см. `docs/05-database.md`). Файл `db/connection.ts` с WAL-режимом. Конфиг `drizzle.config.ts`».

## Сделано

### Зависимости

- `hono`, `drizzle-orm`, `better-sqlite3`, workspace `@family-tree/shared`.
- dev: `drizzle-kit`, `typescript`, `@types/node`, `@types/better-sqlite3`.

### `drizzle.config.ts` (корень `packages/server`)

- `schema`: `./src/db/schema.ts`
- `out`: `./src/db/migrations`
- `dialect`: `sqlite`
- `dbCredentials.url`: `DATABASE_URL` или `file:./data/db/family-tree.db` (относительно `packages/server` при вызове CLI).

### `src/db/schema.ts`

Все таблицы из `docs/05-database.md`: `persons`, `users`, `relationships`, `albums`, `photos`, `tagged_persons`, `settings`, `login_attempts`.

- Имена колонок в БД — **snake_case**; в TypeScript — **camelCase** (Drizzle mapping).
- JSON в SQLite: `localized_names`, `hobbies`, `social_links`, `custom_fields` — `text({ mode: 'json' })` с `$type<...>()`.
- `created_at` / `updated_at` где нужно — `default(sql\`(datetime('now'))\`)`.
- Индексы из раздела «Индексы» ТЗ.
- `login_attempts.success`: `default(sql\`0\`)` (корректный INTEGER для SQLite).

### `src/db/connection.ts`

- Путь к файлу: **`DATABASE_PATH`** или **`DB_PATH`** (абсолютный или относительно `process.cwd()`), иначе `packages/server/data/db/family-tree.db`.
- `fs.mkdirSync` для каталога БД.
- Pragmas: `journal_mode = WAL`, `foreign_keys = ON`, `busy_timeout = 5000`.
- Экспорт: `sqlite` (better-sqlite3), `db` (drizzle с `{ schema }`).

### `src/index.ts`

На этапе 03 — минимальный **Hono** и `GET /health` → `{ "status": "ok" }` (без обращения к БД на этом маршруте). В текущем репозитории файл расширен: импорт **`./bootstrap.js`** (миграции + seed), маршруты **`/api/*`**, SPA в production — см. актуальный `src/index.ts`.

### Миграции

После проверки схемы выполнен `drizzle-kit generate` — в `src/db/migrations/` добавлен начальный SQL + `meta/` (для следующих изменений схемы). Применение миграций и seed — **этап 04**.

### Скрипты `package.json`

- `typecheck` — `tsc --noEmit`
- `db:generate` — `drizzle-kit generate`
- `db:studio` — `drizzle-kit studio`

## Проверка

Из корня монорепо:

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
```

Генерация миграций (рабочая директория — пакет сервера, см. `drizzle.config.ts`):

```bash
npx pnpm@9.15.4 --filter @family-tree/server exec drizzle-kit generate
```

## Windows / нативный модуль `better-sqlite3`

Сборка `better-sqlite3` требует инструментов нативной сборки (на Windows — **Visual Studio Build Tools** с workload «Desktop development with C++»). Для проверки TypeScript можно было ставить зависимости с `--ignore-scripts`; в **Docker (этап 06)** и на Linux-сервере установка обычно проходит через prebuild.

## Следующий этап

**04** — `drizzle-kit generate` при изменениях схемы, `db/migrate.ts`, `db/seed.ts`, admin из env.
