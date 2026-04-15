# 07 — Authentication

---

## Mechanism

JWT tokens. No OAuth, no email, no self-registration. Admins create users manually.

## Roles

| Role | Count | Capabilities |
|------|-----------|------------|
| admin | exactly 1 | Full CRUD: cards, links, photos, albums, users, settings, backups |
| viewer | unlimited | Read-only: tree, person cards, photo albums. No edit controls in the DOM |

## JWT

Library: `jose` (pure JS, no native dependencies).

Payload:
```typescript
{
  sub: "user-uuid",          // User ID
  role: "admin" | "viewer",  // Role
  iat: 1713000000,           // Issued at
  exp: 1715592000            // Expiration
}
```

TTL:
- “Remember me” = true: `SESSION_TTL_DAYS` (default 30)
- “Remember me” = false: 24 hours (session for the browser session)

Secret: env `JWT_SECRET` (at least 32 characters; generate with `openssl rand -hex 32`).

## Password hashing

Library: **`bcryptjs`** (bcrypt-compatible hashes), cost factor 12. Implementation in `auth.service.ts` — `hashSync` / `compareSync` inside async wrappers.

```typescript
import bcrypt from "bcryptjs";
const hash = bcrypt.hashSync(password, 12);
const valid = bcrypt.compareSync(password, hash);
```

## Rate limiting

Table `login_attempts`. On each login attempt:
1. Count failed attempts from this IP in the last `RATE_LIMIT_WINDOW_MINUTES` (default 15)
2. If >= `RATE_LIMIT_MAX_ATTEMPTS` (default 5) — respond 429
3. Record the attempt (success = true/false)
4. Periodically purge old rows (older than 24 hours)

## Middleware

```
Request --> Authorization: Bearer <token>?
  |
  +-- No --> 401 "Authentication required"
  |
  +-- Yes --> jwtVerify(token, secret)
                |
                +-- Invalid --> 401 "Invalid token"
                |
                +-- Valid --> db.users.findById(payload.sub)
                                  |
                                  +-- Not found --> 401
                                  +-- status=disabled --> 403 "Access suspended"
                                  +-- OK --> c.set('user', { id, login, role })
```

Admin-only middleware — extra check `user.role === 'admin'`, else 403.

## Security headers (HTTP)

Globally (`middleware/security-headers.ts`, wired in `index.ts` — **`app.use('*', securityHeaders)`**):

- **`Content-Security-Policy`** — SPA same origin: `default-src 'self'`, `script-src 'self'`, Google styles/fonts as in `packages/client/index.html`, `img-src` with **`data:`** and **`blob:`**, **`connect-src 'self'`** (for API on another origin see **`CSP_CONNECT_SRC_EXTRA`** in `.env.example`), **`object-src 'none'`**, **`worker-src 'none'`**, **`frame-ancestors 'none'`**, **`base-uri`**, **`form-action`**.
- **`X-Content-Type-Options: nosniff`**
- **`Referrer-Policy: strict-origin-when-cross-origin`**
- **`Permissions-Policy`** — camera/mic/geolocation/payment API disabled
- **`X-Frame-Options: DENY`**

## Token storage on the client

1. JWT kept in memory (`tokenInMemory`)
2. With “Remember me” — also `localStorage` key `ft_token`
3. On SPA load — check `localStorage`; if present — restore session via `GET /api/auth/me`
4. On logout — clear both stores
5. On 401 from any request — redirect to `/login`
6. On 403 “Access suspended” — redirect to `/disabled`

**Risks and mitigations:** any XSS on the origin can read `localStorage` — keep CSP strict, do not load third-party scripts, use **HTTPS** in production (`window.isSecureContext`). For “Remember me” outside a secure context a warning is logged. The **`storage`** event clears session in other tabs when one tab logs out (removes `ft_token`).

Dropping `localStorage` for **httpOnly** cookies would require API and client changes (`credentials`, CSRF/SameSite) — a separate phase if needed.

## Login page

Minimal:
- Title (service name from settings or default)
- `md-outlined-text-field` label="Login"
- `md-outlined-text-field` type="password" label="Password"
- `md-checkbox` “Remember me”
- `md-filled-button` “Sign in”
- On error: “Invalid login or password” (do not reveal which field failed)
- On rate limit: “Too many attempts. Try again in N minutes.”

## Password reset (emergency)

Via CLI / direct DB access:
```bash
docker compose exec family-tree node -e "
  const Database = require('better-sqlite3');
  const bcrypt = require('bcryptjs');
  const db = new Database('/data/db/family-tree.db');
  const hash = bcrypt.hashSync('NEW_PASSWORD', 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE role = ?').run(hash, 'admin');
  console.log('Password reset.');
"
```
