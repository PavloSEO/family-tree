# 12 — Backups

---

## What is backed up

1. SQLite file (`family-tree.db`)
2. Photo directory (`/data/photos/`)

Result: `tar.gz` archive.

## Automatic backup

Cron in the Docker container:
```
0 3 * * * /app/scripts/backup.sh >> /var/log/backup.log 2>&1
```

Script `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/data/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.tar.gz"

tar -czf "$BACKUP_FILE" -C /data db/family-tree.db -C /data photos/

# Delete backups older than 30 days
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +30 -delete
```

## Manual backup via API

`POST /api/backup` — creates a backup, returns the filename.
`GET /api/backup` — list backups (name, size, date).
`GET /api/backup/:filename` — download.
`DELETE /api/backup/:filename` — delete.

## Restore

```bash
# 1. Stop the container
docker compose down

# 2. Extract backup
cd /opt/family-tree
tar -xzf data/backups/backup-2026-04-13_03-00-00.tar.gz -C data/

# 3. Start
docker compose up -d
```

## SQLite — backup notes

In WAL mode SQLite creates `*.db-wal` and `*.db-shm`. For a consistent backup either:
- Use `sqlite3 .backup` (guarantees consistency)
- Or ensure there are no active writes

For production `backup.sh` the following is recommended:
```bash
sqlite3 /data/db/family-tree.db ".backup /data/db/family-tree-backup.db"
tar -czf "$BACKUP_FILE" -C /data db/family-tree-backup.db -C /data photos/
rm /data/db/family-tree-backup.db
```
