import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../auth';
import { storage } from '../storage';
import { logger } from '../logger';
import {
  validateParams,
  validateBody,
  userIdParamSchema,
  updateUserSchema,
  updateProgressSchema,
  updateScenarioSchema,
  domainIdParamSchema,
  scenarioIdParamSchema
} from '../validation';

const router = Router();

// Apply authentication to all user routes
router.use(authenticateToken);

// Get user dashboard data
router.get('/:id/dashboard', validateParams(userIdParamSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Ensure user can only access their own data
    if (req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const domains = await storage.getAllDomains();
    const userProgress = await storage.getUserProgress(userId);
    const scenarios = await storage.getAllScenarios();
    const achievements = await storage.getUserAchievements(userId);

    const domainsWithProgress = domains.map(domain => {
      const progress = userProgress.find(p => p.domainId === domain.id);
      return { ...domain, progress: progress?.progress || 0 };
    });

    const recommendedScenarios = scenarios.slice(0, 3).map(scenario => {
      const domain = domains.find(d => d.id === scenario.domainId);
      return { ...scenario, domainName: domain?.name || 'Unknown' };
    });

    const overallProgress = Math.round(
      domainsWithProgress.reduce((sum, domain) => sum + domain.progress, 0) / domains.length
    );

    // Calculate stats
    const totalQuestionsCompleted = userProgress.reduce((sum, p) => sum + (p.questionsCompleted || 0), 0);
    const totalQuestionsCorrect = userProgress.reduce((sum, p) => sum + (p.questionsCorrect || 0), 0);
    const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const accuracy = totalQuestionsCompleted > 0 ? Math.round((totalQuestionsCorrect / totalQuestionsCompleted) * 100) : 0;

    // Find weakest domain
    const weakestDomain = domainsWithProgress.reduce((weakest, domain) => 
      domain.progress < (weakest?.progress || 100) ? domain : weakest, null
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          xp: user.xp,
          streak: user.streak
        },
        overallProgress,
        domains: domainsWithProgress,
        recentAchievements: achievements.slice(0, 3),
        recommendedScenarios,
        stats: {
          accuracy,
          questionsCompleted: totalQuestionsCompleted,
          studyTime: totalTimeSpent,
          weakestDomain: weakestDomain?.id || null,
        },
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard data', { error: error.message, userId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get user profile
router.get('/:id', validateParams(userIdParamSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Ensure user can only access their own data
    if (req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          xp: user.xp,
          streak: user.streak,
          lastActivity: user.lastActivity,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching user', { error: error.message, userId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Update user profile
router.put('/:id', validateParams(userIdParamSchema), validateBody(updateUserSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Ensure user can only update their own data
    if (req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await storage.upsertUser({
      ...user,
      ...req.body,
      id: userId,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          xp: updatedUser.xp,
          streak: updatedUser.streak
        }
      }
    });
  } catch (error) {
    logger.error('Error updating user', { error: error.message, userId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Update user progress for a domain
router.put('/:id/progress/:domainId', 
  validateParams(userIdParamSchema), 
  validateParams(domainIdParamSchema), 
  validateBody(updateProgressSchema), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.id;
      const domainId = parseInt(req.params.domainId);
      
      // Ensure user can only update their own data
      if (req.user?.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await storage.updateUserProgress(userId, domainId, req.body);

      res.json({
        success: true,
        message: 'Progress updated successfully'
      });
    } catch (error) {
      logger.error('Error updating user progress', { error: error.message, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to update progress'
      });
    }
  }
);

// Update user scenario completion
router.put('/:id/scenarios/:scenarioId', 
  validateParams(userIdParamSchema), 
  validateParams(scenarioIdParamSchema), 
  validateBody(updateScenarioSchema), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.id;
      const scenarioId = parseInt(req.params.scenarioId);
      
      // Ensure user can only update their own data
      if (req.user?.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await storage.updateUserScenario(userId, scenarioId, req.body);

      // If scenario completed, award XP
      if (req.body.completed) {
        const scenario = await storage.getScenario(scenarioId);
        if (scenario) {
          const user = await storage.getUser(userId);
          if (user) {
            await storage.updateUserXP(userId, user.xp + scenario.xpReward);
          }
        }
      }

      res.json({
        success: true,
        message: 'Scenario progress updated successfully'
      });
    } catch (error) {
      logger.error('Error updating scenario progress', { error: error.message, userId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to update scenario progress'
      });
    }
  }
);

export default router;
