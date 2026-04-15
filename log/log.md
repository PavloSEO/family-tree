# Журнал работ по ROADMAP

Короткий индекс: что сделано по этапам, ссылки на детальные файлы. Порядок этапов — как в `ROADMAP.md` (строго по номерам).

## Индекс этапов

| Этап | Файл журнала | Кратко |
|------|----------------|--------|
| 01 | [log-stage-1.md](./log-stage-1.md) | pnpm workspace: `packages/shared`, `server`, `client` |
| 02 | [log-stage-2.md](./log-stage-2.md) | `shared`: TypeScript, Zod, типы API, экспорт из `index.ts` |
| 03 | [log-stage-3.md](./log-stage-3.md) | `server`: Hono, better-sqlite3, Drizzle `schema` + `connection`, `drizzle.config` |
| 04 | [log-stage-4.md](./log-stage-4.md) | `migrate.ts`, `seed.ts`, CLI, bootstrap при импорте `index` |
| 05 | [log-stage-5.md](./log-stage-5.md) | Client: Vite 6, React 19, MW, `global.css`, Tailwind 4 |
| 06 | [log-stage-6.md](./log-stage-6.md) | Docker multi-stage, compose + volumes, `.env.example`, `serve` + server `build` |
| 07 | [log-stage-7.md](./log-stage-7.md) | `auth.service.ts`: bcrypt + jose, JWT payload |
| 08 | [log-stage-8.md](./log-stage-8.md) | `POST /api/auth/login`, `GET /api/auth/me` |
| 09 | [log-stage-9.md](./log-stage-9.md) | `requireAuth`, `requireAdmin`, тип `AuthUser` в Hono |
| 10 | [log-stage-10.md](./log-stage-10.md) | Rate limit логина, `login_attempts`, 429 |
| 11 | [log-stage-11.md](./log-stage-11.md) | AuthProvider, useAuth, ky + JWT, 401/403, proxy |
| 12 | [log-stage-12.md](./log-stage-12.md) | LoginPage (MW), ProtectedRoute, редирект на `/login` |
| 13 | [log-stage-13.md](./log-stage-13.md) | AppShell, `md-list` / `md-list-item`, Outlet, заглушки роутов |
| 14 | [log-stage-14.md](./log-stage-14.md) | `AdminOnlyRoute`, навигация по роли, редирект viewer с `/` |
| 15 | [log-stage-15.md](./log-stage-15.md) | `MdButton`, `MdTextField`, `MdSelect`, `MdDialog`, `MdChip`; d.ts |
| 16 | [log-stage-16.md](./log-stage-16.md) | `DataTable` (TanStack Table 8), M3 CSS, демо `/admin/persons` |
| 17 | [log-stage-17.md](./log-stage-17.md) | `person.service`: CRUD, LIKE, country/status, пагинация, Zod |
| 18 | [log-stage-18.md](./log-stage-18.md) | `/api/persons` CRUD + duplicates; мутации только admin |
| 19 | [log-stage-19.md](./log-stage-19.md) | `AdminPersonsPage`, DataTable + API, FAB, удаление в `MdDialog` |
| 20 | [log-stage-20.md](./log-stage-20.md) | `PersonForm` (RHF + Zod), аккордеоны, `AdminPersonEditPage`, CRUD API в клиенте |
| 21 | [log-stage-21.md](./log-stage-21.md) | `POST /api/persons/:id/photo` (sharp, 300px, `main.jpg`), `GET /api/photos/file/...`, `PHOTOS_PATH` |
| 22 | [log-stage-22.md](./log-stage-22.md) | `PersonPage` (readonly), `md-elevated-card` / `md-divider` / `md-chip`, `mainPhotoSrc` в lib |
| 23 | [log-stage-23.md](./log-stage-23.md) | `relationship.service.ts`: CRUD, дубликаты, 2 родителя, цикл, warnings |
| 24 | [log-stage-24.md](./log-stage-24.md) | `/api/relationships` GET/POST/PUT/DELETE, каскад связей при удалении person |
| 25 | [log-stage-25.md](./log-stage-25.md) | `AdminRelationshipsPage`, DataTable, имена из списка persons, удаление |
| 26 | [log-stage-26.md](./log-stage-26.md) | `RelationshipForm`, `md-menu` autocomplete, `/admin/relationships/new`, FAB |
| 27 | [log-stage-27.md](./log-stage-27.md) | `tree-compute.ts`, Vitest, `GET /api/persons/:id/relatives`, блок «Родственники» на `PersonPage` |
| 28 | [log-stage-28.md](./log-stage-28.md) | `tree.service.ts`, Zod tree API, `GET /api/tree/:personId` |
| 29 | [log-stage-29.md](./log-stage-29.md) | `@xyflow/react`, `FamilyTree`, `/tree`, `/tree/:personId`, ссылка с `PersonPage` |
| 30 | [log-stage-30.md](./log-stage-30.md) | `PersonNode`, `DeadPersonNode`, `ExternalNode`; `ParentTreeEdge`, `SpouseEdge`, `ExternalTreeEdge` |
| 31 | [log-stage-31.md](./log-stage-31.md) | `elkjs`, `useTreeLayout`, compound-супруги, layered DOWN + fallback-сетка |
| 32 | [log-stage-32.md](./log-stage-32.md) | `TreeControls`: режимы (MW labs segmented set), глубина (`md-slider`), «Сбросить вид» |
| 33 | [log-stage-33.md](./log-stage-33.md) | `TreeFilters`: select страна/статус/ветка, поиск по имени, подсветка + `setCenter` |
| 34 | [log-stage-34.md](./log-stage-34.md) | Клик → `/person`, двойной клик → `/tree` с query; внешние свернуты + `md-icon-button` ± |
| 35 | [log-stage-35.md](./log-stage-35.md) | CRUD `albums` + `photos`, `POST /photos/upload`, Sharp + exifr, пути `album/...` в safe resolver |
| 36 | [log-stage-36.md](./log-stage-36.md) | Раздача `/photos/file/...`, теги `POST/DELETE .../tag`, `GET /photos/:id` + `tags`, Zod `PhotoTag` |
| 37 | [log-stage-37.md](./log-stage-37.md) | `AdminAlbumsPage`: сетка карточек, обложка через `coverThumbnail`, диалог создания; `listAlbums` → `AlbumListItem[]` |
| 38 | [log-stage-38.md](./log-stage-38.md) | `PhotoUploader` (DnD, превью, `md-linear-progress`, multi); `AlbumPage`, `fetchAlbumWithPhotos`, XHR `uploadAlbumPhoto` |
| 39 | [log-stage-39.md](./log-stage-39.md) | `PhotoTagger` (canvas рамка, теги DOM, `md-menu` + поиск); `AlbumPhotoTagPage`, API tag CRUD, ссылки с `AlbumPage` |
| 40 | [log-stage-40.md](./log-stage-40.md) | `PhotoGallery` (YA Lightbox + Zoom, оверлей тегов); `AlbumsBrowsePage`, `/albums`; `AlbumPage` + `PersonPage` — альбомы владельца |
| 41 | [log-stage-41.md](./log-stage-41.md) | CRUD `/api/users` (admin): `user.service`, один admin, защита последнего admin и self-delete/self-disable |
| 42 | [log-stage-42.md](./log-stage-42.md) | `AdminUsersPage`: DataTable, поиск/сорт/страницы на клиенте, FAB + `MdDialog` создать/редактировать, `api/users.ts` |
| 43 | [log-stage-43.md](./log-stage-43.md) | `GET/PUT /api/settings`, Zod `AppSettings`, таблица `settings`, defaults + upsert |
| 44 | [log-stage-44.md](./log-stage-44.md) | `AdminSettingsPage`, `api/settings.ts`, MW sliders/switch + color picker |
| 45 | [log-stage-45.md](./log-stage-45.md) | Shared: `zodiac`, `chinese-year`, `age`, `date-format` + Vitest |
| 46 | [log-stage-46.md](./log-stage-46.md) | `PersonPage`: `InfoGraphics`, `ContactsBlock`, `CustomFieldsBlock` |
| 47 | [log-stage-47.md](./log-stage-47.md) | `/api/backup`: tar.gz DB + `photos/`, `archiver`, `BACKUPS_PATH`, admin-only |
| 48 | [log-stage-48.md](./log-stage-48.md) | `AdminBackupPage`, `api/backup.ts`, `backup-cli` + Docker cron + 30d retention |
| 49 | [log-stage-49.md](./log-stage-49.md) | `WelcomePage`, черновик в `sessionStorage`, sonner + M3 CSS, редирект с `/` |
| 50 | [log-stage-50.md](./log-stage-50.md) | SPA в prod, CLI сброса пароля, smoke-чеклист, деплой-доки |

