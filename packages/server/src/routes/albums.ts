import { Hono } from "hono";
import { z } from "zod";
import type { AuthUser } from "../middleware/auth.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  AlbumNotFoundError,
  createAlbum,
  deleteAlbum,
  getAlbumWithPhotos,
  listAlbums,
  updateAlbum,
} from "../services/album.service.js";

const idParamSchema = z.string().uuid();

function zodFirstMessage(err: z.ZodError): string {
  return err.errors[0]?.message ?? "Некорректные данные";
}

export const albumRoutes = new Hono<{ Variables: { user: AuthUser } }>();

albumRoutes.get("/", requireAuth, async (c) => {
  try {
    const data = await listAlbums(c.req.query());
    return c.json({ data });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    throw e;
  }
});

albumRoutes.get("/:id", requireAuth, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  const payload = await getAlbumWithPhotos(idParsed.data);
  if (!payload) {
    return c.json({ error: "Альбом не найден" }, 404);
  }
  return c.json({ data: payload });
});

albumRoutes.post("/", requireAuth, requireAdmin, async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }
  try {
    const data = await createAlbum(raw);
    return c.json({ data }, 201);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    throw e;
  }
});

albumRoutes.put("/:id", requireAuth, requireAdmin, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
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
    const data = await updateAlbum(idParsed.data, raw);
    return c.json({ data });
  } catch (e) {
    if (e instanceof AlbumNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    throw e;
  }
});

albumRoutes.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  try {
    await deleteAlbum(idParsed.data);
    return c.body(null, 204);
  } catch (e) {
    if (e instanceof AlbumNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    throw e;
  }
});
