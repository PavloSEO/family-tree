# 07 -- Авторизация

---

## Механизм

JWT-токены. Без OAuth, без email, без регистрации. Администратор создает пользователей вручную.

## Роли

| Роль | Количество | Возможности |
|------|-----------|------------|
| admin | ровно 1 | Полный CRUD: карточки, связи, фото, альбомы, пользователи, настройки, бэкапы |
| viewer | неограниченно | Только просмотр: дерево, карточки, фотоальбомы. Нет кнопок редактирования в DOM |

## JWT

Библиотека: `jose` (чистый JS, без native dependencies).

Payload:
```typescript
{
  sub: "user-uuid",          // ID пользователя
  role: "admin" | "viewer",  // Роль
  iat: 1713000000,           // Issued at
  exp: 1715592000            // Expiration
}
```

TTL:
- "Запомнить меня" = true: `SESSION_TTL_DAYS` дней (default 30)
- "Запомнить меня" = false: 24 часа (сессия на время работы браузера)

Секрет: env `JWT_SECRET` (минимум 32 символа, генерировать через `openssl rand -hex 32`).

## Хэширование паролей

Библиотека: `bcrypt`, cost factor 12.

```typescript
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(password, hash);
```

## Rate limiting

Таблица `login_attempts`. При каждой попытке логина:
1. Проверить количество неудачных попыток с данного IP за последние `RATE_LIMIT_WINDOW_MINUTES` минут (default 15)
2. Если >= `RATE_LIMIT_MAX_ATTEMPTS` (default 5) -- ответ 429
3. Записать попытку (success = true/false)
4. Периодически чистить старые записи (старше 24 часов)

## Middleware

```
Запрос --> Authorization: Bearer <token>?
  |
  +-- Нет --> 401 "Требуется авторизация"
  |
  +-- Есть --> jwtVerify(token, secret)
                |
                +-- Невалидный --> 401 "Невалидный токен"
                |
                +-- Валидный --> db.users.findById(payload.sub)
                                  |
                                  +-- Не найден --> 401
                                  +-- status=disabled --> 403 "Доступ приостановлен"
                                  +-- OK --> c.set('user', { id, login, role })
```

Admin-only middleware -- дополнительная проверка `user.role === 'admin'`, иначе 403.

## Заголовки безопасности (HTTP)

Глобально (`middleware/security-headers.ts`): **`Content-Security-Policy`**, **`X-Content-Type-Options: nosniff`**, **`Referrer-Policy: strict-origin-when-cross-origin`**, **`Permissions-Policy`** (отключены камера/микрофон/геолокация/платежи API браузера), **`X-Frame-Options: DENY`** (в т.ч. для клиентов без полноценного CSP).

## Хранение токена на клиенте

1. JWT хранится в переменной в памяти (`tokenInMemory`)
2. При "Запомнить меня" -- дублируется в `localStorage` ключ `ft_token`
3. При загрузке SPA -- проверка `localStorage`, если есть -- восстановление сессии через `GET /api/auth/me`
4. При logout -- очистка обоих хранилищ
5. При 401 от любого запроса -- автоматический редирект на `/login`
6. При 403 "Доступ приостановлен" -- редирект на `/disabled`

**Риски и смягчения:** любой XSS на origin может прочитать `localStorage` — держите CSP строгим, не подключайте сторонние скрипты, в проде только **HTTPS** (`window.isSecureContext`). Для «Запомнить» при старте вне secure context в консоль пишется предупреждение. Событие **`storage`** используется, чтобы при выходе в одной вкладке сбросить сессию в остальных (удаление `ft_token`).

Полный отказ от `localStorage` в пользу **httpOnly**-cookie потребует доработки API и клиента (`credentials`, CSRF/SameSite) — отдельный этап, если понадобится.

## Страница логина

Минимальная:
- Заголовок (название сервиса из settings или default)
- `md-outlined-text-field` label="Логин"
- `md-outlined-text-field` type="password" label="Пароль"
- `md-checkbox` "Запомнить меня"
- `md-filled-button` "Войти"
- При ошибке: "Неверный логин или пароль" (не раскрывать что именно)
- При rate limit: "Слишком много попыток. Попробуйте через N минут."

## Сброс пароля (аварийный)

Через CLI/прямой доступ к БД:
```bash
docker compose exec family-tree node -e "
  const Database = require('better-sqlite3');
  const bcrypt = require('bcrypt');
  const db = new Database('/data/db/family-tree.db');
  const hash = bcrypt.hashSync('NEW_PASSWORD', 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE role = ?').run(hash, 'admin');
  console.log('Password reset.');
"
```
