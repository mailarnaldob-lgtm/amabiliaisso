import { useState } from 'react';
import { ArrowDownUp, ArrowRight, Wallet, Banknote, CreditCard, Building2 } from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const paymentMethods = [
  { id: 'gcash', name: 'GCash', icon: '💚' },
  { id: 'maya', name: 'Maya', icon: '💜' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
];

export function SwapWidget() {
  const { swapMode, setSwapMode, wallets, swapToAlpha, swapToPHP } = useAppStore();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('gcash');
  const [isProcessing, setIsProcessing] = useState(false);

  const mainWallet = wallets.find((w) => w.type === 'main');
  const numericAmount = parseFloat(amount) || 0;
  
  // 2% fee for cash out
  const fee = swapMode === 'cashout' ? numericAmount * 0.02 : 0;
  const netAmount = numericAmount - fee;

  const handleSwap = async () => {
    if (numericAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (swapMode === 'cashout' && mainWallet && numericAmount > mainWallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (swapMode === 'cashin') {
      swapToAlpha(numericAmount);
      toast.success(`Successfully converted ₱${formatAlpha(numericAmount)} to ₳${formatAlpha(numericAmount)}`);
    } else {
      swapToPHP(numericAmount);
      toast.success(`Withdrawal of ₱${formatAlpha(netAmount)} initiated`);
    }
    
    setAmount('');
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Swap Mode Toggle */}
      <div className="flex rounded-xl bg-secondary p-1 mb-6">
        <button
          onClick={() => setSwapMode('cashin')}
          className={cn(
            'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300',
            swapMode === 'cashin'
              ? 'bg-alpha text-alpha-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Cash In
        </button>
        <button
          onClick={() => setSwapMode('cashout')}
          className={cn(
            'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300',
            swapMode === 'cashout'
              ? 'bg-alpha text-alpha-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Cash Out
        </button>
      </div>

      {/* Swap Card */}
      <div className="glass-card rounded-2xl p-6 swap-glow">
        {/* From Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {swapMode === 'cashin' ? 'You Send' : 'You Withdraw'}
            </span>
            {swapMode === 'cashout' && mainWallet && (
              <span className="text-xs text-muted-foreground">
                Balance: ₳{formatAlpha(mainWallet.balance)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border border-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
              <span className="text-lg">{swapMode === 'cashin' ? '₱' : '₳'}</span>
              <span className="font-medium">{swapMode === 'cashin' ? 'PHP' : 'AMB'}</span>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-0 bg-transparent text-2xl font-bold text-right focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center my-4">
          <div className="p-3 rounded-full bg-alpha/10 border border-alpha/30">
            <ArrowDownUp className="w-5 h-5 text-alpha" />
          </div>
        </div>

        {/* To Section */}
        <div className="space-y-3">
          <span className="text-sm text-muted-foreground">You Receive</span>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border border-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
              <span className="text-lg">{swapMode === 'cashin' ? '₳' : '₱'}</span>
              <span className="font-medium">{swapMode === 'cashin' ? 'AMB' : 'PHP'}</span>
            </div>
            <div className="flex-1 text-right">
              <span className="text-2xl font-bold">
                {formatAlpha(swapMode === 'cashin' ? numericAmount : netAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Info */}
        {swapMode === 'cashout' && numericAmount > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing Fee (2%)</span>
              <span className="text-warning">-₱{formatAlpha(fee)}</span>
            </div>
          </div>
        )}

        {/* Rate Info */}
        <div className="mt-4 p-3 rounded-lg bg-alpha/5 border border-alpha/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="text-alpha font-medium">1 ₳ = 1 PHP</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-6 space-y-3">
          <span className="text-sm text-muted-foreground">
            {swapMode === 'cashin' ? 'Pay Via' : 'Receive To'}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  'p-3 rounded-xl border transition-all duration-200',
                  selectedMethod === method.id
                    ? 'border-alpha bg-alpha/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="text-2xl mb-1">{method.icon}</div>
                <div className="text-xs font-medium">{method.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSwap}
          disabled={isProcessing || numericAmount <= 0}
          className="w-full mt-6 h-14 text-lg font-semibold alpha-gradient text-alpha-foreground hover:opacity-90 transition-opacity"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-alpha-foreground/30 border-t-alpha-foreground rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <>
              {swapMode === 'cashin' ? 'Convert to ₳' : 'Withdraw to PHP'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        Powered by the ₳ Oracle • Real-time Forex Sync
      </p>
    </div>
  );
}
