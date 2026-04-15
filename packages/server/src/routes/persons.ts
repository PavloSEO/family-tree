import { Hono } from "hono";
import { z } from "zod";
import type { AuthUser } from "../middleware/auth.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { listRelativesForPerson } from "../services/person-relatives.service.js";
import {
  createPerson,
  deletePerson,
  findPersonDuplicates,
  getPersonById,
  listPersons,
  PersonNotFoundError,
  updatePerson,
} from "../services/person.service.js";
import { uploadPersonMainPhoto } from "../services/person-main-photo.service.js";

const idParamSchema = z.string().uuid();

function zodFirstMessage(err: z.ZodError): string {
  return err.errors[0]?.message ?? "Некорректные данные";
}

export const personRoutes = new Hono<{ Variables: { user: AuthUser } }>();

/** GET /api/persons/duplicates — admin only (`docs/06-api.md`). */
personRoutes.get("/duplicates", requireAuth, requireAdmin, async (c) => {
  const data = await findPersonDuplicates();
  return c.json({ data });
});

/** GET /api/persons — admin and viewer. */
personRoutes.get("/", requireAuth, async (c) => {
  try {
    const result = await listPersons(c.req.query());
    return c.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    throw e;
  }
});

/** POST /api/persons — admin. */
personRoutes.post("/", requireAuth, requireAdmin, async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }
  try {
    const data = await createPerson(raw);
    return c.json({ data }, 201);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    throw e;
  }
});

/** PUT /api/persons/:id — admin. */
personRoutes.put("/:id", requireAuth, requireAdmin, async (c) => {
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
    const data = await updatePerson(idParsed.data, raw);
    return c.json({ data });
  } catch (e) {
    if (e instanceof PersonNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    throw e;
  }
});

/** POST /api/persons/:id/photo — admin, multipart field `file`. */
personRoutes.post("/:id/photo", requireAuth, requireAdmin, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  let body: Record<string, unknown>;
  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ error: "Ожидается multipart/form-data" }, 400);
  }
  const file = body.file ?? body["file"];
  if (!file || typeof file === "string") {
    return c.json({ error: "Нет файла (поле file)" }, 400);
  }
  if (!(file instanceof Blob)) {
    return c.json({ error: "Некорректное поле file" }, 400);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const data = await uploadPersonMainPhoto(idParsed.data, { buffer });
    return c.json({ data }, 201);
  } catch (e) {
    if (e instanceof PersonNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof Error) {
      return c.json({ error: e.message }, 400);
    }
    throw e;
  }
});

/** DELETE /api/persons/:id — admin. */
personRoutes.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  try {
    await deletePerson(idParsed.data);
    return c.body(null, 204);
  } catch (e) {
    if (e instanceof PersonNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    throw e;
  }
});

/** GET /api/persons/:id/relatives — admin and viewer (relationship graph). */
personRoutes.get("/:id/relatives", requireAuth, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  const data = await listRelativesForPerson(idParsed.data);
  if (data === null) {
    return c.json({ error: "Карточка не найдена" }, 404);
  }
  return c.json({ data });
});

/** GET /api/persons/:id — admin + viewer. */
personRoutes.get("/:id", requireAuth, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  const data = await getPersonById(idParsed.data);
  if (!data) {
    return c.json({ error: "Карточка не найдена" }, 404);
  }
  return c.json({ data });
});
