import { MemberLayout } from '@/components/layouts/MemberLayout';
import { ResponsiveWalletEngine } from '@/components/dashboard/ResponsiveWalletEngine';
import { StickyTradingTicker } from '@/components/dashboard/StickyTradingTicker';
import { useAppStore, MEMBERSHIP_TIERS, ARMY_LEVELS } from '@/stores/appStore';
import { Badge } from '@/components/ui/badge';
import { useTierAccess } from '@/components/tier';
import { TrendingUp, Users, Crown, Shield } from 'lucide-react';
import { formatAlpha } from '@/lib/utils';
import { useOptimisticWallets } from '@/hooks/useOptimisticWallets';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const { userName, membershipTier, armyLevel, referralCode, wallets } = useAppStore();
  const tierInfo = MEMBERSHIP_TIERS[membershipTier];
  const levelInfo = ARMY_LEVELS[armyLevel];
  const { canAccessPro, canAccessElite } = useTierAccess();
  const { hasPendingTransactions } = useOptimisticWallets();
  
  // Calculate stats for analytics cards
  const royaltyWallet = wallets.find((w) => w.type === 'royalty');

  return (
    <MemberLayout title="Dashboard">
      {/* Welcome Card - Responsive */}
      <div className="glass-card rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Welcome back,</p>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{userName}</h2>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
            <Badge className="alpha-gradient text-alpha-foreground text-xs">
              {tierInfo.name}
            </Badge>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {levelInfo.icon} {levelInfo.name}
            </p>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-lg bg-secondary/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Referral Code</span>
          <span className="font-mono font-bold text-alpha text-sm">{referralCode}</span>
        </div>
      </div>

      {/* Pending Transaction Indicator */}
      {hasPendingTransactions && (
        <Alert className="mb-4 border-amber-500/30 bg-amber-500/10">
          <Shield className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-xs text-amber-600">
            Transaction processing... Ledger synchronizing.
          </AlertDescription>
        </Alert>
      )}

      {/* Tier-Based Analytics Cards - Responsive Grid */}
      {canAccessPro && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* ALPHA P2P Credits Stats - PRO+ */}
          <div className="glass-card rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-alpha" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">P2P Credits</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground">Active</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">3% weekly yield</p>
          </div>
          
          {/* Referral Stats - PRO+ */}
          <div className="glass-card rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-success" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Referrals</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground">3</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Direct referrals</p>
          </div>
        </div>
      )}
      
      {/* Elite-Only Analytics - Responsive */}
      {canAccessElite && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* 8% Team Override - ELITE */}
          <div className="glass-card rounded-xl p-3 sm:p-4 border border-alpha/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-alpha" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Team Override</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-alpha">8%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Active rate</p>
          </div>
          
          {/* Royalty Income - ELITE */}
          <div className="glass-card rounded-xl p-3 sm:p-4 border border-alpha/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-alpha" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Referral Credits</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground">
              ₳{formatAlpha(royaltyWallet?.balance || 0)}
            </p>
            <p className="text-[10px] sm:text-xs text-success">+₳{formatAlpha((royaltyWallet?.balance || 0) * 0.08)} this week</p>
          </div>
        </div>
      )}

      {/* Responsive Triple-Balance Wallet Engine */}
      <ResponsiveWalletEngine />

      {/* Mobile Trading Ticker (sticky bottom bar) */}
      <StickyTradingTicker />
    </MemberLayout>
  );
}
