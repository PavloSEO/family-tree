# Этап 42 — клиент: админка пользователей

**ROADMAP:** **`AdminUsersPage`** — **`DataTable`**, колонки: логин, роль, статус, привязанная карточка, дата создания, последний вход; создание через **`md-dialog`**.

## Сделано

### API клиента

- **`packages/client/src/api/users.ts`** — **`fetchUsersList`**, **`createUser`**, **`updateUser`**, **`deleteUser`** (`GET/POST/PUT/DELETE /api/users`), разбор **`userPublicSchema`** с приведением типов как в других клиентских API.

### Страница

- **`packages/client/src/pages/AdminUsersPage.tsx`**:
  - загрузка списка пользователей и до **500** персон для подписей и **`MdSelect`** привязки;
  - поиск по логину (debounce), сортировка и пагинация **на клиенте** поверх общего списка;
  - колонки: логин, роль и статус (подписи по-русски), карточка (ссылка на **`/person/:id`** или «—»), даты **`createdAt`** / **`lastLoginAt`** (**`formatDateTimeRu`**);
  - **FAB** «Создать пользователя» и **`MdDialog`**: логин, пароль (обязателен при создании, при редактировании — опционально), роль (**опция «Администратор»** отключена, если в системе уже есть admin и редактируем не его), статус, привязка к карточке;
  - редактирование и удаление (**`MdDialog`** подтверждения); удаление себя отключено в UI.

### Маршрут

- **`packages/client/src/App.tsx`** — **`/admin/users`** → **`AdminUsersPage`** вместо заглушки.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**43** — сервер: **`GET/PUT /api/settings`** — `ROADMAP.md`, `log-stage-43.md`.
