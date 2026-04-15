# Этап 01 — pnpm workspace

**ROADMAP:** «Создать pnpm workspace: корневой `package.json`, `pnpm-workspace.yaml`, три пакета: `packages/shared`, `packages/server`, `packages/client`».

## Сделано

1. **Корень репозитория**
   - `package.json` — имя `family-tree`, `private: true`, зафиксирован `packageManager: pnpm@9.15.4` (Corepack).
   - `pnpm-workspace.yaml` — workspace только для `packages/*` (не затрагивает `material-web-main`).
   - `.gitignore` — `node_modules`, `dist`, `.env`, `data/`, логи и служебные файлы ОС.

2. **`packages/shared`**
   - `@family-tree/shared`, ESM, точка входа `src/index.ts` (пока пустой модуль с комментарием; типы и Zod — **этап 02**).

3. **`packages/server`**
   - `@family-tree/server`, зависимость `workspace:*` на shared; каталог `src/` зарезервирован (**этап 03+**).

4. **`packages/client`**
   - `@family-tree/client`, зависимость `workspace:*` на shared; каталог `src/` зарезервирован (**этап 05**: Vite, React, Material Web).

5. **Журнал**
   - `log/log.md` — обзор и индекс этапов.
   - Этот файл — детали этапа 01.

## Не входило в этап 01 (по ROADMAP)

- TypeScript, Zod, Hono, Vite, Docker — следующие этапы **02–06**.
- Docker для VPS: **этап 06** (`Dockerfile`, `docker-compose.yml`, volumes).

## Проверка

Из корня проекта:

```bash
pnpm install
```

Если команды `pnpm` нет в PATH (типично для Windows без глобальной установки):

```bash
npx pnpm@9.15.4 install
```

После команды выше ожидается успешная установка зависимостей без ошибок линковки workspace; в корне репозитория должен быть актуальный **`pnpm-lock.yaml`** (создан или обновлён).
