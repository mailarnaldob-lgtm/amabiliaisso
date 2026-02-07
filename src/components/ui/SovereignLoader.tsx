import React from 'react';
import { motion } from 'framer-motion';

interface SovereignLoaderProps {
  fullScreen?: boolean;
  message?: string;
}

/**
 * AMABILIA NETWORK Sovereign Loader
 * A branded loading transition featuring the trademark with cinematic animations.
 * Uses Obsidian Black (#050505) and Alpha Gold (#FFD700) color scheme.
 */
export const SovereignLoader: React.FC<SovereignLoaderProps> = ({ 
  fullScreen = true,
  message = "INITIALIZING SOVEREIGN LEDGER"
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div 
      className={containerClasses}
      style={{ background: '#050505' }}
    >
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 215, 0, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 215, 0, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Ambient Gold Glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.03) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Content Container */}
      <motion.div
        className="relative flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* AMABILIA NETWORK Trademark */}
        <motion.div
          className="relative flex flex-col items-center"
          animate={{
            filter: [
              'drop-shadow(0 0 20px rgba(255, 215, 0, 0.2))',
              'drop-shadow(0 0 40px rgba(255, 215, 0, 0.4))',
              'drop-shadow(0 0 20px rgba(255, 215, 0, 0.2))'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Gold Accent Bar */}
          <motion.div
            className="w-16 h-0.5 mb-4"
            style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Main Title */}
          <h1 
            className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-center"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            AMABILIA
          </h1>

          <h2 
            className="text-lg md:text-xl font-medium tracking-[0.3em] mt-1"
            style={{ color: 'rgba(255, 215, 0, 0.7)' }}
          >
            NETWORK
          </h2>

          {/* Gold Accent Bar */}
          <motion.div
            className="w-24 h-0.5 mt-4"
            style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>

        {/* Alpha Symbol Indicator */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.span
            className="text-2xl font-bold"
            style={{ color: '#FFD700' }}
            animate={{
              textShadow: [
                '0 0 10px rgba(255, 215, 0, 0.3)',
                '0 0 20px rgba(255, 215, 0, 0.6)',
                '0 0 10px rgba(255, 215, 0, 0.3)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ₳
          </motion.span>
          <span 
            className="text-xs tracking-[0.15em] font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            ALPHA ECOSYSTEM
          </span>
        </motion.div>

        {/* Loading Message */}
        <motion.div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'rgba(255, 215, 0, 0.6)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="font-mono tracking-wider">{message}</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ▌
          </motion.span>
        </motion.div>

        {/* Progress Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#FFD700' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Watermark Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl font-bold tracking-[0.3em] whitespace-nowrap"
            style={{
              color: '#FFD700',
              top: `${15 + i * 18}%`,
              left: i % 2 === 0 ? '-5%' : '5%',
              transform: 'rotate(-15deg)'
            }}
          >
            AMABILIA NETWORK • AMABILIA NETWORK • AMABILIA NETWORK
          </div>
        ))}
      </div>
    </div>
  );
};

export default SovereignLoader;
