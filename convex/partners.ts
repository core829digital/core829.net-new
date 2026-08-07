import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalQuery, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { sanitizeText } from "./sanitize";
import { requireUser } from "./users";
import { rankOf, isInternalRole, isProtectedAccount } from "./roles";
import { logAdminAction } from "./admin";
import { createNotification } from "./notifications";
import {
  sendPartnerApplicationReceivedEmail,
  sendPartnerApplicationAdminEmail,
  sendPartnerDecisionEmail,
} from "./emails";

const MAX_MESSAGE = 3000;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 ore
const RATE_MAX = 3;

const PARTNERS_EMAIL = "partnerships@core829.net";
const STAFF_EMAIL = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

/**
 * Candidatura partner.
 *
 * Flusso: un utente autenticato (client) invia una candidatura con un
 * messaggio motivazionale. L'admin la approva o la rifiuta dal pannello.
 * All'approvazione il ruolo dell'utente diventa "partner". Data isolation:
 * un utente legge/vede solo la propria candidatura; lo staff le vede tutte.
 */

/** Invia (o aggiorna) la candidatura partner dell'utente autenticato. */
export const applyAsPartner = mutation({
  args: { message: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const message = sanitizeText(args.message, MAX_MESSAGE, true);
    if (!message) {
      throw new Error("Message is empty");
    }

    // Staff interno (partner/technical/admin/superadmin): non può candidarsi,
    // impedisce anche che un admin venga retrocesso a "partner" all'approvazione.
    if (isInternalRole(user.role)) {
      throw new Error("Already a team member");
    }

    const now = Date.now();

    // Rate limit: max 3 candidature/24h.
    const existing = await ctx.db
      .query("partnerApplications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const recent = existing.filter(
      (a) => a.createdAt >= now - RATE_WINDOW_MS
    );
    if (recent.length >= RATE_MAX) {
      throw new Error("Too many applications");
    }

    // Se c'è già una candidatura pending, la aggiorniamo (nuovo messaggio).
    const pending = existing.find((a) => a.status === "pending");
    let applicationId: Id<"partnerApplications">;
    if (pending) {
      await ctx.db.patch(pending._id, { message, createdAt: now });
      applicationId = pending._id;
    } else {
      applicationId = await ctx.db.insert("partnerApplications", {
        userId: user._id,
        status: "pending",
        message,
        createdAt: now,
      });
    }

    // Email (best-effort, in un'azione).
    await ctx.scheduler.runAfter(0, internal.partners.sendApplicationEmails, {
      applicationId,
    });

    return { applicationId };
  },
});

/** Azione: conferma al richiedente + notifica all'admin. */
export const sendApplicationEmails = internalAction({
  args: { applicationId: v.id("partnerApplications") },
  handler: async (ctx, { applicationId }) => {
    const app = await ctx.runQuery(
      internal.partners.getApplicationForEmail,
      { applicationId }
    );
    if (!app) {
      return;
    }
    await sendPartnerApplicationReceivedEmail({
      to: app.email,
      name: app.name,
    });
    await sendPartnerApplicationAdminEmail({
      to: PARTNERS_EMAIL,
      fromName: app.name,
      fromEmail: app.email,
      message: app.message,
    });
  },
});

/** Query interna per le azioni email. */
export const getApplicationForEmail = internalQuery({
  args: { applicationId: v.id("partnerApplications") },
  handler: async (ctx, { applicationId }) => {
    const app = await ctx.db.get(applicationId);
    if (!app) {
      return null;
    }
    const user = await ctx.db.get(app.userId);
    return {
      email: user?.email ?? "",
      name: user?.name ?? "",
      message: app.message ?? "",
    };
  },
});

/** La mia candidatura (utente autenticato). */
export const getMyPartnerApplication = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db
      .query("partnerApplications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

/** Tutte le candidature (staff interno). */
export const listPartnerApplications = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    const user = await requireUser(ctx);
    if (!isInternalRole(user.role)) {
      throw new Error("Not authorized");
    }
    const apps = await ctx.db
      .query("partnerApplications")
      .order("desc")
      .collect();
    const filtered = status
      ? apps.filter((a) => a.status === status)
      : apps;
    return Promise.all(
      filtered.map(async (app) => {
        const applicant = await ctx.db.get(app.userId);
        return {
          _id: app._id,
          userId: app.userId,
          userEmail: applicant?.email ?? "",
          userName: applicant?.name ?? "",
          message: app.message ?? "",
          status: app.status,
          createdAt: app.createdAt,
          decidedAt: app.decidedAt,
        };
      })
    );
  },
});

/** Approva o rifiuta una candidatura (admin/superadmin). */
export const decidePartnerApplication = mutation({
  args: {
    applicationId: v.id("partnerApplications"),
    approve: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actor = await requireUser(ctx);
    if (rankOf(actor.role) < rankOf("admin")) {
      throw new Error("Not authorized");
    }
    const app = await ctx.db.get(args.applicationId);
    if (!app) {
      throw new Error("Application not found");
    }
    if (app.status !== "pending") {
      throw new Error("Application already decided");
    }
    const now = Date.now();

    await ctx.db.patch(args.applicationId, {
      status: args.approve ? "approved" : "rejected",
      decidedAt: now,
      decidedBy: actor._id,
    });

    if (args.approve) {
      const applicant = await ctx.db.get(app.userId);
      if (applicant && !applicant.isBanned && !isProtectedAccount(applicant.email, applicant.role)) {
        await ctx.db.patch(app.userId, { role: "partner" });
      }
    }

    await createNotification(ctx, {
      userId: app.userId,
      kind: "partner",
      title: args.approve
        ? "Candidatura partner approvata"
        : "Candidatura partner non accolta",
      body: args.approve
        ? "Benvenuto nel programma partner CORE829!"
        : "La tua candidatura non è stata accolta in questo momento.",
      link: "/area-riservata",
    });

    await logAdminAction(ctx, {
      actor: actor._id,
      action: args.approve ? "partner.approve" : "partner.reject",
      targetUserId: app.userId,
      details: args.applicationId,
    });

    await ctx.scheduler.runAfter(0, internal.partners.sendDecisionEmail, {
      applicationId: args.applicationId,
      approved: args.approve,
    });
  },
});

/** Azione: email di esito della candidatura. */
export const sendDecisionEmail = internalAction({
  args: {
    applicationId: v.id("partnerApplications"),
    approved: v.boolean(),
  },
  handler: async (ctx, { applicationId, approved }) => {
    const app = await ctx.runQuery(
      internal.partners.getApplicationForEmail,
      { applicationId }
    );
    if (!app) {
      return;
    }
    await sendPartnerDecisionEmail({
      to: app.email,
      name: app.name,
      approved,
    });
  },
});

export { STAFF_EMAIL };
