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
        title: "SQL Injection Attack Investigation",
        description: "Practice identifying and preventing SQL injection vulnerabilities in a simulated e-commerce application.",
        type: "lab",
        domainId: 2,
        difficulty: "intermediate",
        estimatedTime: 15,
        xpReward: 150,
        content: {
          background: "You are a security analyst at TechCorp's e-commerce platform. The development team has reported suspicious database queries in the application logs showing unusual patterns in user authentication attempts.",
          scenario: "Investigate the suspicious database queries and identify potential SQL injection vulnerabilities. Analyze the attack pattern and recommend mitigation strategies.",
          codeExample: "SELECT * FROM users WHERE id = '52019' OR 1=1--' AND password = ''",
          questions: [
            {
              question: "What type of SQL injection attack is being attempted in the code example?",
              options: ["Union-based SQL injection", "Boolean-based blind SQL injection", "Time-based blind SQL injection", "Error-based SQL injection"],
              correct: 1,
              explanation: "This is a boolean-based blind SQL injection using the OR 1=1 condition, which always evaluates to true, potentially bypassing authentication."
            },
            {
              question: "What is the purpose of the '--' characters in the malicious query?",
              options: ["To execute multiple queries", "To comment out the rest of the query", "To create a union statement", "To trigger an error message"],
              correct: 1,
              explanation: "The '--' characters comment out the rest of the SQL query, effectively removing the password check from the authentication logic."
            },
            {
              question: "Which is the most effective primary defense against SQL injection attacks?",
              options: ["Input validation only", "Parameterized queries/prepared statements", "Web application firewalls only", "Encryption of database fields"],
              correct: 1,
              explanation: "Parameterized queries (prepared statements) are the most effective defense as they separate SQL code from data, preventing malicious code injection."
            }
          ]
        }
      },
      {
        title: "Network Segmentation Design",
        description: "Design a secure network architecture for a mid-size company with multiple departments.",
        type: "scenario",
        domainId: 3,
        difficulty: "advanced",
        estimatedTime: 20,
        xpReward: 200,
        content: {
          background: "You are the network security architect for SecureCorp, a 500-employee financial services company. The organization has HR, Finance, IT, Operations, and Customer Service departments. Recent security assessments have identified the need for better network segmentation.",
          scenario: "Design a segmented network architecture that isolates critical systems while maintaining necessary business connectivity. Consider compliance requirements for financial data.",
          questions: [
            {
              question: "Which network segmentation approach would be most appropriate for isolating the Finance department's sensitive systems?",
              options: ["VLAN separation with ACLs", "Complete physical separation", "DMZ placement", "VPN tunneling only"],
              correct: 0,
              explanation: "VLAN separation with Access Control Lists provides logical isolation while maintaining network efficiency and allowing controlled access when needed."
            },
            {
              question: "What should be the primary consideration when placing database servers in the network architecture?",
              options: ["Maximize accessibility for all users", "Place in a separate network segment with strict access controls", "Connect directly to the internet for remote access", "Place on the same segment as user workstations"],
              correct: 1,
              explanation: "Database servers should be isolated in a separate network segment with strict access controls to protect sensitive data and limit attack surface."
            },
            {
              question: "Which principle should guide inter-segment communication rules?",
              options: ["Allow all traffic by default", "Principle of least privilege", "Maximum connectivity", "Open communication"],
              correct: 1,
              explanation: "The principle of least privilege ensures that network segments can only communicate when necessary for business functions, reducing potential attack paths."
            }
          ]
        }
      },
      {
        title: "Ransomware Incident Response",
        description: "Lead an incident response team through a simulated ransomware attack on a hospital network.",
        type: "challenge",
        domainId: 4,
        difficulty: "advanced",
        estimatedTime: 30,
        xpReward: 300,
        content: {
          background: "You are the Chief Information Security Officer at Regional Medical Center. At 3:00 AM, your monitoring systems detect unusual file encryption activity across multiple hospital systems. Patient monitoring systems are beginning to malfunction, and staff report they cannot access electronic health records.",
          scenario: "Coordinate the incident response while ensuring patient safety and data recovery. You must make critical decisions under pressure while following established incident response procedures.",
          questions: [
            {
              question: "What should be the immediate first step in this ransomware incident?",
              options: ["Pay the ransom immediately", "Isolate affected systems from the network", "Restore from backup immediately", "Contact law enforcement first"],
              correct: 1,
              explanation: "Isolating affected systems prevents further spread of the ransomware and limits damage to critical hospital systems."
            },
            {
              question: "According to incident response best practices, what is the correct order of the first three phases?",
              options: ["Containment, Identification, Preparation", "Preparation, Identification, Containment", "Identification, Containment, Eradication", "Recovery, Identification, Containment"],
              correct: 1,
              explanation: "The NIST incident response phases begin with Preparation, then Identification (detection/analysis), followed by Containment."
            },
            {
              question: "What is the most critical consideration unique to healthcare ransomware incidents?",
              options: ["Financial losses", "Patient safety and life-critical systems", "Regulatory fines", "Public relations impact"],
              correct: 1,
              explanation: "In healthcare environments, patient safety and maintaining life-critical systems must be the top priority, as system failures can directly impact patient care and lives."
            }
          ]
        }
      },
      {
        title: "Phishing Email Analysis",
        description: "Analyze suspicious emails and implement security awareness training recommendations.",
        type: "lab",
        domainId: 2,
        difficulty: "beginner",
        estimatedTime: 12,
        xpReward: 120,
        content: {
          background: "As a security analyst at GlobalTech Corp, you've received multiple reports from employees about suspicious emails. The IT help desk has forwarded several examples for your analysis.",
          scenario: "Analyze the phishing emails to identify attack vectors and develop recommendations for improving security awareness training.",
          codeExample: "From: security@g0ogle.com\nSubject: Urgent: Verify Your Account\nDear User, Click here to verify: http://bit.ly/verify-now-urgent",
          questions: [
            {
              question: "What is the primary red flag in this phishing email?",
              options: ["The urgent tone", "The misspelled domain (g0ogle.com)", "The shortened URL", "All of the above"],
              correct: 3,
              explanation: "All elements are red flags: urgent language creates pressure, the misspelled domain mimics Google, and shortened URLs hide the real destination."
            },
            {
              question: "What should employees do when they receive suspicious emails?",
              options: ["Delete it immediately", "Forward it to colleagues as a warning", "Report it to the security team without clicking links", "Reply to ask if it's legitimate"],
              correct: 2,
              explanation: "Employees should report suspicious emails to the security team without interacting with any links or attachments."
            }
          ]
        }
      },
      {
        title: "Multi-Factor Authentication Implementation",
        description: "Design and implement a comprehensive MFA strategy for enterprise systems.",
        type: "scenario",
        domainId: 1,
        difficulty: "intermediate",
        estimatedTime: 18,
        xpReward: 180,
        content: {
          background: "TechStart Inc. has experienced several security incidents related to compromised user credentials. As the security architect, you need to implement multi-factor authentication across all business systems.",
          scenario: "Design an MFA strategy that balances security with user experience, considering different user roles and system criticality levels.",
          questions: [
            {
              question: "What are the three main factors in multi-factor authentication?",
              options: ["Password, PIN, Token", "Something you know, something you have, something you are", "Username, Password, Email", "Biometrics, Smart cards, Passwords"],
              correct: 1,
              explanation: "The three authentication factors are: something you know (knowledge), something you have (possession), and something you are (inherence/biometrics)."
            },
            {
              question: "For a high-security financial application, which MFA combination provides the strongest security?",
              options: ["Password + SMS code", "Password + authenticator app + biometric", "Password + security questions", "Password + email verification"],
              correct: 1,
              explanation: "Password + authenticator app + biometric provides three factors and avoids the vulnerabilities of SMS-based authentication."
            },
            {
              question: "What is the main security weakness of SMS-based two-factor authentication?",
              options: ["It's too expensive", "It's inconvenient for users", "Susceptible to SIM swapping and interception", "It requires internet connection"],
              correct: 2,
              explanation: "SMS can be intercepted through SIM swapping attacks, man-in-the-middle attacks, or SS7 network vulnerabilities."
            }
          ]
        }
      },
      {
        title: "Cloud Security Assessment",
        description: "Evaluate and secure a cloud infrastructure migration for a financial services company.",
        type: "challenge",
        domainId: 3,
        difficulty: "advanced",
        estimatedTime: 25,
        xpReward: 250,
        content: {
          background: "FinSecure Bank is migrating critical financial applications to AWS cloud infrastructure. As the cloud security consultant, you must ensure the migration meets regulatory compliance and security best practices.",
          scenario: "Assess the cloud architecture design and implement security controls that meet banking regulations while maintaining operational efficiency.",
          questions: [
            {
              question: "What is the shared responsibility model in cloud security?",
              options: ["Cloud provider is responsible for everything", "Customer is responsible for everything", "Responsibilities are shared between cloud provider and customer", "Only the cloud provider is responsible for security"],
              correct: 2,
              explanation: "The shared responsibility model divides security responsibilities: cloud provider secures the infrastructure, customer secures their data, applications, and configurations."
            },
            {
              question: "For storing encrypted financial data in the cloud, which key management approach is most secure?",
              options: ["Cloud provider manages all keys", "Customer manages keys on-premises with HSM", "Shared key management", "No encryption needed in the cloud"],
              correct: 1,
              explanation: "Customer-managed keys using Hardware Security Modules (HSM) provide the highest level of control and security for sensitive financial data."
            },
            {
              question: "What is the most important principle for cloud network security architecture?",
              options: ["Maximum connectivity", "Zero trust network access", "Open access by default", "Single perimeter defense"],
              correct: 1,
              explanation: "Zero trust network access assumes no implicit trust and verifies every connection, which is crucial for cloud environments."
            }
          ]
        }
      },
      {
        title: "Digital Forensics Investigation",
        description: "Conduct a digital forensics investigation of a suspected data breach.",
        type: "lab",
        domainId: 4,
        difficulty: "advanced",
        estimatedTime: 35,
        xpReward: 350,
        content: {
          background: "DataCorp has discovered unauthorized access to their customer database. As a digital forensics investigator, you must analyze system logs, memory dumps, and network traffic to determine the scope of the breach.",
          scenario: "Investigate the suspected data breach using forensic techniques while maintaining evidence integrity and following legal procedures.",
          questions: [
            {
              question: "What is the first principle of digital forensics investigation?",
              options: ["Speed of investigation", "Preserving evidence integrity", "Finding the perpetrator quickly", "Minimizing business disruption"],
              correct: 1,
              explanation: "Preserving evidence integrity is paramount in digital forensics to ensure evidence is admissible in legal proceedings."
            },
            {
              question: "What should be the order of volatility when collecting digital evidence?",
              options: ["Hard drives, RAM, network traffic, logs", "RAM, network traffic, hard drives, logs", "Logs, hard drives, RAM, network traffic", "Network traffic, RAM, hard drives, logs"],
              correct: 1,
              explanation: "Evidence should be collected in order of volatility: RAM (most volatile), network traffic, hard drives, then logs (least volatile)."
            },
            {
              question: "What is the purpose of creating forensic images of storage devices?",
              options: ["To speed up the investigation", "To preserve original evidence while allowing analysis", "To compress the data", "To encrypt the evidence"],
              correct: 1,
              explanation: "Forensic images create bit-for-bit copies that preserve the original evidence while allowing investigators to perform analysis without altering the original."
            }
          ]
        }
      },
      {
        title: "Risk Assessment and Management",
        description: "Conduct a comprehensive risk assessment for a healthcare organization.",
        type: "scenario",
        domainId: 5,
        difficulty: "intermediate",
        estimatedTime: 22,
        xpReward: 220,
        content: {
          background: "HealthFirst Medical Center needs a comprehensive risk assessment to comply with HIPAA regulations and improve their overall security posture. You are leading the risk assessment team.",
          scenario: "Identify, analyze, and prioritize security risks while developing appropriate risk treatment strategies for a healthcare environment.",
          questions: [
            {
              question: "What is the formula for calculating risk in quantitative risk analysis?",
              options: ["Risk = Threat + Vulnerability", "Risk = Probability × Impact", "Risk = Asset + Threat", "Risk = Vulnerability × Asset Value"],
              correct: 1,
              explanation: "Risk is calculated as the probability of a threat occurring multiplied by the potential impact or damage."
            },
            {
              question: "In risk management, what does 'risk tolerance' mean?",
              options: ["The maximum risk an organization will accept", "The minimum risk level required", "The cost of risk mitigation", "The time needed to assess risk"],
              correct: 0,
              explanation: "Risk tolerance is the level of risk that an organization is willing to accept in pursuit of its objectives."
            },
            {
              question: "Which risk treatment strategy involves purchasing cybersecurity insurance?",
              options: ["Risk avoidance", "Risk mitigation", "Risk transfer", "Risk acceptance"],
              correct: 2,
              explanation: "Risk transfer involves shifting the financial impact of risk to another party, such as through insurance policies."
            }
          ]
        }
      }
    ];

    scenariosData.forEach((scenario, index) => {
      const scenarioRecord: Scenario = { ...scenario, id: index + 1 };
      this.scenarios.set(index + 1, scenarioRecord);
    });
    this.currentScenarioId = 9;

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
