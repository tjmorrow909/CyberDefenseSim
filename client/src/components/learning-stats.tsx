import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target, Lightbulb } from 'lucide-react';

interface Stats {
  accuracy: number;
  questionsCompleted: number;
  studyTime: number;
  weakestDomain: number | null;
}

interface LearningStatsProps {
  stats: Stats;
}

export default function LearningStats({ stats }: LearningStatsProps) {
  const recentActivities = [
    {
      id: 1,
      type: 'quiz',
      title: 'Completed "Cryptography Basics" quiz',
      details: 'Domain 1 • 8/10 correct • 2 hours ago',
      xp: 85,
      icon: <CheckCircle className="text-primary" />,
    },
    {
      id: 2,
      type: 'lab',
      title: 'Completed SQL Injection Lab',
      details: 'Domain 2 • Excellent performance • Yesterday',
      xp: 150,
      icon: <Target className="text-red-600" />,
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Earned "Security Basics Master" badge',
      details: 'Achievement unlocked • 2 days ago',
      xp: 250,
      icon: <CheckCircle className="text-accent" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-secondary">+{activity.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Average Accuracy</div>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{stats.questionsCompleted}</div>
              <div className="text-sm text-muted-foreground">Questions Completed</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">{stats.studyTime}h</div>
              <div className="text-sm text-muted-foreground">Study Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.weakestDomain ? `Dom ${stats.weakestDomain}` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Focus Area</div>
            </div>
          </div>

          {/* Study Recommendations */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Study Recommendation</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {stats.weakestDomain
                    ? `Focus on Domain ${stats.weakestDomain} to improve your exam readiness. Consider completing more scenarios in this area.`
                    : 'Keep up the great work! Continue practicing scenarios to maintain your progress.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
