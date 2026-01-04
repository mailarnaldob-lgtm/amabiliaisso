import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Share2,
  Copy,
  ChevronRight,
  Star,
  Trophy,
  Gift,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore, ARMY_LEVELS } from '@/stores/appStore';

// Demo network data
const networkStats = {
  directReferrals: 5,
  activeReferrals: 3,
  totalNetwork: 12,
  royaltiesEarned: 450,
  tier: 'Private First Class',
};

const recentRoyalties = [
  { id: 1, source: 'User_Alpha', action: 'Mission Completed', amount: 10, time: '2 hours ago' },
  { id: 2, source: 'User_Beta', action: 'Membership Upgrade', amount: 200, time: '5 hours ago' },
  { id: 3, source: 'User_Gamma', action: 'Mission Completed', amount: 10, time: '1 day ago' },
];

const directReferrals = [
  { id: 1, name: 'User_Alpha', tier: 'Pro', status: 'active', missions: 15 },
  { id: 2, name: 'User_Beta', tier: 'Elite', status: 'active', missions: 28 },
  { id: 3, name: 'User_Gamma', tier: 'Basic', status: 'inactive', missions: 3 },
];

export default function GrowthApp() {
  const { referralCode, armyLevel } = useAppStore();
  const levelInfo = ARMY_LEVELS[armyLevel];
  const { toast } = useToast();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Code Copied!",
      description: "Share this code with friends to grow your network",
    });
  };

  return (
    <AlphaLayout 
      title="₳LPHA GROWTH" 
      subtitle="Royalties & Network"
      appColor="from-purple-500 to-pink-600"
    >
      {/* Demo Notice */}
      <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">UI MOCKUP - For demonstration purposes only</span>
        </div>
      </div>

      {/* Referral Code Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 text-white">
          <p className="text-sm opacity-80 mb-1">Your Referral Code</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold tracking-wider">{referralCode}</span>
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={copyReferralCode}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-lg">{levelInfo.icon}</span>
            <span className="text-sm opacity-80">{levelInfo.name}</span>
          </div>
        </div>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full gap-2" disabled>
            <Share2 className="h-4 w-4" />
            Share Invite Link
          </Button>
        </CardContent>
      </Card>

      {/* Network Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard 
          icon={Users} 
          label="Direct" 
          value={networkStats.directReferrals} 
          color="from-purple-500 to-pink-600"
        />
        <StatCard 
          icon={Star} 
          label="Active" 
          value={networkStats.activeReferrals} 
          color="from-emerald-500 to-teal-600"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Network" 
          value={networkStats.totalNetwork} 
          color="from-blue-500 to-indigo-600"
        />
      </div>

      {/* Royalties Earned */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Total Royalties</span>
            </div>
            <span className="text-2xl font-bold">₳{networkStats.royaltiesEarned}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>• 50% credit from direct referral upgrades</p>
            <p>• 10% credit from network activity</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Royalties */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Recent Royalties
      </h3>
      
      <div className="space-y-2 mb-6">
        {recentRoyalties.map((royalty) => (
          <Card key={royalty.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <Gift className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{royalty.source}</p>
                    <p className="text-xs text-muted-foreground">{royalty.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-500">+₳{royalty.amount}</p>
                  <p className="text-xs text-muted-foreground">{royalty.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Army (Direct Referrals) */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        My Army
      </h3>
      
      <div className="space-y-2 mb-6">
        {directReferrals.map((referral) => (
          <Card key={referral.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                    {referral.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{referral.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{referral.tier}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {referral.missions} missions
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={referral.status === 'active' ? 'default' : 'secondary'}
                    className={referral.status === 'active' ? 'bg-emerald-500' : ''}
                  >
                    {referral.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rank Progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-medium">Rank Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {levelInfo.name} → Next Rank
            </span>
          </div>
          <Progress value={60} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            2 more active referrals to rank up
          </p>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          Royalties are internal credit allocations based on network participation. 
          They are non-monetary and cannot be converted to cash.
        </p>
      </div>
    </AlphaLayout>
  );
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
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} w-fit mx-auto mb-2`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
