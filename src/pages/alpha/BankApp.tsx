import { useState } from 'react';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  History,
  QrCode,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { formatAlpha } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { ExchangerModal } from '@/components/alpha/ExchangerModal';
import { UserStateIndicator, UserLifecycleFlow } from '@/components/alpha/UserStateIndicator';

// Demo transaction history
const recentTransactions = [
  { id: '1', type: 'deposit', amount: 5000, status: 'completed', date: '2 hours ago', description: 'PHP → ₳ Exchange' },
  { id: '2', type: 'transfer', amount: -500, status: 'completed', date: '1 day ago', description: 'To Main Wallet' },
  { id: '3', type: 'royalty', amount: 150, status: 'completed', date: '2 days ago', description: 'Network Royalty' },
  { id: '4', type: 'mission', amount: 50, status: 'completed', date: '3 days ago', description: 'Mission Reward' },
];

export default function BankApp() {
  const wallets = useAppStore((state) => state.wallets);
  const [exchangerOpen, setExchangerOpen] = useState(false);
  
  // Calculate total balance
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  // Find individual wallet balances
  const mainWallet = wallets.find(w => w.type === 'main');
  const taskWallet = wallets.find(w => w.type === 'task');
  const royaltyWallet = wallets.find(w => w.type === 'royalty');

  return (
    <AlphaLayout 
      title="₳LPHA BANK" 
      subtitle="Wallet & Exchanger"
      appColor="from-amber-500 to-orange-600"
    >
      {/* Demo Notice */}
      <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">UI MOCKUP - For demonstration purposes only</span>
        </div>
      </div>

      {/* User State Indicator */}
      <UserStateIndicator state="ACTIVE" fraudScore={15} />

      {/* Total Balance Card */}
      <Card className="my-6 overflow-hidden">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Total ₳ Credits</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">₳{formatAlpha(totalBalance)}</span>
          </div>
          <p className="text-xs opacity-60 mt-2">
            Internal system credits • Non-monetary • Admin-controlled
          </p>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Main</p>
              <p className="font-bold text-foreground">₳{formatAlpha(mainWallet?.balance || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Activity</p>
              <p className="font-bold text-foreground">₳{formatAlpha(taskWallet?.balance || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Royalty</p>
              <p className="font-bold text-foreground">₳{formatAlpha(royaltyWallet?.balance || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <QuickAction 
          icon={ArrowDownLeft} 
          label="Exchange" 
          color="bg-emerald-500" 
          onClick={() => setExchangerOpen(true)}
        />
        <QuickAction icon={RefreshCw} label="Transfer" color="bg-blue-500" disabled />
        <QuickAction icon={QrCode} label="QR Code" color="bg-purple-500" disabled />
        <QuickAction icon={History} label="History" color="bg-secondary" disabled />
      </div>

      {/* Floating Exchanger Button */}
      <div className="fixed bottom-28 right-4 z-40">
        <Button 
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg hover:shadow-xl transition-all animate-pulse"
          onClick={() => setExchangerOpen(true)}
        >
          <span className="text-2xl font-bold text-white">₳</span>
        </Button>
      </div>

      {/* Wallet Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
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

      {/* Recent Transactions */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Recent Activity
        </h3>
        
        {recentTransactions.map((tx) => (
          <Card key={tx.id}>
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
                  <p className={`font-bold ${tx.amount > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
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

      {/* User Lifecycle (Collapsible Info) */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Account Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserLifecycleFlow />
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
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

function QuickAction({ 
  icon: Icon, 
  label, 
  color,
  disabled,
  onClick
}: { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50 cursor-pointer'}`}
      disabled={disabled}
      onClick={onClick}
    >
      <div className={`p-2 rounded-full ${color} ${disabled ? '' : 'shadow-md'}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </button>
  );
}

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
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
            <p className="font-bold text-foreground">₳{formatAlpha(balance)}</p>
            <Badge variant="outline" className="text-[10px]">Active</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
