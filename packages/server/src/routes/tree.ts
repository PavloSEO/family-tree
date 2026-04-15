import { Hono } from "hono";
import { z } from "zod";
import type { AuthUser } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getTreeSubgraph,
  TreeRootFilteredOutError,
  TreeRootNotFoundError,
} from "../services/tree.service.js";

const personIdParamSchema = z.string().uuid();

function zodFirstMessage(err: z.ZodError): string {
  return err.errors[0]?.message ?? "Некорректные данные";
}

export const treeRoutes = new Hono<{ Variables: { user: AuthUser } }>();

/** GET /api/tree/:personId — подграф для визуализации (`docs/06-api.md`). */
treeRoutes.get("/:personId", requireAuth, async (c) => {
  const idParsed = personIdParamSchema.safeParse(c.req.param("personId"));
  if (!idParsed.success) {
    return c.json({ error: "Некорректный идентификатор корня" }, 400);
  }
  const user = c.get("user");
  const qRaw = c.req.query();
  /** У viewer внешние ветки не отдаём: query-параметры внешних срезаем (п. 10 аудита). */
  const q =
    user.role === "viewer"
      ? Object.fromEntries(
          Object.entries(qRaw).filter(
            ([k]) => k !== "showExternal" && k !== "externalDepth",
          ),
        )
      : qRaw;
  try {
    const payload = await getTreeSubgraph(idParsed.data, q);
    return c.json({ data: payload });
  } catch (e) {
    if (e instanceof TreeRootNotFoundError) {
      return c.json({ error: e.message }, 404);
    }
    if (e instanceof TreeRootFilteredOutError) {
      return c.json({ error: e.message }, 400);
    }
    if (e instanceof z.ZodError) {
      return c.json({ error: zodFirstMessage(e) }, 400);
    }
    throw e;
  }
});
