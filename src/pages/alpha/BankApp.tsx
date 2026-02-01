import { useState } from 'react';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EliteButton } from '@/components/ui/elite-button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  History,
  QrCode,
  Clock,
  CheckCircle2,
  Coins,
  CreditCard,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { formatAlpha } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { ExchangerModal } from '@/components/alpha/ExchangerModal';
import { UserStateIndicator, UserLifecycleFlow } from '@/components/alpha/UserStateIndicator';
import { useOptimisticWallets } from '@/hooks/useOptimisticWallets';
import { useWalletTransactions, WalletTransaction } from '@/hooks/useWalletTransactions';
import { formatDistanceToNow } from 'date-fns';

// Transaction display mapping
function getTransactionDisplay(tx: WalletTransaction) {
  const type = tx.transaction_type;
  
  if (type.includes('cash_in') || type.includes('deposit')) {
    return { 
      icon: <ArrowDownLeft className="h-4 w-4 text-primary" />, 
      bg: 'bg-primary/10',
      label: 'Deposit'
    };
  }
  if (type.includes('cash_out') || type.includes('withdrawal')) {
    return { 
      icon: <ArrowUpRight className="h-4 w-4 text-destructive" />, 
      bg: 'bg-destructive/10',
      label: 'Withdrawal'
    };
  }
  if (type.includes('transfer')) {
    return { 
      icon: <RefreshCw className="h-4 w-4 text-muted-foreground" />, 
      bg: 'bg-muted',
      label: 'Transfer'
    };
  }
  if (type.includes('referral') || type.includes('commission') || type.includes('royalty')) {
    return { 
      icon: <Coins className="h-4 w-4 text-primary" />, 
      bg: 'bg-primary/10',
      label: 'Royalty'
    };
  }
  if (type.includes('task') || type.includes('reward') || type.includes('mission')) {
    return { 
      icon: <CheckCircle2 className="h-4 w-4 text-primary" />, 
      bg: 'bg-primary/10',
      label: 'Mission'
    };
  }
  if (type.includes('loan') || type.includes('lending')) {
    return { 
      icon: <Banknote className="h-4 w-4 text-primary" />, 
      bg: 'bg-primary/10',
      label: 'Lending'
    };
  }
  if (type.includes('fee')) {
    return { 
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />, 
      bg: 'bg-muted',
      label: 'Fee'
    };
  }
  
  return { 
    icon: <Coins className="h-4 w-4 text-muted-foreground" />, 
    bg: 'bg-muted',
    label: 'Transaction'
  };
}

