import { NextRequest, NextResponse } from "next/server";
import { postToPortal } from "@/lib/portalBridge";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * Conta una visita nel backoffice del portale (solo contatore per giorno/pagina/lingua: nessun IP, nessun identificativo).
 * Il browser la chiama SOLO se il visitatore ha accettato i cookie analitici. Percorso validato e limitato per IP.
 */
export async function POST(request: NextRequest) {
  if (isRateLimited(getClientIp(request), 120, 60_000)) return new NextResponse(null, { status: 429 });
  let path: unknown;
  try {
    path = ((await request.json()) as { path?: unknown }).path;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof path !== "string" || path.length > 120 || !/^\/[A-Za-z0-9\-_/]*$/.test(path)) return new NextResponse(null, { status: 400 });
  await postToPortal("/site/event", { path }, 2500);
  return new NextResponse(null, { status: 204 });
}
