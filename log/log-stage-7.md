# Этап 07 — сервис авторизации (bcrypt + jose)

**ROADMAP:** «Сервер: auth service — функции `hashPassword`, `verifyPassword` (bcrypt, cost 12), `signToken`, `verifyToken` (jose). JWT payload: `{ sub: userId, role: "admin"|"viewer", iat, exp }`».

## Сделано

### Зависимость

- **`jose`** (^5.x) — подпись и проверка JWT без нативных модулей (см. `docs/07-auth.md`).

### `src/services/auth.service.ts`

| Функция | Поведение |
|---------|-----------|
| **`hashPassword(password)`** | `bcrypt.hash`, **cost 12** (как в ТЗ и в seed). |
| **`verifyPassword(password, passwordHash)`** | `bcrypt.compare`. |
| **`signToken({ sub, role, remember? })`** | HS256, в JWT-клеймах **`role`**, **`sub`** через `setSubject`, стандартные **`iat`** / **`exp`**. Срок: **`remember`** → `SESSION_TTL_DAYS` суток (env, default **30**), иначе **24 часа** (`24h`). |
| **`verifyToken(token)`** | `jose.jwtVerify`, только **HS256**; возвращает **`AppJwtPayload`**: `{ sub, role, iat, exp }` с проверкой роли. |

### Секрет

- **`JWT_SECRET`**: обязателен при вызове `signToken` / `verifyToken`, длина **≥ 32** символов (как в `docs/07-auth.md`). Иначе **`Error`** с текстом на русском.

### Типы

- **`JwtRole`**, **`AppJwtPayload`** — экспорт из сервиса для этапов 08–09 (логин, middleware).

## Не входило в этап 07

- HTTP-роуты `/api/auth/login`, `/api/auth/me` — **этап 08**.
- Middleware, rate limit — **этапы 09–10**.

**Seed (этап 04)** по-прежнему использует `bcrypt.hashSync(..., 12)` — совместимо с `verifyPassword`.

## Проверка

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Следующий этап

**08** — маршруты **`POST /api/auth/login`**, **`GET /api/auth/me`** — `ROADMAP.md`, `log-stage-8.md`.
