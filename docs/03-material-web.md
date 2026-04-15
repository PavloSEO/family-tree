# 03 — Integrating @material/web with React 19

---

## What is @material/web

`@material/web` is a Web Components (Custom Elements) library from Google. Built on Lit. Each component is an HTML custom element (`<md-filled-button>`, `<md-outlined-text-field>`, etc.).

Web Components work in any framework. React 19 has native custom element support: it passes properties (not only attributes) and handles events correctly.

**Note:** `@material/web` is in maintenance mode (no new features, bugs are fixed). For this project that is fine — the component set is stable and sufficient.

---

## Install

```bash
pnpm add @material/web
```

## Wire-up in index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Family Tree</title>

  <!-- Roboto (required M3 font) -->
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
    rel="stylesheet"
  />

  <!-- Material Symbols (icons) -->
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    rel="stylesheet"
  />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

## Importing components

Each component is imported separately (tree-shakeable):

```typescript
// main.tsx or material-imports.ts
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/elevated-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/input-chip.js';
import '@material/web/dialog/dialog.js';
import '@material/web/divider/divider.js';
import '@material/web/fab/fab.js';
import '@material/web/field/filled-field.js';
import '@material/web/field/outlined-field.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/radio/radio.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/slider/slider.js';
import '@material/web/switch/switch.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/secondary-tab.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/ripple/ripple.js';

// Labs (experimental)
import '@material/web/labs/card/elevated-card.js';
import '@material/web/labs/card/filled-card.js';
import '@material/web/labs/card/outlined-card.js';
import '@material/web/labs/navigationdrawer/navigation-drawer.js';
import '@material/web/labs/badge/badge.js';
import '@material/web/labs/segmentedbutton/outlined-segmented-button.js';
import '@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js';
```

## Usage in JSX

```tsx
function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col gap-4 w-80">
      <md-outlined-text-field
        label="Login"
        value={login}
        onInput={(e: any) => setLogin(e.target.value)}
      />

      <md-outlined-text-field
        label="Password"
        type="password"
        value={password}
        onInput={(e: any) => setPassword(e.target.value)}
      />

      <label className="flex items-center gap-2">
        <md-checkbox />
        <span>Remember me</span>
      </label>

      <md-filled-button onClick={handleLogin}>
        <md-icon slot="icon">login</md-icon>
        Sign in
      </md-filled-button>
    </div>
  );
}
```

## TypeScript: custom element declarations

File: `packages/client/src/types/material-web.d.ts`

