import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// News article schema
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  url: text("url").notNull().unique(),
  date: text("date").notNull(),
  tags: text("tags").array().notNull(),
  image_url: text("image_url"),
  alert: boolean("alert").default(false),
  matched_keywords: text("matched_keywords").array(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  created_at: true,
});

// Keywords for alerts schema
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
  matches: integer("matches").default(0),
  enabled: boolean("enabled").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertKeywordSchema = createInsertSchema(keywords).omit({
  id: true,
  matches: true,
  created_at: true,
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  email_alerts: boolean("email_alerts").default(true),
  email_recipients: text("email_recipients").array(),
  smtp_settings: json("smtp_settings"),
  last_scraped: timestamp("last_scraped"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

// Types export
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Keyword = typeof keywords.$inferSelect;
export type InsertKeyword = z.infer<typeof insertKeywordSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
