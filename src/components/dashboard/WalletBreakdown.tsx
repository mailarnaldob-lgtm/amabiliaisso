import { motion } from 'framer-motion';
import { Wallet, Zap, Crown, ArrowUpDown } from 'lucide-react';
import { formatAlpha, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface WalletBreakdownProps {
  mainBalance: number;
  taskBalance: number;
  royaltyBalance: number;
  canAccessElite?: boolean;
}

export function WalletBreakdown({ 
  mainBalance, 
  taskBalance, 
  royaltyBalance,
  canAccessElite = false 
}: WalletBreakdownProps) {
  const wallets = [
    {
      id: 'main',
      name: 'Main Vault',
      description: 'Primary funds',
      balance: mainBalance,
      icon: Wallet,
      color: 'from-[#FFD700] to-[#FFA500]',
      textColor: 'text-[#FFD700]',
      locked: false,
    },
    {
      id: 'task',
      name: 'Activity Credits',
      description: 'From assignments',
      balance: taskBalance,
      icon: Zap,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-400',
      locked: false,
    },
    {
      id: 'royalty',
      name: 'Referral Credits',
      description: 'Partner commissions',
      balance: royaltyBalance,
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-400',
      locked: !canAccessElite,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-card border border-border",
        "p-5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground">Wallet Breakdown</h3>
          <p className="text-xs text-muted-foreground">Your credit distribution</p>
        </div>
        <Link to="/dashboard/bank">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs haptic-press">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Transfer
          </Button>
        </Link>
      </div>

      {/* Wallet Cards */}
      <div className="space-y-3">
        {wallets.map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg",
              "bg-muted/20 border border-border/50",
              "hover:bg-muted/40 transition-colors",
              wallet.locked && "opacity-60"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
              wallet.color
            )}>
              <wallet.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">{wallet.name}</p>
                {wallet.locked && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                    Elite
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{wallet.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={cn("text-lg font-bold font-mono", wallet.textColor)}>
                ₳{formatAlpha(wallet.balance)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
