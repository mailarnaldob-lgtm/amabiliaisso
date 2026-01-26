import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Shield, ArrowRight, Lock, Eye, Fingerprint, Zap, Layers, TrendingUp, Users, ChevronRight, Star, Award, Clock, Globe, CheckCircle, Sparkles, Wallet, BarChart3, Chrome } from 'lucide-react';

// Countdown Timer Component with Enterprise Red Theme
function CountdownTimer({
  targetDate
}: {
  targetDate: Date;
}) {
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
        hours: Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
        minutes: Math.floor(distance % (1000 * 60 * 60) / (1000 * 60)),
        seconds: Math.floor(distance % (1000 * 60) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return <div className="flex items-center justify-center gap-2 sm:gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => <div key={unit} className="text-center">
          <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px] red-glow-sm">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-primary font-mono tracking-widest">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 block uppercase tracking-[0.15em] font-bold">
            {unit}
          </span>
        </div>)}
    </div>;
}

// Floating 3D Card Component
function FloatingCard({
  children,
  className = "",
  delay = 0,
  rotation = "rotate-x-12 rotate-y-n6"
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  rotation?: string;
}) {
  return <div className={`perspective-1200 ${className}`} style={{
    animationDelay: `${delay}s`
  }}>
      <div className={`preserve-3d ${rotation} transition-all duration-500 hover:scale-105`} style={{
      background: 'radial-gradient(circle at center, hsl(0 93% 53% / 0.1) 0%, transparent 70%)',
      boxShadow: '0 25px 50px hsl(0 0% 0% / 0.5), 0 0 50px hsl(0 93% 53% / 0.25)'
    }}>
        {children}
      </div>
    </div>;
}
export default function Landing() {
  // Founding Alpha window ends 30 days from now
  const foundingEndDate = new Date();
  foundingEndDate.setDate(foundingEndDate.getDate() + 30);
  return <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header with Enterprise Styling */}
      <header className="enterprise-header border-b border-border sticky top-0 z-50">
        <div className="container mx-auto py-4 flex items-center justify-between px-[29px]">
          <Link to="/" className="flex items-center gap-2 group">
            
            <span className="text-xl sm:text-2xl font-black tracking-widest">
              
            </span>
          </Link>
          <div className="gap-2 sm:gap-4 flex-row flex items-start justify-center">
            
            
            
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-primary nav-pill">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="btn-enterprise px-6 py-2 text-sm rounded-lg">
                Access Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Floating 3D Cards */}
      

      {/* The ALPHA Manifesto */}
      

      {/* Founding Alpha Incentives */}
      

      {/* Trust by Design: Security */}
      

      {/* High-End Onboarding Flow */}
      

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent rounded-full opacity-5" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        
        <div className="container mx-auto max-w-3xl text-center relative z-10 opacity-100 px-[22px]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-sm font-black tracking-widest">THE PROTOCOL IS LIVE</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 tracking-tight">
            The Future is Being Written.
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10 tracking-wide">
            The only question is: <span className="text-primary font-black">Are you founding it?</span>
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="btn-enterprise gap-3 text-lg px-10 py-7 font-black rounded-xl transition-all hover:scale-105" style={{
            boxShadow: '0 20px 40px hsl(0 93% 53% / 0.3)'
          }}>
              Enter AMABILIA Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary/70" /> Limited founding window
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/70" /> Secure infrastructure
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary/70" /> Global access
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </div>;
}