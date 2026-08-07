import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { quoteStatusValidator } from "./schema";
import { SERVICE_KEYS } from "./serviceKeys";
import {
  sanitizeEmail,
  sanitizeSingleLine,
  sanitizeText,
  sanitizeServiceInterest,
  EMAIL_RE,
} from "./sanitize";
import {
  sendNewQuoteAdminNotification,
  sendQuoteConfirmationEmail,
  sendQuoteStatusEmail,
  sendQuoteReplyEmail,
} from "./emails";
import { requireUser } from "./users";
import { isInternalRole, rankOf } from "./roles";
import { logAdminAction } from "./admin";

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const MAX_COMPANY = 150;
const MAX_REPLY = 5000;
const MAX_NOTE = 2000;

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 ora
const RATE_MAX = 5;

const QUOTE_PAYLOAD = {
  name: v.string(),
  email: v.string(),
  company: v.optional(v.string()),
  serviceInterest: v.array(v.string()),
  message: v.string(),
  budgetRange: v.optional(v.string()),
};

/**
 * Invio di una richiesta di preventivo (anonima o da client autenticato).
 * Sanitizza ogni campo, applica rate limit per email e pianifica l'invio
 * delle email (azione) senza bloccare la mutation.
 */
export const submitQuote = mutation({
  args: QUOTE_PAYLOAD,
  handler: async (ctx, args) => {
    const name = sanitizeSingleLine(args.name, MAX_NAME);
    const email = sanitizeEmail(args.email, MAX_EMAIL);
    const message = sanitizeText(args.message, MAX_MESSAGE, true);
    const company = args.company
      ? sanitizeSingleLine(args.company, MAX_COMPANY)
      : undefined;
    const budgetRange = args.budgetRange
      ? sanitizeSingleLine(args.budgetRange, 120)
      : undefined;
    const serviceInterest = sanitizeServiceInterest(
      args.serviceInterest,
      SERVICE_KEYS,
      8
    );

    if (!name || !email || !message) {
      throw new Error("Missing required fields");
    }
    if (!EMAIL_RE.test(email)) {
      throw new Error("Invalid email");
    }

    const now = Date.now();

    // Rate limit: max 5 richieste/ora per email (indice email+createdAt,
    // evita di scansionare le richieste di tutti gli altri utenti).
    const recentForEmail = await ctx.db
      .query("quoteRequests")
      .withIndex("by_email_createdAt", (q) =>
        q.eq("email", email).gte("createdAt", now - RATE_WINDOW_MS)
      )
      .collect();
    if (recentForEmail.length >= RATE_MAX) {
      throw new Error("Too many requests");
    }

    const userId = await getAuthUserId(ctx);
    if (userId) {
      const authed = await ctx.db.get(userId);
      if (authed && !!authed.isBanned) {
        throw new Error("Account banned");
      }
    }

    const quoteId = await ctx.db.insert("quoteRequests", {
      userId: userId ?? undefined,
      name,
      email,
      company,
      serviceInterest,
      message,
      budgetRange,
      status: "new",
      source: userId ? "client_area" : "public",
      createdAt: now,
      updatedAt: now,
    });

    // Email in un'azione separata (le mutation non possono fare rete).
    await ctx.scheduler.runAfter(0, internal.quotes.sendQuoteCreatedEmails, {
      quoteId,
    });

    return { quoteId };
  },
});

/** Query interna: legge un preventivo per le azioni email. */
export const getQuoteById = internalQuery({
  args: { quoteId: v.id("quoteRequests") },
  handler: async (ctx, { quoteId }) => {
    const q = await ctx.db.get(quoteId);
    if (!q) {
      return null;
    }
    return {
      name: q.name,
      email: q.email,
      company: q.company,
      serviceInterest: q.serviceInterest,
      message: q.message,
      budgetRange: q.budgetRange,
      status: q.status,
      source: q.source,
      createdAt: q.createdAt,
    };
  },
});

/** Azione: notifica all'admin + conferma al richiedente. */
export const sendQuoteCreatedEmails = internalAction({
  args: { quoteId: v.id("quoteRequests") },
  handler: async (ctx, { quoteId }) => {
    const q = await ctx.runQuery(internal.quotes.getQuoteById, { quoteId });
    if (!q) {
      return;
    }
    await sendNewQuoteAdminNotification(q);
    await sendQuoteConfirmationEmail(q);
  },
});

