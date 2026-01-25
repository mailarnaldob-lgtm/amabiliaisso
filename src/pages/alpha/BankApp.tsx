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

// Transaction type to icon/color mapping
function getTransactionDisplay(tx: WalletTransaction) {
  const type = tx.transaction_type;
  
  if (type.includes('cash_in') || type.includes('deposit')) {
    return { 
      icon: <ArrowDownLeft className="h-4 w-4 text-emerald-500" />, 
      bg: 'bg-emerald-500/10',
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
      icon: <Coins className="h-4 w-4 text-purple-500" />, 
      bg: 'bg-purple-500/10',
      label: 'Royalty'
    };
  }
  if (type.includes('task') || type.includes('reward') || type.includes('mission')) {
    return { 
      icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />, 
      bg: 'bg-blue-500/10',
      label: 'Mission'
    };
  }
  if (type.includes('loan') || type.includes('lending')) {
    return { 
      icon: <Banknote className="h-4 w-4 text-amber-500" />, 
      bg: 'bg-amber-500/10',
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
  
  // Default
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
  
  // Fetch real transactions from Sovereign Ledger
  const { data: transactions, isLoading: txLoading } = useWalletTransactions(10);
  
  // Calculate total balance
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  // Find individual wallet balances
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
      title="₳LPHA BANK" 
      subtitle="Sovereign Vault & Exchanger"
      appColor="from-amber-500 to-orange-600"
    >

      {/* User State Indicator */}
      <UserStateIndicator state="ACTIVE" fraudScore={15} />

      {/* ═══════════════════════════════════════════════════════════════
          SOVEREIGN VAULT - Total Balance Card with Obsidian Standard
      ═══════════════════════════════════════════════════════════════ */}
      <div className="titanium-card gold-corners my-6 overflow-hidden relative obsidian-grain">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative z-10">
          <p className="text-sm opacity-80 mb-1 font-serif">Total ₳ Credits</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono tabular-nums">₳{formatAlpha(totalBalance)}</span>
          </div>
          <p className="text-xs opacity-60 mt-2">
            Sovereign Ledger Balance • Non-monetary • Admin-controlled
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

      {/* Quick Actions - Elite Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <EliteButton 
          variant="success" 
          size="sm"
          className="flex-col gap-1 h-auto py-3"
          onClick={() => setExchangerOpen(true)}
          leftIcon={<ArrowDownLeft className="h-5 w-5" />}
        >
          <span className="text-[10px]">Exchange</span>
        </EliteButton>
        <EliteButton 
          variant="alpha" 
          size="sm"
          className="flex-col gap-1 h-auto py-3"
          loading={hasPendingTransactions}
          onClick={handleTransferToMain}
          leftIcon={<RefreshCw className="h-5 w-5" />}
        >
          <span className="text-[10px]">Transfer</span>
        </EliteButton>
        <EliteButton 
          variant="vault" 
          size="sm"
          className="flex-col gap-1 h-auto py-3"
          disabled
          leftIcon={<QrCode className="h-5 w-5" />}
        >
          <span className="text-[10px]">QR Code</span>
        </EliteButton>
        <EliteButton 
          variant="outline" 
          size="sm"
          className="flex-col gap-1 h-auto py-3"
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
          variant="alpha"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl animate-pulse"
          onClick={() => setExchangerOpen(true)}
        >
          <span className="text-2xl font-bold">₳</span>
        </EliteButton>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CREDIT ACCOUNTS - Wallet Cards with Titanium Standard
      ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gold uppercase tracking-wide font-serif">
          Credit Accounts
        </h3>
        
        <WalletCard 
          name="Main Wallet"
          balance={mainWallet?.balance || 0}
          description="Primary credit storage"
          color="from-amber-500 to-orange-600"
        />
        
        <WalletCard 
          name="Activity Wallet"
          balance={taskWallet?.balance || 0}
          description="Credits from completed activities"
          color="from-emerald-500 to-teal-600"
        />
        
        <WalletCard 
          name="Royalty Wallet"
          balance={royaltyWallet?.balance || 0}
          description="Network participation credits"
          color="from-purple-500 to-pink-600"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RECENT ACTIVITY - Live Transaction Ledger from Sovereign Ledger
      ═══════════════════════════════════════════════════════════════ */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-gold uppercase tracking-wide font-serif">
          Recent Activity
        </h3>
        
        {txLoading ? (
          // Loading skeletons
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="titanium-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
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
          // Real transactions from database
          transactions.map((tx) => {
            const display = getTransactionDisplay(tx);
            const isPositive = tx.amount > 0;
            const timeAgo = tx.created_at 
              ? formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })
              : 'Unknown';
            
            return (
              <div key={tx.id} className="titanium-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${display.bg}`}>
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
                      <p className={`font-bold font-mono tabular-nums ${isPositive ? 'text-success neon-glow' : 'text-foreground'}`}>
                        {isPositive ? '+' : ''}₳{formatAlpha(Math.abs(tx.amount))}
                      </p>
                      <Badge variant="outline" className="text-[10px] border-gold/30 text-gold">
                        {display.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </div>
            );
          })
        ) : (
          // Empty state
          <div className="titanium-card">
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

      {/* User Lifecycle (Collapsible Info) */}
      <div className="titanium-card gold-corners mt-6 relative">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 font-serif text-gold">
            <Clock className="h-4 w-4" />
            Account Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserLifecycleFlow />
        </CardContent>
      </div>

      {/* Disclaimer with Obsidian styling */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border gold-corners relative">
        <p className="text-xs text-muted-foreground text-center">
          ₳ Credits are internal system units for platform participation only. 
          They do not represent money, stored value, or investment. 
          No financial services are offered. All transactions are admin-reviewed.
        </p>
      </div>

      {/* Exchanger Modal */}
      <ExchangerModal open={exchangerOpen} onOpenChange={setExchangerOpen} />
    </AlphaLayout>
  );
}

// Wallet Card with Titanium styling
function WalletCard({ 
  name, 
  balance, 
  description, 
  color 
}: { 
  name: string; 
  balance: number; 
  description: string; 
  color: string;
}) {
  return (
    <div className="titanium-card overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${color}`}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-foreground font-mono tabular-nums">₳{formatAlpha(balance)}</p>
            <Badge variant="outline" className="text-[10px] border-gold/30 text-gold">Active</Badge>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
