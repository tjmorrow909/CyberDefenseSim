import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Target } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimatedTime: number;
  xpReward: number;
  domainId: number;
  content: {
    background: string;
    scenario: string;
    codeExample?: string;
  };
}

interface ScenarioModalProps {
  scenario: Scenario | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export default function ScenarioModal({ scenario, isOpen, onClose, onStart }: ScenarioModalProps) {
  if (!scenario) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'scenario': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'challenge': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold">{scenario.title}</DialogTitle>
              <DialogDescription>{scenario.description}</DialogDescription>
            </div>
            <Badge className={getTypeColor(scenario.type)}>
              {scenario.type}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-muted rounded-lg p-6">
            <h4 className="font-semibold text-foreground mb-3">Scenario Background</h4>
            <p className="text-muted-foreground mb-4">{scenario.content.background}</p>
            <p className="text-foreground font-medium">{scenario.content.scenario}</p>
            
            {scenario.content.codeExample && (
              <div className="mt-4 bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                <div className="text-gray-400 mb-2">// Code Example:</div>
                <div>{scenario.content.codeExample}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{scenario.estimatedTime} minutes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Domain {scenario.domainId}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-accent font-medium">
              <Trophy className="w-4 h-4" />
              <span>+{scenario.xpReward} XP</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={onStart} className="flex-1">
              Start Investigation
            </Button>
            <Button variant="outline" onClick={onClose}>
              View Hints
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
