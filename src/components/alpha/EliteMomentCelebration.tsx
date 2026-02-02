/**
 * ELITE MOMENT CELEBRATION V9.2
 * Golden confetti + vault reveal animation
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vault, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EliteMomentCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  userName?: string;
}

// Generate confetti particles
function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
    type: Math.random() > 0.5 ? 'circle' : 'square',
  }));
}

export function EliteMomentCelebration({ 
  isVisible, 
  onComplete,
  userName 
}: EliteMomentCelebrationProps) {
  const [confetti] = useState(() => generateConfetti(50));
  const [phase, setPhase] = useState<'confetti' | 'reveal' | 'complete'>('confetti');

  useEffect(() => {
    if (isVisible) {
      setPhase('confetti');
      
      // Transition to reveal after confetti
      const revealTimer = setTimeout(() => {
        setPhase('reveal');
      }, 1500);

      return () => clearTimeout(revealTimer);
    }
  }, [isVisible]);

  const handleEnter = useCallback(() => {
    setPhase('complete');
    setTimeout(onComplete, 500);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        {/* Golden Confetti Layer */}
        {phase === 'confetti' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  y: -20, 
                  x: `${particle.x}vw`,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{ 
                  y: '100vh',
                  rotate: particle.rotation,
                  opacity: [1, 1, 0.5, 0],
                }}
                transition={{ 
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: 'linear',
                }}
                className={cn(
                  'absolute',
                  particle.type === 'circle' ? 'rounded-full' : 'rounded-sm'
                )}
                style={{
                  width: particle.size,
                  height: particle.size,
                  background: `linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)`,
                  boxShadow: '0 0 6px #FFD700',
                }}
              />
            ))}
          </div>
        )}

        {/* Vault Reveal Card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={phase !== 'confetti' ? { 
            scale: 1, 
            opacity: 1, 
            y: 0 
          } : { 
            scale: 0.5, 
            opacity: 0 
          }}
          transition={{ 
            type: 'spring', 
            damping: 20, 
            stiffness: 300,
            delay: phase !== 'confetti' ? 0 : 1.5,
          }}
          className={cn(
            'relative max-w-md w-full mx-4 rounded-2xl overflow-hidden',
            'bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#1a1a1a]',
            'border-2 border-[#FFD700]/50',
            'shadow-[0_0_60px_rgba(255,215,0,0.3)]'
          )}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-transparent to-[#FFD700]/5" />
          
          {/* Crown header */}
          <div className="relative pt-8 pb-4 flex justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Crown className="h-16 w-16 text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="relative px-6 pb-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-[#FFD700] mb-2"
            >
              Welcome to the Elite
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground mb-6"
            >
              {userName ? `${userName}, your` : 'Your'} Alpha Vault has been activated
            </motion.p>

            {/* Vault Icon Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 15, 
                stiffness: 200,
                delay: 0.7,
              }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                  <Vault className="h-10 w-10 text-black" />
                </div>
                <motion.div
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 rounded-xl border-2 border-[#FFD700]"
                />
              </div>
            </motion.div>

            {/* Features list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap justify-center gap-2 mb-6"
            >
              {['1% Daily Yield', 'P2P Credits', 'Collateralized Lending'].map((feature, i) => (
                <span
                  key={feature}
                  className="px-3 py-1 rounded-full text-xs bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]"
                >
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  {feature}
                </span>
              ))}
            </motion.div>

            {/* Enter Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                onClick={handleEnter}
                className={cn(
                  'w-full font-bold text-lg py-6',
                  'bg-gradient-to-r from-[#FFD700] to-[#FFA500]',
                  'hover:from-[#FFA500] hover:to-[#FFD700]',
                  'text-black shadow-[0_0_30px_rgba(255,215,0,0.4)]',
                  'active:scale-95 transition-transform'
                )}
              >
                Enter Alpha Vault
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
