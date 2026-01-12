import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wallet, TrendingUp, Shield, ArrowRight, CheckCircle, Zap, Play, Clock, Lock, Globe, Database, Bell, Target, Repeat, Coins, Network, Eye, Fingerprint } from 'lucide-react';
export default function Landing() {
  return <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="text-xl sm:text-2xl font-bold">
            <span className="text-primary">₳MABILIA NETWORK    </span>
            <span className="text-foreground ml-1 hidden xs:inline">ECOSYSTEM</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors hidden lg:block text-sm">
              How It Works
            </a>
            <a href="#income-systems" className="text-muted-foreground hover:text-foreground transition-colors hidden lg:block text-sm">
              Earn
            </a>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Login</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-sm px-3 sm:px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 bg-gradient-to-br from-card via-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <Badge className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary/10 text-primary border-primary/20" variant="outline">
            The All-In-One Income Engine
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Turn Your Time & Capital Into{' '}
            <span className="text-primary">Automated ₳ Income</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed bg-secondary-foreground font-extrabold px-[9px] text-center md:text-2xl">"We pioneered a mission-driven economic framework that synchronized immediate liquidity with robust compounding protocols, delivering an optimized infrastructure for global financial sovereignty and sustainable wealth expansion."</p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/90 shadow-lg w-full sm:w-auto">
                <Play className="h-4 sm:h-5 w-4 sm:w-5" />
                Activate Your ₳ Account
              </Button>
            </Link>
            <a href="#video-section">
              <Button size="lg" variant="outline" className="gap-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-border hover:bg-card w-full sm:w-auto">
                <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
                View How It Works
              </Button>
            </a>
          </div>

          {/* Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-4">
            Earn Daily. Grow Weekly. Scale as a Network.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 sm:py-16 px-4 bg-card" id="video-section">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              60-Second Overview
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              See how the ecosystem works
            </p>
          </div>
          
          {/* Video Placeholder */}
          <div className="aspect-video bg-background rounded-xl border border-border flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="text-center z-10 px-4">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 hover:bg-primary/30 transition-colors cursor-pointer">
                <Play className="h-8 sm:h-10 w-8 sm:w-10 text-primary ml-1" />
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">Video Coming Soon</p>
              <p className="text-xs sm:text-sm text-muted-foreground/60 mt-2">Admin-editable video placeholder</p>
            </div>
            
            {/* Video Talking Points */}
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-wrap gap-1 sm:gap-2 justify-center">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                <Coins className="h-3 w-3 mr-1" /> Earn ₳ daily
              </Badge>
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                <TrendingUp className="h-3 w-3 mr-1" /> 3% weekly
              </Badge>
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs hidden sm:inline-flex">
                <Wallet className="h-3 w-3 mr-1" /> One wallet
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 px-4 bg-primary/5 border-y border-border">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span>Centralized Ledger, Distributed Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>ACID-Compliant Records</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>Real-Time Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Built for Scale</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Core Income Systems */}
      <section className="py-20 px-4" id="income-systems">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
              🔥 THE TWO CORE INCOME SYSTEMS
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Multiple Ways to Grow Your ₳
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* VPA Card */}
            <Card className="border-border hover:border-primary/50 transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-1">DAILY EARNINGS</Badge>
                    <CardTitle className="text-xl">Virtual Private Army (VPA)</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Earn ₳ Daily by Taking Missions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  A live task marketplace where brands and creators pay ₳ for real human engagement.
                </p>
                
                <div>
                  <p className="font-medium text-foreground mb-3">Typical Mission Examples:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Watch a YouTube video
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Follow / like / interact
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Simple digital engagement tasks
                    </li>
                  </ul>
                </div>

                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="font-medium text-foreground mb-2">How You Earn:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <Badge variant="outline">1. Log in</Badge>
                    <ArrowRight className="h-3 w-3" />
                    <Badge variant="outline">2. Accept mission</Badge>
                    <ArrowRight className="h-3 w-3" />
                    <Badge variant="outline">3. Complete</Badge>
                    <ArrowRight className="h-3 w-3" />
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">4. Get paid ₳</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Escrow-based payouts (no fake tasks)
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fingerprint className="h-4 w-4 text-primary" />
                    Anti-bot & behavior validation
                  </div>
                </div>

                <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    💰 Daily ₳ earnings with zero capital required
                  </p>
                </div>

                <Link to="/alpha/market">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    Start Taking Missions Now <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Smart Finance Card */}
            <Card className="border-border hover:border-primary/50 transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-1">WEEKLY COMPOUNDING</Badge>
                    <CardTitle className="text-xl">₳LPHA Smart Micro Finance</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Enjoy 3% Weekly Interest via P2P Lending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  A smart-escrow P2P lending system that cycles ₳ capital every 7 days.
                </p>
                
                <div>
                  <p className="font-medium text-foreground mb-3">How the 7-Day Cycle Works:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-500 font-bold">1</div>
                      Fund your wallet with ₳
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-500 font-bold">2</div>
                      Commit ₳ to Smart Finance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-500 font-bold">3</div>
                      Funds lock in escrow for 168 hours
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-500 font-bold">4</div>
                      Earn +3% weekly interest
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-500 font-bold">5</div>
                      Automatic return to your wallet
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Example Return</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₳5,000 → <span className="text-blue-500">₳5,150</span> in 7 days
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-4 w-4 text-primary" />
                    Smart escrow contracts
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    System Reserve Fund insurance
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Repeat className="h-4 w-4 text-primary" />
                    Automated settlement
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <p className="text-primary font-medium text-sm">
                    ✔ Eligibility: Minimum 3 active direct referrals
                  </p>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    📈 Predictable weekly compounding income
                  </p>
                </div>

                <Link to="/alpha/finance">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    Activate Smart Finance <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Four Engines Section */}
      <section className="py-20 px-4 bg-card" id="how-it-works">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
              ⚙️ ONE ECOSYSTEM. FOUR POWERFUL ENGINES.
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Unified ₳ Infrastructure
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border hover:border-primary/50 transition-all">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  🔐 ₳LPHA E-WALLET
                </CardTitle>
                <CardDescription>Financial Core</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Central ₳ balance</p>
                <p>• Instant inflow/outflow ledger</p>
                <p>• PHP ↔ ₳ conversion with admin verification</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-all">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  🧠 VPA
                </CardTitle>
                <CardDescription>Daily Earnings</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Mission marketplace</p>
                <p>• Real-time army activity feed</p>
                <p>• Escrow-protected rewards</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-all">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  💼 SMART FINANCE
                </CardTitle>
                <CardDescription>Wealth Cycle</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 7-day lending loops</p>
                <p>• Automated interest settlement</p>
                <p>• Reserve-backed protection</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-all">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                  <Network className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  🌐 ₳LPHA ROYALTY
                </CardTitle>
                <CardDescription>Network Growth</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 50% activation bonuses</p>
                <p>• 10% mission royalties</p>
                <p>• Automated debt recovery via royalties</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Money Flow Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
              📊 HOW MONEY FLOWS
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Simple Visual Story
            </h2>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">₳ IN → E-WALLET →</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Daily missions (VPA)</li>
                  <li>Weekly lending (Smart Finance)</li>
                  <li>Network bonuses (Royalty)</li>
                </ul>
              </div>
              
              <div className="text-center flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-10 w-10 text-primary" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 text-blue-500 rotate-180" />
                </div>
                <h3 className="font-bold text-foreground mb-2">₳ OUT →</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Withdraw</li>
                  <li>Reinvest</li>
                  <li>Compound</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                All transactions recorded in a <span className="text-primary font-medium">single immutable ledger</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🛡️ Security, Transparency & Scale
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Enterprise-grade infrastructure designed to survive audits & high load
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border border-border">
              <Database className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">PostgreSQL RLS</h3>
              <p className="text-xs text-muted-foreground">Row-Level Security</p>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <Fingerprint className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Device Fingerprinting</h3>
              <p className="text-xs text-muted-foreground">Behavior Analysis</p>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Proof-of-Work</h3>
              <p className="text-xs text-muted-foreground">Verification System</p>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <Bell className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">WebSocket Live</h3>
              <p className="text-xs text-muted-foreground">Reward Notifications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
              👑 WHO THIS IS FOR
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Is This Right For You?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
              <p className="text-foreground">Beginners who want daily online income</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
              <p className="text-foreground">Investors seeking weekly compounding returns</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
              <p className="text-foreground">Network builders looking for passive royalties</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
              <p className="text-foreground">Creators & brands needing real engagement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
              🚀 GET STARTED IN 3 STEPS
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Simple Onboarding Process
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-background rounded-xl border border-border">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-foreground mb-2">Create Your ₳ Account</h3>
              <p className="text-sm text-muted-foreground">Sign up and verify your identity</p>
            </div>
            <div className="text-center p-6 bg-background rounded-xl border border-border">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-foreground mb-2">Fund or Start Free</h3>
              <p className="text-sm text-muted-foreground">Fund your wallet or start free missions</p>
            </div>
            <div className="text-center p-6 bg-background rounded-xl border border-border">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-foreground mb-2">Earn & Scale</h3>
              <p className="text-sm text-muted-foreground">Earn daily, grow weekly, scale infinitely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-card relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            The ₳ Ecosystem Is Already Running.
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            The Only Question Is: <span className="text-primary font-semibold">Are You In?</span>
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="gap-2 text-lg px-10 py-6 bg-primary hover:bg-primary/90 shadow-xl">
              Create Your ₳ Account Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lock className="h-4 w-4" /> Limited access
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" /> Anti-abuse controls enabled
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> System monitored 24/7
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="text-xl font-bold mb-4 block">
                <span className="text-primary">₳LPHA</span>
                <span className="text-foreground ml-1">ECOSYSTEM</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The All-In-One Income Engine for the modern digital economy.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">Apps</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/alpha/bank" className="hover:text-foreground transition-colors">₳LPHA Bank</Link></li>
                <li><Link to="/alpha/market" className="hover:text-foreground transition-colors">VPA Market</Link></li>
                <li><Link to="/alpha/finance" className="hover:text-foreground transition-colors">Smart Finance</Link></li>
                <li><Link to="/alpha/growth" className="hover:text-foreground transition-colors">₳LPHA Royalty</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ₳LPHA Ecosystem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
}