import { useAppStore } from '@/stores/appStore';
import { WalletCard } from './WalletCard';
import { formatAlpha } from '@/lib/utils';

export function TriWalletDashboard() {
  const wallets = useAppStore((state) => state.wallets);
  
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-6">
      {/* Total Balance Header */}
      <div className="text-center py-6 px-4 rounded-2xl glass-card">
        <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold alpha-text">₳</span>
          <span className="text-4xl font-bold text-foreground">
            {formatAlpha(totalBalance)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          ≈ ₱{formatAlpha(totalBalance)} PHP (1:1 Peg)
        </p>
      </div>

      {/* Wallet Grid */}
      <div className="grid gap-4">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.type} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}
