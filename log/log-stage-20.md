# Этап 20 — клиент: `PersonForm` (React Hook Form + Zod)

**ROADMAP:** форма создания/редактирования карточки: RHF + Zod, обязательные поля всегда видны (`md-outlined-text-field` для имени/фамилии, `md-radio` для пола), опциональные секции в аккордеонах, поля по ТЗ / `personCreateSchema` и `docs/10-admin-panel.md`.

## Сделано

### Зависимости

- **`packages/client`:** `react-hook-form`, `@hookform/resolvers` (уже добавлены к этапу).

### Формы и маппинг в API

- **`packages/client/src/forms/person-form.ts`** — схема **`personFormFieldsSchema`** (Zod) и тип **`PersonFormInput`**, дефолты **`PERSON_FORM_DEFAULTS`**.
- **`packages/client/src/forms/person-submit.ts`** — **`personToFormInput`**, **`formInputToPersonCreate`** / **`formInputToPersonUpdate`** (даты в формате **YYYY-MM-DD** для API; JSON-текстовые поля для `localizedNames`, `socialLinks`, `customFields`; хобби — строки с переносами).

### UI

- **`packages/client/src/components/Accordion.tsx`** — сворачиваемая секция (кнопка + `md-icon`).
- **`packages/client/src/components/person/PersonForm.tsx`** — **`useForm`** + **`zodResolver`**, **`Controller`** для MW-полей; аккордеоны: доп. имя, даты/места, фото (текст до UI загрузки; серверный upload — этап **21**), контакты, «о человеке», медицинское, доп. поля; кнопки Сохранить / Отмена.
- **`packages/client/src/pages/AdminPersonEditPage.tsx`** — загрузка карточки для редактирования, заголовок, маршруты **`/admin/persons/new`** и **`/admin/persons/:id/edit`**.
- **`packages/client/src/components/md/MdTextField.tsx`** — опциональный **`rows`** (textarea).
- **`packages/client/src/styles/global.css`** — стили **`.accordion*`**.

### API-клиент

- **`packages/client/src/api/persons.ts`** — **`fetchPerson`**, **`createPerson`**, **`updatePerson`** (обёртка `{ data }` + **`personSchema`**).

### Роутинг

- **`packages/client/src/App.tsx`** — маршруты карточки на **`AdminPersonEditPage`**; удалена заглушка **`AdminPersonEditPlaceholderPage.tsx`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**21** — сервер: загрузка **`mainPhoto`** (`POST /api/persons/:id/photo`, sharp) — `ROADMAP.md`, [log-stage-21.md](./log-stage-21.md).
