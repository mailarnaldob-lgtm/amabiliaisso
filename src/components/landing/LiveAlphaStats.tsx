import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

// Simulated live stats - in production, these would come from Supabase
const BASE_STATS = {
  totalMissions: 12847,
  totalEarned: 2456780,
  activeMembers: 3429,
  liveTransactions: 847
};

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return (
    <span className="font-mono">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  prefix = '', 
  suffix = '',
  delay = 0,
  isLive = false
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  prefix?: string; 
  suffix?: string;
  delay?: number;
  isLive?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card 
        className="relative overflow-hidden border-0"
        style={{
          background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 100%)',
          boxShadow: '0 20px 40px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(45 100% 51% / 0.1)'
        }}
      >
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="p-3 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                border: '1px solid hsl(45 100% 51% / 0.2)'
              }}
            >
              <Icon className="h-5 w-5 text-amber-400" />
            </div>
            {isLive && (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </div>
            )}
          </div>
          
          <p 
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px hsl(45 100% 51% / 0.3)'
            }}
          >
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
        
        {/* Subtle golden glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl" />
      </Card>
    </motion.div>
  );
}

export function LiveAlphaStats() {
  const [stats, setStats] = useState(BASE_STATS);
  
  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalMissions: prev.totalMissions + Math.floor(Math.random() * 3),
        totalEarned: prev.totalEarned + Math.floor(Math.random() * 500),
        activeMembers: prev.activeMembers + (Math.random() > 0.7 ? 1 : 0),
        liveTransactions: prev.liveTransactions + Math.floor(Math.random() * 2)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="py-20 sm:py-28 px-6 lg:px-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/3 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.1) 0%, transparent 100%)',
              border: '1px solid hsl(45 100% 51% / 0.2)'
            }}
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">Real-Time Network Activity</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Live ₳lpha <span className="text-amber-400">Statistics</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch the Alpha Network grow in real-time. Every mission, every transaction, every member.
          </p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          />
        </div>
      </div>
    </section>
  );
}
