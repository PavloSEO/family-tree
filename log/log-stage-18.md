# Этап 18 — сервер: HTTP API для persons

**ROADMAP:** «Маршруты `GET/POST/PUT/DELETE /api/persons`, `GET /api/persons/:id`, `GET /api/persons/duplicates`. Admin-only для мутаций».

## Сделано

### Shared

- **`personListQuerySchema`**: query **`alive`** (`true` / `false` / `1` / `0` / строки), **`sort`** (`firstName` | `lastName` | `dateOfBirth` | `country` | `createdAt` | `gender`), **`order`** (`asc` | `desc`) — в соответствии с **`docs/06-api.md`** (список persons).
- **`PersonDuplicateGroup`** — тип ответа дубликатов.

### Сервис (`person.service.ts`)

- **`buildListWhere`**: приоритет **`alive`** над **`status`** для фильтра живых/умерших.
- **`listOrderBy`**: сортировка по **`sort`** / **`order`**, стабилизирующие **`lastName`**, **`firstName`**, **`id`**.
- **`findPersonDuplicates()`** — группы с одинаковыми (без регистра) **`firstName` + `lastName` + `dateOfBirth`**, размер группы ≥ 2.

### Маршруты (`packages/server/src/routes/persons.ts`)

| Метод | Путь | Middleware | Ответ |
|--------|------|--------------|--------|
| GET | `/duplicates` | `requireAuth` + **`requireAdmin`** | `{ data: PersonDuplicateGroup[] }` |
| GET | `/` | `requireAuth` | пагинация **`{ data, total, page, limit }`** |
| POST | `/` | + **`requireAdmin`** | **`201`** `{ data: Person }` |
| PUT | `/:id` | + **`requireAdmin`** | **`200`** `{ data: Person }` |
| DELETE | `/:id` | + **`requireAdmin`** | **`204`** без тела |
| GET | `/:id` | `requireAuth` | **`200`** `{ data: Person }` |

На том же **`persons.ts`** (вне формулировки ROADMAP **18**, но уже подключено): **`POST /:id/photo`** (см. этап **21**), **`GET /:id/relatives`**.

- Порядок регистрации: **`/duplicates`** до **`/:id`**, чтобы путь `duplicates` не уходил в проверку UUID; **`GET /:id/relatives`** объявлен до **`GET /:id`** (один сегмент `/:id` всё равно не матчит два сегмента).
- **`id`**: проверка **`z.string().uuid()`**; иначе **400**.
- **`PersonNotFoundError`** → **404**; **`ZodError`** → **400** с первым сообщением.

### Подключение

- **`packages/server/src/index.ts`**: **`app.route("/api/persons", personRoutes)`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Следующий этап

**19** — клиент: **`AdminPersonsPage`** (DataTable карточек) — `ROADMAP.md`, [log-stage-19.md](./log-stage-19.md).
