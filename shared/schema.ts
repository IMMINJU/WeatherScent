import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const perfumes = pgTable("perfumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  notes: jsonb("notes").notNull(),
  description: text("description"),
  image: text("image"),
  rating: integer("rating").default(0),
  views: integer("views").default(0),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  perfumeId: integer("perfume_id"),
  weatherCondition: text("weather_condition"),
  temperature: integer("temperature"),
  reason: text("reason"),
  moodText: text("mood_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  perfumeId: integer("perfume_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  message: text("message").notNull(),
  response: text("response"),
  isUser: boolean("is_user").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const preferenceTests = pgTable("preference_tests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  answers: jsonb("answers").notNull(),
  results: jsonb("results"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPerfumeSchema = createInsertSchema(perfumes).omit({
  id: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlist).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPreferenceTestSchema = createInsertSchema(preferenceTests).omit({
  id: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Perfume = typeof perfumes.$inferSelect;
export type InsertPerfume = z.infer<typeof insertPerfumeSchema>;

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type PreferenceTest = typeof preferenceTests.$inferSelect;
export type InsertPreferenceTest = z.infer<typeof insertPreferenceTestSchema>;

// Weather data schema
export const weatherDataSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  location: z.string(),
});

export type WeatherData = z.infer<typeof weatherDataSchema>;

// User preferences schema
export const userPreferencesSchema = z.object({
  favoriteCategories: z.array(z.string()),
  intensity: z.enum(["light", "medium", "strong"]),
  occasion: z.array(z.string()),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
