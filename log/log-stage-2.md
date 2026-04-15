# Этап 02 — `packages/shared`: TypeScript и Zod

**ROADMAP:** «Настроить `packages/shared`: TypeScript, Zod-схемы для Person, Relationship, User, Photo, Album. Типы API-ответов (`ApiResponse<T>`, `PaginatedResponse<T>`). Экспорт через `index.ts`».

## Сделано

### Инструменты

- `typescript` (dev), `zod` (dependency).
- `tsconfig.json`: `strict`, `noEmit: true`, `module` / `moduleResolution`: `NodeNext`, `verbatimModuleSyntax`.
- Скрипт `pnpm --filter @family-tree/shared typecheck` → `tsc --noEmit`.

### Типы API (`docs/06-api.md`)

Файл `src/types/api.ts`:

- `ApiResponse<T>` — `{ data: T }`
- `PaginatedResponse<T>` — `{ data, total, page, limit }`
- `ApiErrorBody` — `{ error: string }`
- `ApiResponseWithWarnings<T>` — опционально `warnings`

### Zod и доменные типы (camelCase под JSON API)

| Модуль | Сущности |
|--------|-----------|
| `validation/person.ts` | `personSchema`, `personCreateSchema`, `personUpdateSchema`, `genderSchema`, `bloodTypeSchema` |
| `validation/relationship.ts` | `relationshipSchema`, `relationshipCreateSchema`, `relationshipUpdateSchema` |
| `validation/user.ts` | `userPublicSchema`, `userRowSchema` (+ хэш пароля), `userCreateSchema`, `userUpdateSchema` |
| `validation/photo.ts` | `album*`, `photo*` (create/update) |
| `validation/common.ts` | общие: UUID, ISO-дата `YYYY-MM-DD`, код страны alpha-2 → uppercase |

Публичный пользователь в API: тип **`User`** = `z.infer<typeof userPublicSchema>` (без поля пароля). Для слоя БД/сидов: **`UserRow`**.

### Структура каталогов (как в `docs/15-project-structure.md`)

- `src/types/*.ts` — реэкспорт типов и схем из `validation/*` + чистые типы в `api.ts`.
- `src/index.ts` — единая точка пакета: реэкспорт из `./types/*.js` и (в текущем репозитории после следующих этапов) утилит из корня `src` (`age`, `tree-compute`, …) и `validation/app-settings.js` — см. актуальный файл.

### Именование полей

Поля в Zod/типах в **camelCase** (`firstName`, `dateOfBirth`, `fromPersonId`), в соответствии с типичным JSON API. Маппинг на колонки SQLite (`first_name`, …) — задача сервера (**этап 03**).

## Проверка

```bash
npx pnpm@9.15.4 --filter @family-tree/shared typecheck
```

## Следующий этап

**03** — `packages/server`: Hono, better-sqlite3, Drizzle, `db/schema.ts`, подключение, `drizzle.config.ts`.
