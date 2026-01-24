import { useState, useEffect } from 'react';
import { formatAlpha } from '@/lib/utils';
import { useTierAccess } from '@/components/tier';
import { useWallets } from '@/hooks/useWallets';
import { EliteButton } from '@/components/ui/elite-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ArrowUpDown, 
  RefreshCw,
  Crown,
  TrendingUp,
  Zap,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletEngineProps {
  onTransfer?: (from: string, to: string, amount: number) => void;
  isTransferring?: boolean;
}

/**
 * Responsive Triple-Balance Wallet Engine
 * Mobile-first design with vertical stacking on small screens
 * TradingView Terminal aesthetic with 3D titanium card effects
 * Real-time balance updates via Supabase Realtime
 */
export function ResponsiveWalletEngine({ onTransfer, isTransferring }: WalletEngineProps) {
  // Use real wallet data from Supabase with real-time updates
  const { wallets, totalBalance, isFallback, isLoading, refetch } = useWallets();
  const { canAccessElite } = useTierAccess();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showRealtimeSync, setShowRealtimeSync] = useState(false);
  
  // Get wallet balances - handle both wallet_type and type properties
  const getWalletBalance = (type: string): number => {
    const wallet = wallets.find(w => 
      w.wallet_type === type || (w as any).type === type
    );
    return wallet?.balance || 0;
  };

  const mainBalance = getWalletBalance('main');
  const taskBalance = getWalletBalance('task');
  const royaltyBalance = getWalletBalance('royalty');

  // Flash indicator when realtime data updates
  useEffect(() => {
    if (!isFallback && wallets.length > 0) {
      setShowRealtimeSync(true);
      const timer = setTimeout(() => setShowRealtimeSync(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [wallets, isFallback]);

  return (
    <div className="space-y-4">
      {/* Total Balance Hero Card - Black Titanium */}
      <div 
        className={cn(
          "relative overflow-hidden rounded-2xl p-6",
          "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900",
          "border border-zinc-700/50",
          "shadow-2xl shadow-black/50",
          // 3D Tilt Effect (15-degree)
          "transform-gpu perspective-1000",
          "hover:rotate-x-1 hover:rotate-y-2",
          "transition-transform duration-500 ease-out",
          // Metallic shimmer
          "before:absolute before:inset-0 before:bg-gradient-to-r",
          "before:from-transparent before:via-white/5 before:to-transparent",
          "before:translate-x-[-100%] hover:before:translate-x-[100%]",
          "before:transition-transform before:duration-700"
        )}
        style={{
          transform: 'rotateX(2deg) rotateY(-3deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Metallic Edge Highlight */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-mono text-[10px]">
              SOVEREIGN LEDGER
            </Badge>
            <div className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              showRealtimeSync ? "text-amber-400" : "text-emerald-400"
            )}>
              {showRealtimeSync ? (
                <Wifi className="h-3 w-3 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {showRealtimeSync ? "SYNCING" : "LIVE"}
            </div>
          </div>
          
          <p className="text-zinc-400 text-sm mb-1">Total ₳ Credits</p>
          <div className="flex items-baseline gap-2">
            <span className="text-amber-400 text-5xl md:text-6xl font-bold">₳</span>
            <span className={cn(
              "text-white text-4xl md:text-5xl font-bold tracking-tight transition-all",
              showRealtimeSync && "animate-pulse"
            )}>
              {formatAlpha(totalBalance)}
            </span>
          </div>
          
          <p className="text-zinc-500 text-xs mt-3 font-mono">
            Alpha Business Cooperative Production v1.0
          </p>
        </div>
        
        {/* Embossed Pattern */}
        <div 
          className="absolute bottom-0 right-0 w-32 h-32 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Triple Wallet Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Main Wallet */}
        <WalletTile
          name="Main Vault"
          icon={<Wallet className="h-5 w-5" />}
          balance={mainBalance}
          gradient="from-amber-500 to-orange-600"
          isSelected={selectedWallet === 'main'}
          onClick={() => setSelectedWallet(selectedWallet === 'main' ? null : 'main')}
          isSyncing={showRealtimeSync}
        />
        
        {/* Task Wallet */}
        <WalletTile
          name="Activity Credits"
          icon={<Zap className="h-5 w-5" />}
          balance={taskBalance}
          gradient="from-emerald-500 to-teal-600"
          isSelected={selectedWallet === 'task'}
          onClick={() => setSelectedWallet(selectedWallet === 'task' ? null : 'task')}
          isSyncing={showRealtimeSync}
        />
        
        {/* Royalty Wallet */}
        <WalletTile
          name="Referral Credits"
          icon={<Crown className="h-5 w-5" />}
          balance={royaltyBalance}
          gradient="from-purple-500 to-pink-600"
          isLocked={!canAccessElite}
          isSelected={selectedWallet === 'royalty'}
          onClick={() => canAccessElite && setSelectedWallet(selectedWallet === 'royalty' ? null : 'royalty')}
          isSyncing={showRealtimeSync}
        />
      </div>

      {/* Quick Transfer Actions */}
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        <EliteButton
          variant="alpha"
          size="sm"
          loading={isTransferring}
          leftIcon={<ArrowUpDown className="h-4 w-4" />}
          disabled={!selectedWallet}
        >
          Transfer to Vault
        </EliteButton>
        
        <EliteButton
          variant="success"
          size="sm"
          leftIcon={<TrendingUp className="h-4 w-4" />}
        >
          Lend Credits
        </EliteButton>
        
        <EliteButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </EliteButton>
      </div>
    </div>
  );
}

interface WalletTileProps {
  name: string;
  icon: React.ReactNode;
  balance: number;
  gradient: string;
  isLocked?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  isSyncing?: boolean;
}

function WalletTile({
  name,
  icon,
  balance,
  gradient,
  isLocked,
  isSelected,
  onClick,
  isSyncing,
}: WalletTileProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-200",
        "transform-gpu active:scale-[0.98]",
        isSelected && "ring-2 ring-primary shadow-lg",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            "p-2 rounded-lg bg-gradient-to-br",
            gradient
          )}>
            <span className="text-white">{icon}</span>
          </div>
          {isLocked && (
            <Badge variant="outline" className="text-[10px]">ELITE</Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-1">{name}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-amber-500 text-xl font-bold">₳</span>
          <span className={cn(
            "text-xl font-bold text-foreground transition-all",
            isSyncing && "animate-pulse"
          )}>
            {formatAlpha(balance)}
          </span>
        </div>
      </CardContent>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
      )}
    </Card>
  );
}
