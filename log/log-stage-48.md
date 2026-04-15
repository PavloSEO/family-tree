# Этап 48 — клиент: бэкапы + Docker cron

**ROADMAP:** **`AdminBackupPage`** (DataTable, FAB, скачать/удалить, **`md-linear-progress`** при создании); Docker: ежедневный cron, хранение **30** дней.

## Сделано

### Клиент

- **`packages/client/src/api/backup.ts`** — **`fetchBackupsList`**, **`createBackup`**, **`deleteBackup`**, **`downloadBackupFile`** (Zod, blob + ссылка).
- **`packages/client/src/pages/AdminBackupPage.tsx`** — поиск по имени файла, сортировка/страницы на клиенте, колонки файл / размер / дата / действия, **`MdDialog`** подтверждения удаления, FAB «Создать бэкап», **`md-linear-progress`** `indeterminate` на время **`POST /api/backup`**.
- **`packages/client/src/App.tsx`** — **`/admin/backup`** → **`AdminBackupPage`**.

### Сервер (CLI для cron)

- **`packages/server/src/backup-cli.ts`** — после **`bootstrap`**: **`createBackup()`**, JSON в stdout.
- **`packages/server/package.json`** — второй бандл **`esbuild` → `dist/backup-cli.js`**.

### Docker

- **`docker/entrypoint.sh`** — при **`ENABLE_BACKUP_CRON=1`** запуск **`crond`**, затем **`exec`** основной CMD.
- **`docker/crontab-root`** — **03:00** ежедневно: **`scripts/docker-backup-run.sh`**.
- **`scripts/docker-backup-run.sh`** — **`find`** удаляет **`*.tar.gz`** старше **30** дней в **`BACKUPS_PATH`**, затем **`node dist/backup-cli.js`**.
- **`Dockerfile`** — копия entrypoint, crontab, скрипта; **`ENTRYPOINT`**.
- **`docker-compose.yml`** — **`ENABLE_BACKUP_CRON: "1"`**.

### Документация

- **`docs/11-deployment.md`** — раздел про cron, ротацию, переменную **`ENABLE_BACKUP_CRON`**.

## Проверки

```bash
npx pnpm@9.15.4 --filter @family-tree/server run typecheck
npx pnpm@9.15.4 --filter @family-tree/server run build
npx pnpm@9.15.4 --filter @family-tree/client run typecheck
npx pnpm@9.15.4 --filter @family-tree/client run build
```

## Следующий этап

**49** — клиент: **`WelcomePage`**, toasts (sonner / M3); **`ROADMAP.md`**, `log-stage-49.md`.
