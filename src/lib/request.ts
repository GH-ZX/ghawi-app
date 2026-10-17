/** The caller's IP: Cloudflare's header first, then the proxy chain. */
export function clientIp(request: Request): string {
  const edge = request.headers.get("cf-connecting-ip");
  if (edge) return edge.slice(0, 45);
  const forwarded = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  return forwarded.slice(0, 45) || "unknown";
}

/**
 * A moment `minutes` ago, in the exact text form D1 stores timestamps in
 * (`strftime('%Y-%m-%dT%H:%M:%fZ')`, e.g. 2026-10-17T09:30:00.000Z), so a
 * plain string comparison against those columns is also a time comparison.
 */
export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}
