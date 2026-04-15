# Этап 50 — финальная сборка, smoke, документация

**ROADMAP:** `docker compose up --build`, ручной smoke (страницы, auth, CRUD, дерево), ожидания деплоя на VPS, **сброс пароля через CLI**.

## Сделано

### Сервер (production SPA)

- **`packages/server/src/static-spa.ts`** — при **`NODE_ENV=production`** и наличии **`packages/client/dist/index.html`**: статика из **`client/dist`** через **`@hono/node-server/serve-static`**, исключения **`/api`**, **`/health`**; для **GET/HEAD** — fallback **`index.html`**.
- **`packages/server/src/index.ts`** — регистрация **`registerClientSpaIfProd`** после всех **`/api/*`** маршрутов.

### CLI сброса пароля администратора

- **`packages/server/src/admin-password-cli.ts`** — обновление **`users.password_hash`** по **`--login=`** или **`ADMIN_LOGIN`** (по умолчанию **`admin`**); новый пароль только из **`NEW_ADMIN_PASSWORD`** (≥ 8 символов).
- **`packages/server/package.json`** — сборка **`dist/admin-password-cli.js`**, скрипт **`admin:password`** (**`tsx ./src/admin-password-cli.ts`**).

### Docker

- **`Dockerfile`** — комментарий: для раздачи статики нужен **`NODE_ENV=production`** (уже **`ENV NODE_ENV=production`** в runtime-стадии).

### Документация

- **`docs/12-smoke-checklist.md`** — краткий ручной чеклист после compose / prod-запуска.
- **`docs/11-deployment.md`** — разделы **«Сброс пароля через CLI»** ( **`docker compose exec`** из **`WORKDIR /app/packages/server`**: **`node dist/admin-password-cli.js`**) и **«SPA в production»**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 run build
docker compose build
docker compose up -d
curl -s http://localhost:3000/health
```

Деплой на VPS: по **`docs/11-deployment.md`** (Docker, тома, при необходимости reverse proxy); после выката — те же smoke-пункты на боевом URL (**`docs/12-smoke-checklist.md`**).

## Следующий этап

Все **50** этапов **`ROADMAP.md`** закрыты; дальнейшие изменения — по отдельным задачам вне нумерации этапов.
