import { z } from "zod";
import { api } from "./client.js";

export const backupListItemSchema = z.object({
  filename: z.string(),
  sizeBytes: z.number(),
  createdAt: z.string(),
});

export type BackupListItem = z.infer<typeof backupListItemSchema>;

const listEnvelopeSchema = z.object({
  data: z.array(z.unknown()),
});

const singleEnvelopeSchema = z.object({
  data: z.unknown(),
});

export async function fetchBackupsList(): Promise<BackupListItem[]> {
  const raw = await api.get("/api/backup").json();
  const env = listEnvelopeSchema.parse(raw);
  return env.data.map((row) => backupListItemSchema.parse(row));
}

export async function createBackup(): Promise<BackupListItem> {
  const raw = await api.post("/api/backup").json();
  const env = singleEnvelopeSchema.parse(raw);
  return backupListItemSchema.parse(env.data);
}

export async function deleteBackup(filename: string): Promise<void> {
  const enc = encodeURIComponent(filename);
  await api.delete(`/api/backup/${enc}`);
}

export async function downloadBackupFile(filename: string): Promise<void> {
  const enc = encodeURIComponent(filename);
  const blob = await api.get(`/api/backup/${enc}`).blob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
