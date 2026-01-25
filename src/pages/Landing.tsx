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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            
            <span className="text-xl sm:text-2xl font-black tracking-widest">
              
            </span>
          </Link>
          <div className="gap-2 sm:gap-4 flex-row flex items-start justify-center">
            <a href="#manifesto" className="nav-pill text-muted-foreground hidden lg:block text-sm font-medium">
              Manifesto
            </a>
            <a href="#incentives" className="nav-pill text-muted-foreground hidden lg:block text-sm font-medium">
              Incentives
            </a>
            <a href="#security" className="nav-pill text-muted-foreground hidden lg:block text-sm font-medium">
              Security
            </a>
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
      <section className="relative py-16 sm:py-24 md:py-32 px-4 overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(0,93%,53%,0.08),transparent_50%)] border-8 border-double" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-[100px] animate-float bg-primary-foreground" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-float-delayed" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Premium Feature Badge */}
              <Badge className="badge-premium mb-6 sm:mb-8 px-4 py-2 text-xs sm:text-sm backdrop-blur-sm inline-flex items-center gap-2" variant="outline">
                <Sparkles className="h-3 w-3" />
                Enterprise Financial Platform • Next Generation
              </Badge>
              
              {/* Main Headline with Red Gradient */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
                <span className="text-foreground py-0 text-right text-6xl">Welcome to AMABILIA Network </span>
                
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A next-generation financial ecosystem engineered for 
                <span className="text-primary font-bold"> stability</span>,
                <span className="text-primary font-bold"> transparency</span>, and
                <span className="text-primary font-bold"> intelligent participation</span>.
              </p>

              <p className="text-base sm:text-lg text-muted-foreground/80 mb-10 max-w-xl mx-auto lg:mx-0 tracking-wide">
                Designed for those who move early, think long-term, and build systems—not hype.
              </p>

              {/* Trust Badges Grid */}
              <div className="grid grid-cols-3 gap-4 mb-10 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-primary">50%</p>
                  <p className="text-xs text-muted-foreground font-medium tracking-wide">Commission</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-2xl sm:text-3xl font-black text-primary">90/10</p>
                  <p className="text-xs text-muted-foreground font-medium tracking-wide">Task Split</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-primary">24/7</p>
                  <p className="text-xs text-muted-foreground font-medium tracking-wide">Support</p>
                </div>
              </div>

              {/* Primary CTA */}
              <Link to="/auth">
                <Button size="lg" className="btn-enterprise gap-3 text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 font-black rounded-xl transition-all hover:scale-105" style={{
                boxShadow: '0 20px 40px hsl(0 93% 53% / 0.3)'
              }}>
                  <Zap className="h-5 w-5" />
                  Enter the Founding Phase
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Right Column - Floating 3D Cards */}
            <div className="hidden lg:block relative h-[500px]">
              {/* Card 1 - Main Vault */}
              <FloatingCard className="absolute top-0 right-0 w-72 animate-float" rotation="rotate-x-12">
                <Card className="feature-card-premium p-6 backdrop-blur-xl">
                  <CardHeader className="p-0 pb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">ALPHA Vault</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">Enterprise-grade asset custody with real-time tracking</p>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="text-primary font-bold">₳ 125,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FloatingCard>

              {/* Card 2 - Market Stats */}
              <FloatingCard className="absolute top-32 left-0 w-64 animate-float-delayed" delay={2} rotation="-rotate-6">
                <Card className="feature-card-premium p-5 backdrop-blur-xl">
                  <CardHeader className="p-0 pb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-2">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">Market Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Active Trades</span>
                        <span className="text-primary font-bold">2,847</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">24h Volume</span>
                        <span className="text-primary font-bold">₳ 1.2M</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FloatingCard>

              {/* Card 3 - Network Growth */}
              <FloatingCard className="absolute bottom-16 right-12 w-60 animate-float-slow" delay={4} rotation="rotate-3">
                <Card className="feature-card-premium p-5 backdrop-blur-xl">
                  <CardHeader className="p-0 pb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">Network</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary font-bold">+247%</span>
                      <span className="text-xs text-muted-foreground">this month</span>
                    </div>
                  </CardContent>
                </Card>
              </FloatingCard>
            </div>
          </div>

          {/* Founding Alpha Countdown */}
          <div className="mt-16 sm:mt-20">
            <div className="cta-container rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-primary font-black uppercase tracking-[0.2em] text-sm">
                    Founding Alpha Window
                  </span>
                </div>
                <p className="text-muted-foreground text-sm tracking-wide">
                  Limited enrollment period • Early governance advantage • Historical positioning
                </p>
              </div>
              <CountdownTimer targetDate={foundingEndDate} />
            </div>
          </div>
        </div>
      </section>

      {/* The ALPHA Manifesto */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-background to-card/30" id="manifesto">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="badge-premium mb-4" variant="outline">
              THE AMABILIA MANIFESTO
            </Badge>
          </div>
          
          <div className="relative">
            {/* Decorative line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />
            
            <div className="text-center space-y-8 md:space-y-12">
              <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground leading-relaxed tracking-wide">
                AMABILIA exists to correct what traditional finance and early Web3 got wrong.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
                {[{
                before: 'speculation',
                after: 'Security'
              }, {
                before: 'incentives',
                after: 'Infrastructure'
              }, {
                before: 'extraction',
                after: 'Ownership'
              }, {
                before: 'central control',
                after: 'Community'
              }].map((item, index) => <div key={index} className={`card-hover backdrop-blur-sm rounded-xl p-4 sm:p-5 ${index < 2 ? 'feature-card-premium' : 'feature-card-standard bg-card/50'}`}>
                    <span className="text-primary font-black text-lg tracking-wide">{item.after}</span>
                    <span className="text-muted-foreground mx-2 font-medium">before</span>
                    <span className="text-muted-foreground/60 line-through">{item.before}</span>
                  </div>)}
              </div>
              
              <div className="pt-8 border-t border-border max-w-xl mx-auto">
                <p className="text-lg sm:text-xl text-muted-foreground italic tracking-wide">
                  "This is not a product.<br />
                  <span className="text-primary font-black not-italic tracking-wider">
                    It is a financial layer designed to outlive trends.
                  </span>"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Alpha Incentives */}
      <section className="py-20 sm:py-28 px-4 bg-card/30" id="incentives">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="badge-premium mb-4" variant="outline">
              <Star className="h-3 w-3 mr-1" />
              FOUNDING INCENTIVES
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 tracking-tight">
              Built for Leaders 
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto tracking-wide">
              Founding Alpha members receive lifetime on-chain royalties on all verified direct downline activity.
            </p>
          </div>
          
          {/* Feature Cards Grid - 3 columns */}
          <div className="grid md:grid-cols-3 gap-6">
            {[{
            icon: Layers,
            title: 'Protocol-Aligned',
            desc: 'Incentives that grow with the ecosystem, not against it. Your success is the protocol\'s success.',
            premium: true
          }, {
            icon: Award,
            title: 'Early Recognition',
            desc: 'Recognition for early belief and network leadership. Founding members carry permanent status.',
            premium: true
          }, {
            icon: Eye,
            title: 'Transparent Rewards',
            desc: 'A transparent reward system enforced by smart-logic, not promises. See everything on-chain.',
            premium: true
          }].map((item, index) => <Card key={index} className={`card-hover backdrop-blur-sm ${item.premium ? 'feature-card-premium' : 'feature-card-standard bg-card/50'}`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${item.premium ? 'bg-primary red-glow-sm' : 'bg-card border border-border'}`}>
                    <item.icon className={`h-8 w-8 ${item.premium ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-foreground font-bold tracking-wide">{item.title}</CardTitle>
                  {item.premium && <span className="text-xs text-primary font-black tracking-widest mt-2 block">
                      PREMIUM FEATURE →
                    </span>}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center text-sm tracking-wide leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>)}
          </div>

          {/* Stats Dashboard - 4 columns with conditional styling */}
          <div className="mt-12 cta-container rounded-2xl p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
              value: '50%',
              label: 'Referral Commission',
              sublabel: 'On all membership activations'
            }, {
              value: '90/10',
              label: 'Task Reward Split',
              sublabel: 'Workers keep 90% of all rewards'
            }, {
              value: '₳ 1M+',
              label: 'Total Volume',
              sublabel: 'Processed through protocol'
            }, {
              value: '24/7',
              label: 'Global Access',
              sublabel: 'Always-on infrastructure'
            }].map((stat, index) => <div key={index} className={`text-center p-6 rounded-xl transition-all ${index % 2 === 0 ? 'stats-card-highlighted' : 'bg-background/50 border border-border'}`}>
                  <p className={`text-3xl sm:text-4xl font-black mb-2 tracking-tight ${index % 2 === 0 ? 'text-primary' : 'text-foreground'}`}>
                    {stat.value}
                  </p>
                  <p className="text-foreground font-bold tracking-wide">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* Trust by Design: Security */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-card/30 to-background" id="security">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="badge-premium mb-4" variant="outline">
              <Shield className="h-3 w-3 mr-1" />
              TRUST BY DESIGN
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 tracking-tight">
              Security as a First-Class Feature  
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto tracking-wide">
              AMABILIA's infrastructure is designed around asset protection, data integrity, and system resilience.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[{
            icon: Lock,
            title: 'Vault-Grade Custody',
            desc: 'Enterprise-level asset protection'
          }, {
            icon: Fingerprint,
            title: 'Encrypted Auth',
            desc: 'Multi-layer authentication'
          }, {
            icon: Eye,
            title: 'Transparent Tracking',
            desc: 'On-chain activity visibility'
          }, {
            icon: Shield,
            title: 'No Dark Patterns',
            desc: 'Clean, honest mechanics'
          }].map((item, index) => <div key={index} className="card-hover bg-card/30 backdrop-blur-sm border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:red-glow-sm transition-all">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-foreground mb-1 tracking-wide">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>)}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground italic tracking-wide">
              "Security is not a feature—<span className="text-primary font-black not-italic tracking-wider">it is the foundation.</span>"
            </p>
          </div>
        </div>
      </section>

      {/* High-End Onboarding Flow */}
      <section className="py-20 sm:py-28 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="badge-premium mb-4" variant="outline">
              THE AMABILIA EXPERIENCE
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 tracking-tight">
              Your Journey to ALPHA  
            </h2>
          </div>
          
          <div className="space-y-6">
            {[{
            step: 1,
            title: 'Secure On-Chain Registration',
            desc: 'A streamlined, compliant registration flow that respects privacy while maintaining protocol integrity.',
            features: ['User sovereignty', 'Secure identity binding', 'Long-term ecosystem access']
          }, {
            step: 2,
            title: 'Trusted Access Layer',
            desc: 'Enter AMABILIA through a secure access gateway with biometric-inspired security.',
            features: ['Encryption-first design', 'Vault-level protection', 'Confident transitions']
          }, {
            step: 3,
            title: 'Guided Protocol Walkthrough',
            desc: 'A refined 5-step animated tour introducing AMABILIA\'s core mechanics.',
            features: ['Deposit → Vault → Marketplace → Transfer → Feed']
          }, {
            step: 4,
            title: 'Founding Alpha Recognition',
            desc: 'Completion triggers a prestige celebration moment with your permanent Founding Alpha Badge.',
            features: ['Digital asset celebration', 'Founding Alpha Badge', 'Permanent recognition']
          }].map((item, index) => <div key={index} className={`card-hover flex flex-col sm:flex-row gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl ${index < 2 ? 'feature-card-premium' : 'feature-card-standard bg-card/50'}`}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl alpha-gradient flex items-center justify-center text-white font-black text-xl red-glow-sm">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2 tracking-wide">{item.title}</h3>
                  <p className="text-muted-foreground mb-4 tracking-wide">{item.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((feature, i) => <Badge key={i} variant="outline" className="badge-premium text-xs">
                        {feature}
                      </Badge>)}
                  </div>
                </div>
                <div className="hidden lg:flex items-center">
                  <ChevronRight className="h-6 w-6 text-primary/40" />
                </div>
              </div>)}
          </div>

          {/* Final State */}
          <div className="mt-12 cta-container rounded-2xl p-8 sm:p-10 text-center">
            <div className="w-20 h-20 rounded-full alpha-gradient flex items-center justify-center mx-auto mb-6 red-glow">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-4 tracking-wide">ALPHA Activated</h3>
            <p className="text-muted-foreground max-w-xl mx-auto tracking-wide">
              Land on your dashboard fully activated—secure, informed, and positioned to participate, build, and lead.
            </p>
            <p className="text-primary font-black mt-4 tracking-widest">
              No confusion. No noise. Only signal.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        
        <div className="container mx-auto max-w-3xl text-center relative z-10">
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
      <footer className="py-16 px-4 bg-card/50 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                
                
              </Link>
              
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4 tracking-wide">Protocol</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li><Link to="/dashboard/bank" className="link-underline hover:text-primary transition-colors">ALPHA Vault</Link></li>
                <li><Link to="/dashboard/market" className="link-underline hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link to="/dashboard/finance" className="link-underline hover:text-primary transition-colors">Smart Finance</Link></li>
                <li><Link to="/dashboard/growth" className="link-underline hover:text-primary transition-colors">Network</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4 tracking-wide">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li><Link to="/contact" className="link-underline hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/about" className="link-underline hover:text-primary transition-colors">About</Link></li>
                <li><a href="#" className="link-underline hover:text-primary transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4 tracking-wide">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li><a href="#" className="link-underline hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="link-underline hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="link-underline hover:text-primary transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
          </div>
          
          {/* Global Disclaimer */}
          
          
          
        </div>
      </footer>
    </div>;
}