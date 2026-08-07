import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { rankOf, isProtectedAccount, isBanned } from "./roles";
import { sanitizeSingleLine, sanitizeText } from "./sanitize";
import { estimateBudgetValue } from "./pricing";
import { createNotification } from "./notifications";
import { sendEmail } from "./emails";

interface LogArgs {
  actor: Id<"users">;
  action: string;
  targetUserId?: Id<"users">;
  details?: string;
}

/** Registra un'azione amministrativa nella tabella adminLogs. */
export async function logAdminAction(ctx: { db: any }, args: LogArgs) {
  await ctx.db.insert("adminLogs", {
    actor: args.actor,
    action: args.action,
    targetUserId: args.targetUserId,
    details: args.details,
    createdAt: Date.now(),
  });
}

/** Helper: utente autenticato, non bannato, con ruolo >= admin. */
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (isBanned(user)) {
    throw new Error("Account banned");
  }
  if (rankOf(user.role) < rankOf("admin")) {
    throw new Error("Not authorized");
  }
  return user;
}

/**
 * Statistiche di piattaforma (admin/superadmin):
 * utenti, verificate, ban, nuovi utenti 30gg, preventivi per stato e
 * metriche di performance (tempo medio completamento e prima risposta).
 */
export const getPlatformStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [users, quotes] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("quoteRequests").collect(),
    ]);
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const quotesByStatus: Record<string, number> = {};
    for (const q of quotes) {
      quotesByStatus[q.status] = (quotesByStatus[q.status] ?? 0) + 1;
    }

    const completed = quotes.filter((q) => q.status === "completed");
    const avgCompletionDays =
      completed.length > 0
        ? completed.reduce((s, q) => s + (q.updatedAt - q.createdAt), 0) /
          completed.length /
          DAY
        : null;

    const responded = quotes.filter((q) => !!q.firstResponseAt);
    const avgFirstResponseHours =
      responded.length > 0
        ? responded.reduce(
            (s, q) => s + ((q.firstResponseAt ?? 0) - q.createdAt),
            0
          ) /
          responded.length /
          (60 * 60 * 1000)
        : null;

    return {
      totalUsers: users.length,
      verifiedUsers: users.filter((u) => !!u.emailVerificationTime).length,
      bannedUsers: users.filter((u) => !!u.isBanned).length,
      newUsers30d: users.filter((u) => u._creationTime >= now - 30 * DAY).length,
      totalQuotes: quotes.length,
      quotesByStatus,
      quotes30d: quotes.filter((q) => q.createdAt >= now - 30 * DAY).length,
      publicQuotes: quotes.filter((q) => q.source === "public").length,
      clientAreaQuotes: quotes.filter((q) => q.source === "client_area").length,
      avgCompletionDays,
      avgFirstResponseHours,
    };
  },
});

/** Ultimi log amministrativi (admin/superadmin). */
export const listAdminLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);
    const logs = await ctx.db
      .query("adminLogs")
      .order("desc")
      .take(Math.min(limit ?? 50, 200));
    return Promise.all(
      logs.map(async (log) => {
        const actor = await ctx.db.get(log.actor);
        return {
          _id: log._id,
          action: log.action,
          targetUserId: log.targetUserId,
          details: log.details ?? "",
          createdAt: log.createdAt,
          actorEmail: actor?.email ?? "",
          actorName: actor?.name ?? "",
        };
      })
    );
  },
});

/** Ban/unban di un utente (admin/superadmin). Il superadmin è inviolabile. */
export const setUserBan = mutation({
  args: {
    userId: v.id("users"),
    banned: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("User not found");
    }
    if (args.userId === actor._id) {
      throw new Error("Cannot ban yourself");
    }
    if (isProtectedAccount(target.email, target.role)) {
      throw new Error("Cannot modify superadmin");
    }
    const reason = args.banned
      ? sanitizeSingleLine(args.reason ?? "", 500)
      : undefined;
    await ctx.db.patch(args.userId, {
      isBanned: args.banned || undefined,
      banReason: reason,
      bannedAt: args.banned ? Date.now() : undefined,
    });
    await logAdminAction(ctx, {
      actor: actor._id,
      action: args.banned ? "user.ban" : "user.unban",
      targetUserId: args.userId,
      details: reason || undefined,
    });
  },
});

// ---------------------------------------------------------------- Pipeline

/**
 * Pipeline finanziaria (admin/superadmin): valore dei preventivi per stato.
 * Usa la valutazione comunicata (`quotedAmount`) se presente, altrimenti la
 * stima prudenziale dalla fascia di budget del richiedente.
 */
