import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getBackupsRoot } from "./backups-root.js";

const BACKUP_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.tar\.gz$/;

export function isValidBackupArchiveName(name: string): boolean {
  if (!BACKUP_NAME_RE.test(name)) {
    return false;
  }
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    return false;
  }
  return true;
}

/** Filename for a new backup (unique suffix). */
export function generateBackupFileName(): string {
  const d = new Date();
  const stamp = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
    "-",
    String(d.getHours()).padStart(2, "0"),
    String(d.getMinutes()).padStart(2, "0"),
    String(d.getSeconds()).padStart(2, "0"),
  ].join("");
  const rnd = randomBytes(4).toString("hex");
  return `backup-${stamp}-${rnd}.tar.gz`;
}

/**
 * Absolute path to backup file under `getBackupsRoot()`, or `null` if filename is unsafe.
 */
export function resolveBackupFilePath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || !isValidBackupArchiveName(base)) {
    return null;
  }
  const root = path.resolve(getBackupsRoot());
  const full = path.resolve(root, base);
  const rel = path.relative(root, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  return full;
}

export function assertBackupFileExists(absPath: string): boolean {
  try {
    const st = fs.statSync(absPath);
    return st.isFile();
  } catch {
    return false;
  }
}
