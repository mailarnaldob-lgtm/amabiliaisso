import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useWallets } from '@/hooks/useWallets';
import { useReferralStats } from '@/hooks/useReferrals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AccountSecurityCard } from '@/components/dashboard/AccountSecurityCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { Wallet, Users, TrendingUp, Copy, LogOut, User, CreditCard, Crown, Zap, Star, AlertTriangle, RefreshCw, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
export default function MemberDashboard() {
  const {
    user,
    signOut
  } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
    isFetching: profileFetching
  } = useProfile();
  const {
    wallets,
    isFallback,
    isLoading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets,
    isFetching: walletsFetching,
    totalBalance,
    getBalance
  } = useWallets();
  const {
    totalReferrals,
    totalEarnings,
    pendingEarnings
  } = useReferralStats();
  const {
    toast
  } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const taskWallet = wallets.find(w => w.wallet_type === 'task');
  const royaltyWallet = wallets.find(w => w.wallet_type === 'royalty');
  const mainWallet = wallets.find(w => w.wallet_type === 'main');
  const totalCredits = totalBalance;

  // Check if we're using fallback data
  const isUsingFallback = isFallback;
  const referralLink = `${window.location.origin}/auth?ref=${profile?.referral_code || ''}`;
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchProfile(), refetchWallets()]);
    setIsRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Dashboard data has been refreshed'
    });
  };
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard'
    });
  };
  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case 'elite':
        return Crown;
      case 'pro':
        return Zap;
      default:
        return Star;
    }
  };
  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'elite':
        return 'bg-accent-foreground';
      case 'pro':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };
  const TierIcon = getTierIcon(profile?.membership_tier || null);

  // Loading state
  if (profileLoading || walletsLoading) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-muted-foreground text-center">Loading your dashboard...</p>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-lg sm:text-xl font-bold text-primary">
            Amabilia Network
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} title="Refresh Data">
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {
            const securitySection = document.getElementById('account-security');
            if (securitySection) {
              securitySection.scrollIntoView({
                behavior: 'smooth'
              });
            }
          }} title="Account Security">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="sm:hidden border-t border-border bg-card px-4 py-3 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {
          setMobileMenuOpen(false);
          const securitySection = document.getElementById('account-security');
          if (securitySection) {
            securitySection.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }}>
              <User className="h-4 w-4" />
              Account Security
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>}
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Backend Notice (when using fallback) */}
        {isUsingFallback && <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-600 dark:text-amber-400 text-sm">Limited Mode</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Some backend services are temporarily unavailable. Your data will sync when the connection is restored.
            </AlertDescription>
          </Alert>}

        {/* Activation Prompt for Inactive Accounts */}
        {!profile?.membership_tier && <Card className="mb-6 border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                    Your Account is Inactive
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Activate your account with a one-time ₱300 payment to unlock all platform features including referral commissions, VPA missions, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" /> 50% referral commission
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" /> Access to VPA missions
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-amber-500" /> Community platform
                    </span>
                  </div>
                </div>
                <Link to="/dashboard/upgrade" className="flex-shrink-0">
                  <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                    <CreditCard className="h-5 w-5" />
                    Activate for ₱300
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>}

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full ${getTierColor(profile?.membership_tier || null)} flex items-center justify-center flex-shrink-0`}>
              <TierIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-4xl">
                Welcome, {profile?.full_name || 'Member'}!
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className={`capitalize ${!profile?.membership_tier ? 'border-amber-500 text-amber-600' : ''}`}>
                  {profile?.membership_tier ? `${profile.membership_tier} Member` : 'Inactive Account'}
                </Badge>
                {!profile?.membership_tier && <Badge variant="secondary" className="text-xs hidden sm:inline-flex bg-amber-500/10 text-amber-600">
                    Pay ₱300 to activate
                  </Badge>}
                {profile?.membership_tier === 'basic' && <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                    Upgrade to unlock more features
                  </Badge>}
                {profile?.membership_tier && profile?.membership_tier !== 'elite' && profile?.membership_tier !== 'basic' && <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                    Upgrade to unlock more features
                  </Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Total Credits Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-primary-foreground/80 text-sm mb-1">Total System Credits</p>
                <p className="text-3xl py-[19px] px-0 my-[13px] font-extrabold sm:text-7xl text-center">₳{totalCredits.toLocaleString('en-PH', {
                  minimumFractionDigits: 2
                })}</p>
              </div>
              <div className="text-left sm:text-right">
                
                
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Notice */}
        <Alert className="mb-6 border-muted bg-muted/30">
          
          <AlertDescription className="text-xs">
            ₳ Credits are internal system units for tracking participation. They are not redeemable for cash or monetary value.
          </AlertDescription>
        </Alert>

        {/* Credit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2 p-4">
              <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                <Wallet className="h-4 w-4" /> Activity Credits
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl sm:text-2xl font-bold">
                ₳{(taskWallet?.balance || 0).toLocaleString('en-PH', {
                minimumFractionDigits: 2
              })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">From approved activities</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2 p-4">
              <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                <TrendingUp className="h-4 w-4" /> Referral Credits
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl sm:text-2xl font-bold">
                ₳{(royaltyWallet?.balance || 0).toLocaleString('en-PH', {
                minimumFractionDigits: 2
              })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Network participation credits</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2 p-4">
              <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                <CreditCard className="h-4 w-4" /> Main Credits
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl sm:text-2xl font-bold">
                ₳{(mainWallet?.balance || 0).toLocaleString('en-PH', {
                minimumFractionDigits: 2
              })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Primary allocation</p>
            </CardContent>
          </Card>
        </div>
        {/* Referral Quick Stats - Compact version, full details in My Network page */}
        <Link to="/dashboard/referrals">
          <Card className="mb-8 border-border hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">My Network</p>
                    <p className="text-xs text-muted-foreground">
                      {totalReferrals} referrals • ₳{totalEarnings.toLocaleString('en-PH')} earned
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <span className="text-xs hidden sm:inline">View Network</span>
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Account Security & Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8" id="account-security">
          <AccountSecurityCard />
          <NotificationsCard />
        </div>

        {/* Upgrade CTA (if not Elite) */}
        {profile?.membership_tier !== 'elite' && <Card className="mb-6 sm:mb-8 border-primary border-2 bg-primary/5">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                    Upgrade Your Access Level
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock more participation opportunities
                  </p>
                </div>
                <Link to="/dashboard/upgrade">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <Crown className="h-5 w-5" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Link to="/dashboard/referrals">
            <Card className="border-border hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="p-4 sm:pt-6 text-center">
                <Users className="h-6 sm:h-8 w-6 sm:w-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm sm:text-base">My Network</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/transactions">
            <Card className="border-border hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="p-4 sm:pt-6 text-center">
                <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm sm:text-base">Activity</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/profile">
            <Card className="border-border hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="p-4 sm:pt-6 text-center">
                <User className="h-6 sm:h-8 w-6 sm:w-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm sm:text-base">Profile</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/bank">
            <Card className="border-border hover:border-primary transition-colors cursor-pointer h-full bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4 sm:pt-6 text-center">
                <Zap className="h-6 sm:h-8 w-6 sm:w-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm sm:text-base">₳LPHA</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>;
}