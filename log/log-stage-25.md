# Этап 25 — клиент: `AdminRelationshipsPage`

**ROADMAP:** **`DataTable`** со всеми связями; колонки: **тип**, **человек A**, **человек B**, **дата свадьбы** (для spouse), **статус брака**.

## Сделано

### API-клиент

- **`packages/client/src/api/relationships.ts`** — **`fetchRelationships`** (`GET /api/relationships` + Zod **`relationshipSchema`** по элементам), **`deleteRelationship`**.

### Страница

- **`packages/client/src/pages/AdminRelationshipsPage.tsx`**:
  - Параллельная загрузка связей и **всех** карточек постранично (**`fetchPersonsList`**, до 200 страниц по 100) для отображения имён по **`fromPersonId` / `toPersonId`**.
  - **`DataTable`**: колонки **Тип** (Родитель / Супруги), **Человек A/B** (ссылки на **`/person/:id`**), **Дата свадьбы** (для **parent** — «—»), **Статус брака** (для spouse: разведены / в браке / текущий брак / не актуально / —), **Удалить** + **`MdDialog`**.
  - Поиск (debounce 400 ms), сортировка и пагинация **на клиенте** по загруженному списку.

### Роутинг

- **`packages/client/src/App.tsx`** — **`/admin/relationships`** → **`AdminRelationshipsPage`** (вместо заглушки). Форма создания — этап **26** (**`/admin/relationships/new`**).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**26** — клиент: **`RelationshipForm`** (`/admin/relationships/new`) — `ROADMAP.md`, [log-stage-26.md](./log-stage-26.md).
