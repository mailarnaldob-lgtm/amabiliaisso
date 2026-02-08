/**
 * ALPHA EXCHANGER SOVEREIGN - Production-Grade Exchange Modal
 * 
 * AMABILIA NETWORK V12.0 - Unified Payment Experience:
 * - AMABILIA branded loading transition (1.5-2s)
 * - Simplified QR-only payment (no provider choices)
 * - Required proof upload before submit
 * - Cinematic glassmorphism UI
 * - Obsidian Black (#050505) + Alpha Gold (#FFD700)
 */

import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight, 
  ArrowRightLeft,
  Wallet,
  Sparkles,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatAlpha } from '@/lib/utils';
import { UnifiedPaymentFlow } from '@/components/payment/UnifiedPaymentFlow';
import { AlphaCoin3D } from '@/components/exchanger/AlphaCoin3D';

type ExchangerStep = 'input' | 'payment';

interface SovereignExchangerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Validation constants
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 50000;

export function SovereignExchangerModal({ open, onOpenChange }: SovereignExchangerModalProps) {
  const [step, setStep] = useState<ExchangerStep>('input');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const phpAmount = parseFloat(amount) || 0;
  const alphaAmount = phpAmount; // 1:1 peg

  // Validation
  const validation = useMemo(() => {
    if (!amount) return { valid: false, message: '' };
    if (phpAmount < MIN_AMOUNT) {
      return { valid: false, message: `Minimum amount is ₱${MIN_AMOUNT.toLocaleString()}` };
    }
    if (phpAmount > MAX_AMOUNT) {
      return { valid: false, message: `Maximum amount is ₱${MAX_AMOUNT.toLocaleString()}` };
    }
    return { valid: true, message: '' };
  }, [amount, phpAmount]);

  // Reset modal state
  const resetModal = useCallback(() => {
    setStep('input');
    setAmount('');
  }, []);

  // Handle successful payment
  const handlePaymentSuccess = useCallback(() => {
    toast({
      title: '🎉 Payment Submitted!',
      description: 'Your ₳ credits will be added after admin review.',
    });
    setTimeout(() => {
      resetModal();
      onOpenChange(false);
    }, 2000);
  }, [toast, resetModal, onOpenChange]);

  // Handle payment cancel
  const handlePaymentCancel = useCallback(() => {
    setStep('input');
  }, []);

  // Proceed to payment flow
  const handleProceedToPayment = useCallback(() => {
    if (validation.valid) {
      setStep('payment');
    }
  }, [validation.valid]);

  // Quick amount buttons
  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-[#050505] border-[#FFD700]/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <span className="text-2xl text-[#FFD700]">₳</span>
            LPHA Sovereign Exchanger
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Convert PHP to ₳ Credits (1:1 rate)
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Input Amount */}
          {step === 'input' && (
            <motion.div
              key="input-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pt-2"
            >
              {/* 3D Coin Hero */}
              <div className="flex justify-center py-2">
                <AlphaCoin3D size="lg" />
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[#FFD700]">
                  Enter PHP Amount to Convert
                </Label>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-mono text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={cn(
                      "pl-12 pr-4 h-14 text-2xl font-mono font-bold",
                      "bg-[#0a0a0a] border-[#FFD700]/20 focus:border-[#FFD700]/50",
                      "text-white placeholder:text-muted-foreground/50"
                    )}
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <motion.button
                      key={amt}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAmount(amt.toString())}
                      className={cn(
                        "py-2 px-3 rounded-lg text-sm font-mono font-medium",
                        "border transition-all duration-200",
                        amount === amt.toString()
                          ? "bg-[#FFD700]/20 border-[#FFD700]/50 text-[#FFD700]"
                          : "bg-[#0a0a0a] border-[#FFD700]/10 text-muted-foreground hover:border-[#FFD700]/30 hover:text-[#FFD700]"
                      )}
                    >
                      ₱{amt.toLocaleString()}
                    </motion.button>
                  ))}
                </div>
                
                {/* Validation Message */}
                <AnimatePresence mode="wait">
                  {validation.message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                        <AlertDescription className="text-xs">{validation.message}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <p className="text-[10px] text-muted-foreground">
                  Min: ₱{MIN_AMOUNT.toLocaleString()} • Max: ₱{MAX_AMOUNT.toLocaleString()} daily
                </p>
              </div>
              
              {/* Conversion Preview */}
              <AnimatePresence mode="wait">
                {phpAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className={cn(
                      "border-2 overflow-hidden",
                      validation.valid 
                        ? "border-[#FFD700]/40 bg-gradient-to-br from-[#FFD700]/10 via-[#0a0a0a] to-[#FFA500]/10"
                        : "border-muted bg-muted/20"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">You Pay</p>
                            <p className="text-xl font-mono font-bold text-white">
                              ₱{phpAmount.toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="px-4">
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <ArrowRight className="h-5 w-5 text-[#FFD700]" />
                            </motion.div>
                          </div>
                          
                          <div className="text-center flex-1">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">You Receive</p>
                            <motion.p 
                              className="text-xl font-mono font-bold text-[#FFD700]"
                              animate={validation.valid ? { 
                                textShadow: ['0 0 0px #FFD700', '0 0 15px #FFD700', '0 0 0px #FFD700']
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              ₳{Math.floor(alphaAmount).toLocaleString()}
                            </motion.p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-2 border-t border-[#FFD700]/10 text-center">
                          <p className="text-[10px] text-muted-foreground">
                            <Sparkles className="w-3 h-3 inline mr-1 text-[#FFD700]" />
                            Rate: ₳1 = ₱1 (Fixed Peg)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* CTA Button */}
              <motion.div
                whileTap={{ scale: validation.valid ? 0.95 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button 
                  size="lg"
                  disabled={!validation.valid}
                  onClick={handleProceedToPayment}
                  className={cn(
                    "w-full h-12 text-base font-bold rounded-xl",
                    validation.valid
                      ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 shadow-lg shadow-[#FFD700]/30"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {validation.valid ? (
                    <>
                      <ArrowRightLeft className="w-5 h-5 mr-2" />
                      Continue to Payment
                    </>
                  ) : (
                    'Enter Amount to Continue'
                  )}
                </Button>
              </motion.div>
              
              {/* Disclaimer */}
              <p className="text-[10px] text-muted-foreground text-center">
                ₳ Credits are internal units. Processing time: Admin-reviewed within 24 hours.
              </p>
            </motion.div>
          )}

          {/* Step 2: Unified Payment Flow */}
          {step === 'payment' && (
            <motion.div
              key="payment-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="pt-2"
            >
              <UnifiedPaymentFlow
                amount={phpAmount}
                type="cash-in"
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Notice */}
        <div className="mt-2 p-2 rounded-lg bg-[#050505]/80 border border-[#FFD700]/10">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3 text-[#FFD700]" />
              Alpha Sovereign Ledger v12.0
            </p>
            <p className="text-[10px] text-muted-foreground">
              15s Polling • Admin-Verified
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SovereignExchangerModal;
