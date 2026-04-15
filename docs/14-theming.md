# 14 — M3 theme and tokens

---

## Principle

Light theme only. No `prefers-color-scheme`, no dark token variants. All CSS variables are set once on `:root`.

## CSS tokens

File: `packages/client/src/styles/global.css`

```css
@import "tailwindcss";
@config "../../tailwind.config.ts";

:root {
  /* === Reference tokens === */
  --md-ref-typeface-brand: 'Roboto', sans-serif;
  --md-ref-typeface-plain: 'Roboto', sans-serif;

  /* === System color tokens (light only) === */
  /* Primary — calm blue (default; can change via settings) */
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

  /* Surface (background) */
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

  /* Inverse (SnackBar, etc.) */
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

/* Typography (Material Symbols icon font) */
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

/* Body utilities */
body {
  font-family: var(--md-ref-typeface-plain);
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  margin: 0;
}
```

## Dynamic accent color

Admins can change the accent via settings. After the SPA loads:

```typescript
// After GET /api/settings
const accentColor = settings.accentColor || '#1565C0';
document.documentElement.style.setProperty('--md-sys-color-primary', accentColor);
// TODO: recompute derived tokens via material-color-utilities
```

For MVP: only `--md-sys-color-primary` changes. Future: full palette via `@material/material-color-utilities`.

## Tailwind CSS 4

Tailwind is used ONLY for layout utilities:
- `flex`, `grid`, `gap-*`, `p-*`, `m-*`
- `w-*`, `h-*`, `min-w-*`, `max-w-*`
- `items-*`, `justify-*`
- `rounded-*` (where needed outside MW components)
- `text-sm`, `text-xs` (where needed outside MW typography)
- `hidden`, `block`, `inline-flex`
- `absolute`, `relative`, `fixed`, `sticky`
- responsive: `sm:`, `md:`, `lg:`

Tailwind is NOT used for:
- Text / background colors (M3 tokens)
- Component styling (MW)
- Shadows (M3 elevation)

`tailwind.config.ts` is minimal, without custom colors.

## Typography (M3 CSS classes)

Material Web provides typography classes:

```typescript
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';
document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
```

Classes:
| Class | Usage |
|-------|--------------|
| `md-typescale-display-large` | — (unused) |
| `md-typescale-display-medium` | Login page title |
| `md-typescale-headline-large` | — |
| `md-typescale-headline-medium` | Person name on card |
| `md-typescale-headline-small` | Section headings |
| `md-typescale-title-large` | Admin page titles |
| `md-typescale-title-medium` | Section titles on card |
| `md-typescale-title-small` | Table column headers |
| `md-typescale-body-large` | Main text (bio) |
| `md-typescale-body-medium` | Default body text |
| `md-typescale-body-small` | Captions |
| `md-typescale-label-large` | Name in tree node |
| `md-typescale-label-medium` | User login in sidebar |
| `md-typescale-label-small` | Life years in node |
