import { useState } from 'react';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Star,
  Trophy,
  Zap,
  AlertTriangle,
  Upload,
  Camera,
  Link as LinkIcon,
  FileCheck,
  Timer
} from 'lucide-react';
import { formatAlpha } from '@/lib/utils';

// Demo mission data
const standardMissions = [
  {
    id: 1,
    title: 'Social Media Engagement',
    description: 'Complete profile verification and share content',
    reward: 50,
    difficulty: 'Easy',
    timeLimit: '2 hours',
    status: 'available',
    progress: 0,
    proofType: 'screenshot',
    escrowAmount: 50,
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
    proofType: 'link',
    escrowAmount: 100,
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
    proofType: 'verification',
    escrowAmount: 200,
  },
];

const completedMissions = [
  { id: 4, title: 'Welcome Survey', reward: 25, completedAt: '2 days ago', status: 'approved' },
  { id: 5, title: 'Profile Setup', reward: 50, completedAt: '3 days ago', status: 'approved' },
];

const pendingApproval = [
  { id: 6, title: 'Content Creation', reward: 150, submittedAt: '2 hours ago', status: 'pending' },
];

const dailyStats = {
  completed: 3,
  total: 5,
  credits: 150,
  streak: 7,
};

type MissionCategory = 'all' | 'Easy' | 'Medium' | 'Hard' | 'Special';

export default function MarketApp() {
  const [activeCategory, setActiveCategory] = useState<MissionCategory>('all');
  const [activeTab, setActiveTab] = useState('available');

  const filteredMissions = activeCategory === 'all' 
    ? standardMissions 
    : standardMissions.filter(m => m.difficulty === activeCategory);

  return (
    <AlphaLayout 
      title="₳LPHA MARKET" 
      subtitle="VPA Missions"
      appColor="from-emerald-500 to-teal-600"
    >

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

      {/* Mission Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available" className="gap-1 text-xs">
            <Target className="h-3 w-3" />
            Available
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            Pending
            {pendingApproval.length > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-amber-500">
                {pendingApproval.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {/* Mission Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
            {(['all', 'Easy', 'Medium', 'Hard', 'Special'] as MissionCategory[]).map((cat) => (
              <CategoryPill 
                key={cat}
                label={cat === 'all' ? 'All' : cat} 
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>

          {/* Available Missions */}
          <div className="space-y-3">
            {filteredMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
              <p className="text-xs text-amber-600 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Proofs are reviewed within 48 hours. Creator can dispute during this period.
              </p>
            </div>
            
            {pendingApproval.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending submissions</p>
              </div>
            ) : (
              pendingApproval.map((mission) => (
                <Card key={mission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10">
                          <FileCheck className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium">{mission.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {mission.submittedAt}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₳{mission.reward}</p>
                        <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-3">
            {completedMissions.map((mission) => (
              <Card key={mission.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium">{mission.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Completed {mission.completedAt}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">+₳{mission.reward}</p>
                      <Badge className="bg-emerald-500 text-[10px]">Approved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Escrow Info */}
      <Card className="mt-4 bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            VPA Mission Flow
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>1. Creator escrows ₳ when posting mission</li>
            <li>2. First accept locks mission (2h execution window)</li>
            <li>3. Submit Proof-of-Work with idempotent hash</li>
            <li>4. Creator has 48h to dispute</li>
            <li>5. No dispute → Auto-approve & settlement</li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          VPA missions are voluntary participation activities. 
          Credits are for platform use only and cannot be converted to money.
          All proofs are logged immutably for audit.
        </p>
      </div>
    </AlphaLayout>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
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

function MissionCard({ mission }: { mission: typeof standardMissions[0] }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProofIcon = (type: string) => {
    switch (type) {
      case 'screenshot': return Camera;
      case 'link': return LinkIcon;
      case 'verification': return FileCheck;
      default: return Upload;
    }
  };

  const ProofIcon = getProofIcon(mission.proofType);

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
            <span className="flex items-center gap-1">
              <ProofIcon className="h-3 w-3" />
              {mission.proofType}
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
                <Upload className="h-3 w-3 mr-1" />
                Submit
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
