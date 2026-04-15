import archiver from "archiver";
import fs, { createWriteStream } from "node:fs";
import path from "node:path";
import { getBackupsRoot } from "../lib/backups-root.js";
import {
  assertBackupFileExists,
  generateBackupFileName,
  resolveBackupFilePath,
} from "../lib/safe-backup-filename.js";
import { findSymlinkPointingOutsidePhotosRoot } from "../lib/backup-photos-symlink-guard.js";
import { getPhotosRoot } from "../lib/photos-root.js";
import { getDatabaseFilePath, sqlite } from "../db/connection.js";

export type BackupListItem = {
  filename: string;
  sizeBytes: number;
  createdAt: string;
};

export class BackupNotFoundError extends Error {
  readonly code = "BACKUP_NOT_FOUND";

  constructor(filename: string) {
    super(`Бэкап не найден: ${filename}`);
    this.name = "BackupNotFoundError";
  }
}

function listTarGzInDir(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const names = fs.readdirSync(dir);
  return names.filter((n) => n.toLowerCase().endsWith(".tar.gz"));
}

export function listBackups(): BackupListItem[] {
  const root = getBackupsRoot();
  const names = listTarGzInDir(root);
  const items: BackupListItem[] = [];
  for (const filename of names) {
    const abs = resolveBackupFilePath(filename);
    if (!abs) {
      continue;
    }
    try {
      const st = fs.statSync(abs);
      if (!st.isFile()) {
        continue;
      }
      items.push({
        filename,
        sizeBytes: st.size,
        createdAt: st.mtime.toISOString(),
      });
    } catch {
      /* skip */
    }
  }
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return items;
}

async function writeTarGz(
  outAbs: string,
  dbPath: string,
  photosRoot: string,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(outAbs);
    const archive = archiver("tar", {
      gzip: true,
      gzipOptions: { level: 6 },
    });
    const onErr = (err: Error) => {
      reject(err);
    };
    archive.on("error", onErr);
    output.on("error", onErr);
    output.on("close", () => {
      resolve();
    });
    archive.pipe(output);
    if (!fs.existsSync(dbPath)) {
      reject(new Error("Файл базы данных не найден"));
      return;
    }
    archive.file(dbPath, { name: "db/family-tree.db" });
    if (fs.existsSync(photosRoot)) {
      const badLink = findSymlinkPointingOutsidePhotosRoot(photosRoot);
      if (badLink) {
        reject(
          new Error(
            `Бэкап отменён: симлинк в каталоге фото указывает вне корня (${badLink}). Удалите ссылку или замените на файлы.`,
          ),
        );
        return;
      }
      archive.directory(photosRoot, "photos");
    }
    void archive.finalize();
  });
}

export async function createBackup(): Promise<BackupListItem> {
  const backupsRoot = getBackupsRoot();
  fs.mkdirSync(backupsRoot, { recursive: true });
  const filename = generateBackupFileName();
  const outAbs = path.join(backupsRoot, filename);
  const dbPath = getDatabaseFilePath();
  const photosRoot = getPhotosRoot();

  sqlite.pragma("wal_checkpoint(FULL)");

  try {
    await writeTarGz(outAbs, dbPath, photosRoot);
  } catch (e) {
    try {
      fs.unlinkSync(outAbs);
    } catch {
      /* нет частичного файла */
    }
    throw e;
  }

  const st = fs.statSync(outAbs);
  return {
    filename,
    sizeBytes: st.size,
    createdAt: st.mtime.toISOString(),
  };
}

export function getBackupAbsolutePathOrThrow(filename: string): string {
  const abs = resolveBackupFilePath(filename);
  if (!abs || !assertBackupFileExists(abs)) {
    throw new BackupNotFoundError(filename);
  }
  return abs;
}

export function deleteBackupFile(filename: string): void {
  const abs = resolveBackupFilePath(filename);
  if (!abs || !assertBackupFileExists(abs)) {
    throw new BackupNotFoundError(filename);
  }
  fs.unlinkSync(abs);
}
