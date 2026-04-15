# Этап 43 — сервер: настройки приложения

**ROADMAP:** **`GET/PUT /api/settings`** — key-value в таблице **`settings`**: название сайта, корень дерева, глубины, внешние ветки, акцентный цвет, TTL сессии.

## Сделано

### Shared

- **`packages/shared/src/validation/app-settings.ts`** — константа **`SETTINGS_KEYS`**, схемы **`appSettingsSchema`** / **`appSettingsPatchSchema`** (strict PATCH), типы **`AppSettings`**, **`SettingsKey`**.
- **`packages/shared/src/index.ts`** — экспорт валидации настроек.

### Сервер

- **`packages/server/src/services/settings.service.ts`** — значения по умолчанию, чтение строк из БД с мержем, сериализация в текст (`0`/`1` для булевых), **`upsert`** по ключу; проверка **`defaultRootPersonId`** через **`getPersonById`** (**`InvalidRootPersonError`**).
- **`packages/server/src/routes/settings.ts`** — **`GET /`** (**`requireAuth`**), **`PUT /`** (**`requireAdmin`**), ответ **`{ data: AppSettings }`**.
- **`packages/server/src/index.ts`** — **`app.route("/api/settings", settingsRoutes)`**.

### Документация

- **`docs/06-api.md`** — уточнены форматы GET/PUT и перечень полей.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/shared run typecheck
npx pnpm@9.15.4 --filter @family-tree/server exec tsc --noEmit
```

## Следующий этап

**44** — клиент: **`AdminSettingsPage`**; **`ROADMAP.md`**.
