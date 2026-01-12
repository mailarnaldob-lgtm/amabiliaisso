import { MemberLayout } from '@/components/layouts/MemberLayout';
import { TriWalletDashboard } from '@/components/wallet/TriWalletDashboard';
import { useAppStore, MEMBERSHIP_TIERS, ARMY_LEVELS } from '@/stores/appStore';
import { Badge } from '@/components/ui/badge';
import { useTierAccess } from '@/components/tier';
import { TrendingUp, Users, Crown } from 'lucide-react';
import { formatAlpha } from '@/lib/utils';

export default function Dashboard() {
  const { userName, membershipTier, armyLevel, referralCode, wallets } = useAppStore();
  const tierInfo = MEMBERSHIP_TIERS[membershipTier];
  const levelInfo = ARMY_LEVELS[armyLevel];
  const { canAccessPro, canAccessElite } = useTierAccess();
  
  // Calculate stats for analytics cards
  const royaltyWallet = wallets.find((w) => w.type === 'royalty');
  const taskWallet = wallets.find((w) => w.type === 'task');

  return (
    <MemberLayout title="Dashboard">
      {/* Welcome Card */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h2 className="text-xl font-bold text-foreground">{userName}</h2>
          </div>
          <div className="text-right">
            <Badge className="alpha-gradient text-alpha-foreground mb-1">
              {tierInfo.name}
            </Badge>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              {levelInfo.icon} {levelInfo.name}
            </p>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-lg bg-secondary/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Referral Code</span>
          <span className="font-mono font-bold text-alpha">{referralCode}</span>
        </div>
      </div>

      {/* Tier-Based Analytics Cards */}
      {canAccessPro && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* ALPHA P2P Credits Stats - PRO+ */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-alpha" />
              <span className="text-xs text-muted-foreground">P2P Credits</span>
            </div>
            <p className="text-lg font-bold text-foreground">Active</p>
            <p className="text-xs text-muted-foreground">3% weekly yield</p>
          </div>
          
          {/* Referral Stats - PRO+ */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Referrals</span>
            </div>
            <p className="text-lg font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Direct referrals</p>
          </div>
        </div>
      )}
      
      {/* Elite-Only Analytics */}
      {canAccessElite && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 8% Team Override - ELITE */}
          <div className="glass-card rounded-xl p-4 border border-alpha/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-alpha" />
              <span className="text-xs text-muted-foreground">Team Override</span>
            </div>
            <p className="text-lg font-bold text-alpha">8%</p>
            <p className="text-xs text-muted-foreground">Active rate</p>
          </div>
          
          {/* Royalty Income - ELITE */}
          <div className="glass-card rounded-xl p-4 border border-alpha/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-alpha" />
              <span className="text-xs text-muted-foreground">Referral Credits</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              ₳{formatAlpha(royaltyWallet?.balance || 0)}
            </p>
            <p className="text-xs text-success">+₳{formatAlpha((royaltyWallet?.balance || 0) * 0.08)} this week</p>
          </div>
        </div>
      )}

      <TriWalletDashboard />
    </MemberLayout>
  );
}
