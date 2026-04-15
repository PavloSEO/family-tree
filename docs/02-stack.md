# 02 -- Стек технологий

---

## Frontend

| Пакет | Версия | Назначение | Установка |
|-------|--------|-----------|-----------|
| react | 19.x | UI-библиотека | `pnpm add react react-dom` |
| vite | 6.x | Сборщик | `pnpm add -D vite @vitejs/plugin-react` |
| @material/web | 2.x | Material Design 3 Web Components | `pnpm add @material/web` |
| react-router-dom | 7.x | Клиентский роутинг | `pnpm add react-router-dom` |
| @xyflow/react | 12.x | Визуализация графа (дерево) | `pnpm add @xyflow/react` |
| elkjs | 0.9.x | Layout-алгоритм для дерева | `pnpm add elkjs` |
| @tanstack/react-table | 8.x | Headless-таблицы | `pnpm add @tanstack/react-table` |
| react-hook-form | 7.x | Управление формами | `pnpm add react-hook-form @hookform/resolvers` |
| zod | 3.x | Валидация (shared с сервером) | `pnpm add zod` |
| ky | 1.x | HTTP-клиент (fetch-обертка) | `pnpm add ky` |
| lucide-react | 0.4x | Иконки (fallback для кастомных) | `pnpm add lucide-react` |
| sonner | 1.x | Toast-уведомления | `pnpm add sonner` |
| yet-another-react-lightbox | 3.x | Лайтбокс для фото | `pnpm add yet-another-react-lightbox` |
| clsx | 2.x | Условные CSS-классы | `pnpm add clsx` |
| tailwindcss | 4.x | Layout-утилиты (flex, grid, spacing) | `pnpm add -D tailwindcss @tailwindcss/vite` |

## Backend

| Пакет | Версия | Назначение | Установка |
|-------|--------|-----------|-----------|
| hono | 4.x | HTTP-фреймворк | `pnpm add hono @hono/node-server` |
| drizzle-orm | 0.38.x | ORM (типизированный SQL) | `pnpm add drizzle-orm` |
| better-sqlite3 | 12.x | SQLite-драйвер | `pnpm add better-sqlite3` |
| jose | 5.x | JWT (sign, verify) | `pnpm add jose` |
| bcryptjs | 3.x | Хэширование паролей (без нативного модуля) | `pnpm add bcryptjs` |
| sharp | 0.33.x | Обработка изображений | `pnpm add sharp` |
| exifr | 7.x | Парсинг EXIF-данных | `pnpm add exifr` |
| archiver | 7.x | Создание zip/tar.gz бэкапов | `pnpm add archiver` |
| drizzle-kit | 0.30.x | Миграции БД | `pnpm add -D drizzle-kit` |
| tsx | 4.x | TypeScript runner (dev) | `pnpm add -D tsx` |

## DevDependencies (общие)

| Пакет | Назначение |
|-------|-----------|
| typescript | 5.7.x |
| @types/react | 19.x |
| @types/react-dom | 19.x |
| @types/better-sqlite3 | 7.x |
| @types/bcryptjs | 2.x |
| concurrently | Параллельный запуск dev-серверов |

## Что НЕ используем

| Технология | Причина |
|-----------|---------|
| Next.js | SSR не нужен, SPA на Vite нативно |
| Prisma | Тяжелый binary engine, высокий RAM |
| PostgreSQL | Отдельный процесс, 200+ МБ RAM |
| Express | Устаревший API, нет нативной типизации |
| Axios | ky легче, fetch-based |
| Styled Components | MW использует CSS custom properties |
| MUI (Material UI for React) | Это React-реализация, мы используем нативный @material/web |
| Ant Design | Навязывает свой дизайн, конфликтует с M3 |
| D3.js | Слишком низкоуровневый для интерактивного графа |
| dagre | Не умеет family tree layout (пары рядом) |
