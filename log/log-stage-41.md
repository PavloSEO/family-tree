# Этап 41 — сервер: CRUD пользователей

**ROADMAP:** CRUD для **users** (только **admin**), нельзя создать второго **admin**, деактивация (**`disabled`**), удаление, маршруты **`GET/POST/PUT/DELETE /api/users`**.

## Сделано

### Сервис

- **`packages/server/src/services/user.service.ts`** — **`listUsers`**, **`getUserById`**, **`createUser`** / **`updateUser`** / **`deleteUser`** с Zod (**`userCreateSchema`**, **`userUpdateSchema`**) и ответом **`User`** (**`userPublicSchema`**).
- Бизнес-правила:
  - не более **одного** пользователя с **`role: admin`** (создание и повышение до admin → **409** **`SecondAdminError`**);
  - нельзя понизить / отключить / удалить **последнего** администратора (**`LastAdminError`**);
  - нельзя **удалить себя**, **деактивировать себя**, снять с **себя** роль admin (**`SelfActionError`**);
  - уникальность логина (**`DuplicateLoginError`** / **409** при создании);
  - проверка **`linkedPersonId`** по таблице **`persons`**.
- Пароль: **`hashPassword`** из **`auth.service.ts`**.

### Маршруты

- **`packages/server/src/routes/users.ts`** — все с **`requireAuth`** + **`requireAdmin`**:
  - **`GET /`**, **`GET /:id`**, **`POST /`**, **`PUT /:id`**, **`DELETE /:id`** (**204** без тела).
- **`packages/server/src/index.ts`** — **`app.route("/api/users", userRoutes)`**.

### Документация

- **`docs/06-api.md`** — раздел **Users** с таблицей маршрутов и текстовыми ограничениями.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Следующий этап

**42** — клиент: **`AdminUsersPage`** — `ROADMAP.md`, [log-stage-42.md](./log-stage-42.md).
