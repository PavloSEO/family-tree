# 01 -- Архитектура

---

## Общая схема

```
Browser (SPA)                 Docker Container
+-------------------+         +-----------------------------+
|  React 19         |  fetch  |  Hono Server (port 3000)    |
|  @material/web    | ------> |                             |
|  React Flow       |         |  /api/*  -->  route handlers |
|  Vite build       |         |  /*      -->  static SPA    |
+-------------------+         |                             |
                              |  SQLite (file /data/db/)    |
                              |  Photos (dir /data/photos/) |
                              +-----------------------------+
                                        |
                              +-----------------------------+
                              |  Caddy (ports 80, 443)      |
                              |  reverse_proxy :3000        |
                              |  auto HTTPS (Let's Encrypt) |
                              +-----------------------------+
```

## Принципы

**SPA-only.** Вся навигация, рендер, состояние -- на клиенте. Сервер -- чистый API + раздача статики. Никакого SSR.

**Один процесс.** Hono-сервер в Node.js обслуживает и API, и статику SPA. SQLite -- in-process через better-sqlite3.

**Монорепо.** Три пакета в pnpm workspace:

| Пакет | Назначение |
|-------|-----------|
| `packages/shared` | Типы, Zod-схемы, утилиты (BFS, зодиак). Используется и сервером, и клиентом |
| `packages/server` | Hono API, Drizzle ORM, бизнес-логика, обработка фото |
| `packages/client` | Vite + React SPA, Material Web, React Flow |

## Клиентский роутинг

```
/login                        -- LoginPage (публичный)
/disabled                     -- DisabledPage (публичный)
/tree                         -- TreePage (auth: admin + viewer)
/person/:id                   -- PersonPage (auth: admin + viewer)
/albums                       -- AlbumsPage (auth: admin + viewer)
/album/:id                    -- AlbumPage (auth: admin + viewer)
/admin/persons                -- AdminPersonsPage (admin only)
/admin/persons/new            -- AdminPersonEditPage (admin only)
/admin/persons/:id/edit       -- AdminPersonEditPage (admin only)
/admin/relationships          -- AdminRelationshipsPage (admin only)
/admin/users                  -- AdminUsersPage (admin only)
/admin/albums                 -- AdminAlbumsPage (admin only)
/admin/settings               -- AdminSettingsPage (admin only)
/admin/backup                 -- AdminBackupPage (admin only)
/welcome                      -- WelcomePage (auth, пустая база)
```

## Потоки данных

**Авторизация:**
```
LoginPage --> POST /api/auth/login --> JWT token
          --> хранение в памяти (+ localStorage при "Запомнить")
          --> все запросы с Authorization: Bearer <token>
          --> middleware проверяет JWT + статус пользователя
```

**CRUD (пример):**
```
PersonForm --> POST /api/persons (JSON) --> Zod-валидация --> Drizzle INSERT --> 201
```

**Дерево:**
```
TreePage --> GET /api/tree/:rootId?mode=full --> BFS от root --> { nodes[], edges[] }
         --> ELK layout --> React Flow render
```
