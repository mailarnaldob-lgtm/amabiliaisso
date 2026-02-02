import { motion } from 'framer-motion';
import { Wifi, Shield, TrendingUp } from 'lucide-react';
import { formatAlpha, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SovereignBalanceCardProps {
  totalBalance: number;
  isSyncing?: boolean;
  vaultYield?: number;
}

export function SovereignBalanceCard({ 
  totalBalance, 
  isSyncing = false,
  vaultYield = 0.03 // 3% weekly yield
}: SovereignBalanceCardProps) {
  const weeklyYieldAmount = totalBalance * vaultYield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]",
        "border border-[#FFD700]/30",
        "shadow-xl shadow-[#FFD700]/5",
        "p-6"
      )}
    >
      {/* Golden accent glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
      
      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FFD700] to-transparent" />
        <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-[#FFD700] to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-[#FFD700] to-transparent" />
        <div className="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-[#FFD700] to-transparent" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <Badge className="bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30 font-mono text-[10px] uppercase tracking-widest">
          <Shield className="h-3 w-3 mr-1" />
          Sovereign Vault
        </Badge>
        <div className={cn(
          "flex items-center gap-1.5 text-xs",
          isSyncing ? "text-[#FFD700]" : "text-emerald-400"
        )}>
          {isSyncing ? (
            <Wifi className="h-3 w-3 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <span className="font-mono">{isSyncing ? "SYNCING" : "LIVE"}</span>
        </div>
      </div>

      {/* Main Balance */}
      <div className="relative z-10">
        <p className="text-muted-foreground text-sm mb-2">Total Available Balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-[#FFD700] text-5xl md:text-6xl font-bold" style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }}>
            ₳
          </span>
          <span className={cn(
            "text-foreground text-4xl md:text-5xl font-bold tracking-tight font-mono transition-all",
            isSyncing && "animate-pulse"
          )}>
            {formatAlpha(totalBalance)}
          </span>
        </div>
      </div>

      {/* Vault Yield Info */}
      <div className="relative z-10 mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-muted-foreground">P2P Lending Yield</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-400 font-mono">
              +₳{formatAlpha(weeklyYieldAmount)}/week
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              3% weekly • Elite members only
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
