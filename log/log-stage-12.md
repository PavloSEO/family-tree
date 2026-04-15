# Этап 12 — клиент: страница входа (Material Web), защита маршрутов

**ROADMAP:** «Клиент: страница логина на Material Web (`md-outlined-text-field`, `md-filled-button`, `md-checkbox`). `ProtectedRoute`. Редирект на `/login` при отсутствии токена. Страница "Доступ приостановлен" для disabled-пользователей».

## Сделано

### `ProtectedRoute`

- **`packages/client/src/components/layout/ProtectedRoute.tsx`** — пока **`!ready`**, показ «Загрузка…»; если **`!user`** после готовности — **`Navigate`** на **`/login`** с **`state: { from: location }`** (возврат после входа, см. `docs/07-auth.md`).

### Страница входа

- **`packages/client/src/pages/LoginPage.tsx`** — форма на MW: логин/пароль, чекбокс «Запомнить меня», кнопка «Войти» с иконкой **`login`**.
- Вызов **`useAuth().login`**, обработка **`HTTPError`**: **401** — общее сообщение; **429** — текст с сервера или запасной; **403** + текст про приостановление — **`/disabled`**.
- Уже авторизованный пользователь редиректится на **`from`** или **`/`**.

### Роутинг и главная

- **`App.tsx`**: **`/`** обёрнут в **`ProtectedRoute`** + **`HomePage`**; **`/login`** → **`LoginPage`**.
- **`HomePage.tsx`** — на этапе 12: приветствие с логином/ролью и выход через **`md-filled-button`**; в текущем репозитории — редирект пустой БД на **`/welcome`**, текст про выход в **`AppShell`** (этап **13+**).
- Удалена заглушка **`LoginPlaceholderPage.tsx`**.

### Типы

- В **`LoginPage`** для **`location.state`** используется **`Location`** из **`react-router-dom`** (не глобальный DOM **`Location`**).
- Для **`onInput`** у text-field — приведение **`e.target`** через **`unknown`** (строгий **`tsc`**).

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**13** — **`AppShell`**, боковая навигация (**`md-list`**), основная область — `ROADMAP.md`, `log-stage-13.md`.
