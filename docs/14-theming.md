# 14 -- Тема и токены M3

---

## Принцип

Только светлая тема. Никаких `prefers-color-scheme`, никаких dark-вариантов токенов. Все CSS-переменные задаются один раз в `:root`.

## CSS-токены

Файл: `packages/client/src/styles/global.css`

```css
@import "tailwindcss";
@config "../../tailwind.config.ts";

:root {
  /* === Reference tokens === */
  --md-ref-typeface-brand: 'Roboto', sans-serif;
  --md-ref-typeface-plain: 'Roboto', sans-serif;

  /* === System color tokens (light only) === */
  /* Primary -- спокойный синий (default, меняется через настройки) */
  --md-sys-color-primary: #1565C0;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #D1E4FF;
  --md-sys-color-on-primary-container: #001D36;

  /* Secondary */
  --md-sys-color-secondary: #535F70;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #D7E3F7;
  --md-sys-color-on-secondary-container: #101C2B;

  /* Tertiary */
  --md-sys-color-tertiary: #6B5778;
  --md-sys-color-on-tertiary: #FFFFFF;
  --md-sys-color-tertiary-container: #F2DAFF;
  --md-sys-color-on-tertiary-container: #251431;

  /* Error */
  --md-sys-color-error: #BA1A1A;
  --md-sys-color-on-error: #FFFFFF;
  --md-sys-color-error-container: #FFDAD6;
  --md-sys-color-on-error-container: #410002;

  /* Surface (фон) */
  --md-sys-color-background: #FDFCFF;
  --md-sys-color-on-background: #1A1B1F;
  --md-sys-color-surface: #FDFCFF;
  --md-sys-color-on-surface: #1A1B1F;
  --md-sys-color-surface-variant: #DFE2EB;
  --md-sys-color-on-surface-variant: #43474E;

  /* Surface containers */
  --md-sys-color-surface-container-lowest: #FFFFFF;
  --md-sys-color-surface-container-low: #F7F2FA;
  --md-sys-color-surface-container: #F3EDF7;
  --md-sys-color-surface-container-high: #ECE6F0;
  --md-sys-color-surface-container-highest: #E6E0E9;
  --md-sys-color-surface-bright: #FDFCFF;
  --md-sys-color-surface-dim: #DDD8E0;

  /* Outline */
  --md-sys-color-outline: #73777F;
  --md-sys-color-outline-variant: #C3C6CF;

  /* Inverse (для SnackBar и т.д.) */
  --md-sys-color-inverse-surface: #2F3036;
  --md-sys-color-inverse-on-surface: #F2F0F4;
  --md-sys-color-inverse-primary: #A0CAFD;

  /* Shadow */
  --md-sys-color-shadow: #000000;
  --md-sys-color-scrim: #000000;

  /* === Shape tokens === */
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-full: 9999px;
}

/* Типографика (Material Symbols шрифт иконок) */
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

/* Утилиты для body */
body {
  font-family: var(--md-ref-typeface-plain);
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  margin: 0;
}
```

## Динамический акцентный цвет

Администратор может менять акцентный цвет через настройки. При загрузке SPA:

```typescript
// После GET /api/settings
const accentColor = settings.accentColor || '#1565C0';
document.documentElement.style.setProperty('--md-sys-color-primary', accentColor);
// TODO: пересчитать производные токены через material-color-utilities
```

Для MVP: меняется только `--md-sys-color-primary`. В будущем: генерация полной палитры через `@material/material-color-utilities`.

## Tailwind CSS 4

Tailwind используется ТОЛЬКО для layout-утилит:
- `flex`, `grid`, `gap-*`, `p-*`, `m-*`
- `w-*`, `h-*`, `min-w-*`, `max-w-*`
- `items-*`, `justify-*`
- `rounded-*` (где нужно вне MW-компонентов)
- `text-sm`, `text-xs` (где нужно вне MW-типографики)
- `hidden`, `block`, `inline-flex`
- `absolute`, `relative`, `fixed`, `sticky`
- responsive: `sm:`, `md:`, `lg:`

Tailwind НЕ используется для:
- Цвета текста/фона (это M3-токены)
- Компонентных стилей (это MW)
- Тени (это M3 elevation)

Конфиг `tailwind.config.ts` -- минимальный, без кастомных цветов.

## Типографика (CSS-классы M3)

Material Web предоставляет классы типографики:

```typescript
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';
document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
```

Классы:
| Класс | Использование |
|-------|--------------|
| `md-typescale-display-large` | -- (не используется) |
| `md-typescale-display-medium` | Заголовок страницы логина |
| `md-typescale-headline-large` | -- |
| `md-typescale-headline-medium` | Имя человека в карточке |
| `md-typescale-headline-small` | Заголовки разделов |
| `md-typescale-title-large` | Заголовки страниц админки |
| `md-typescale-title-medium` | Заголовки секций в карточке |
| `md-typescale-title-small` | Заголовки колонок таблицы |
| `md-typescale-body-large` | Основной текст (био) |
| `md-typescale-body-medium` | Стандартный текст |
| `md-typescale-body-small` | Подписи |
| `md-typescale-label-large` | Имя в ноде дерева |
| `md-typescale-label-medium` | Логин пользователя в sidebar |
| `md-typescale-label-small` | Годы жизни в ноде |
