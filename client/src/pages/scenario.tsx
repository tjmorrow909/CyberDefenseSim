import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Scenario() {
  const { id } = useParams();
  const scenarioId = parseInt(id || '1');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  const { data: scenario, isLoading } = useQuery({
    queryKey: [`/api/scenarios/${scenarioId}`],
    enabled: !!scenarioId,
  });

  const { data: userScenario } = useQuery({
    queryKey: [`/api/users/1/scenarios/${scenarioId}`],
    enabled: !!scenarioId,
  });

  const updateScenarioMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', `/api/users/1/scenarios/${scenarioId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/1/scenarios/${scenarioId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/1/dashboard`] });
    },
  });

  if (isLoading || !scenario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-32 bg-muted rounded animate-pulse mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const questions = scenario.content.questions || [];

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const correctAnswers = questions.filter((q: any, index: number) => selectedAnswers[index] === q.correct).length;

    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 60000); // minutes

    updateScenarioMutation.mutate({
      completed: true,
      score,
      attempts: (userScenario?.attempts || 0) + 1,
      timeSpent: (userScenario?.timeSpent || 0) + timeSpent,
      completedAt: new Date().toISOString(),
    });

    setShowResults(true);

    toast({
      title: 'Scenario Completed!',
      description: `You scored ${score}% and earned ${scenario.xpReward} XP`,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'scenario':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'challenge':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (showResults) {
    const correctAnswers = questions.filter((q: any, index: number) => selectedAnswers[index] === q.correct).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href={`/domain/${scenario.domainId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Domain
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Scenario Complete!</CardTitle>
              <CardDescription>You've finished {scenario.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{score}%</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {correctAnswers}/{questions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">+{scenario.xpReward}</div>
                  <div className="text-sm text-muted-foreground">XP Earned</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Review Your Answers</h3>
                {questions.map((question: any, index: number) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === question.correct;

                  return (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{question.question}</p>
                          <div className="mt-2 space-y-1">
                            {question.options.map((option: string, optIndex: number) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded text-sm ${
                                  optIndex === question.correct
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : optIndex === userAnswer && !isCorrect
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {option} {optIndex === question.correct && '(Correct)'}
                                {optIndex === userAnswer && optIndex !== question.correct && '(Your answer)'}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                            <div className="flex items-start space-x-2">
                              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Explanation</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">{question.explanation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <Link href={`/domain/${scenario.domainId}`}>
                  <Button variant="outline">Back to Domain</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Return to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/domain/${scenario.domainId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Domain
            </Button>
          </Link>
        </div>

        {/* Scenario Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(scenario.type)}>{scenario.type}</Badge>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getDifficultyColor(scenario.difficulty)}`}></div>
                    <span className="text-xs text-muted-foreground capitalize">{scenario.difficulty}</span>
                  </div>
                </div>
                <CardTitle className="text-2xl">{scenario.title}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Reward</div>
                <div className="text-lg font-bold text-accent">+{scenario.xpReward} XP</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Scenario Background</h4>
              <p className="text-muted-foreground mb-4">{scenario.content.background}</p>
              <p className="text-foreground font-medium">{scenario.content.scenario}</p>

              {scenario.content.codeExample && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                  <div className="text-gray-400 mb-2">// Code Example:</div>
                  <div>{scenario.content.codeExample}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                Progress: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} />
          </CardContent>
        </Card>

        {/* Current Question */}
        {questions.length > 0 && currentQuestion < questions.length && (
          <Card>
            <CardHeader>
              <CardTitle>Question {currentQuestion + 1}</CardTitle>
              <CardDescription>{questions[currentQuestion].question}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString()}
                onValueChange={value => handleAnswerSelect(currentQuestion, parseInt(value))}
              >
                {questions[currentQuestion].options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={selectedAnswers[currentQuestion] === undefined}>
                  {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
