# Этап 05 — `packages/client`: Vite, React, Material Web, тема, Tailwind

**ROADMAP:** «Настроить `packages/client`: Vite 6, React 19, TypeScript. Установить `@material/web`. Создать `index.html` с подключением шрифта Roboto и Material Symbols. Создать `global.css` с M3-токенами светлой темы (см. `docs/14-theming.md`). Настроить Tailwind CSS 4 (только layout-утилиты)».

## Сделано

### Сборка и фреймворк

- **Vite 6** + `@vitejs/plugin-react`, **React 19**, TypeScript.
- Скрипты: `dev`, `build`, `preview`, `typecheck`.

### Material Web

- Зависимость **`@material/web`** (^2.4.1).
- **`src/material-imports.ts`** — tree-shakeable импорты компонентов и labs (как в `docs/03-material-web.md`).
- **`src/types/material-web.d.ts`** — расширение **`React.JSX.IntrinsicElements`** для основных `<md-*>` тегов (в т.ч. labs segmented).

### `index.html`

- Шрифты **Roboto** и **Material Symbols Outlined** (Google Fonts), `lang="ru"`, `#root`, entry `/src/main.tsx`.

### Стили

- **`src/styles/global.css`**: `@import "tailwindcss"`, `@config "../../tailwind.config.ts"`, полный набор **M3 light** токенов из `docs/14-theming.md`, класс `.material-symbols-outlined`, стили `body`.
- В **`main.tsx`**: подключение **typescale** — `document.adoptedStyleSheets` + `@material/web/typography/md-typescale-styles.js`.

### Tailwind 4

- **`@tailwindcss/vite`** в `vite.config.ts`.
- **`tailwind.config.ts`** — минимальный: только `content` (без кастомных цветов), согласно `docs/14-theming.md`.

### Приложение

- На момент этапа 05: **`src/main.tsx`**, **`src/App.tsx`** — минимальный экран с layout-классами Tailwind и демо **`<md-filled-button>`** + **`<md-icon>`** (иконка `forest`). В текущем репозитории **`main.tsx`** дополнительно: Router, **`AuthProvider`**, **Sonner**; **`App.tsx`** — полное дерево роутов (этапы 07+).

## Проверка

```bash
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
npx pnpm@9.15.4 --filter @family-tree/client run dev
```

## Замечания

- Сборка тянет много MW-модулей сразу — позже можно разнести по lazy-importам.
- Цвета/фоны в UI — только **M3-токены**; Tailwind — **layout** (см. ТЗ).

## Следующий этап

**06** — Docker: `Dockerfile` (multi-stage), `docker-compose.yml`, volumes, `.env.example` — `ROADMAP.md`, `log-stage-6.md`.
