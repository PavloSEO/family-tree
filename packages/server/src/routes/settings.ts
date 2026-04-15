import { Hono } from "hono";
import { z } from "zod";
import type { AuthUser } from "../middleware/auth.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  getAppSettings,
  InvalidRootPersonError,
  updateAppSettings,
} from "../services/settings.service.js";

function zodFirstMessage(err: z.ZodError): string {
  return err.errors[0]?.message ?? "Некорректные данные";
}

export const settingsRoutes = new Hono<{ Variables: { user: AuthUser } }>();

settingsRoutes.get("/", requireAuth, async (c) => {
  const data = await getAppSettings();
  return c.json({ data });
});

settingsRoutes.put("/", requireAuth, requireAdmin, async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }
  try {
    const data = await updateAppSettings(raw);
    return c.json({ data });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    if (e instanceof InvalidRootPersonError) {
      return c.json({ error: e.message }, 400);
    }
    throw e;
  }
});
