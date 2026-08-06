import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { roleValidator } from "./schema";
import { sanitizeSingleLine } from "./sanitize";

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

/** Helper: ritorna l'utente autenticato o lancia. */
async function requireUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

const INTERNAL_ROLES = ["admin", "partner", "technical"] as const;

function hasInternalRole(user: { role?: string | null }): boolean {
  return INTERNAL_ROLES.includes((user.role ?? "") as never);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
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
 * Promozione a "admin" dell'email amministratore, solo dopo che
 * l'indirizzo è stato verificato via OTP. Sicura perché senza accesso
 * alla casella email la verifica non può avvenire.
 */
export const claimAdminIfEligible = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if ((user.email ?? "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return { claimed: false, reason: "not_admin_email" };
    }
    if (!user.emailVerificationTime) {
      return { claimed: false, reason: "email_not_verified" };
    }
    if (user.role !== "admin") {
      await ctx.db.patch(userId, { role: "admin" });
    }
    return { claimed: true, role: "admin" };
  },
});

// ---------- Gestione utenti (solo admin) ----------

export const listUsers = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Not authorized");
    }
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name ?? "",
      email: u.email ?? "",
      role: u.role ?? "client",
      emailVerified: !!u.emailVerificationTime,
    }));
  },
});

/** Query interna per assegnazione preventivi: solo utenti interni. */
export const listInternalUsers = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!hasInternalRole(user)) {
      throw new Error("Not authorized");
    }
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => INTERNAL_ROLES.includes((u.role ?? "") as never))
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
    if (actor.role !== "admin") {
      throw new Error("Not authorized");
    }
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("User not found");
    }
    // L'admin non può retrocedere sé stesso per evitare lockout.
    if (args.userId === actor._id && args.role !== "admin") {
      throw new Error("Cannot demote yourself");
    }
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export { requireUser, hasInternalRole, INTERNAL_ROLES };
