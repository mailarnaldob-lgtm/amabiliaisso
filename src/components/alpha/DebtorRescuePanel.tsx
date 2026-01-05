import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Lock, 
  Target, 
  Clock, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Flame
} from 'lucide-react';
import { formatAlpha } from '@/lib/utils';

interface RescueMission {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'Extreme' | 'Hard';
  timeLimit: string;
  status: 'available' | 'in_progress' | 'completed';
  progress?: number;
}

interface DebtorRescuePanelProps {
  totalDebt: number;
  earnedTowardsDebt: number;
  daysOverdue: number;
  missions: RescueMission[];
}

export function DebtorRescuePanel({ 
  totalDebt, 
  earnedTowardsDebt, 
  daysOverdue,
  missions 
}: DebtorRescuePanelProps) {
  const progressPercent = (earnedTowardsDebt / totalDebt) * 100;
  const remainingDebt = totalDebt - earnedTowardsDebt;

  return (
    <div className="space-y-4">
      {/* Account Lock Banner */}
      <Card className="border-destructive bg-destructive/5 overflow-hidden">
        <div className="bg-destructive px-4 py-2 flex items-center gap-2 text-destructive-foreground">
          <Lock className="h-4 w-4" />
          <span className="font-bold text-sm">ACCOUNT LOCKED: DEBTOR STATUS</span>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Debt</p>
              <p className="text-3xl font-bold text-destructive">
                ₳{formatAlpha(totalDebt)}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="destructive" className="mb-1">
                {daysOverdue} Days Overdue
              </Badge>
              <p className="text-xs text-muted-foreground">
                All royalties redirected
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Complete Rescue Missions to clear your debt and restore account access.
            Standard missions are unavailable until debt is cleared.
          </p>

          {/* Progress to Freedom */}
          <div className="p-3 rounded-lg bg-background/50">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Labor to Freedom</span>
              </span>
              <span className="font-bold">{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Earned: ₳{formatAlpha(earnedTowardsDebt)}</span>
              <span>Remaining: ₳{formatAlpha(remainingDebt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rescue Missions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-amber-500" />
            Rescue Missions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {missions.map((mission) => (
            <RescueMissionCard key={mission.id} mission={mission} />
          ))}
        </CardContent>
      </Card>

      {/* Info Notice */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Rescue Protocol Rules
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• All mission rewards go directly to debt repayment</li>
            <li>• Royalty commissions are automatically redirected</li>
            <li>• Standard platform features locked until debt cleared</li>
            <li>• Rescue missions have 3x difficulty multiplier</li>
            <li>• Account restoration upon 100% debt clearance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function RescueMissionCard({ mission }: { mission: RescueMission }) {
  const isExtreme = mission.difficulty === 'Extreme';
  
  return (
    <Card className={`overflow-hidden border ${
      isExtreme ? 'border-destructive/30' : 'border-amber-500/30'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${isExtreme ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
              <Target className={`h-5 w-5 ${isExtreme ? 'text-destructive' : 'text-amber-500'}`} />
            </div>
            <div>
              <p className="font-medium">{mission.title}</p>
              <p className="text-xs text-muted-foreground">{mission.description}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={isExtreme 
              ? 'border-destructive/30 text-destructive' 
              : 'border-amber-500/30 text-amber-600'
            }
          >
            {mission.difficulty}
          </Badge>
        </div>

        {mission.status === 'in_progress' && mission.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{mission.progress}%</span>
            </div>
            <Progress value={mission.progress} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {mission.timeLimit}
            </span>
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <ArrowRight className="h-3 w-3" />
              ₳{mission.reward} → Debt
            </span>
          </div>
          <Button 
            size="sm" 
            variant={mission.status === 'in_progress' ? 'default' : 'outline'}
            className={mission.status === 'in_progress' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-600' 
              : ''
            }
            disabled={mission.status === 'completed'}
          >
            {mission.status === 'completed' ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Done
              </>
            ) : mission.status === 'in_progress' ? (
              'Continue'
            ) : (
              'Start'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
