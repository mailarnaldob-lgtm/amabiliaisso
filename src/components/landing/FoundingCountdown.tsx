import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Crown } from 'lucide-react';

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {Object.entries(timeLeft).map(([unit, value], index) => (
        <motion.div 
          key={unit} 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <div 
            className="rounded-lg px-4 sm:px-5 py-3 min-w-[70px] sm:min-w-[85px]"
            style={{
              background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 100%)',
              border: '1px solid hsl(45 100% 51% / 0.3)',
              boxShadow: '0 0 30px hsl(45 100% 51% / 0.15), inset 0 1px 0 hsl(45 100% 51% / 0.1)'
            }}
          >
            <span 
              className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-2 block uppercase tracking-[0.2em] font-medium">
            {unit}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function FoundingCountdown() {
  // Founding Alpha window ends 30 days from now
  const foundingEndDate = new Date();
  foundingEndDate.setDate(foundingEndDate.getDate() + 30);
  
  return (
    <section className="py-20 sm:py-28 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
            border: '1px solid hsl(45 100% 51% / 0.3)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">Limited Founding Window</span>
        </motion.div>
        
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Founding <span className="text-amber-400">₳lpha</span> Access
        </motion.h2>
        
        <motion.p 
          className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Early participants receive enhanced commission rates, priority support, and permanent founder status.
        </motion.p>
        
        <CountdownTimer targetDate={foundingEndDate} />
        
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/auth">
            <Button 
              size="lg" 
              className="relative gap-2 text-base px-10 py-7 rounded-lg font-semibold text-black overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 0 40px hsl(45 100% 51% / 0.4), 0 8px 30px hsl(0 0% 0% / 0.3)'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Claim Founder Status
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
