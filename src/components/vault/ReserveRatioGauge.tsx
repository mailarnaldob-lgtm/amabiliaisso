/**
 * RESERVE RATIO GAUGE - SOVEREIGN EXECUTION V9.1
 * 115% Reserve Monitoring with Circuit Breaker
 * Triggers UI lock if ratio drops below 100%
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Lock, TrendingUp, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn, formatAlpha } from '@/lib/utils';
import { useLoanStats } from '@/hooks/useLoans';
import { useEliteVault } from '@/hooks/useEliteVault';

interface ReserveRatioGaugeProps {
  className?: string;
  onCircuitBreaker?: (triggered: boolean) => void;
}

const HEALTHY_RATIO = 115;
const WARNING_RATIO = 105;
const CRITICAL_RATIO = 100;

export function ReserveRatioGauge({ className, onCircuitBreaker }: ReserveRatioGaugeProps) {
  const { data: loanStats } = useLoanStats();
  const { vault } = useEliteVault();
  const [isBreaker, setIsBreaker] = useState(false);
  
  // Calculate reserve ratio
  // Total vault balance / Total active loan obligations
  const totalVaultBalance = vault?.total_balance || 0;
  const totalActiveValue = loanStats?.totalActiveValue || 0;
  
  // Reserve ratio = (Available Reserves / Obligations) * 100
  const reserveRatio = totalActiveValue > 0 
    ? Math.round((totalVaultBalance / totalActiveValue) * 100) 
    : 200; // Default healthy if no obligations
  
  // Determine status
  const status = reserveRatio >= HEALTHY_RATIO 
    ? 'healthy' 
    : reserveRatio >= WARNING_RATIO 
      ? 'warning' 
      : reserveRatio >= CRITICAL_RATIO 
        ? 'critical' 
        : 'breaker';
  
  useEffect(() => {
    const triggered = status === 'breaker';
    setIsBreaker(triggered);
    onCircuitBreaker?.(triggered);
  }, [status, onCircuitBreaker]);
  
  const statusConfig = {
    healthy: {
      color: 'emerald',
      icon: <Shield className="h-5 w-5 text-emerald-400" />,
      label: 'Healthy',
      description: 'System reserves are optimal',
      progressClass: 'bg-emerald-500',
    },
    warning: {
      color: 'yellow',
      icon: <Activity className="h-5 w-5 text-yellow-400" />,
      label: 'Caution',
      description: 'Monitor reserve levels',
      progressClass: 'bg-yellow-500',
    },
    critical: {
      color: 'orange',
      icon: <AlertTriangle className="h-5 w-5 text-orange-400" />,
      label: 'Critical',
      description: 'Reserves approaching minimum',
      progressClass: 'bg-orange-500',
    },
    breaker: {
      color: 'red',
      icon: <Lock className="h-5 w-5 text-red-400" />,
      label: 'CIRCUIT BREAKER',
      description: 'New lending suspended',
      progressClass: 'bg-red-500',
    },
  };
  
  const config = statusConfig[status];
  
  // Normalize for progress display (cap at 200%)
  const progressValue = Math.min(reserveRatio, 200) / 2;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl overflow-hidden",
        "bg-gradient-to-br from-card to-card/80",
        "border",
        status === 'breaker' && "border-red-500/50 bg-red-500/5",
        status === 'critical' && "border-orange-500/50",
        status === 'warning' && "border-yellow-500/50",
        status === 'healthy' && "border-emerald-500/30",
        className
      )}
    >
      {/* Circuit Breaker Alert */}
      <AnimatePresence>
        {isBreaker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/20 border-b border-red-500/30 p-3"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-400 animate-pulse" />
              <span className="text-sm font-bold text-red-400">
                CIRCUIT BREAKER ACTIVE
              </span>
            </div>
            <p className="text-xs text-red-300/80 mt-1 ml-6">
              Reserve ratio below 100%. New lending operations suspended until reserves recover.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              status === 'healthy' && "bg-emerald-500/20 border border-emerald-500/30",
              status === 'warning' && "bg-yellow-500/20 border border-yellow-500/30",
              status === 'critical' && "bg-orange-500/20 border border-orange-500/30",
              status === 'breaker' && "bg-red-500/20 border border-red-500/30 animate-pulse"
            )}>
              {config.icon}
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">Reserve Ratio</h4>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "font-mono text-sm",
              status === 'healthy' && "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
              status === 'warning' && "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
              status === 'critical' && "border-orange-500/30 text-orange-400 bg-orange-500/10",
              status === 'breaker' && "border-red-500/30 text-red-400 bg-red-500/10"
            )}
          >
            {reserveRatio}%
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressValue}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                "h-full rounded-full",
                config.progressClass
              )}
            />
            {/* Target markers */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white/50"
              style={{ left: `${CRITICAL_RATIO / 2}%` }}
            />
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white/30"
              style={{ left: `${HEALTHY_RATIO / 2}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="text-red-400">100%</span>
            <span className="text-emerald-400">115%+</span>
            <span>200%</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/50">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vault Reserves</p>
            <p className="font-mono text-sm font-bold text-foreground">
              ₳{formatAlpha(totalVaultBalance)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Obligations</p>
            <p className="font-mono text-sm font-bold text-foreground">
              ₳{formatAlpha(totalActiveValue)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
