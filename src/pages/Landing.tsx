import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Star,
  Zap,
  Crown
} from 'lucide-react';

export default function Landing() {
  const membershipTiers = [
    {
      name: 'Basic',
      price: '₱1,000',
      icon: Star,
      color: 'bg-secondary',
      features: [
        '40% referral commission',
        'Access to community',
        'Basic support',
      ],
      notIncluded: [
        'Daily task earnings',
        'Online Army access',
        'Lending marketplace',
      ],
    },
    {
      name: 'Pro',
      price: '₱2,000',
      icon: Zap,
      color: 'bg-primary',
      popular: true,
      features: [
        '40% referral commission',
        'Daily task earnings',
        'Online Army training',
        'Priority support',
      ],
      notIncluded: [
        'Lending marketplace',
      ],
    },
    {
      name: 'Elite',
      price: '₱3,000',
      icon: Crown,
      color: 'bg-accent-foreground',
      features: [
        '40% referral commission',
        'Daily task earnings',
        'Online Army access',
        'Lending marketplace',
        'VIP support',
        'Exclusive campaigns',
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            Amabilia Network
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
            🇵🇭 Empowering Filipino Communities
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Earn Daily Through{' '}
            <span className="text-primary">Ethical Digital Work</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 10,000+ Filipinos earning sustainable income through our community-powered 
            ecosystem. Referrals, tasks, and lending marketplace all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-lg px-8">
                Start Earning Today <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">10K+</p>
              <p className="text-muted-foreground">Active Members</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">₱5M+</p>
              <p className="text-muted-foreground">Total Payouts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">40%</p>
              <p className="text-muted-foreground">Referral Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">24/7</p>
              <p className="text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to start your earning journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Choose Your Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Select from Basic, Pro, or Elite membership based on your goals and earning potential.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Complete Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pay via GCash or bank transfer. Upload your proof and get verified within 24 hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-border">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Start Earning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Refer friends, complete tasks, and access the lending marketplace to grow your income.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Earning Pillars */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Three Ways to Earn
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Multiple income streams for sustainable earnings
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border hover:border-primary transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Referral System</CardTitle>
                <CardDescription>40% Commission</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Earn 40% commission on every membership purchase from your referrals. 
                  Plus 8% royalty on their task earnings.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    ₱400 per Basic referral
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    ₱800 per Pro referral
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    ₱1,200 per Elite referral
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-primary transition-colors">
              <CardHeader>
                <Wallet className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Task Economy</CardTitle>
                <CardDescription>Daily Earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Complete daily tasks and earn rewards. Join the Online Army 
                  for higher-paying client campaigns.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Micro-engagement tasks
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Creative content tasks
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Sponsored campaigns
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-primary transition-colors">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Lending Marketplace</CardTitle>
                <CardDescription>Elite Members Only</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Borrow or lend money within the community. Set your own rates 
                  with auto-deduction protection.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Peer-to-peer lending
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Auto-repayment system
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
              Choose Your Membership
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One-time payment, lifetime access to your tier benefits
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {membershipTiers.map((tier) => (
              <Card 
                key={tier.name}
                className={`border-border relative ${tier.popular ? 'border-primary border-2 scale-105' : ''}`}
              >
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
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map((feature) => (
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
            Your security is our priority. All transactions are protected, 
            and Elite members go through KYC verification for a trusted community.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-semibold mb-2">KYC Verified</h3>
              <p className="text-sm text-muted-foreground">
                Elite members are verified for secure lending
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Encrypted Data</h3>
              <p className="text-sm text-muted-foreground">
                Your personal info is protected with encryption
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Transparent Fees</h3>
              <p className="text-sm text-muted-foreground">
                No hidden charges, clear commission structure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of Filipinos already earning through Amabilia Network. 
            Your financial freedom journey starts here.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">Amabilia Network</h3>
              <p className="text-sm text-muted-foreground">
                Empowering Filipinos through ethical digital work and community-powered earnings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary">Get Started</Link></li>
                <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
                <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
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
            © 2024 Amabilia Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
