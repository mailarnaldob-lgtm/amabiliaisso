import { Card, CardContent } from '@/components/ui/card';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TrendingUp, Users, Zap, Wallet } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { AlphaGoldCoin3D } from './AlphaGoldCoin3D';

/**
 * LIVE ALPHA STATS - SOVEREIGN FINANCIAL INFRASTRUCTURE V10.0
 * 
 * Features:
 * - Real-time network activity with 15-second RESTful polling simulation
 * - Digital Odometer font for ₳ balances
 * - Glassmorphism card containers with Bloom hover
 * - Interactive 3D coin animations within cards
 * - Fully responsive: grid stacks for tablet/mobile
 */

// Simulated live stats - in production, these come from database via RESTful polling
const BASE_STATS = {
  totalMissions: 12847,
  totalEarned: 2456780,
  activeMembers: 3429,
  liveTransactions: 847
};

// Animated odometer-style counter with JetBrains Mono font
function AnimatedOdometer({ 
  value, 
  prefix = '', 
  suffix = '' 
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(value * easeOutQuart);
            setDisplayValue(currentValue);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [value, hasAnimated]);
  
  // Simulate live value updates with rolling animation
  useEffect(() => {
    if (!hasAnimated) return;
    
    const timeout = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [value, hasAnimated]);
  
  return (
    <span 
      ref={ref} 
      className="font-mono tabular-nums"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {prefix}
      <motion.span
        key={displayValue}
        initial={{ opacity: 0.7, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {displayValue.toLocaleString()}
      </motion.span>
      {suffix}
    </span>
  );
}

// Stat card with interactive 3D coin and Bloom effects
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  prefix = '', 
  suffix = '',
  delay = 0,
  isLive = false,
  showCoin = false
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  prefix?: string; 
  suffix?: string;
  delay?: number;
  isLive?: boolean;
  showCoin?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      whileHover={{ 
        y: -8, 
        scale: 0.98,
        transition: { duration: 0.3, type: "spring", stiffness: 400, damping: 25 } 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className="relative overflow-hidden border-0 group cursor-pointer h-full"
        style={{
          background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 100%)',
          backdropFilter: 'blur(40px)',
          boxShadow: isHovered 
            ? '0 20px 60px hsl(45 100% 51% / 0.15), 0 0 40px hsl(45 100% 51% / 0.1), inset 0 1px 0 hsl(45 100% 51% / 0.15)'
            : '0 20px 40px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(45 100% 51% / 0.1)',
          border: isHovered ? '1px solid hsl(45 100% 51% / 0.3)' : '1px solid transparent',
          transition: 'all 0.3s ease-out'
        }}
      >
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className="p-3 rounded-lg relative"
              style={{
                background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                border: '1px solid hsl(45 100% 51% / 0.2)'
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="h-5 w-5 text-[#FFD700]" />
            </motion.div>
            
            <div className="flex items-center gap-2">
              {showCoin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isHovered ? 1 : 0.6, scale: isHovered ? 1 : 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlphaGoldCoin3D size="sm" showTooltip={false} />
                </motion.div>
              )}
              {isLive && (
                <motion.div 
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.3 }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs text-green-400 font-medium">LIVE</span>
                </motion.div>
              )}
            </div>
          </div>
          
          <motion.p 
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px hsl(45 100% 51% / 0.3)'
            }}
          >
            <AnimatedOdometer value={value} prefix={prefix} suffix={suffix} />
          </motion.p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
        
        {/* Animated glow effect on hover */}
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(45 100% 51% / 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: isHovered ? 1.5 : 0.8, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Bottom border glow on hover */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(45 100% 51% / 0.6), transparent)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
}

export function LiveAlphaStats() {
  const [stats, setStats] = useState(BASE_STATS);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  
  // Simulate 15-second RESTful polling updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalMissions: prev.totalMissions + Math.floor(Math.random() * 3),
        totalEarned: prev.totalEarned + Math.floor(Math.random() * 500),
        activeMembers: prev.activeMembers + (Math.random() > 0.7 ? 1 : 0),
        liveTransactions: prev.liveTransactions + Math.floor(Math.random() * 2)
      }));
    }, 15000); // 15-second polling interval
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section ref={containerRef} className="py-16 sm:py-24 px-6 lg:px-8 relative overflow-hidden">
      {/* Parallax Background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFD700]/[0.03] to-transparent pointer-events-none"
        style={{ y }}
      />
      
      {/* Ambient gold orbs */}
      <motion.div
        className="absolute top-1/4 -left-20 w-60 h-60 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(45 100% 51% / 0.05) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Section Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.1) 0%, transparent 100%)',
              border: '1px solid hsl(45 100% 51% / 0.2)'
            }}
            whileHover={{ scale: 1.05, borderColor: 'hsl(45 100% 51% / 0.4)' }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-4 h-4 text-[#FFD700]" />
            </motion.div>
            <span className="text-[#FFD700] text-xs font-semibold tracking-wider uppercase">
              Real-Time Network Activity
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Sovereign Financial{' '}
            <span className="text-[#FFD700]">Infrastructure</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch the Alpha Network grow in real-time. Every mission, every transaction, every member.
          </p>
        </motion.div>
        
        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard 
            icon={Zap} 
            label="Missions Completed" 
            value={stats.totalMissions} 
            delay={0.1}
            isLive
          />
          <StatCard 
            icon={Wallet} 
            label="Total ₳ Earned" 
            value={stats.totalEarned} 
            prefix="₳ " 
            delay={0.2}
            isLive
            showCoin
          />
          <StatCard 
            icon={Users} 
            label="Active Members" 
            value={stats.activeMembers} 
            delay={0.3}
          />
          <StatCard 
            icon={TrendingUp} 
            label="Live Transactions" 
            value={stats.liveTransactions} 
            delay={0.4}
            isLive
            showCoin
          />
        </div>
        
        {/* Micro-shimmer ticker line */}
        <motion.div
          className="mt-8 h-px w-full max-w-md mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(45 100% 51% / 0.3), transparent)'
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}
