# 09 -- Система фотографий

---

## Хранение

Файловая система, Docker volume `/data/photos/`.

Структура директорий:
```
/data/photos/
  {personId}/
    {albumId}/
      {photoId}.jpg         <- оригинал (с EXIF-ротацией)
      thumbs/
        {photoId}.jpg       <- thumbnail 300px
  shared/
    {albumId}/
      {photoId}.jpg
      thumbs/
        {photoId}.jpg
```

`shared/` -- общие альбомы (не привязанные к карточке).

## Загрузка

Endpoint: `POST /api/photos/upload` (multipart/form-data).

Поля:
- `albumId` (обязательно) -- UUID альбома
- `file` (обязательно) -- файл изображения
- `description` (опционально)
- `dateTaken` (опционально, ISO date)
- `location` (опционально)

### Пайплайн обработки

```
1. Валидация MIME-type
   Допустимые: image/jpeg, image/png, image/webp
   Проверка: magic bytes файла, НЕ расширение
   -> Ошибка: "Неподдерживаемый формат"

2. Валидация размера
   Максимум: 10 МБ (env MAX_UPLOAD_SIZE_MB)
   -> Ошибка: "Файл слишком большой. Максимум 10 МБ."

3. EXIF-парсинг (exifr)
   Извлекаем:
   - DateTimeOriginal -> dateTaken (если не указан вручную)
   - GPSLatitude + GPSLongitude -> location (если не указан)
   - Orientation -> авторотация в шаге 4

4. Сохранение оригинала (sharp)
   sharp(buffer).rotate().toFile(filePath)
   .rotate() без аргументов = авторотация по EXIF

5. Генерация thumbnail (sharp)
   sharp(buffer).rotate().resize(300, 300, {
     fit: 'inside',
     withoutEnlargement: true
   }).toFile(thumbPath)

6. Запись в БД
   INSERT INTO photos (id, album_id, src, thumbnail, ...)

7. Ответ
   { id, src, thumbnail, dateTaken, location }
```

## Раздача файлов

Endpoint: `GET /api/photos/file/*`

Hono middleware раздает файлы из `/data/photos/`. Защита от directory traversal: проверка что resolved path начинается с `/data/photos/`.

## Разметка людей

Координаты -- нормализованные (0.0 - 1.0) относительно размеров изображения:
- `x` -- левый край области
- `y` -- верхний край области
- `width` -- ширина области
- `height` -- высота области

Нормализованные координаты масштабируются вместе с фото при любом размере отображения.

### UI разметки (admin only)

1. Открыть фото в режиме редактирования
2. Canvas overlay поверх изображения
3. mousedown + mousemove = рисование прямоугольника
4. mouseup = открытие dropdown выбора человека (`md-menu` с поиском по имени)
5. Выбор человека = POST /api/photos/:id/tag
6. Отображение: полупрозрачная рамка + имя

### Отображение разметки (для всех)

- Полупрозрачные рамки (border: 2px solid, background: rgba) поверх фото
- При hover/tap: tooltip с именем + мини-аватар + ссылка на карточку
- Тоггл "Скрыть разметку" (`md-switch`)

## Альбомы

Два типа:
- Персональные: `owner_id = person_uuid` -- привязаны к карточке, отображаются и в профиле, и в общем разделе
- Общие: `owner_id = null` -- только в общем разделе

UI:
- Сетка альбомов: CSS Grid, `md-elevated-card` (labs) с обложкой, названием, годом
- При клике -- галерея фото (yet-another-react-lightbox)

## Фоллбеки

| Ситуация | Обработка |
|----------|----------|
| Нет thumbnail | Генерируется при загрузке. Если потерян -- показать оригинал |
| Нет taggedPersons | Рамки не показываются |
| personId в tag указывает на удаленную карточку | Показать "Неизвестный" |
| Нет dateTaken, есть year | Показать год |
| Нет dateTaken и year | "Дата неизвестна" |
| Битый src | Заглушка: серый прямоугольник + Material Symbol `broken_image` |
| Фото < 100px | Предупреждение при загрузке |
