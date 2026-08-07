import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { roleValidator } from "./schema";
import { sanitizeSingleLine } from "./sanitize";
import {
  ADMIN_EMAIL,
  INTERNAL_ROLES,
  rankOf,
  isInternalRole,
  isProtectedAccount,
  isBanned,
} from "./roles";
import { logAdminAction } from "./admin";

export { ADMIN_EMAIL, INTERNAL_ROLES };

/** Helper: ritorna l'utente autenticato, non bannato, o lancia. */
async function requireUser(ctx: any) {
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
  return user;
}

export const getMyUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    return { user, profile: profile ?? null };
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    country: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const userId = user._id;
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    const now = Date.now();
    const firstName = args.firstName
      ? sanitizeSingleLine(args.firstName, 60)
      : undefined;
    const lastName = args.lastName
      ? sanitizeSingleLine(args.lastName, 60)
      : undefined;
    const data = {
      userId,
      firstName,
      lastName,
      company: args.company
        ? sanitizeSingleLine(args.company, 150)
        : undefined,
      vatNumber: args.vatNumber
        ? sanitizeSingleLine(args.vatNumber, 50)
        : undefined,
      country: args.country
        ? sanitizeSingleLine(args.country, 80)
        : undefined,
      contactPhone: args.contactPhone
        ? sanitizeSingleLine(args.contactPhone, 40)
        : undefined,
      onboardingCompleted: args.onboardingCompleted ?? false,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("profiles", { ...data, createdAt: now });
    }
    // Il nome visualizzato su users resta sempre aggiornato.
    const firstNameV = firstName ?? existing?.firstName;
    const lastNameV = lastName ?? existing?.lastName;
    if (firstNameV || lastNameV) {
      const fullName = [firstNameV, lastNameV]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (fullName && fullName !== user.name) {
        await ctx.db.patch(userId, { name: fullName });
      }
    }
    return existing?._id;
  },
});

/** Aggiorna la foto profilo (storage id). Cancella la precedente. */
export const updateProfileImage = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const userId = user._id;
    // Verifica che lo storage id esista davvero (mai id inventati).
    const url = await ctx.storage.getUrl(args.imageId);
    if (!url) {
      throw new Error("Invalid image");
    }
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing?.profileImageId) {
      await ctx.db.patch(existing._id, {
        profileImageId: args.imageId,
        updatedAt: Date.now(),
      });
      try {
        await ctx.storage.delete(existing.profileImageId);
      } catch {
        // best-effort: l'eliminazione non deve far fallire l'aggiornamento
      }
    } else {
      await ctx.db.insert("profiles", {
        userId,
        profileImageId: args.imageId,
        onboardingCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/** Export completo dei dati personali dell'utente (RGPD). */
export const exportMyData = mutation({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const userId = user._id;
    const [profile, quotes, notifications, conversation, partnerApp] =
      await Promise.all([
        ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first(),
        ctx.db
          .query("quoteRequests")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .order("desc")
          .collect(),
        ctx.db
          .query("notifications")
          .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
          .order("desc")
          .collect(),
        ctx.db
          .query("conversations")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first(),
        ctx.db
          .query("partnerApplications")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .order("desc")
          .first(),
      ]);
    const chatMessages = conversation
      ? await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .order("asc")
          .collect()
      : [];

    const account = {
      _id: user._id,
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "client",
      emailVerified: !!user.emailVerificationTime,
      createdAt: user._creationTime,
    };
    return {
      exportedAt: Date.now(),
      account,
      profile: profile ?? null,
      quotes,
      notifications,
      chatMessages,
      partnerApplication: partnerApp ?? null,
    };
  },
});

/**
 * Promozione a "superadmin" dell'email amministratore, solo dopo che
 * l'indirizzo è stato verificato via OTP. Sicura perché senza accesso
 * alla casella email la verifica non può avvenire. Il superadmin non può
 * mai essere bannato (vincolo difensivo riapplicato a ogni chiamata).
 */
export const claimAdminIfEligible = mutation({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const userId = user._id;
    if ((user.email ?? "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return { claimed: false, reason: "not_admin_email" };
    }
    if (!user.emailVerificationTime) {
      return { claimed: false, reason: "email_not_verified" };
    }
    if (user.role !== "superadmin") {
      await ctx.db.patch(userId, {
        role: "superadmin",
        isBanned: undefined,
        banReason: undefined,
        bannedAt: undefined,
      });
    }
    return { claimed: true, role: "superadmin" };
  },
});

// ---------- Gestione utenti (solo admin/superadmin) ----------

export const listUsers = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (rankOf(user.role) < rankOf("admin")) {
      throw new Error("Not authorized");
    }
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name ?? "",
      email: u.email ?? "",
      role: u.role ?? "client",
      emailVerified: !!u.emailVerificationTime,
      isBanned: !!u.isBanned,
      banReason: u.banReason ?? "",
      createdAt: u._creationTime,
      protected: isProtectedAccount(u.email, u.role),
    }));
  },
});

/** Query interna per assegnazione preventivi: solo utenti interni. */
export const listInternalUsers = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!isInternalRole(user.role)) {
      throw new Error("Not authorized");
    }
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => isInternalRole(u.role) && !isBanned(u))
      .map((u) => ({
        _id: u._id,
        name: u.name ?? "",
        email: u.email ?? "",
        role: u.role ?? "client",
      }));
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const actor = await requireUser(ctx);
    if (rankOf(actor.role) < rankOf("admin")) {
      throw new Error("Not authorized");
    }
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("User not found");
    }
    // Il superadmin radice è immutabile per chiunque.
    if (isProtectedAccount(target.email, target.role)) {
      throw new Error("Cannot modify superadmin");
    }
    // Un admin non può gestire né creare altri admin/superadmin.
    const actorRank = rankOf(actor.role);
    const targetRank = rankOf(target.role);
    const nextRank = rankOf(args.role);
    if (actorRank < rankOf("superadmin")) {
      if (nextRank >= rankOf("admin")) {
        throw new Error("Only superadmin can assign admin roles");
      }
      if (targetRank >= rankOf("admin")) {
        throw new Error("Only superadmin can manage admins");
      }
    }
    await ctx.db.patch(args.userId, { role: args.role });
    await logAdminAction(ctx, {
      actor: actor._id,
      action: "role.update",
      targetUserId: args.userId,
      details: `${target.role ?? "client"} -> ${args.role}`,
    });
  },
});

export { requireUser };
