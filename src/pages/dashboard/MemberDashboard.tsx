import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useWallets } from '@/hooks/useWallets';
import { useReferralStats } from '@/hooks/useReferrals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  Copy, 
  LogOut,
  User,
  Settings,
  CreditCard,
  Crown,
  Zap,
  Star,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MemberDashboard() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const { totalReferrals, totalEarnings, pendingEarnings } = useReferralStats();
  const { toast } = useToast();

  const taskWallet = wallets?.find(w => w.wallet_type === 'task');
  const royaltyWallet = wallets?.find(w => w.wallet_type === 'royalty');
  const mainWallet = wallets?.find(w => w.wallet_type === 'main');

  const totalBalance = (taskWallet?.balance || 0) + (royaltyWallet?.balance || 0) + (mainWallet?.balance || 0);

  const referralLink = `${window.location.origin}/auth?ref=${profile?.referral_code || ''}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case 'elite': return Crown;
      case 'pro': return Zap;
      default: return Star;
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'elite': return 'bg-accent-foreground';
      case 'pro': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const TierIcon = getTierIcon(profile?.membership_tier || null);

  if (profileLoading || walletsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-primary">
            Amabilia Network
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full ${getTierColor(profile?.membership_tier || null)} flex items-center justify-center`}>
              <TierIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome, {profile?.full_name || 'Member'}!
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {profile?.membership_tier || 'basic'} Member
                </Badge>
                {!profile?.membership_tier || profile?.membership_tier === 'basic' ? (
                  <Badge variant="secondary" className="text-xs">
                    Upgrade to unlock more features
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Total Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm mb-1">Total Balance</p>
                <p className="text-4xl font-bold">₱{totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              </div>
              <Button variant="secondary" className="gap-2">
                Withdraw <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Task Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₱{(taskWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">From completed tasks</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Royalty Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₱{(royaltyWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">8% from downline tasks</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Main Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₱{(mainWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Available for withdrawal</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Section */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Your Referral Program
            </CardTitle>
            <CardDescription>
              Earn 40% commission on every membership purchase from your referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">{totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  ₱{totalEarnings.toLocaleString('en-PH')}
                </p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  ₱{pendingEarnings.toLocaleString('en-PH')}
                </p>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Your Referral Code</label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 px-4 py-2 bg-muted rounded-lg font-mono text-lg">
                    {profile?.referral_code || 'Loading...'}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyReferralLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Your Referral Link</label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 px-4 py-2 bg-muted rounded-lg text-sm truncate">
                    {referralLink}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyReferralLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA (if not Elite) */}
        {profile?.membership_tier !== 'elite' && (
          <Card className="border-primary border-2 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Upgrade Your Membership
                  </h3>
                  <p className="text-muted-foreground">
                    Unlock more earning opportunities with Pro or Elite membership
                  </p>
                </div>
                <Link to="/dashboard/upgrade">
                  <Button size="lg" className="gap-2">
                    <Crown className="h-5 w-5" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <Link to="/dashboard/referrals">
            <Card className="border-border hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">My Referrals</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/transactions">
            <Card className="border-border hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Transactions</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/profile">
            <Card className="border-border hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <User className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">My Profile</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/upgrade">
            <Card className="border-border hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Upgrade</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
