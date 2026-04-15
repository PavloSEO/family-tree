# Этап 09 — middleware авторизации и admin-only

**ROADMAP:** «Сервер: auth middleware — проверка `Authorization: Bearer <token>`, извлечение user из БД, проверка статуса `active`. Admin-only middleware для защиты admin-роутов».

## Сделано

### `src/middleware/auth.ts`

1. **`requireAuth`** (`hono/factory` `createMiddleware`):
   - заголовок **`Authorization: Bearer <jwt>`**;
   - **`verifyToken`**, загрузка пользователя по **`sub`** (в SELECT только публичные поля, **без `password_hash`**), сверка **`role`** с БД;
   - **`status === "disabled"`** → **403** «Доступ приостановлен»;
   - иначе **`c.set("user", …)`** — объект **`AuthUser`** (без пароля, **`status: "active"`** наряду с `createdAt`, `lastLoginAt`, `linkedPersonId`).

2. **`requireAdmin`** (только **после** `requireAuth`):
   - нет **`user`** в контексте → **401**;
   - **`user.role !== "admin"`** → **403** «Доступ запрещён».

### Интеграция

- **`src/index.ts`**: корневое приложение **`Hono<{ Variables: { user: AuthUser } }>`** для типизации **`c.get("user")`**.
- **`src/routes/auth.ts`**: тот же тип переменных; **`GET /api/auth/me`** реализован как **`requireAuth` + handler**, без дублирования логики JWT/БД.

## Использование в следующих этапах

Цепочка для admin API (пример):

```ts
import { requireAuth, requireAdmin } from "./middleware/auth.js";

const admin = new Hono<{ Variables: { user: AuthUser } }>();
admin.use("*", requireAuth, requireAdmin);
admin.get("/persons", ...);
app.route("/api/admin", admin);
```

Для любых защищённых GET/POST без admin-only — только **`requireAuth`**.

## Проверка

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

`GET /api/auth/me` с валидным Bearer — по-прежнему **`{ user }`**, тело пользователя совпадает с контекстом после middleware.

## Следующий этап

**10** — rate limiting логина (`login_attempts`, 5 / 15 мин, **429**); вызовы уже задействованы в **`routes/auth.ts`** — `ROADMAP.md`, `log-stage-10.md`.
