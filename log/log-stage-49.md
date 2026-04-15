# Этап 49 — клиент: приветствие, черновик, toasts

**ROADMAP:** **`WelcomePage`** для пустой БД, **`sessionStorage`** для черновика формы, **sonner** в стиле M3.

## Сделано

### Зависимости

- **`sonner`** — глобальные toast.

### Черновик и форма

- **`packages/client/src/lib/welcome-person-draft.ts`** — ключ **`WELCOME_PERSON_DRAFT_KEY`**, **`loadWelcomePersonDraft`** (Zod partial).
- **`PersonForm`** — опция **`sessionStorageDraftKey`**: подстановка черновика при создании; **`watch`** + debounce **500 ms** в **`sessionStorage`**; сброс при успешном **`createPerson`**; дополнительный сброс при **`pagehide`** / **`visibilitychange` → hidden** через **`getValues()`**.

### Страницы

- **`WelcomePage`** (`/welcome`): запрос **`total`** через **`fetchPersonsList({ limit: 1 })`**; при **`total > 0`** — редирект на **`/`**; админ — карточка + **`PersonForm`** create + черновик; наблюдатель — текст и ссылки на дерево / альбомы; toast при восстановлении черновика (имя/фамилия); **`toast.success`** после создания.
- **`HomePage`**: для **admin** при **`total === 0`** — редирект на **`/welcome`**; краткий «Загрузка…» пока считается **`total`**.

### Приложение

- **`App.tsx`** — **`/welcome`** → **`WelcomePage`**.
- **`main.tsx`** — **`<Toaster />`** (классы под M3).
- **`styles/global.css`** — стили **`.sonner-toast`*** (inverse surface, скругление, тень).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**50** — см. [log-stage-50.md](./log-stage-50.md) (финальная сборка, smoke, CLI сброса пароля).
