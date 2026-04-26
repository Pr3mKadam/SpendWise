import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("savings_goals")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    emoji: v.string(),
    target_amount: v.number(),
    saved_amount: v.number(),
    target_date: v.string(),
    monthly_contribution: v.number(),
    status: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("savings_goals", args);
  },
});

export const updateProgress = mutation({
  args: {
    id: v.id("savings_goals"),
    saved_amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { saved_amount: args.saved_amount });
  },
});
