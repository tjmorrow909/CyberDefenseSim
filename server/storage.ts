import { 
  users, 
  domains, 
  scenarios, 
  userProgress, 
  userScenarios, 
  achievements, 
  userAchievements,
  type User, 
  type InsertUser,
  type Domain,
  type Scenario,
  type UserProgress,
  type UserScenario,
  type Achievement,
  type UserAchievement
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(userId: number, xp: number): Promise<void>;
  updateUserStreak(userId: number, streak: number): Promise<void>;

  // Domain methods
  getAllDomains(): Promise<Domain[]>;
  getDomain(id: number): Promise<Domain | undefined>;

  // Scenario methods
  getAllScenarios(): Promise<Scenario[]>;
  getScenariosByDomain(domainId: number): Promise<Scenario[]>;
  getScenario(id: number): Promise<Scenario | undefined>;

  // User progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressByDomain(userId: number, domainId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, domainId: number, progress: Partial<UserProgress>): Promise<void>;

  // User scenario methods
  getUserScenarios(userId: number): Promise<UserScenario[]>;
  getUserScenario(userId: number, scenarioId: number): Promise<UserScenario | undefined>;
  updateUserScenario(userId: number, scenarioId: number, data: Partial<UserScenario>): Promise<void>;

  // Achievement methods
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  awardAchievement(userId: number, achievementId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private domains: Map<number, Domain> = new Map();
  private scenarios: Map<number, Scenario> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private userScenarios: Map<string, UserScenario> = new Map();
  private achievements: Map<number, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();
  
  private currentUserId = 1;
  private currentDomainId = 1;
  private currentScenarioId = 1;
  private currentProgressId = 1;
  private currentUserScenarioId = 1;
  private currentAchievementId = 1;
  private currentUserAchievementId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "alexsmith",
      password: "password123",
      firstName: "Alex",
      lastName: "Smith",
      xp: 2847,
      streak: 7,
      lastActivity: new Date()
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create domains
    const domainsData: Omit<Domain, 'id'>[] = [
      {
        name: "General Security Concepts",
        description: "Fundamental security principles and concepts",
        examPercentage: 12,
        color: "blue",
        icon: "shield-alt"
      },
      {
        name: "Threats, Vulnerabilities & Mitigations",
        description: "Understanding security threats and how to mitigate them",
        examPercentage: 22,
        color: "red",
        icon: "bug"
      },
      {
        name: "Security Architecture",
        description: "Designing secure systems and infrastructure",
        examPercentage: 18,
        color: "purple",
        icon: "network-wired"
      },
      {
        name: "Security Operations",
        description: "Managing security operations and incident response",
        examPercentage: 28,
        color: "green",
        icon: "shield-virus"
      },
      {
        name: "Security Program Management",
        description: "Governance, risk management, and compliance",
        examPercentage: 20,
        color: "orange",
        icon: "clipboard-check"
      }
    ];

    domainsData.forEach((domain, index) => {
      const domainRecord: Domain = { ...domain, id: index + 1 };
      this.domains.set(index + 1, domainRecord);
    });
    this.currentDomainId = 6;

    // Create scenarios
    const scenariosData: Omit<Scenario, 'id'>[] = [
      {
        title: "SQL Injection Attack",
        description: "Practice identifying and preventing SQL injection vulnerabilities in a simulated e-commerce application.",
        type: "lab",
        domainId: 2,
        difficulty: "intermediate",
        estimatedTime: 15,
        xpReward: 150,
        content: {
          background: "You are a security analyst at TechCorp's e-commerce platform. The development team has reported suspicious database queries in the application logs.",
          scenario: "Investigate and identify potential SQL injection vulnerabilities.",
          codeExample: "SELECT * FROM users WHERE id = '52019' OR 1=1--' AND password = ''",
          questions: [
            {
              question: "What type of SQL injection attack is being attempted?",
              options: ["Union-based", "Boolean-based blind", "Time-based blind", "Error-based"],
              correct: 1,
              explanation: "This is a boolean-based blind SQL injection using the OR 1=1 condition."
            }
          ]
        }
      },
      {
        title: "Network Segmentation",
        description: "Design a secure network architecture for a mid-size company with multiple departments.",
        type: "scenario",
        domainId: 3,
        difficulty: "advanced",
        estimatedTime: 20,
        xpReward: 200,
        content: {
          background: "You are tasked with designing network security for a 500-employee company with HR, Finance, IT, and Operations departments.",
          scenario: "Create a segmented network that isolates critical systems while maintaining necessary connectivity.",
          questions: [
            {
              question: "Which network segmentation approach would be most appropriate for isolating the HR department?",
              options: ["VLAN separation", "Physical separation", "DMZ placement", "VPN tunneling"],
              correct: 0,
              explanation: "VLAN separation provides logical isolation while maintaining network efficiency."
            }
          ]
        }
      },
      {
        title: "Ransomware Response",
        description: "Lead an incident response team through a simulated ransomware attack on a hospital network.",
        type: "challenge",
        domainId: 4,
        difficulty: "advanced",
        estimatedTime: 30,
        xpReward: 300,
        content: {
          background: "A ransomware attack has encrypted critical patient data systems at Regional Medical Center.",
          scenario: "You must coordinate the incident response while ensuring patient safety and data recovery.",
          questions: [
            {
              question: "What should be the immediate first step in this ransomware incident?",
              options: ["Pay the ransom", "Isolate affected systems", "Restore from backup", "Contact law enforcement"],
              correct: 1,
              explanation: "Isolating affected systems prevents further spread of the ransomware."
            }
          ]
        }
      }
    ];

    scenariosData.forEach((scenario, index) => {
      const scenarioRecord: Scenario = { ...scenario, id: index + 1 };
      this.scenarios.set(index + 1, scenarioRecord);
    });
    this.currentScenarioId = 4;

    // Create user progress
    const progressData = [
      { userId: 1, domainId: 1, progress: 85, questionsCompleted: 24, questionsCorrect: 20, timeSpent: 180 },
      { userId: 1, domainId: 2, progress: 62, questionsCompleted: 31, questionsCorrect: 22, timeSpent: 210 },
      { userId: 1, domainId: 3, progress: 45, questionsCompleted: 18, questionsCorrect: 13, timeSpent: 150 },
      { userId: 1, domainId: 4, progress: 30, questionsCompleted: 12, questionsCorrect: 8, timeSpent: 90 },
      { userId: 1, domainId: 5, progress: 15, questionsCompleted: 6, questionsCorrect: 4, timeSpent: 45 }
    ];

    progressData.forEach((progress, index) => {
      const progressRecord: UserProgress = { ...progress, id: index + 1 };
      this.userProgress.set(`${progress.userId}-${progress.domainId}`, progressRecord);
    });
    this.currentProgressId = 6;

    // Create achievements
    const achievementsData: Omit<Achievement, 'id'>[] = [
      {
        name: "Security Basics Master",
        description: "Completed Domain 1",
        icon: "shield-alt",
        xpReward: 250,
        criteria: { type: "domain_complete", domainId: 1 }
      },
      {
        name: "Week Warrior",
        description: "7-day study streak",
        icon: "fire",
        xpReward: 200,
        criteria: { type: "streak", days: 7 }
      },
      {
        name: "Threat Hunter",
        description: "Identified 50 threats",
        icon: "bug",
        xpReward: 300,
        criteria: { type: "scenarios_complete", domain: 2, count: 50 }
      }
    ];

    achievementsData.forEach((achievement, index) => {
      const achievementRecord: Achievement = { ...achievement, id: index + 1 };
      this.achievements.set(index + 1, achievementRecord);
    });
    this.currentAchievementId = 4;

    // Award some achievements to the default user
    const userAchievementsData = [
      { userId: 1, achievementId: 1, earnedAt: new Date(Date.now() - 86400000) }, // 1 day ago
      { userId: 1, achievementId: 2, earnedAt: new Date(Date.now() - 3600000) }   // 1 hour ago
    ];

    userAchievementsData.forEach((userAchievement, index) => {
      const userAchievementRecord: UserAchievement = { ...userAchievement, id: index + 1 };
      this.userAchievements.set(`${userAchievement.userId}-${userAchievement.achievementId}`, userAchievementRecord);
    });
    this.currentUserAchievementId = 3;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      xp: 0, 
      streak: 0, 
      lastActivity: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserXP(userId: number, xp: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.xp = xp;
      this.users.set(userId, user);
    }
  }

  async updateUserStreak(userId: number, streak: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.streak = streak;
      this.users.set(userId, user);
    }
  }

  async getAllDomains(): Promise<Domain[]> {
    return Array.from(this.domains.values());
  }

  async getDomain(id: number): Promise<Domain | undefined> {
    return this.domains.get(id);
  }

  async getAllScenarios(): Promise<Scenario[]> {
    return Array.from(this.scenarios.values());
  }

  async getScenariosByDomain(domainId: number): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(scenario => scenario.domainId === domainId);
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId);
  }

  async getUserProgressByDomain(userId: number, domainId: number): Promise<UserProgress | undefined> {
    return this.userProgress.get(`${userId}-${domainId}`);
  }

  async updateUserProgress(userId: number, domainId: number, progress: Partial<UserProgress>): Promise<void> {
    const key = `${userId}-${domainId}`;
    const existing = this.userProgress.get(key);
    if (existing) {
      const updated = { ...existing, ...progress };
      this.userProgress.set(key, updated);
    } else {
      const newProgress: UserProgress = {
        id: this.currentProgressId++,
        userId,
        domainId,
        progress: 0,
        questionsCompleted: 0,
        questionsCorrect: 0,
        timeSpent: 0,
        ...progress
      };
      this.userProgress.set(key, newProgress);
    }
  }

  async getUserScenarios(userId: number): Promise<UserScenario[]> {
    return Array.from(this.userScenarios.values()).filter(scenario => scenario.userId === userId);
  }

  async getUserScenario(userId: number, scenarioId: number): Promise<UserScenario | undefined> {
    return this.userScenarios.get(`${userId}-${scenarioId}`);
  }

  async updateUserScenario(userId: number, scenarioId: number, data: Partial<UserScenario>): Promise<void> {
    const key = `${userId}-${scenarioId}`;
    const existing = this.userScenarios.get(key);
    if (existing) {
      const updated = { ...existing, ...data };
      this.userScenarios.set(key, updated);
    } else {
      const newUserScenario: UserScenario = {
        id: this.currentUserScenarioId++,
        userId,
        scenarioId,
        completed: false,
        score: null,
        attempts: 0,
        timeSpent: 0,
        completedAt: null,
        ...data
      };
      this.userScenarios.set(key, newUserScenario);
    }
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(achievement => achievement.userId === userId);
  }

  async awardAchievement(userId: number, achievementId: number): Promise<void> {
    const key = `${userId}-${achievementId}`;
    if (!this.userAchievements.has(key)) {
      const userAchievement: UserAchievement = {
        id: this.currentUserAchievementId++,
        userId,
        achievementId,
        earnedAt: new Date()
      };
      this.userAchievements.set(key, userAchievement);
    }
  }
}

export const storage = new MemStorage();
