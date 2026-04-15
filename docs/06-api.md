# 06 -- REST API

---

Базовый URL: `/api`. Все ответы -- JSON. Все мутации требуют `Authorization: Bearer <token>`.

## Формат ответов

```typescript
// Успех
{ "data": T }

// Успех с пагинацией
{ "data": T[], "total": number, "page": number, "limit": number }

// Ошибка
{ "error": "Текст ошибки" }

// Предупреждение (не блокирует, но информирует)
{ "data": T, "warnings": ["Родитель младше ребенка"] }
```

## Auth

| Метод | Путь | Роль | Тело запроса | Ответ |
|-------|------|------|-------------|-------|
| POST | `/auth/login` | -- | `{ login, password, remember }` | `{ token, user }` / 401 / 429 |
| GET | `/auth/me` | any | -- | `{ user }` / 401 |

## Users

Все маршруты только для роли **admin**. В системе не более **одного** пользователя с ролью `admin`; нельзя удалить или деактивировать последнего администратора. Нельзя удалить или деактивировать **свою** учётную запись, нельзя снять с себя роль администратора.

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| GET | `/users` | admin | Список пользователей (`User[]`, без пароля) |
| GET | `/users/:id` | admin | Один пользователь |
| POST | `/users` | admin | Создать. Body: `UserCreate` (логин, пароль ≥8, роль, опционально `linkedPersonId`, `status`). **409**, если логин занят или уже есть администратор при `role: admin` |
| PUT | `/users/:id` | admin | Обновить. Body: `UserUpdate` (частично: логин, пароль, роль, `linkedPersonId`, `status`). Те же ограничения по второму admin и последнему admin |
| DELETE | `/users/:id` | admin | Удалить. **400**, если последний admin или попытка удалить себя |

## Persons

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| GET | `/persons` | any | Список. Query: `?search=&country=&alive=&page=&limit=&sort=&order=` |
| GET | `/persons/:id` | any | Одна карточка (все поля) |
| GET | `/persons/:id/relatives` | any | Вычисленные родственники (BFS) |
| GET | `/persons/duplicates` | admin | Возможные дубликаты (firstName+lastName+dateOfBirth) |
| POST | `/persons` | admin | Создать. Body: PersonCreate (Zod) |
| PUT | `/persons/:id` | admin | Обновить. Body: PersonUpdate (Zod) |
| DELETE | `/persons/:id` | admin | Удалить + каскад связей. Требует подтверждения |
| POST | `/persons/:id/photo` | admin | Загрузить mainPhoto (multipart) |

## Relationships

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| GET | `/relationships` | any | Все связи |
| GET | `/relationships/:id` | any | Одна связь |
| POST | `/relationships` | admin | Создать (с валидацией) |
| PUT | `/relationships/:id` | admin | Обновить мета (даты свадьбы) |
| DELETE | `/relationships/:id` | admin | Удалить |

**Валидация при POST /relationships:**

1. `fromPersonId !== toPersonId` -- иначе 400
2. Нет дубликата -- иначе 409
3. Для parent: у toPersonId макс 2 parent-связи -- иначе 400
4. Для parent: нет циклов (BFS) -- иначе 400
5. Для parent: возрастная проверка -- warning (не блокирует)
6. Для parent: проверка пола -- warning (не блокирует)

## Tree

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| GET | `/tree/:personId` | any | Подграф от указанного корня |

Query params:

| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| mode | string | full | full / ancestors / descendants / direct / family / paternal / maternal |
| depthUp | number | 3 | Глубина вверх |
| depthDown | number | 3 | Глубина вниз |
| showExternal | boolean | false | Показывать внешние ветки |
| externalDepth | number | 2 | Глубина внешних веток |
| country | string | -- | Фильтр по ISO country |
| aliveOnly | boolean | false | Только живые |

Для роли **viewer** параметры **`showExternal`** и **`externalDepth`** из запроса **игнорируются** — ответ всегда без внешних веток (как при `showExternal=false`).

Ответ (как у остальных успешных GET — обёртка `data`):
```typescript
{
  "data": {
  "nodes": Array<{
    id: string;
    firstName: string;
    lastName: string;
    gender: "male" | "female";
    dateOfBirth: string | null;
    dateOfDeath: string | null;
    mainPhoto: string | null;
    country: string | null;
    isExternal: boolean;
  }>;
  "edges": Array<{
    id: string;
    source: string;
    target: string;
    type: "parent" | "spouse";
    isExternal: boolean;
  }>;
  "rootId": string;
  }
}
```

## Albums

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| GET | `/albums` | any | Список **`AlbumListItem[]`** (поля альбома + **`coverThumbnail`** — относительный путь к превью или `null`). Query: `?ownerId=&year=` |
| GET | `/albums/:id` | any | `{ album, photos[] }` |
| POST | `/albums` | admin | Создать |
| PUT | `/albums/:id` | admin | Обновить |
| DELETE | `/albums/:id` | admin | Удалить + каскад фото |

## Photos

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| POST | `/photos/upload` | admin | Загрузить (multipart: `albumId`, `file`). Sharp: превью + EXIF-поворот; exifr: дата/GPS в БД; MIME: JPEG/PNG/WebP |
| GET | `/photos/:id` | any | Метаданные фото + массив **`tags`**: `{ ...Photo, tags: PhotoTag[] }` |
| PUT | `/photos/:id` | admin | Обновить описание, `dateTaken`, `year`, `location`, `sortOrder` (без смены файлов) |
| DELETE | `/photos/:id` | admin | Удалить файл + запись |
| POST | `/photos/:id/tag` | admin | Разметить: `{ personId, x, y, width, height }` — нормализованные координаты 0–1 |
| DELETE | `/photos/:id/tag/:tagId` | admin | Удалить разметку |
| GET | `/photos/file/person/:personId/:fileName` | any | `main.*` в каталоге персоны (без `..`) |
| GET | `/photos/file/album/:albumId/:fileName` | any | JPEG альбома (`uuid.jpg` / `uuid_thumb.jpg`) |
| GET | `/photos/file/:path` | any | Один сегмент: `encodeURIComponent(rel)` — те же правила, что **`resolvePhotoFile`** (без traversal) |

## Settings

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| GET | `/settings` | any | Все настройки: `{ data: AppSettings }` (объект с полями ниже) |
| PUT | `/settings` | admin | Частичное обновление: JSON-объект с любым подмножеством полей (только перечисленные ключи) |

Поля **`AppSettings`**: `siteName`, `defaultRootPersonId` (`null` — не задано), `defaultDepthUp`, `defaultDepthDown`, `showExternalBranches`, `externalBranchDepth`, `accentColor` (`#RRGGBB`), `sessionTtlDays`.

## Backup

Префикс: **`/api/backup`**. Каталог: **`BACKUPS_PATH`** (см. `.env.example`). Имена файлов: только **`*.tar.gz`**, безопасный basename (`[a-zA-Z0-9._-]`).

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| POST | `/backup` | admin | Создать бэкап; ответ **`{ data: { filename, sizeBytes, createdAt } }`** (201) |
| GET | `/backup` | admin | Список: **`{ data: BackupListItem[] }`** |
| GET | `/backup/:filename` | admin | Скачать (`Content-Type: application/gzip`) |
| DELETE | `/backup/:filename` | admin | Удалить (204) |

Содержимое архива: **`db/family-tree.db`** (SQLite после `wal_checkpoint(FULL)`) и каталог **`photos/`** (содержимое **`PHOTOS_PATH`**, если существует).
