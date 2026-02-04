/**
 * SUCCESS CONFETTI CELEBRATION V1.0
 * Reusable confetti animation for successful submissions
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConfettiParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  type: 'circle' | 'square' | 'ribbon';
  color: string;
}

interface SuccessConfettiProps {
  isActive: boolean;
  variant?: 'default' | 'golden' | 'rainbow';
  particleCount?: number;
  duration?: number;
}

const COLOR_VARIANTS = {
  default: ['hsl(var(--primary))', '#22c55e', '#3b82f6', '#8b5cf6'],
  golden: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B'],
  rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
};

function generateConfetti(count: number, colors: string[]): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2.5 + Math.random() * 2,
    rotation: Math.random() * 720 - 360,
    size: 6 + Math.random() * 10,
    type: (['circle', 'square', 'ribbon'] as const)[Math.floor(Math.random() * 3)],
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export function SuccessConfetti({ 
  isActive, 
  variant = 'default',
  particleCount = 60,
  duration = 3000,
}: SuccessConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      const colors = COLOR_VARIANTS[variant];
      setParticles(generateConfetti(particleCount, colors));
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isActive, variant, particleCount, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[999] overflow-hidden"
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                y: -20,
                x: `${particle.x}vw`,
                opacity: 1,
                rotate: 0,
                scale: 0,
              }}
              animate={{
                y: '110vh',
                rotate: particle.rotation,
                opacity: [0, 1, 1, 1, 0],
                scale: [0, 1, 1, 1, 0.5],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute"
              style={{
                left: 0,
              }}
            >
              <div
                className={cn(
                  particle.type === 'circle' && 'rounded-full',
                  particle.type === 'square' && 'rounded-sm',
                  particle.type === 'ribbon' && 'rounded-full'
                )}
                style={{
                  width: particle.type === 'ribbon' ? particle.size * 0.4 : particle.size,
                  height: particle.type === 'ribbon' ? particle.size * 2 : particle.size,
                  background: particle.color,
                  boxShadow: `0 0 ${particle.size / 2}px ${particle.color}40`,
                }}
              />
            </motion.div>
          ))}
          
          {/* Center burst effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
            style={{
              background: `radial-gradient(circle, ${COLOR_VARIANTS[variant][0]}40 0%, transparent 70%)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuccessConfetti;
