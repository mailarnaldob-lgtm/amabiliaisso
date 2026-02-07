import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AlphaGoldCoin3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

const sizeMap = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 120,
};

export function AlphaGoldCoin3D({ 
  size = 'md', 
  className = '',
  showTooltip = true 
}: AlphaGoldCoin3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [rotation, setRotation] = useState(0);
  const dimension = sizeMap[size];

  // Continuous slow rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  const coinElement = (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{ 
        width: dimension, 
        height: dimension,
        perspective: '1000px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.4 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 51% / 0.5) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Sparkle effect on click */}
      <AnimatePresence>
        {isClicked && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFF)',
                  boxShadow: '0 0 6px #FFD700',
                }}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: dimension / 2 - 3,
                  y: dimension / 2 - 3,
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1.5,
                  x: dimension / 2 - 3 + Math.cos((i * Math.PI * 2) / 8) * (dimension * 0.6),
                  y: dimension / 2 - 3 + Math.sin((i * Math.PI * 2) / 8) * (dimension * 0.6),
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* 3D Coin Container */}
      <motion.div
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg) ${isHovered ? 'rotateX(10deg) rotateZ(5deg)' : ''}`,
          transition: isHovered ? 'transform 0.3s ease-out' : 'none',
        }}
        animate={isClicked ? { 
          rotateY: [rotation, rotation + 360],
        } : {}}
        transition={isClicked ? { duration: 0.4, ease: "easeOut" } : {}}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(ellipse at 30% 30%, #FFF5B8 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, #8B6914 0%, transparent 40%),
              linear-gradient(145deg, #FFD700 0%, #FFA500 30%, #B8860B 70%, #8B6914 100%)
            `,
            boxShadow: `
              inset 0 ${dimension * 0.02}px ${dimension * 0.1}px hsl(45 100% 80% / 0.6),
              inset 0 -${dimension * 0.02}px ${dimension * 0.1}px hsl(45 100% 20% / 0.4),
              0 ${dimension * 0.05}px ${dimension * 0.15}px hsl(0 0% 0% / 0.4),
              0 0 ${dimension * 0.3}px hsl(45 100% 51% / ${isHovered ? 0.6 : 0.3})
            `,
            backfaceVisibility: 'hidden',
            transform: 'translateZ(4px)',
            border: '2px solid hsl(45 100% 40% / 0.5)',
          }}
        >
          {/* Inner ring embossing */}
          <div
            className="absolute rounded-full"
            style={{
              width: '75%',
              height: '75%',
              background: 'transparent',
              border: `${dimension * 0.03}px solid hsl(45 100% 35% / 0.4)`,
              boxShadow: `
                inset 0 1px 2px hsl(45 100% 70% / 0.3),
                0 1px 2px hsl(45 100% 20% / 0.3)
              `,
            }}
          />
          
          {/* Alpha Symbol */}
          <span 
            className="font-mono font-bold select-none"
            style={{
              fontSize: dimension * 0.4,
              color: '#8B6914',
              textShadow: `
                0 1px 0 hsl(45 100% 70% / 0.8),
                0 -1px 0 hsl(45 100% 20% / 0.5),
                0 2px 4px hsl(0 0% 0% / 0.2)
              `,
              transform: 'translateZ(2px)',
            }}
          >
            ₳
          </span>
          
          {/* Shine streak */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, hsl(45 100% 95% / 0.4) 45%, hsl(45 100% 95% / 0.6) 50%, hsl(45 100% 95% / 0.4) 55%, transparent 60%)',
              transform: `translateX(${isHovered ? '100%' : '-100%'})`,
              transition: 'transform 0.6s ease-in-out',
            }}
          />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(ellipse at 70% 30%, #FFF5B8 0%, transparent 50%),
              radial-gradient(ellipse at 30% 70%, #8B6914 0%, transparent 40%),
              linear-gradient(325deg, #FFD700 0%, #FFA500 30%, #B8860B 70%, #8B6914 100%)
            `,
            boxShadow: `
              inset 0 ${dimension * 0.02}px ${dimension * 0.1}px hsl(45 100% 80% / 0.6),
              inset 0 -${dimension * 0.02}px ${dimension * 0.1}px hsl(45 100% 20% / 0.4)
            `,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(4px)',
            border: '2px solid hsl(45 100% 40% / 0.5)',
          }}
        >
          {/* Back pattern */}
          <div
            className="absolute rounded-full"
            style={{
              width: '80%',
              height: '80%',
              background: 'transparent',
              border: `${dimension * 0.02}px solid hsl(45 100% 35% / 0.3)`,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '60%',
              height: '60%',
              background: 'transparent',
              border: `${dimension * 0.02}px solid hsl(45 100% 35% / 0.3)`,
            }}
          />
        </div>

        {/* Edge (thickness) */}
        <div
          className="absolute rounded-full"
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #B8860B 0%, #FFD700 50%, #B8860B 100%)',
            transform: 'translateZ(0px)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          }}
        />
      </motion.div>
    </motion.div>
  );

  if (!showTooltip) {
    return coinElement;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {coinElement}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-[#0a0a0a]/95 backdrop-blur-xl border-amber-500/30 px-4 py-2 max-w-xs"
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">₳</span>
            <span className="text-sm text-amber-100">
              This Alpha Coin can be redeemed through{' '}
              <span className="text-amber-400 font-semibold">ALPHA EXCHANGER</span>
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Inline coin for use within text
export function InlineAlphaCoin({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center align-middle ${className}`}>
      <AlphaGoldCoin3D size="sm" showTooltip={true} />
    </span>
  );
}
