#!/bin/sh
set -eu
ROOT="${BACKUPS_PATH:-/data/backups}"
mkdir -p "$ROOT"
find "$ROOT" -maxdepth 1 -type f -name '*.tar.gz' -mtime +30 -delete 2>/dev/null || true
cd /app/packages/server
exec node dist/backup-cli.js
