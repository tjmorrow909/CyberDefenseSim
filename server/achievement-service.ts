import { IStorage } from './storage';
import { logger } from './logger';

interface AchievementCriteria {
  scenariosCompleted?: number;
  domainProgress?: number;
  perfectScore?: boolean;
  fastCompletion?: number; // minutes
  streak?: number;
  totalXP?: number;
  categoryComplete?: string;
}

export class AchievementService {
  constructor(private storage: IStorage) {}

  async checkAndAwardAchievements(
    userId: string,
    context?: {
      scenarioCompleted?: boolean;
      scenarioId?: number;
      score?: number;
      timeSpent?: number;
      domainProgress?: { domainId: number; progress: number };
    }
  ): Promise<number[]> {
    try {
      const awardedAchievements: number[] = [];
      const achievements = await this.storage.getAllAchievements();
      const userAchievements = await this.storage.getUserAchievements(userId);
      const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

      for (const achievement of achievements) {
        // Skip if user already has this achievement
        if (earnedAchievementIds.has(achievement.id)) {
          continue;
        }

        const criteria = achievement.criteria as AchievementCriteria;
        const shouldAward = await this.checkAchievementCriteria(userId, criteria, context);

        if (shouldAward) {
          await this.storage.awardAchievement(userId, achievement.id);
          awardedAchievements.push(achievement.id);
          logger.info('Achievement awarded', {
            userId,
            achievementId: achievement.id,
            achievementName: achievement.name,
          });
        }
      }

      return awardedAchievements;
    } catch (error) {
      logger.error('Error checking achievements', { error: error.message, userId });
      return [];
    }
  }

  private async checkAchievementCriteria(
    userId: string,
    criteria: AchievementCriteria,
    context?: any
  ): Promise<boolean> {
    try {
      // Check scenarios completed
      if (criteria.scenariosCompleted !== undefined) {
        const userScenarios = await this.storage.getUserScenarios(userId);
        const completedCount = userScenarios.filter(us => us.completed).length;
        if (completedCount < criteria.scenariosCompleted) {
          return false;
        }
      }

      // Check domain progress
      if (criteria.domainProgress !== undefined) {
        const userProgress = await this.storage.getUserProgress(userId);
        const hasRequiredProgress = userProgress.some(up => up.progress >= criteria.domainProgress!);
        if (!hasRequiredProgress) {
          return false;
        }
      }

      // Check perfect score
      if (criteria.perfectScore && context?.score !== 100) {
        return false;
      }

      // Check fast completion
      if (criteria.fastCompletion !== undefined && context?.timeSpent) {
        if (context.timeSpent > criteria.fastCompletion) {
          return false;
        }
      }

      // Check streak
      if (criteria.streak !== undefined) {
        const user = await this.storage.getUser(userId);
        if (!user || user.streak < criteria.streak) {
          return false;
        }
      }

      // Check total XP
      if (criteria.totalXP !== undefined) {
        const user = await this.storage.getUser(userId);
        if (!user || user.xp < criteria.totalXP) {
          return false;
        }
      }

      // Check category completion
      if (criteria.categoryComplete) {
        const isComplete = await this.checkCategoryCompletion(userId, criteria.categoryComplete);
        if (!isComplete) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error checking achievement criteria', { error: error.message, userId, criteria });
      return false;
    }
  }

  private async checkCategoryCompletion(userId: string, category: string): Promise<boolean> {
    try {
      const scenarios = await this.storage.getAllScenarios();
      const userScenarios = await this.storage.getUserScenarios(userId);
      const userCompletedIds = new Set(userScenarios.filter(us => us.completed).map(us => us.scenarioId));

      let categoryScenarios: number[] = [];

      switch (category) {
        case 'vulnerability':
          categoryScenarios = scenarios
            .filter(
              s =>
                s.title.toLowerCase().includes('vulnerability') || s.description.toLowerCase().includes('vulnerability')
            )
            .map(s => s.id);
          break;
        case 'incident-response':
          categoryScenarios = scenarios
            .filter(s => s.title.toLowerCase().includes('incident') || s.description.toLowerCase().includes('incident'))
            .map(s => s.id);
          break;
        default:
          return false;
      }

      return categoryScenarios.length > 0 && categoryScenarios.every(id => userCompletedIds.has(id));
    } catch (error) {
      logger.error('Error checking category completion', { error: error.message, userId, category });
      return false;
    }
  }

  async updateUserStreak(userId: string): Promise<void> {
    try {
      const user = await this.storage.getUser(userId);
      if (!user) return;

      const now = new Date();
      const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;

      if (!lastActivity) {
        // First activity
        await this.storage.updateUserStreak(userId, 1);
        return;
      }

      const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day - increment streak
        await this.storage.updateUserStreak(userId, user.streak + 1);
      } else if (daysDiff > 1) {
        // Streak broken - reset to 1
        await this.storage.updateUserStreak(userId, 1);
      }
      // Same day - no change to streak

      // Update last activity
      await this.storage.updateUserActivity(userId);

      // Check for streak achievements
      await this.checkAndAwardAchievements(userId);
    } catch (error) {
      logger.error('Error updating user streak', { error: error.message, userId });
    }
  }

