import type { MiddlewareHandler } from "hono";
import { recordAndCheckMutateLimit } from "../services/api-mutate-rate-limit.service.js";
import { getRequestIp } from "../services/login-rate-limit.service.js";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const apiMutateRateLimit: MiddlewareHandler = async (c, next) => {
  const path = c.req.path;
  if (!path.startsWith("/api/")) {
    await next();
    return;
  }
  if (!MUTATING.has(c.req.method)) {
    await next();
    return;
  }
  if (path === "/api/auth/login") {
    await next();
    return;
  }

  const ip = getRequestIp(c);
  const { allowed, retryAfterSec } = recordAndCheckMutateLimit(ip);
  if (!allowed) {
    c.header("Retry-After", String(retryAfterSec));
    return c.json(
      { error: "Слишком много запросов. Подождите и попробуйте снова." },
      429,
    );
  }
  await next();
};
