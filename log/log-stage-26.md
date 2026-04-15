# Этап 26 — клиент: `RelationshipForm`

**ROADMAP:** визуальный помощник: два поиска людей (**`md-outlined-text-field`** + выпадающий **`md-menu`**), тип связи (**`md-radio`**: родитель / супруги), для **parent** — выбор «кто родитель», для **spouse** — даты свадьбы/развода, **`md-checkbox`** «Текущий брак», комментарий; предупреждения с сервера — **`MdDialog`**.

## Сделано

### Компоненты и страница

- **`packages/client/src/components/relationship/RelationshipForm.tsx`** — поиск через **`fetchPersonsList`** (debounce 400 ms), выбор из **`md-menu-item`**, сборка **`RelationshipCreate`**, **`createRelationship`**; при **`warnings`** в ответе — диалог с **`md-icon` warning** и кнопкой «Понятно», затем **`onSuccess`** (в т.ч. при закрытии диалога через scrim/Escape).
- **`packages/client/src/pages/AdminRelationshipNewPage.tsx`** — заголовок и форма; возврат на **`/admin/relationships`**.

### API-клиент

- **`packages/client/src/api/relationships.ts`** — **`createRelationship`** (разбор **`{ data, warnings? }`**, Zod).

### UI-примитив

- **`packages/client/src/components/md/MdTextField.tsx`** — опциональный **`id`** (якорь для **`md-menu`**).

### Роутинг и список

- **`packages/client/src/App.tsx`** — **`/admin/relationships/new`** → **`AdminRelationshipNewPage`** (объявлен **выше** **`/admin/relationships`**).
- **`packages/client/src/pages/AdminRelationshipsPage.tsx`** — **`md-fab`** «Создать связь» → **`/admin/relationships/new`**, текст пустого состояния обновлён.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**27** — shared: **`tree-compute.ts`** (BFS, кратчайший путь, подписи рёбер), тесты; блок «Родственники» в **`PersonPage`** — `ROADMAP.md`, [log-stage-27.md](./log-stage-27.md).
