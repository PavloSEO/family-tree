# Этап 37 — клиент: страница админки альбомов

**ROADMAP:** **`AdminAlbumsPage`** — сетка альбомов (обложка + название + год), создание альбома через **`md-dialog`** с формой.

## Сделано

### Shared

- **`packages/shared/src/validation/photo.ts`** — **`albumListItemSchema`** / тип **`AlbumListItem`**: поля альбома + **`coverThumbnail: string | null`** (относительный путь к превью обложки).
- Экспорт в **`packages/shared/src/types/photo.ts`** и публичный **`index`**.

### Сервер

- **`packages/server/src/services/album.service.ts`** — **`listAlbums`** возвращает **`AlbumListItem[]`**: для каждого альбома подгружаются фото, по **`coverPhotoIndex`** (с ограничением по длине) выбирается обложка, в **`coverThumbnail`** попадает **`thumbnail`** или **`src`**.

### Клиент

- **`packages/client/src/lib/album-cover-src.ts`** — **`albumCoverSrc(rel)`** → URL **`/api/photos/file/${encodeURIComponent(rel)}`** (как у **`mainPhotoSrc`**).
- **`packages/client/src/api/albums.ts`** — **`fetchAlbumsList`**, **`createAlbum`**; опциональные query **`ownerId`**, **`year`**.
- **`packages/client/src/pages/AdminAlbumsPage.tsx`** — состояния загрузки / ошибки / пустой список; сетка **`md-outlined-card`**; ссылки на **`/album/:id`**; диалог создания: **`MdTextField`** (название, описание, год), **`MdSelect`** владелец (список персон при открытии), **`MdButton`** отправка и обновление списка.
- **`packages/client/src/App.tsx`** — маршрут **`/admin/albums`** рендерит **`AdminAlbumsPage`**.

### Документация

- **`docs/06-api.md`** — уточнён ответ **`GET /albums`**: элементы списка с **`coverThumbnail`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**38** — клиент: **`PhotoUploader`** — `ROADMAP.md`, [log-stage-38.md](./log-stage-38.md).
