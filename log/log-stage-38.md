# Этап 38 — клиент: загрузка фото в альбом

**ROADMAP:** **`PhotoUploader`** — зона drag & drop, превью до отправки, **`md-linear-progress`** на время загрузки, множественные файлы.

## Сделано

### API клиента

- **`packages/client/src/api/photos.ts`** — **`uploadAlbumPhoto(albumId, file, onProgress?)`**: `POST /api/photos/upload` через **XHR** (прогресс **`upload.onprogress`**), заголовок **`Authorization`**, разбор ответа через **`photoSchema`**.
- **`packages/client/src/api/albums.ts`** — **`fetchAlbumWithPhotos(id)`**: **`GET /api/albums/:id`**, валидация **`album`** + массива **`photos`** (обход ограничения глубины вывода Zod в TS — вход **`parse`** через **`as never`**, результат приведён к **`Album` / `Photo[]`**).

### UI

- **`packages/client/src/components/PhotoUploader.tsx`** — props **`albumId`**, **`onUploaded?(photo)`**, **`disabled`**: приём **JPEG / PNG / WebP** (фильтр по MIME и расширению), очередь с **`URL.createObjectURL`** для превью, кнопка «Загрузить», поштучное удаление из очереди, при ошибке часть уже ушедших на сервер снимается с очереди; **`md-linear-progress`** с **`value` / `max={1}`** на время пакетной загрузки.
- **`packages/client/src/pages/AlbumPage.tsx`** — загрузка альбома и списка фото, сетка превью (**`albumCoverSrc`**), для **`role === admin`** — блок с **`PhotoUploader`** и ссылка «← Альбомы» на **`/admin/albums`**; после загрузки фото добавляется в локальный список.
- **`packages/client/src/App.tsx`** — маршрут **`/album/:id`** ведёт на **`AlbumPage`** вместо заглушки.
- Удалена **`AlbumByIdPlaceholderPage.tsx`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**39** — клиент: **`PhotoTagger`** — `ROADMAP.md`, [log-stage-39.md](./log-stage-39.md).