export const getFinancePipeline = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const quotes = await ctx.db.query("quoteRequests").collect();
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const byStatus: Record<
      string,
      { count: number; quoted: number; estimated: number }
    > = {};
    const statuses = [
      "new",
      "in_review",
      "quoted",
      "accepted",
      "declined",
      "completed",
    ];
    for (const s of statuses) {
      byStatus[s] = { count: 0, quoted: 0, estimated: 0 };
    }

    let pipelineValue = 0;
    let wonValue = 0;
    let quotes30d = 0;

    for (const q of quotes) {
      const bucket = byStatus[q.status] ?? {
        count: 0,
        quoted: 0,
        estimated: 0,
      };
      bucket.count += 1;
      const quoted = q.quotedAmount ?? 0;
      const estimated = estimateBudgetValue(q.budgetRange);
      bucket.quoted += quoted;
      bucket.estimated += estimated;

      // Pipeline: esclude declinate; accettate e completate contano pieno.
      const effective = quoted || estimated;
      if (q.status === "accepted" || q.status === "completed") {
        wonValue += effective;
      } else if (
        q.status === "new" ||
        q.status === "in_review" ||
        q.status === "quoted"
      ) {
        pipelineValue += effective;
      }
      if (q.createdAt >= now - 30 * DAY) {
        quotes30d += effective;
      }
    }

    return {
      byStatus,
      pipelineValue,
      wonValue,
      totalPotential: pipelineValue + wonValue,
      quotes30dValue: quotes30d,
    };
  },
});

// ---------------------------------------------------------------- Analytics

/**
 * Analytics delle pagine (admin/superadmin). I dati derivano dagli header
 * Vercel (paese/città) e dal visitorKey pseudonimo (hash SHA-256 di IP+salt):
 * l'IP grezzo non viene mai salvato. `uniqueVisitors` conta i visitorKey
 * unici; gli utenti autenticati sono conteggiati come sessioni distinte
 * (nessun userId viene mai accettato dall'endpoint HTTP di tracking).
 */
export const getAnalytics = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days }) => {
    await requireAdmin(ctx);
    const windowDays = Math.min(Math.max(days ?? 30, 1), 365);
    const since = Date.now() - windowDays * 24 * 60 * 60 * 1000;

    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", since))
      .collect();

    const byCountry: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    const byPath: Record<string, number> = {};
    const byDay: Record<string, { total: number; authed: number }> = {};
    const uniqueVisitors = new Set<string>();

    for (const vw of views) {
      if (vw.country) {
        byCountry[vw.country] = (byCountry[vw.country] ?? 0) + 1;
      }
      if (vw.city) {
        byCity[vw.city] = (byCity[vw.city] ?? 0) + 1;
      }
      byPath[vw.path] = (byPath[vw.path] ?? 0) + 1;

      const day = new Date(vw.createdAt).toISOString().slice(0, 10);
      const bucket = byDay[day] ?? { total: 0, authed: 0 };
      bucket.total += 1;
      if (vw.isAuthenticated) {
        bucket.authed += 1;
      }
      byDay[day] = bucket;

      if (vw.visitorKey) {
        uniqueVisitors.add(vw.visitorKey);
      }
    }

    const topPaths = Object.entries(byPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([path, count]) => ({ path, count }));

    const topCountries = Object.entries(byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([country, count]) => ({ country, count }));

    const topCities = Object.entries(byCity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([city, count]) => ({ city, count }));

    return {
      totalViews: views.length,
      authedViews: views.filter((v) => v.isAuthenticated).length,
      anonymousViews: views.filter((v) => !v.isAuthenticated).length,
      uniqueVisitors: uniqueVisitors.size,
      topPaths,
      topCountries,
      topCities,
      byDay: Object.entries(byDay)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, data]) => ({ date, ...data })),
    };
  },
});

// ---------------------------------------------------------------- Notifiche bulk

/**
 * Notifica bulk (admin/superadmin): crea una notifica in-app per ogni utente
 * e pianifica l'invio delle email. Il lavoro pesante è demandato a un'azione
 * interna per non superare i limiti di scrittura di una singola mutation.
 */
export const sendBulkNotification = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const title = sanitizeSingleLine(args.title, 150);
    const body = sanitizeText(args.body, 4000, true);
    if (!title || !body) {
      throw new Error("Missing required fields");
    }
    const link = args.link
      ? sanitizeSingleLine(args.link, 500)
      : undefined;
    await logAdminAction(ctx, {
      actor: actor._id,
      action: "notification.bulk",
      details: title,
    });
    await ctx.scheduler.runAfter(
      0,
      internal.admin.runBulkNotification,
      { title, body, link }
    );
  },
});

/** Mutation interna: crea una notifica per un singolo utente. */
export const insertNotificationForUser = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await createNotification(ctx, {
      userId: args.userId,
      kind: "bulk",
      title: args.title,
      body: args.body,
      link: args.link,
    });
  },
});

/** Azione interna: distribuisce notifiche + email a tutti gli utenti. */
export const runBulkNotification = internalAction({
  args: {
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.runQuery(
      internal.admin.listNotificationRecipients
    );
    for (const u of users) {
      await ctx.runMutation(internal.admin.insertNotificationForUser, {
        userId: u._id,
        title: args.title,
        body: args.body,
        link: args.link,
      });
      if (u.email && u.emailVerified) {
        await sendEmail({
          to: u.email,
          subject: args.title,
          text: `${args.body}\n\n— CORE829`,
        });
      }
    }
  },
});

/** Query interna: destinatari della notifica bulk (non bannati). */
export const listNotificationRecipients = internalQuery({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => !u.isBanned)
      .map((u) => ({
        _id: u._id,
        email: u.email ?? "",
        emailVerified: !!u.emailVerificationTime,
      }));
  },
});
