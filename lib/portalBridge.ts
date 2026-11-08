import crypto from "node:crypto";

/**
 * Collegamento firmato con il portale (portal.core829.net): il backoffice del sito vive li'.
 * Solo lato server. Se le variabili mancano o il portale non risponde il sito NON si rompe: le funzioni restituiscono false/null.
 *  - PORTAL_SITE_URL: indirizzo HTTP di Convex del portale (https://<deployment>.convex.site)
 *  - SITE_BRIDGE_SECRET: segreto condiviso (whsec_...), lo stesso impostato su Convex del portale
 * Firma "Standard Webhooks": HMAC-SHA256 di `id.timestamp.corpo`.
 */

const BASE = (process.env.PORTAL_SITE_URL ?? "").replace(/\/+$/, "");

export function bridgeConfigured(): boolean {
  return BASE.startsWith("https://") && (process.env.SITE_BRIDGE_SECRET ?? "").startsWith("whsec_");
}

function signature(secret: string, id: string, timestamp: number, body: string): string {
  const key = Buffer.from(secret.slice("whsec_".length), "base64");
  return "v1," + crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
}

/** Invia un evento firmato al portale. Mai lancia errori; true solo se il portale ha risposto 2xx. */
export async function postToPortal(path: "/site/contact" | "/site/event", payload: Record<string, unknown>, timeoutMs = 4000): Promise<boolean> {
  if (!bridgeConfigured()) return false;
  const secret = process.env.SITE_BRIDGE_SECRET as string;
  const body = JSON.stringify(payload);
  const id = `evt_${crypto.randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000);
  try {
    const response = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "webhook-id": id, "webhook-timestamp": String(timestamp), "webhook-signature": signature(secret, id, timestamp, body) },
      body,
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export type PortalConfig = {
  seo: { page: string; locale: string; title: string | null; description: string | null; noindex: boolean }[];
  announcement: { text: string; href: string; cta: string } | null;
};

const EMPTY: PortalConfig = { seo: [], announcement: null };

/** SEO e avviso scelti dal backoffice. In cache 5 minuti; se il portale non risponde si usano i testi predefiniti. */
export async function getPortalConfig(): Promise<PortalConfig> {
  if (!BASE.startsWith("https://")) return EMPTY;
  try {
    const response = await fetch(`${BASE}/site/config`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!response.ok) return EMPTY;
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) return EMPTY;
    const d = data as Partial<PortalConfig>;
    return {
      seo: Array.isArray(d.seo) ? d.seo.filter((s) => s && typeof s.page === "string" && typeof s.locale === "string") : [],
      announcement: d.announcement && typeof d.announcement.text === "string" ? { text: d.announcement.text, href: String(d.announcement.href ?? ""), cta: String(d.announcement.cta ?? "") } : null,
    };
  } catch {
    return EMPTY;
  }
}
