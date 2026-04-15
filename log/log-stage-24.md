# Этап 24 — сервер: routes `/api/relationships`

**ROADMAP:** **`GET/POST/PUT/DELETE /api/relationships`**, валидация на каждой мутации (через **`relationship.service`** + Zod), каскадное удаление связей при удалении карточки.

## Сделано

### Роуты

- **`packages/server/src/routes/relationships.ts`**:
  - **`GET /`** — **`requireAuth`**, **`{ data: Relationship[] }`**.
  - **`GET /:id`** — **`requireAuth`**, **`{ data }`** / 404.
  - **`POST /`** — **`requireAuth`** + **`requireAdmin`**, JSON, **`{ data, warnings? }`** при **201** (warnings только если непустой массив).
  - **`PUT /:id`** — **`requireAuth`** + **`requireAdmin`**, **`{ data }`**; 404 / 400 / Zod как в сервисе.
  - **`DELETE /:id`** — **`requireAuth`** + **`requireAdmin`**, **204**; 404 если связи нет.
  - Ошибки сервиса: **404** — не найдена связь или человек; **409** — дубликат; **400** — цикл, лишние родители, самоссылка, Zod.

- **`packages/server/src/index.ts`** — монтирование **`/api/relationships`**.

### Каскад при удалении карточки

- Уже в схеме Drizzle: **`relationships.from_person_id`** / **`to_person_id`** → **`persons.id`** с **`onDelete: "cascade"`** (`packages/server/src/db/schema.ts`). **`deletePerson`** по-прежнему удаляет строку в **`persons`**; связи удаляются БД.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Следующий этап

**25** — клиент: **`AdminRelationshipsPage`** — `ROADMAP.md`, [log-stage-25.md](./log-stage-25.md).
