import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementService } from './achievement-service';
import { IStorage } from './storage';

// Mock storage implementation for testing
class MockStorage implements IStorage {
  private users = new Map();
  private achievements = new Map();
  private userAchievements = new Map();
  private userProgress = new Map();
  private userScenarios = new Map();
  private scenarios = new Map();

  constructor() {
    // Setup test data
    this.achievements.set(1, {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first scenario',
      icon: 'Trophy',
      xpReward: 50,
      criteria: { scenariosCompleted: 1 },
    });

    this.achievements.set(2, {
      id: 2,
      name: 'Perfect Score',
      description: 'Score 100% on any scenario',
      icon: 'Target',
      xpReward: 150,
      criteria: { perfectScore: true },
    });

    this.scenarios.set(1, {
      id: 1,
      title: 'Test Scenario',
      domainId: 1,
      type: 'lab',
    });
  }

  async getUser(id: string) {
    return this.users.get(id);
  }

  async getUserByEmail(email: string) {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async upsertUser(user: any) {
    this.users.set(user.id, user);
    return user;
  }

  async updateUserXP(userId: string, xp: number) {
    const user = this.users.get(userId);
    if (user) {
      user.xp = xp;
    }
  }

  async updateUserStreak(userId: string, streak: number) {
    const user = this.users.get(userId);
    if (user) {
      user.streak = streak;
    }
  }

  async updateUserActivity(userId: string) {
    const user = this.users.get(userId);
    if (user) {
      user.lastActivity = new Date();
    }
  }

  async getAllAchievements() {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: string) {
    return Array.from(this.userAchievements.values()).filter(ua => ua.userId === userId);
  }

  async awardAchievement(userId: string, achievementId: number) {
    const key = `${userId}-${achievementId}`;
    this.userAchievements.set(key, {
      id: Date.now(),
      userId,
      achievementId,
      earnedAt: new Date(),
    });
  }

  async getUserProgress(userId: string) {
    return Array.from(this.userProgress.values()).filter(p => p.userId === userId);
  }

  async getUserProgressByDomain(userId: string, domainId: number) {
    const key = `${userId}-${domainId}`;
    return this.userProgress.get(key);
  }

  async updateUserProgress(userId: string, domainId: number, progress: any) {
    const key = `${userId}-${domainId}`;
    this.userProgress.set(key, { userId, domainId, ...progress });
  }

  async getUserScenarios(userId: string) {
    return Array.from(this.userScenarios.values()).filter(s => s.userId === userId);
  }

  async getUserScenario(userId: string, scenarioId: number) {
    const key = `${userId}-${scenarioId}`;
    return this.userScenarios.get(key);
  }

  async updateUserScenario(userId: string, scenarioId: number, data: any) {
    const key = `${userId}-${scenarioId}`;
    this.userScenarios.set(key, { userId, scenarioId, ...data });
  }

  async getAllScenarios() {
    return Array.from(this.scenarios.values());
  }

  async getScenariosByDomain(domainId: number) {
    return Array.from(this.scenarios.values()).filter(s => s.domainId === domainId);
  }

  // Stub implementations for other required methods
  async getAllDomains() {
    return [];
  }
  async getDomain(id: number) {
    return undefined;
  }
  async getScenario(id: number) {
    return this.scenarios.get(id);
  }
  async storeRefreshToken(userId: string, token: string) {}
  async getRefreshToken(token: string) {
    return undefined;
  }
  async deleteRefreshToken(token: string) {}
  async deleteUserRefreshTokens(userId: string) {}
}

describe('AchievementService', () => {
  let achievementService: AchievementService;
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    achievementService = new AchievementService(mockStorage);
  });

