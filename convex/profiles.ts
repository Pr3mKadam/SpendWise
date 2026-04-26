import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const update = mutation({
  args: {
    id: v.id("profiles"),
    initial_balance: v.optional(v.number()),
    balance_anchor_net: v.optional(v.number()),
    currency: v.optional(v.string()),
    onboarding_complete: v.optional(v.boolean()),
    budget_limits: v.optional(v.any()),
    parental_settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    initial_balance: v.number(),
    balance_anchor_net: v.number(),
    currency: v.string(),
    onboarding_complete: v.boolean(),
    budget_limits: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profiles", args);
  },
});
