# Этап 36 — сервер: раздача файлов фото и разметка людей

**ROADMAP:** **`GET /api/photos/file/:path`** (раздача, защита от directory traversal), **`POST /api/photos/:id/tag`** (разметка людей).

## Сделано

### Shared (Zod)

- **`packages/shared/src/validation/photo-tag.ts`** — **`photoTagCreateSchema`** / **`photoTagSchema`**, проверка нормализованного прямоугольника **0–1** (`superRefine`).
- **`packages/shared/src/types/photo-tag.ts`**, экспорт в **`packages/shared/src/index.ts`**.

### Раздача файлов

- **`packages/server/src/routes/photos.ts`** — общая **`serveResolvedPhoto`** через **`resolvePhotoFile`**:
  - **`GET /file/person/:personId/:fileName`** — только **`main.*`**, UUID персоны;
  - **`GET /file/album/:albumId/:fileName`** — только имена **`uuid.jpg`** / **`uuid_thumb.jpg`**;
  - **`GET /file/:path`** — один сегмент **`decodeURIComponent(path)`** (как раньше `encodeURIComponent(rel)` для **`mainPhoto`**).
- Логика **`packages/server/src/lib/safe-photo-path.ts`** без изменений: запрет **`..`**, только разрешённые шаблоны путей.

### Разметка (`tagged_persons`)

- **`packages/server/src/services/photo-tag.service.ts`** — **`listTagsForPhoto`**, **`createPhotoTag`**, **`deletePhotoTag`**; проверка существования фото и персоны; одна разметка на пару **(photoId, personId)** → **409** при дубликате; **`PhotoTagNotFoundError`** при удалении.
- **`POST /api/photos/:id/tag`**, **`DELETE /api/photos/:id/tag/:tagId`** (admin).
- **`GET /api/photos/:id`** — в **`data`** добавлено поле **`tags`**: массив разметок.

### Документация

- **`docs/06-api.md`** — таблица Photos обновлена (маршруты **`file`**, описание **`tags`**).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Заметки

- Клиентский **`mainPhotoSrc`** по-прежнему использует **`/api/photos/file/${encodeURIComponent(rel)}`** — совместимо с **`GET .../file/:path`**.

## Следующий этап

**37** — клиент: **`AdminAlbumsPage`** — `ROADMAP.md`, [log-stage-37.md](./log-stage-37.md).
