import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Context, Hono } from "hono";
import type { AuthUser } from "./middleware/auth.js";

/** `Cache-Control` для файлов из Vite `dist/` (см. аудит п. 29). */
function applyStaticCacheHeaders(fsPath: string, c: Context): void {
  const normalized = fsPath.replace(/\\/g, "/").toLowerCase();
  if (normalized.endsWith("/index.html") || normalized.endsWith("index.html")) {
    c.header("Cache-Control", "no-cache");
    c.header("Pragma", "no-cache");
    return;
  }
  if (normalized.includes("/assets/")) {
    c.header("Cache-Control", "public, max-age=31536000, immutable");
    return;
  }
  c.header("Cache-Control", "public, max-age=86400");
}

/** `dist/serve.js` → `packages/client/dist` */
function resolveClientDistDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../client/dist");
}

/**
 * В production отдаёт Vite-сборку клиента и SPA-fallback на `index.html`.
 * API и `/health` не трогает.
 */
export function registerClientSpaIfProd(
  app: Hono<{ Variables: { user: AuthUser } }>,
): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const root = resolveClientDistDir();
  const indexFile = path.join(root, "index.html");
  if (!existsSync(indexFile)) {
    console.warn(
      `[static] пропуск: нет ${indexFile} (соберите client: pnpm --filter @family-tree/client build)`,
    );
    return;
  }

  const staticMw = serveStatic({
    root,
    onFound: (filePath, c) => {
      applyStaticCacheHeaders(filePath, c);
    },
  });

  app.use("*", async (c, next) => {
    const p = c.req.path;
    if (p.startsWith("/api") || p === "/health") {
      return next();
    }
    await staticMw(c, async () => {
      if (c.finalized) {
        return;
      }
      if (c.req.method !== "GET" && c.req.method !== "HEAD") {
        await next();
        return;
      }
      const html = readFileSync(indexFile, "utf-8");
      c.header("Cache-Control", "no-cache");
      c.header("Pragma", "no-cache");
      c.html(html, 200);
    });
  });
}
