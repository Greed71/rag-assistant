// Sliding-window rate limiter keyed by IP. In-memory only — not suitable for
// multi-instance deployments without a shared store (Redis, etc.).
const store = new Map<string, number[]>();

export function checkRateLimit(ip: string, limitPerMinute: number): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;

  const prev = store.get(ip) ?? [];
  const recent = prev.filter((t) => t > windowStart);

  if (recent.length >= limitPerMinute) {
    store.set(ip, recent);
    return false;
  }

  recent.push(now);
  store.set(ip, recent);
  return true;
}
