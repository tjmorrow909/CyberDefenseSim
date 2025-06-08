-- Seed data for CyberDefense Simulator
-- Insert initial domains, scenarios, and achievements

-- Insert domains (CompTIA Security+ domains)
INSERT INTO "domains" ("id", "name", "description", "exam_percentage", "color", "icon") VALUES
(1, 'General Security Concepts', 'Fundamental security principles and concepts', 12, '#3B82F6', 'Shield'),
(2, 'Threats, Vulnerabilities & Mitigations', 'Threat landscape and security controls', 22, '#EF4444', 'AlertTriangle'),
(3, 'Security Architecture', 'Secure design principles and implementation', 18, '#10B981', 'Building'),
(4, 'Security Operations', 'Incident response and security monitoring', 28, '#F59E0B', 'Activity'),
(5, 'Governance, Risk and Compliance', 'Risk management and compliance frameworks', 20, '#8B5CF6', 'FileText')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  exam_percentage = EXCLUDED.exam_percentage,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- Insert comprehensive scenarios
INSERT INTO "scenarios" ("id", "title", "description", "type", "domain_id", "difficulty", "estimated_time", "xp_reward", "content") VALUES
(1, 'Network Vulnerability Assessment', 'Conduct a comprehensive vulnerability scan using industry-standard tools', 'lab', 2, 'intermediate', 45, 150, '{
  "background": "Your organization has requested a security assessment of their network infrastructure to identify potential vulnerabilities before they can be exploited by attackers.",
  "scenario": "You are tasked with performing a comprehensive vulnerability assessment of the target network. Use appropriate scanning tools to identify open ports, services, and potential security weaknesses.",
  "objectives": [
    "Perform network discovery to identify live hosts",
    "Conduct port scanning to identify open services",
    "Run vulnerability scans to identify security weaknesses",
    "Analyze and prioritize findings based on risk level",
    "Generate a comprehensive report with remediation recommendations"
  ],
  "tools": ["Nmap", "Nessus", "OpenVAS", "Nikto"],
  "codeExample": "nmap -sV -sC -O target_network/24",
  "questions": [
    {
      "id": 1,
      "question": "What is the primary purpose of a vulnerability assessment?",
      "options": [
        "To exploit vulnerabilities in the system",
        "To identify and catalog security weaknesses",
        "To install security patches",
        "To monitor network traffic"
      ],
      "correct": 1,
      "explanation": "A vulnerability assessment aims to identify and catalog security weaknesses in systems and networks before they can be exploited by attackers."
    },
    {
      "id": 2,
      "question": "Which Nmap flag is used for version detection?",
      "options": ["-sS", "-sV", "-sU", "-sP"],
      "correct": 1,
      "explanation": "The -sV flag enables version detection, which attempts to determine the version of services running on open ports."
    }
  ]
}'),

(2, 'Incident Response Simulation', 'Handle a simulated security incident from detection to resolution', 'scenario', 4, 'advanced', 60, 200, '{
  "background": "Your organization has detected suspicious activity on the network. Multiple users are reporting slow system performance, and the security team has identified unusual network traffic patterns.",
  "scenario": "As the incident response team leader, you must coordinate the response to this potential security incident following established procedures.",
  "objectives": [
    "Assess the scope and severity of the incident",
    "Contain the threat to prevent further damage",
    "Collect and preserve evidence for analysis",
    "Eradicate the threat from affected systems",
    "Recover normal operations safely",
    "Document lessons learned for future improvements"
  ],
  "phases": ["Preparation", "Identification", "Containment", "Eradication", "Recovery", "Lessons Learned"],
  "questions": [
    {
      "id": 1,
      "question": "What is the first step in the incident response process?",
      "options": [
        "Containment",
        "Identification", 
        "Preparation",
        "Recovery"
      ],
      "correct": 2,
      "explanation": "Preparation is the first phase of incident response, involving planning, training, and establishing procedures before incidents occur."
    },
    {
      "id": 2,
      "question": "During which phase should evidence be collected and preserved?",
      "options": [
        "Preparation",
        "Identification and Containment",
        "Recovery",
        "Lessons Learned"
      ],
      "correct": 1,
      "explanation": "Evidence should be collected and preserved during the Identification and Containment phases to support investigation and potential legal proceedings."
    }
  ]
}'),

(3, 'Cryptography Implementation Lab', 'Implement and analyze various cryptographic algorithms', 'lab', 3, 'intermediate', 50, 175, '{
  "background": "Understanding cryptographic principles is essential for implementing secure communications and data protection in modern systems.",
  "scenario": "You will implement various cryptographic algorithms and analyze their strengths and weaknesses in different scenarios.",
  "objectives": [
    "Implement classical cipher algorithms (Caesar, Vigenère)",
    "Understand symmetric vs asymmetric encryption",
    "Analyze cryptographic hash functions",
    "Implement digital signature verification",
    "Evaluate key management practices"
  ],
  "algorithms": ["Caesar Cipher", "AES", "RSA", "SHA-256", "HMAC"],
  "questions": [
    {
      "id": 1,
      "question": "What is the main advantage of asymmetric encryption over symmetric encryption?",
      "options": [
        "It is faster to compute",
        "It solves the key distribution problem",
        "It produces smaller ciphertext",
        "It is more secure against all attacks"
      ],
      "correct": 1,
      "explanation": "Asymmetric encryption solves the key distribution problem by using public and private key pairs, eliminating the need to securely share secret keys."
    },
    {
      "id": 2,
      "question": "Which cryptographic primitive provides data integrity?",
      "options": [
        "Symmetric encryption",
        "Asymmetric encryption",
        "Hash functions",
        "Key exchange protocols"
      ],
      "correct": 2,
      "explanation": "Hash functions provide data integrity by producing a fixed-size digest that changes if the input data is modified."
    }
  ]
}'),

