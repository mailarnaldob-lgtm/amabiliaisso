import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActivateAccountCardProps {
  className?: string;
}

/**
 * ACTIVATE ACCOUNT MODULE - Sovereign Cinematic UI
 * 
 * Displayed ONLY for inactive members (membership_tier = null)
 * Features:
 * - Obsidian Black background with Alpha Gold accents
 * - Glassmorphism card (backdrop-blur-2xl)
 * - Countdown-style urgency design
 * - 0.3s Bloom scale-down (95%) animation
 */
export function ActivateAccountCard({ className }: ActivateAccountCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d]",
        "border border-[#FFD700]/30",
        "backdrop-blur-2xl",
        "shadow-2xl shadow-[#FFD700]/10",
        className
      )}
    >
      {/* Ambient Gold Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-transparent to-[#FFD700]/5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
      
      {/* Circuitry Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 w-20 h-20 border border-[#FFD700]/20 rounded-full" />
        <div className="absolute bottom-4 right-4 w-32 h-32 border border-[#FFD700]/10 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-1 h-16 bg-[#FFD700]/20" />
      </div>

      <div className="relative p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6">
          <motion.div 
            className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-lg shadow-[#FFD700]/30"
            animate={{ 
              boxShadow: [
                '0 10px 40px rgba(255, 215, 0, 0.3)',
                '0 10px 60px rgba(255, 215, 0, 0.5)',
                '0 10px 40px rgba(255, 215, 0, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <AlertTriangle className="h-8 w-8 text-black" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">
              Account Activation Required
            </h2>
            <p className="text-sm text-[#FFD700]/70">
              Unlock the full ALPHA ecosystem
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Zap, label: 'VPA Missions', desc: 'Earn ₳ daily' },
            { icon: Shield, label: '50% Referral', desc: 'Commission' },
            { icon: CreditCard, label: 'P2P Lending', desc: 'Elite access' },
            { icon: Clock, label: '1% Daily', desc: 'Vault yield' },
          ].map((benefit, i) => (
            <motion.div
              key={benefit.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-2 p-3 rounded-lg bg-[#FFD700]/5 border border-[#FFD700]/10"
            >
              <benefit.icon className="w-4 h-4 text-[#FFD700]" />
              <div>
                <p className="text-xs font-semibold text-white">{benefit.label}</p>
                <p className="text-[10px] text-muted-foreground">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Urgency Counter */}
        <div className="flex items-center justify-center gap-2 mb-6 py-3 px-4 rounded-lg bg-[#FFD700]/5 border border-[#FFD700]/20">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Activation Fee:</span>
            <span className="text-lg font-mono font-bold text-[#FFD700]">₳300</span>
          </div>
          <span className="text-muted-foreground mx-2">|</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">One-time</span>
            <span className="text-xs text-emerald-400 font-semibold">LIFETIME</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link to="/dashboard/upgrade" className="block">
          <motion.div
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button 
              className={cn(
                "w-full h-14 text-lg font-bold",
                "bg-gradient-to-r from-[#FFD700] to-[#FFA500]",
                "text-black hover:opacity-90",
                "shadow-xl shadow-[#FFD700]/30",
                "border-0 rounded-xl",
                "transition-all duration-300",
                isPressed && "scale-95"
              )}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              ACTIVATE ACCOUNT
            </Button>
          </motion.div>
        </Link>

        {/* Bottom Shimmer */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
