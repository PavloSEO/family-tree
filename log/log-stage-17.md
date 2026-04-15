# Этап 17 — сервер: `person.service.ts` (CRUD, поиск, фильтры, пагинация)

**ROADMAP:** «Сервис `person.service.ts` — CRUD по persons, валидация Zod, поиск по имени/фамилии (LIKE), фильтр по стране и статусу (живой/умерший), пагинация».

## Сделано

### Shared

- **`packages/shared/src/validation/person.ts`**: **`personListQuerySchema`** / **`PersonListQuery`** — `search`, `country` (ISO alpha-2), **`status`**: `alive` | `dead`, **`page`**, **`limit`** (coerce, лимит до 100).
- **`packages/shared/src/types/person.ts`**: реэкспорт новых сущностей.

**Статус «живой/умерший»:** в схеме БД отдельного поля нет — **`alive`**: `date_of_death IS NULL OR ''`, **`dead`**: дата смерти задана и непустая.

### Сервис

- **`packages/server/src/services/person.service.ts`**:
  - **`listPersons(rawQuery)`** — парсинг **`personListQuerySchema`**, общий **`WHERE`**, **`COUNT(*)`**, выборка с **`ORDER BY`** по полям **`sort`/`order`** (по умолчанию **`lastName` asc**), затем стабилизация **`last_name`, `first_name`, `id`**; **`LIMIT`/`OFFSET`**; ответ **`PaginatedResponse<Person>`** (`@family-tree/shared`).
  - **`getPersonById(id)`** — **`Person | null`**.
  - **`createPerson(input)`** — **`personCreateSchema`**, UUID, insert, возврат **`Person`**.
  - **`updatePerson(id, input)`** — **`personUpdateSchema`**, частичное обновление, **`updatedAt`** через SQL; при отсутствии строки — **`PersonNotFoundError`**.
  - **`deletePerson(id)`** — удаление; при отсутствии — **`PersonNotFoundError`** (каскад связей — в **`schema.ts`**).
  - **`findPersonDuplicates()`** — группы дубликатов по имени/фамилии/дате рождения (для **`GET /api/persons/duplicates`**, см. этап **18**).
- **`mapRowToPerson`**: строка БД → **`personSchema.parse`** (email `null` → **`""`** для схемы).

### Поиск LIKE

- Экранирование `\`, `%`, `_`; **`LIKE … ESCAPE '\\'`** по **`first_name`** и **`last_name`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Следующий этап

**18** — сервер: HTTP **`GET/POST/PUT/DELETE /api/persons`**, дубликаты — `ROADMAP.md`, [log-stage-18.md](./log-stage-18.md).