```typescript
// Minimal declarations for JSX.
// Extend IntrinsicElements so TypeScript accepts <md-*> tags.

declare namespace JSX {
  interface IntrinsicElements {
    'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      href?: string;
      target?: string;
      type?: 'button' | 'submit' | 'reset';
      trailing_icon?: boolean;
    }, HTMLElement>;

    'md-outlined-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      href?: string;
      type?: 'button' | 'submit' | 'reset';
    }, HTMLElement>;

    'md-text-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      href?: string;
      type?: 'button' | 'submit' | 'reset';
    }, HTMLElement>;

    'md-elevated-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
    }, HTMLElement>;

    'md-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

    'md-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      toggle?: boolean;
      selected?: boolean;
    }, HTMLElement>;

    'md-outlined-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      value?: string;
      type?: string;
      required?: boolean;
      disabled?: boolean;
      error?: boolean;
      'error-text'?: string;
      'supporting-text'?: string;
      placeholder?: string;
      maxlength?: number;
      rows?: number;
      cols?: number;
    }, HTMLElement>;

    'md-filled-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      value?: string;
      type?: string;
      required?: boolean;
      disabled?: boolean;
      error?: boolean;
      'error-text'?: string;
    }, HTMLElement>;

    'md-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      checked?: boolean;
      disabled?: boolean;
      indeterminate?: boolean;
    }, HTMLElement>;

    'md-radio': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      checked?: boolean;
      disabled?: boolean;
      name?: string;
      value?: string;
    }, HTMLElement>;

    'md-switch': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      selected?: boolean;
      disabled?: boolean;
      icons?: boolean;
    }, HTMLElement>;

    'md-dialog': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      open?: boolean;
    }, HTMLElement>;

    'md-divider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

    'md-fab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      size?: 'small' | 'medium' | 'large';
      variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
    }, HTMLElement>;

    'md-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'md-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      headline?: string;
      'supporting-text'?: string;
      disabled?: boolean;
      type?: 'text' | 'button' | 'link';
      href?: string;
    }, HTMLElement>;

    'md-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      open?: boolean;
      anchor?: string;
      positioning?: string;
    }, HTMLElement>;
    'md-menu-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      headline?: string;
      disabled?: boolean;
    }, HTMLElement>;

    'md-outlined-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      required?: boolean;
      disabled?: boolean;
    }, HTMLElement>;
    'md-select-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      value?: string;
      headline?: string;
      selected?: boolean;
    }, HTMLElement>;

    'md-slider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      min?: number;
      max?: number;
      value?: number;
      step?: number;
      labeled?: boolean;
      disabled?: boolean;
    }, HTMLElement>;

    'md-linear-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      indeterminate?: boolean;
      value?: number;
      max?: number;
      buffer?: number;
    }, HTMLElement>;

    'md-circular-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      indeterminate?: boolean;
      value?: number;
    }, HTMLElement>;

    'md-tabs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'md-primary-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      active?: boolean;
    }, HTMLElement>;
    'md-secondary-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      active?: boolean;
    }, HTMLElement>;

    'md-chip-set': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'md-filter-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      selected?: boolean;
      disabled?: boolean;
    }, HTMLElement>;
    'md-input-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
    }, HTMLElement>;

    'md-ripple': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

    // Labs
    'md-elevated-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'md-filled-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'md-outlined-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'md-navigation-drawer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      opened?: boolean;
    }, HTMLElement>;
    'md-badge': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      value?: string;
    }, HTMLElement>;
  }
}
```

## Event handling

Material Web components use standard DOM events. In React 19, custom element events use `on*` props:

```tsx
// Text field — "input" event
<md-outlined-text-field
  label="Name"
  onInput={(e: Event) => {
    const target = e.target as HTMLInputElement;
    setName(target.value);
  }}
/>

// Checkbox — "change" event
<md-checkbox
  onChange={(e: Event) => {
    const target = e.target as HTMLInputElement;
    setChecked(target.checked);
  }}
/>

// Dialog — "close" event
<md-dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
>
  <div slot="headline">Confirm</div>
  <div slot="content">Delete this card?</div>
  <div slot="actions">
    <md-text-button onClick={() => setIsOpen(false)}>Cancel</md-text-button>
    <md-filled-button onClick={handleDelete}>Delete</md-filled-button>
  </div>
</md-dialog>

// Select — "change" event
<md-outlined-select
  label="Country"
  onChange={(e: Event) => {
    const target = e.target as HTMLSelectElement;
    setCountry(target.value);
  }}
>
  <md-select-option value="BY" headline="Belarus" />
  <md-select-option value="PL" headline="Poland" />
  <md-select-option value="DE" headline="Germany" />
</md-outlined-select>
```

## Slots

MW components use Web Component slots for content:

```tsx
// Icon in button
<md-filled-button>
  <md-icon slot="icon">add</md-icon>
  Create card
</md-filled-button>

// List item with icon
<md-list-item>
  <md-icon slot="start">person</md-icon>
  <span slot="headline">Cards</span>
  <span slot="supporting-text">42 records</span>
</md-list-item>
```

## Styling via CSS tokens

Components are styled with CSS custom properties:

```css
/* Global: change primary for all components */
:root {
  --md-sys-color-primary: #3B82F6;
}

/* Local: style one component */
.danger-button {
  --md-filled-button-container-color: var(--md-sys-color-error);
  --md-filled-button-label-text-color: var(--md-sys-color-on-error);
}
```

Full token lists are in each component’s docs under `material-web/docs/components/`.
