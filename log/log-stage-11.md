# Этап 11 — клиент: AuthProvider, useAuth, ky

**ROADMAP:** «Клиент: `AuthProvider` + `useAuth` hook — хранение JWT в памяти, persist в localStorage при "Запомнить меня", восстановление сессии при загрузке. API-клиент (ky) с JWT-интерцептором и обработкой 401/403».

## Сделано

### Хранение токена (`docs/07-auth.md`)

- **`src/lib/auth-token-store.ts`** — модульный **`memoryToken`**, **`getMemoryToken` / `setMemoryToken`**, константа **`LS_TOKEN_KEY = "ft_token"`** (ключ `localStorage`).

### API: `ky`

- **`src/api/client.ts`** — `ky.create`:
  - **`beforeRequest`**: заголовок **`Authorization: Bearer …`** из **`getMemoryToken()`**.
  - **`afterResponse`**:
    - **401** (кроме **`POST /api/auth/login`**): очистка памяти и LS, редирект на **`/login`** (если ещё не там). Определение «это логин» — по **`pathname`** URL (в т.ч. если `request.url` относительный, используется **`window.location.origin`** как база).
    - **403**: если в JSON **`error`** содержит *«приостановлен»* → редирект на **`/disabled`** (не путаем с 403 admin-only).
- **`src/api/auth.ts`** — **`loginRequest`**, **`fetchCurrentUser`** (`GET /api/auth/me`).
- **`prefixUrl`**: **`import.meta.env.VITE_API_BASE_URL ?? ""`** (пусто — относительные пути `/api/...`).

### `AuthProvider` + `useAuth`

- **`src/providers/AuthProvider.tsx`** — контекст: **`ready`**, **`token`**, **`user`**, **`login`**, **`logout`**.
  - При монтировании: если в LS есть токен — в память, **`fetchCurrentUser()`**, при ошибке — сброс.
  - **`login`**: запрос логина, обновление состояния; при **`remember`** — **`localStorage.setItem(LS_TOKEN_KEY, token)`**, иначе **`removeItem`**.
  - **`logout`**: очистка памяти, состояния, LS.
  - Синхронизация **`setMemoryToken(token)`** при смене **`token`** в state.
- **`src/hooks/useAuth.ts`** — реэкспорт **`useAuth`** (удобный путь по структуре ТЗ).

### Роутинг (минимум для редиректов)

- **`react-router-dom` v7**, **`BrowserRouter`** в **`main.tsx`**.
- **`App.tsx`**: на этапе 11 — минимальные маршруты и **`ready`**; в текущем репозитории — полное дерево роутов (см. актуальный файл).
- Страницы: **`LoginPage`**, **`DisabledPage`** и др. — доработаны в этапах **12+**.

### Vite

- **`vite.config.ts`**: **`server.proxy`** — **`/api` → `http://localhost:3000`** (локальная разработка без CORS).

### Env

- Корневой **`.env.example`**: комментарий к **`VITE_API_BASE_URL`**.
- **`src/vite-env.d.ts`**: тип для **`VITE_API_BASE_URL`**.

## Запуск (dev)

1. Сервер на **3000** с валидным **`JWT_SECRET`** и т.д.
2. Клиент: `npx pnpm@9.15.4 --filter @family-tree/client run dev` → **5173**, запросы **`/api/*`** проксируются на сервер.

## Проверка

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**12** — страница логина на Material Web, **`ProtectedRoute`**, редиректы — `ROADMAP.md`, `log-stage-12.md`.
