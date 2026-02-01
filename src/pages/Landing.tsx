import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ArrowRight, Lock, Globe, Zap, Users, TrendingUp, Shield, Wallet, BarChart3, Layers, ChevronRight } from 'lucide-react';

// 2026 Power Statement
const POWER_STATEMENT = "We engineered a self-sustaining financial architecture that integrated incentivized mission economies with autonomous P2P compounding, successfully bridging the gap between high-velocity liquidity and long-term exponential growth for the global individual.";

// Countdown Timer Component - 2026 Obsidian Theme
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
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-4 sm:px-5 py-3 min-w-[70px] sm:min-w-[85px] cyan-glow-sm">
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-mono tracking-wider">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-2 block uppercase tracking-[0.2em] font-medium">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

// 3D Abstract Monolith Component
function AbstractMonolith({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div 
      className={`perspective-1200 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div 
        className="preserve-3d transition-all duration-500 hover:scale-105 animate-float"
        style={{
          background: 'linear-gradient(135deg, hsl(220 23% 12%) 0%, hsl(220 23% 6%) 100%)',
          boxShadow: '0 40px 80px hsl(0 0% 0% / 0.6), 0 0 60px hsl(191 100% 50% / 0.15)',
          border: '1px solid hsl(215 25% 91% / 0.1)',
        }}
      >
        {/* Glowing Cyan Circuit Lines */}
        <div className="absolute inset-0 overflow-hidden rounded">
          <div className="absolute top-4 left-4 w-24 h-[1px] bg-gradient-to-r from-primary/60 to-transparent" />
          <div className="absolute top-4 left-4 w-[1px] h-16 bg-gradient-to-b from-primary/60 to-transparent" />
          <div className="absolute bottom-4 right-4 w-24 h-[1px] bg-gradient-to-l from-primary/60 to-transparent" />
          <div className="absolute bottom-4 right-4 w-[1px] h-16 bg-gradient-to-t from-primary/60 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/40 cyan-glow-sm" />
        </div>
      </div>
    </div>
  );
}

// Feature Card Component - 2026 Titanium Style
function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <div className="titanium-card p-6 relative widget-hover">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded bg-primary/10 border border-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  // Founding Alpha window ends 30 days from now
  const foundingEndDate = new Date();
  foundingEndDate.setDate(foundingEndDate.getDate() + 30);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated Background Atmosphere - 2026 Obsidian with Cyan nodes */}
      <div className="bg-atmosphere" />
      
      {/* Header - 2026 Glassmorphism with sharp corners */}
      <header className="enterprise-header sticky top-0 z-50">
        <div className="container mx-auto py-4 flex items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center cyan-glow-sm">
              <span className="text-primary font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Amabilia
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex nav-pill text-muted-foreground">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="btn-enterprise px-6 py-2 text-sm rounded haptic-press">
                Access Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - 2026 with Power Statement and 3D Monoliths */}
      <section className="relative py-24 sm:py-32 lg:py-40 px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Power Statement */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary text-xs font-semibold tracking-wider uppercase">Financial Infrastructure</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                <span className="platinum-text">Next-Generation</span>
                <br />
                <span className="text-foreground">Financial Architecture</span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {POWER_STATEMENT}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="btn-enterprise gap-2 text-base px-8 py-6 rounded haptic-press w-full sm:w-auto">
                    Start Building
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="nav-pill border-border text-muted-foreground px-8 py-6 haptic-press">
                  View Documentation
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            
            {/* Right: 3D Abstract Monoliths */}
            <div className="relative h-[400px] lg:h-[500px] hidden lg:block">
              <AbstractMonolith 
                className="absolute top-0 right-0 w-48 h-64 rounded" 
                delay={0} 
              />
              <AbstractMonolith 
                className="absolute top-20 right-32 w-40 h-56 rounded animate-float-delayed" 
                delay={0.5} 
              />
              <AbstractMonolith 
                className="absolute bottom-0 right-16 w-52 h-48 rounded animate-float-slow" 
                delay={1} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - 2026 Titanium Cards */}
      <section className="py-20 sm:py-28 px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Infrastructure Components
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for scale. Designed for growth. Engineered for the global individual.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Wallet}
              title="Triple Wallet System"
              description="Task, Royalty, and Main wallets for organized earnings with real-time balance syncing."
            />
            <FeatureCard 
              icon={TrendingUp}
              title="P2P Lending Protocol"
              description="Autonomous peer-to-peer lending with configurable terms and automated escrow."
            />
            <FeatureCard 
              icon={Users}
              title="Referral Engine"
              description="50% commission on every membership with multi-tier tracking and instant payouts."
            />
            <FeatureCard 
              icon={Zap}
              title="Mission Economy"
              description="Incentivized task completion with verified proof submission and instant rewards."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Liquidity Exchange"
              description="High-velocity cash-in/cash-out with multiple payment method integrations."
            />
            <FeatureCard 
              icon={Shield}
              title="Enterprise Security"
              description="Bank-grade encryption, row-level security, and comprehensive audit trails."
            />
          </div>
        </div>
      </section>

      {/* Founding Alpha Countdown - 2026 Style */}
      <section className="py-20 sm:py-28 px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20 mb-8">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-primary text-xs font-semibold tracking-wider uppercase">Limited Founding Window</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Founding Alpha Access
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Early participants receive enhanced commission rates, priority support, and permanent founder status.
          </p>
          
          <CountdownTimer targetDate={foundingEndDate} />
          
          <div className="mt-12">
            <Link to="/auth">
              <Button size="lg" className="btn-enterprise gap-2 text-base px-10 py-7 rounded haptic-press">
                Claim Founder Status
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - 2026 Obsidian Table Style */}
      <section className="py-20 sm:py-28 px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Commission Rate', value: '50%', sublabel: 'Per referral' },
              { label: 'Activation Cost', value: '₱600', sublabel: 'One-time' },
              { label: 'Wallet Types', value: '3', sublabel: 'Task, Royalty, Main' },
              { label: 'Lending Terms', value: '7-30', sublabel: 'Days flexible' },
            ].map((stat, idx) => (
              <Card key={idx} className="bg-card border-border widget-hover">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl sm:text-4xl font-bold font-mono text-primary text-glow-cyan mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - 2026 Minimal */}
      <section className="py-24 sm:py-32 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/8 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[150px]" />
        
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-semibold tracking-wider uppercase">Protocol is Live</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The Blueprint for Next-Generation Finance is Open
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            The only question is: <span className="text-primary font-semibold">Are you part of the foundation?</span>
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="btn-enterprise gap-3 text-lg px-10 py-7 font-semibold rounded haptic-press">
              Enter Amabilia Now
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

      {/* Footer - 2026 Minimal */}
      <footer className="py-12 px-6 lg:px-8 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">A</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Amabilia Network © 2026
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