  describe('checkAndAwardAchievements', () => {
    it('should award first scenario completion achievement', async () => {
      const userId = 'test-user-1';

      // Setup user with one completed scenario
      await mockStorage.upsertUser({ id: userId, xp: 0, streak: 0 });
      await mockStorage.updateUserScenario(userId, 1, { completed: true });

      const awardedAchievements = await achievementService.checkAndAwardAchievements(userId, {
        scenarioCompleted: true,
        scenarioId: 1,
      });

      expect(awardedAchievements).toContain(1); // First Steps achievement

      const userAchievements = await mockStorage.getUserAchievements(userId);
      expect(userAchievements).toHaveLength(1);
      expect(userAchievements[0].achievementId).toBe(1);
    });

    it('should award perfect score achievement', async () => {
      const userId = 'test-user-2';

      await mockStorage.upsertUser({ id: userId, xp: 0, streak: 0 });

      const awardedAchievements = await achievementService.checkAndAwardAchievements(userId, {
        scenarioCompleted: true,
        scenarioId: 1,
        score: 100,
      });

      expect(awardedAchievements).toContain(2); // Perfect Score achievement
    });

    it('should not award achievement twice', async () => {
      const userId = 'test-user-3';

      await mockStorage.upsertUser({ id: userId, xp: 0, streak: 0 });
      await mockStorage.updateUserScenario(userId, 1, { completed: true });

      // Award achievement first time
      const firstAward = await achievementService.checkAndAwardAchievements(userId, {
        scenarioCompleted: true,
        scenarioId: 1,
      });

      // Try to award again
      const secondAward = await achievementService.checkAndAwardAchievements(userId, {
        scenarioCompleted: true,
        scenarioId: 1,
      });

      expect(firstAward).toContain(1);
      expect(secondAward).not.toContain(1);

      const userAchievements = await mockStorage.getUserAchievements(userId);
      expect(userAchievements).toHaveLength(1);
    });
  });

  describe('updateUserStreak', () => {
    it('should initialize streak for new user', async () => {
      const userId = 'test-user-4';

      await mockStorage.upsertUser({
        id: userId,
        xp: 0,
        streak: 0,
        lastActivity: null,
      });

      await achievementService.updateUserStreak(userId);

      const user = await mockStorage.getUser(userId);
      expect(user.streak).toBe(1);
    });

    it('should increment streak for consecutive day', async () => {
      const userId = 'test-user-5';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await mockStorage.upsertUser({
        id: userId,
        xp: 0,
        streak: 5,
        lastActivity: yesterday,
      });

      await achievementService.updateUserStreak(userId);

      const user = await mockStorage.getUser(userId);
      expect(user.streak).toBe(6);
    });

    it('should reset streak for broken streak', async () => {
      const userId = 'test-user-6';
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      await mockStorage.upsertUser({
        id: userId,
        xp: 0,
        streak: 10,
        lastActivity: threeDaysAgo,
      });

      await achievementService.updateUserStreak(userId);

      const user = await mockStorage.getUser(userId);
      expect(user.streak).toBe(1);
    });
  });

  describe('calculateDomainProgress', () => {
    it('should calculate correct progress percentage', async () => {
      const userId = 'test-user-7';
      const domainId = 1;

      // Setup 3 scenarios in domain
      mockStorage.scenarios.set(1, { id: 1, domainId: 1 });
      mockStorage.scenarios.set(2, { id: 2, domainId: 1 });
      mockStorage.scenarios.set(3, { id: 3, domainId: 1 });

      // Complete 2 out of 3 scenarios
      await mockStorage.updateUserScenario(userId, 1, { completed: true });
      await mockStorage.updateUserScenario(userId, 2, { completed: true });
      await mockStorage.updateUserScenario(userId, 3, { completed: false });

      const progress = await achievementService.calculateDomainProgress(userId, domainId);

      expect(progress).toBe(67); // 2/3 * 100 = 66.67, rounded to 67
    });

    it('should return 0 for domain with no scenarios', async () => {
      const userId = 'test-user-8';
      const domainId = 999; // Non-existent domain

      const progress = await achievementService.calculateDomainProgress(userId, domainId);

      expect(progress).toBe(0);
    });
  });

  describe('getAchievementStats', () => {
    it('should return correct achievement statistics', async () => {
      const userId = 'test-user-9';

      // Award some achievements
      await mockStorage.awardAchievement(userId, 1);
      await mockStorage.awardAchievement(userId, 2);

      const stats = await achievementService.getAchievementStats(userId);

      expect(stats.totalAchievements).toBe(2);
      expect(stats.earnedAchievements).toBe(2);
      expect(stats.totalXPFromAchievements).toBe(200); // 50 + 150
      expect(stats.recentAchievements).toHaveLength(2);
    });

    it('should handle user with no achievements', async () => {
      const userId = 'test-user-10';

      const stats = await achievementService.getAchievementStats(userId);

      expect(stats.totalAchievements).toBe(2);
      expect(stats.earnedAchievements).toBe(0);
      expect(stats.totalXPFromAchievements).toBe(0);
      expect(stats.recentAchievements).toHaveLength(0);
    });
  });
});
