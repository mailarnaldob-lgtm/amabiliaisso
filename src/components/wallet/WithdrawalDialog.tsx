import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainWalletBalance: number;
}

const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', icon: '💚' },
  { id: 'maya', name: 'Maya', icon: '💜' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
];

const FEE_PERCENT = 2; // 2% withdrawal fee
const MIN_WITHDRAWAL = 100; // Minimum ₱100

export function WithdrawalDialog({ open, onOpenChange, mainWalletBalance }: WithdrawalDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const fee = numericAmount * (FEE_PERCENT / 100);
  const netAmount = numericAmount - fee;

  const isValidAmount = numericAmount >= MIN_WITHDRAWAL && numericAmount <= mainWalletBalance;
  const isFormValid = isValidAmount && accountName.trim().length >= 2 && accountNumber.trim().length >= 6;

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('gcash');
    setAccountName('');
    setAccountNumber('');
    setSuccess(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleWithdraw = async () => {
    if (!user || !isFormValid) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.rpc('cash_out_with_lock', {
        p_user_id: user.id,
        p_amount: numericAmount,
        p_fee_percent: FEE_PERCENT,
        p_payment_method: paymentMethod.toUpperCase(),
        p_account_name: accountName.trim(),
        p_account_number: accountNumber.trim(),
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; net_amount?: number; transaction_id?: string };

      if (!result.success) {
        throw new Error(result.error || 'Withdrawal failed');
      }

      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      
      toast.success('Withdrawal Submitted', {
        description: `₱${netAmount.toFixed(2)} will be sent to your ${paymentMethod.toUpperCase()} account.`,
      });

      // Close after showing success
      setTimeout(() => handleClose(false), 2000);
    } catch (error: any) {
      toast.error('Withdrawal Failed', {
        description: error.message || 'An error occurred. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Withdraw from your Main Wallet to your preferred payment method.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Withdrawal Submitted!</h3>
            <p className="text-muted-foreground">
              Your withdrawal of ₱{netAmount.toFixed(2)} is being processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Balance Display */}
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-semibold">₱{mainWalletBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (min ₱100)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={MIN_WITHDRAWAL}
                max={mainWalletBalance}
              />
              {numericAmount > 0 && numericAmount < MIN_WITHDRAWAL && (
                <p className="text-sm text-destructive">Minimum withdrawal is ₱{MIN_WITHDRAWAL}</p>
              )}
              {numericAmount > mainWalletBalance && (
                <p className="text-sm text-destructive">Insufficient balance</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <span className="flex items-center gap-2">
                        {method.icon} {method.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Details */}
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="Full name on account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Mobile number or account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                maxLength={20}
              />
            </div>

            {/* Fee Breakdown */}
            {numericAmount > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span>₱{numericAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee ({FEE_PERCENT}%)</span>
                  <span className="text-warning">-₱{fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-1 mt-1">
                  <span>You Receive</span>
                  <span className="text-primary">₱{netAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Warning */}
            <Alert className="border-muted">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Withdrawals are processed within 24-48 hours. Ensure your account details are correct.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              onClick={handleWithdraw}
              disabled={!isFormValid || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Withdraw ₱${netAmount > 0 ? netAmount.toFixed(2) : '0.00'}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
