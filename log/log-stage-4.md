# Этап 04 — миграции и seed

**ROADMAP:** «Сгенерировать миграции (`drizzle-kit generate`), написать `db/migrate.ts` для автоматического применения. Написать `db/seed.ts` для создания admin-пользователя из env-переменных».

## Сделано

### Миграции

- Повторный `drizzle-kit generate`: изменений схемы нет, актуальный SQL остаётся в `src/db/migrations/0000_*.sql` + `meta/` (с этапа 03).

### `src/db/migrate.ts`

- `runMigrate()` вызывает `migrate()` из `drizzle-orm/better-sqlite3/migrator` с папкой `path.join(__dirname, "migrations")` (рядом с `src/db` при **`tsx`**, рядом с **`dist/serve.js`** в production — см. **`scripts/copy-migrations.mjs`** в **`pnpm build`**).
- Опционально **`MIGRATIONS_PATH`** — явный каталог с SQL + `meta/_journal.json`.

### `src/db/seed.ts`

- Если в таблице `users` уже есть роль **`admin`** — выход без действий.
- Иначе читаются **`ADMIN_LOGIN`** и **`ADMIN_PASSWORD`**; если чего-то нет — **`throw`** с понятным текстом (первый запуск без учётных данных).
- Перед вставкой логин/пароль проверяются через **`userCreateSchema`** из **`@family-tree/shared`** (длина пароля ≥8, логин ≤64 и т.д., как при **`POST /api/users`**).
- Пароль хэшируется **`bcrypt.hashSync(..., 12)`** (как в ТЗ для этапа авторизации).
- Вставка одной строки `users`: `role: "admin"`, `status: "active"`, `linkedPersonId: null`, `id` = `randomUUID()`.

### CLI и автозапуск

- `src/db/migrate-cli.ts` — только миграции (для ручного запуска).
- `src/db/seed-cli.ts` — миграции + seed (удобно при первом развёртывании).
- Скрипты в `packages/server/package.json`: **`db:migrate`**, **`db:seed`** (через **`tsx`**).
- **`src/bootstrap.ts`**: `runMigrate()` → `runSeed()`; подключается из **`src/index.ts`** первой строкой, чтобы при старте приложения миграции и сид выполнялись автоматически (как в `docs/05-database.md`).

### Зависимости

- **`bcrypt`**, **`@types/bcrypt`**
- **`tsx`** (dev) — запуск TS без отдельной сборки для CLI.

## Переменные окружения

| Переменная | Когда нужна |
|------------|-------------|
| `ADMIN_LOGIN`, `ADMIN_PASSWORD` | Первый запуск, пока в БД нет ни одного пользователя с ролью `admin`. Пароль — те же ограничения, что у пользователя в API (≥8 символов). |
| `DATABASE_PATH` / `DB_PATH` | Опционально (см. этап 03); иначе файл по умолчанию под `packages/server/data/db/`. |
| `MIGRATIONS_PATH` | Опционально: каталог миграций вместо `__dirname/migrations`. |

Полный `.env.example` в корне — по плану **этап 06**.

## Команды

Из корня монорепо:

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run db:migrate
npx pnpm@9.15.4 --filter @family-tree/server run db:seed
```

(`db:seed` внутри снова вызывает миграции — безопасно и идемпотентно.)

## Замечания

- **`better-sqlite3`** и **`bcrypt`** — нативные модули; на Windows без toolchain сборка может не пройти — см. `log-stage-3.md`. В Docker (этап 06) обычно нормально.
- При импорте `app` из `src/index.ts` всегда выполняется bootstrap: без валидной БД и без env при пустой БД процесс упадёт на seed — ожидаемо для первого запуска.

## Следующий этап

**05** — клиент: Vite 6, React 19, `@material/web`, тема, Tailwind 4.
