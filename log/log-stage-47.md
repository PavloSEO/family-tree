# Этап 47 — сервер: бэкапы (tar.gz)

**ROADMAP:** сервис бэкапов — SQLite + каталог фото; **`POST/GET/DELETE /api/backup`**, скачивание по имени.

## Сделано

### Зависимости

- **`archiver`** (+ **`@types/archiver`**) — tar + gzip в один файл.

### Пути и безопасность

- **`packages/server/src/lib/backups-root.ts`** — **`getBackupsRoot()`** (`**BACKUPS_PATH**` или **`data/backups`**).
- **`packages/server/src/lib/safe-backup-filename.ts`** — валидация имени, **`resolveBackupFilePath`**, **`generateBackupFileName`**.

### Сервис

- **`packages/server/src/services/backup.service.ts`** — перед архивом **`wal_checkpoint(FULL)`**; внутри архива **`db/family-tree.db`** и **`photos/`**; **`listBackups`**, **`createBackup`**, **`getBackupAbsolutePathOrThrow`**, **`deleteBackupFile`**; при ошибке записи — удаление частичного файла.

### API

- **`packages/server/src/routes/backup.ts`** — все методы только **admin** (+ **`requireAuth`**); скачивание через **`Readable.toWeb`** + **`application/gzip`**.
- **`packages/server/src/index.ts`** — **`app.route("/api/backup", backupRoutes)`**.

### База

- **`packages/server/src/db/connection.ts`** — экспорт **`getDatabaseFilePath()`**.

### Окружение

- **`docker-compose.yml`** — **`BACKUPS_PATH: /data/backups`**.
- **`.env.example`** — описание **`BACKUPS_PATH`**.

### Документация

- **`docs/06-api.md`** — уточнены пути, формат ответов и структура архива.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
```

## Следующий этап

**48** — клиент: **`AdminBackupPage`**, прогресс, Docker cron; **`ROADMAP.md`**, `log-stage-48.md`.
