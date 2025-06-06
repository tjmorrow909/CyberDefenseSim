import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Trophy, Target } from "lucide-react";
import { Link } from "wouter";

export default function Domain() {
  const { id } = useParams();
  const domainId = parseInt(id || "1");

  const { data: domains } = useQuery({
    queryKey: ["/api/domains"],
  });

  const { data: domain } = useQuery({
    queryKey: [`/api/domains/${domainId}`],
    enabled: !!domainId,
  });

  const { data: scenarios } = useQuery({
    queryKey: [`/api/scenarios?domainId=${domainId}`],
    enabled: !!domainId,
  });

  const { data: userProgress } = useQuery({
    queryKey: [`/api/users/1/progress/${domainId}`],
    enabled: !!domainId,
  });

  if (!domain || !scenarios) {
    return (
      <div className="flex min-h-screen">
        <div className="w-64 bg-card shadow-lg border-r border-border">
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </div>
        <div className="flex-1 ml-64">
          <div className="p-6">
            <div className="h-8 bg-muted rounded mb-4 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded animate-pulse"></div>
              <div className="h-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab': return 'bg-red-100 text-red-800';
      case 'scenario': return 'bg-purple-100 text-purple-800';
      case 'challenge': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar domains={domains || []} />
      
      <div className="flex-1 ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border p-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{domain.name}</h1>
              <p className="text-muted-foreground">{domain.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Exam Weight</div>
              <div className="text-lg font-bold text-foreground">{domain.examPercentage}%</div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your learning progress in this domain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {userProgress?.progress || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion</div>
                  <Progress value={userProgress?.progress || 0} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {userProgress?.questionsCompleted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Questions Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">
                    {userProgress ? Math.round((userProgress.questionsCorrect / Math.max(userProgress.questionsCompleted, 1)) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {userProgress ? Math.round(userProgress.timeSpent / 60 * 10) / 10 : 0}h
                  </div>
                  <div className="text-sm text-muted-foreground">Study Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenarios Grid */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Available Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario: any) => (
                <Link key={scenario.id} href={`/scenario/${scenario.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-border hover:border-primary/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <Badge className={getTypeColor(scenario.type)}>
                            {scenario.type}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(scenario.difficulty)}`}></div>
                            <span className="text-xs text-muted-foreground capitalize">
                              {scenario.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-accent font-medium">+{scenario.xpReward} XP</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{scenario.title}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{scenario.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>Domain {scenario.domainId}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
