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
  const { canAccessExpert, canAccessElite } = useTierAccess();
  const { hasPendingTransactions } = useOptimisticWallets();
  
  // Calculate stats for analytics cards
  const royaltyWallet = wallets.find((w) => w.type === 'royalty');

  return (
    <MemberLayout title="Dashboard">
      {/* Welcome Card - 2026 Obsidian Theme */}
      <div className="terminal-card rounded p-4 sm:p-5 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Welcome back,</p>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">{userName}</h2>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
            <Badge className="bg-primary text-primary-foreground text-xs font-medium">
              {tierInfo.name}
            </Badge>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {levelInfo.icon} {levelInfo.name}
            </p>
          </div>
        </div>
        <div className="mt-3 p-3 rounded bg-muted/30 border border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Referral Code</span>
          <span className="font-mono font-bold text-primary text-sm text-glow-cyan">{referralCode}</span>
        </div>
      </div>

      {/* Pending Transaction Indicator */}
      {hasPendingTransactions && (
        <Alert className="mb-4 border-primary/30 bg-primary/10">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs text-muted-foreground">
            Transaction processing... Ledger synchronizing.
          </AlertDescription>
        </Alert>
      )}

      {/* Tier-Based Analytics Cards - 2026 Style */}
      {canAccessExpert && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* P2P Credits Stats */}
          <div className="terminal-card rounded p-3 sm:p-4 widget-hover">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">P2P Credits</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground">Active</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">3% weekly yield</p>
          </div>
          
          {/* Referral Stats */}
          <div className="terminal-card rounded p-3 sm:p-4 widget-hover">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Referrals</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground">3</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Direct referrals</p>
          </div>
        </div>
      )}
      
      {/* Elite-Only Analytics */}
      {canAccessElite && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Team Override */}
          <div className="terminal-card rounded p-3 sm:p-4 border border-primary/20 widget-hover">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Team Override</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-primary text-glow-cyan">8%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Active rate</p>
          </div>
          
          {/* Royalty Income */}
          <div className="terminal-card rounded p-3 sm:p-4 border border-primary/20 widget-hover">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Referral Credits</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground">
              ₳{formatAlpha(royaltyWallet?.balance || 0)}
            </p>
            <p className="text-[10px] sm:text-xs text-primary">+₳{formatAlpha((royaltyWallet?.balance || 0) * 0.08)} this week</p>
          </div>
        </div>
      )}

      {/* Responsive Triple-Balance Wallet Engine */}
      <ResponsiveWalletEngine />

      {/* Mobile Trading Ticker */}
      <StickyTradingTicker />
    </MemberLayout>
  );
}
