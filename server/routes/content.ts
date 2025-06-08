import { Router, Response } from 'express';
import { AuthenticatedRequest, optionalAuth } from '../auth';
import { storage } from '../storage';
import { logger } from '../logger';
import {
  validateParams,
  domainIdParamSchema,
  scenarioIdParamSchema
} from '../validation';

const router = Router();

// Apply optional authentication to all content routes
router.use(optionalAuth);

// Get all domains
router.get('/domains', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domains = await storage.getAllDomains();
    
    // If user is authenticated, include their progress
    if (req.user) {
      const userProgress = await storage.getUserProgress(req.user.id);
      const domainsWithProgress = domains.map(domain => {
        const progress = userProgress.find(p => p.domainId === domain.id);
        return { ...domain, progress: progress?.progress || 0 };
      });
      
      return res.json({
        success: true,
        data: { domains: domainsWithProgress }
      });
    }

    res.json({
      success: true,
      data: { domains }
    });
  } catch (error) {
    logger.error('Error fetching domains', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domains'
    });
  }
});

// Get specific domain
router.get('/domains/:id', validateParams(domainIdParamSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domainId = parseInt(req.params.id);
    const domain = await storage.getDomain(domainId);
    
    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Get scenarios for this domain
    const scenarios = await storage.getScenariosByDomain(domainId);
    
    // If user is authenticated, include their progress
    let userProgress = null;
    let userScenarios = [];
    if (req.user) {
      const progress = await storage.getUserProgress(req.user.id);
      userProgress = progress.find(p => p.domainId === domainId);
      userScenarios = await storage.getUserScenarios(req.user.id);
    }

    const scenariosWithProgress = scenarios.map(scenario => {
      const userScenario = userScenarios.find(us => us.scenarioId === scenario.id);
      return {
        ...scenario,
        completed: userScenario?.completed || false,
        score: userScenario?.score || null,
        attempts: userScenario?.attempts || 0
      };
    });

    res.json({
      success: true,
      data: {
        domain: {
          ...domain,
          progress: userProgress?.progress || 0
        },
        scenarios: scenariosWithProgress
      }
    });
  } catch (error) {
    logger.error('Error fetching domain', { error: error.message, domainId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domain'
    });
  }
});

// Get all scenarios
router.get('/scenarios', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scenarios = await storage.getAllScenarios();
    const domains = await storage.getAllDomains();
    
    // Add domain names to scenarios
    const scenariosWithDomains = scenarios.map(scenario => {
      const domain = domains.find(d => d.id === scenario.domainId);
      return { ...scenario, domainName: domain?.name || 'Unknown' };
    });

    // If user is authenticated, include their progress
    if (req.user) {
      const userScenarios = await storage.getUserScenarios(req.user.id);
      const scenariosWithProgress = scenariosWithDomains.map(scenario => {
        const userScenario = userScenarios.find(us => us.scenarioId === scenario.id);
        return {
          ...scenario,
          completed: userScenario?.completed || false,
          score: userScenario?.score || null,
          attempts: userScenario?.attempts || 0
        };
      });
      
      return res.json({
        success: true,
        data: { scenarios: scenariosWithProgress }
      });
    }

    res.json({
      success: true,
      data: { scenarios: scenariosWithDomains }
    });
  } catch (error) {
    logger.error('Error fetching scenarios', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scenarios'
    });
  }
});

// Get specific scenario
router.get('/scenarios/:id', validateParams(scenarioIdParamSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scenarioId = parseInt(req.params.id);
    const scenario = await storage.getScenario(scenarioId);
    
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    // Get domain information
    const domain = await storage.getDomain(scenario.domainId);
    
    // If user is authenticated, include their progress
    let userScenario = null;
    if (req.user) {
      userScenario = await storage.getUserScenario(req.user.id, scenarioId);
    }

    res.json({
      success: true,
      data: {
        scenario: {
          ...scenario,
          domainName: domain?.name || 'Unknown',
          completed: userScenario?.completed || false,
          score: userScenario?.score || null,
          attempts: userScenario?.attempts || 0,
          timeSpent: userScenario?.timeSpent || 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching scenario', { error: error.message, scenarioId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scenario'
    });
  }
});

// Get achievements
router.get('/achievements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const achievements = await storage.getAllAchievements();
    
    // If user is authenticated, include their earned achievements
    if (req.user) {
      const userAchievements = await storage.getUserAchievements(req.user.id);
      const achievementsWithProgress = achievements.map(achievement => {
        const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
        return {
          ...achievement,
          earned: !!userAchievement,
          earnedAt: userAchievement?.earnedAt || null
        };
      });
      
      return res.json({
        success: true,
        data: { achievements: achievementsWithProgress }
      });
    }

    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    logger.error('Error fetching achievements', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
});

export default router;
