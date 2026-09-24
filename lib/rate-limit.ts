// A simple in-memory sliding-window limiter, per serverless instance. This
// does NOT protect against distributed abuse (a new cold instance gets a
// fresh counter, and Vercel can run multiple instances concurrently) — a
// real guarantee needs shared storage (Upstash/Vercel KV). What this does
// protect against is the realistic failure mode for this app: ordinary
// clicking (edit a field, hit recheck, repeat) burning through a 20/day
// free-tier quota shared by every visitor. Cheap, and better than nothing.

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    return { ok: false, retryAfterMs: windowMs - (now - oldest) };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return { ok: true };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