  async calculateDomainProgress(userId: string, domainId: number): Promise<number> {
    try {
      const scenarios = await this.storage.getScenariosByDomain(domainId);
      if (scenarios.length === 0) return 0;

      const userScenarios = await this.storage.getUserScenarios(userId);
      const completedInDomain = userScenarios.filter(
        us => us.completed && scenarios.some(s => s.id === us.scenarioId)
      ).length;

      return Math.round((completedInDomain / scenarios.length) * 100);
    } catch (error) {
      logger.error('Error calculating domain progress', { error: error.message, userId, domainId });
      return 0;
    }
  }

  async updateDomainProgress(userId: string, domainId: number): Promise<void> {
    try {
      const progress = await this.calculateDomainProgress(userId, domainId);
      const existingProgress = await this.storage.getUserProgressByDomain(userId, domainId);

      const updateData = {
        progress,
        questionsCompleted: existingProgress?.questionsCompleted || 0,
        questionsCorrect: existingProgress?.questionsCorrect || 0,
        timeSpent: existingProgress?.timeSpent || 0,
      };

      await this.storage.updateUserProgress(userId, domainId, updateData);

      // Check for domain progress achievements
      await this.checkAndAwardAchievements(userId, {
        domainProgress: { domainId, progress },
      });
    } catch (error) {
      logger.error('Error updating domain progress', { error: error.message, userId, domainId });
    }
  }

  async getAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    earnedAchievements: number;
    totalXPFromAchievements: number;
    recentAchievements: any[];
  }> {
    try {
      const allAchievements = await this.storage.getAllAchievements();
      const userAchievements = await this.storage.getUserAchievements(userId);

      const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
      const earnedAchievementDetails = allAchievements.filter(a => earnedAchievementIds.has(a.id));

      const totalXPFromAchievements = earnedAchievementDetails.reduce((sum, a) => sum + a.xpReward, 0);

      const recentAchievements = userAchievements.slice(0, 5).map(ua => {
        const achievement = allAchievements.find(a => a.id === ua.achievementId);
        return {
          ...ua,
          name: achievement?.name,
          description: achievement?.description,
          icon: achievement?.icon,
          xpReward: achievement?.xpReward,
        };
      });

      return {
        totalAchievements: allAchievements.length,
        earnedAchievements: userAchievements.length,
        totalXPFromAchievements,
        recentAchievements,
      };
    } catch (error) {
      logger.error('Error getting achievement stats', { error: error.message, userId });
      return {
        totalAchievements: 0,
        earnedAchievements: 0,
        totalXPFromAchievements: 0,
        recentAchievements: [],
      };
    }
  }
}
