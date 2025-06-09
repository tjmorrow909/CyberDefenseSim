import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import {
  users,
  domains,
  scenarios,
  userProgress,
  userScenarios,
  achievements,
  userAchievements,
  refreshTokens,
  type User,
  type UpsertUser,
  type Domain,
  type Scenario,
  type UserProgress,
  type UserScenario,
  type Achievement,
  type UserAchievement,
  type RefreshToken,
} from '@shared/schema';
import { IStorage } from './storage';
import { logger } from './logger';

// Helper function to safely extract error message
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export class DatabaseStorage implements IStorage {
  constructor() {
    if (!db) {
      throw new Error('Database not available');
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    if (!db) throw new Error('Database not available');

    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      logger.error('Error getting user', { error: error instanceof Error ? error.message : String(error), userId: id });
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      return result[0];
    } catch (error) {
      logger.error('Error getting user by email', { error: error.message, email });
      throw error;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const userToInsert = {
        id: userData.id,
        email: userData.email?.toLowerCase() || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        passwordHash: userData.passwordHash || null,
        profileImageUrl: userData.profileImageUrl || null,
        xp: userData.xp || 0,
        streak: userData.streak || 0,
        lastActivity: userData.lastActivity || new Date(),
        createdAt: userData.createdAt || new Date(),
        updatedAt: new Date(),
      };

      const result = await db
        .insert(users)
        .values(userToInsert)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: userToInsert.email,
            firstName: userToInsert.firstName,
            lastName: userToInsert.lastName,
            passwordHash: userToInsert.passwordHash,
            profileImageUrl: userToInsert.profileImageUrl,
            xp: userToInsert.xp,
            streak: userToInsert.streak,
            lastActivity: userToInsert.lastActivity,
            updatedAt: userToInsert.updatedAt,
          },
        })
        .returning();

      return result[0];
    } catch (error) {
      logger.error('Error upserting user', { error: error.message, userData });
      throw error;
    }
  }

  async updateUserXP(userId: string, xp: number): Promise<void> {
    try {
      await db.update(users).set({ xp, updatedAt: new Date() }).where(eq(users.id, userId));
    } catch (error) {
      logger.error('Error updating user XP', { error: error.message, userId, xp });
      throw error;
    }
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    try {
      await db.update(users).set({ streak, updatedAt: new Date() }).where(eq(users.id, userId));
    } catch (error) {
      logger.error('Error updating user streak', { error: error.message, userId, streak });
      throw error;
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    try {
      await db.update(users).set({ lastActivity: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
    } catch (error) {
      logger.error('Error updating user activity', { error: error.message, userId });
      throw error;
    }
  }

  // Refresh token operations
  async storeRefreshToken(userId: string, token: string): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await db.insert(refreshTokens).values({
        userId,
        token,
        expiresAt,
      });
    } catch (error) {
      logger.error('Error storing refresh token', { error: error.message, userId });
      throw error;
    }
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    try {
      const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1);
      return result[0];
    } catch (error) {
      logger.error('Error getting refresh token', { error: error.message });
      throw error;
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    try {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    } catch (error) {
      logger.error('Error deleting refresh token', { error: error.message });
      throw error;
    }
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    try {
      await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    } catch (error) {
      logger.error('Error deleting user refresh tokens', { error: error.message, userId });
      throw error;
    }
  }

  // Domain operations
  async getAllDomains(): Promise<Domain[]> {
    try {
      return await db.select().from(domains).orderBy(domains.id);
    } catch (error) {
      logger.error('Error getting all domains', { error: error.message });
      throw error;
    }
  }

  async getDomain(id: number): Promise<Domain | undefined> {
    try {
      const result = await db.select().from(domains).where(eq(domains.id, id)).limit(1);
      return result[0];
    } catch (error) {
      logger.error('Error getting domain', { error: error.message, domainId: id });
      throw error;
    }
  }

  // Scenario operations
  async getAllScenarios(): Promise<Scenario[]> {
    try {
      return await db.select().from(scenarios).orderBy(scenarios.id);
    } catch (error) {
      logger.error('Error getting all scenarios', { error: error.message });
      throw error;
    }
  }

  async getScenariosByDomain(domainId: number): Promise<Scenario[]> {
    try {
      return await db.select().from(scenarios).where(eq(scenarios.domainId, domainId)).orderBy(scenarios.id);
    } catch (error) {
      logger.error('Error getting scenarios by domain', { error: error.message, domainId });
      throw error;
    }
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    try {
      const result = await db.select().from(scenarios).where(eq(scenarios.id, id)).limit(1);
      return result[0];
    } catch (error) {
      logger.error('Error getting scenario', { error: error.message, scenarioId: id });
      throw error;
    }
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    } catch (error) {
      logger.error('Error getting user progress', { error: error.message, userId });
      throw error;
    }
  }

  async getUserProgressByDomain(userId: string, domainId: number): Promise<UserProgress | undefined> {
    try {
      const result = await db
        .select()
        .from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.domainId, domainId)))
        .limit(1);
      return result[0];
    } catch (error) {
      logger.error('Error getting user progress by domain', { error: error.message, userId, domainId });
      throw error;
    }
  }

  async updateUserProgress(userId: string, domainId: number, progress: Partial<UserProgress>): Promise<void> {
    try {
      const existing = await this.getUserProgressByDomain(userId, domainId);

      if (existing) {
        await db
          .update(userProgress)
          .set(progress)
          .where(and(eq(userProgress.userId, userId), eq(userProgress.domainId, domainId)));
      } else {
        await db.insert(userProgress).values({
          userId,
          domainId,
          progress: progress.progress || 0,
          questionsCompleted: progress.questionsCompleted || 0,
          questionsCorrect: progress.questionsCorrect || 0,
          timeSpent: progress.timeSpent || 0,
        });
      }
    } catch (error) {
      logger.error('Error updating user progress', { error: error.message, userId, domainId, progress });
      throw error;
    }
  }

  // User scenario operations
  async getUserScenarios(userId: string): Promise<UserScenario[]> {
    try {
      return await db.select().from(userScenarios).where(eq(userScenarios.userId, userId));
    } catch (error) {
      logger.error('Error getting user scenarios', { error: error.message, userId });
      throw error;
    }
  }

  async getUserScenario(userId: string, scenarioId: number): Promise<UserScenario | undefined> {
    try {
      const result = await db
        .select()
        .from(userScenarios)
        .where(and(eq(userScenarios.userId, userId), eq(userScenarios.scenarioId, scenarioId)))
        .limit(1);
      return result[0];
    } catch (error) {
      logger.error('Error getting user scenario', { error: error.message, userId, scenarioId });
      throw error;
    }
  }

  async updateUserScenario(userId: string, scenarioId: number, data: Partial<UserScenario>): Promise<void> {
    try {
      const existing = await this.getUserScenario(userId, scenarioId);

      if (existing) {
        await db
          .update(userScenarios)
          .set(data)
          .where(and(eq(userScenarios.userId, userId), eq(userScenarios.scenarioId, scenarioId)));
      } else {
        await db.insert(userScenarios).values({
          userId,
          scenarioId,
          completed: data.completed || false,
          score: data.score || null,
          attempts: data.attempts || 0,
          timeSpent: data.timeSpent || 0,
          completedAt: data.completedAt || null,
        });
      }
    } catch (error) {
      logger.error('Error updating user scenario', { error: error.message, userId, scenarioId, data });
      throw error;
    }
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      return await db.select().from(achievements).orderBy(achievements.id);
    } catch (error) {
      logger.error('Error getting all achievements', { error: error.message });
      throw error;
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      return await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.earnedAt));
    } catch (error) {
      logger.error('Error getting user achievements', { error: error.message, userId });
      throw error;
    }
  }

  async awardAchievement(userId: string, achievementId: number): Promise<void> {
    try {
      // Check if user already has this achievement
      const existing = await db
        .select()
        .from(userAchievements)
        .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(userAchievements).values({
          userId,
          achievementId,
          earnedAt: new Date(),
        });

        // Award XP for achievement
        const achievement = await db.select().from(achievements).where(eq(achievements.id, achievementId)).limit(1);
        if (achievement[0]) {
          const user = await this.getUser(userId);
          if (user) {
            await this.updateUserXP(userId, user.xp + achievement[0].xpReward);
          }
        }
      }
    } catch (error) {
      logger.error('Error awarding achievement', { error: error.message, userId, achievementId });
      throw error;
    }
  }
}
