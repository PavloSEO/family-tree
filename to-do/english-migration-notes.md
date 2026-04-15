# English migration — deferred strings

Documentation and code comments are in English. The items below stay **Russian** (or mixed) until a dedicated i18n pass for **server messages** and **computed domain labels**.

## `packages/shared/src/tree-compute.ts`

- `getRelationshipLabel` / `kinshipStepsToLabel` return **Russian** kinship terms for the default product locale.
- Internal `throw new Error("No relationship between …")` is English (developer-facing).

**Follow-up:** map path patterns to locale keys (reuse or mirror `locales/*/`), or serve labels from the API with `Accept-Language`.

## Western / Chinese zodiac (`zodiac.ts`, `chinese-year.ts`)

- `WESTERN_ZODIAC_SIGNS_RU` and `CHINESE_ZODIAC_ANIMALS_RU` arrays are Russian strings used in infographics.

**Follow-up:** move strings into `packages/client/src/locales/{ru,en}/` and resolve by UI language, or add parallel `*_EN` arrays keyed by sign index.

## API JSON `error` fields (`packages/server`)

Russian literals are still returned from routes and services (auth, persons, albums, photos, relationships, users, settings, middleware, upload helpers). Examples:

- `Требуется авторизация`, `Невалидный токен`, `Доступ приостановлен`, `Доступ запрещён`
- `Некорректные данные`, `Некорректное тело запроса`, `Некорректный идентификатор`
- `Неверный логин или пароль`, rate limit text, entity-not-found messages

The client **EN UI** wraps Cyrillic `body.error` via `localStorage` language + `lib/api-http-error-format.ts`. The **403 disabled** redirect checks for `приостановлен` **or** `suspended`.

**Follow-up:** `Accept-Language` / user locale on the server, or stable error **codes** + client-side message lookup.

## Zod validation messages (`packages/shared/src/validation`)

- `common.ts` (ISO date, country code)
- `app-settings.ts` (accent color regex message)
- `photo-tag.ts` (normalized rectangle bounds)

These may surface in API 400 responses or client-side validation depending on flow.

## `formatDateLongRu` (`packages/shared/src/date-format.ts`)

- Uses `Intl` with `ru-RU` for long month names.

**Follow-up:** branch on `useAppLocale` / app language on the client, or add `formatDateLongEn`.

## Relationship warnings (`relationship.service.ts`)

- `parentChildAgeWarnings` pushes Russian warning strings (non-blocking).

---

**Verification:** `rg '[\u0400-\u04FF]' packages --glob '!**/locales/ru/**'` — remaining hits should fall into the categories above or test assertions that intentionally expect Russian output.
