import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { rankOf, isProtectedAccount, isBanned } from "./roles";
import { sanitizeSingleLine } from "./sanitize";

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
