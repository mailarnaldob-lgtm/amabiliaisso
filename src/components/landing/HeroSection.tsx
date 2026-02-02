import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// 2026 Power Statement
const POWER_STATEMENT = "We engineered a self-sustaining financial architecture that integrated incentivized mission economies with autonomous P2P compounding, successfully bridging the gap between high-velocity liquidity and long-term exponential growth for the global individual.";

// 3D Financial Monolith Component with Parallax
function FinancialMonolith({
  className = "",
  delay = 0,
  parallaxOffset = 0
}: {
  className?: string;
  delay?: number;
  parallaxOffset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [parallaxOffset, -parallaxOffset]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);
  return <motion.div ref={ref} className={`relative ${className}`} initial={{
    opacity: 0,
    y: 40,
    rotateY: -15
  }} animate={{
    opacity: 1,
    y: 0,
    rotateY: 0
  }} transition={{
    duration: 0.8,
    delay,
    ease: "easeOut"
  }} style={{
    perspective: '1200px',
    y,
    rotateZ: rotate
  }}>
      <motion.div className="preserve-3d transition-all duration-500 hover:scale-105 w-full h-full rounded-sm opacity-70" style={{
      background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(220 23% 6%) 50%, hsl(45 100% 51% / 0.08) 100%)',
      boxShadow: '0 40px 80px hsl(0 0% 0% / 0.6), 0 0 60px hsl(45 100% 51% / 0.2), inset 0 1px 0 hsl(45 100% 51% / 0.3)',
      border: '1px solid hsl(45 100% 51% / 0.2)'
    }} whileHover={{
      boxShadow: '0 50px 100px hsl(0 0% 0% / 0.7), 0 0 80px hsl(45 100% 51% / 0.3), inset 0 1px 0 hsl(45 100% 51% / 0.4)'
    }}>
        {/* Golden Circuit Lines */}
        
      </motion.div>
    </motion.div>;
}

// Floating particle component
function FloatingParticle({
  delay = 0,
  size = 4,
  x = 0,
  y = 0
}: {
  delay?: number;
  size?: number;
  x?: number;
  y?: number;
}) {
  return <motion.div className="absolute rounded-full bg-amber-400/30" style={{
    width: size,
    height: size,
    left: `${x}%`,
    top: `${y}%`
  }} animate={{
    y: [0, -20, 0],
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.2, 1]
  }} transition={{
    duration: 4,
    delay,
    repeat: Infinity,
    ease: "easeInOut"
  }} />;
}
export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  return <section ref={containerRef} className="relative py-24 sm:py-32 lg:py-40 px-6 lg:px-8 overflow-hidden">
      {/* Parallax Background Orbs */}
      <motion.div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" style={{
      y: backgroundY
    }} />
      <motion.div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-400/3 rounded-full blur-[120px] pointer-events-none" style={{
      y: backgroundY
    }} />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingParticle x={10} y={20} delay={0} size={3} />
        <FloatingParticle x={25} y={60} delay={0.5} size={4} />
        <FloatingParticle x={80} y={30} delay={1} size={3} />
        <FloatingParticle x={70} y={70} delay={1.5} size={5} />
        <FloatingParticle x={90} y={50} delay={2} size={3} />
        <FloatingParticle x={15} y={80} delay={2.5} size={4} />
      </div>
      
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Power Statement with Parallax */}
          <motion.div className="space-y-8" style={{
          y: textY,
          opacity
        }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
            border: '1px solid hsl(45 100% 51% / 0.3)'
          }} initial={{
            opacity: 0,
            y: -20,
            scale: 0.9
          }} animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }} transition={{
            delay: 0.2,
            duration: 0.5,
            type: "spring"
          }} whileHover={{
            scale: 1.05,
            borderColor: 'hsl(45 100% 51% / 0.5)'
          }}>
              <motion.div animate={{
              rotate: [0, 15, 0]
            }} transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </motion.div>
              <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">Sovereign Financial Infrastructure</span>
            </motion.div>
            
            <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3,
            duration: 0.6
          }}>
              <motion.span className="bg-clip-text text-transparent inline-block" style={{
              backgroundImage: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)'
            }} animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }} transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}>
                ₳LPHA
              </motion.span>
              <br />
              <span className="text-foreground">Financial Architecture</span>
            </motion.h1>
            
            <motion.p className="text-lg text-muted-foreground leading-relaxed max-w-lg" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.5,
            duration: 0.6
          }}>
              {POWER_STATEMENT}
            </motion.p>
            
            <motion.div className="flex flex-col sm:flex-row gap-4" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.6,
            duration: 0.5
          }}>
              <Link to="/auth">
                <motion.div whileHover={{
                scale: 1.03,
                y: -2
              }} whileTap={{
                scale: 0.98
              }} transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}>
                  <Button size="lg" className="relative gap-2 text-base px-8 py-6 rounded-lg font-semibold text-black overflow-hidden group" style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 0 30px hsl(45 100% 51% / 0.4), 0 4px 20px hsl(0 0% 0% / 0.3)'
                }}>
                    <span className="relative z-10 flex items-center gap-2">
                      Start Your ₳lpha Journey
                      <motion.div animate={{
                      x: [0, 4, 0]
                    }} transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}>
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </span>
                    {/* Shimmer effect */}
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" initial={{
                    x: '-100%'
                  }} animate={{
                    x: '200%'
                  }} transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1
                  }} />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{
              scale: 1.03
            }} whileTap={{
              scale: 0.98
            }}>
                <Button variant="outline" size="lg" className="px-8 py-6 border-amber-400/30 text-amber-400/80 hover:bg-amber-400/10 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300">
                  View Documentation
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Right: 3D Financial Monoliths with Parallax */}
          <div className="relative h-[400px] lg:h-[500px] hidden lg:block">
            <FinancialMonolith className="absolute top-0 right-0 w-48 h-64" delay={0.2} parallaxOffset={30} />
            <FinancialMonolith className="absolute top-24 right-36 w-40 h-56" delay={0.4} parallaxOffset={50} />
            <FinancialMonolith className="absolute bottom-0 right-12 w-52 h-48" delay={0.6} parallaxOffset={20} />
            
            {/* Floating Alpha Coins */}
            <motion.div className="absolute top-16 left-8 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-amber-400" style={{
            background: 'radial-gradient(circle, hsl(45 100% 51% / 0.2) 0%, hsl(220 23% 8%) 100%)',
            border: '2px solid hsl(45 100% 51% / 0.3)',
            boxShadow: '0 0 30px hsl(45 100% 51% / 0.3)'
          }} animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
            boxShadow: ['0 0 30px hsl(45 100% 51% / 0.3)', '0 0 50px hsl(45 100% 51% / 0.5)', '0 0 30px hsl(45 100% 51% / 0.3)']
          }} transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }} whileHover={{
            scale: 1.2,
            rotate: 15
          }}>
              ₳
            </motion.div>
            
            <motion.div className="absolute bottom-24 left-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-amber-400/70" style={{
            background: 'radial-gradient(circle, hsl(45 100% 51% / 0.1) 0%, hsl(220 23% 8%) 100%)',
            border: '1px solid hsl(45 100% 51% / 0.2)'
          }} animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}>
              ₳
            </motion.div>
          </div>
        </div>
      </div>
    </section>;
}