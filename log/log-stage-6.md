# Этап 06 — Docker и окружение

**ROADMAP:** «Docker: `Dockerfile` (multi-stage: deps -> build -> runner на node:22-alpine), `docker-compose.yml` с volumes для `/data/db`, `/data/photos`, `/data/backups`. Файл `.env.example`. Проверить: `docker compose up --build` запускается без ошибок».

## Сделано

### `Dockerfile` (multi-stage)

1. **deps** — `node:22-alpine`, `libc6-compat`, `python3`, `make`, `g++` (сборка `better-sqlite3` / `bcrypt`), Corepack **pnpm@9.15.4**, `pnpm install --frozen-lockfile` по workspace.
2. **build** — копирование исходников `packages/*`, `pnpm --filter @family-tree/client build`, `pnpm --filter @family-tree/server build`, затем **`pnpm prune --prod`**.
3. **runner** — `node:22-alpine`, **`vips-dev`** + `libc6-compat` (под **sharp**, см. `docs/11-deployment.md`), копия `/app` из build, **`docker/entrypoint.sh`** (опционально **crond** при `ENABLE_BACKUP_CRON=1`), **`scripts/docker-backup-run.sh`**, **`docker/crontab-root`**, `WORKDIR /app/packages/server`, **`ENTRYPOINT`** → **`CMD ["node", "dist/serve.js"]`**, `EXPOSE 3000`, `ENV DATABASE_PATH=/data/db/family-tree.db`.

### `docker-compose.yml`

- Сервис **`family-tree`**, `build: .`, порт **3000:3000**.
- **Volumes** (хост `./data/...` → контейнер): `db`, `photos`, `backups` (каталоги в контейнере совпадают с примонтированными путями для приложения).
- **Переменные (см. актуальный `docker-compose.yml`):** `NODE_ENV`, `PORT`, `DATABASE_PATH`, `PHOTOS_PATH`, `BACKUPS_PATH`, `ENABLE_BACKUP_CRON`, `JWT_SECRET`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `RATE_LIMIT_MAX_ATTEMPTS`, `RATE_LIMIT_WINDOW_MINUTES`; для `JWT_SECRET` / admin без `.env` — значения по умолчанию из compose (только для локального smoke; в production задать свои секреты).

`env_file: .env` **не** подключён намеренно, чтобы `docker compose up --build` работал **без обязательного файла `.env`**; для секретов на сервере скопируйте `.env.example` → `.env` и передайте переменные окружения хоста или добавьте `env_file` сами.

### `.env.example`

- Шаблон переменных по `docs/11-deployment.md` + комментарии к этапам 07+.

### `.dockerignore`

- Исключены `node_modules`, `data`, `.env`, `material-web-main`, артефакты сборки и т.п., чтобы контекст сборки был меньше.

### Сервер под production-образ

- **`@hono/node-server`**, **`src/serve.ts`** — HTTP на `PORT` (по умолчанию 3000).
- **`pnpm --filter @family-tree/server build`**: **esbuild** бандл `serve.ts` → `dist/serve.js` с **`external`**: `better-sqlite3`, `bcrypt`; копирование **`src/db/migrations`** → **`dist/migrations`** (`scripts/copy-migrations.mjs`).
- Опционально **`MIGRATIONS_PATH`** для нестандартного расположения SQL.
- **`connection.ts`**: путь к БД из **`DATABASE_PATH`** или **`DB_PATH`** (как в деплой-доке).

### Корневой `package.json`

- Скрипт **`build`**: client + server (для CI / ручной сборки).

## Проверка

Сборка артефактов без Docker (из корня монорепо):

```bash
npx pnpm@9.15.4 run build
```

Контейнер (нужен запущенный Docker):

```bash
docker compose up --build -d
curl -s http://localhost:3000/health
```

На среде агента **Docker Desktop не был запущен** — сборка образа завершилась ошибкой подключения к daemon; локально выполните команды при работающем Docker.

## Следующий этап

**07** — сервер: auth service (bcrypt, jose, JWT payload) — `ROADMAP.md`, `log-stage-7.md`.
