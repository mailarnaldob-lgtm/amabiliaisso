/**
 * ALPHA COIN 3D - Interactive Sovereign Currency Component
 * 
 * Features:
 * - CSS 3D transforms for stability
 * - Hover tilt parallax effect (10 degrees)
 * - Click spin animation with particle shine
 * - Constant slow rotation
 * - Branded tooltip
 */

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AlphaCoin3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
  interactive?: boolean;
  onSpin?: () => void;
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

export function AlphaCoin3D({ 
  size = 'lg', 
  className,
  showTooltip = true,
  interactive = true,
  onSpin 
}: AlphaCoin3DProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position for tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth movement
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  const handleClick = () => {
    if (!interactive || isSpinning) return;
    
    setIsSpinning(true);
    setShowParticles(true);
    onSpin?.();
    
    // Reset after animation
    setTimeout(() => setIsSpinning(false), 1000);
    setTimeout(() => setShowParticles(false), 1500);
  };
  
  return (
    <div className={cn("relative group", className)}>
      {/* Particle Effects */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#FFD700]"
              initial={{ 
                x: '50%', 
                y: '50%', 
                scale: 1, 
                opacity: 1 
              }}
              animate={{ 
                x: `${50 + Math.cos(i * 30 * Math.PI / 180) * 150}%`,
                y: `${50 + Math.sin(i * 30 * Math.PI / 180) * 150}%`,
                scale: 0,
                opacity: 0
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                boxShadow: '0 0 8px 2px rgba(255, 215, 0, 0.8)',
              }}
            />
          ))}
        </div>
      )}
      
      {/* 3D Coin Container */}
      <motion.div
        ref={containerRef}
        className={cn(
          sizeMap[size],
          "relative cursor-pointer perspective-[1000px]",
          interactive && "hover:scale-105"
        )}
        style={{ 
          rotateX: interactive ? rotateX : 0, 
          rotateY: interactive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        animate={isSpinning ? { 
          rotateY: [0, 360],
          scale: [1, 1.1, 1]
        } : {
          rotateY: [0, 360]
        }}
        transition={isSpinning ? {
          rotateY: { duration: 0.8, ease: 'easeInOut' },
          scale: { duration: 0.4, times: [0, 0.5, 1] }
        } : {
          rotateY: { duration: 8, repeat: Infinity, ease: 'linear' }
        }}
      >
        {/* Coin Face - Front */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#B8860B]",
            "border-4 border-[#DAA520]",
            "flex items-center justify-center",
            "shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),inset_0_-2px_10px_rgba(0,0,0,0.3)]",
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'translateZ(4px)'
          }}
        >
          {/* Inner Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-[#DAA520]/50" />
          
          {/* Alpha Symbol */}
          <span 
            className={cn(
              "font-bold text-black/80 select-none",
              size === 'sm' && "text-2xl",
              size === 'md' && "text-4xl",
              size === 'lg' && "text-5xl",
              size === 'xl' && "text-7xl",
            )}
            style={{
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5), -1px -1px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            ₳
          </span>
          
          {/* Shine Effect */}
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"
            style={{ clipPath: 'ellipse(80% 50% at 30% 30%)' }}
          />
        </div>
        
        {/* Coin Face - Back */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-br from-[#B8860B] via-[#FFA500] to-[#FFD700]",
            "border-4 border-[#DAA520]",
            "flex items-center justify-center",
            "shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),inset_0_-2px_10px_rgba(0,0,0,0.3)]",
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'translateZ(-4px) rotateY(180deg)'
          }}
        >
          {/* Pattern */}
          <div className="absolute inset-4 rounded-full border border-[#DAA520]/40" />
          <span 
            className={cn(
              "font-bold text-black/70 select-none tracking-tighter",
              size === 'sm' && "text-[6px]",
              size === 'md' && "text-[8px]",
              size === 'lg' && "text-[10px]",
              size === 'xl' && "text-sm",
            )}
          >
            ALPHA
          </span>
        </div>
        
        {/* Coin Edge (3D thickness) */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-b from-[#DAA520] to-[#B8860B]"
          style={{
            transform: 'translateZ(0px)',
            clipPath: 'polygon(0% 45%, 100% 45%, 100% 55%, 0% 55%)',
          }}
        />
      </motion.div>
      
      {/* Ambient Glow */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity",
          "bg-gradient-to-br from-[#FFD700] to-[#FFA500]",
          "-z-10"
        )}
        style={{
          transform: 'translateZ(-10px) scale(1.2)',
        }}
      />
      
      {/* Tooltip */}
      {showTooltip && interactive && (
        <motion.div
          className={cn(
            "absolute -bottom-12 left-1/2 -translate-x-1/2",
            "px-3 py-1.5 rounded-lg",
            "bg-[#050505]/90 backdrop-blur-xl border border-[#FFD700]/30",
            "text-[10px] text-[#FFD700] whitespace-nowrap",
            "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          )}
        >
          Redeemable via ALPHA EXCHANGER
        </motion.div>
      )}
    </div>
  );
}
