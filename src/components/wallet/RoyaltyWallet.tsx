import { useAppStore } from '@/stores/appStore';
import { formatAlpha } from '@/lib/utils';
import { useTierAccess } from '@/components/tier';
import { LockedOverlay } from '@/components/tier/LockedOverlay';
import { TrendingUp, Crown } from 'lucide-react';

export function RoyaltyWallet() {
  const wallets = useAppStore((state) => state.wallets);
  const { canAccessElite } = useTierAccess();
  
  const royaltyWallet = wallets.find((w) => w.type === 'royalty');
  const royaltyBalance = royaltyWallet?.balance || 0;
  
  const walletContent = (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-alpha/20 to-alpha/5 flex items-center justify-center">
            <Crown className="h-5 w-5 text-alpha" />
          </div>
          <div>
            <p className="font-medium text-foreground">Referral Credits</p>
            <p className="text-xs text-muted-foreground">50% Commission Active</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold alpha-text">₳</span>
        <span className="text-3xl font-bold text-foreground">
          {formatAlpha(royaltyBalance)}
        </span>
      </div>
      
      {/* Royalty Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">This Week</span>
          </div>
          <p className="font-bold text-foreground">₳{formatAlpha(royaltyBalance * 0.12)}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4 text-alpha" />
            <span className="text-xs text-muted-foreground">Commission Rate</span>
          </div>
          <p className="font-bold text-alpha">50%</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <LockedOverlay tierRequired="elite" isLocked={!canAccessElite}>
      {walletContent}
    </LockedOverlay>
  );
}
