# 16 -- Кастомные компоненты

---

Компоненты, которых нет в `@material/web` и которые строятся вручную с использованием M3 CSS-токенов.

## DataTable

Headless-логика: TanStack Table 8. Стили: M3-токены.

### Визуал

```
+---------------------------------------------------------------+
| [search field]              [filter 1] [filter 2]    [+ FAB]  |
+---------------------------------------------------------------+
| Имя          | Фамилия     | Пол | Дата рожд. | [sort icon]  |
| ------------ | ----------- | --- | ---------- | ------------ |
| Иван         | Петров      | M   | 15.03.1985 | [edit] [del] |
| Ольга        | Петрова     | Ж   | 22.07.1988 | [edit] [del] |
| ...          | ...         | ... | ...        | ...          |
+---------------------------------------------------------------+
| << < Страница 1 из 5 > >>                    Всего: 42       |
+---------------------------------------------------------------+
```

### CSS

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: var(--md-sys-color-surface-container);
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  color: var(--md-sys-color-on-surface-variant);
  /* md-typescale-title-small */
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  letter-spacing: 0.1px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.data-table td {
  padding: 12px 16px;
  color: var(--md-sys-color-on-surface);
  /* md-typescale-body-medium */
  font-size: 0.875rem;
  line-height: 1.25rem;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.data-table tr:hover td {
  background: var(--md-sys-color-surface-container-low);
}

.data-table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  color: var(--md-sys-color-on-surface-variant);
}
```

### Props

```typescript
type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSort: (column: string, order: 'asc' | 'desc') => void;
  isLoading: boolean;
  emptyIcon: string;       // Material Symbol name
  emptyText: string;
};
```

---

## Accordion (сворачиваемая секция)

Для формы PersonForm -- опциональные секции.

```tsx
function Accordion({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-3 px-4"
        style={{ color: 'var(--md-sys-color-on-surface)' }}
      >
        <md-icon>{icon}</md-icon>
        <span className="md-typescale-title-small flex-1 text-left">{title}</span>
        <md-icon>{open ? 'expand_less' : 'expand_more'}</md-icon>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
```

---

## FileDropzone

Drag & drop зона для загрузки фото.

```
+-------------------------------------------+
|                                           |
|     [upload icon]                         |
|                                           |
|     Перетащите фото сюда                  |
|     или нажмите для выбора                |
|                                           |
|     JPG, PNG, WebP -- до 10 МБ           |
|                                           |
+-------------------------------------------+
```

### Состояния

| Состояние | Визуал |
|-----------|--------|
| Пустое | Пунктирная рамка `--md-sys-color-outline`, иконка `upload` |
| Drag over | Рамка `--md-sys-color-primary`, фон `--md-sys-color-primary-container` (10% opacity) |
| Загрузка | `md-linear-progress` indeterminate |
| Превью | Миниатюра + имя файла + размер + кнопка удаления |
| Ошибка | Рамка `--md-sys-color-error`, текст ошибки |

### CSS

```css
.file-dropzone {
  border: 2px dashed var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-large);
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.file-dropzone:hover {
  border-color: var(--md-sys-color-primary);
  background: color-mix(in srgb, var(--md-sys-color-primary) 5%, transparent);
}

.file-dropzone.dragover {
  border-color: var(--md-sys-color-primary);
  background: color-mix(in srgb, var(--md-sys-color-primary) 10%, transparent);
}
```

---

## EmptyState

Отображение пустого состояния (нет данных).

```
+-------------------------------------------+
|                                           |
|         [large icon, 48px]                |
|                                           |
|         Нет карточек                      |
|         Создайте первую карточку          |
|                                           |
|         [md-filled-button: Создать]       |
|                                           |
+-------------------------------------------+
```

```tsx
function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <md-icon style={{
        fontSize: '48px',
        color: 'var(--md-sys-color-on-surface-variant)'
      }}>{icon}</md-icon>
      <span className="md-typescale-title-medium" style={{
        color: 'var(--md-sys-color-on-surface)'
      }}>{title}</span>
      {description && (
        <span className="md-typescale-body-medium" style={{
          color: 'var(--md-sys-color-on-surface-variant)'
        }}>{description}</span>
      )}
      {actionLabel && onAction && (
        <md-filled-button onClick={onAction}>
          <md-icon slot="icon">add</md-icon>
          {actionLabel}
        </md-filled-button>
      )}
    </div>
  );
}
```

---

## ConfirmDialog

Обертка над `md-dialog` для подтверждения действий.

```tsx
function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <md-dialog open={open || undefined} onClose={onCancel}>
      <md-icon slot="icon">warning</md-icon>
      <div slot="headline">{title}</div>
      <div slot="content">
        <span className="md-typescale-body-medium">{message}</span>
      </div>
      <div slot="actions">
        <md-text-button onClick={onCancel}>Отмена</md-text-button>
        <md-filled-button onClick={onConfirm}>{confirmLabel}</md-filled-button>
      </div>
    </md-dialog>
  );
}
```

---

## SearchField

`md-outlined-text-field` с debounce и иконкой поиска.

```tsx
function SearchField({ value, onChange, placeholder = "Поиск...", debounceMs = 300 }) {
  const [local, setLocal] = useState(value);
  const debouncedOnChange = useDebounce(onChange, debounceMs);

  const handleInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    setLocal(val);
    debouncedOnChange(val);
  };

  return (
    <md-outlined-text-field
      value={local}
      placeholder={placeholder}
      onInput={handleInput}
    >
      <md-icon slot="leading-icon">search</md-icon>
      {local && (
        <md-icon-button slot="trailing-icon" onClick={() => { setLocal(''); onChange(''); }}>
          <md-icon>close</md-icon>
        </md-icon-button>
      )}
    </md-outlined-text-field>
  );
}
```

---

## Toast (sonner + M3 стили)

```tsx
import { Toaster } from 'sonner';

// В App.tsx
<Toaster
  position="bottom-center"
  toastOptions={{
    style: {
      fontFamily: 'var(--md-ref-typeface-plain)',
      borderRadius: 'var(--md-sys-shape-corner-medium)',
    },
    classNames: {
      success: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
      error: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
    }
  }}
/>
```
