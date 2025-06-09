import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, Network, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

interface Scenario {
  id: number;
  title: string;
  description: string;
  type: string;
  domainId: number;
  difficulty: string;
  estimatedTime: number;
  xpReward: number;
  content: {
    background: string;
    scenario: string;
    codeExample?: string;
  };
  domainName: string;
}

interface RecommendedActivitiesProps {
  scenarios: Scenario[];
}

export default function RecommendedActivities({ scenarios }: RecommendedActivitiesProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'scenario': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'challenge': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string, title: string) => {
    if (title.toLowerCase().includes('sql')) return <Database className="w-6 h-6" />;
    if (title.toLowerCase().includes('network')) return <Network className="w-6 h-6" />;
    return <ShieldCheck className="w-6 h-6" />;
  };

  const getHoverBorderColor = (type: string) => {
    switch (type) {
      case 'lab': return 'hover:border-red-300';
      case 'scenario': return 'hover:border-purple-300';
      case 'challenge': return 'hover:border-green-300';
      default: return 'hover:border-gray-300';
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'lab': return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'scenario': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'challenge': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getArrowHoverColor = (type: string) => {
    switch (type) {
      case 'lab': return 'group-hover:text-red-600';
      case 'scenario': return 'group-hover:text-purple-600';
      case 'challenge': return 'group-hover:text-green-600';
      default: return 'group-hover:text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recommended for You</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Link key={scenario.id} href={`/scenario/${scenario.id}`}>
              <div className={`group cursor-pointer border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 ${getHoverBorderColor(scenario.type)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconBgColor(scenario.type)}`}>
                    {getTypeIcon(scenario.type, scenario.title)}
                  </div>
                  <Badge className={getTypeColor(scenario.type)}>
                    {scenario.type}
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{scenario.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{scenario.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Domain {scenario.domainId} • {scenario.estimatedTime} min
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-accent font-medium">+{scenario.xpReward} XP</span>
                    <ArrowRight className={`w-4 h-4 text-muted-foreground transition-colors ${getArrowHoverColor(scenario.type)}`} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {scenarios.length === 0 && (
          <div className="text-center py-12">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No recommendations available</h3>
            <p className="text-muted-foreground">Complete more activities to get personalized recommendations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
