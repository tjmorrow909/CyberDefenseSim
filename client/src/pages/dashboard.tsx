import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import ProgressOverview from "@/components/progress-overview";
import RecommendedActivities from "@/components/recommended-activities";
import LearningStats from "@/components/learning-stats";
import { useAuth } from "@/hooks/useAuth";
import { Star, Flame } from "lucide-react";

interface DashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    xp: number;
    streak: number;
  };
  overallProgress: number;
  domains: Array<{
    id: number;
    name: string;
    description: string;
    examPercentage: number;
    progress: number;
    color: string;
    icon: string;
  }>;
  recentAchievements: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  recommendedScenarios: Array<{
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
  }>;
  stats: {
    accuracy: number;
    questionsCompleted: number;
    studyTime: number;
    weakestDomain: number | null;
  };
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: [`/api/users/${user?.id}/dashboard`],
    enabled: !!user?.id,
  });

  if (isLoading || !dashboardData) {
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded animate-pulse"></div>
              <div className="h-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Unable to load dashboard</h2>
          <p className="text-muted-foreground">
            Error loading data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar domains={dashboardData.domains} />
      
      <div className="flex-1 ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back, {dashboardData.user.firstName}!
              </h2>
              <p className="text-muted-foreground">Continue your cybersecurity journey</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* XP Display */}
              <div className="flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-lg">
                <Star className="w-4 h-4 text-accent" />
                <span className="font-medium">{dashboardData.user.xp.toLocaleString()} XP</span>
              </div>
              {/* Streak Counter */}
              <div className="flex items-center space-x-2 bg-secondary/10 px-4 py-2 rounded-lg">
                <Flame className="w-4 h-4 text-secondary" />
                <span className="font-medium">{dashboardData.user.streak} day streak</span>
              </div>
              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">
                    {dashboardData.user.firstName[0]}{dashboardData.user.lastName[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          <ProgressOverview 
            overallProgress={dashboardData.overallProgress}
            domains={dashboardData.domains}
            recentAchievements={dashboardData.recentAchievements}
          />
          
          <RecommendedActivities scenarios={dashboardData.recommendedScenarios} />
          
          <LearningStats stats={dashboardData.stats} />

          {/* Quick Action Buttons */}
          <div className="fixed bottom-6 right-6 space-y-3">
            <button className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            <button className="w-14 h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M12 14h0" />
              </svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
