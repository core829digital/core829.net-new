import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Ruoli utente della piattaforma CORE829:
 * - client: cliente finale, gestisce i propri preventivi
 * - partner: può vedere/gestire i preventivi e collaborare
 * - technical: operatore del reparto tecnico, gestisce stato preventivi
 * - admin: gestione utenti, statistiche, log e ban (non il superadmin)
 * - superadmin: accesso completo e immutabile (contact.core829@gmail.com)
 */
export const roleValidator = v.union(
  v.literal("client"),
  v.literal("partner"),
  v.literal("admin"),
  v.literal("technical"),
  v.literal("superadmin")
);

export const quoteStatusValidator = v.union(
  v.literal("new"),
  v.literal("in_review"),
  v.literal("quoted"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("completed")
);

export default defineSchema({
  // Auth tables di @convex-dev/auth; la tabella "users" viene estesa
  // con il campo `role` (pattern ufficiale: inline + override).
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(roleValidator),
    isBanned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    bannedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // Dati di profilo del client area (onboarding, azienda, contatti).
  profiles: defineTable({
    userId: v.id("users"),
    company: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    country: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Preventivi richiesti tramite la pagina /preventivo o il client area.
  quoteRequests: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    serviceInterest: v.array(v.string()),
    message: v.string(),
    budgetRange: v.optional(v.string()),
    status: quoteStatusValidator,
    assignedTo: v.optional(v.id("users")),
    internalNote: v.optional(v.string()),
    firstResponseAt: v.optional(v.number()),
    source: v.union(v.literal("public"), v.literal("client_area")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Log delle azioni amministrative (ruoli, ban, stati preventivi).
  adminLogs: defineTable({
    actor: v.id("users"),
    action: v.string(),
    targetUserId: v.optional(v.id("users")),
    details: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  // Tabella legacy del vecchio form di contatto (dati esistenti preservati).
  contactRequests: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    serviceInterest: v.array(v.string()),
    message: v.string(),
    budgetRange: v.optional(v.string()),
    createdAt: v.number(),
    status: v.union(v.literal("new"), v.literal("done")),
  }).index("by_createdAt", ["createdAt"]),
});
