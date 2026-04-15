#!/bin/sh
set -e
if [ "${ENABLE_BACKUP_CRON:-0}" = "1" ]; then
  if [ -f /etc/crontabs/root ]; then
    chmod 600 /etc/crontabs/root 2>/dev/null || true
  fi
  crond -b -l 5 2>/dev/null || crond 2>/dev/null || true
fi
exec "$@"
