/**
 * AMABILIA PAYMENT LOADER - Premium Branded Loading Transition
 * 
 * Displays a cinematic branded animation before payment QR code display:
 * - Obsidian Black (#050505) background
 * - Alpha Gold (#FFD700) shimmering accents
 * - Bloom scale-down/up animations
 * - 3D coin rotation effect
 * - Particle/light streak effects
 * - 1.5-2 second duration
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmabiliaPaymentLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

export function AmabiliaPaymentLoader({
  isLoading,
  onComplete,
  duration = 2000,
  className
}: AmabiliaPaymentLoaderProps) {
  const [shouldRender, setShouldRender] = useState(isLoading);
  
  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isLoading, duration, onComplete]);
  
  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center",
            "bg-[#050505]",
            className
          )}
        >
          {/* Ambient Background Glow */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 40%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          
          {/* Particle/Light Streak Effects */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#FFD700]/40 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            />
          ))}
          
          {/* Central Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 3D Alpha Coin */}
            <motion.div
              className="relative w-32 h-32 mb-8"
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{
                duration: 0.6,
                type: "spring",
                damping: 15,
              }}
            >
              {/* Outer Glow Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-[#FFD700]/30"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,215,0,0.3)',
                    '0 0 60px rgba(255,215,0,0.5)',
                    '0 0 20px rgba(255,215,0,0.3)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {/* Coin Body */}
              <motion.div
                className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FFA500] flex items-center justify-center"
                animate={{ rotateY: [0, 360] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 8px 32px rgba(255,215,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.2)',
                }}
              >
                {/* Alpha Symbol */}
                <span 
                  className="text-5xl font-bold text-[#050505]"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  ₳
                </span>
              </motion.div>
              
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transform: 'skewX(-15deg)' }}
                />
              </motion.div>
            </motion.div>
            
            {/* AMABILIA NETWORK Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-bold tracking-widest text-[#FFD700] mb-2">
                AMABILIA
              </h1>
              <p className="text-xs sm:text-sm tracking-[0.3em] text-[#FFD700]/60 uppercase">
                Network
              </p>
            </motion.div>
            
            {/* Status Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="w-4 h-4 text-[#FFD700]" />
              </motion.div>
              <span className="text-xs text-[#FFD700]/80 font-medium tracking-wide">
                INITIALIZING SECURE PAYMENT
              </span>
            </motion.div>
            
            {/* Progress Bar */}
            <motion.div
              className="mt-6 w-48 h-1 bg-[#FFD700]/10 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: duration / 1000, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
          
          {/* Bottom Watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <p className="text-[10px] text-[#FFD700]/40 tracking-widest">
              SOVEREIGN PAYMENT GATEWAY
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AmabiliaPaymentLoader;
