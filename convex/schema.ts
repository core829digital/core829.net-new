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

  // Dati di profilo del client area (anagrafica, azienda, contatti, foto).
  profiles: defineTable({
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    country: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    profileImageId: v.optional(v.id("_storage")),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Preventivi richiesti dal form pubblico o dal client area.
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
    // Valutazione monetaria comunicata dall'admin/staff al cliente.
    quotedAmount: v.optional(v.number()),
    quotedCurrency: v.optional(v.string()),
    source: v.union(v.literal("public"), v.literal("client_area")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_email_createdAt", ["email", "createdAt"])
    .index("by_assignedTo", ["assignedTo"]),

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

  // Candidature per diventare partner (approvazione manuale admin/superadmin).
  partnerApplications: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    message: v.optional(v.string()),
    createdAt: v.number(),
    decidedAt: v.optional(v.number()),
    decidedBy: v.optional(v.id("users")),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Una conversazione per utente con lo staff (client/partner/technical/...).
  conversations: defineTable({
    userId: v.id("users"),
    lastMessageAt: v.number(),
    lastMessagePreview: v.string(),
    unreadForUser: v.boolean(),
    unreadForStaff: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    senderRole: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_conversationId", ["conversationId"]),

  // Notifiche in-app (chat, cambi stato preventivo, esiti candidatura, bulk).
  notifications: defineTable({
    userId: v.id("users"),
    kind: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_userId_read", ["userId", "read"]),

  // Post del blog aziendale, scritti in Markdown dallo staff (admin+).
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    bodyMarkdown: v.string(),
    authorId: v.id("users"),
    status: v.union(v.literal("draft"), v.literal("published")),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status_publishedAt", ["status", "publishedAt"]),

  // Pageview aggregate per l'analytics admin: geo-paese/città (header Vercel)
  // e `visitorKey` = hash SHA-256 IP+salt (pseudonimizzazione). L'indirizzo IP
  // grezzo NON viene mai salvato: solo un digest non reversibile, così il
  // conteggio dei visitatori unici resta possibile senza conservare PII.
  pageViews: defineTable({
    path: v.string(),
    locale: v.string(),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    visitorKey: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    isAuthenticated: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_path_createdAt", ["path", "createdAt"]),
});
