/**
 * CASH-OUT FORM PANEL - Sell ₳ for PHP
 * 
 * Features:
 * - Amount input with balance validation
 * - Payment method selection (GCash, Maya, Bank)
 * - Account details form with masking
 * - Fee preview (15₳ external transfer fee)
 * - Admin approval workflow integration
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowDownToLine, AlertTriangle, Wallet, CheckCircle2, 
  Loader2, Building2, Smartphone, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CashOutFormPanelProps {
  balance: number;
  onSuccess?: () => void;
  className?: string;
}

// Validation constants per Blueprint V8.0
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 50000;
const EXTERNAL_FEE = 15; // ₳15 flat fee for external transfers

const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', icon: 'phone' },
  { id: 'maya', name: 'Maya', icon: 'phone' },
  { id: 'bdo', name: 'BDO Bank', icon: 'bank' },
  { id: 'bpi', name: 'BPI Bank', icon: 'bank' },
  { id: 'unionbank', name: 'UnionBank', icon: 'bank' },
  { id: 'metrobank', name: 'Metrobank', icon: 'bank' },
];

export function CashOutFormPanel({ balance, onSuccess, className }: CashOutFormPanelProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const alphaAmount = parseFloat(amount) || 0;
  const netAmount = Math.max(0, alphaAmount - EXTERNAL_FEE);
  const phpAmount = netAmount; // 1:1 peg

  // Validation
  const isAmountValid = alphaAmount >= MIN_AMOUNT && alphaAmount <= MAX_AMOUNT;
  const hasSufficientBalance = alphaAmount <= balance;
  const isFormValid = isAmountValid && hasSufficientBalance && paymentMethod && accountName.trim() && accountNumber.trim();

  const selectedMethod = useMemo(() => 
    PAYMENT_METHODS.find(m => m.id === paymentMethod),
    [paymentMethod]
  );

  const handleSubmit = async () => {
    if (!user || !isFormValid) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/swap-cash-out`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            amount: alphaAmount,
            payment_method: selectedMethod?.name || paymentMethod,
            account_name: accountName.trim(),
            account_number: accountNumber.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Withdrawal request failed');
      }

      toast({
        title: 'Withdrawal Requested',
        description: `₳${alphaAmount.toLocaleString()} withdrawal pending admin approval. You'll receive ₱${phpAmount.toLocaleString()} after processing.`,
      });

      // Reset form
      setAmount('');
      setPaymentMethod('');
      setAccountName('');
      setAccountNumber('');
      
      onSuccess?.();
    } catch (error) {
      console.error('[CashOut] Submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Withdrawal Failed',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Balance Display */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Available Balance</span>
        </div>
        <span className="font-mono font-bold text-[#FFD700]">₳{balance.toLocaleString()}</span>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="cashOutAmount">Amount to Withdraw (₳)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD700] font-mono">₳</span>
          <Input
            id="cashOutAmount"
            type="number"
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8 text-xl font-mono bg-[#0a0a0a] border-[#FFD700]/20 focus:border-[#FFD700]/50"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Min: ₳{MIN_AMOUNT.toLocaleString()} | Max: ₳{MAX_AMOUNT.toLocaleString()} | Fee: ₳{EXTERNAL_FEE}
        </p>
      </div>

      {/* Validation Alerts */}
      {alphaAmount > 0 && !hasSufficientBalance && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Insufficient balance. You have ₳{balance.toLocaleString()} available.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Method Selection */}
      <div className="space-y-2">
        <Label>Receiving Account</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="bg-[#0a0a0a] border-[#FFD700]/20">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                <div className="flex items-center gap-2">
                  {method.icon === 'phone' ? (
                    <Smartphone className="h-4 w-4" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  <span>{method.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Account Details */}
      {paymentMethod && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              placeholder="Juan Dela Cruz"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="bg-[#0a0a0a] border-[#FFD700]/20"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              {selectedMethod?.icon === 'phone' ? 'Mobile Number' : 'Account Number'}
            </Label>
            <Input
              id="accountNumber"
              placeholder={selectedMethod?.icon === 'phone' ? '09XXXXXXXXX' : '0000000000'}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="font-mono bg-[#0a0a0a] border-[#FFD700]/20"
              maxLength={20}
            />
          </div>
        </motion.div>
      )}

      {/* Preview Card */}
      {alphaAmount > 0 && hasSufficientBalance && (
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-500/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Withdraw Amount</span>
              <span className="font-mono">₳{alphaAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="font-mono text-red-400">-₳{EXTERNAL_FEE}</span>
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-muted-foreground">You'll Receive</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                ₱{phpAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert className="border-[#FFD700]/20 bg-[#FFD700]/5">
        <Info className="h-4 w-4 text-[#FFD700]" />
        <AlertDescription className="text-xs text-muted-foreground">
          Withdrawals are processed within 1-24 hours after admin approval. 
          Your ₳ will be deducted immediately and held in escrow.
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        className={cn(
          "w-full gap-2",
          "bg-gradient-to-r from-emerald-500 to-teal-600",
          "hover:from-emerald-600 hover:to-teal-700",
          "disabled:opacity-50"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ArrowDownToLine className="h-4 w-4" />
            Request Withdrawal
          </>
        )}
      </Button>
    </div>
  );
}