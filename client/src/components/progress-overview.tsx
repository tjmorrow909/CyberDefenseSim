import { Shield, Flame, Bug } from "lucide-react";

interface Domain {
  id: number;
  name: string;
  examPercentage: number;
  progress: number;
  color: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface ProgressOverviewProps {
  overallProgress: number;
  domains: Domain[];
  recentAchievements: Achievement[];
}

export default function ProgressOverview({ overallProgress, domains, recentAchievements }: ProgressOverviewProps) {
  const getProgressBarColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-500";
      case "red": return "bg-red-500";
      case "purple": return "bg-purple-500";
      case "green": return "bg-green-500";
      case "orange": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "shield-alt": return <Shield className="text-white" />;
      case "fire": return <Flame className="text-white" />;
      case "bug": return <Bug className="text-white" />;
      default: return <Shield className="text-white" />;
    }
  };

  const getAchievementBgColor = (iconName: string) => {
    switch (iconName) {
      case "shield-alt": return "bg-secondary";
      case "fire": return "bg-accent";
      case "bug": return "bg-purple-500";
      default: return "bg-primary";
    }
  };

  const progressDegrees = (overallProgress / 100) * 360;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Progress Card */}
      <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Learning Progress</h3>
            <p className="text-muted-foreground">CompTIA Security+ SY0-701 Preparation</p>
          </div>
          <div 
            className="w-20 h-20 rounded-full progress-circle flex items-center justify-center"
            style={{ '--progress': `${progressDegrees}deg` } as any}
          >
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">{overallProgress}%</span>
            </div>
          </div>
        </div>

        {/* Domain Progress Bars */}
        <div className="space-y-4">
          {domains.map((domain) => (
            <div key={domain.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getProgressBarColor(domain.color)}`}></div>
                  <span className="text-sm font-medium text-foreground">{domain.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {domain.progress}% ({domain.examPercentage}% of exam)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getProgressBarColor(domain.color)}`}
                  style={{ width: `${domain.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Sidebar */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Achievements</h3>
        <div className="space-y-4">
          {recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className={`w-12 h-12 ${getAchievementBgColor(achievement.icon)} rounded-lg flex items-center justify-center`}>
                {getAchievementIcon(achievement.icon)}
              </div>
              <div>
                <p className="font-medium text-foreground">{achievement.name}</p>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          ))}
          
          {recentAchievements.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Complete scenarios to earn achievements!</p>
            </div>
          )}
        </div>

        {/* Next Achievement Preview */}
        <div className="mt-6 p-4 border-2 border-dashed border-border rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-muted-foreground">?</span>
            </div>
            <p className="font-medium text-muted-foreground">Architecture Expert</p>
            <p className="text-sm text-muted-foreground">Complete Domain 3</p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
