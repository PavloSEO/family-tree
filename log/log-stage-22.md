# Этап 22 — клиент: `PersonPage` (readonly карточка)

**ROADMAP:** полная карточка только для чтения: шапка с фото и именем; секции «О человеке», «Контакты», «Работа и увлечения», «Дополнительно»; пустые секции не рендерятся; MW: **`md-elevated-card`**, **`md-divider`**, **`md-icon`**, **`md-chip`** (хобби).

## Сделано

### Страница

- **`packages/client/src/pages/PersonPage.tsx`** — **`GET /api/persons/:id`** через **`fetchPerson`**, состояния загрузки / ошибки; шапка в **`md-elevated-card`** (фото через **`mainPhotoSrc`**, ФИО, отчество, девичья фамилия, пол); секции с заголовком **`md-icon`** + **`md-divider`** и телом; «О человеке»: биография, даты рождения/смерти, **место рождения**, **текущее место** (при наличии); хобби — **`MdChip`** `variant="input"` **`disabled`**; для **admin** — ссылка «Редактировать» на **`/admin/persons/:id/edit`**. Дополнительно к ROADMAP: блоки инфографики, альбомов владельца, родственников, произвольных полей.

### Утилита

- **`packages/client/src/lib/person-main-photo-src.ts`** — общая функция **`mainPhotoSrc`** (раньше дублировалась в **`AdminPersonsPage`**).

### Роутинг

- **`packages/client/src/App.tsx`** — **`/person/:id`** → **`PersonPage`**; удалена заглушка **`PersonPlaceholderPage.tsx`**.

### Прочее

- **`packages/client/src/pages/AdminPersonsPage.tsx`** — импорт **`mainPhotoSrc`** из **`lib/person-main-photo-src.ts`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**23** — сервер: **`relationship.service.ts`** (CRUD связей, валидации) — `ROADMAP.md`, [log-stage-23.md](./log-stage-23.md).
