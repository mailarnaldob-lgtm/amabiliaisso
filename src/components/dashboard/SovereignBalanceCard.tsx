import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatAlpha, cn } from '@/lib/utils';

/**
 * Sovereign Balance Card - V8.4
 * Primary balance display with 1% DAILY yield per Blueprint V8.0
 */

interface SovereignBalanceCardProps {
  totalBalance: number;
  isSyncing?: boolean;
  vaultYield?: number; // 0.01 = 1% DAILY for Elite
}

export function SovereignBalanceCard({ 
  totalBalance, 
  isSyncing = false,
  vaultYield = 0 
}: SovereignBalanceCardProps) {
  const [isHidden, setIsHidden] = useState(false);

  // Calculate daily yield amount (1% DAILY per Knowledge)
  const dailyYieldAmount = totalBalance * vaultYield;
  const hasVaultAccess = vaultYield > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-[#FFD700]/30 bg-card"
    >
      {/* Golden Gradient Header */}
      <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-6 relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-black/10 blur-2xl" />
        
        {/* Sync Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <motion.div
            animate={isSyncing ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: isSyncing ? Infinity : 0, duration: 1 }}
            className={cn(
              "w-2 h-2 rounded-full",
              isSyncing ? "bg-black/50" : "bg-emerald-600"
            )}
          />
          <span className="text-[10px] font-medium text-black/70">
            {isSyncing ? 'SYNCING' : 'LIVE'}
          </span>
        </div>

        {/* Balance */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-black/70">Total ₳ Credits</p>
            <button 
              onClick={() => setIsHidden(!isHidden)}
              className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
            >
              {isHidden ? (
                <EyeOff className="h-4 w-4 text-black/70" />
              ) : (
                <Eye className="h-4 w-4 text-black/70" />
              )}
            </button>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold text-black font-mono tabular-nums tracking-tight">
              ₳{isHidden ? '••••••' : formatAlpha(totalBalance)}
            </span>
          </div>

          <p className="text-xs text-black/60 mt-2 font-medium">
            Sovereign Ledger Balance • Amabilia Network
          </p>
        </div>
      </div>

      {/* Vault Yield Section */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg border",
              hasVaultAccess 
                ? "bg-[#FFD700]/10 border-[#FFD700]/30" 
                : "bg-muted border-border"
            )}>
              <Sparkles className={cn(
                "h-5 w-5",
                hasVaultAccess ? "text-[#FFD700]" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Vault Yield</p>
              <p className="text-xs text-muted-foreground">
                {hasVaultAccess ? '1% Daily Compounding' : 'Elite members only'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            {hasVaultAccess ? (
              <>
                <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 font-bold">
                  1% DAILY
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  +₳{formatAlpha(dailyYieldAmount)}/day
                </p>
              </>
            ) : (
              <Badge variant="outline" className="text-muted-foreground border-border">
                Locked
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
