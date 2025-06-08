import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  passwordHash: varchar("password_hash"), // For JWT auth users
  profileImageUrl: varchar("profile_image_url"),
  xp: integer("xp").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Refresh tokens table for JWT authentication
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_refresh_tokens_user_id").on(table.userId),
  index("IDX_refresh_tokens_token").on(table.token),
]);

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  examPercentage: integer("exam_percentage").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'lab', 'scenario', 'challenge'
  domainId: integer("domain_id").notNull(),
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  xpReward: integer("xp_reward").notNull(),
  content: jsonb("content").notNull(), // scenario content and questions
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar for Replit auth
  domainId: integer("domain_id").notNull(),
  progress: integer("progress").default(0).notNull(), // percentage 0-100
  questionsCompleted: integer("questions_completed").default(0).notNull(),
  questionsCorrect: integer("questions_correct").default(0).notNull(),
  timeSpent: integer("time_spent").default(0).notNull(), // in minutes
});

export const userScenarios = pgTable("user_scenarios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar for Replit auth
  scenarioId: integer("scenario_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  score: integer("score"), // percentage 0-100
  attempts: integer("attempts").default(0).notNull(),
  timeSpent: integer("time_spent").default(0).notNull(),
  completedAt: timestamp("completed_at"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull(),
  criteria: jsonb("criteria").notNull(), // conditions for earning the achievement
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar for Replit auth
  achievementId: integer("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);

export type UpsertUser = typeof users.$inferInsert;

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertUserScenarioSchema = createInsertSchema(userScenarios).omit({
  id: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Domain = typeof domains.$inferSelect;
export type Scenario = typeof scenarios.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserScenario = typeof userScenarios.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
