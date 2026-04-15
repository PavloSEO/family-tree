import { Hono } from "hono";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import type { Context } from "hono";
import type { AuthUser } from "../middleware/auth.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { getPhotosRoot } from "../lib/photos-root.js";
import { resolvePhotoFile } from "../lib/safe-photo-path.js";
import { AlbumNotFoundError } from "../services/album.service.js";
import { uploadAlbumPhoto } from "../services/album-photo-upload.service.js";
import {
  createPhotoTag,
  deletePhotoTag,
  listTagsForPhoto,
  PhotoTagNotFoundError,
} from "../services/photo-tag.service.js";
import {
  deletePhoto,
  getPhotoById,
  PhotoNotFoundError,
  updatePhoto,
} from "../services/photo.service.js";

function mimeFromFileName(filePath: string): string {
  const base = filePath.split(/[/\\]/).pop() ?? "";
  const ext = base.includes(".")
    ? base.slice(base.lastIndexOf(".")).toLowerCase()
    : "";
  if (ext === ".jpg" || ext === ".jpeg") {
    return "image/jpeg";
  }
  if (ext === ".png") {
    return "image/png";
  }
  if (ext === ".webp") {
    return "image/webp";
  }
  if (ext === ".gif") {
    return "image/gif";
  }
  return "application/octet-stream";
}

const MAIN_FILE_RE = /^main\.[a-z0-9]+$/i;

function decodePathSegment(blob: string): string | null {
  try {
    return decodeURIComponent(blob);
  } catch {
    return null;
  }
}

async function serveResolvedPhoto(
  c: Context,
  relPosix: string,
): Promise<Response> {
  const root = getPhotosRoot();
  const full = resolvePhotoFile(root, relPosix);
  if (!full) {
    return c.json({ error: "Некорректный путь" }, 400);
  }
  try {
    const buf = await readFile(full);
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": mimeFromFileName(full),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return c.json({ error: "Файл не найден" }, 404);
  }
}

export const photosRoutes = new Hono<{ Variables: { user: AuthUser } }>();

const uuidParam = z.string().uuid();

function zodFirstMessage(err: z.ZodError): string {
  return err.errors[0]?.message ?? "Некорректные данные";
}

/** POST /api/photos/upload — multipart: albumId, file (JPEG/PNG/WebP). */
photosRoutes.post("/upload", requireAuth, requireAdmin, async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ error: "Ожидается multipart/form-data" }, 400);
  }
  const albumIdRaw = body.albumId ?? body["albumId"];
  const albumId =
    typeof albumIdRaw === "string" ? albumIdRaw.trim() : "";
  const idParsed = uuidParam.safeParse(albumId);
  if (!idParsed.success) {
    return c.json({ error: "Некорректный albumId" }, 400);
  }
  const file = body.file ?? body["file"];
  if (!file || typeof file === "string") {
    return c.json({ error: "Нет файла (поле file)" }, 400);
  }
  if (!(file instanceof Blob)) {
    return c.json({ error: "Некорректное поле file" }, 400);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const clientMime = file.type || null;
  try {
    const data = await uploadAlbumPhoto(idParsed.data, {
      buffer,
      clientMime,
    });
    return c.json({ data }, 201);
  } catch (e) {
    if (e instanceof AlbumNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof Error) {
      return c.json({ error: e.message }, 400);
    }
    throw e;
  }
});

/**
 * GET /api/photos/file/person/:personId/:fileName — `main.*` under person dir (no `..`).
 */
photosRoutes.get("/file/person/:personId/:fileName", requireAuth, async (c) => {
  const personId = c.req.param("personId");
  const fileName = c.req.param("fileName");
  const idOk = uuidParam.safeParse(personId);
  if (!idOk.success || fileName.includes("/") || fileName.includes("..")) {
    return c.json({ error: "Некорректный путь" }, 400);
  }
  if (!MAIN_FILE_RE.test(fileName)) {
    return c.json({ error: "Некорректное имя файла" }, 400);
  }
  return serveResolvedPhoto(c, `${personId}/${fileName}`);
});

/**
 * GET /api/photos/file/album/:albumId/:fileName — album JPEG (`uuid.jpg` / `uuid_thumb.jpg`).
 */
photosRoutes.get("/file/album/:albumId/:fileName", requireAuth, async (c) => {
  const albumId = c.req.param("albumId");
  const fileName = c.req.param("fileName");
  const idOk = uuidParam.safeParse(albumId);
  if (!idOk.success || fileName.includes("/") || fileName.includes("..")) {
    return c.json({ error: "Некорректный путь" }, 400);
  }
  return serveResolvedPhoto(c, `album/${albumId}/${fileName}`);
});

/**
 * GET /api/photos/file/:path — single URL segment (`encodeURIComponent(rel)`), e.g. `personId%2Fmain.jpg`.
 */
photosRoutes.get("/file/:path", requireAuth, async (c) => {
  const blob = c.req.param("path");
  const rel = decodePathSegment(blob);
  if (!rel) {
    return c.json({ error: "Некорректный путь" }, 400);
  }
  return serveResolvedPhoto(c, rel);
});

photosRoutes.post("/:id/tag", requireAuth, requireAdmin, async (c) => {
  const idParsed = uuidParam.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор фото" }, 400);
  }
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }
  try {
    const data = await createPhotoTag(idParsed.data, raw);
    return c.json({ data }, 201);
  } catch (e) {
    if (e instanceof PhotoNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    if (e instanceof Error) {
      const msg = e.message;
      if (msg.includes("уже существует")) {
        return c.json({ error: msg }, 409);
      }
      return c.json({ error: msg }, 400);
    }
    throw e;
  }
});

photosRoutes.delete("/:id/tag/:tagId", requireAuth, requireAdmin, async (c) => {
  const idParsed = uuidParam.safeParse(c.req.param("id"));
  const tagParsed = uuidParam.safeParse(c.req.param("tagId"));
  if (!idParsed.success || !tagParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  try {
    await deletePhotoTag(idParsed.data, tagParsed.data);
    return c.body(null, 204);
  } catch (e) {
    if (e instanceof PhotoTagNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    throw e;
  }
});

photosRoutes.get("/:id", requireAuth, async (c) => {
  const idParsed = uuidParam.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  const data = await getPhotoById(idParsed.data);
  if (!data) {
    return c.json({ error: "Фото не найдено" }, 404);
  }
  const tags = await listTagsForPhoto(idParsed.data);
  return c.json({ data: { ...data, tags } });
});

photosRoutes.put("/:id", requireAuth, requireAdmin, async (c) => {
  const idParsed = uuidParam.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }
  try {
    const data = await updatePhoto(idParsed.data, raw);
    return c.json({ data });
  } catch (e) {
    if (e instanceof PhotoNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    throw e;
  }
});

photosRoutes.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const idParsed = uuidParam.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  try {
    await deletePhoto(idParsed.data);
    return c.body(null, 204);
  } catch (e) {
    if (e instanceof PhotoNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    throw e;
  }
});
