# Этап 39 — клиент: разметка людей на фото

**ROADMAP:** **`PhotoTagger`** — прямоугольники на фото, **`md-menu`** с поиском человека, отображение существующих разметок.

## Сделано

### API клиента (`packages/client/src/api/photos.ts`)

- **`fetchPhotoWithTags(id)`** — **`GET /api/photos/:id`**, ответ **`Photo` + `tags`**.
- **`createPhotoTag(photoId, body)`** — **`POST /api/photos/:id/tag`**.
- **`deletePhotoTag(photoId, tagId)`** — **`DELETE /api/photos/:id/tag/:tagId`**.

### Компонент **`PhotoTagger`**

- **`packages/client/src/components/PhotoTagger.tsx`**: обёртка размером с изображение; **существующие теги** — абсолютные блоки в долях **0–1** с подписью (**`personLabel`**); для админа — **`canvas`** поверх кадра для **рамки выделения** (штриховая обводка), координаты переводятся в нормализованный прямоугольник с минимальным размером **`MIN_NORM`**.
- После выделения — **`MdTextField`** + **`md-menu`** / **`md-menu-item`** с debounced **`fetchPersonsList({ search, limit: 15 })`** (**350 ms**, по смыслу как в **`RelationshipForm`**); сохранение через **`createPhotoTag`**; «Отменить рамку».
- Список **«Разметки»** под кадром с кнопкой **«Удалить»** (админ) → **`deletePhotoTag`**.
- **`onTagsChange`** — **`Dispatch<SetStateAction<PhotoTag[]>>`** для корректных обновлений при быстрых действиях.

### Страница и маршруты

- **`packages/client/src/pages/AlbumPhotoTagPage.tsx`**: загрузка фото и проверка **`albumId`**; подписи из **`fetchPersonsList({ page: 1, limit: 500 })`**; ссылка «← К альбому»; **`PhotoTagger`** с **`canEdit={user.role === "admin"}`** (viewer видит рамки и список без редактирования).
- **`packages/client/src/App.tsx`** — маршрут **`/album/:albumId/photo/:photoId`** (объявлен **до** **`/album/:id`**).
- **`packages/client/src/pages/AlbumPage.tsx`** — миниатюры ведут на **`/album/:id/photo/:photoId`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**40** — клиент: **`PhotoGallery`** — `ROADMAP.md`, [log-stage-40.md](./log-stage-40.md).
