# Этап 15 — клиент: UI-примитивы над Material Web

**ROADMAP:** «Обертки над MW для удобства в React: `MdButton`, `MdTextField`, `MdSelect`, `MdDialog`, `MdChip`. Декларации custom elements в `types/material-web.d.ts` (см. `docs/03-material-web.md`)».

## Сделано

### Обёртки (`packages/client/src/components/md/`)

- **`MdButton`** — варианты **`filled` | `outlined` | `text` | `elevated`**, прокидывание **`type`**, **`disabled`**, **`href`**, **`target`**, опционально **`trailingIcon`** (свойство Lit **`trailingIcon`**, не **`trailing_icon`**).
- **`MdTextField`** — **`outlined` | `filled`**, контролируемое **`value`**, колбэк **`onValueChange`** (через **`input`** на хосте).
- **`MdSelect`** + **`MdSelectOption`** — **`md-outlined-select`** / **`md-select-option`**, **`onValueChange`** по событию **`input`** на хосте (как у text field; значение через **`mwHostStringValue`**).
- **`MdDialog`** — управляемый **`open`**, **`onOpenChange(false)`** по **`closed`** и **`cancel`** на элементе.
- **`MdChip`** — дискриминант **`variant: "filter" | "input"`** → **`md-filter-chip`** / **`md-input-chip`**; для filter — **`onClick`** (MW редиспатчит **`click`**, не **`input`**).
- **`mw-host-value.ts`** — **`mwHostStringValue`**: чтение **`value`** с хоста MW после событий.

Публичный реэкспорт: **`components/md/index.ts`**.

### Использование

- **`LoginPage`** переведён на **`MdTextField`** и **`MdButton`** (чекбокс «Запомнить меня» остаётся **`md-checkbox`** по смыслу формы).

### `material-web.d.ts`

- Исправлена структура закрывающих скобок (**`declare global` / `React` / `JSX` / `IntrinsicElements`**).
- Расширено: **`md-dialog`** — **`quick`**, **`returnValue`**; **`md-outlined-select`** — **`value`**, **`error`**, **`error-text`**, **`supporting-text`**; **`md-select-option`** — **`disabled`**; **`md-input-chip`** — **`disabled`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**16** — **`DataTable`** (TanStack Table, стили M3) — `ROADMAP.md`, [log-stage-16.md](./log-stage-16.md).