## Общие договорённости

- **UI:** `@material/web` (M3); справочник исходников — каталог `material-web-main` в репозитории.
- **Docker / VPS:** образ и **`docker-compose.yml`** описаны в этапе **06** и в **`docs/11-deployment.md`**. Для продакшена нужен запущенный Docker / оркестратор на сервере; ручной smoke — **`docs/12-smoke-checklist.md`**.
- **Монорепо:** только пакеты из `packages/*`; `material-web-main` в workspace не входит.

Все **50** этапов в **`ROADMAP.md`** отмечены выполненными; детали по шагам — в **`log-stage-*.md`** ниже.

## Команды (актуально после этапа 01)

```bash
pnpm install
# при отсутствии pnpm в PATH:
# npx pnpm@9.15.4 install
```

Проверка типов shared:

```bash
npx pnpm@9.15.4 --filter @family-tree/shared typecheck
```

Проверка типов server:

```bash
npx pnpm@9.15.4 --filter @family-tree/server exec tsc --noEmit
```

Локальный запуск API (после этапа 08, нужен `JWT_SECRET` и т.д.):

```bash
npx pnpm@9.15.4 --filter @family-tree/server dev
```

Миграции / сид (нужны собранные нативные модули и при первом сиде — `ADMIN_LOGIN` / `ADMIN_PASSWORD`):

```bash
npx pnpm@9.15.4 --filter @family-tree/server db:migrate
npx pnpm@9.15.4 --filter @family-tree/server db:seed
```

Клиент:

```bash
npx pnpm@9.15.4 --filter @family-tree/client dev
npx pnpm@9.15.4 --filter @family-tree/client build
```

В режиме `dev` запросы **`/api`** проксируются на **`http://localhost:3000`** (`packages/client/vite.config.ts`); сервер должен быть запущен.

Сборка всего монорепо (без Docker):

```bash
npx pnpm@9.15.4 run build
```

Docker (нужен запущенный Docker Desktop / daemon):

```bash
docker compose up --build -d
curl http://localhost:3000/health
```

Сброс пароля админа в контейнере: **`docs/11-deployment.md`** (раздел «Сброс пароля через CLI»).
