# Этап 19 — клиент: `AdminPersonsPage` (DataTable + API)

**ROADMAP:** «`AdminPersonsPage` — DataTable со всеми карточками. Колонки: фото (thumbnail), имя, фамилия, пол, дата рождения, страна, статус. Поиск, фильтры. Кнопки: "Создать" (FAB), "Редактировать", "Удалить" (с подтверждением через `md-dialog`)».

## Сделано

### API-клиент

- **`packages/client/src/api/persons.ts`** — **`fetchPersonsList`** (`GET /api/persons` + query), **`deletePerson`** (`DELETE /api/persons/:id`). Ответ списка валидируется Zod (**`personSchema`** по элементам), чтобы не упереться в глубокую инстанциацию типов.
- Зависимость **`zod`** в **`packages/client`** (парсинг ответов).

### Страница

- **`packages/client/src/pages/AdminPersonsPage.tsx`**:
  - **`DataTable`**: колонки **фото** (превью по `mainPhoto` или иконка `person`; URL для относительных путей — заготовка под **`/api/photos/file/...`**, этап 21+), **имя**, **фамилия**, **пол** (М/Ж), **дата рождения** (ДД.ММ.ГГГГ), **страна**, **статус** (живой/умерший по `dateOfDeath`), **действия**.
  - Поиск с **debounce 400 ms**; фильтры **страна (ISO-2)** и **`MdSelect`** статуса (все / живые / умершие → query **`alive`**).
  - Сортировка и пагинация синхронизированы с **`sort` / `order` / `page` / `limit`** API.
  - **`md-fab`** «Создать» — переход на **`/admin/persons/new`**.
  - Редактирование — **`md-icon-button`** → **`/admin/persons/:id/edit`**.
  - Удаление — **`MdDialog`** + **`MdButton`**; после успеха список перезагружается.
  - Ошибки **`HTTPError`** / сеть — текст над таблицей.

### Роутинг

- **`App.tsx`**: **`/admin/persons`** → **`AdminPersonsPage`**.
- Удалена демо-страница **`AdminPersonsTableDemoPage.tsx`** (логика перенесена на API).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

Локально нужны запущенные API и авторизация **admin** (мутации на сервере).

## Следующий этап

**20** — клиент: **`PersonForm`** (создание / редактирование карточки) — `ROADMAP.md`, [log-stage-20.md](./log-stage-20.md).
