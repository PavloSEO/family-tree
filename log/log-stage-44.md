# Этап 44 — клиент: страница настроек

**ROADMAP:** **`AdminSettingsPage`** — форма: **`md-outlined-text-field`**, **`md-slider`** (глубины), **`md-switch`** (внешние ветки), color picker для акцента.

## Сделано

### API

- **`packages/client/src/api/settings.ts`** — **`fetchAppSettings`**, **`updateAppSettings`** (`GET/PUT /api/settings`), разбор **`appSettingsSchema`**.

### Страница

- **`packages/client/src/pages/AdminSettingsPage.tsx`**:
  - загрузка настроек и до **500** персон для **`MdSelect`** корня дерева («Не задан» + список по фамилии);
  - поля: название сайта, корень, два **`md-slider`** (вверх / вниз), **`md-switch`** «внешние ветки», **`md-slider`** глубины внешних веток;
  - акцент: **`input type="color"`** + **`MdTextField`** HEX;
  - TTL сессии — числовое поле (**`MdTextField`** `type="number"`);
  - **`md-elevated-card`**, кнопки «Сохранить» (полное тело после **`appSettingsSchema`**) и «Сбросить с сервера»;
  - ошибки **`HTTPError`** с разбором **`{ error }`**.

### Маршрут

- **`packages/client/src/App.tsx`** — **`/admin/settings`** → **`AdminSettingsPage`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**45** — shared: утилиты инфографики (`zodiac.ts`, `chinese-year.ts`, `age.ts`, `date-format.ts`) — `ROADMAP.md`, `log-stage-45.md`.
