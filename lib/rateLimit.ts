/**
 * Rate limiter in-memory a finestra scorrevole. Best-effort su serverless
 * (si resetta ai cold start, non condiviso tra istanze), ma sufficiente
 * come difesa contro burst di abuso da un singolo IP tra un cold start e
 * l'altro. Per garanzie forti multi-istanza servirebbe uno store esterno
 * (es. Upstash Redis).
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);

  // Evita crescita illimitata della Map in caso di traffico distribuito su molti IP.
  if (hits.size > 5000) hits.clear();

  return timestamps.length > maxHits;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
