/** In-memory счётчик по IP; окно скользящее по меткам времени. */

const timestampsByIp = new Map<string, number[]>();

export function getApiMutateRateLimitMax(): number {
  const n = Number(process.env.API_MUTATE_RATE_LIMIT_MAX ?? 400);
  return Number.isFinite(n) && n > 0 ? Math.min(50_000, n) : 400;
}

export function getApiMutateRateLimitWindowMinutes(): number {
  const n = Number(process.env.API_MUTATE_RATE_LIMIT_WINDOW_MINUTES ?? 15);
  return Number.isFinite(n) && n > 0 ? Math.min(1440, n) : 15;
}

function windowMs(): number {
  return getApiMutateRateLimitWindowMinutes() * 60 * 1000;
}

function prune(ts: number[], window: number): number[] {
  const now = Date.now();
  return ts.filter((t) => now - t <= window);
}

/**
 * Учитывает один мутационный запрос с IP. Лимит общий на все такие запросы
 * (кроме `POST /api/auth/login` — там отдельная логика).
 */
export function recordAndCheckMutateLimit(ip: string): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const max = getApiMutateRateLimitMax();
  const w = windowMs();
  let ts = timestampsByIp.get(ip) ?? [];
  ts = prune(ts, w);
  if (ts.length >= max) {
    const oldest = ts[0]!;
    const retryAfterSec = Math.ceil((oldest + w - Date.now()) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }
  ts.push(Date.now());
  timestampsByIp.set(ip, ts);
  return { allowed: true, retryAfterSec: 0 };
}
