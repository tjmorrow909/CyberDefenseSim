import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../auth';
import { storage } from '../storage';
import { logger } from '../logger';
import {
  validateBody,
  validateParams,
  userIdParamSchema,
  domainIdParamSchema,
  scenarioIdParamSchema,
} from '../validation';
import { z } from 'zod';

const router = Router();

// Admin authentication middleware
const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    // For now, check if user email contains 'admin' - in production, use proper role-based auth
    const user = await storage.getUser(req.user!.id);
    if (!user || !user.email?.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    next();
  } catch (error) {
    logger.error('Admin auth check failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Authentication check failed',
    });
  }
};

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Validation schemas
const createDomainSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  examPercentage: z.number().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string().min(1).max(50),
});

const createScenarioSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  type: z.enum(['lab', 'scenario', 'challenge']),
  domainId: z.number().int().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTime: z.number().int().positive(),
  xpReward: z.number().int().positive(),
  content: z.object({
    background: z.string(),
    scenario: z.string(),
    objectives: z.array(z.string()).optional(),
    questions: z
      .array(
        z.object({
          id: z.number(),
          question: z.string(),
          options: z.array(z.string()),
          correct: z.number(),
          explanation: z.string(),
        })
      )
      .optional(),
    codeExample: z.string().optional(),
  }),
});

const createAchievementSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  icon: z.string().min(1).max(50),
  xpReward: z.number().int().positive(),
  criteria: z.record(z.any()),
});

// Dashboard - Get admin statistics
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await storage.getAllDomains(); // This would need to be implemented
    const domains = await storage.getAllDomains();
    const scenarios = await storage.getAllScenarios();
    const achievements = await storage.getAllAchievements();

    // Calculate statistics
    const stats = {
      totalUsers: 0, // Would need user count method
      totalDomains: domains.length,
      totalScenarios: scenarios.length,
      totalAchievements: achievements.length,
      recentActivity: [], // Would need activity tracking
      popularScenarios: scenarios.slice(0, 5), // Would need popularity metrics
      systemHealth: {
        database: 'healthy',
        websocket: 'healthy',
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching admin dashboard', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
    });
  }
});

// Domain Management
router.get('/domains', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domains = await storage.getAllDomains();
    res.json({
      success: true,
      data: { domains },
    });
  } catch (error) {
    logger.error('Error fetching domains for admin', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domains',
    });
  }
});

router.post('/domains', validateBody(createDomainSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Note: This would require implementing createDomain in storage
    logger.info('Domain creation requested', { data: req.body, adminId: req.user?.id });

    res.status(501).json({
      success: false,
      message: 'Domain creation not yet implemented',
    });
  } catch (error) {
    logger.error('Error creating domain', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create domain',
    });
  }
});

// Scenario Management
router.get('/scenarios', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scenarios = await storage.getAllScenarios();
    const domains = await storage.getAllDomains();

    // Add domain names to scenarios
    const scenariosWithDomains = scenarios.map(scenario => {
      const domain = domains.find(d => d.id === scenario.domainId);
      return { ...scenario, domainName: domain?.name || 'Unknown' };
    });

    res.json({
      success: true,
      data: { scenarios: scenariosWithDomains },
    });
  } catch (error) {
    logger.error('Error fetching scenarios for admin', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scenarios',
    });
  }
});

router.post('/scenarios', validateBody(createScenarioSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Note: This would require implementing createScenario in storage
    logger.info('Scenario creation requested', { data: req.body, adminId: req.user?.id });

    res.status(501).json({
      success: false,
      message: 'Scenario creation not yet implemented',
    });
  } catch (error) {
    logger.error('Error creating scenario', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create scenario',
    });
  }
});

router.put(
  '/scenarios/:id',
  validateParams(scenarioIdParamSchema),
  validateBody(createScenarioSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const scenarioId = parseInt(req.params.id);

      // Note: This would require implementing updateScenario in storage
      logger.info('Scenario update requested', { scenarioId, data: req.body, adminId: req.user?.id });

      res.status(501).json({
        success: false,
        message: 'Scenario update not yet implemented',
      });
    } catch (error) {
      logger.error('Error updating scenario', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update scenario',
      });
    }
  }
);

router.delete(
  '/scenarios/:id',
  validateParams(scenarioIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const scenarioId = parseInt(req.params.id);

      // Note: This would require implementing deleteScenario in storage
      logger.info('Scenario deletion requested', { scenarioId, adminId: req.user?.id });

      res.status(501).json({
        success: false,
        message: 'Scenario deletion not yet implemented',
      });
    } catch (error) {
      logger.error('Error deleting scenario', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to delete scenario',
      });
    }
  }
);

// Achievement Management
router.get('/achievements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const achievements = await storage.getAllAchievements();
    res.json({
      success: true,
      data: { achievements },
    });
  } catch (error) {
    logger.error('Error fetching achievements for admin', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
    });
  }
});

router.post(
  '/achievements',
  validateBody(createAchievementSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Note: This would require implementing createAchievement in storage
      logger.info('Achievement creation requested', { data: req.body, adminId: req.user?.id });

      res.status(501).json({
        success: false,
        message: 'Achievement creation not yet implemented',
      });
    } catch (error) {
      logger.error('Error creating achievement', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create achievement',
      });
    }
  }
);

// User Management
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Note: This would require implementing getAllUsers in storage
    logger.info('User list requested', { adminId: req.user?.id });

    res.status(501).json({
      success: false,
      message: 'User management not yet implemented',
    });
  } catch (error) {
    logger.error('Error fetching users for admin', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
});

// System Management
router.get('/system/health', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('Error checking system health', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to check system health',
    });
  }
});

export default router;
