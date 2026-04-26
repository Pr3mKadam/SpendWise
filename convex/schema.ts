import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(), // Maps to auth.users.id
    initial_balance: v.number(),
    balance_anchor_net: v.number(),
    currency: v.string(),
    onboarding_complete: v.boolean(),
    budget_limits: v.any(), // JSONB equivalent
    parental_settings: v.optional(v.any()), // JSONB equivalent
  }).index("by_userId", ["userId"]),

  transactions: defineTable({
    userId: v.string(),
    date: v.string(),
    amount: v.number(),
    category: v.string(),
    merchant: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
    confidence: v.optional(v.number()),
    ai_parsed: v.boolean(),
    status: v.string(), // 'completed' | 'pending_approval'
    tags: v.array(v.string()),
  }).index("by_userId", ["userId"]),

  savings_goals: defineTable({
    userId: v.string(),
    name: v.string(),
    emoji: v.string(),
    target_amount: v.number(),
    saved_amount: v.number(),
    target_date: v.string(),
    monthly_contribution: v.number(),
    status: v.string(),
    color: v.string(),
  }).index("by_userId", ["userId"]),

  parent_child_links: defineTable({
    parent_user_id: v.string(),
    child_user_id: v.optional(v.string()),
    invite_code: v.string(),
    status: v.string(), // 'pending' | 'active' | 'revoked'
    accepted_at: v.optional(v.number()), // timestamptz -> ms timestamp
  })
    .index("by_parent", ["parent_user_id"])
    .index("by_child", ["child_user_id"])
    .index("by_invite_code", ["invite_code"]),
});
