/**
 * SAVE VAULT OVERLAY - SOVEREIGN V11.0
 * Cinematic high-security vault interface
 * 
 * Architecture:
 * - RESTful polling (15-second intervals)
 * - No WebSockets or realtime subscriptions
 * - Obsidian Black (#050505) + Alpha Gold (#FFD700)
 * - AnimatedOdometers for all balance figures
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Vault, Shield, Lock, Fingerprint, Sparkles, 
  TrendingUp, ArrowDownToLine, ArrowUpFromLine,
  ChevronDown, ChevronUp, CheckCircle2, Clock,
  Wallet, Coins, AlertTriangle, Dna, CircuitBoard,
  RefreshCw, Info, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useEliteVault, VaultTransaction } from '@/hooks/useEliteVault';
import { useWallets } from '@/hooks/useWallets';
import { useProfile } from '@/hooks/useProfile';
import { OdometerNumber } from '@/components/command/OdometerNumber';
import { AlphaLoader } from '@/components/ui/AlphaLoader';

interface SaveVaultOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTION TYPE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const transactionConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  deposit: { 
    icon: <ArrowDownToLine className="h-3.5 w-3.5" />, 
    color: 'text-emerald-400', 
    label: 'Deposit' 
  },
  withdraw: { 
    icon: <ArrowUpFromLine className="h-3.5 w-3.5" />, 
    color: 'text-orange-400', 
    label: 'Withdrawal' 
  },
  yield: { 
    icon: <Sparkles className="h-3.5 w-3.5" />, 
    color: 'text-[#FFD700]', 
    label: 'Daily Yield' 
  },
  freeze: { 
    icon: <Lock className="h-3.5 w-3.5" />, 
    color: 'text-blue-400', 
    label: 'Collateral Freeze' 
  },
  unfreeze: { 
    icon: <Wallet className="h-3.5 w-3.5" />, 
    color: 'text-teal-400', 
    label: 'Collateral Release' 
  },
  commission: { 
    icon: <TrendingUp className="h-3.5 w-3.5" />, 
    color: 'text-purple-400', 
    label: 'Network Royalty' 
  },
  task_reward: { 
    icon: <Coins className="h-3.5 w-3.5" />, 
    color: 'text-amber-400', 
    label: 'Mission Reward' 
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTION ENTRY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function TransactionEntry({ tx }: { tx: VaultTransaction }) {
  const config = transactionConfig[tx.transaction_type] || {
    icon: <Coins className="h-3.5 w-3.5" />,
    color: 'text-muted-foreground',
    label: tx.transaction_type
  };
  
  const isPositive = ['deposit', 'yield', 'commission', 'task_reward', 'unfreeze'].includes(tx.transaction_type);
  const formattedDate = new Date(tx.created_at).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a]/80 border border-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          "bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 border border-[#FFD700]/20"
        )}>
          <span className={config.color}>{config.icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{config.label}</p>
          <p className="text-[10px] text-muted-foreground">
            {tx.description || formattedDate}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center gap-2">
        <span className={cn(
          "font-bold font-mono text-sm",
          isPositive ? "text-emerald-400" : "text-orange-400"
        )}>
          {isPositive ? '+' : '-'}₳{formatAlpha(Math.abs(tx.amount))}
        </span>
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function SaveVaultOverlay({ isOpen, onClose }: SaveVaultOverlayProps) {
  const { vault, transactions, isLoading, deposit, withdraw, isDepositing, isWithdrawing, refetch } = useEliteVault();
  const { getBalance } = useWallets();
  const { data: profile } = useProfile();
  
  const [isHidden, setIsHidden] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 15-second RESTful polling for real-time updates
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isOpen, refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount >= 100) {
      deposit(amount);
      setDepositAmount('');
      setDepositOpen(false);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 1 && amount <= (vault?.available_balance || 0)) {
      withdraw(amount);
      setWithdrawAmount('');
      setWithdrawOpen(false);
    }
  };

  // Calculate metrics
  const totalBalance = vault?.total_balance || 0;
  const frozenCollateral = vault?.frozen_collateral || 0;
  const availableBalance = vault?.available_balance || (totalBalance - frozenCollateral);
  const dailyYield = Math.floor(totalBalance * 0.01);
  const totalInterestEarned = transactions
    .filter(tx => tx.transaction_type === 'yield')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const isElite = profile?.membership_tier === 'elite';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Obsidian Black Backdrop with DNA/Circuit decoration */}
        <motion.div 
          className="absolute inset-0 bg-[#050505]/95 backdrop-blur-2xl"
          onClick={onClose}
        >
          {/* Circuit Board Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M25 0 v25 h25 v25 h25 v25 h25" fill="none" stroke="#FFD700" strokeWidth="0.5"/>
                  <circle cx="25" cy="25" r="3" fill="#FFD700"/>
                  <circle cx="50" cy="50" r="3" fill="#FFD700"/>
                  <circle cx="75" cy="75" r="3" fill="#FFD700"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuit)"/>
            </svg>
          </div>
        </motion.div>

        {/* Main Content Panel */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
          className="absolute inset-4 sm:inset-8 md:inset-12 lg:inset-20 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex flex-col">
            
            {/* Header with Security Symbols */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Security Icon Cluster */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-lg shadow-[#FFD700]/30">
                    <Vault className="h-8 w-8 text-black" />
                  </div>
                  {/* DNA Circuit accent */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#050505] border border-[#FFD700]/50 flex items-center justify-center">
                    <Dna className="h-3 w-3 text-[#FFD700]" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    Sovereign Vault
                    <Sparkles className="h-5 w-5 text-[#FFD700]" />
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    High-Security Alpha Vault
                    <Lock className="h-3.5 w-3.5" />
                    <Fingerprint className="h-3.5 w-3.5" />
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-muted-foreground hover:text-[#FFD700]"
                >
                  <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Elite Status Check */}
            {!isElite ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <Card className="max-w-md bg-[#0a0a0a]/80 border-[#FFD700]/20">
                  <CardContent className="pt-8 pb-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 border border-[#FFD700]/30 flex items-center justify-center">
                      <Lock className="h-10 w-10 text-[#FFD700]" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Elite Vault Access</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The Sovereign Vault is exclusively available to Elite members.
                      Upgrade to unlock 1% daily yield and P2P lending.
                    </p>
                    <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
                      Upgrade to Elite
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ) : isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <AlphaLoader size="lg" />
              </div>
            ) : (
              <>
                {/* Main Vault Balance - Cinematic Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#FFD700]/10 via-[#0a0a0a] to-[#0a0a0a] border border-[#FFD700]/30 overflow-hidden"
                >
                  {/* Security Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <Shield className="h-20 w-20 text-[#FFD700]" />
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <CircuitBoard className="h-24 w-24 text-[#FFD700]" />
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#FFD700]" />
                        Total Vault Balance
                      </p>
                      <button 
                        onClick={() => setIsHidden(!isHidden)}
                        className="p-1.5 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700]/20 transition-colors"
                      >
                        {isHidden ? (
                          <EyeOff className="h-4 w-4 text-[#FFD700]" />
                        ) : (
                          <Eye className="h-4 w-4 text-[#FFD700]" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-[#FFD700] text-2xl font-bold">₳</span>
                      {isHidden ? (
                        <span className="text-5xl sm:text-6xl font-bold text-[#FFD700] font-mono">••••••</span>
                      ) : (
                        <OdometerNumber 
                          value={totalBalance} 
                          className="text-5xl sm:text-6xl font-bold text-[#FFD700]"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 gap-1">
                        <TrendingUp className="h-3 w-3" />
                        1% DAILY YIELD
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        +₳{formatAlpha(dailyYield)}/day
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* 4-Tier Balance Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
                >
                  {/* Unlocked Balance */}
                  <div className="p-4 rounded-xl bg-[#0a0a0a]/80 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Unlocked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-400 text-sm">₳</span>
                      <OdometerNumber 
                        value={availableBalance} 
                        className="text-xl font-bold text-emerald-400"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Available for use</p>
                  </div>

                  {/* Frozen Collateral */}
                  <div className="p-4 rounded-xl bg-[#0a0a0a]/80 border border-blue-500/30 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-blue-400" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Frozen</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400 text-sm">₳</span>
                      <OdometerNumber 
                        value={frozenCollateral} 
                        className="text-xl font-bold text-blue-400"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Loan collateral</p>
                  </div>

                  {/* Total Interest Earned */}
                  <div className="p-4 rounded-xl bg-[#0a0a0a]/80 border border-[#FFD700]/30 hover:border-[#FFD700]/50 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-4 w-4 text-[#FFD700]" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Earned</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#FFD700] text-sm">₳</span>
                      <OdometerNumber 
                        value={totalInterestEarned} 
                        className="text-xl font-bold text-[#FFD700]"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Vault + Lending</p>
                  </div>

                  {/* Active Debt */}
                  <div className="p-4 rounded-xl bg-[#0a0a0a]/80 border border-red-500/30 hover:border-red-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Debt</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-400 text-sm">₳</span>
                      <OdometerNumber 
                        value={0} 
                        className="text-xl font-bold text-red-400"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">28-day cycle</p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-2 gap-3 mb-6"
                >
                  <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:opacity-90 text-black font-bold">
                        <ArrowDownToLine className="h-5 w-5" />
                        Deposit to Vault
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-[#FFD700]/30">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Vault className="h-5 w-5 text-[#FFD700]" />
                          Deposit to Sovereign Vault
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Main Wallet</span>
                          <span className="font-bold font-mono">₳{formatAlpha(getBalance('main'))}</span>
                        </div>
                        <div className="space-y-2">
                          <Label>Amount (₳)</Label>
                          <Input
                            type="number"
                            placeholder="Minimum ₳100"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            min={100}
                            className="font-mono text-lg bg-[#0a0a0a] border-[#FFD700]/30"
                          />
                          <p className="text-xs text-muted-foreground">
                            Funds earn 1% daily yield in the vault (min ₳5,000 for yield activation)
                          </p>
                        </div>
                        <Button 
                          onClick={handleDeposit} 
                          disabled={isDepositing || parseFloat(depositAmount) < 100}
                          className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold"
                        >
                          {isDepositing ? 'Processing...' : 'Confirm Deposit'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="gap-2 h-12 border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                        disabled={availableBalance <= 0}
                      >
                        <ArrowUpFromLine className="h-5 w-5" />
                        Withdraw
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-[#FFD700]/30">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-[#FFD700]" />
                          Withdraw from Vault
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Available</span>
                          <span className="font-bold text-emerald-400 font-mono">₳{formatAlpha(availableBalance)}</span>
                        </div>
                        {frozenCollateral > 0 && (
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Frozen
                            </span>
                            <span className="font-bold text-blue-400 font-mono">₳{formatAlpha(frozenCollateral)}</span>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Amount (₳)</Label>
                          <Input
                            type="number"
                            placeholder={`Max ₳${formatAlpha(availableBalance)}`}
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            max={availableBalance}
                            min={1}
                            className="font-mono text-lg bg-[#0a0a0a] border-[#FFD700]/30"
                          />
                        </div>
                        <Button 
                          onClick={handleWithdraw} 
                          disabled={isWithdrawing || parseFloat(withdrawAmount) < 1 || parseFloat(withdrawAmount) > availableBalance}
                          className="w-full"
                        >
                          {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </motion.div>

                {/* Expandable Transaction Ledger */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Collapsible open={isLedgerOpen} onOpenChange={setIsLedgerOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto rounded-xl bg-[#0a0a0a]/80 border border-[#FFD700]/20 hover:border-[#FFD700]/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 border border-[#FFD700]/20 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-[#FFD700]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">Transaction Ledger</p>
                            <p className="text-xs text-muted-foreground">
                              {transactions.length} verified records
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] border-[#FFD700]/30 text-[#FFD700]">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          {isLedgerOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {transactions.length === 0 ? (
                          <div className="text-center py-8">
                            <Vault className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No transactions yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Deposit to start earning 1% daily yield
                            </p>
                          </div>
                        ) : (
                          transactions.map((tx) => (
                            <TransactionEntry key={tx.id} tx={tx} />
                          ))
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>

                {/* Business Logic Explanation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 p-4 rounded-xl bg-[#0a0a0a]/50 border border-[#FFD700]/10"
                >
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-[#FFD700] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Sovereign Vault Protocol</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-[#FFD700]">1% Daily Yield:</strong> Interest accrues daily on your total vault balance (including frozen collateral).
                        <br/><br/>
                        <strong className="text-[#FFD700]">28-Day Collateral Insurance:</strong> All P2P loans are backed by frozen collateral. 
                        Upon repayment or auto-liquidation, funds are atomically released.
                        <br/><br/>
                        <strong className="text-[#FFD700]">Royalty Integration:</strong> Network commissions and EARN mission rewards can be 
                        deposited directly into the vault after Admin approval.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
