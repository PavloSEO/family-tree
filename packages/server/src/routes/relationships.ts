import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import type { AuthUser } from "../middleware/auth.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  createRelationship,
  deleteRelationship,
  getRelationshipById,
  listRelationships,
  RelationshipCycleError,
  RelationshipDuplicateError,
  RelationshipNotFoundError,
  RelationshipPersonNotFoundError,
  RelationshipSelfReferenceError,
  RelationshipTooManyParentsError,
  updateRelationship,
} from "../services/relationship.service.js";

const idParamSchema = z.string().uuid();

function zodFirstMessage(err: z.ZodError): string {
  return err.errors[0]?.message ?? "Некорректные данные";
}

function mapRelationshipMutationError(
  c: Context,
  e: unknown,
): Response | null {
  if (e instanceof RelationshipNotFoundError) {
    return c.json({ error: e.message }, 404);
  }
  if (e instanceof RelationshipPersonNotFoundError) {
    return c.json({ error: e.message }, 404);
  }
  if (e instanceof RelationshipDuplicateError) {
    return c.json({ error: e.message }, 409);
  }
  if (
    e instanceof RelationshipCycleError ||
    e instanceof RelationshipTooManyParentsError ||
    e instanceof RelationshipSelfReferenceError
  ) {
    return c.json({ error: e.message }, 400);
  }
  if (e instanceof z.ZodError) {
    return c.json({ error: zodFirstMessage(e) }, 400);
  }
  return null;
}

export const relationshipRoutes = new Hono<{ Variables: { user: AuthUser } }>();

/** GET /api/relationships — admin + viewer. */
relationshipRoutes.get("/", requireAuth, async (c) => {
  const data = await listRelationships();
  return c.json({ data });
});

/** POST /api/relationships — admin. */
relationshipRoutes.post("/", requireAuth, requireAdmin, async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }
  try {
    const { data, warnings } = await createRelationship(raw);
    const payload: { data: typeof data; warnings?: string[] } = { data };
    if (warnings.length > 0) {
      payload.warnings = warnings;
    }
    return c.json(payload, 201);
  } catch (e) {
    const mapped = mapRelationshipMutationError(c, e);
    if (mapped) {
      return mapped;
    }
    throw e;
  }
});

/** GET /api/relationships/:id — admin + viewer. */
relationshipRoutes.get("/:id", requireAuth, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  const data = await getRelationshipById(idParsed.data);
  if (!data) {
    return c.json({ error: "Связь не найдена" }, 404);
  }
  return c.json({ data });
});

/** PUT /api/relationships/:id — admin. */
relationshipRoutes.put("/:id", requireAuth, requireAdmin, async (c) => {
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
    const data = await updateRelationship(idParsed.data, raw);
    return c.json({ data });
  } catch (e) {
    const mapped = mapRelationshipMutationError(c, e);
    if (mapped) {
      return mapped;
    }
    throw e;
  }
});

/** DELETE /api/relationships/:id — admin. */
relationshipRoutes.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  try {
    await deleteRelationship(idParsed.data);
    return c.body(null, 204);
  } catch (e) {
    if (e instanceof RelationshipNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    throw e;
  }
});
