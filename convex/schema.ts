import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
