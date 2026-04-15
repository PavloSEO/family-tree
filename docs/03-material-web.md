# 03 -- Интеграция @material/web с React 19

---

## Что такое @material/web

`@material/web` -- библиотека Web Components (Custom Elements) от Google. Построена на Lit. Каждый компонент -- это HTML custom element (`<md-filled-button>`, `<md-outlined-text-field>` и т.д.).

Web Components работают в любом фреймворке. React 19 имеет нативную поддержку custom elements: правильно передает properties (не только attributes) и обрабатывает события.

**Важно:** `@material/web` находится в maintenance mode (новые фичи не добавляются, но баги фиксятся). Для нашего проекта это не проблема -- набор компонентов стабилен и достаточен.

---

## Установка

```bash
pnpm add @material/web
```

## Подключение в index.html

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Family Tree</title>

  <!-- Roboto (обязательный шрифт для M3) -->
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
    rel="stylesheet"
  />

  <!-- Material Symbols (иконки) -->
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

## Импорт компонентов

Каждый компонент импортируется отдельно (tree-shakeable):

```typescript
// main.tsx или отдельный файл material-imports.ts
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

// Labs (экспериментальные)
import '@material/web/labs/card/elevated-card.js';
import '@material/web/labs/card/filled-card.js';
import '@material/web/labs/card/outlined-card.js';
import '@material/web/labs/navigationdrawer/navigation-drawer.js';
import '@material/web/labs/badge/badge.js';
import '@material/web/labs/segmentedbutton/outlined-segmented-button.js';
import '@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js';
```

## Использование в JSX

```tsx
function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col gap-4 w-80">
      <md-outlined-text-field
        label="Логин"
        value={login}
        onInput={(e: any) => setLogin(e.target.value)}
      />

      <md-outlined-text-field
        label="Пароль"
        type="password"
        value={password}
        onInput={(e: any) => setPassword(e.target.value)}
      />

      <label className="flex items-center gap-2">
        <md-checkbox />
        <span>Запомнить меня</span>
      </label>

      <md-filled-button onClick={handleLogin}>
        <md-icon slot="icon">login</md-icon>
        Войти
      </md-filled-button>
    </div>
  );
}
```

## TypeScript: декларации custom elements

Файл: `packages/client/src/types/material-web.d.ts`

```typescript
// Минимальные декларации для JSX.
// Расширяем IntrinsicElements чтобы TypeScript не ругался на <md-*> теги.

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

## Обработка событий

Material Web компоненты используют стандартные DOM-события. В React 19 custom element события обрабатываются через `on*` props:

```tsx
// Текстовое поле -- событие "input"
<md-outlined-text-field
  label="Имя"
  onInput={(e: Event) => {
    const target = e.target as HTMLInputElement;
    setName(target.value);
  }}
/>

// Checkbox -- событие "change"
<md-checkbox
  onChange={(e: Event) => {
    const target = e.target as HTMLInputElement;
    setChecked(target.checked);
  }}
/>

// Dialog -- событие "close"
<md-dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
>
  <div slot="headline">Подтверждение</div>
  <div slot="content">Удалить карточку?</div>
  <div slot="actions">
    <md-text-button onClick={() => setIsOpen(false)}>Отмена</md-text-button>
    <md-filled-button onClick={handleDelete}>Удалить</md-filled-button>
  </div>
</md-dialog>

// Select -- событие "change"
<md-outlined-select
  label="Страна"
  onChange={(e: Event) => {
    const target = e.target as HTMLSelectElement;
    setCountry(target.value);
  }}
>
  <md-select-option value="BY" headline="Беларусь" />
  <md-select-option value="PL" headline="Польша" />
  <md-select-option value="DE" headline="Германия" />
</md-outlined-select>
```

## Slots (слоты)

MW-компоненты используют Web Component slots для размещения контента:

```tsx
// Иконка в кнопке
<md-filled-button>
  <md-icon slot="icon">add</md-icon>
  Создать карточку
</md-filled-button>

// List item с иконкой
<md-list-item>
  <md-icon slot="start">person</md-icon>
  <span slot="headline">Карточки</span>
  <span slot="supporting-text">42 записи</span>
</md-list-item>
```

## Стилизация через CSS-токены

Компоненты стилизуются через CSS custom properties:

```css
/* Глобально: поменять primary цвет всех компонентов */
:root {
  --md-sys-color-primary: #3B82F6;
}

/* Локально: поменять стиль конкретного компонента */
.danger-button {
  --md-filled-button-container-color: var(--md-sys-color-error);
  --md-filled-button-label-text-color: var(--md-sys-color-on-error);
}
```

Полный список токенов -- в документации каждого компонента в `material-web/docs/components/`.
