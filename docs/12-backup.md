# 12 -- Бэкапы

---

## Что бэкапится

1. SQLite-файл (`family-tree.db`)
2. Директория фото (`/data/photos/`)

Результат: `tar.gz` архив.

## Автобэкап

Cron в Docker-контейнере:
```
0 3 * * * /app/scripts/backup.sh >> /var/log/backup.log 2>&1
```

Скрипт `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/data/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.tar.gz"

tar -czf "$BACKUP_FILE" -C /data db/family-tree.db -C /data photos/

# Удалить старше 30 дней
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +30 -delete
```

## Ручной бэкап через API

`POST /api/backup` -- создает бэкап, возвращает имя файла.
`GET /api/backup` -- список бэкапов (имя, размер, дата).
`GET /api/backup/:filename` -- скачать.
`DELETE /api/backup/:filename` -- удалить.

## Восстановление

```bash
# 1. Остановить контейнер
docker compose down

# 2. Распаковать бэкап
cd /opt/family-tree
tar -xzf data/backups/backup-2026-04-13_03-00-00.tar.gz -C data/

# 3. Запустить
docker compose up -d
```

## SQLite -- особенности бэкапа

SQLite в WAL-режиме создает файлы `*.db-wal` и `*.db-shm`. Для консистентного бэкапа нужно либо:
- Использовать `sqlite3 .backup` команду (гарантирует консистентность)
- Либо убедиться что нет активных записей

В backup.sh для production рекомендуется:
```bash
sqlite3 /data/db/family-tree.db ".backup /data/db/family-tree-backup.db"
tar -czf "$BACKUP_FILE" -C /data db/family-tree-backup.db -C /data photos/
rm /data/db/family-tree-backup.db
```
