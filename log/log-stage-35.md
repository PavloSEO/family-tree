# Этап 35 — сервер: альбомы и фото (CRUD + upload)

**ROADMAP:** CRUD для **`albums`** и **`photos`**, **`POST /api/photos/upload`** (multipart), **Sharp** (превью, EXIF-поворот), **exifr** (дата съёмки, GPS), проверка **MIME** на сервере.

## Сделано

### Зависимости

- **`packages/server/package.json`** — **`sharp`**, **`exifr`**.

### Хранилище и пути

- **`packages/server/src/lib/album-photo-files.ts`** — удаление файлов по относительным путям под **`PHOTOS_PATH`**.
- **`packages/server/src/lib/safe-photo-path.ts`** — помимо **`{personId}/main.*`**, разрешены файлы альбома: **`album/{albumId}/{photoId}.jpg`** и **`…_thumb.jpg`** (для **`GET /api/photos/file/...`**).

### Сервисы

- **`packages/server/src/services/album.service.ts`** — список (query **`ownerId`**, **`year`**), **`getAlbumWithPhotos`**, create/update/delete; при удалении альбома — удаление файлов всех фото.
- **`packages/server/src/services/album-photo-upload.service.ts`** — **`uploadAlbumPhoto`**: проверка размера, MIME из **`Blob.type`** + формат **Sharp**, **`rotate()`**, основное JPEG до 2048 px по длинной стороне, превью 320 px, **`exifr.parse`** → **`dateTaken`**, **`year`**, **`location`** (JSON **`{ lat, lng }`** при наличии GPS).
- **`packages/server/src/services/photo.service.ts`** — **`getPhotoById`**, **`updatePhoto`** (метаданные без смены **`albumId`/`src`/`thumbnail`**), **`deletePhoto`** (файлы + строка).

### Маршруты

- **`packages/server/src/routes/albums.ts`** — **`GET/POST /api/albums`**, **`GET/PUT/DELETE /api/albums/:id`** (мутации — admin).
- **`packages/server/src/routes/photos.ts`** — **`POST /api/photos/upload`** (поля **`albumId`**, **`file`**), **`GET/PUT/DELETE /api/photos/:id`**; порядок регистрации: **`/upload`** и **`/file/...`** раньше **`/:id`**. (В том же файле могут быть маршруты этапа **36** — раздача файлов и теги; см. [log-stage-36.md](./log-stage-36.md).)

### Приложение

- **`packages/server/src/index.ts`** — **`app.route("/api/albums", albumRoutes)`**.

### Документация

- **`docs/06-api.md`** — уточнены ответ **`GET /albums/:id`**, таблица **Photos** (upload, GET/PUT по id).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Заметки

- Схема **`albums`/`photos`** уже была в миграции **`0000_organic_exiles.sql`**; новых миграций не добавлялось.
- Разметка людей на фото (**`POST /photos/:id/tag`**) — **этап 36** по ROADMAP.

## Следующий этап

**36** — раздача файлов и теги (**`GET /photos/file/...`**, **`POST /photos/:id/tag`**) — `ROADMAP.md`, [log-stage-36.md](./log-stage-36.md).
