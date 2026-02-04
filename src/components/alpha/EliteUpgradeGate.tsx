/**
 * ELITE UPGRADE GATE V1.0
 * Full-screen modal prompting users to upgrade for ABC features
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Crown, 
  TrendingUp, 
  Shield, 
  Vault, 
  Sparkles, 
  ArrowRight,
  X,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EliteUpgradeGateProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription?: string;
}

const benefits = [
  {
    icon: Vault,
    title: 'Alpha Vault Access',
    description: 'Deposit ₳ and earn 1% daily passive yield'
  },
  {
    icon: TrendingUp,
    title: 'P2P Credit Marketplace',
    description: 'Lend ₳ at 3% interest or borrow from verified lenders'
  },
  {
    icon: Shield,
    title: 'Collateralized Security',
    description: 'All loans backed by frozen vault collateral'
  },
  {
    icon: Star,
    title: '28-Day Auto-Repayment',
    description: 'Automatic liquidation protects lender capital'
  }
];

export function EliteUpgradeGate({ 
  isOpen, 
  onClose, 
  featureName,
  featureDescription 
}: EliteUpgradeGateProps) {
  const navigate = useNavigate();
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

  const handleUpgrade = () => {
    onClose();
    navigate('/dashboard/upgrade');
  };

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(12px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-lg bg-gradient-to-b from-background via-background to-background/95 rounded-3xl border border-alpha/30 shadow-2xl shadow-alpha/20 overflow-hidden"
          >
            {/* Decorative gradient top */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-alpha/20 via-alpha/10 to-transparent pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="relative z-10 p-8 pt-6">
              {/* Lock Icon with Crown */}
              <motion.div 
                className="relative w-24 h-24 mx-auto mb-6"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-alpha via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-alpha/40">
                  <Lock className="w-10 h-10 text-alpha-foreground" />
                </div>
                <motion.div
                  className="absolute -top-3 -right-3"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-amber-900" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-alpha via-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2">
                  ELITE Status Required
                </h2>
                <p className="text-muted-foreground">
                  {featureDescription || `Unlock "${featureName}" with ELITE membership`}
                </p>
              </motion.div>

              {/* Feature trying to access */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-alpha/10 border border-alpha/30 mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-alpha/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-alpha" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{featureName}</p>
                    <p className="text-sm text-muted-foreground">
                      Alpha Bankers Cooperative Feature
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Benefits Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onMouseEnter={() => setHoveredBenefit(index)}
                    onMouseLeave={() => setHoveredBenefit(null)}
                    className={cn(
                      "p-3 rounded-xl border transition-all duration-300 cursor-default",
                      hoveredBenefit === index 
                        ? "bg-alpha/10 border-alpha/40 scale-[1.02]"
                        : "bg-muted/30 border-border/50"
                    )}
                  >
                    <benefit.icon className={cn(
                      "w-5 h-5 mb-2 transition-colors",
                      hoveredBenefit === index ? "text-alpha" : "text-muted-foreground"
                    )} />
                    <p className="text-sm font-medium text-foreground mb-0.5">
                      {benefit.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleUpgrade}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-alpha via-amber-500 to-yellow-400 hover:from-alpha/90 hover:via-amber-500/90 hover:to-yellow-400/90 text-alpha-foreground shadow-lg shadow-alpha/30 group"
                >
                  <Crown className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Upgrade to ELITE
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <button
                  onClick={onClose}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Continue viewing (read-only)
                </button>
              </motion.div>

              {/* Sparkle decoration */}
              <motion.div
                className="absolute top-20 left-8"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-alpha/60" />
              </motion.div>
              <motion.div
                className="absolute top-32 right-12"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-3 h-3 text-amber-400/60" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
