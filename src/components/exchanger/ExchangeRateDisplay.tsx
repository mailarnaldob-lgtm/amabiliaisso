/**
 * EXCHANGE RATE DISPLAY - Real-time rate with animated odometer
 * 
 * Features:
 * - Digital odometer font (JetBrains Mono)
 * - Gold glow on rate updates
 * - 15-second polling indicator
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExchangeRateDisplayProps {
  rate?: number;
  lastUpdated?: Date | null;
  isLoading?: boolean;
  className?: string;
}

export function ExchangeRateDisplay({
  rate = 1,
  lastUpdated,
  isLoading = false,
  className,
}: ExchangeRateDisplayProps) {
  const [showGlow, setShowGlow] = useState(false);
  const [prevRate, setPrevRate] = useState(rate);
  
  // Flash glow on rate change
  useEffect(() => {
    if (rate !== prevRate) {
      setShowGlow(true);
      setPrevRate(rate);
      const timer = setTimeout(() => setShowGlow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [rate, prevRate]);
  
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d]",
        "border border-[#FFD700]/20",
        "backdrop-blur-2xl p-4",
        className
      )}
      animate={showGlow ? {
        boxShadow: ['0 0 0px rgba(255, 215, 0, 0)', '0 0 30px rgba(255, 215, 0, 0.4)', '0 0 0px rgba(255, 215, 0, 0)']
      } : {}}
      transition={{ duration: 1.5 }}
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FFA500]/5 pointer-events-none" />
      
      <div className="relative flex items-center justify-between gap-4">
        {/* Rate Display */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#FFD700]" />
          </div>
          
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Exchange Rate
            </p>
            <div className="flex items-baseline gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rate}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-2xl font-mono font-bold text-[#FFD700]"
                >
                  ₳1
                </motion.span>
              </AnimatePresence>
              <span className="text-muted-foreground">=</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={rate}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-2xl font-mono font-bold text-white"
                >
                  ₱{rate.toFixed(2)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {isLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin text-[#FFD700]" />
            ) : (
              <Sparkles className="w-3 h-3 text-[#FFD700]" />
            )}
            <span>Live Rate</span>
          </div>
          {lastUpdated && (
            <p className="text-[9px] text-muted-foreground/70 mt-0.5">
              {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />
    </motion.div>
  );
}
