
import Sidebar from "@/components/sidebar";
import VulnerabilityScanner from "@/components/vulnerability-scanner";
import ThreatIntelligence from "@/components/threat-intelligence";
import CryptographyLab from "@/components/cryptography-lab";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Search, Globe, Key, Terminal, Network, FileSearch } from "lucide-react";
import { Link } from "wouter";

export default function SecurityTools() {
  const { data: _domains } = useQuery({
    queryKey: ["/api/domains"],
  });

  const tools = [
    {
      id: "scanner",
      name: "Vulnerability Scanner",
      description: "Nessus-style vulnerability assessment tool",
      icon: <Search className="w-5 h-5" />,
      category: "Assessment"
    },
    {
      id: "threat-intel",
      name: "Threat Intelligence",
      description: "STIX/TAXII threat actor and IOC analysis",
      icon: <Globe className="w-5 h-5" />,
      category: "Intelligence"
    },
    {
      id: "crypto-lab",
      name: "Cryptography Lab",
      description: "Classical cipher analysis and implementation",
      icon: <Key className="w-5 h-5" />,
      category: "Cryptography"
    },
    {
      id: "network-tools",
      name: "Network Analysis",
      description: "Network security testing tools",
      icon: <Network className="w-5 h-5" />,
      category: "Network",
      comingSoon: true
    },
    {
      id: "forensics",
      name: "Digital Forensics",
      description: "Evidence collection and analysis",
      icon: <FileSearch className="w-5 h-5" />,
      category: "Forensics",
      comingSoon: true
    },
    {
      id: "pentest",
      name: "Penetration Testing",
      description: "Ethical hacking and exploitation tools",
      icon: <Terminal className="w-5 h-5" />,
      category: "Testing",
      comingSoon: true
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar domains={[]} />
      
      <div className="flex-1 ml-64 min-h-screen">
        <header className="bg-card shadow-sm border-b border-border p-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Security Tools Laboratory</h1>
              <p className="text-muted-foreground">Interactive cybersecurity tools for hands-on learning</p>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scanner">Vulnerability Scanner</TabsTrigger>
              <TabsTrigger value="threat-intel">Threat Intelligence</TabsTrigger>
              <TabsTrigger value="crypto-lab">Cryptography Lab</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Available Security Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                      <Card key={tool.id} className="relative">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  {tool.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground">{tool.name}</h3>
                                  <Badge variant="outline">{tool.category}</Badge>
                                </div>
                              </div>
                              {tool.comingSoon && (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                            {!tool.comingSoon && (
                              <Button 
                                className="w-full" 
                                onClick={() => {
                                  const tabElement = document.querySelector(`[value="${tool.id}"]`) as HTMLElement;
                                  tabElement?.click();
                                }}
                              >
                                Launch Tool
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Vulnerability Assessment</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Understand CVSS scoring methodology</li>
                        <li>• Practice vulnerability identification</li>
                        <li>• Learn remediation prioritization</li>
                        <li>• Analyze scan results effectively</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Threat Intelligence</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Analyze threat actor profiles</li>
                        <li>• Understand STIX/TAXII formats</li>
                        <li>• Process indicators of compromise</li>
                        <li>• Map attack patterns and techniques</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Cryptography</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Implement classical ciphers</li>
                        <li>• Understand cryptanalysis techniques</li>
                        <li>• Practice key management concepts</li>
                        <li>• Analyze encryption strengths/weaknesses</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Practical Skills</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Hands-on tool experience</li>
                        <li>• Real-world scenario application</li>
                        <li>• Security testing methodologies</li>
                        <li>• Industry-standard practices</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scanner">
              <VulnerabilityScanner />
            </TabsContent>

            <TabsContent value="threat-intel">
              <ThreatIntelligence />
            </TabsContent>

            <TabsContent value="crypto-lab">
              <CryptographyLab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}