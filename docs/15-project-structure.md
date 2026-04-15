# 15 -- Структура проекта

---

```
family-tree/
|-- README.md                       <- Главное ТЗ
|-- ROADMAP.md                      <- 50 этапов работы
|-- docs/                           <- Документация (этот каталог)
|-- package.json                    <- Корневой workspace
|-- pnpm-workspace.yaml
|-- pnpm-lock.yaml
|-- docker-compose.yml
|-- Dockerfile
|-- Caddyfile
|-- .env.example
|-- .gitignore
|
|-- packages/
|   |-- shared/                     <- Общие типы и утилиты
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- src/
|   |       |-- index.ts
|   |       |-- types/
|   |       |   |-- person.ts          Person, PersonCreate, PersonUpdate
|   |       |   |-- relationship.ts    Relationship, RelType
|   |       |   |-- user.ts            User, UserRole, AuthPayload
|   |       |   |-- photo.ts           Photo, Album, TaggedPerson
|   |       |   |-- api.ts             ApiResponse<T>, PaginatedResponse<T>
|   |       |-- validation/
|   |       |   |-- person.ts          Zod-схемы
|   |       |   |-- relationship.ts
|   |       |   |-- user.ts
|   |       |   |-- photo.ts
|   |       |-- utils/
|   |       |   |-- tree-compute.ts    BFS, findShortestPath
|   |       |   |-- relationship-labels.ts  Паттерн -> русское название
|   |       |   |-- zodiac.ts          Западный знак зодиака
|   |       |   |-- chinese-year.ts    Год животного
|   |       |   |-- age.ts             Вычисление возраста
|   |       |   |-- date-format.ts     Русская локаль дат
|   |       |   |-- countries.ts       ISO -> флаг
|   |
|   |-- server/                     <- Hono API
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- drizzle.config.ts
|   |   |-- src/
|   |       |-- index.ts               Точка входа, Hono app
|   |       |-- db/
|   |       |   |-- schema.ts          Drizzle-схема (все таблицы)
|   |       |   |-- connection.ts      SQLite подключение + pragmas
|   |       |   |-- seed.ts            Создание admin
|   |       |   |-- migrate.ts         Автоматические миграции
|   |       |   |-- migrations/        Сгенерированные SQL
|   |       |-- routes/
|   |       |   |-- auth.ts            POST /login, GET /me
|   |       |   |-- persons.ts         CRUD /persons
|   |       |   |-- relationships.ts   CRUD /relationships
|   |       |   |-- tree.ts            GET /tree/:personId
|   |       |   |-- albums.ts          CRUD /albums
|   |       |   |-- photos.ts          Upload, tag, file serving
|   |       |   |-- users.ts           CRUD /users (admin)
|   |       |   |-- settings.ts        GET/PUT /settings
|   |       |   |-- backup.ts          Backup CRUD
|   |       |-- middleware/
|   |       |   |-- auth.ts            JWT проверка, роли
|   |       |   |-- rate-limit.ts      Лимит попыток логина
|   |       |   |-- upload.ts          Multipart, MIME-валидация
|   |       |-- services/
|   |       |   |-- auth.service.ts    JWT sign/verify, bcrypt
|   |       |   |-- person.service.ts  CRUD + поиск дубликатов
|   |       |   |-- relationship.service.ts  CRUD + валидация + BFS
|   |       |   |-- tree.service.ts    Построение подграфа
|   |       |   |-- photo.service.ts   sharp, exifr, файловая система
|   |       |   |-- user.service.ts    CRUD пользователей
|   |       |   |-- backup.service.ts  Архивация, список, удаление
|   |       |-- utils/
|   |           |-- errors.ts          AppError class
|   |           |-- file.ts            Путь, MIME, directory traversal guard
|   |
|   |-- client/                     <- Vite + React SPA
|       |-- package.json
|       |-- tsconfig.json
|       |-- vite.config.ts
|       |-- index.html                 Шрифты, Material Symbols
|       |-- src/
|           |-- main.tsx               ReactDOM.createRoot + Router, typescale
|           |-- material-imports.ts    Side-effect импорты @material/web
|           |-- App.tsx                Router, AuthProvider
|           |-- styles/
|           |   |-- global.css         M3 токены, Tailwind
|           |-- types/
|           |   |-- material-web.d.ts  JSX declarations для <md-*>
|           |-- api/
|           |   |-- client.ts          ky instance + JWT interceptor
|           |   |-- persons.ts         API-функции
|           |   |-- relationships.ts
|           |   |-- albums.ts
|           |   |-- photos.ts
|           |   |-- users.ts
|           |   |-- tree.ts
|           |   |-- auth.ts
|           |   |-- settings.ts
|           |   |-- backup.ts
|           |-- hooks/
|           |   |-- useAuth.ts         AuthProvider + useAuth
|           |   |-- usePersons.ts
|           |   |-- useTree.ts
|           |   |-- useDebounce.ts
|           |-- components/
|           |   |-- ui/
|           |   |   |-- DataTable.tsx      TanStack Table + M3
|           |   |   |-- Accordion.tsx      Сворачиваемая секция
|           |   |   |-- FileDropzone.tsx   Drag & drop загрузка
|           |   |   |-- EmptyState.tsx     Пустое состояние
|           |   |   |-- ConfirmDialog.tsx  md-dialog подтверждения
|           |   |   |-- SearchField.tsx    md-outlined-text-field + debounce
|           |   |   |-- ColorPicker.tsx    Выбор акцентного цвета
|           |   |-- layout/
|           |   |   |-- AppShell.tsx       Sidebar + main area
|           |   |   |-- Sidebar.tsx        Навигация
|           |   |   |-- Header.tsx         Заголовок страницы
|           |   |   |-- ProtectedRoute.tsx Auth guard
|           |   |-- tree/
|           |   |   |-- FamilyTree.tsx     React Flow canvas
|           |   |   |-- PersonNode.tsx     Кастомная нода
|           |   |   |-- DeadPersonNode.tsx Ч/б нода
|           |   |   |-- ExternalNode.tsx   Пунктирная рамка
|           |   |   |-- SpouseEdge.tsx     Двойная линия
|           |   |   |-- TreeControls.tsx   Режимы, фильтры
|           |   |   |-- TreeFilters.tsx    Страна, статус, поиск
|           |   |   |-- useTreeLayout.ts   ELK layout hook
|           |   |-- person/
|           |   |   |-- PersonCard.tsx     Полный профиль
|           |   |   |-- PersonHeader.tsx   Шапка
|           |   |   |-- RelativesBlock.tsx Вычисленные родственники
|           |   |   |-- InfoGraphics.tsx   Зодиак, возраст
|           |   |   |-- BioBlock.tsx
|           |   |   |-- ContactsBlock.tsx
|           |   |   |-- CustomFieldsBlock.tsx
|           |   |   |-- PersonAlbums.tsx
|           |   |-- admin/
|           |   |   |-- PersonForm.tsx
|           |   |   |-- PersonsTable.tsx
|           |   |   |-- RelationshipForm.tsx
|           |   |   |-- RelationshipsTable.tsx
|           |   |   |-- UserForm.tsx
|           |   |   |-- UsersTable.tsx
|           |   |   |-- AlbumForm.tsx
|           |   |   |-- PhotoUploader.tsx
|           |   |   |-- PhotoTagger.tsx
|           |   |   |-- SettingsForm.tsx
|           |   |-- photo/
|           |       |-- AlbumGrid.tsx
|           |       |-- PhotoGallery.tsx
|           |       |-- PhotoOverlay.tsx
|           |       |-- PhotoMeta.tsx
|           |-- pages/
|           |   |-- LoginPage.tsx
|           |   |-- DisabledPage.tsx
|           |   |-- TreePage.tsx
|           |   |-- PersonPage.tsx
|           |   |-- AlbumsPage.tsx
|           |   |-- AlbumPage.tsx
|           |   |-- WelcomePage.tsx
|           |   |-- admin/
|           |       |-- AdminPersonsPage.tsx
|           |       |-- AdminPersonEditPage.tsx
|           |       |-- AdminRelationshipsPage.tsx
|           |       |-- AdminUsersPage.tsx
|           |       |-- AdminAlbumsPage.tsx
|           |       |-- AdminSettingsPage.tsx
|           |       |-- AdminBackupPage.tsx
|           |-- lib/
|               |-- tree-compute.ts    Реэкспорт из shared
|               |-- cn.ts             clsx + tailwind-merge
|
|-- scripts/
|   |-- backup.sh                   Cron-скрипт бэкапа
|
|-- data/                           <- Docker volume (не в git)
    |-- db/
    |   |-- family-tree.db
    |-- photos/
    |-- backups/
```
