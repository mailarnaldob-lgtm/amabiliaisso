/**
 * ABC SMART VAULT - SOVEREIGN EXECUTION V9.1
 * Elite-only high-performance financial engine
 * 4-Tier Balance Display with Dynamic Lending/Borrowing Capacity
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vault, 
  TrendingUp, 
  Lock, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Sparkles,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Clock,
  PiggyBank,
  Wallet,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatAlpha, cn } from '@/lib/utils';
import { useEliteVault } from '@/hooks/useEliteVault';
import { useEliteQualification } from '@/hooks/useEliteQualification';
import { useWallets } from '@/hooks/useWallets';
import { useMyBorrowedLoans, useMyLentLoans } from '@/hooks/useLoans';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlphaLoader } from '@/components/ui/AlphaLoader';

const MIN_LENDING_CAPACITY = 5000;

interface ABCSmartVaultProps {
  className?: string;
}

export function ABCSmartVault({ className }: ABCSmartVaultProps) {
  const { vault, transactions, isLoading, deposit, withdraw, isDepositing, isWithdrawing } = useEliteVault();
  const { data: qualificationData } = useEliteQualification();
  const { wallets, getBalance } = useWallets();
  const { data: borrowedLoans = [] } = useMyBorrowedLoans();
  const { data: lentLoans = [] } = useMyLentLoans();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Calculate vault metrics
  const totalBalance = vault?.total_balance || 0;
  const frozenCollateral = vault?.frozen_collateral || 0;
  const availableBalance = vault?.available_balance || (totalBalance - frozenCollateral);
  const dailyYield = Math.floor(totalBalance * 0.01);
  
  // Calculate active debt from borrowed loans
  const activeDebt = borrowedLoans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + (l.total_repayment || l.principal_amount), 0);
  
  // Calculate total interest earned from vault transactions
  const totalInterestEarned = transactions
    .filter(tx => tx.transaction_type === 'yield')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Calculate lending capacity - requires min ₳5,000 to trigger 1% daily yield
  const canLend = totalBalance >= MIN_LENDING_CAPACITY;
  const lendingCapacity = canLend ? availableBalance : 0;

  // Calculate borrowing capacity based on referral status
  const qualifiedReferrals = qualificationData?.qualifiedReferrals || 0;
  const isQualifiedForBorrow = qualifiedReferrals >= 3;
  const baseCredit = qualifiedReferrals * 1000; // ₳1,000 per EXPERT referral
  const creditLimit = isQualifiedForBorrow ? Math.min(baseCredit, 10000) : 0;
  const remainingCredit = Math.max(0, creditLimit - activeDebt);

  // Active lending positions
  const activeLentAmount = lentLoans
    .filter(l => l.status === 'active' || l.status === 'pending')
    .reduce((sum, l) => sum + l.principal_amount, 0);

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
    if (amount >= 1 && amount <= availableBalance) {
      withdraw(amount);
      setWithdrawAmount('');
      setWithdrawOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlphaLoader size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-gradient-to-br from-[#FFD700]/10 via-card to-card",
        "border border-[#FFD700]/30",
        "p-5",
        className
      )}
    >
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFD700]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-lg shadow-[#FFD700]/30">
            <Vault className="h-7 w-7 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
              ABC Smart Vault
              <Sparkles className="h-4 w-4 text-[#FFD700]" />
            </h3>
            <p className="text-xs text-muted-foreground">Elite Financial Engine</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/30">
            <TrendingUp className="h-3.5 w-3.5 text-[#FFD700]" />
            <span className="text-sm font-bold text-[#FFD700]">1% Daily</span>
          </div>
          <span className="text-[10px] text-muted-foreground">+₳{formatAlpha(dailyYield)}/day</span>
        </div>
      </div>

      {/* 4-Tier Balance Display */}
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        {/* Unlocked Balance */}
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Unlocked</span>
          </div>
          <p className="text-xl font-bold text-emerald-400 font-mono">
            ₳{formatAlpha(availableBalance)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Available for use</p>
        </motion.div>

        {/* Frozen Collateral */}
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Frozen</span>
          </div>
          <p className="text-xl font-bold text-blue-400 font-mono">
            ₳{formatAlpha(frozenCollateral)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Loan collateral</p>
        </motion.div>

        {/* Total Interest Earned */}
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-[#FFD700]/10 to-[#FFD700]/5 border border-[#FFD700]/20"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-[#FFD700]" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Interest Earned</span>
          </div>
          <p className="text-xl font-bold text-[#FFD700] font-mono">
            ₳{formatAlpha(totalInterestEarned)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Vault + Lending</p>
        </motion.div>

        {/* Active Debt */}
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Debt</span>
          </div>
          <p className="text-xl font-bold text-red-400 font-mono">
            ₳{formatAlpha(activeDebt)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">28-day cycle</p>
        </motion.div>
      </div>

      {/* Total Vault Balance */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFD700]/20 via-[#FFD700]/10 to-transparent border border-[#FFD700]/30 mb-5 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Vault Balance</p>
            <p className="text-3xl font-bold text-[#FFD700] font-mono">
              ₳{formatAlpha(totalBalance)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Active Lending</p>
            <p className="text-lg font-bold text-foreground font-mono">
              ₳{formatAlpha(activeLentAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Capacity Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        {/* Lending Capacity */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "p-3 rounded-lg border transition-all",
                canLend 
                  ? "bg-[#FFD700]/10 border-[#FFD700]/30" 
                  : "bg-muted/30 border-muted/20 opacity-60"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className={cn("h-4 w-4", canLend ? "text-[#FFD700]" : "text-muted-foreground")} />
                  <span className="text-[10px] text-muted-foreground">Capacity to Lend</span>
                </div>
                <p className={cn(
                  "text-lg font-bold font-mono",
                  canLend ? "text-[#FFD700]" : "text-muted-foreground"
                )}>
                  ₳{formatAlpha(lendingCapacity)}
                </p>
                {!canLend && (
                  <p className="text-[9px] text-muted-foreground mt-1">
                    Min ₳5,000 required
                  </p>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Deposit ₳5,000+ to unlock 1% daily yield</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Borrowing Capacity */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "p-3 rounded-lg border transition-all",
                isQualifiedForBorrow 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-muted/30 border-muted/20 opacity-60"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className={cn("h-4 w-4", isQualifiedForBorrow ? "text-emerald-400" : "text-muted-foreground")} />
                  <span className="text-[10px] text-muted-foreground">Credit Limit</span>
                </div>
                <p className={cn(
                  "text-lg font-bold font-mono",
                  isQualifiedForBorrow ? "text-emerald-400" : "text-muted-foreground"
                )}>
                  ₳{formatAlpha(remainingCredit)}
                </p>
                {!isQualifiedForBorrow && (
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {qualifiedReferrals}/3 EXPERT refs
                  </p>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isQualifiedForBorrow 
                ? `Credit limit: ₳${formatAlpha(creditLimit)} (Used: ₳${formatAlpha(activeDebt)})`
                : 'Invite 3 EXPERT referrals to unlock borrowing'
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:opacity-90 text-black font-bold"
              disabled={isLoading}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Deposit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Vault className="h-5 w-5 text-[#FFD700]" />
                Deposit to ABC Vault
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
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
                  className="font-mono text-lg"
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
              className="gap-2 border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
              disabled={isLoading || availableBalance <= 0}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Withdraw
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
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
                  className="font-mono text-lg"
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
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30 relative z-10">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-[#FFD700] mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">28-Day Insurance:</strong> All loans are collateralized. 
            Frozen funds still earn yield. Auto-repayment triggers on Day 28 if unpaid, ensuring 0% lender risk.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
