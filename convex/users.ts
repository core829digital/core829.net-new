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
    const data = {
      userId,
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
      return existing._id;
    }
    return await ctx.db.insert("profiles", { ...data, createdAt: now });
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
