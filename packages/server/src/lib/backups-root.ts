import path from "node:path";

/** Directory for tar.gz backups (`BACKUPS_PATH`, else `<cwd>/data/backups`). */
export function getBackupsRoot(): string {
  const raw = process.env.BACKUPS_PATH?.trim();
  if (raw && raw.length > 0) {
    return path.resolve(raw);
  }
  return path.resolve(process.cwd(), "data", "backups");
}
