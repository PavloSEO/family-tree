import { Hono } from "hono";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import type { AuthUser } from "../middleware/auth.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  BackupNotFoundError,
  createBackup,
  deleteBackupFile,
  getBackupAbsolutePathOrThrow,
  listBackups,
} from "../services/backup.service.js";

export const backupRoutes = new Hono<{ Variables: { user: AuthUser } }>();

backupRoutes.get("/", requireAuth, requireAdmin, (c) => {
  return c.json({ data: listBackups() });
});

backupRoutes.post("/", requireAuth, requireAdmin, async (c) => {
  try {
    const data = await createBackup();
    return c.json({ data }, 201);
  } catch (e) {
    if (e instanceof Error) {
      return c.json({ error: e.message }, 500);
    }
    throw e;
  }
});

backupRoutes.get("/:filename", requireAuth, requireAdmin, (c) => {
  const filename = c.req.param("filename");
  try {
    const abs = getBackupAbsolutePathOrThrow(filename);
    const nodeStream = createReadStream(abs);
    const webStream = Readable.toWeb(nodeStream);
    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    if (e instanceof BackupNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    throw e;
  }
});

backupRoutes.delete("/:filename", requireAuth, requireAdmin, (c) => {
  const filename = c.req.param("filename");
  try {
    deleteBackupFile(filename);
    return c.body(null, 204);
  } catch (e) {
    if (e instanceof BackupNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    throw e;
  }
});
