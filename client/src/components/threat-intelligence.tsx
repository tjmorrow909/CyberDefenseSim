import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Globe, Users, Target, Calendar, ExternalLink } from 'lucide-react';

interface ThreatActor {
  name: string;
  aliases: string[];
  sophistication: string;
  motivation: string;
  targets: string[];
  techniques: string[];
  lastActive: string;
}

interface ThreatIndicator {
  type: string;
  value: string;
  confidence: 'High' | 'Medium' | 'Low';
  source: string;
  firstSeen: string;
}

export default function ThreatIntelligence() {
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null);

  // STIX-based threat actor data from CompTIA Security+ content
  const threatActors: ThreatActor[] = [
    {
      name: 'Evil Maid, Inc',
      aliases: ['Local USB threats', 'Hotel Room Attackers'],
      sophistication: 'Intermediate',
      motivation: 'Organizational-gain',
      targets: ['Hotel guests', 'Business travelers', 'Corporate devices'],
      techniques: ['Physical access', 'USB attacks', 'Device tampering'],
      lastActive: '2024-01-15',
    },
    {
      name: 'APT Shadow Dragon',
      aliases: ['Dragon Force', 'Shadow Group'],
      sophistication: 'Advanced',
      motivation: 'Espionage',
      targets: ['Government agencies', 'Defense contractors', 'Critical infrastructure'],
      techniques: ['Spear phishing', 'Zero-day exploits', 'Living off the land'],
      lastActive: '2024-01-20',
    },
    {
      name: 'Ransomware Collective',
      aliases: ['Crypto Lockers', 'Data Hostage Group'],
      sophistication: 'Intermediate',
      motivation: 'Financial',
      targets: ['Healthcare', 'Education', 'Municipal services'],
      techniques: ['Ransomware deployment', 'Double extortion', 'RDP brute force'],
      lastActive: '2024-01-22',
    },
  ];

  const indicators: ThreatIndicator[] = [
    {
      type: 'IP Address',
      value: '192.168.100.5',
      confidence: 'High',
      source: 'CISA Alerts',
      firstSeen: '2024-01-18',
    },
    {
      type: 'Domain',
      value: 'suspicious-update.com',
      confidence: 'Medium',
      source: 'Commercial Feed',
      firstSeen: '2024-01-20',
    },
    {
      type: 'File Hash',
      value: 'd41d8cd98f00b204e9800998ecf8427e',
      confidence: 'High',
      source: 'Internal Analysis',
      firstSeen: '2024-01-19',
    },
    {
      type: 'Email',
      value: 'security@g0ogle.com',
      confidence: 'Medium',
      source: 'Phishing Campaign',
      firstSeen: '2024-01-21',
    },
  ];

  const getSophisticationColor = (level: string) => {
    switch (level) {
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Basic':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Threat Intelligence Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="actors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="actors">Threat Actors</TabsTrigger>
              <TabsTrigger value="indicators">IOCs</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="actors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {threatActors.map((actor, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedActor(actor)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">{actor.name}</h3>
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Badge className={getSophisticationColor(actor.sophistication)}>{actor.sophistication}</Badge>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            <strong>Motivation:</strong> {actor.motivation}
                          </p>
                          <p>
                            <strong>Last Active:</strong> {actor.lastActive}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {actor.aliases.slice(0, 2).map((alias, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {alias}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedActor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedActor.name} - Detailed Profile</span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedActor(null)}>
                        Close
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Aliases</h4>
                        <div className="space-y-1">
                          {selectedActor.aliases.map((alias, i) => (
                            <Badge key={i} variant="outline">
                              {alias}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Targets</h4>
                        <div className="space-y-1">
                          {selectedActor.targets.map((target, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Target className="w-3 h-3" />
                              <span className="text-sm">{target}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Techniques & Tactics</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedActor.techniques.map((technique, i) => (
                          <Badge
                            key={i}
                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          >
                            {technique}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="indicators" className="space-y-4">
              <div className="space-y-3">
                {indicators.map((indicator, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{indicator.type}</Badge>
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{indicator.value}</code>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>First seen: {indicator.firstSeen}</span>
                            </span>
                            <span>Source: {indicator.source}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getConfidenceColor(indicator.confidence)}`}></div>
                          <span className="text-sm font-medium">{indicator.confidence}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Active Campaign Monitoring</h3>
                  <p className="text-muted-foreground mb-4">
                    Real-time campaign tracking requires external threat intelligence feeds and API integrations.
                  </p>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>Connect Threat Feeds</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
