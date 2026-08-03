import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { sendContactEmail } from "./emails";

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 ora
const RATE_MAX = 5;
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const MAX_COMPANY = 150;
const MAX_INTERESTS = 8;
const MAX_INTEREST_LEN = 80;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Salva la richiesta di contatto nel database Convex e invia la notifica
 * via Resend (best-effort: fallisce in silenzio se Resend non è configurato).
 * Rate-limited per email e con `createdAt` impostato lato server.
 */
export const submitContactRequest = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    serviceInterest: v.array(v.string()),
    message: v.string(),
    budgetRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim();
    const message = args.message.trim();
    const company = (args.company ?? "").trim();

    if (!name || !email || !message) {
      throw new Error("Missing required fields");
    }
    if (!EMAIL_RE.test(email)) {
      throw new Error("Invalid email");
    }
    if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
      throw new Error("Field exceeds maximum length");
    }
    if (company.length > MAX_COMPANY) {
      throw new Error("Company exceeds maximum length");
    }
    if (
      !Array.isArray(args.serviceInterest) ||
      args.serviceInterest.length > MAX_INTERESTS ||
      args.serviceInterest.some(
        (s) => typeof s !== "string" || s.length > MAX_INTEREST_LEN
      )
    ) {
      throw new Error("Invalid serviceInterest");
    }

    const now = Date.now();

    // Rate limit: max 5 richieste/ora per email.
    const recent = await ctx.db
      .query("contactRequests")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", now - RATE_WINDOW_MS))
      .collect();
    const sameEmailCount = recent.filter((r) => r.email === email).length;
    if (sameEmailCount >= RATE_MAX) {
      throw new Error("Too many requests");
    }

    await ctx.db.insert("contactRequests", {
      name,
      email,
      company: company || undefined,
      serviceInterest: args.serviceInterest,
      message,
      budgetRange: args.budgetRange,
      createdAt: now,
      status: "new",
    });

    await sendContactEmail({
      name,
      email,
      company: company || undefined,
      serviceInterest: args.serviceInterest,
      message,
      budgetRange: args.budgetRange,
    });
  },
});
