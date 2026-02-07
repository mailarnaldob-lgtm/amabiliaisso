/**
 * EXCHANGE FORM PANEL - Premium conversion interface
 * 
 * Features:
 * - Amount input with validation
 * - Balance check integration
 * - Bloom animations
 * - Real-time conversion preview
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ArrowRightLeft,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn, formatAlpha } from '@/lib/utils';
import { AlphaCoin3D } from './AlphaCoin3D';

interface ExchangeFormPanelProps {
  balance: number;
  onProceed: (amount: number) => void;
  className?: string;
}

const MIN_AMOUNT = 100;
const MAX_AMOUNT = 50000;

export function ExchangeFormPanel({ 
  balance, 
  onProceed, 
  className 
}: ExchangeFormPanelProps) {
  const [amount, setAmount] = useState('');
  const [isCoinSpinning, setIsCoinSpinning] = useState(false);
  
  const phpAmount = parseFloat(amount) || 0;
  const alphaAmount = phpAmount; // 1:1 peg
  
  // Validation states
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
  
  const handleProceed = () => {
    if (validation.valid) {
      setIsCoinSpinning(true);
      setTimeout(() => {
        onProceed(phpAmount);
      }, 800);
    }
  };
  
  // Quick amount buttons
  const quickAmounts = [100, 500, 1000, 5000];
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* 3D Coin Hero */}
      <div className="flex justify-center py-4">
        <AlphaCoin3D 
          size="xl" 
          onSpin={() => setIsCoinSpinning(true)}
        />
      </div>
      
      {/* Current Balance */}
      <Card className="border-[#FFD700]/20 bg-[#050505]/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Current Balance
                </p>
                <p className="text-xl font-mono font-bold text-[#FFD700]">
                  ₳{formatAlpha(balance)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Available</p>
              <p className="text-sm text-emerald-400">Ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
              "pl-12 pr-4 h-16 text-3xl font-mono font-bold",
              "bg-[#050505] border-[#FFD700]/20 focus:border-[#FFD700]/50",
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
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmount(amt.toString())}
              className={cn(
                "py-2 px-3 rounded-lg text-sm font-mono font-medium",
                "border transition-all duration-200",
                amount === amt.toString()
                  ? "bg-[#FFD700]/20 border-[#FFD700]/50 text-[#FFD700]"
                  : "bg-[#050505]/50 border-[#FFD700]/10 text-muted-foreground hover:border-[#FFD700]/30 hover:text-[#FFD700]"
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
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validation.message}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-[11px] text-muted-foreground">
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
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">You Pay</p>
                    <p className="text-2xl font-mono font-bold text-white">
                      ₱{phpAmount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="px-4">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="h-6 w-6 text-[#FFD700]" />
                    </motion.div>
                  </div>
                  
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">You Receive</p>
                    <motion.p 
                      className="text-2xl font-mono font-bold text-[#FFD700]"
                      animate={validation.valid ? { 
                        textShadow: ['0 0 0px #FFD700', '0 0 20px #FFD700', '0 0 0px #FFD700']
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ₳{Math.floor(alphaAmount).toLocaleString()}
                    </motion.p>
                  </div>
                </div>
                
                {/* Rate Info */}
                <div className="mt-4 pt-3 border-t border-[#FFD700]/10 text-center">
                  <p className="text-xs text-muted-foreground">
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
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button 
          size="lg"
          disabled={!validation.valid}
          onClick={handleProceed}
          className={cn(
            "w-full h-14 text-lg font-bold rounded-xl",
            validation.valid
              ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 shadow-lg shadow-[#FFD700]/30"
              : "bg-muted text-muted-foreground"
          )}
        >
          {validation.valid ? (
            <>
              <ArrowRightLeft className="w-5 h-5 mr-2" />
              Convert ₳ Now
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
    </div>
  );
}
