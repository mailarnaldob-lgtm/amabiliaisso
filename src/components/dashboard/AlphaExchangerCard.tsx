import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatAlpha } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AlphaExchangerCardProps {
  balance: number;
  className?: string;
}

/**
 * ALPHA EXCHANGER MODULE - Premium Vault/Exchange Card
 * 
 * Displayed for ACTIVE members (membership_tier !== null)
 * Features:
 * - Sovereign Obsidian + Gold theme
 * - Digital odometer-style ₳ balance display
 * - Premium glassmorphism styling
 * - ENTER ALPHA EXCHANGER button with navigation
 */
export function AlphaExchangerCard({ balance, className }: AlphaExchangerCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d]",
        "border border-[#FFD700]/20 hover:border-[#FFD700]/40",
        "backdrop-blur-2xl",
        "shadow-xl hover:shadow-2xl hover:shadow-[#FFD700]/10",
        "transition-all duration-300",
        className
      )}
    >
      {/* Ambient Glow Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FFA500]/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#FFD700]/10 blur-3xl"
        animate={{ 
          scale: isHovered ? 1.2 : 1,
          opacity: isHovered ? 0.3 : 0.1 
        }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/10 border border-[#FFD700]/30 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">ALPHA EXCHANGER</h3>
              <p className="text-xs text-muted-foreground">₳ Liquidity Layer</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          )}>
            <TrendingUp className="w-3 h-3" />
            Live
          </div>
        </div>

        {/* Available for All Accounts Notice */}
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">
            Available for All Accounts • Buy ₳ to Fund Campaigns
          </span>
        </div>

        {/* Balance Display - Digital Odometer Style */}
        <div className="mb-6 p-4 rounded-xl bg-[#050505] border border-[#FFD700]/10">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Your ₳ Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-[#FFD700] tracking-wider">
                  ₳{formatAlpha(balance)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Exchange Rate</p>
              <p className="text-sm font-mono text-[#FFD700]">₳1 = ₱1</p>
            </div>
          </div>
        </div>

        {/* Exchange Info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[#FFD700]/5 border border-[#FFD700]/10">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Min. Exchange</p>
            <p className="text-sm font-mono font-bold text-white">₳100</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FFD700]/5 border border-[#FFD700]/10">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Max. Daily</p>
            <p className="text-sm font-mono font-bold text-white">₳50,000</p>
          </div>
        </div>

        {/* CTA Button - Now navigates to Exchanger page */}
        <Link to="/dashboard/exchanger">
          <motion.div
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button 
              className={cn(
                "w-full h-12 font-bold text-sm",
                "rounded-xl border-0",
                "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 shadow-lg shadow-[#FFD700]/20"
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              ENTER ALPHA EXCHANGER
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </Link>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />
      </div>
    </motion.div>
  );
}
