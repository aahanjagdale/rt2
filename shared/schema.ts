import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(), // Changed to text for MongoDB compatibility
  title: text("title").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  assignedTo: text("assigned_to").notNull(), // 'partner1' or 'partner2'
});

export const truths = pgTable("truths", {
  id: text("id").primaryKey(), // Changed to text for MongoDB compatibility
  question: text("question").notNull(),
  intensity: integer("intensity").notNull(), // 1-5 scale
  cost: integer("cost").notNull().default(5),
  createdBy: text("created_by").notNull(), // 'partner1' or 'partner2'
});

export const dares = pgTable("dares", {
  id: text("id").primaryKey(), // Changed to text for MongoDB compatibility
  challenge: text("challenge").notNull(),
  intensity: integer("intensity").notNull(), // 1-5 scale
  cost: integer("cost").notNull().default(10),
  createdBy: text("created_by").notNull(), // 'partner1' or 'partner2'
});

export const points = pgTable("points", {
  id: text("id").primaryKey(), // Changed to text for MongoDB compatibility
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  partner: text("partner").notNull(), // 'partner1' or 'partner2'
  createdAt: timestamp("created_at").defaultNow(),
});

export const bucketlist = pgTable("bucketlist", {
  id: text("id").primaryKey(), // Changed to text for MongoDB compatibility
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdBy: text("created_by").notNull(), // 'partner1' or 'partner2'
  createdAt: timestamp("created_at").defaultNow(),
});

// New schema for Love Coupons
export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  redeemed: boolean("redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  createdBy: text("created_by").notNull(), // 'partner1' or 'partner2'
  createdAt: timestamp("created_at").defaultNow(),
});

// New schema for "Why I Find You Hot" entries
export const attractions = pgTable("attractions", {
  id: text("id").primaryKey(),
  detail: text("detail").notNull(),
  type: text("type").notNull(), // 'physical', 'personality', 'quirk', etc.
  createdBy: text("created_by").notNull(), // 'partner1' or 'partner2'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, completedAt: true });
export const insertTruthSchema = createInsertSchema(truths).omit({ id: true });
export const insertDareSchema = createInsertSchema(dares).omit({ id: true });
export const insertPointSchema = createInsertSchema(points).omit({ id: true, createdAt: true });
export const insertBucketlistSchema = createInsertSchema(bucketlist).omit({ id: true, completedAt: true, createdAt: true });
export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, redeemedAt: true, createdAt: true });
export const insertAttractionSchema = createInsertSchema(attractions).omit({ id: true, createdAt: true });

export type Task = typeof tasks.$inferSelect;
export type Truth = typeof truths.$inferSelect;
export type Dare = typeof dares.$inferSelect;
export type Point = typeof points.$inferSelect;
export type Bucketlist = typeof bucketlist.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Attraction = typeof attractions.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTruth = z.infer<typeof insertTruthSchema>;
export type InsertDare = z.infer<typeof insertDareSchema>;
export type InsertPoint = z.infer<typeof insertPointSchema>;
export type InsertBucketlist = z.infer<typeof insertBucketlistSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;