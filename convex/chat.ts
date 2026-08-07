import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { sanitizeText } from "./sanitize";
import { requireUser } from "./users";
import { isInternalRole } from "./roles";
import { createNotification } from "./notifications";
import {
  sendChatMessageToUserEmail,
  sendChatMessageToStaffEmail,
} from "./emails";

const MAX_MESSAGE = 3000;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 ora
const RATE_MAX = 60; // messaggi/ora per utente (chat con staff)

const STAFF_EMAIL = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

/**
 * Una conversazione per utente, condivisa tra tutti i ruoli interni.
 * Data isolation: un cliente vede SOLO la propria conversazione; lo staff
 * vede tutte. Nessun parametro `userId` dai clienti: la conversazione è
 * derivata sempre dall'identità autenticata.
 */

/** Recupera (o crea) la conversazione dell'utente autenticato. */
export const getOrCreateMyConversation = mutation({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (existing) {
      return existing._id;
    }
    const now = Date.now();
    return await ctx.db.insert("conversations", {
      userId: user._id,
      lastMessageAt: now,
      lastMessagePreview: "",
      unreadForUser: false,
      unreadForStaff: false,
    });
  },
});

/** La mia conversazione con lo staff + messaggi (per il cliente). */
export const getMyConversation = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!conversation) {
      return null;
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", conversation._id)
      )
      .order("asc")
      .collect();
    return {
      conversationId: conversation._id,
      unreadForUser: conversation.unreadForUser,
      messages,
    };
  },
});

/** Elenco conversazioni per lo staff (tutte, più recenti prima). */
export const listConversations = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!isInternalRole(user.role)) {
      throw new Error("Not authorized");
    }
    const conversations = await ctx.db
      .query("conversations")
      .order("desc")
      .collect();
    return Promise.all(
      conversations.map(async (c) => {
        const other = await ctx.db.get(c.userId);
        return {
          _id: c._id,
          userId: c.userId,
          userEmail: other?.email ?? "",
          userName: other?.name ?? "",
          lastMessageAt: c.lastMessageAt,
          lastMessagePreview: c.lastMessagePreview,
          unreadForStaff: c.unreadForStaff,
        };
      })
    );
  },
});

/** Messaggi di una conversazione (staff o proprietario). */
export const getConversationMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const user = await requireUser(ctx);
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (!isInternalRole(user.role) && conversation.userId !== user._id) {
      throw new Error("Not authorized");
    }
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();
  },
});

/**
 * Invia un messaggio.
 * - Cliente/partner: scrive SOLO nella propria conversazione.
 * - Staff (partner/technical/admin/superadmin): può scrivere a qualsiasi
 *   utente passando `userId` (staff → cliente).
 */
export const sendMessage = mutation({
  args: {
    body: v.string(),
    conversationId: v.optional(v.id("conversations")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const sender = await requireUser(ctx);
    const body = sanitizeText(args.body, MAX_MESSAGE, true);
    if (!body) {
      throw new Error("Message is empty");
    }

    const now = Date.now();

    let conversationId: Id<"conversations">;
    let recipientUserId: Id<"users">;

    if (isInternalRole(sender.role)) {
      // Lo staff scrive a un utente specifico.
      if (!args.userId) {
        throw new Error("Missing recipient");
      }
      const recipient = await ctx.db.get(args.userId);
      if (!recipient) {
        throw new Error("Recipient not found");
      }
      if (!!recipient.isBanned) {
        throw new Error("Recipient is banned");
      }
      recipientUserId = recipient._id;
      let conversation = await ctx.db
        .query("conversations")
        .withIndex("by_userId", (q) => q.eq("userId", recipientUserId))
        .first();
      if (!conversation) {
        conversationId = await ctx.db.insert("conversations", {
          userId: recipientUserId,
          lastMessageAt: now,
          lastMessagePreview: "",
          unreadForUser: false,
          unreadForStaff: false,
        });
      } else {
        conversationId = conversation._id;
      }
    } else {
      // Cliente: solo la propria conversazione.
      recipientUserId = sender._id;
      let conversation = await ctx.db
        .query("conversations")
        .withIndex("by_userId", (q) => q.eq("userId", sender._id))
        .first();
      if (!conversation) {
        conversationId = await ctx.db.insert("conversations", {
          userId: sender._id,
          lastMessageAt: now,
          lastMessagePreview: "",
          unreadForUser: false,
          unreadForStaff: false,
        });
      } else {
        if (
          args.conversationId &&
          args.conversationId !== conversation._id
        ) {
          throw new Error("Not authorized");
        }
        conversationId = conversation._id;
      }
    }

    // Rate limit per mittente (60 msg/ora per utente), basato sui messaggi
    // effettivamente inviati dal mittente, non su tutta la conversazione.
    const sentWindow = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();
    const recent = sentWindow.filter(
      (m) =>
        m.senderId === sender._id && m.createdAt >= now - RATE_WINDOW_MS
    );
    if (recent.length >= RATE_MAX) {
      throw new Error("Too many messages");
    }

    const isStaffSender = isInternalRole(sender.role);
    await ctx.db.insert("messages", {
      conversationId,
      senderId: sender._id,
      senderRole: sender.role ?? "client",
      body,
      createdAt: now,
    });

    const preview = body.length > 140 ? body.slice(0, 137) + "…" : body;
    await ctx.db.patch(conversationId, {
      lastMessageAt: now,
      lastMessagePreview: preview,
      unreadForUser: isStaffSender,
      unreadForStaff: !isStaffSender,
    });

    // Notifiche + email.
    if (isStaffSender) {
      await createNotification(ctx, {
        userId: recipientUserId,
        kind: "chat",
        title: "Nuovo messaggio dallo staff",
        body: preview,
        link: "/area-riservata",
      });
      await ctx.scheduler.runAfter(
        0,
        internal.chat.sendChatMessageEmails,
        {
          conversationId,
          to: recipientUserId,
          fromUserId: sender._id,
          preview,
        }
      );
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.chat.sendChatMessageEmails,
        {
          conversationId,
          to: recipientUserId,
          fromUserId: sender._id,
          preview,
        }
      );
    }

    return { conversationId };
  },
});

/** Azione: email di notifica per un nuovo messaggio in chat. */
export const sendChatMessageEmails = internalAction({
  args: {
    conversationId: v.id("conversations"),
    to: v.id("users"),
    fromUserId: v.id("users"),
    preview: v.string(),
  },
  handler: async (ctx, { to, fromUserId, preview }) => {
    const [recipient, sender] = await Promise.all([
      ctx.runQuery(internal.chat.getUserForEmail, { userId: to }),
      ctx.runQuery(internal.chat.getUserForEmail, { userId: fromUserId }),
    ]);
    if (!recipient) {
      return;
    }
    const senderIsInternal = sender && isInternalRole(sender.role);
    if (senderIsInternal) {
      await sendChatMessageToUserEmail({
        to: recipient.email ?? "",
        name: recipient.name ?? "cliente",
        preview,
      });
    } else {
      await sendChatMessageToStaffEmail({
        to: STAFF_EMAIL,
        from: recipient.name ?? recipient.email ?? "utente",
        preview,
      });
    }
  },
});

/** Query interna per leggere un utente in un'azione. */
export const getUserForEmail = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return { email: user.email, name: user.name, role: user.role };
  },
});
