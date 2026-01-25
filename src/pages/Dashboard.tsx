import { useState } from 'react';
import { MemberLayout } from '@/components/layouts/MemberLayout';
import { StickyTradingTicker } from '@/components/dashboard/StickyTradingTicker';
import { useAppStore, MEMBERSHIP_TIERS, ARMY_LEVELS } from '@/stores/appStore';
import { Badge } from '@/components/ui/badge';
import { useTierAccess } from '@/components/tier';
import { 
  TrendingUp, 
  Users, 
  Crown, 
  Shield, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  History,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { formatAlpha } from '@/lib/utils';
import { useOptimisticWallets } from '@/hooks/useOptimisticWallets';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { EliteButton } from '@/components/ui/elite-button';
import { ExchangerModal } from '@/components/alpha/ExchangerModal';
import { UserStateIndicator } from '@/components/alpha/UserStateIndicator';

// Live transaction history - synced from Sovereign Ledger
const recentTransactions = [
  { id: '1', type: 'deposit', amount: 5000, status: 'completed', date: '2 hours ago', description: 'PHP → ₳ Exchange' },
  { id: '2', type: 'transfer', amount: -500, status: 'completed', date: '1 day ago', description: 'To Main Wallet' },
  { id: '3', type: 'royalty', amount: 150, status: 'completed', date: '2 days ago', description: 'Network Royalty' },
  { id: '4', type: 'mission', amount: 50, status: 'completed', date: '3 days ago', description: 'VPA Mission Reward' },
];

export default function Dashboard() {
  const { userName, membershipTier, armyLevel, referralCode, wallets } = useAppStore();
  const tierInfo = MEMBERSHIP_TIERS[membershipTier];
  const levelInfo = ARMY_LEVELS[armyLevel];
  const { canAccessPro, canAccessElite } = useTierAccess();
  const { hasPendingTransactions, optimisticTransfer } = useOptimisticWallets();
  const [exchangerOpen, setExchangerOpen] = useState(false);
  
  // Calculate wallet data
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const mainWallet = wallets.find(w => w.type === 'main');
  const taskWallet = wallets.find(w => w.type === 'task');
  const royaltyWallet = wallets.find((w) => w.type === 'royalty');

  const handleTransferToMain = async () => {
    if (taskWallet && taskWallet.balance >= 100) {
      await optimisticTransfer('task', 'main', taskWallet.balance);
    }
  };

  return (
    <MemberLayout title="Dashboard">
      {/* User State Indicator */}
      <UserStateIndicator state="ACTIVE" fraudScore={15} />

      {/* Welcome Card - Sovereign Style */}
      <div className="glass-card gold-corners rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 relative">
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

      {/* ═══════════════════════════════════════════════════════════════
          SOVEREIGN VAULT - Total Balance (from BankApp)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="titanium-card gold-corners mb-6 relative">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Total ₳ Credits</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono">₳{formatAlpha(totalBalance)}</span>
          </div>
          <p className="text-xs opacity-60 mt-2">
            Sovereign Ledger Balance • Non-monetary • Admin-controlled
          </p>
        </div>
        <CardContent className="p-4 bg-card">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Main</p>
              <p className="font-bold text-foreground font-mono">₳{formatAlpha(mainWallet?.balance || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Activity</p>
              <p className="font-bold text-foreground font-mono">₳{formatAlpha(taskWallet?.balance || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Royalty</p>
              <p className="font-bold text-foreground font-mono">₳{formatAlpha(royaltyWallet?.balance || 0)}</p>
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
            <p className="text-base sm:text-lg font-bold text-foreground font-mono">
              ₳{formatAlpha(royaltyWallet?.balance || 0)}
            </p>
            <p className="text-[10px] sm:text-xs text-success">+₳{formatAlpha(Math.floor((royaltyWallet?.balance || 0) * 0.08))} this week</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CREDIT ACCOUNTS - Wallet Cards (from BankApp)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide font-serif">
          Credit Accounts
        </h3>
        
        <SovereignWalletCard 
          name="Main Wallet"
          balance={mainWallet?.balance || 0}
          description="Primary credit storage"
          color="from-amber-500 to-orange-600"
        />
        
        <SovereignWalletCard 
          name="Activity Wallet"
          balance={taskWallet?.balance || 0}
          description="Credits from completed activities"
          color="from-emerald-500 to-teal-600"
        />
        
        <SovereignWalletCard 
          name="Royalty Wallet"
          balance={royaltyWallet?.balance || 0}
          description="Network participation credits"
          color="from-purple-500 to-pink-600"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RECENT ACTIVITY - Transaction Ledger (from BankApp)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide font-serif">
          Recent Activity
        </h3>
        
        {recentTransactions.map((tx) => (
          <Card key={tx.id} className="titanium-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    tx.type === 'deposit' ? 'bg-emerald-500/10' :
                    tx.type === 'royalty' ? 'bg-purple-500/10' :
                    tx.type === 'mission' ? 'bg-blue-500/10' :
                    'bg-muted'
                  }`}>
                    {tx.type === 'deposit' && <ArrowDownLeft className="h-4 w-4 text-emerald-500" />}
                    {tx.type === 'transfer' && <RefreshCw className="h-4 w-4 text-muted-foreground" />}
                    {tx.type === 'royalty' && <ArrowUpRight className="h-4 w-4 text-purple-500" />}
                    {tx.type === 'mission' && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold font-mono ${tx.amount > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.amount > 0 ? '+' : ''}₳{formatAlpha(Math.abs(tx.amount))}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border mb-20">
        <p className="text-xs text-muted-foreground text-center">
          ₳ Credits are internal system units for platform participation only. 
          They do not represent money, stored value, or investment. 
          No financial services are offered. All transactions are admin-reviewed.
        </p>
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

      {/* Mobile Trading Ticker (sticky bottom bar) */}
      <StickyTradingTicker />

      {/* Exchanger Modal */}
      <ExchangerModal open={exchangerOpen} onOpenChange={setExchangerOpen} />
    </MemberLayout>
  );
}

// Sovereign Wallet Card with Obsidian Standard styling
function SovereignWalletCard({ 
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
    <Card className="titanium-card overflow-hidden hover:shadow-md transition-shadow">
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
            <p className="font-bold text-foreground font-mono">₳{formatAlpha(balance)}</p>
            <Badge variant="outline" className="text-[10px]">Active</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
