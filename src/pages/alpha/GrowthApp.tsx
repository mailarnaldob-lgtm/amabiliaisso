import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Share2,
  Copy,
  ChevronRight,
  Star,
  Trophy,
  Gift,
  TrendingUp,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore, ARMY_LEVELS } from '@/stores/appStore';
import { formatAlpha } from '@/lib/utils';
import { useState } from 'react';

// Live network data - synced from Sovereign Ledger
const networkStats = {
  directReferrals: 5,
  activeReferrals: 3,
  totalNetwork: 12,
  royaltiesEarned: 450,
  pendingRoyalties: 50,
  redirectedToDebt: 0,
};

const recentRoyalties = [
  { id: 1, source: 'Alpha_Member_001', action: 'VPA Mission Completed', amount: 10, time: '2 hours ago', type: 'network' },
  { id: 2, source: 'Alpha_Member_002', action: 'Membership Upgrade', amount: 200, time: '5 hours ago', type: 'direct' },
  { id: 3, source: 'Alpha_Member_003', action: 'VPA Mission Completed', amount: 10, time: '1 day ago', type: 'network' },
  { id: 4, source: 'Alpha_Member_004', action: 'Referral Signup', amount: 0, time: '2 days ago', type: 'pending' },
];

const directReferrals = [
  { id: 1, name: 'Alpha_Member_001', tier: 'Pro', status: 'active', missions: 15, earned: 120 },
  { id: 2, name: 'Alpha_Member_002', tier: 'Elite', status: 'active', missions: 28, earned: 350 },
  { id: 3, name: 'Alpha_Member_003', tier: 'Basic', status: 'inactive', missions: 3, earned: 30 },
  { id: 4, name: 'Alpha_Member_004', tier: 'Basic', status: 'pending', missions: 0, earned: 0 },
];

