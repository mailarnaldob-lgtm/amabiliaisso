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
 * 2026 Responsive Triple-Balance Wallet Engine
 * Obsidian/Cyan design with sharp corners and platinum borders
 */
export function ResponsiveWalletEngine({ onTransfer, isTransferring }: WalletEngineProps) {
  const { wallets, totalBalance, isFallback, isLoading, refetch } = useWallets();
  const { canAccessElite } = useTierAccess();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showRealtimeSync, setShowRealtimeSync] = useState(false);
  
  const getWalletBalance = (type: string): number => {
    const wallet = wallets.find(w => 
      w.wallet_type === type || (w as any).type === type
    );
    return wallet?.balance || 0;
  };

  const mainBalance = getWalletBalance('main');
  const taskBalance = getWalletBalance('task');
  const royaltyBalance = getWalletBalance('royalty');

  useEffect(() => {
    if (!isFallback && wallets.length > 0) {
      setShowRealtimeSync(true);
      const timer = setTimeout(() => setShowRealtimeSync(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [wallets, isFallback]);

  return (
    <div className="space-y-4">
      {/* Total Balance Hero Card - 2026 Obsidian/Cyan Theme */}
      <div 
        className={cn(
          "relative overflow-hidden rounded p-6",
          "bg-gradient-to-br from-card via-card to-card",
          "border border-border",
          "shadow-xl",
          "transform-gpu",
          "hover:shadow-2xl transition-shadow duration-300"
        )}
      >
        {/* Cyan circuit glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] uppercase tracking-wider">
              Sovereign Ledger
            </Badge>
            <div className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              showRealtimeSync ? "text-primary" : "text-primary/70"
            )}>
              {showRealtimeSync ? (
                <Wifi className="h-3 w-3 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              {showRealtimeSync ? "SYNCING" : "LIVE"}
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-1">Total ₳ Credits</p>
          <div className="flex items-baseline gap-2">
            <span className="text-primary text-5xl md:text-6xl font-bold text-glow-cyan">₳</span>
            <span className={cn(
              "text-foreground text-4xl md:text-5xl font-bold tracking-tight font-mono transition-all",
              showRealtimeSync && "animate-pulse"
            )}>
              {formatAlpha(totalBalance)}
            </span>
          </div>
          
          <p className="text-muted-foreground text-xs mt-3 font-mono">
            Amabilia Network • 2026
          </p>
        </div>
      </div>

      {/* Triple Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <WalletTile
          name="Main Vault"
          icon={<Wallet className="h-5 w-5" />}
          balance={mainBalance}
          isSelected={selectedWallet === 'main'}
          onClick={() => setSelectedWallet(selectedWallet === 'main' ? null : 'main')}
          isSyncing={showRealtimeSync}
        />
        
        <WalletTile
          name="Activity Credits"
          icon={<Zap className="h-5 w-5" />}
          balance={taskBalance}
          isSelected={selectedWallet === 'task'}
          onClick={() => setSelectedWallet(selectedWallet === 'task' ? null : 'task')}
          isSyncing={showRealtimeSync}
        />
        
        <WalletTile
          name="Referral Credits"
          icon={<Crown className="h-5 w-5" />}
          balance={royaltyBalance}
          isLocked={!canAccessElite}
          isSelected={selectedWallet === 'royalty'}
          onClick={() => canAccessElite && setSelectedWallet(selectedWallet === 'royalty' ? null : 'royalty')}
          isSyncing={showRealtimeSync}
        />
      </div>

      {/* Quick Transfer Actions - 2026 Button Style */}
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        <EliteButton
          variant="default"
          size="sm"
          loading={isTransferring}
          leftIcon={<ArrowUpDown className="h-4 w-4" />}
          disabled={!selectedWallet}
          className="haptic-press"
        >
          Transfer to Vault
        </EliteButton>
        
        <EliteButton
          variant="outline"
          size="sm"
          leftIcon={<TrendingUp className="h-4 w-4" />}
          className="haptic-press"
        >
          Lend Credits
        </EliteButton>
        
        <EliteButton
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => refetch()}
          loading={isLoading}
          className="haptic-press"
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
  isLocked?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  isSyncing?: boolean;
}

function WalletTile({
  name,
  icon,
  balance,
  isLocked,
  isSelected,
  onClick,
  isSyncing,
}: WalletTileProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-150",
        "transform-gpu haptic-press widget-hover",
        "bg-card border-border",
        isSelected && "ring-2 ring-primary shadow-lg",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded bg-primary/10 border border-primary/20">
            <span className="text-primary">{icon}</span>
          </div>
          {isLocked && (
            <Badge variant="outline" className="text-[10px] border-border">ELITE</Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-1">{name}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-primary text-xl font-bold">₳</span>
          <span className={cn(
            "text-xl font-bold text-foreground font-mono transition-all",
            isSyncing && "animate-pulse"
          )}>
            {formatAlpha(balance)}
          </span>
        </div>
      </CardContent>
      
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </Card>
  );
}
