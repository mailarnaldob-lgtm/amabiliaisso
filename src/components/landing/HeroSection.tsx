import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// 2026 Power Statement
const POWER_STATEMENT = "We engineered a self-sustaining financial architecture that integrated incentivized mission economies with autonomous P2P compounding, successfully bridging the gap between high-velocity liquidity and long-term exponential growth for the global individual.";

// 3D Financial Monolith Component
function FinancialMonolith({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 40, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      style={{ perspective: '1200px' }}
    >
      <div 
        className="preserve-3d transition-all duration-500 hover:scale-105 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(220 23% 6%) 50%, hsl(45 100% 51% / 0.08) 100%)',
          boxShadow: '0 40px 80px hsl(0 0% 0% / 0.6), 0 0 60px hsl(45 100% 51% / 0.2), inset 0 1px 0 hsl(45 100% 51% / 0.3)',
          border: '1px solid hsl(45 100% 51% / 0.2)'
        }}
      >
        {/* Golden Circuit Lines */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute top-4 left-4 w-24 h-[1px] bg-gradient-to-r from-amber-400/60 to-transparent" />
          <div className="absolute top-4 left-4 w-[1px] h-16 bg-gradient-to-b from-amber-400/60 to-transparent" />
          <div className="absolute bottom-4 right-4 w-24 h-[1px] bg-gradient-to-l from-amber-400/60 to-transparent" />
          <div className="absolute bottom-4 right-4 w-[1px] h-16 bg-gradient-to-t from-amber-400/60 to-transparent" />
          
          {/* Central Alpha Symbol */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-amber-400 font-bold text-xl"
              style={{
                background: 'radial-gradient(circle, hsl(45 100% 51% / 0.2) 0%, transparent 70%)',
                boxShadow: '0 0 40px hsl(45 100% 51% / 0.4)'
              }}
              animate={{ 
                boxShadow: [
                  '0 0 40px hsl(45 100% 51% / 0.4)',
                  '0 0 60px hsl(45 100% 51% / 0.6)',
                  '0 0 40px hsl(45 100% 51% / 0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ₳
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 px-6 lg:px-8 overflow-hidden">
      {/* Golden Gradient Orb Background */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-400/3 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Power Statement */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                border: '1px solid hsl(45 100% 51% / 0.3)'
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">Sovereign Financial Infrastructure</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)'
                }}
              >
                ₳LPHA
              </span>
              <br />
              <span className="text-foreground">Financial Architecture</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-muted-foreground leading-relaxed max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {POWER_STATEMENT}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="relative gap-2 text-base px-8 py-6 rounded-lg font-semibold text-black overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    boxShadow: '0 0 30px hsl(45 100% 51% / 0.4), 0 4px 20px hsl(0 0% 0% / 0.3)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Your ₳lpha Journey
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 border-amber-400/30 text-amber-400/80 hover:bg-amber-400/10 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300"
              >
                View Documentation
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Right: 3D Financial Monoliths */}
          <div className="relative h-[400px] lg:h-[500px] hidden lg:block">
            <FinancialMonolith className="absolute top-0 right-0 w-48 h-64" delay={0.2} />
            <FinancialMonolith className="absolute top-24 right-36 w-40 h-56" delay={0.4} />
            <FinancialMonolith className="absolute bottom-0 right-12 w-52 h-48" delay={0.6} />
            
            {/* Floating Alpha Coins */}
            <motion.div
              className="absolute top-16 left-8 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-amber-400"
              style={{
                background: 'radial-gradient(circle, hsl(45 100% 51% / 0.2) 0%, hsl(220 23% 8%) 100%)',
                border: '2px solid hsl(45 100% 51% / 0.3)',
                boxShadow: '0 0 30px hsl(45 100% 51% / 0.3)'
              }}
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              ₳
            </motion.div>
            
            <motion.div
              className="absolute bottom-24 left-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-amber-400/70"
              style={{
                background: 'radial-gradient(circle, hsl(45 100% 51% / 0.1) 0%, hsl(220 23% 8%) 100%)',
                border: '1px solid hsl(45 100% 51% / 0.2)'
              }}
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              ₳
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
