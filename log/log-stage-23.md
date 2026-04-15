# Этап 23 — сервер: `relationship.service.ts`

**ROADMAP:** CRUD связей с валидацией: нет самоссылок, нет дубликатов, у ребёнка максимум **2** связи типа **parent**, нет **циклов** в ориентированном графе «родитель → ребёнок» (**BFS/DFS** по существующим рёбрам + новая связь), **возрастная** и **половая** проверки как **warnings** (не блокируют создание).

## Сделано

### Сервис

- **`packages/server/src/services/relationship.service.ts`**:
  - **`listRelationships`**, **`getRelationshipById`**, **`createRelationship`**, **`updateRelationship`**, **`deleteRelationship`**.
  - Семантика **parent**: **`fromPersonId`** — родитель, **`toPersonId`** — ребёнок (как в **`docs/06-api.md`**).
  - **Дубликат**: точное совпадение для **parent**; для **spouse** — пара **`(A,B)`** или **`(B,A)`**.
  - **Цикл**: при добавлении **`from → to`**, обход вниз от **`to`** по рёбрам «родитель → ребёнок»; если достигаем **`from`** — цикл.
  - **Макс. 2 родителя**: число строк **parent** с данным **`toPersonId`**.
  - **Warnings** при **`create`** для **parent**: даты рождения (родитель не моложе ребёнка по дате); одинаковый **пол** у пары — текстовые предупреждения в **`CreateRelationshipResult.warnings`**.
  - Ошибки с полем **`code`**: **`RelationshipNotFoundError`**, **`RelationshipDuplicateError`**, **`RelationshipCycleError`**, **`RelationshipTooManyParentsError`**, **`RelationshipPersonNotFoundError`**, **`RelationshipSelfReferenceError`** (для HTTP на этапе **24**).

### Зависимости

- Только **`@family-tree/shared`** (**`relationship*Schema`**, **`personSchema`** для чтения людей в warnings).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

HTTP-роуты **`/api/relationships`** — см. [log-stage-24.md](./log-stage-24.md).

## Следующий этап

**24** — HTTP-роуты **`/api/relationships`** (валидация на мутациях, каскад при удалении карточки) — `ROADMAP.md`, [log-stage-24.md](./log-stage-24.md).
