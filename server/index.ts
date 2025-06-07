import express, { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { createServer } from "http";
import path from "path";
// Temporarily disable Vite integration due to Node.js compatibility issues
// import { setupVite, serveStatic } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

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

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.get("/api/users/:id/dashboard", async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const domains = await storage.getAllDomains();
    const userProgress = await storage.getUserProgress(req.params.id);
    const scenarios = await storage.getAllScenarios();
    const achievements = await storage.getUserAchievements(req.params.id);

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

    res.json({
      user,
      overallProgress,
      domains: domainsWithProgress,
      recentAchievements: achievements.slice(0, 3),
      recommendedScenarios,
      stats: {
        accuracy: 0,
        questionsCompleted: 0,
        studyTime: 0,
        weakestDomain: null,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

app.get("/api/domains", async (req, res) => {
  try {
    const domains = await storage.getAllDomains();
    res.json(domains);
  } catch (error) {
    console.error("Error fetching domains:", error);
    res.status(500).json({ message: "Failed to fetch domains" });
  }
});

app.get("/api/scenarios", async (req, res) => {
  try {
    const scenarios = await storage.getAllScenarios();
    res.json(scenarios);
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    res.status(500).json({ message: "Failed to fetch scenarios" });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Create HTTP server
const server = createServer(app);
const port = 5000;

// Serve static files for the frontend
app.use(express.static(path.resolve(import.meta.dirname, "..", "client")));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.resolve(import.meta.dirname, "..", "client", "index.html"));
  }
});

// Start server with explicit host binding
server.listen(port, '0.0.0.0', () => {
  console.log(`[express] serving on port ${port}`);
  console.log(`Cybersecurity Training Platform ready at http://localhost:${port}`);
});
