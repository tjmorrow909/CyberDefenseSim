import { 
  users, 
  domains, 
  scenarios, 
  userProgress, 
  userScenarios, 
  achievements, 
  userAchievements,
  type User, 
  type UpsertUser,
  type Domain,
  type Scenario,
  type UserProgress,
  type UserScenario,
  type Achievement,
  type UserAchievement
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods (updated for Replit auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserXP(userId: string, xp: number): Promise<void>;
  updateUserStreak(userId: string, streak: number): Promise<void>;

  // Domain methods
  getAllDomains(): Promise<Domain[]>;
  getDomain(id: number): Promise<Domain | undefined>;

  // Scenario methods
  getAllScenarios(): Promise<Scenario[]>;
  getScenariosByDomain(domainId: number): Promise<Scenario[]>;
  getScenario(id: number): Promise<Scenario | undefined>;

  // User progress methods
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressByDomain(userId: string, domainId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, domainId: number, progress: Partial<UserProgress>): Promise<void>;

  // User scenario methods
  getUserScenarios(userId: string): Promise<UserScenario[]>;
  getUserScenario(userId: string, scenarioId: number): Promise<UserScenario | undefined>;
  updateUserScenario(userId: string, scenarioId: number, data: Partial<UserScenario>): Promise<void>;

  // Achievement methods
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: number): Promise<void>;
}

