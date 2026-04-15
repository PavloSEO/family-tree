import type { MiddlewareHandler } from "hono";

/**
 * Базовый CSP для SPA + API того же origin.
 * Google Fonts — как в `packages/client/index.html`.
 * `img` — превью blob/data и фото с `/api/...`.
 *
 * Доп. источники для `fetch` / XHR (клиент с `VITE_API_BASE_URL` на другой origin):
 * переменная окружения **`CSP_CONNECT_SRC_EXTRA`** — пробел-разделённый список origin
 * (например `https://api.example.com`), добавляется к **`connect-src`** после **`'self'`**.
 */
function buildContentSecurityPolicy(): string {
  const extraConnect = process.env.CSP_CONNECT_SRC_EXTRA?.trim();
  const connectSrc =
    extraConnect && extraConnect.length > 0
      ? `connect-src 'self' ${extraConnect}`
      : "connect-src 'self'";

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    connectSrc,
    "object-src 'none'",
    "worker-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  c.header("Content-Security-Policy", buildContentSecurityPolicy());
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  c.header("X-Frame-Options", "DENY");
  await next();
};
