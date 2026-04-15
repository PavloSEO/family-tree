# Этап 13 — клиент: `AppShell`, боковая навигация (Material Web)

**ROADMAP:** «Клиент: `AppShell` — layout с боковой навигацией (Material Web `md-list` + `md-list-item` для пунктов меню) и основной областью. Sidebar: иконки Material Symbols + текст, подсветка активного пункта через `md-ripple`».

## Сделано

### `AppShell`

- **`packages/client/src/components/layout/AppShell.tsx`** — flex-layout: боковая панель **280px** + **`main`** с **`Outlet`**.
- Шапка панели: название приложения, подпись «Навигация».
- Низ панели: **`md-text-button`** «Выйти» (вызов **`useAuth().logout`**), перенесён с главной страницы.

### Навигация (MW)

- **`md-list`** + **`md-list-item`** с **`type="button"`** (интерактивный тип: внутри list-item рендерится **`md-ripple`** — см. `material-web-main/list/internal/listitem/list-item.ts`).
- Иконки: **`md-icon`** в слоте **`start`**, класс **`material-symbols-outlined`**.
- Текст пункта: атрибут **`headline`**.
- **`md-divider`** между основным разделом и блоком «Администрирование».

### Подсветка активного пункта

- Для каждого пункта задаётся функция **`match(pathname)`** (файл **`shell-nav.ts`**).
- На активном **`md-list-item`**: **`aria-selected={true}`** и класс **`app-shell__nav-item--active`** (фон **`secondary-container`**, скругление в **`global.css`**).

### Конфиг пунктов меню

- **`packages/client/src/components/layout/shell-nav.ts`** — пути как в **`docs/01-architecture.md`** (после этапа 14: **`SHELL_NAV_ADMIN_MAIN`**, **`SHELL_NAV_VIEWER_MAIN`**, **`shellMainNavForRole`** — см. [log-stage-14.md](./log-stage-14.md)).

### Роутинг под `AppShell`

- **`App.tsx`**: общая обёртка **`ProtectedRoute` → `AppShell`**, внутри вложенные маршруты из архитектуры (см. актуальный **`App.tsx`**). Заглушка **`ShellPlaceholderPage.tsx`** удалена как неиспользуемая.

### Стили оболочки

- Цвета/границы сайдбара и **`main`** — классы **`app-shell__sidebar`**, **`app-shell__main`**, **`app-shell__footer`**, **`app-shell__brand-*`**, **`app-shell__admin-heading`** в **`global.css`**; в **`AppShell.tsx`** Tailwind только для layout.

### `HomePage`

- Контент для области **`main`** без полноэкранного центрирования; кнопка выхода убрана (дублировала shell).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**14** — **`AdminOnlyRoute`**, навигация по роли (admin / viewer) — `ROADMAP.md`, [log-stage-14.md](./log-stage-14.md).
