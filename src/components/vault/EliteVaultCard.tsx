import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vault, TrendingUp, Lock, ArrowDownToLine, ArrowUpFromLine, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatAlpha, cn } from '@/lib/utils';
import { useEliteVault } from '@/hooks/useEliteVault';
import { useTierAccess } from '@/components/tier';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function EliteVaultCard() {
  const { canAccessElite } = useTierAccess();
  const { vault, isLoading, deposit, withdraw, isDepositing, isWithdrawing } = useEliteVault();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Only show for Elite members
  if (!canAccessElite) {
    return null;
  }

  const totalBalance = vault?.total_balance || 0;
  const frozenCollateral = vault?.frozen_collateral || 0;
  const availableBalance = vault?.available_balance || totalBalance - frozenCollateral;
  const dailyYield = Math.floor(totalBalance * 0.01);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-gradient-to-br from-primary/10 via-card to-card",
        "border border-primary/30",
        "p-5"
      )}
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Vault className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              Elite Vault
              <Sparkles className="h-4 w-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground">1% Daily Yield</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary/30">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span className="text-xs font-medium text-primary">+₳{formatAlpha(dailyYield)}/day</span>
        </div>
      </div>

      {/* Balance Display */}
      <div className="space-y-3 mb-5 relative z-10">
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Total Vault Balance</p>
          <p className="text-2xl font-bold text-primary font-mono">
            ₳{formatAlpha(totalBalance)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] text-muted-foreground">Available</span>
            </div>
            <p className="text-sm font-bold text-foreground font-mono">
              ₳{formatAlpha(availableBalance)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <div className="flex items-center gap-1 mb-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Collateral</span>
            </div>
            <p className="text-sm font-bold text-foreground font-mono">
              ₳{formatAlpha(frozenCollateral)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 border-primary/30 hover:bg-primary/10"
              disabled={isLoading}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Deposit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit to Vault</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Amount (₳)</Label>
                <Input
                  type="number"
                  placeholder="Minimum ₳100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min={100}
                />
                <p className="text-xs text-muted-foreground">
                  Funds earn 1% daily yield in the vault
                </p>
              </div>
              <Button 
                onClick={handleDeposit} 
                disabled={isDepositing || parseFloat(depositAmount) < 100}
                className="w-full"
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
              className="gap-2 border-border hover:bg-muted/50"
              disabled={isLoading || availableBalance <= 0}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Withdraw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw from Vault</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Amount (₳)</Label>
                <Input
                  type="number"
                  placeholder={`Max ₳${formatAlpha(availableBalance)}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={availableBalance}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">
                  Available: ₳{formatAlpha(availableBalance)} (Frozen: ₳{formatAlpha(frozenCollateral)})
                </p>
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

      {/* Yield Info */}
      <p className="text-[10px] text-center text-muted-foreground mt-4 relative z-10">
        Frozen collateral still earns yield but cannot be withdrawn
      </p>
    </motion.div>
  );
}
