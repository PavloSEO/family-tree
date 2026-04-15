# Этап 40 — клиент: галерея фото (лайтбокс)

**ROADMAP:** **`PhotoGallery`** — **yet-another-react-lightbox**, свайп и зум, оверлей разметок (полупрозрачные рамки, имена при hover), общие альбомы и альбомы с карточки.

## Сделано

### Зависимость

- **`packages/client/package.json`** — **`yet-another-react-lightbox`** (^3.31).

### Компонент

- **`packages/client/src/components/PhotoGallery.tsx`** — обёртка над **`Lightbox`** с плагином **`Zoom`**; слайды **`PhotoGallerySlide`** (**`SlideImage`** + опционально **`tags`**, **`photoId`**); **`render.slideContainer`**: поверх стандартного слайда — **`TagOverlay`** (рамки в долях **0–1**, подписи: всегда на малых экранах, на **`sm+`** — по **`group-hover`**); подписи кнопок навигации на русском.

### Страницы и маршруты

- **`packages/client/src/pages/AlbumPage.tsx`** — параллельная подгрузка **`fetchPhotoWithTags`** для разметки; карта имён из **`fetchPersonsList`**: клик по превью открывает **`PhotoGallery`**; у админа ссылка **«Разметка»** на **`/album/:id/photo/:photoId`**.
- **`packages/client/src/pages/AlbumsBrowsePage.tsx`** — список альбомов (**`fetchAlbumsList()`**), сетка карточек со ссылками на **`/album/:id`** (вход «общие альбомы»).
- **`packages/client/src/App.tsx`** — маршрут **`/albums`** → **`AlbumsBrowsePage`** вместо заглушки.
- **`packages/client/src/pages/PersonPage.tsx`** — блок **«Фотоальбомы»**: **`fetchAlbumsList({ ownerId })`**, список ссылок на альбомы владельца-карточки (обложка + название + год).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**41** — сервер: CRUD пользователей — `ROADMAP.md`, [log-stage-41.md](./log-stage-41.md).
