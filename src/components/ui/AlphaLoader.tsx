import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface AlphaLoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AlphaLoader: React.FC<AlphaLoaderProps> = ({ 
  fullScreen = false, 
  message = "INITIALIZING SOVEREIGN LEDGER",
  size = 'md'
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const sizeConfig = {
    sm: { coin: 120, text: 'text-xs', orbit: 70 },
    md: { coin: 180, text: 'text-sm', orbit: 100 },
    lg: { coin: 260, text: 'text-base', orbit: 140 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (!fullScreen) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (e.clientX - centerX) / centerX;
      const deltaY = (e.clientY - centerY) / centerY;
      
      rotateX.set(deltaY * 15);
      rotateY.set(deltaX * 15);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [fullScreen, rotateX, rotateY]);

  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a12]/95 backdrop-blur-xl"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      {/* Digital Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Bokeh particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 100 + 30,
              height: Math.random() * 100 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(0, 242, 255, 0.1) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Main Coin Container with 3D Transform */}
        <motion.div
          className="relative"
          style={{
            perspective: 1000,
            rotateX: fullScreen ? rotateX : 0,
            rotateY: fullScreen ? rotateY : 0,
          }}
          animate={!fullScreen ? {
            rotateY: [0, 10, -10, 0],
          } : {}}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Outer Gold Ring */}
          <motion.div
            className="relative rounded-full"
            style={{
              width: config.coin,
              height: config.coin,
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 25%, #d4af37 50%, #aa8c2c 75%, #d4af37 100%)',
              boxShadow: `
                0 0 30px rgba(212, 175, 55, 0.4),
                inset 0 2px 4px rgba(255, 255, 255, 0.3),
                inset 0 -2px 4px rgba(0, 0, 0, 0.3)
              `,
            }}
            animate={{
              boxShadow: [
                '0 0 30px rgba(212, 175, 55, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                '0 0 50px rgba(212, 175, 55, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                '0 0 30px rgba(212, 175, 55, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Inner Dark Circle */}
            <div 
              className="absolute rounded-full flex items-center justify-center"
              style={{
                top: 8,
                left: 8,
                right: 8,
                bottom: 8,
                background: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)',
                boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Circuitry Pattern Overlay */}
              <svg 
                className="absolute inset-0 w-full h-full opacity-30"
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient id="circuitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F2FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00F2FF" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                {/* Circuit lines */}
                <path 
                  d="M20 50 L35 50 L40 45 L45 45" 
                  stroke="url(#circuitGlow)" 
                  strokeWidth="0.5" 
                  fill="none"
                />
                <path 
                  d="M80 50 L65 50 L60 55 L55 55" 
                  stroke="url(#circuitGlow)" 
                  strokeWidth="0.5" 
                  fill="none"
                />
                <path 
                  d="M50 20 L50 35 L45 40 L45 45" 
                  stroke="url(#circuitGlow)" 
                  strokeWidth="0.5" 
                  fill="none"
                />
                <circle cx="20" cy="50" r="2" fill="#00F2FF" opacity="0.6" />
                <circle cx="80" cy="50" r="2" fill="#00F2FF" opacity="0.6" />
                <circle cx="50" cy="20" r="2" fill="#00F2FF" opacity="0.6" />
              </svg>

              {/* The Stylized "A" Logo */}
              <motion.div
                className="relative z-10"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(0, 242, 255, 0.5), 0 0 40px rgba(0, 242, 255, 0.3)',
                    '0 0 30px rgba(0, 242, 255, 0.8), 0 0 60px rgba(0, 242, 255, 0.5)',
                    '0 0 20px rgba(0, 242, 255, 0.5), 0 0 40px rgba(0, 242, 255, 0.3)',
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg 
                  width={config.coin * 0.45} 
                  height={config.coin * 0.45} 
                  viewBox="0 0 100 100"
                  className="drop-shadow-[0_0_15px_rgba(0,242,255,0.6)]"
                >
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f4d03f" />
                      <stop offset="50%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#aa8c2c" />
                    </linearGradient>
                    <filter id="neonGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Main A shape with extended bar */}
                  <path 
                    d="M50 15 L15 85 L28 85 L35 70 L65 70 L72 85 L85 85 L50 15 Z M42 58 L50 38 L58 58 L42 58 Z"
                    fill="url(#goldGradient)"
                    filter="url(#neonGlow)"
                  />
                  {/* Extended horizontal bar */}
                  <rect x="8" y="62" width="25" height="4" fill="url(#goldGradient)" rx="1" />
                  {/* Cyan accent lines */}
                  <motion.path 
                    d="M25 75 L25 85 L15 85"
                    stroke="#00F2FF"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Orbital Ring */}
          <div 
            className="absolute pointer-events-none"
            style={{
              width: config.coin + config.orbit,
              height: config.coin + config.orbit,
              top: -config.orbit / 2,
              left: -config.orbit / 2,
            }}
          >
            {/* Orbit Path */}
            <svg 
              className="absolute inset-0 w-full h-full"
              style={{ transform: 'rotateX(60deg)' }}
            >
              <ellipse 
                cx="50%" 
                cy="50%" 
                rx="48%" 
                ry="48%"
                fill="none"
                stroke="rgba(0, 242, 255, 0.15)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>
            
            {/* Orbiting Data Node */}
            <motion.div
              className="absolute"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #00F2FF 0%, rgba(0, 242, 255, 0.5) 50%, transparent 100%)',
                boxShadow: '0 0 20px #00F2FF, 0 0 40px rgba(0, 242, 255, 0.5)',
                top: '50%',
                left: '50%',
                marginTop: -6,
                marginLeft: -6,
              }}
              animate={{
                x: [
                  (config.coin + config.orbit) / 2 - 6,
                  0,
                  -(config.coin + config.orbit) / 2 + 6,
                  0,
                  (config.coin + config.orbit) / 2 - 6,
                ],
                y: [
                  0,
                  -(config.coin + config.orbit) / 4,
                  0,
                  (config.coin + config.orbit) / 4,
                  0,
                ],
                scale: [1, 1.3, 1, 1.3, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {/* Light Trail */}
              <motion.div
                className="absolute"
                style={{
                  width: 40,
                  height: 3,
                  background: 'linear-gradient(90deg, rgba(0, 242, 255, 0.6) 0%, transparent 100%)',
                  borderRadius: 2,
                  transformOrigin: 'right center',
                  right: 6,
                  top: 4.5,
                }}
                animate={{
                  opacity: [0.8, 0.4, 0.8],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
              />
            </motion.div>

            {/* Secondary orbit node (opposite) */}
            <motion.div
              className="absolute"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #d4af37 0%, rgba(212, 175, 55, 0.5) 50%, transparent 100%)',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.8)',
                top: '50%',
                left: '50%',
                marginTop: -4,
                marginLeft: -4,
              }}
              animate={{
                x: [
                  -(config.coin + config.orbit) / 2 + 4,
                  0,
                  (config.coin + config.orbit) / 2 - 4,
                  0,
                  -(config.coin + config.orbit) / 2 + 4,
                ],
                y: [
                  0,
                  (config.coin + config.orbit) / 4,
                  0,
                  -(config.coin + config.orbit) / 4,
                  0,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>

        {/* ALPHA Text with Breathing Glow */}
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{
            filter: [
              'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))',
              'drop-shadow(0 0 20px rgba(212, 175, 55, 0.8))',
              'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            className="font-bold tracking-[0.3em] text-transparent bg-clip-text"
            style={{
              fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2rem',
              backgroundImage: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #aa8c2c 100%)',
            }}
          >
            ALPHA
          </motion.span>
          <span 
            className="tracking-[0.15em] text-[10px] opacity-70"
            style={{ color: '#8b9dc3' }}
          >
            LIBERATE. INNOVATE. PROSPER.
          </span>
        </motion.div>

        {/* Loading Message */}
        <motion.div
          className={`flex items-center gap-2 ${config.text}`}
          style={{ color: 'rgba(0, 242, 255, 0.8)' }}
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

        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: '#00F2FF' }}
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
      </div>
    </div>
  );
};

export default AlphaLoader;
