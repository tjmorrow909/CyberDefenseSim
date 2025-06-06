import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Domain routes
  app.get("/api/domains", async (req, res) => {
    try {
      const domains = await storage.getAllDomains();
      res.json(domains);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/domains/:id", async (req, res) => {
    try {
      const domainId = parseInt(req.params.id);
      const domain = await storage.getDomain(domainId);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      res.json(domain);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Scenario routes
  app.get("/api/scenarios", async (req, res) => {
    try {
      const { domainId } = req.query;
      if (domainId) {
        const scenarios = await storage.getScenariosByDomain(parseInt(domainId as string));
        return res.json(scenarios);
      }
      const scenarios = await storage.getAllScenarios();
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/scenarios/:id", async (req, res) => {
    try {
      const scenarioId = parseInt(req.params.id);
      const scenario = await storage.getScenario(scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User progress routes
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/progress/:domainId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const domainId = parseInt(req.params.domainId);
      const progress = await storage.getUserProgressByDomain(userId, domainId);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:userId/progress/:domainId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const domainId = parseInt(req.params.domainId);
      
      const updateSchema = z.object({
        progress: z.number().min(0).max(100).optional(),
        questionsCompleted: z.number().min(0).optional(),
        questionsCorrect: z.number().min(0).optional(),
        timeSpent: z.number().min(0).optional(),
      });

      const updateData = updateSchema.parse(req.body);
      await storage.updateUserProgress(userId, domainId, updateData);
      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User scenario routes
  app.get("/api/users/:userId/scenarios", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userScenarios = await storage.getUserScenarios(userId);
      res.json(userScenarios);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/scenarios/:scenarioId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const scenarioId = parseInt(req.params.scenarioId);
      const userScenario = await storage.getUserScenario(userId, scenarioId);
      if (!userScenario) {
        return res.status(404).json({ message: "User scenario not found" });
      }
      res.json(userScenario);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:userId/scenarios/:scenarioId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const scenarioId = parseInt(req.params.scenarioId);
      
      const updateSchema = z.object({
        completed: z.boolean().optional(),
        score: z.number().min(0).max(100).optional(),
        attempts: z.number().min(0).optional(),
        timeSpent: z.number().min(0).optional(),
        completedAt: z.string().datetime().optional(),
      });

      const updateData = updateSchema.parse(req.body);
      const processedData = {
        ...updateData,
        completedAt: updateData.completedAt ? new Date(updateData.completedAt) : undefined
      };

      await storage.updateUserScenario(userId, scenarioId, processedData);
      res.json({ message: "User scenario updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/achievements/:achievementId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievementId = parseInt(req.params.achievementId);
      await storage.awardAchievement(userId, achievementId);
      res.json({ message: "Achievement awarded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard summary route
  app.get("/api/users/:userId/dashboard", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const [user, domains, progress, userAchievements, scenarios] = await Promise.all([
        storage.getUser(userId),
        storage.getAllDomains(),
        storage.getUserProgress(userId),
        storage.getUserAchievements(userId),
        storage.getAllScenarios()
      ]);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate overall progress
      const totalProgress = progress.reduce((sum, p) => sum + (p.progress * (domains.find(d => d.id === p.domainId)?.examPercentage || 0) / 100), 0);
      const overallProgress = Math.round(totalProgress);

      // Get recommended scenarios
      const recommendedScenarios = scenarios.slice(0, 3); // Simple recommendation logic

      const dashboardData = {
        user,
        overallProgress,
        domains: domains.map(domain => {
          const domainProgress = progress.find(p => p.domainId === domain.id);
          return {
            ...domain,
            progress: domainProgress?.progress || 0,
            questionsCompleted: domainProgress?.questionsCompleted || 0,
            questionsCorrect: domainProgress?.questionsCorrect || 0,
            timeSpent: domainProgress?.timeSpent || 0
          };
        }),
        recentAchievements: userAchievements.slice(-3),
        recommendedScenarios,
        stats: {
          accuracy: progress.length > 0 ? Math.round((progress.reduce((sum, p) => sum + p.questionsCorrect, 0) / progress.reduce((sum, p) => sum + p.questionsCompleted, 1)) * 100) : 0,
          questionsCompleted: progress.reduce((sum, p) => sum + p.questionsCompleted, 0),
          studyTime: Math.round(progress.reduce((sum, p) => sum + p.timeSpent, 0) / 60 * 10) / 10, // hours
          weakestDomain: progress.length > 0 ? progress.sort((a, b) => a.progress - b.progress)[0].domainId : null
        }
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
