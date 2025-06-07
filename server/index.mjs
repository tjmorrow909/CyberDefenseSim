import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// In-memory storage for demonstration
const users = new Map();
const domains = [
  { id: 1, name: "Threats, Attacks and Vulnerabilities", description: "Security threats and vulnerability management", examPercentage: 24, color: "#EF4444", icon: "Shield", progress: 0 },
  { id: 2, name: "Architecture and Design", description: "Secure architecture principles and design", examPercentage: 21, color: "#F59E0B", icon: "Building", progress: 0 },
  { id: 3, name: "Implementation", description: "Security implementation and configuration", examPercentage: 25, color: "#10B981", icon: "Settings", progress: 0 },
  { id: 4, name: "Operations and Incident Response", description: "Security operations and incident management", examPercentage: 16, color: "#3B82F6", icon: "AlertTriangle", progress: 0 },
  { id: 5, name: "Governance, Risk and Compliance", description: "Risk management and compliance frameworks", examPercentage: 14, color: "#8B5CF6", icon: "FileText", progress: 0 }
];

const scenarios = [
  {
    id: 1, title: "Network Vulnerability Assessment", description: "Conduct a comprehensive vulnerability scan using Nessus", 
    type: "lab", domainId: 1, difficulty: "intermediate", estimatedTime: 45, xpReward: 150,
    content: { background: "Your organization needs a security assessment", scenario: "Perform vulnerability scanning and analysis", codeExample: "nmap -sV -sC target_network" },
    domainName: "Threats, Attacks and Vulnerabilities"
  },
  {
    id: 2, title: "Incident Response Planning", description: "Develop and implement incident response procedures",
    type: "scenario", domainId: 4, difficulty: "advanced", estimatedTime: 60, xpReward: 200,
    content: { background: "Security incident requires immediate response", scenario: "Follow incident response framework", codeExample: "Containment -> Eradication -> Recovery -> Lessons Learned" },
    domainName: "Operations and Incident Response"
  },
  {
    id: 3, title: "Cryptography Implementation", description: "Implement secure encryption protocols",
    type: "lab", domainId: 3, difficulty: "expert", estimatedTime: 90, xpReward: 250,
    content: { background: "Data protection requires encryption", scenario: "Design cryptographic solution", codeExample: "AES-256 with proper key management" },
    domainName: "Implementation"
  }
];

const achievements = [
  { id: 1, name: "First Steps", description: "Complete your first scenario", icon: "Star", earnedAt: new Date().toISOString() },
  { id: 2, name: "Security Expert", description: "Complete 10 scenarios", icon: "Shield", earnedAt: new Date().toISOString() },
  { id: 3, name: "Master Defender", description: "Achieve 90% accuracy", icon: "Trophy", earnedAt: new Date().toISOString() }
];

// API Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userId = Date.now().toString();
    const user = {
      id: userId,
      email,
      firstName,
      lastName,
      profileImageUrl: null,
      xp: 0,
      streak: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.set(userId, user);
    res.json({ user, userId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = users.get(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.get('/api/users/:id/dashboard', (req, res) => {
  try {
    const user = users.get(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user,
      overallProgress: 0,
      domains,
      recentAchievements: achievements.slice(0, 3),
      recommendedScenarios: scenarios,
      stats: {
        accuracy: 0,
        questionsCompleted: 0,
        studyTime: 0,
        weakestDomain: null
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

app.get('/api/domains', (req, res) => {
  try {
    res.json(domains);
  } catch (error) {
    console.error("Error fetching domains:", error);
    res.status(500).json({ message: "Failed to fetch domains" });
  }
});

app.get('/api/scenarios', (req, res) => {
  try {
    res.json(scenarios);
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    res.status(500).json({ message: "Failed to fetch scenarios" });
  }
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Serve static files for the frontend
app.use(express.static(path.resolve(__dirname, "..", "client")));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.resolve(__dirname, "..", "client", "index.html"));
  }
});

// Create HTTP server
const server = createServer(app);
const port = 5000;

// Start server with explicit host binding
server.listen(port, '0.0.0.0', () => {
  console.log(`[express] serving on port ${port}`);
  console.log(`Cybersecurity Training Platform ready at http://localhost:${port}`);
});