/** Azione: email al richiedente quando lo stato cambia. */
export const sendQuoteStatusChangedEmail = internalAction({
  args: { quoteId: v.id("quoteRequests") },
  handler: async (ctx, { quoteId }) => {
    const q = await ctx.runQuery(internal.quotes.getQuoteById, { quoteId });
    if (!q) {
      return;
    }
    await sendQuoteStatusEmail({ to: q.email, name: q.name, status: q.status });
  },
});

/** Azione: risposta dell'admin al richiedente. */
export const sendQuoteReplyAction = internalAction({
  args: { quoteId: v.id("quoteRequests"), reply: v.string() },
  handler: async (ctx, { quoteId, reply }) => {
    const q = await ctx.runQuery(internal.quotes.getQuoteById, { quoteId });
    if (!q) {
      return;
    }
    await sendQuoteReplyEmail({ to: q.email, name: q.name, reply });
  },
});

// ---------- Query lato client ----------

/** Preventivi del client autenticato. */
export const getMyQuotes = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("quoteRequests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ---------- Pannello interno (admin/partner/technical) ----------

function assertInternal(user: { role?: string | null }) {
  if (!isInternalRole(user.role)) {
    throw new Error("Not authorized");
  }
}

export const listAllQuotes = query({
  args: {
    status: v.optional(quoteStatusValidator),
  },
  handler: async (ctx, { status }) => {
    const user = await requireUser(ctx);
    assertInternal(user);
    const base = status
      ? ctx.db
          .query("quoteRequests")
          .withIndex("by_status", (q) => q.eq("status", status))
      : ctx.db.query("quoteRequests");
    return await base.order("desc").collect();
  },
});

/** Dettaglio preventivo: accessibile ai ruoli interni o al proprietario. */
export const getQuote = query({
  args: { quoteId: v.id("quoteRequests") },
  handler: async (ctx, { quoteId }) => {
    const user = await requireUser(ctx);
    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      return null;
    }
    if (isInternalRole(user.role)) {
      return quote;
    }
    if (quote.userId === user._id) {
      return quote;
    }
    throw new Error("Not authorized");
  },
});

export const updateQuoteStatus = mutation({
  args: {
    quoteId: v.id("quoteRequests"),
    status: quoteStatusValidator,
    internalNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    assertInternal(user);
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }
    const now = Date.now();
    const note = args.internalNote
      ? sanitizeText(args.internalNote, MAX_NOTE, true)
      : quote.internalNote;
    await ctx.db.patch(args.quoteId, {
      status: args.status,
      internalNote: note,
      firstResponseAt: quote.firstResponseAt ?? now,
      updatedAt: now,
    });
    await logAdminAction(ctx, {
      actor: user._id,
      action: "quote.status",
      details: `${quote._id} -> ${args.status}`,
    });
    await ctx.scheduler.runAfter(
      0,
      internal.quotes.sendQuoteStatusChangedEmail,
      { quoteId: args.quoteId }
    );
  },
});

export const assignQuote = mutation({
  args: {
    quoteId: v.id("quoteRequests"),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (rankOf(user.role) < rankOf("technical")) {
      throw new Error("Not authorized");
    }
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }
    if (args.assignedTo) {
      const assignee = await ctx.db.get(args.assignedTo);
      if (!assignee || !isInternalRole(assignee.role)) {
        throw new Error("Invalid assignee");
      }
    }
    await ctx.db.patch(args.quoteId, {
      assignedTo: args.assignedTo,
      updatedAt: Date.now(),
    });
    await logAdminAction(ctx, {
      actor: user._id,
      action: "quote.assign",
      details: `${quote._id} -> ${args.assignedTo ?? "none"}`,
    });
  },
});

/** Risposta via email al richiedente + nota interna. */
export const replyToQuote = mutation({
  args: {
    quoteId: v.id("quoteRequests"),
    reply: v.string(),
    internalNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    assertInternal(user);
    const reply = sanitizeText(args.reply, MAX_REPLY, true);
    if (!reply) {
      throw new Error("Missing reply");
    }
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }
    const note = args.internalNote
      ? sanitizeText(args.internalNote, MAX_NOTE, true)
      : quote.internalNote;
    const now = Date.now();
    await ctx.db.patch(args.quoteId, {
      internalNote: note,
      firstResponseAt: quote.firstResponseAt ?? now,
      updatedAt: now,
    });
    await logAdminAction(ctx, {
      actor: user._id,
      action: "quote.reply",
      details: quote._id,
    });
    await ctx.scheduler.runAfter(0, internal.quotes.sendQuoteReplyAction, {
      quoteId: args.quoteId,
      reply,
    });
  },
});
