// This file contains cybersecurity-related data and utilities
// for the training application

export const securityDomains = [
  {
    id: 1,
    name: 'General Security Concepts',
    description: 'Fundamental security principles and concepts',
    examPercentage: 12,
    topics: [
      'CIA Triad',
      'Non-repudiation',
      'Authentication methods',
      'Authorization models',
      'Security controls',
      'Risk management',
    ],
  },
  {
    id: 2,
    name: 'Threats, Vulnerabilities & Mitigations',
    description: 'Understanding security threats and how to mitigate them',
    examPercentage: 22,
    topics: [
      'Malware types',
      'Social engineering',
      'Application attacks',
      'Network attacks',
      'Threat intelligence',
      'Vulnerability management',
    ],
  },
  {
    id: 3,
    name: 'Security Architecture',
    description: 'Designing secure systems and infrastructure',
    examPercentage: 18,
    topics: [
      'Network security',
      'Secure protocols',
      'Endpoint security',
      'Cloud security',
      'Infrastructure security',
      'Secure coding',
    ],
  },
  {
    id: 4,
    name: 'Security Operations',
    description: 'Managing security operations and incident response',
    examPercentage: 28,
    topics: [
      'Security monitoring',
      'Incident response',
      'Digital forensics',
      'SIEM/SOAR',
      'Threat hunting',
      'Business continuity',
    ],
  },
  {
    id: 5,
    name: 'Security Program Management',
    description: 'Governance, risk management, and compliance',
    examPercentage: 20,
    topics: [
      'Risk assessment',
      'Compliance frameworks',
      'Security policies',
      'Security awareness',
      'Third-party management',
      'Data governance',
    ],
  },
];

export const threatTypes = [
  'Malware',
  'Ransomware',
  'Phishing',
  'Social Engineering',
  'SQL Injection',
  'Cross-Site Scripting (XSS)',
  'Denial of Service (DoS)',
  'Man-in-the-Middle',
  'Zero-day exploits',
  'Advanced Persistent Threats (APT)',
];

export const securityControls = [
  {
    type: 'Administrative',
    examples: ['Policies', 'Procedures', 'Training', 'Background checks'],
  },
  {
    type: 'Technical',
    examples: ['Firewalls', 'Encryption', 'Access controls', 'Antivirus'],
  },
  {
    type: 'Physical',
    examples: ['Locks', 'Guards', 'Surveillance', 'Environmental controls'],
  },
];

export const incidentResponsePhases = [
  'Preparation',
  'Identification',
  'Containment',
  'Eradication',
  'Recovery',
  'Lessons Learned',
];

export const cryptographyTypes = [
  {
    name: 'Symmetric',
    description: 'Same key for encryption and decryption',
    examples: ['AES', 'DES', '3DES'],
  },
  {
    name: 'Asymmetric',
    description: 'Different keys for encryption and decryption',
    examples: ['RSA', 'ECC', 'Diffie-Hellman'],
  },
  {
    name: 'Hashing',
    description: 'One-way function for data integrity',
    examples: ['SHA-256', 'MD5', 'SHA-3'],
  },
];

export const networkSecurityTools = [
  'Firewalls',
  'Intrusion Detection Systems (IDS)',
  'Intrusion Prevention Systems (IPS)',
  'Virtual Private Networks (VPN)',
  'Network Access Control (NAC)',
  'Security Information and Event Management (SIEM)',
  'Network Segmentation',
  'Data Loss Prevention (DLP)',
];

export const complianceFrameworks = [
  {
    name: 'NIST Cybersecurity Framework',
    description: 'Framework for improving critical infrastructure cybersecurity',
  },
  {
    name: 'ISO 27001',
    description: 'International standard for information security management',
  },
  {
    name: 'SOX',
    description: 'Sarbanes-Oxley Act for financial reporting',
  },
  {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
  },
  {
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
  },
  {
    name: 'GDPR',
    description: 'General Data Protection Regulation',
  },
];

// Utility functions for cybersecurity calculations
export const calculateRiskScore = (probability: number, impact: number): number => {
  return probability * impact;
};

export const getRiskLevel = (riskScore: number): string => {
  if (riskScore >= 15) return 'Critical';
  if (riskScore >= 10) return 'High';
  if (riskScore >= 5) return 'Medium';
  return 'Low';
};

export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const validatePasswordStrength = (
  password: string
): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 2;
  else feedback.push('Password should be at least 8 characters long');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[!@#$%^&*]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  return { score, feedback };
};
