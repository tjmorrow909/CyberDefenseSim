import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Bug, 
  Zap, 
  Globe, 
  Users, 
  Database, 
  Network,
  ArrowLeft,
  Eye,
  Target,
  Skull,
  Lock,
  Unlock,
  FileX,
  Mail,
  Phone,
  CreditCard,
  Wifi
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ThreatCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  severity: "Critical" | "High" | "Medium" | "Low";
  examples: string[];
  mitigations: string[];
  realWorldExample: {
    title: string;
    description: string;
    impact: string;
    year: string;
  };
}

interface AttackVector {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  steps: string[];
  prevention: string[];
  tools: string[];
}

export default function ThreatsAttacks() {
  const { user } = useAuth();
  const [selectedThreat, setSelectedThreat] = useState<ThreatCategory | null>(null);
  const [selectedAttack, setSelectedAttack] = useState<AttackVector | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  // Comprehensive threat categories based on CompTIA Security+ curriculum
  const threatCategories: ThreatCategory[] = [
    {
      id: "malware",
      name: "Malware",
      description: "Malicious software designed to damage, disrupt, or gain unauthorized access to systems",
      icon: <Bug className="w-6 h-6" />,
      severity: "Critical",
      examples: ["Viruses", "Worms", "Trojans", "Ransomware", "Spyware", "Adware", "Rootkits", "Keyloggers"],
      mitigations: ["Antivirus software", "Regular updates", "Email filtering", "User education", "Application whitelisting"],
      realWorldExample: {
        title: "WannaCry Ransomware (2017)",
        description: "Global ransomware attack that infected over 300,000 computers across 150+ countries",
        impact: "Disrupted healthcare systems, caused billions in damages, affected critical infrastructure",
        year: "2017"
      }
    },
    {
      id: "social-engineering",
      name: "Social Engineering",
      description: "Psychological manipulation techniques to trick people into divulging confidential information",
      icon: <Users className="w-6 h-6" />,
      severity: "High",
      examples: ["Phishing", "Spear phishing", "Whaling", "Vishing", "Smishing", "Pretexting", "Baiting", "Tailgating"],
      mitigations: ["Security awareness training", "Email security", "Verification procedures", "Access controls"],
      realWorldExample: {
        title: "Target Data Breach (2013)",
        description: "Attackers used spear phishing to compromise HVAC vendor credentials",
        impact: "40 million credit card numbers stolen, $162 million in costs",
        year: "2013"
      }
    },
    {
      id: "application-attacks",
      name: "Application Attacks",
      description: "Attacks targeting vulnerabilities in software applications and web services",
      icon: <Globe className="w-6 h-6" />,
      severity: "High",
      examples: ["SQL Injection", "Cross-Site Scripting (XSS)", "CSRF", "Directory Traversal", "Buffer Overflow", "Code Injection"],
      mitigations: ["Input validation", "Parameterized queries", "WAF", "Secure coding practices", "Regular testing"],
      realWorldExample: {
        title: "Equifax Data Breach (2017)",
        description: "Exploited Apache Struts vulnerability affecting 147 million people",
        impact: "Personal data of 147 million consumers exposed, $4 billion in costs",
        year: "2017"
      }
    },
    {
      id: "network-attacks",
      name: "Network Attacks",
      description: "Attacks targeting network infrastructure and communication protocols",
      icon: <Network className="w-6 h-6" />,
      severity: "High",
      examples: ["DDoS", "Man-in-the-Middle", "ARP Spoofing", "DNS Poisoning", "Packet Sniffing", "Session Hijacking"],
      mitigations: ["Network segmentation", "Encryption", "IDS/IPS", "Firewalls", "VPNs", "Network monitoring"],
      realWorldExample: {
        title: "Dyn DNS Attack (2016)",
        description: "Massive DDoS attack using Mirai botnet targeting DNS infrastructure",
        impact: "Major websites including Twitter, Netflix, Reddit became inaccessible",
        year: "2016"
      }
    },
    {
      id: "physical-attacks",
      name: "Physical Attacks",
      description: "Attacks requiring physical access to systems, devices, or facilities",
      icon: <Lock className="w-6 h-6" />,
      severity: "Medium",
      examples: ["USB attacks", "Card cloning", "Shoulder surfing", "Dumpster diving", "Lock picking", "Tailgating"],
      mitigations: ["Physical security controls", "Device encryption", "Clean desk policy", "Access controls", "Surveillance"],
      realWorldExample: {
        title: "RSA SecurID Breach (2011)",
        description: "Physical theft of RSA tokens compromised two-factor authentication",
        impact: "Millions of SecurID tokens compromised, affecting major corporations",
        year: "2011"
      }
    },
    {
      id: "wireless-attacks",
      name: "Wireless Attacks",
      description: "Attacks targeting wireless networks and communication protocols",
      icon: <Wifi className="w-6 h-6" />,
      severity: "Medium",
      examples: ["Evil Twin", "WPS attacks", "Bluetooth attacks", "Jamming", "Wardriving", "Rogue Access Points"],
      mitigations: ["WPA3 encryption", "Network monitoring", "MAC filtering", "Disable WPS", "Regular audits"],
      realWorldExample: {
        title: "KRACK Attack (2017)",
        description: "Key Reinstallation Attack against WPA2 protocol",
        impact: "Affected billions of devices using WPA2, allowed traffic interception",
        year: "2017"
      }
    }
  ];

  const attackVectors: AttackVector[] = [
    {
      id: "sql-injection",
      name: "SQL Injection",
      description: "Inserting malicious SQL code into application queries to manipulate databases",
      category: "Application Attack",
      difficulty: "Intermediate",
      steps: [
        "Identify input fields that interact with database",
        "Test for SQL injection vulnerabilities",
        "Craft malicious SQL payload",
        "Execute payload to extract or modify data",
        "Escalate privileges if possible"
      ],
      prevention: [
        "Use parameterized queries/prepared statements",
        "Implement input validation and sanitization",
        "Apply principle of least privilege to database accounts",
        "Use stored procedures where appropriate",
        "Regular security testing and code reviews"
      ],
      tools: ["SQLMap", "Burp Suite", "OWASP ZAP", "Havij", "jSQL Injection"]
    },
    {
      id: "phishing",
      name: "Phishing Attack",
      description: "Fraudulent attempt to obtain sensitive information by impersonating trustworthy entities",
      category: "Social Engineering",
      difficulty: "Beginner",
      steps: [
        "Research target organization and employees",
        "Create convincing fake website or email",
        "Send phishing messages to targets",
        "Collect credentials or install malware",
        "Use obtained access for further attacks"
      ],
      prevention: [
        "Security awareness training",
        "Email filtering and authentication (SPF, DKIM, DMARC)",
        "Multi-factor authentication",
        "Regular phishing simulations",
        "Incident response procedures"
      ],
      tools: ["Gophish", "King Phisher", "Social-Engineer Toolkit", "Evilginx", "Modlishka"]
    },
    {
      id: "ddos",
      name: "DDoS Attack",
      description: "Overwhelming target systems with traffic from multiple sources to cause service disruption",
      category: "Network Attack",
      difficulty: "Advanced",
      steps: [
        "Build or rent botnet infrastructure",
        "Identify target vulnerabilities and capacity",
        "Launch coordinated attack from multiple sources",
        "Monitor attack effectiveness",
        "Adjust attack parameters to maintain impact"
      ],
      prevention: [
        "DDoS protection services",
        "Rate limiting and traffic shaping",
        "Network redundancy and load balancing",
        "Incident response planning",
        "ISP-level filtering"
      ],
      tools: ["LOIC", "HOIC", "Slowloris", "Hping3", "Stress testing tools"]
    }
  ];

  const { data: userProgress } = useQuery({
    queryKey: [`/api/users/${user?.id}/progress/2`], // Domain 2: Threats, Vulnerabilities & Mitigations
    enabled: !!user?.id,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-500 text-white";
      case "High": return "bg-orange-500 text-white";
      case "Medium": return "bg-yellow-500 text-black";
      case "Low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Advanced": return "bg-red-500 text-white";
      case "Intermediate": return "bg-yellow-500 text-black";
      case "Beginner": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const simulateAttack = (attackId: string) => {
    setActiveSimulation(attackId);
    // Simulate attack progress
    setTimeout(() => {
      setActiveSimulation(null);
    }, 3000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Threats & Attacks</h1>
                <p className="text-muted-foreground">Learn about cybersecurity threats and attack vectors</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Domain Progress</div>
                <div className="font-semibold">{userProgress?.progress || 0}%</div>
              </div>
              <Progress value={userProgress?.progress || 0} className="w-24" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Tabs defaultValue="threats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="threats">Threat Categories</TabsTrigger>
              <TabsTrigger value="attacks">Attack Vectors</TabsTrigger>
              <TabsTrigger value="simulation">Attack Simulation</TabsTrigger>
              <TabsTrigger value="defense">Defense Strategies</TabsTrigger>
            </TabsList>

            <TabsContent value="threats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {threatCategories.map((threat) => (
                  <Card
                    key={threat.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {threat.icon}
                          <CardTitle className="text-lg">{threat.name}</CardTitle>
                        </div>
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                      </div>
                      <CardDescription>{threat.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Common Examples:</h4>
                          <div className="flex flex-wrap gap-1">
                            {threat.examples.slice(0, 3).map((example, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {example}
                              </Badge>
                            ))}
                            {threat.examples.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{threat.examples.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedThreat && (
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-3">
                        {selectedThreat.icon}
                        <span>{selectedThreat.name} - Detailed Analysis</span>
                      </CardTitle>
                      <Button variant="outline" onClick={() => setSelectedThreat(null)}>
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Threat Examples</h3>
                        <div className="space-y-2">
                          {selectedThreat.examples.map((example, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">Mitigation Strategies</h3>
                        <div className="space-y-2">
                          {selectedThreat.mitigations.map((mitigation, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{mitigation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <Target className="w-4 h-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Real-World Example: {selectedThreat.realWorldExample.title}</h4>
                          <p>{selectedThreat.realWorldExample.description}</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Impact:</strong> {selectedThreat.realWorldExample.impact}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="attacks" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attackVectors.map((attack) => (
                  <Card
                    key={attack.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => setSelectedAttack(attack)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{attack.name}</CardTitle>
                        <Badge className={getDifficultyColor(attack.difficulty)}>
                          {attack.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>{attack.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{attack.category}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Key Tools:</h4>
                          <div className="flex flex-wrap gap-1">
                            {attack.tools.slice(0, 2).map((tool, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                            {attack.tools.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{attack.tools.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedAttack && (
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedAttack.name} - Attack Methodology</CardTitle>
                      <Button variant="outline" onClick={() => setSelectedAttack(null)}>
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center space-x-2">
                          <Skull className="w-4 h-4 text-red-500" />
                          <span>Attack Steps</span>
                        </h3>
                        <div className="space-y-3">
                          {selectedAttack.steps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>Prevention Methods</span>
                        </h3>
                        <div className="space-y-2">
                          {selectedAttack.prevention.map((prevention, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">{prevention}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Common Tools & Techniques</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAttack.tools.map((tool, index) => (
                          <Badge key={index} variant="outline">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="simulation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attackVectors.map((attack) => (
                  <Card key={attack.id} className="relative">
                    <CardHeader>
                      <CardTitle className="text-lg">{attack.name} Simulation</CardTitle>
                      <CardDescription>
                        Practice defending against {attack.name.toLowerCase()} in a safe environment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(attack.difficulty)}>
                          {attack.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{attack.category}</span>
                      </div>

                      {activeSimulation === attack.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="text-sm">Simulating attack...</span>
                          </div>
                          <Progress value={66} />
                          <Alert>
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription>
                              Attack simulation in progress. Monitor your defenses!
                            </AlertDescription>
                          </Alert>
                        </div>
                      ) : (
                        <Button
                          onClick={() => simulateAttack(attack.id)}
                          className="w-full"
                          variant="outline"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start Simulation
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Attack Simulation Lab</span>
                  </CardTitle>
                  <CardDescription>
                    Interactive environment to practice identifying and responding to cyber attacks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Shield className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Safe Learning Environment:</strong> All simulations run in isolated containers
                      and cannot affect real systems. Perfect for hands-on learning without risk.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Bug className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <h3 className="font-semibold">Malware Analysis</h3>
                      <p className="text-sm text-muted-foreground">Analyze malware samples safely</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Network className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-semibold">Network Attacks</h3>
                      <p className="text-sm text-muted-foreground">Practice network defense</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                      <h3 className="font-semibold">Social Engineering</h3>
                      <p className="text-sm text-muted-foreground">Recognize manipulation tactics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="defense" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span>Defense in Depth</span>
                    </CardTitle>
                    <CardDescription>
                      Layered security approach to protect against multiple attack vectors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { layer: "Perimeter Security", description: "Firewalls, IDS/IPS, DMZ" },
                        { layer: "Network Security", description: "Segmentation, VLANs, NAC" },
                        { layer: "Endpoint Security", description: "Antivirus, EDR, Device encryption" },
                        { layer: "Application Security", description: "WAF, Code review, Input validation" },
                        { layer: "Data Security", description: "Encryption, DLP, Access controls" },
                        { layer: "User Security", description: "Training, MFA, Privilege management" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{item.layer}</h4>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span>Incident Response</span>
                    </CardTitle>
                    <CardDescription>
                      Structured approach to handling security incidents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { phase: "Preparation", description: "Plans, tools, training" },
                        { phase: "Identification", description: "Detect and analyze incidents" },
                        { phase: "Containment", description: "Limit damage and prevent spread" },
                        { phase: "Eradication", description: "Remove threats from systems" },
                        { phase: "Recovery", description: "Restore normal operations" },
                        { phase: "Lessons Learned", description: "Improve processes and defenses" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{item.phase}</h4>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-purple-500" />
                    <span>Security Controls Framework</span>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive security controls organized by type and function
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 text-green-600">Preventive Controls</h3>
                      <div className="space-y-2">
                        {[
                          "Access controls",
                          "Firewalls",
                          "Encryption",
                          "Security training",
                          "Antivirus software",
                          "Physical barriers"
                        ].map((control, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm">{control}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-blue-600">Detective Controls</h3>
                      <div className="space-y-2">
                        {[
                          "IDS/IPS",
                          "SIEM systems",
                          "Log monitoring",
                          "Vulnerability scans",
                          "Security audits",
                          "Surveillance cameras"
                        ].map((control, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm">{control}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-orange-600">Corrective Controls</h3>
                      <div className="space-y-2">
                        {[
                          "Incident response",
                          "Backup systems",
                          "Patch management",
                          "System recovery",
                          "Quarantine procedures",
                          "Emergency procedures"
                        ].map((control, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-sm">{control}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
