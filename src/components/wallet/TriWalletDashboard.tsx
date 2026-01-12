import { useAppStore } from '@/stores/appStore';
import { WalletCard } from './WalletCard';
import { RoyaltyWallet } from './RoyaltyWallet';
import { formatAlpha } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTierAccess } from '@/components/tier';

export function TriWalletDashboard() {
  const wallets = useAppStore((state) => state.wallets);
  const { canAccessElite } = useTierAccess();
  
  // Filter wallets based on tier - show main + task for all, royalty only for elite
  const visibleWallets = wallets.filter((w) => 
    w.type === 'main' || w.type === 'task'
  );
  
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-6">
      {/* Total Balance Header */}
      <div className="text-center py-6 px-4 rounded-2xl glass-card">
        <p className="text-sm text-muted-foreground mb-1">Total System Credits</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold alpha-text">₳</span>
          <span className="text-4xl font-bold text-foreground">
            {formatAlpha(totalBalance)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Internal participation credits
        </p>
      </div>

      {/* Credit Notice */}
      <Alert className="border-muted bg-muted/30">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          ₳ Credits are internal system units. They cannot be redeemed for cash or monetary value.
        </AlertDescription>
      </Alert>

      {/* Wallet Grid - Main + Task visible to all */}
      <div className="grid gap-4">
        {visibleWallets.map((wallet) => (
          <WalletCard key={wallet.type} wallet={wallet} />
        ))}
      </div>
      
      {/* Royalty Wallet - Elite only with lock overlay for others */}
      <div className="mt-4">
        <RoyaltyWallet />
      </div>
    </div>
  );
}