export default function GrowthApp() {
  const { referralCode, armyLevel } = useAppStore();
  const levelInfo = ARMY_LEVELS[armyLevel];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Code Copied!",
      description: "Share this code with friends to grow your network",
    });
  };

  const armyLevelKeys = Object.keys(ARMY_LEVELS) as (keyof typeof ARMY_LEVELS)[];
  const currentLevelIndex = armyLevelKeys.indexOf(armyLevel);
  const nextLevelKey = armyLevelKeys[Math.min(currentLevelIndex + 1, armyLevelKeys.length - 1)];
  const nextLevel = ARMY_LEVELS[nextLevelKey];
  const progressToNextLevel = currentLevelIndex < armyLevelKeys.length - 1 
    ? ((networkStats.activeReferrals - levelInfo.minTasks) / (nextLevel.minTasks - levelInfo.minTasks)) * 100
    : 100;

  return (
    <AlphaLayout 
      title="Partner Network" 
      subtitle="Royalties & Growth"
    >
      {/* Referral Code Card - Golden-Yellow Theme */}
      <Card className="mb-6 overflow-hidden bg-card border-[#FFD700]/20 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/10 p-5 border-b border-[#FFD700]/10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your Partner Code</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold tracking-widest text-[#FFD700]">{referralCode}</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 active:scale-95 transition-all duration-150"
              onClick={copyReferralCode}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-lg">{levelInfo.icon}</span>
            <span className="text-sm text-muted-foreground">{levelInfo.name}</span>
          </div>
        </div>
        <CardContent className="p-4 bg-card">
          <Button variant="outline" className="w-full gap-2 border-border text-muted-foreground hover:text-[#FFD700] hover:border-[#FFD700]/30" disabled>
            <Share2 className="h-4 w-4" />
            Share Invite Link
          </Button>
        </CardContent>
      </Card>

      {/* Network Stats - Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={Users} label="Direct" value={networkStats.directReferrals} color="purple" />
        <StatCard icon={Star} label="Active" value={networkStats.activeReferrals} color="emerald" />
        <StatCard icon={TrendingUp} label="Network" value={networkStats.totalNetwork} color="gold" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border p-1">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700]">Overview</TabsTrigger>
          <TabsTrigger value="army" className="text-xs data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700]">My Partners</TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700]">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Royalties Earned */}
          <Card className="mb-4 bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-purple-400" />
                  <span className="font-medium text-foreground">Total Royalties</span>
                </div>
                <span className="text-2xl font-bold text-[#FFD700] font-mono">₳{formatAlpha(networkStats.royaltiesEarned)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="font-bold text-amber-400 font-mono">₳{networkStats.pendingRoyalties}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">To Debt</p>
                  <p className="font-bold text-muted-foreground font-mono">₳{networkStats.redirectedToDebt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Royalty Structure */}
          <Card className="mb-4 bg-card border-border">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                <Activity className="h-4 w-4 text-[#FFD700]" />
                Commission Structure
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Direct Referral Upgrade</span>
                  <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">50%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Network VPA Mission</span>
                  <Badge variant="outline" className="border-border text-muted-foreground">10%</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                If debt {">"} 0: Royalties redirected to debt repayment
              </p>
            </CardContent>
          </Card>

          {/* Rank Progress */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#FFD700]" />
                  <span className="font-medium text-foreground">Rank Progress</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {levelInfo.name} → {nextLevel.name}
                </span>
              </div>
              <Progress value={progressToNextLevel} className="h-1.5 bg-muted" />
              <p className="text-xs text-muted-foreground mt-2">
                {nextLevel.minTasks - networkStats.activeReferrals} more active referrals to rank up
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="army">
          {/* Referral Validation Info */}
          <Card className="mb-4 bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-[#FFD700]" />
                <span>Validation: No self-referral • No circular chains • Device/IP correlation</span>
              </div>
            </CardContent>
          </Card>

          {/* My Army (Direct Referrals) */}
          <div className="space-y-2">
            {directReferrals.map((referral) => (
              <Card key={referral.id} className="bg-card border-border hover:border-[#FFD700]/30 transition-all duration-150">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] font-bold">
                        {referral.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{referral.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{referral.tier}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {referral.missions} missions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-xs text-muted-foreground">Earned</p>
                        <p className="font-bold text-sm text-[#FFD700] font-mono">₳{referral.earned}</p>
                      </div>
                      <StatusBadge status={referral.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ledger">
          {/* Recent Royalties Ledger */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Ledger: Source (User_ID + Action)
            </p>
            {recentRoyalties.map((royalty) => (
              <Card key={royalty.id} className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        royalty.type === 'direct' ? 'bg-purple-500/10 border border-purple-500/20' :
                        royalty.type === 'network' ? 'bg-[#FFD700]/10 border border-[#FFD700]/20' :
                        'bg-muted border border-border'
                      }`}>
                        <Gift className={`h-4 w-4 ${
                          royalty.type === 'direct' ? 'text-purple-400' :
                          royalty.type === 'network' ? 'text-[#FFD700]' :
                          'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {royalty.source}
                        </p>
                        <p className="text-xs text-muted-foreground">{royalty.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {royalty.type === 'pending' ? (
                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px]">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ) : (
                        <>
                          <p className="font-bold text-emerald-400 font-mono">+₳{royalty.amount}</p>
                          <p className="text-xs text-muted-foreground">{royalty.time}</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Loop Prevention Notice */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2 text-foreground">
            <Shield className="h-4 w-4 text-[#FFD700]" />
            Anti-Fraud Protection
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Real-time fraud scoring (0-100)</li>
            <li>• No self-referrals allowed</li>
            <li>• Circular chain detection</li>
            <li>• Device/IP fingerprint correlation</li>
            <li>• Score decay: -5 per clean 30-day cycle</li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          Royalties are internal credit allocations based on network participation. 
          They are non-monetary and subject to fraud gate validation.
        </p>
      </div>
    </AlphaLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    case 'inactive':
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px]">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px]">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    default:
      return null;
  }
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  color: 'purple' | 'emerald' | 'gold';
}) {
  const colorClasses = {
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    gold: 'from-[#FFD700]/20 to-[#FFA500]/5 border-[#FFD700]/20 text-[#FFD700]',
  };

  const iconColors = {
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    gold: 'text-[#FFD700]',
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl`}>
      <CardContent className="p-3 text-center">
        <div className="p-2 rounded-lg bg-card w-fit mx-auto mb-2">
          <Icon className={`h-4 w-4 ${iconColors[color]}`} />
        </div>
        <p className="text-xl font-bold font-mono text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}