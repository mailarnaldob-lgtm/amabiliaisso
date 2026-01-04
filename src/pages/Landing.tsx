import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wallet, TrendingUp, Shield, ArrowRight, CheckCircle, Star, Zap, Crown, AlertTriangle } from 'lucide-react';

export default function Landing() {
  const membershipTiers = [{
    name: 'Basic',
    price: '₱1,000',
    icon: Star,
    color: 'bg-secondary',
    features: ['Access to community platform', 'Referral access program', 'Basic support'],
    notIncluded: ['Activity-based credits', 'Online Army access', 'Credit marketplace']
  }, {
    name: 'Pro',
    price: '₱2,000',
    icon: Zap,
    color: 'bg-primary',
    popular: true,
    features: ['Referral access program', 'Activity-based credits', 'Online Army training', 'Priority support'],
    notIncluded: ['Credit marketplace']
  }, {
    name: 'Elite',
    price: '₱3,000',
    icon: Crown,
    color: 'bg-accent-foreground',
    features: ['Referral access program', 'Activity-based credits', 'Online Army access', 'Credit marketplace', 'VIP support', 'Exclusive campaigns'],
    notIncluded: []
  }];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-primary">₳LPHA</span>
            <span className="text-foreground ml-1">SMART FINANCE</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/alpha/bank">
              <Button>Launch App</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
            🇵🇭 Filipino-First Closed-Loop Ecosystem
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <span className="text-primary">₳LPHA</span> Smart Finance
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            A unified ecosystem for community participation, activity tracking, 
            and internal credit management.
          </p>
          <p className="text-lg text-muted-foreground/80 mb-8 max-w-xl mx-auto">
            Four integrated apps: <span className="text-primary font-medium">Bank</span> • <span className="text-emerald-500 font-medium">Market</span> • <span className="text-blue-500 font-medium">Finance</span> • <span className="text-purple-500 font-medium">Growth</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/alpha/bank">
              <Button size="lg" className="gap-2 text-lg px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Launch ₳LPHA App <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </a>
          </div>
          
          {/* 4 App Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <p className="font-bold text-foreground">Bank</p>
              <p className="text-xs text-muted-foreground">Wallet & Credits</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <p className="font-bold text-foreground">Market</p>
              <p className="text-xs text-muted-foreground">VPA Missions</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <p className="font-bold text-foreground">Finance</p>
              <p className="text-xs text-muted-foreground">P2P Lending</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <p className="font-bold text-foreground">Growth</p>
              <p className="text-xs text-muted-foreground">Royalties & Network</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card" id="how-it-works">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to join our closed-loop ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Choose Your Access Level</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Select from Basic, Pro, or Elite membership based on your desired participation level.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Complete Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Submit verification via approved channels. Admin review within 24 hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Start Participating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access the platform, complete activities, and receive system credits based on participation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Pillars */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Platform Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A structured system for community participation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border hover:border-primary transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Referral Network</CardTitle>
                <CardDescription>Community Building</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Grow the community by inviting new members. Receive system credits 
                  when your referrals complete their membership verification.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Admin-reviewed referrals
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Transparent credit tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Network visibility
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-primary transition-colors">
              <CardHeader>
                <Wallet className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Activity Center</CardTitle>
                <CardDescription>Task-Based Participation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Complete approved activities and tasks. Credits are awarded after admin review of submissions.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Admin-approved activities
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Proof-based submissions
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Progress tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-primary transition-colors">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Credit Marketplace</CardTitle>
                <CardDescription>Elite Members Only</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Participate in the internal credit exchange system. Fully admin-controlled with manual oversight.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    System-controlled transfers
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Admin oversight
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    KYC verified members
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 px-4 bg-card" id="pricing">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Access Level
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One-time registration fee for platform access
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {membershipTiers.map(tier => (
              <Card key={tier.name} className={`border-border relative ${tier.popular ? 'border-primary border-2 scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${tier.color} flex items-center justify-center mx-auto mb-4`}>
                    <tier.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground"> one-time</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map(feature => (
                      <li key={feature} className="flex items-center gap-2 opacity-50">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Secure & Transparent
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Your data is protected. All activities are reviewed and approved by administrators 
            to maintain system integrity.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Admin Oversight</h3>
              <p className="text-sm text-muted-foreground">
                All credit allocations are manually reviewed
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Encrypted Data</h3>
              <p className="text-sm text-muted-foreground">
                Your personal info is protected with encryption
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Closed-Loop System</h3>
              <p className="text-sm text-muted-foreground">
                Internal credits managed within the platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-12 px-4 bg-destructive/5 border-y border-destructive/20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-foreground mb-2">Important Disclaimer</h3>
              <p className="text-muted-foreground">
                ₳ Credits are internal system units used for tracking participation within the Amabilia Network platform. 
                They do <strong>not</strong> represent money, stored value, cryptocurrency, or investment of any kind. 
                Credits cannot be redeemed, converted, or exchanged for cash or any monetary equivalent. 
                No financial services are offered on this platform. All credit allocations are at the sole discretion 
                of platform administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience ₳LPHA?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Launch the unified ₳LPHA Smart Finance ecosystem. 
            Four apps, one seamless experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/alpha/bank">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                Launch ₳LPHA App <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 text-white border-white hover:bg-white/10">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">
                <span className="text-primary">₳LPHA</span> Smart Finance
              </h3>
              <p className="text-sm text-muted-foreground">
                A unified ecosystem for community participation and internal credit management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Apps</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/alpha/bank" className="hover:text-primary">₳ Bank</Link></li>
                <li><Link to="/alpha/market" className="hover:text-primary">₳ Market</Link></li>
                <li><Link to="/alpha/finance" className="hover:text-primary">₳ Finance</Link></li>
                <li><Link to="/alpha/growth" className="hover:text-primary">₳ Growth</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 ₳LPHA Smart Finance. All rights reserved. Part of the Amabilia Network.
          </div>
        </div>
      </footer>
    </div>
  );
}
