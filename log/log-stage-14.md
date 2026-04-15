# Этап 14 — клиент: роуты по ТЗ, `adminOnly`, навигация по роли

**ROADMAP:** «React Router 7 — все роуты из `docs/01-architecture.md`. Вложенные routes: `/(admin)/*` защищены `adminOnly`. Навигация sidebar зависит от роли (admin видит все разделы, viewer — только Дерево и Фотоальбомы)».

## Сделано

### Роуты

- Базовый список путей — **`docs/01-architecture.md`**; этап 14 добавляет **защиту и UX по роли**. В текущем **`App.tsx`** также есть вложенные маршруты вне краткой таблицы доки (например **`/tree/:personId`**, **`/admin/relationships/new`**, **`/album/:albumId/photo/:photoId`**) — по мере этапов 15+.
- Все маршруты **`/admin/*`** обёрнуты в **pathless layout** с **`element={<AdminOnlyRoute />}`** — дочерние **`path="admin/..."`** рендерятся только при **`user.role === "admin"`**.

### `AdminOnlyRoute`

- **`packages/client/src/components/layout/AdminOnlyRoute.tsx`** — при отсутствии прав редирект **`Navigate`** на **`/`** (без утечки структуры админки).

### Навигация (`AppShell`)

- **`shell-nav.ts`**: константы **`SHELL_NAV_VIEWER_MAIN`** (только **Дерево** и **Фотоальбомы**), **`SHELL_NAV_ADMIN_MAIN`** (Главная, Дерево, Фотоальбомы, Приветствие), **`SHELL_NAV_ADMIN`**; функции **`shellMainNavForRole`**, **`shellAdminNavForRole`**.
- **`AppShell`**: блок «Администрирование» и второй **`md-list`** показываются только если **`shellAdminNavForRole`** не пустой; при **`!user`** — **`null`** (под **`ProtectedRoute`** не ожидается).

### Корень `/` для viewer

- **`packages/client/src/pages/RootAuthLanding.tsx`** — индексный маршрут: при **`role === "viewer"`** редирект на **`/tree`**, иначе **`HomePage`** (админ остаётся на привычной главной).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**15** — UI-примитивы MW (**`MdButton`**, **`MdTextField`**, …) и **`material-web.d.ts`** — `ROADMAP.md`, [log-stage-15.md](./log-stage-15.md).
