import type { MiddlewareHandler } from "hono";

/**
 * Baseline CSP for SPA + same-origin API.
 * Google Fonts — as in `packages/client/index.html`.
 * `img` — blob/data previews and photos from `/api/...`.
 *
 * Extra sources for `fetch` / XHR (client with `VITE_API_BASE_URL` on another origin):
 * env **`CSP_CONNECT_SRC_EXTRA`** — space-separated origins
 * (e.g. `https://api.example.com`), appended to **`connect-src`** after **`'self'`**.
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
