import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireUser } from "./users";

/**
 * Helper interno: crea una notifica in-app per un utente. Usato da
 * quotes.ts, chat.ts, partners.ts e admin.ts — mai esposto direttamente
 * come mutation pubblica (il chiamante decide sempre il destinatario
 * lato server, mai il client).
 */
export async function createNotification(
  ctx: { db: any },
  args: {
    userId: Id<"users">;
    kind: string;
    title: string;
    body: string;
    link?: string;
  }
) {
  await ctx.db.insert("notifications", {
    userId: args.userId,
    kind: args.kind,
    title: args.title,
    body: args.body,
    link: args.link,
    read: false,
    createdAt: Date.now(),
  });
}

/** Ultime notifiche dell'utente autenticato (più recenti prima). */
export const listMyNotifications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(Math.min(limit ?? 30, 100));
  },
});

/** Conteggio non lette (per il badge campanella). */
export const unreadCount = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const user = await requireUser(ctx);
    const notif = await ctx.db.get(notificationId);
    if (!notif || notif.userId !== user._id) {
      throw new Error("Not authorized");
    }
    if (!notif.read) {
      await ctx.db.patch(notificationId, { read: true });
    }
  },
});

export const markAllRead = mutation({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();
    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { read: true }))
    );
  },
});
