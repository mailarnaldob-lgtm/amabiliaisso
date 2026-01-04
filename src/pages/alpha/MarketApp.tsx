import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Star,
  Trophy,
  Zap,
  AlertTriangle
} from 'lucide-react';

// Demo mission data
const demoMissions = [
  {
    id: 1,
    title: 'Social Media Engagement',
    description: 'Complete profile verification and share content',
    reward: 50,
    difficulty: 'Easy',
    timeLimit: '2 hours',
    status: 'available',
    progress: 0,
  },
  {
    id: 2,
    title: 'Community Participation',
    description: 'Join community channels and engage with members',
    reward: 100,
    difficulty: 'Medium',
    timeLimit: '24 hours',
    status: 'in_progress',
    progress: 45,
  },
  {
    id: 3,
    title: 'Referral Campaign',
    description: 'Invite friends and help them get started',
    reward: 200,
    difficulty: 'Hard',
    timeLimit: '7 days',
    status: 'available',
    progress: 0,
  },
];

const dailyStats = {
  completed: 3,
  total: 5,
  credits: 150,
  streak: 7,
};

export default function MarketApp() {
  return (
    <AlphaLayout 
      title="₳LPHA MARKET" 
      subtitle="VPA Missions"
      appColor="from-emerald-500 to-teal-600"
    >
      {/* Demo Notice */}
      <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">UI MOCKUP - For demonstration purposes only</span>
        </div>
      </div>

      {/* Daily Progress */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-80">Daily Progress</p>
              <p className="text-2xl font-bold">{dailyStats.completed}/{dailyStats.total} Missions</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span className="font-bold">{dailyStats.streak} Day Streak</span>
              </div>
            </div>
          </div>
          <Progress value={(dailyStats.completed / dailyStats.total) * 100} className="h-2 bg-white/20" />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Today's Credits:</span>
            </div>
            <span className="font-bold text-foreground">₳{dailyStats.credits}</span>
          </div>
        </CardContent>
      </Card>

      {/* Mission Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        <CategoryPill label="All" active />
        <CategoryPill label="Easy" />
        <CategoryPill label="Medium" />
        <CategoryPill label="Hard" />
        <CategoryPill label="Special" />
      </div>

      {/* Available Missions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Available Missions
        </h3>
        
        {demoMissions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>

      {/* Rescue Task Notice (Hidden by default) */}
      <Card className="mt-6 border-destructive/50 bg-destructive/5 hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-destructive">Rescue Missions Required</p>
              <p className="text-xs text-muted-foreground">
                Complete special missions to restore account status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          VPA missions are voluntary participation activities. 
          Credits are for platform use only and cannot be converted to money.
        </p>
      </div>
    </AlphaLayout>
  );
}

function CategoryPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <button 
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        active 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );
}

function MissionCard({ mission }: { mission: typeof demoMissions[0] }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 mt-0.5">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-foreground">{mission.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{mission.description}</p>
            </div>
          </div>
          <Badge className={getDifficultyColor(mission.difficulty)} variant="outline">
            {mission.difficulty}
          </Badge>
        </div>
        
        {mission.status === 'in_progress' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
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
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              ₳{mission.reward}
            </span>
          </div>
          <Button 
            size="sm" 
            variant={mission.status === 'in_progress' ? 'default' : 'outline'}
            className={mission.status === 'in_progress' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : ''}
            disabled
          >
            {mission.status === 'in_progress' ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Continue
              </>
            ) : (
              'Start'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