// Create a simpler memory storage for now, we'll add database integration later
class SimpleStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private memStorage: MemStorage;

  constructor() {
    this.memStorage = new MemStorage();
    // Create a default user
    this.users.set("1", {
      id: "1",
      email: "user@example.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      xp: 1250,
      streak: 7,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      xp: userData.xp || 0,
      streak: userData.streak || 0,
      lastActivity: userData.lastActivity || new Date(),
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
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

  // Delegate to memory storage for other methods
  getAllDomains(): Promise<Domain[]> {
    return this.memStorage.getAllDomains();
  }

  getDomain(id: number): Promise<Domain | undefined> {
    return this.memStorage.getDomain(id);
  }

  getAllScenarios(): Promise<Scenario[]> {
    return this.memStorage.getAllScenarios();
  }

  getScenariosByDomain(domainId: number): Promise<Scenario[]> {
    return this.memStorage.getScenariosByDomain(domainId);
  }

  getScenario(id: number): Promise<Scenario | undefined> {
    return this.memStorage.getScenario(id);
  }

  getUserProgress(userId: string): Promise<UserProgress[]> {
    return this.memStorage.getUserProgress(userId);
  }

  getUserProgressByDomain(userId: string, domainId: number): Promise<UserProgress | undefined> {
    return this.memStorage.getUserProgressByDomain(userId, domainId);
  }

  updateUserProgress(userId: string, domainId: number, progress: Partial<UserProgress>): Promise<void> {
    return this.memStorage.updateUserProgress(userId, domainId, progress);
  }

  getUserScenarios(userId: string): Promise<UserScenario[]> {
    return this.memStorage.getUserScenarios(userId);
  }

  getUserScenario(userId: string, scenarioId: number): Promise<UserScenario | undefined> {
    return this.memStorage.getUserScenario(userId, scenarioId);
  }

  updateUserScenario(userId: string, scenarioId: number, data: Partial<UserScenario>): Promise<void> {
    return this.memStorage.updateUserScenario(userId, scenarioId, data);
  }

  getAllAchievements(): Promise<Achievement[]> {
    return this.memStorage.getAllAchievements();
  }

  getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.memStorage.getUserAchievements(userId);
  }

  awardAchievement(userId: string, achievementId: number): Promise<void> {
    return this.memStorage.awardAchievement(userId, achievementId);
  }
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

    // Create comprehensive scenarios based on CompTIA Security+ SY0-701 content
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
      },
      {
        title: "Cross-Site Scripting (XSS) Defense",
        description: "Identify and prevent XSS vulnerabilities in web applications through hands-on testing.",
        type: "lab",
        domainId: 2,
        difficulty: "intermediate",
        estimatedTime: 20,
        xpReward: 160,
        content: {
          background: "You are conducting a security assessment of a message board application. Users have reported suspicious behavior when viewing certain posts.",
          scenario: "Analyze the message board code for XSS vulnerabilities and recommend proper input validation techniques.",
          codeExample: "<p>Hello everyone,</p>\n<p>I am planning an upcoming trip to <A HREF='https://www.mlb.com/mets/ballpark'>Citi Field</A></p>\n<p>Thanks!</p>\n<SCRIPT>alert('Cross-site scripting!')</SCRIPT>",
          questions: [
            {
              question: "What type of XSS attack is demonstrated in the code example?",
              options: ["Reflected XSS", "Stored XSS", "DOM-based XSS", "Blind XSS"],
              correct: 1,
              explanation: "This is stored XSS because the malicious script is permanently stored in the message board and executed when other users view the post."
            },
            {
              question: "What is the most effective defense against XSS attacks?",
              options: ["Input filtering only", "Output encoding/escaping", "Content Security Policy only", "JavaScript validation"],
              correct: 1,
              explanation: "Output encoding ensures that user input is treated as data rather than executable code when displayed in web pages."
            },
            {
              question: "Which HTTP header helps prevent XSS attacks?",
              options: ["X-Frame-Options", "Content-Security-Policy", "X-Content-Type-Options", "Strict-Transport-Security"],
              correct: 1,
              explanation: "Content-Security-Policy (CSP) headers help prevent XSS by controlling which resources can be loaded and executed."
            }
          ]
        }
      },
      {
        title: "CVSS Vulnerability Assessment",
        description: "Learn to calculate and interpret Common Vulnerability Scoring System (CVSS) scores for risk prioritization.",
        type: "scenario",
        domainId: 5,
        difficulty: "advanced",
        estimatedTime: 25,
        xpReward: 280,
        content: {
          background: "Your organization discovered a vulnerability in a web server that allows remote code execution. You need to calculate the CVSS score to prioritize remediation efforts.",
          scenario: "Using CVSS v3.1 metrics, calculate the severity score for a network-exploitable vulnerability that requires no user interaction and can compromise system confidentiality, integrity, and availability.",
          questions: [
            {
              question: "For a network-exploitable vulnerability, what is the Attack Vector (AV) score?",
              options: ["Physical (0.20)", "Local (0.55)", "Adjacent (0.62)", "Network (0.85)"],
              correct: 3,
              explanation: "Network attack vector has the highest score (0.85) as the vulnerability can be exploited remotely over a network."
            },
            {
              question: "If a vulnerability requires no user interaction, what is the User Interaction (UI) score?",
              options: ["None (0.85)", "Required (0.62)", "Low (0.44)", "High (0.27)"],
              correct: 0,
              explanation: "When no user interaction is required, the score is 0.85, indicating higher exploitability."
            },
            {
              question: "For complete system compromise (high confidentiality, integrity, and availability impact), what would be the Impact Subscore?",
              options: ["3.6", "5.2", "6.0", "7.4"],
              correct: 2,
              explanation: "High impact across all three CIA components (Confidentiality, Integrity, Availability) results in the maximum impact subscore of 6.0."
            }
          ]
        }
      },
      {
        title: "Vigenère Cipher Cryptanalysis",
        description: "Decrypt messages using classical cryptographic techniques and understand historical encryption methods.",
        type: "challenge",
        domainId: 1,
        difficulty: "advanced",
        estimatedTime: 30,
        xpReward: 320,
        content: {
          background: "During a digital forensics investigation, you discovered an encrypted message that appears to use a Vigenère cipher with the keyword 'APPLE'. Understanding classical cryptography helps in modern security analysis.",
          scenario: "Decrypt the message 'SEKPT ETIAJ' using the Vigenère cipher table and the keyword 'APPLE'. Analyze the strengths and weaknesses of this encryption method.",
          codeExample: "Keyword: APPLE\nCiphertext: SEKPT ETIAJ\nVigenère Table Reference: A=0, B=1, C=2... Z=25",
          questions: [
            {
              question: "What is the decrypted plaintext message?",
              options: ["SECRET MESSAGE", "HELLO WORLD", "CYBER SECURITY", "HIDDEN TEXT"],
              correct: 0,
              explanation: "Using the Vigenère cipher with keyword 'APPLE', 'SEKPT ETIAJ' decrypts to 'SECRET MESSAGE'."
            },
            {
              question: "What is the main weakness of the Vigenère cipher?",
              options: ["Too complex to implement", "Vulnerable to frequency analysis with long enough ciphertext", "Requires too much computational power", "Cannot encrypt long messages"],
              correct: 1,
              explanation: "With sufficient ciphertext, frequency analysis can reveal the keyword length and eventually break the cipher."
            },
            {
              question: "How does the Vigenère cipher improve upon the Caesar cipher?",
              options: ["It uses different shift values for each letter", "It requires no key", "It's impossible to break", "It only works with numbers"],
              correct: 0,
              explanation: "Unlike Caesar cipher's single shift value, Vigenère uses different shift values based on the repeating keyword."
            }
          ]
        }
      },
      {
        title: "Web Application Firewall Configuration",
        description: "Configure and tune a Web Application Firewall to protect against common web attacks.",
        type: "lab",
        domainId: 3,
        difficulty: "intermediate",
        estimatedTime: 22,
        xpReward: 200,
        content: {
          background: "Your organization needs to deploy a Web Application Firewall (WAF) to protect critical web applications from OWASP Top 10 vulnerabilities.",
          scenario: "Configure WAF rules to detect and block SQL injection, XSS, and directory traversal attacks while minimizing false positives.",
          questions: [
            {
              question: "Where should a WAF be positioned in the network architecture?",
              options: ["Behind the web server", "In the screened subnet (DMZ)", "On user workstations", "In the internal network only"],
              correct: 1,
              explanation: "WAFs are typically placed in the screened subnet (DMZ) between the internet and internal network to filter malicious traffic before it reaches web servers."
            },
            {
              question: "What is a common challenge when implementing WAF rules?",
              options: ["High cost", "Balancing security with false positive rates", "Requires physical access", "Only works with HTTPS"],
              correct: 1,
              explanation: "WAF administrators must carefully tune rules to block attacks while avoiding false positives that could block legitimate traffic."
            },
            {
              question: "Which WAF detection method examines patterns in HTTP requests?",
              options: ["Signature-based detection", "Behavioral analysis", "Statistical analysis", "Machine learning only"],
              correct: 0,
              explanation: "Signature-based detection uses predefined patterns to identify known attack signatures in HTTP requests and responses."
            }
          ]
        }
      },
      {
        title: "Session Management Security",
        description: "Implement secure session management practices to prevent session hijacking and replay attacks.",
        type: "scenario",
        domainId: 2,
        difficulty: "intermediate",
        estimatedTime: 18,
        xpReward: 170,
        content: {
          background: "A web application uses cookies for session management. Security testing revealed potential vulnerabilities in how sessions are created, maintained, and terminated.",
          scenario: "Design secure session management controls including proper cookie configuration, session timeout, and protection against session attacks.",
          questions: [
            {
              question: "Which cookie attribute prevents client-side script access to session cookies?",
              options: ["Secure", "HttpOnly", "SameSite", "Domain"],
              correct: 1,
              explanation: "The HttpOnly attribute prevents JavaScript from accessing the cookie, reducing XSS attack impact on session hijacking."
            },
            {
              question: "What is session fixation and how can it be prevented?",
              options: ["Reusing the same session ID", "Generate new session ID after successful authentication", "Using predictable session IDs", "Storing passwords in sessions"],
              correct: 1,
              explanation: "Session fixation occurs when an attacker sets a known session ID. Prevention involves generating new session IDs after authentication."
            },
            {
              question: "What should happen when a user logs out?",
              options: ["Hide the logout button", "Session ID should be invalidated on server", "Clear browser cache only", "Redirect to login page only"],
              correct: 1,
              explanation: "Proper logout requires invalidating the session on the server side to prevent session reuse."
            }
          ]
        }
      },
      {
        title: "Directory Traversal Attack Prevention",
        description: "Identify and prevent directory traversal vulnerabilities that expose sensitive files.",
        type: "lab",
        domainId: 2,
        difficulty: "beginner",
        estimatedTime: 15,
        xpReward: 140,
        content: {
          background: "A web application allows users to download documents using URLs with file parameters. Security testing reveals potential directory traversal vulnerabilities.",
          scenario: "Analyze URL patterns that could lead to unauthorized file access and implement proper input validation.",
          codeExample: "Normal: www.mycompany.com/getDocument.php?documentID=1841\nMalicious: www.mycompany.com/getDocument.php?documentID=../../../etc/passwd",
          questions: [
            {
              question: "What does the '../' sequence attempt to do in a directory traversal attack?",
              options: ["Create new directories", "Navigate up directory levels", "Delete files", "Compress files"],
              correct: 1,
              explanation: "../ sequences attempt to navigate up directory levels to access files outside the intended directory."
            },
            {
              question: "Which is the most effective defense against directory traversal attacks?",
              options: ["Hiding file extensions", "Input validation and sanitization", "Using longer file names", "Encrypting all files"],
              correct: 1,
              explanation: "Proper input validation and sanitization prevents malicious path manipulation by filtering dangerous characters and sequences."
            }
          ]
        }
      },
      {
        title: "Steganography Detection Lab",
        description: "Learn to detect hidden information in digital files using steganography analysis tools.",
        type: "lab",
        domainId: 4,
        difficulty: "advanced",
        estimatedTime: 28,
        xpReward: 290,
        content: {
          background: "During a digital forensics investigation, you suspect that sensitive information is being hidden within image files using steganography techniques.",
          scenario: "Use steganography detection tools to identify hidden data and extract concealed information from digital images.",
          questions: [
            {
              question: "What is steganography's primary advantage over encryption?",
              options: ["Faster processing", "Hidden existence of the message", "Stronger security", "Easier to implement"],
              correct: 1,
              explanation: "Steganography's main advantage is that it hides the very existence of the secret message, unlike encryption which reveals that secret data exists."
            },
            {
              question: "Which file metadata might reveal steganography usage?",
              options: ["File size inconsistencies", "Creation date", "File permissions", "File name"],
              correct: 0,
              explanation: "Unusual file sizes compared to similar images might indicate hidden data, as steganography can slightly increase file size."
            },
            {
              question: "What is the LSB (Least Significant Bit) method in steganography?",
              options: ["Changing the least important bits of pixels", "Using the largest file size", "Creating low-resolution images", "Hiding data in file headers"],
              correct: 0,
              explanation: "LSB steganography hides data by replacing the least significant bits of pixel values, causing minimal visual changes."
            }
          ]
        }
      },
      {
        title: "NIST Cybersecurity Framework Implementation",
        description: "Apply the NIST Cybersecurity Framework to develop organizational security strategies.",
        type: "scenario",
        domainId: 5,
        difficulty: "advanced",
        estimatedTime: 35,
        xpReward: 360,
        content: {
          background: "Your organization needs to implement the NIST Cybersecurity Framework to improve its security posture and compliance with industry standards.",
          scenario: "Map current security controls to the five NIST Framework functions and develop an implementation roadmap.",
          questions: [
            {
              question: "What are the five core functions of the NIST Cybersecurity Framework?",
              options: ["Prevent, Detect, Respond, Recover, Learn", "Identify, Protect, Detect, Respond, Recover", "Plan, Do, Check, Act, Improve", "Assess, Control, Monitor, Review, Update"],
              correct: 1,
              explanation: "The NIST Framework's five functions are: Identify, Protect, Detect, Respond, and Recover."
            },
            {
              question: "Which NIST function involves developing appropriate safeguards?",
              options: ["Identify", "Protect", "Detect", "Respond"],
              correct: 1,
              explanation: "The Protect function focuses on developing and implementing appropriate safeguards to ensure delivery of critical services."
            },
            {
              question: "What is the purpose of the Framework Implementation Tiers?",
              options: ["Ranking threat severity", "Describing cybersecurity risk management practices", "Classifying data sensitivity", "Measuring financial impact"],
              correct: 1,
              explanation: "Implementation Tiers describe the degree to which an organization's cybersecurity risk management practices exhibit the characteristics in the Framework."
            }
          ]
        }
      },
      {
        title: "Zero Trust Architecture Design",
        description: "Design a Zero Trust security model for modern enterprise networks and cloud environments.",
        type: "challenge",
        domainId: 3,
        difficulty: "advanced",
        estimatedTime: 40,
        xpReward: 400,
        content: {
          background: "Traditional perimeter-based security is insufficient for modern hybrid cloud environments. Your organization needs to implement Zero Trust principles.",
          scenario: "Design a Zero Trust architecture that eliminates implicit trust and continuously validates every transaction.",
          questions: [
            {
              question: "What is the core principle of Zero Trust?",
              options: ["Trust but verify", "Never trust, always verify", "Implicit trust within perimeter", "Trust internal users"],
              correct: 1,
              explanation: "Zero Trust operates on 'never trust, always verify' - no implicit trust is granted regardless of location or user credentials."
            },
            {
              question: "In Zero Trust, what should happen to network microsegmentation?",
              options: ["Eliminate all segmentation", "Increase granular segmentation", "Only segment at the perimeter", "Use physical segmentation only"],
              correct: 1,
              explanation: "Zero Trust requires granular microsegmentation to limit lateral movement and control access between resources."
            },
            {
              question: "Which technology is essential for Zero Trust identity verification?",
              options: ["Single factor authentication", "Multi-factor authentication", "Password-only login", "Biometrics only"],
              correct: 1,
              explanation: "Multi-factor authentication is crucial for Zero Trust to ensure strong identity verification before granting access."
            }
          ]
        }
      },
      {
        title: "Advanced Persistent Threat (APT) Analysis",
        description: "Investigate sophisticated attack campaigns and develop defense strategies against nation-state actors.",
        type: "challenge",
        domainId: 4,
        difficulty: "advanced",
        estimatedTime: 45,
        xpReward: 450,
        content: {
          background: "Your organization detected unusual network activity suggesting a sophisticated, long-term compromise typical of Advanced Persistent Threats.",
          scenario: "Analyze attack indicators, establish timeline of compromise, and develop containment strategies for APT incidents.",
          questions: [
            {
              question: "What distinguishes APT attacks from other cyber threats?",
              options: ["Higher financial motivation", "Longer duration and sophisticated techniques", "Use of social media", "Focus on small businesses"],
              correct: 1,
              explanation: "APTs are characterized by prolonged, sophisticated campaigns often attributed to nation-state actors with specific strategic objectives."
            },
            {
              question: "In APT investigations, what is the 'dwell time'?",
              options: ["Time to patch vulnerabilities", "Duration between initial compromise and detection", "Time to complete incident response", "Period for system recovery"],
              correct: 1,
              explanation: "Dwell time refers to how long attackers remain undetected in the environment, often months or years for APTs."
            },
            {
              question: "Which STIX object type would describe an APT group's characteristics?",
              options: ["Indicator", "Malware", "Threat-Actor", "Attack-Pattern"],
              correct: 2,
              explanation: "The Threat-Actor STIX object describes the characteristics, motivations, and capabilities of APT groups."
            }
          ]
        }
      },
      {
        title: "Compliance Framework Mapping",
        description: "Map security controls across multiple compliance frameworks including SOX, HIPAA, and PCI DSS.",
        type: "scenario",
        domainId: 5,
        difficulty: "intermediate",
        estimatedTime: 30,
        xpReward: 300,
        content: {
          background: "Your organization operates in multiple industries requiring compliance with SOX, HIPAA, and PCI DSS regulations simultaneously.",
          scenario: "Create a control mapping strategy that efficiently addresses overlapping requirements across multiple compliance frameworks.",
          questions: [
            {
              question: "Which compliance framework primarily addresses financial reporting controls?",
              options: ["HIPAA", "PCI DSS", "SOX", "GDPR"],
              correct: 2,
              explanation: "The Sarbanes-Oxley Act (SOX) focuses on financial reporting accuracy and internal controls for public companies."
            },
            {
              question: "What is the main focus of PCI DSS requirements?",
              options: ["Healthcare data", "Financial reporting", "Credit card data protection", "Personal privacy"],
              correct: 2,
              explanation: "PCI DSS (Payment Card Industry Data Security Standard) specifically protects credit card transaction data."
            },
            {
              question: "Which approach is most efficient for multi-framework compliance?",
              options: ["Separate controls for each framework", "Common control framework with mapping", "Choose one primary framework", "Outsource all compliance"],
              correct: 1,
              explanation: "A common control framework mapped to multiple standards reduces redundancy and improves efficiency."
            }
          ]
        }
      }
    ];

    scenariosData.forEach((scenario, index) => {
      const scenarioRecord: Scenario = { ...scenario, id: index + 1 };
      this.scenarios.set(index + 1, scenarioRecord);
    });
    this.currentScenarioId = 21;

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

export const storage = new SimpleStorage();
