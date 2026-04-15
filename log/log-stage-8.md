# Этап 08 — маршруты `/api/auth/login` и `/api/auth/me`

**ROADMAP:** «Сервер: route `POST /api/auth/login` — принимает `{ login, password, remember }`, проверяет credentials, возвращает JWT + user object. Route `GET /api/auth/me` — возвращает текущего пользователя по JWT».

## Сделано

### `src/routes/auth.ts`

Экспорт **`authRoutes`** (под-приложение Hono), монтируется в **`src/index.ts`** как **`app.route("/api/auth", authRoutes)`**.

| Метод | Путь (полный) | Тело / заголовки | Успех | Ошибки |
|-------|----------------|------------------|--------|--------|
| **POST** | `/api/auth/login` | JSON `{ login, password, remember? }` (`remember` по умолчанию `false`, Zod) | **`{ token, user }`** (без `passwordHash`) | 400 тело, 401 неверные данные, 403 disabled, **429** слишком много неудачных попыток с IP (см. `login-rate-limit.service`), 500 нет/короткий `JWT_SECRET` |
| **GET** | `/api/auth/me` | `Authorization: Bearer <jwt>` | **`{ user }`** | 401 нет/невалидный токен, 403 disabled |

Сообщения об ошибках в формате **`{ error: string }`** (как в `docs/06-api.md`).

### Логика

- Поиск пользователя по **`login`**, проверка пароля через **`verifyPassword`** из `auth.service`.
- Перед проверкой пароля: **`purgeOldLoginAttempts`**, подсчёт неудачных попыток с IP; при превышении лимита — **429** и запись попытки (см. **`login-rate-limit.service.ts`**; ROADMAP этап **10** дополняет политику, но вызов уже здесь).
- Успешный логин: **`signToken`** с **`remember`**, обновление **`last_login_at`** через `datetime('now')`.
- **`/me`**: middleware **`requireAuth`** (этап **09**) — **`verifyToken`**, пользователь из БД, сверка **`role`**, без пароля в ответе.

### Зависимости

- Прямая зависимость **`zod`** в `packages/server` для тела логина.

## Зависимости от соседних этапов (в текущем коде)

- **`requireAuth`** для **`GET /me`** — middleware этапа **09** (повторное использование на других маршрутах).
- Лимит попыток логина (таблица **`login_attempts`**, **429**) — логика сервиса вызывается из **`auth.ts`**; этап **10** в ROADMAP описывает политику rate limit целиком.

## Проверка (локально)

Нужны рабочие SQLite + bcrypt, **`JWT_SECRET`** (≥ 32 символов), в БД — пользователь (например после seed).

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run dev
# или после build:
npx pnpm@9.15.4 --filter @family-tree/server run start
```

Пример запросов:

```bash
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"login\":\"admin\",\"password\":\"...\",\"remember\":false}"
curl -s http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```

## Следующий этап

**09** — middleware авторизации и **admin-only** — `ROADMAP.md`, `log-stage-9.md`.
