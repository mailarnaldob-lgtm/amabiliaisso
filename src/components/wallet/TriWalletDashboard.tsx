import { useAppStore } from '@/stores/appStore';
import { WalletCard } from './WalletCard';
import { formatAlpha } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TriWalletDashboard() {
  const wallets = useAppStore((state) => state.wallets);
  
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

      {/* Wallet Grid */}
      <div className="grid gap-4">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.type} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}
