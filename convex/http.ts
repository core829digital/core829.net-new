import { httpRouter } from "convex/server";
import { v } from "convex/values";
import { httpAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Rotte per la verifica dei JWT (.well-known/openid-configuration,
// .well-known/jwks.json) e per gli eventuali flussi OAuth.
auth.addHttpRoutes(http);

/**
 * Tracking anonimo delle pagine viste (senza conservare IP grezzi).
 *
 * L'action HTTP legge gli header Vercel (paese/città) e calcola un
 * `visitorKey` pseudonimo = SHA-256(IP + salt). L'IP non viene mai salvato:
 * solo un digest non reversibile per contare i visitatori unici.
 *
 * Sicurezza: l'endpoint è pubblico e NON accetta `userId` dal client
 * (sarebbe un vettore di spoofing sull'analytics). L'unico dato derivato
 * dall'autenticazione è il booleano `isAuthenticated` segnalato dal client.
 */
const PAGE_VIEW_SALT =
  process.env.PAGE_VIEW_SALT ?? "core829-page-view-salt";

async function hashVisitorKey(ip: string): Promise<string> {
  if (!ip) {
    return "";
  }
  const data = new TextEncoder().encode(`${ip}|${PAGE_VIEW_SALT}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

http.route({
  path: "/track-page-view",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let payload: {
      path?: unknown;
      locale?: unknown;
      isAuthenticated?: unknown;
    } = {};
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const path =
      typeof payload.path === "string"
        ? payload.path.slice(0, 500)
        : "/";
    const locale =
      typeof payload.locale === "string"
        ? payload.locale.slice(0, 8)
        : "";
    const isAuthenticated = payload.isAuthenticated === true;

    // Header Vercel/Next: geolocalizzazione a livello paese/città.
    const country =
      request.headers.get("x-vercel-ip-country") ?? undefined;
    const city =
      request.headers.get("x-vercel-ip-city") ?? undefined;

    // IP per il visitorKey pseudonimo (mai salvato grezzo).
    const forwarded = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0]?.trim() ?? "";
    const visitorKey = await hashVisitorKey(ip);

    await ctx.runMutation(internal.http.insertPageView, {
      path,
      locale,
      country,
      city,
      visitorKey,
      isAuthenticated,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

/** Mutation interna che salva la pageview. */
export const insertPageView = internalMutation({
  args: {
    path: v.string(),
    locale: v.string(),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    visitorKey: v.optional(v.string()),
    isAuthenticated: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Rate limit minimale per la raccolta: al massimo 1 insert al secondo
    // per visitorKey (protezione da abusi del tracking HTTP aperto).
    const recent = await ctx.db
      .query("pageViews")
      .withIndex("by_createdAt", (q) =>
        q.gte("createdAt", Date.now() - 1000)
      )
      .collect();
    if (args.visitorKey) {
      const dup = recent.find((r) => r.visitorKey === args.visitorKey);
      if (dup) {
        return;
      }
    }
    await ctx.db.insert("pageViews", {
      path: args.path,
      locale: args.locale,
      country: args.country,
      city: args.city,
      visitorKey: args.visitorKey,
      isAuthenticated: args.isAuthenticated,
      createdAt: Date.now(),
    });
  },
});

export default http;
