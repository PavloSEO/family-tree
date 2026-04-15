import path from "node:path";

/** Каталог tar.gz бэкапов (`BACKUPS_PATH`, иначе `<cwd>/data/backups`). */
export function getBackupsRoot(): string {
  const raw = process.env.BACKUPS_PATH?.trim();
  if (raw && raw.length > 0) {
    return path.resolve(raw);
  }
  return path.resolve(process.cwd(), "data", "backups");
}
