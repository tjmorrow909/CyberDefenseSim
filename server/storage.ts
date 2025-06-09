import {
  users,
  domains,
  scenarios,
  userProgress,
  userScenarios,
  achievements,
  userAchievements,
  refreshTokens,
  type User,
  type UpsertUser,
  type Domain,
  type Scenario,
  type UserProgress,
  type UserScenario,
  type Achievement,
  type UserAchievement,
  type RefreshToken,
  type InsertRefreshToken,
} from '@shared/schema';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserXP(userId: string, xp: number): Promise<void>;
  updateUserStreak(userId: string, streak: number): Promise<void>;
  updateUserActivity(userId: string): Promise<void>;

  // Refresh token operations
  storeRefreshToken(userId: string, token: string): Promise<void>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;

  // Domain operations
  getAllDomains(): Promise<Domain[]>;
  getDomain(id: number): Promise<Domain | undefined>;

  // Scenario operations
  getAllScenarios(): Promise<Scenario[]>;
  getScenariosByDomain(domainId: number): Promise<Scenario[]>;
  getScenario(id: number): Promise<Scenario | undefined>;

  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressByDomain(userId: string, domainId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, domainId: number, progress: Partial<UserProgress>): Promise<void>;

  // User scenario operations
  getUserScenarios(userId: string): Promise<UserScenario[]>;
  getUserScenario(userId: string, scenarioId: number): Promise<UserScenario | undefined>;
  updateUserScenario(userId: string, scenarioId: number, data: Partial<UserScenario>): Promise<void>;

  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: number): Promise<void>;
}

class SimpleStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private domains: Map<number, Domain> = new Map();
  private scenarios: Map<number, Scenario> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private userScenarios: Map<string, UserScenario> = new Map();
  private achievements: Map<number, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();
  private refreshTokens: Map<string, RefreshToken> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample domains
    const domainsData = [
      {
        id: 1,
        name: 'Threats, Attacks and Vulnerabilities',
        description: 'Security threats and vulnerability management',
        examPercentage: 24,
        color: '#EF4444',
        icon: 'Shield',
      },
      {
        id: 2,
        name: 'Architecture and Design',
        description: 'Secure architecture principles and design',
        examPercentage: 21,
        color: '#F59E0B',
        icon: 'Building',
      },
      {
        id: 3,
        name: 'Implementation',
        description: 'Security implementation and configuration',
        examPercentage: 25,
        color: '#10B981',
        icon: 'Settings',
      },
      {
        id: 4,
        name: 'Operations and Incident Response',
        description: 'Security operations and incident management',
        examPercentage: 16,
        color: '#3B82F6',
        icon: 'AlertTriangle',
      },
      {
        id: 5,
        name: 'Governance, Risk and Compliance',
        description: 'Risk management and compliance frameworks',
        examPercentage: 14,
        color: '#8B5CF6',
        icon: 'FileText',
      },
    ];

    domainsData.forEach(domain => {
      this.domains.set(domain.id, domain);
    });

    // Create comprehensive scenarios
    const scenariosData = [
      {
        id: 1,
        title: 'Network Vulnerability Assessment',
        description: 'Conduct a comprehensive vulnerability scan using Nessus',
        type: 'lab',
        domainId: 1,
        difficulty: 'intermediate',
        estimatedTime: 45,
        xpReward: 150,
        content: {
          background: 'Your organization needs a security assessment',
          scenario: 'Perform vulnerability scanning and analysis',
          codeExample: 'nmap -sV -sC target_network',
        },
      },
      {
        id: 2,
        title: 'Incident Response Planning',
        description: 'Develop and implement incident response procedures',
        type: 'scenario',
        domainId: 4,
        difficulty: 'advanced',
        estimatedTime: 60,
        xpReward: 200,
        content: {
          background: 'Security incident requires immediate response',
          scenario: 'Follow incident response framework',
          codeExample: 'Containment -> Eradication -> Recovery -> Lessons Learned',
        },
      },
      {
        id: 3,
        title: 'Cryptography Implementation',
        description: 'Implement secure encryption protocols',
        type: 'lab',
        domainId: 3,
        difficulty: 'expert',
        estimatedTime: 90,
        xpReward: 250,
        content: {
          background: 'Data protection requires encryption',
          scenario: 'Design cryptographic solution',
          codeExample: 'AES-256 with proper key management',
        },
      },
    ];

    scenariosData.forEach(scenario => {
      this.scenarios.set(scenario.id, scenario);
    });

    // Create sample achievements
    const achievementsData = [
      {
        id: 1,
        name: 'First Steps',
        description: 'Complete your first scenario',
        icon: 'Trophy',
        xpReward: 50,
        criteria: { scenariosCompleted: 1 },
      },
      {
        id: 2,
        name: 'Security Expert',
        description: 'Complete 10 scenarios',
        icon: 'Star',
        xpReward: 200,
        criteria: { scenariosCompleted: 10 },
      },
    ];

    achievementsData.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email.toLowerCase());
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      passwordHash: userData.passwordHash || null,
      profileImageUrl: userData.profileImageUrl || null,
      xp: userData.xp || 0,
      streak: userData.streak || 0,
      lastActivity: userData.lastActivity || new Date(),
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    if (user.email) {
      this.usersByEmail.set(user.email.toLowerCase(), user);
    }
    return user;
  }

  async updateUserXP(userId: string, xp: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.xp = xp;
      user.updatedAt = new Date();
    }
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.streak = streak;
      user.updatedAt = new Date();
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastActivity = new Date();
      user.updatedAt = new Date();
    }
  }

  // Refresh token operations
  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const refreshToken: RefreshToken = {
      id: Date.now(),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    this.refreshTokens.set(token, refreshToken);
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return this.refreshTokens.get(token);
  }

  async deleteRefreshToken(token: string): Promise<void> {
    this.refreshTokens.delete(token);
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    for (const [token, refreshToken] of this.refreshTokens.entries()) {
      if (refreshToken.userId === userId) {
        this.refreshTokens.delete(token);
      }
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
    return Array.from(this.scenarios.values()).filter(s => s.domainId === domainId);
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(p => p.userId === userId);
  }

  async getUserProgressByDomain(userId: string, domainId: number): Promise<UserProgress | undefined> {
    const key = `${userId}-${domainId}`;
    return this.userProgress.get(key);
  }

  async updateUserProgress(userId: string, domainId: number, progress: Partial<UserProgress>): Promise<void> {
    const key = `${userId}-${domainId}`;
    const existing = this.userProgress.get(key);

    if (existing) {
      Object.assign(existing, progress);
    } else {
      const newProgress: UserProgress = {
        id: Date.now(),
        userId,
        domainId,
        progress: progress.progress || 0,
        questionsCompleted: progress.questionsCompleted || 0,
        questionsCorrect: progress.questionsCorrect || 0,
        timeSpent: progress.timeSpent || 0,
      };
      this.userProgress.set(key, newProgress);
    }
  }

  async getUserScenarios(userId: string): Promise<UserScenario[]> {
    return Array.from(this.userScenarios.values()).filter(s => s.userId === userId);
  }

  async getUserScenario(userId: string, scenarioId: number): Promise<UserScenario | undefined> {
    const key = `${userId}-${scenarioId}`;
    return this.userScenarios.get(key);
  }

  async updateUserScenario(userId: string, scenarioId: number, data: Partial<UserScenario>): Promise<void> {
    const key = `${userId}-${scenarioId}`;
    const existing = this.userScenarios.get(key);

    if (existing) {
      Object.assign(existing, data);
    } else {
      const newUserScenario: UserScenario = {
        id: Date.now(),
        userId,
        scenarioId,
        completed: data.completed || false,
        score: data.score || null,
        attempts: data.attempts || 0,
        timeSpent: data.timeSpent || 0,
        completedAt: data.completedAt || null,
      };
      this.userScenarios.set(key, newUserScenario);
    }
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(a => a.userId === userId);
  }

  async awardAchievement(userId: string, achievementId: number): Promise<void> {
    const key = `${userId}-${achievementId}`;
    const userAchievement: UserAchievement = {
      id: Date.now(),
      userId,
      achievementId,
      earnedAt: new Date(),
    };
    this.userAchievements.set(key, userAchievement);
  }
}

import { DatabaseStorage } from './database-storage';
import { AchievementService } from './achievement-service';
import { db } from './db';

// Use database storage only if database is available, otherwise use simple storage
let storage: IStorage;

try {
  if (db && (process.env.NODE_ENV === 'production' || process.env.USE_DATABASE === 'true')) {
    storage = new DatabaseStorage();
  } else {
    storage = new SimpleStorage();
  }
} catch (error) {
  console.warn('Failed to initialize database storage, falling back to simple storage:', error);
  storage = new SimpleStorage();
}

export { storage };
export const achievementService = new AchievementService(storage);
