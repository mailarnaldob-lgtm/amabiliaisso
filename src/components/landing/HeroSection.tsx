import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

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
  return (
    <motion.div
      className="absolute rounded-full bg-amber-400/30"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`
      }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.2, 1]
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 lg:py-40 px-6 lg:px-8 overflow-hidden">
      {/* Parallax Background Orbs */}
      <motion.div
        className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none"
        style={{ y: backgroundY }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-400/3 rounded-full blur-[120px] pointer-events-none"
        style={{ y: backgroundY }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingParticle x={10} y={20} delay={0} size={3} />
        <FloatingParticle x={25} y={60} delay={0.5} size={4} />
        <FloatingParticle x={80} y={30} delay={1} size={3} />
        <FloatingParticle x={70} y={70} delay={1.5} size={5} />
        <FloatingParticle x={90} y={50} delay={2} size={3} />
        <FloatingParticle x={15} y={80} delay={2.5} size={4} />
      </div>

      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center space-y-8"
          style={{ y: textY, opacity }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
              border: '1px solid hsl(45 100% 51% / 0.3)'
            }}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            whileHover={{ scale: 1.05, borderColor: 'hsl(45 100% 51% / 0.5)' }}
          >
            <motion.div
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </motion.div>
            <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">
              Sovereign Financial Infrastructure
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.span
              className="bg-clip-text text-transparent inline-block"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)'
              }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              AMABILIA NETWORK
            </motion.span>
            <br />
            <span className="text-foreground text-3xl sm:text-4xl lg:text-5xl">
              The Architect of the Alpha Ecosystem
            </span>
          </motion.h1>

          {/* Sub-Headline */}
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Powering the world's first <span className="text-amber-400 font-semibold">Sovereign Labor & Equity Network</span>. 
            Where human effort meets digital asset excellence.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            className="flex justify-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link to="/auth">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="relative gap-2 text-lg px-10 py-7 rounded-lg font-bold text-black overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    boxShadow: '0 0 40px hsl(45 100% 51% / 0.5), 0 8px 30px hsl(0 0% 0% / 0.4)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    ENTER ALPHA ECOSYSTEM
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </span>
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Floating Alpha Coin - Decorative */}
          <motion.div
            className="absolute top-20 right-10 w-16 h-16 rounded-full text-2xl font-bold text-amber-400 flex items-center justify-center z-10 hidden lg:flex"
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 51% / 0.2) 0%, hsl(220 23% 8%) 100%)',
              border: '2px solid hsl(45 100% 51% / 0.3)',
              boxShadow: '0 0 30px hsl(45 100% 51% / 0.3)'
            }}
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, 0],
              boxShadow: ['0 0 20px hsl(45 100% 51% / 0.3)', '0 0 40px hsl(45 100% 51% / 0.5)', '0 0 20px hsl(45 100% 51% / 0.3)']
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ₳
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}