(4, 'Social Engineering Defense', 'Learn to identify and defend against social engineering attacks', 'scenario', 2, 'beginner', 30, 100, '{
  "background": "Social engineering attacks exploit human psychology rather than technical vulnerabilities, making them one of the most effective attack vectors.",
  "scenario": "You will learn to identify various social engineering techniques and implement appropriate defenses to protect your organization.",
  "objectives": [
    "Identify common social engineering techniques",
    "Recognize phishing and spear-phishing attempts",
    "Understand pretexting and baiting attacks",
    "Implement security awareness training programs",
    "Establish verification procedures for sensitive requests"
  ],
  "techniques": ["Phishing", "Spear Phishing", "Pretexting", "Baiting", "Tailgating", "Quid Pro Quo"],
  "questions": [
    {
      "id": 1,
      "question": "What is the primary difference between phishing and spear phishing?",
      "options": [
        "Phishing uses email while spear phishing uses phone calls",
        "Spear phishing targets specific individuals or organizations",
        "Phishing is more sophisticated than spear phishing",
        "There is no difference between the two"
      ],
      "correct": 1,
      "explanation": "Spear phishing is a targeted form of phishing that focuses on specific individuals or organizations, often using personalized information to increase success rates."
    },
    {
      "id": 2,
      "question": "What is the most effective defense against social engineering attacks?",
      "options": [
        "Technical security controls only",
        "Security awareness training and education",
        "Firewalls and antivirus software",
        "Physical security measures"
      ],
      "correct": 1,
      "explanation": "Security awareness training and education are the most effective defenses against social engineering because these attacks target human behavior rather than technical systems."
    }
  ]
}'),

(5, 'Risk Assessment and Management', 'Conduct a comprehensive organizational risk assessment', 'scenario', 5, 'advanced', 75, 250, '{
  "background": "Effective risk management is crucial for protecting organizational assets and ensuring business continuity in the face of evolving threats.",
  "scenario": "You are tasked with conducting a comprehensive risk assessment for your organization and developing appropriate risk management strategies.",
  "objectives": [
    "Identify and catalog organizational assets",
    "Assess threats and vulnerabilities",
    "Calculate risk levels using quantitative and qualitative methods",
    "Develop risk treatment strategies",
    "Create risk monitoring and review processes",
    "Ensure compliance with relevant frameworks"
  ],
  "frameworks": ["NIST RMF", "ISO 27005", "FAIR", "OCTAVE"],
  "questions": [
    {
      "id": 1,
      "question": "In risk assessment, what does the formula Risk = Threat × Vulnerability × Impact represent?",
      "options": [
        "A quantitative risk calculation method",
        "A qualitative risk assessment approach",
        "The basic risk equation showing risk components",
        "A compliance requirement formula"
      ],
      "correct": 2,
      "explanation": "This formula represents the basic risk equation, showing that risk is a function of threats, vulnerabilities, and potential impact to the organization."
    },
    {
      "id": 2,
      "question": "What is the primary goal of risk treatment?",
      "options": [
        "To eliminate all risks",
        "To reduce risk to an acceptable level",
        "To transfer all risks to third parties",
        "To avoid all risky activities"
      ],
      "correct": 1,
      "explanation": "The primary goal of risk treatment is to reduce risk to an acceptable level that aligns with the organization''s risk tolerance and business objectives."
    }
  ]
}')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  domain_id = EXCLUDED.domain_id,
  difficulty = EXCLUDED.difficulty,
  estimated_time = EXCLUDED.estimated_time,
  xp_reward = EXCLUDED.xp_reward,
  content = EXCLUDED.content;

-- Insert achievements
INSERT INTO "achievements" ("id", "name", "description", "icon", "xp_reward", "criteria") VALUES
(1, 'First Steps', 'Complete your first scenario', 'Trophy', 50, '{"scenariosCompleted": 1}'),
(2, 'Security Novice', 'Complete 5 scenarios', 'Star', 100, '{"scenariosCompleted": 5}'),
(3, 'Security Expert', 'Complete 10 scenarios', 'Award', 200, '{"scenariosCompleted": 10}'),
(4, 'Domain Master', 'Achieve 100% progress in any domain', 'Crown', 300, '{"domainProgress": 100}'),
(5, 'Perfect Score', 'Score 100% on any scenario', 'Target', 150, '{"perfectScore": true}'),
(6, 'Speed Runner', 'Complete a scenario in under 15 minutes', 'Zap', 100, '{"fastCompletion": 15}'),
(7, 'Persistent Learner', 'Maintain a 7-day learning streak', 'Flame', 200, '{"streak": 7}'),
(8, 'Knowledge Seeker', 'Earn 1000 XP total', 'BookOpen', 250, '{"totalXP": 1000}'),
(9, 'Vulnerability Hunter', 'Complete all vulnerability assessment scenarios', 'Search', 300, '{"categoryComplete": "vulnerability"}'),
(10, 'Incident Commander', 'Complete all incident response scenarios', 'Shield', 300, '{"categoryComplete": "incident-response"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  xp_reward = EXCLUDED.xp_reward,
  criteria = EXCLUDED.criteria;

-- Reset sequences to ensure proper auto-increment
SELECT setval('domains_id_seq', (SELECT MAX(id) FROM domains));
SELECT setval('scenarios_id_seq', (SELECT MAX(id) FROM scenarios));
SELECT setval('achievements_id_seq', (SELECT MAX(id) FROM achievements));
