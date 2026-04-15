# Этап 10 — rate limit логина

**ROADMAP:** «Сервер: rate limiting — таблица `login_attempts`, проверка 5 попыток / 15 минут по IP, ответ 429 при превышении».

## Сделано

### `src/services/login-rate-limit.service.ts`

| Экспорт | Назначение |
|---------|------------|
| **`getRequestIp(c)`** | IP из **`X-Forwarded-For`** (первый), иначе **`X-Real-IP`**, иначе **`getConnInfo`** (`@hono/node-server/conninfo`), иначе **`unknown`**. |
| **`getRateLimitMaxAttempts()`** | env **`RATE_LIMIT_MAX_ATTEMPTS`**, default **5**, верхняя граница 1000. |
| **`getRateLimitWindowMinutes()`** | env **`RATE_LIMIT_WINDOW_MINUTES`**, default **15**, max **1440**. |
| **`countRecentFailedLogins(ip)`** | `COUNT(*)` по **`login_attempts`**: тот же IP, **`success = false`**, **`attempted_at`** строго после **`datetime('now', '-N minutes')`** (SQLite). |
| **`recordLoginAttempt({ ip, login, success })`** | вставка строки с **`datetime('now')`** для `attempted_at`. |
| **`purgeOldLoginAttempts()`** | `DELETE` записей старше **24 часов** (при каждом `POST /login` до проверки лимита). |

### `src/routes/auth.ts` (`POST /api/auth/login`)

1. После валидации тела — **`purgeOldLoginAttempts`**, **`countRecentFailedLogins(ip)`**.
2. Если **`count >= maxAttempts`** — запись неудачной попытки, ответ **429** с текстом из ТЗ: *«Слишком много попыток. Попробуйте через N минут.»* (`N` = окно в минутах).
3. Неверный пароль / нет пользователя / **disabled** / ошибка выдачи JWT — **`recordLoginAttempt(..., success: false)`** перед соответствующим ответом.
4. Успешный вход — **`recordLoginAttempt(..., success: true)`** перед **`{ token, user }`**.

### Конфигурация

- **`.env.example`** — заданы по умолчанию **`RATE_LIMIT_MAX_ATTEMPTS`**, **`RATE_LIMIT_WINDOW_MINUTES`** (строки не закомментированы).
- **`docker-compose.yml`** — те же переменные с дефолтами для контейнера.

## Проверка

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

Шестой подряд неудачный логин с одного IP (при дефолтах **5** неудач в окне) должен вернуть **429** ещё до проверки пароля.

## Следующий этап

**11** — клиент: **`AuthProvider`**, **`useAuth`**, ky + JWT, **401/403** — `ROADMAP.md`, `log-stage-11.md`.
