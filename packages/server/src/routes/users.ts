import { Hono } from "hono";
import { z } from "zod";
import type { AuthUser } from "../middleware/auth.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  createUser,
  deleteUser,
  DuplicateLoginError,
  getUserById,
  LastAdminError,
  listUsers,
  SecondAdminError,
  SelfActionError,
  updateUser,
  UserNotFoundError,
} from "../services/user.service.js";

const idParamSchema = z.string().uuid();

function zodFirstMessage(err: z.ZodError): string {
  return err.errors[0]?.message ?? "Некорректные данные";
}

export const userRoutes = new Hono<{ Variables: { user: AuthUser } }>();

userRoutes.get("/", requireAuth, requireAdmin, async (c) => {
  const data = await listUsers();
  return c.json({ data });
});

userRoutes.get("/:id", requireAuth, requireAdmin, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  const data = await getUserById(idParsed.data);
  if (!data) {
    return c.json({ error: "Пользователь не найден" }, 404);
  }
  return c.json({ data });
});

userRoutes.post("/", requireAuth, requireAdmin, async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }
  try {
    const data = await createUser(raw);
    return c.json({ data }, 201);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    if (e instanceof SecondAdminError) {
      return c.json({ error: e.message }, 409);
    }
    if (e instanceof DuplicateLoginError) {
      return c.json({ error: e.message }, 409);
    }
    if (e instanceof Error) {
      return c.json({ error: e.message }, 400);
    }
    throw e;
  }
});

userRoutes.put("/:id", requireAuth, requireAdmin, async (c) => {
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
  const actor = c.get("user");
  try {
    const data = await updateUser(idParsed.data, raw, actor.id);
    return c.json({ data });
  } catch (e) {
    if (e instanceof UserNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    if (e instanceof SecondAdminError || e instanceof DuplicateLoginError) {
      return c.json({ error: e.message }, 409);
    }
    if (e instanceof LastAdminError || e instanceof SelfActionError) {
      return c.json({ error: e.message }, 400);
    }
    if (e instanceof Error) {
      return c.json({ error: e.message }, 400);
    }
    throw e;
  }
});

userRoutes.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const idParsed = idParamSchema.safeParse(c.req.param("id"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор" }, 400);
  }
  const actor = c.get("user");
  try {
    await deleteUser(idParsed.data, actor.id);
    return c.body(null, 204);
  } catch (e) {
    if (e instanceof UserNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof LastAdminError || e instanceof SelfActionError) {
      return c.json({ error: e.message }, 400);
    }
    throw e;
  }
});
