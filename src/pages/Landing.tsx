import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  Eye, 
  Fingerprint, 
  Hexagon,
  Zap,
  Layers,
  Wallet,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
  Award,
  Clock,
  Database,
  Globe,
  CheckCircle,
  Sparkles
} from 'lucide-react';

// Countdown Timer Component
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
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="bg-card/80 backdrop-blur-sm border border-amber-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px]">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-500 font-mono">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 block uppercase tracking-wider">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  // Founding Alpha window ends 30 days from now
  const foundingEndDate = new Date();
  foundingEndDate.setDate(foundingEndDate.getDate() + 30);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-[#0a0a0a]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Hexagon className="h-5 w-5 sm:h-6 sm:w-6 text-[#0a0a0a]" fill="currentColor" />
            </div>
            <span className="text-xl sm:text-2xl font-bold">
              <span className="text-amber-500">ALPHA</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#manifesto" className="text-muted-foreground hover:text-amber-500 transition-colors hidden lg:block text-sm">
              Manifesto
            </a>
            <a href="#incentives" className="text-muted-foreground hover:text-amber-500 transition-colors hidden lg:block text-sm">
              Incentives
            </a>
            <a href="#security" className="text-muted-foreground hover:text-amber-500 transition-colors hidden lg:block text-sm">
              Security
            </a>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-amber-500">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0a0a0a] font-semibold text-sm">
                Enter ALPHA
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(45,100%,50%,0.08),transparent_50%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            {/* Badge */}
            <Badge className="mb-6 sm:mb-8 px-4 py-2 text-xs sm:text-sm bg-amber-500/10 text-amber-500 border-amber-500/30 backdrop-blur-sm" variant="outline">
              <Sparkles className="h-3 w-3 mr-2" />
              Web3 Financial Layer • Next Generation
            </Badge>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              <span className="text-white">Welcome to </span>
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">ALPHA</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              A next-generation Web3 financial ecosystem engineered for 
              <span className="text-amber-500 font-medium"> stability</span>,
              <span className="text-amber-500 font-medium"> transparency</span>, and
              <span className="text-amber-500 font-medium"> intelligent participation</span>.
            </p>

            <p className="text-base sm:text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto">
              Designed for those who move early, think long-term, and build systems—not hype.
            </p>

            {/* Primary CTA */}
            <Link to="/auth">
              <Button size="lg" className="gap-3 text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0a0a0a] font-bold shadow-2xl shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-105">
                <Zap className="h-5 w-5" />
                Enter the ALPHA Founding Phase
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Founding Alpha Countdown */}
          <div className="mt-16 sm:mt-20">
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 rounded-2xl border border-amber-500/20 p-6 sm:p-8 backdrop-blur-sm">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-500 font-semibold uppercase tracking-wider text-sm">
                    Founding Alpha Window
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Limited enrollment period • Early governance advantage • Historical positioning
                </p>
              </div>
              <CountdownTimer targetDate={foundingEndDate} />
            </div>
          </div>
        </div>
      </section>

      {/* The ALPHA Manifesto */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]" id="manifesto">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/30" variant="outline">
              THE ALPHA MANIFESTO
            </Badge>
          </div>
          
          <div className="relative">
            {/* Decorative line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent hidden md:block" />
            
            <div className="text-center space-y-8 md:space-y-12">
              <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground leading-relaxed">
                ALPHA exists to correct what traditional finance and early Web3 got wrong.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
                {[
                  { before: 'speculation', after: 'Security' },
                  { before: 'incentives', after: 'Infrastructure' },
                  { before: 'extraction', after: 'Ownership' },
                  { before: 'central control', after: 'Community' }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-card/50 backdrop-blur-sm border border-amber-500/10 rounded-xl p-4 sm:p-5 hover:border-amber-500/30 transition-all"
                  >
                    <span className="text-amber-500 font-bold text-lg">{item.after}</span>
                    <span className="text-muted-foreground mx-2">before</span>
                    <span className="text-muted-foreground/60 line-through">{item.before}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-8 border-t border-amber-500/10 max-w-xl mx-auto">
                <p className="text-lg sm:text-xl text-muted-foreground italic">
                  "This is not a product.<br />
                  <span className="text-amber-500 font-medium not-italic">
                    It is a financial layer designed to outlive trends.
                  </span>"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Alpha Incentives */}
      <section className="py-20 sm:py-28 px-4 bg-[#0f0f0f]" id="incentives">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/30" variant="outline">
              <Star className="h-3 w-3 mr-1" />
              FOUNDING ALPHA INCENTIVES
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Built for <span className="text-amber-500">Leaders</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Founding Alpha members receive lifetime on-chain royalties on all verified direct downline activity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-card/80 to-card/40 border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mx-auto mb-4 group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition-all">
                  <Layers className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-white">Protocol-Aligned</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Incentives that grow with the ecosystem, not against it. Your success is the protocol's success.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card/80 to-card/40 border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mx-auto mb-4 group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition-all">
                  <Award className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-white">Early Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Recognition for early belief and network leadership. Founding members carry permanent status.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card/80 to-card/40 border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mx-auto mb-4 group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition-all">
                  <Eye className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-white">Transparent Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  A transparent reward system enforced by smart-logic, not promises. See everything on-chain.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Commission Rates */}
          <div className="mt-12 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 rounded-2xl border border-amber-500/20 p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-[#0a0a0a]/50 rounded-xl border border-amber-500/10">
                <p className="text-4xl sm:text-5xl font-bold text-amber-500 mb-2">50%</p>
                <p className="text-muted-foreground">Referral Commission</p>
                <p className="text-xs text-muted-foreground/60 mt-1">On all membership activations</p>
              </div>
              <div className="text-center p-6 bg-[#0a0a0a]/50 rounded-xl border border-amber-500/10">
                <p className="text-4xl sm:text-5xl font-bold text-amber-500 mb-2">90/10</p>
                <p className="text-muted-foreground">Task Reward Split</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Workers keep 90% of all rewards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust by Design: Security */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]" id="security">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/30" variant="outline">
              <Shield className="h-3 w-3 mr-1" />
              TRUST BY DESIGN
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Security as a <span className="text-amber-500">First-Class Feature</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              ALPHA's infrastructure is designed around asset protection, data integrity, and system resilience.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Lock, title: 'Vault-Grade Custody', desc: 'Enterprise-level asset protection' },
              { icon: Fingerprint, title: 'Encrypted Auth', desc: 'Multi-layer authentication' },
              { icon: Eye, title: 'Transparent Tracking', desc: 'On-chain activity visibility' },
              { icon: Shield, title: 'No Dark Patterns', desc: 'Clean, honest mechanics' }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-card/30 backdrop-blur-sm border border-amber-500/10 rounded-xl p-6 text-center hover:border-amber-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-all">
                  <item.icon className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground italic">
              "Security is not a feature—<span className="text-amber-500 font-medium not-italic">it is the foundation.</span>"
            </p>
          </div>
        </div>
      </section>

      {/* High-End Onboarding Flow */}
      <section className="py-20 sm:py-28 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/30" variant="outline">
              THE ALPHA EXPERIENCE
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Your Journey to <span className="text-amber-500">ALPHA</span>
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: 'Secure On-Chain Registration',
                desc: 'A streamlined, compliant registration flow that respects privacy while maintaining protocol integrity.',
                features: ['User sovereignty', 'Secure identity binding', 'Long-term ecosystem access']
              },
              {
                step: 2,
                title: 'Trusted Access Layer',
                desc: 'Enter ALPHA through a secure access gateway with biometric-inspired security.',
                features: ['Encryption-first design', 'Vault-level protection', 'Confident transitions']
              },
              {
                step: 3,
                title: 'Guided Protocol Walkthrough',
                desc: 'A refined 5-step animated tour introducing ALPHA\'s core mechanics.',
                features: ['Deposit → Vault → Marketplace → Transfer → Feed']
              },
              {
                step: 4,
                title: 'Founding Alpha Recognition',
                desc: 'Completion triggers a prestige celebration moment with your permanent Founding Alpha Badge.',
                features: ['Digital asset celebration', 'Founding Alpha Badge', 'Permanent recognition']
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-6 sm:p-8 bg-gradient-to-r from-card/50 to-card/20 border border-amber-500/10 rounded-2xl hover:border-amber-500/30 transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-[#0a0a0a] font-bold text-xl">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-4">{item.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((feature, i) => (
                      <Badge key={i} variant="outline" className="border-amber-500/20 text-amber-500/80 text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="hidden lg:flex items-center">
                  <ChevronRight className="h-6 w-6 text-amber-500/40" />
                </div>
              </div>
            ))}
          </div>

          {/* Final State */}
          <div className="mt-12 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 rounded-2xl border border-amber-500/30 p-8 sm:p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/30">
              <CheckCircle className="h-10 w-10 text-[#0a0a0a]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">ALPHA Activated</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Land on your dashboard fully activated—secure, informed, and positioned to participate, build, and lead.
            </p>
            <p className="text-amber-500 font-medium mt-4">
              No confusion. No noise. Only signal.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
        
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-500 text-sm font-medium">The protocol is live</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            The Future is Being Written.
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10">
            The only question is: <span className="text-amber-500 font-semibold">Are you founding it?</span>
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="gap-3 text-lg px-10 py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0a0a0a] font-bold shadow-2xl shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-105">
              Enter ALPHA Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-500/70" /> Limited founding window
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500/70" /> Secure infrastructure
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-amber-500/70" /> Global access
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-[#050505] border-t border-amber-500/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Hexagon className="h-4 w-4 text-[#0a0a0a]" fill="currentColor" />
                </div>
                <span className="text-xl font-bold text-amber-500">ALPHA</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The financial layer for the next generation. Built for stability, transparency, and intelligent participation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Protocol</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/alpha/bank" className="hover:text-amber-500 transition-colors">ALPHA Vault</Link></li>
                <li><Link to="/alpha/market" className="hover:text-amber-500 transition-colors">Marketplace</Link></li>
                <li><Link to="/alpha/finance" className="hover:text-amber-500 transition-colors">Smart Finance</Link></li>
                <li><Link to="/alpha/growth" className="hover:text-amber-500 transition-colors">Network</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact</Link></li>
                <li><Link to="/about" className="hover:text-amber-500 transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
          </div>
          
          {/* Global Disclaimer */}
          <div className="pt-8 border-t border-amber-500/10 text-center text-xs text-muted-foreground/60 max-w-3xl mx-auto">
            <p>
              ₳ credits are internal system units and do not represent money, stored value, or investment. 
              No financial services are offered on this site. All membership fees are one-time activation payments 
              subject to verification. Credits cannot be redeemed for cash.
            </p>
          </div>
          
          <div className="pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ALPHA Protocol. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
