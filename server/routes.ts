import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Profile creation routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Create user with unique ID
      const userId = Date.now().toString();
      const user = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl: null,
      });

      res.json({ user, userId });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Check if user exists
  app.get("/api/auth/user/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = req.params.id;
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

  app.get("/api/domains/:domainId/scenarios", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const scenarios = await storage.getScenariosByDomain(domainId);
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User progress routes
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = req.params.userId;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/progress/:domainId", async (req, res) => {
    try {
      const userId = req.params.userId;
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
      const userId = req.params.userId;
      const domainId = parseInt(req.params.domainId);
      const progressData = req.body;
      
      await storage.updateUserProgress(userId, domainId, progressData);
      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User scenario routes
  app.get("/api/users/:userId/scenarios", async (req, res) => {
    try {
      const userId = req.params.userId;
      const userScenarios = await storage.getUserScenarios(userId);
      res.json(userScenarios);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/scenarios/:scenarioId", async (req, res) => {
    try {
      const userId = req.params.userId;
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
      const userId = req.params.userId;
      const scenarioId = parseInt(req.params.scenarioId);
      const scenarioData = req.body;
      
      await storage.updateUserScenario(userId, scenarioId, scenarioData);
      res.json({ message: "User scenario updated successfully" });
    } catch (error) {
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
      const userId = req.params.userId;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/achievements/:achievementId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const achievementId = parseInt(req.params.achievementId);
      
      await storage.awardAchievement(userId, achievementId);
      res.json({ message: "Achievement awarded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard data route
  app.get("/api/users/:userId/dashboard", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const domains = await storage.getAllDomains();
      const scenarios = await storage.getAllScenarios();
      const userProgress = await storage.getUserProgress(userId);
      const userAchievements = await storage.getUserAchievements(userId);
      const achievements = await storage.getAllAchievements();

      // Calculate overall progress
      const totalDomains = domains.length;
      const completedDomains = userProgress.filter(p => p.progress >= 100).length;
      const overallProgress = totalDomains > 0 ? Math.round((completedDomains / totalDomains) * 100) : 0;

      // Get recent achievements (last 5)
      const recentAchievements = userAchievements
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
        .slice(0, 5)
        .map(ua => {
          const achievement = achievements.find(a => a.id === ua.achievementId);
          return {
            ...ua,
            name: achievement?.name || "Unknown",
            description: achievement?.description || "",
            icon: achievement?.icon || "Trophy"
          };
        });

      // Add progress to domains
      const domainsWithProgress = domains.map(domain => {
        const progress = userProgress.find(p => p.domainId === domain.id);
        return {
          ...domain,
          progress: progress?.progress || 0
        };
      });

      // Get recommended scenarios (not completed, ordered by domain progress)
      const userScenarios = await storage.getUserScenarios(userId);
      const completedScenarioIds = userScenarios.filter(us => us.completed).map(us => us.scenarioId);
      
      const recommendedScenarios = scenarios
        .filter(s => !completedScenarioIds.includes(s.id))
        .slice(0, 6)
        .map(scenario => {
          const domain = domains.find(d => d.id === scenario.domainId);
          return {
            ...scenario,
            domainName: domain?.name || "Unknown Domain"
          };
        });

      res.json({
        user,
        overallProgress,
        domains: domainsWithProgress,
        recentAchievements,
        recommendedScenarios,
        stats: {
          accuracy: userProgress.length > 0 ? 
            Math.round(userProgress.reduce((acc, p) => acc + (p.questionsCorrect / Math.max(p.questionsCompleted, 1)), 0) / userProgress.length * 100) : 0,
          questionsCompleted: userProgress.reduce((acc, p) => acc + p.questionsCompleted, 0),
          studyTime: userProgress.reduce((acc, p) => acc + p.timeSpent, 0),
          weakestDomain: userProgress.length > 0 ? 
            userProgress.sort((a, b) => a.progress - b.progress)[0]?.domainId || null : null
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}