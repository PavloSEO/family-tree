# Этап 21 — сервер: загрузка `mainPhoto`

**ROADMAP:** `POST /api/persons/:id/photo`, обработка через **sharp** (превью до **300 px** по длинной стороне, EXIF-rotate), сохранение в **`{PHOTOS_PATH}/{personId}/main.jpg`**, поле **`mainPhoto`** в БД — относительный путь **`{personId}/main.jpg`**.

## Сделано

### Зависимости

- **`packages/server`:** **`sharp`** (нативный модуль; в **`esbuild`** помечен как **`--external:sharp`**).

### Пути и безопасность

- **`packages/server/src/lib/photos-root.ts`** — **`getPhotosRoot()`**: переменная **`PHOTOS_PATH`** или **`<cwd>/data/photos`**.
- **`packages/server/src/lib/safe-photo-path.ts`** — **`resolvePhotoFile`**: только **`{uuid}/main.<ext>`**, без **`..`**.

### Сервис

- **`packages/server/src/services/person-main-photo.service.ts`** — **`uploadPersonMainPhoto`**: проверка размера (**`MAX_UPLOAD_SIZE_MB`**, по умолчанию 10), формат через **sharp.metadata**, удаление старых **`main.*`**, запись **`main.jpg`** (mozjpeg), обновление **`persons.mainPhoto`**.

### Роуты

- **`packages/server/src/routes/persons.ts`** — **`POST /api/persons/:id/photo`**, admin, multipart, поле **`file`**; ответ **`201`** **`{ data: Person }`**; 404 при отсутствии карточки, 400 при ошибке обработки.
- **`packages/server/src/routes/photos.ts`** — раздача под **`PHOTOS_PATH`**: **`GET /api/photos/file/:path`** (один сегмент, **`encodeURIComponent(rel)`**), плюс **`GET /api/photos/file/person/:personId/:fileName`** и **`GET /api/photos/file/album/...`**; **`requireAuth`**; **`resolvePhotoFile`** (этап **36** — теги и прочее на том же роутере).

### Прочее

- **`packages/server/src/index.ts`** — монтирование **`/api/photos`**.
- **`docker-compose.yml`** — **`PHOTOS_PATH=/data/photos`**.
- **`.env.example`** — актуализирован комментарий к **`PHOTOS_PATH`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

Пример запроса (после логина admin):

```bash
curl -X POST -H "Authorization: Bearer <token>" -F "file=@photo.jpg" http://localhost:3000/api/persons/<uuid>/photo
```

## Следующий этап

**22** — клиент: **`PersonPage`** (readonly карточка) — `ROADMAP.md`, [log-stage-22.md](./log-stage-22.md).