export default function BankApp() {
  const wallets = useAppStore((state) => state.wallets);
  const [exchangerOpen, setExchangerOpen] = useState(false);
  const { hasPendingTransactions, optimisticTransfer } = useOptimisticWallets();
  
  const { data: transactions, isLoading: txLoading } = useWalletTransactions(10);
  
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  const mainWallet = wallets.find(w => w.type === 'main');
  const taskWallet = wallets.find(w => w.type === 'task');
  const royaltyWallet = wallets.find(w => w.type === 'royalty');

  const handleTransferToMain = async () => {
    if (taskWallet && taskWallet.balance >= 100) {
      await optimisticTransfer('task', 'main', taskWallet.balance);
    }
  };

  return (
    <AlphaLayout 
      title="Bank" 
      subtitle="Sovereign Vault & Exchanger"
      appColor="from-primary to-primary"
    >
      {/* User State Indicator */}
      <UserStateIndicator state="ACTIVE" fraudScore={15} />

      {/* Sovereign Vault - 2026 Obsidian/Cyan Theme */}
      <div className="terminal-card my-6 overflow-hidden relative rounded">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground relative z-10">
          <p className="text-sm opacity-80 mb-1">Total ₳ Credits</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono tabular-nums">₳{formatAlpha(totalBalance)}</span>
          </div>
          <p className="text-xs opacity-60 mt-2">
            Sovereign Ledger Balance • Amabilia Network
          </p>
        </div>
        <CardContent className="p-4 bg-card relative z-10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Main</p>
              <p className="font-bold text-foreground font-mono tabular-nums">₳{formatAlpha(mainWallet?.balance || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Activity</p>
              <p className="font-bold text-foreground font-mono tabular-nums">₳{formatAlpha(taskWallet?.balance || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Royalty</p>
              <p className="font-bold text-foreground font-mono tabular-nums">₳{formatAlpha(royaltyWallet?.balance || 0)}</p>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Quick Actions - 2026 Button Style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <EliteButton 
          variant="default" 
          size="sm"
          className="flex-col gap-1 h-auto py-3 haptic-press"
          onClick={() => setExchangerOpen(true)}
          leftIcon={<ArrowDownLeft className="h-5 w-5" />}
        >
          <span className="text-[10px]">Exchange</span>
        </EliteButton>
        <EliteButton 
          variant="outline" 
          size="sm"
          className="flex-col gap-1 h-auto py-3 haptic-press"
          loading={hasPendingTransactions}
          onClick={handleTransferToMain}
          leftIcon={<RefreshCw className="h-5 w-5" />}
        >
          <span className="text-[10px]">Transfer</span>
        </EliteButton>
        <EliteButton 
          variant="ghost" 
          size="sm"
          className="flex-col gap-1 h-auto py-3 haptic-press"
          disabled
          leftIcon={<QrCode className="h-5 w-5" />}
        >
          <span className="text-[10px]">QR Code</span>
        </EliteButton>
        <EliteButton 
          variant="ghost" 
          size="sm"
          className="flex-col gap-1 h-auto py-3 haptic-press"
          disabled
          leftIcon={<History className="h-5 w-5" />}
        >
          <span className="text-[10px]">History</span>
        </EliteButton>
      </div>

      {/* Floating Exchanger Button */}
      <div className="fixed bottom-28 right-4 z-40">
        <EliteButton 
          size="icon"
          variant="default"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl animate-pulse haptic-press"
          onClick={() => setExchangerOpen(true)}
        >
          <span className="text-2xl font-bold">₳</span>
        </EliteButton>
      </div>

      {/* Credit Accounts - 2026 Theme */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Credit Accounts
        </h3>
        
        <WalletCard 
          name="Main Wallet"
          balance={mainWallet?.balance || 0}
          description="Primary credit storage"
        />
        
        <WalletCard 
          name="Activity Wallet"
          balance={taskWallet?.balance || 0}
          description="Credits from completed activities"
        />
        
        <WalletCard 
          name="Royalty Wallet"
          balance={royaltyWallet?.balance || 0}
          description="Network participation credits"
        />
      </div>

      {/* Recent Activity - 2026 Theme */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Recent Activity
        </h3>
        
        {txLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="terminal-card rounded">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16 ml-auto" />
                      <Skeleton className="h-5 w-12 ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </div>
            ))}
          </>
        ) : transactions && transactions.length > 0 ? (
          transactions.map((tx) => {
            const display = getTransactionDisplay(tx);
            const isPositive = tx.amount > 0;
            const timeAgo = tx.created_at 
              ? formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })
              : 'Unknown';
            
            return (
              <div key={tx.id} className="terminal-card rounded widget-hover">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${display.bg}`}>
                        {display.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {tx.description || display.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold font-mono tabular-nums ${isPositive ? 'text-primary text-glow-cyan' : 'text-foreground'}`}>
                        {isPositive ? '+' : ''}₳{formatAlpha(Math.abs(tx.amount))}
                      </p>
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        {display.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </div>
            );
          })
        ) : (
          <div className="terminal-card rounded">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your activity will appear here
              </p>
            </CardContent>
          </div>
        )}
      </div>

      {/* Account Lifecycle */}
      <div className="terminal-card mt-6 relative rounded">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Account Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserLifecycleFlow />
        </CardContent>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          ₳ Credits are internal system units for platform participation only. 
          They do not represent money, stored value, or investment.
        </p>
      </div>

      {/* Exchanger Modal */}
      <ExchangerModal open={exchangerOpen} onOpenChange={setExchangerOpen} />
    </AlphaLayout>
  );
}

// Wallet Card - 2026 Theme
function WalletCard({ 
  name, 
  balance, 
  description
}: { 
  name: string; 
  balance: number; 
  description: string;
}) {
  return (
    <div className="terminal-card overflow-hidden widget-hover transition-all rounded">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-primary/10 border border-primary/20">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-foreground font-mono tabular-nums">₳{formatAlpha(balance)}</p>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Active</Badge>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
