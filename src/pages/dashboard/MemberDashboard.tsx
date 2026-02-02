import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useWallets } from '@/hooks/useWallets';
import { useReferralStats } from '@/hooks/useReferrals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  RefreshCw, AlertTriangle, Crown, Zap, Star, 
  CreditCard, Bell, Copy, CheckCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// New Sovereign Components
import { SovereignSidebar } from '@/components/dashboard/SovereignSidebar';
import { QuickActionHub } from '@/components/dashboard/QuickActionHub';
import { SovereignBalanceCard } from '@/components/dashboard/SovereignBalanceCard';
import { ActiveAssignmentsCard } from '@/components/dashboard/ActiveAssignmentsCard';
import { WalletBreakdown } from '@/components/dashboard/WalletBreakdown';

export default function MemberDashboard() {
  const { signOut } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { wallets, isFallback, isLoading: walletsLoading, refetch: refetchWallets, totalBalance } = useWallets();
  const { totalReferrals, totalEarnings } = useReferralStats();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const taskWallet = wallets.find(w => w.wallet_type === 'task');
  const royaltyWallet = wallets.find(w => w.wallet_type === 'royalty');
  const mainWallet = wallets.find(w => w.wallet_type === 'main');

  const canAccessElite = profile?.membership_tier === 'elite';

  useEffect(() => {
    if (!isFallback && wallets.length > 0) {
      setIsSyncing(true);
      const timer = setTimeout(() => setIsSyncing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [wallets, isFallback]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsSyncing(true);
    await Promise.all([refetchProfile(), refetchWallets()]);
    setIsRefreshing(false);
    setTimeout(() => setIsSyncing(false), 1000);
    toast({ title: 'Refreshed', description: 'Dashboard data has been synchronized' });
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTierConfig = (tier: string | null) => {
    switch (tier) {
      case 'elite': return { icon: Crown, label: 'Elite Member', color: 'from-[#FFD700] to-[#FFA500]' };
      case 'pro': return { icon: Zap, label: 'Pro Member', color: 'from-primary to-primary/80' };
      case 'basic': return { icon: Star, label: 'Basic Member', color: 'from-secondary to-secondary/80' };
      default: return { icon: Star, label: 'Inactive', color: 'from-muted to-muted' };
    }
  };

  const tierConfig = getTierConfig(profile?.membership_tier || null);
  const TierIcon = tierConfig.icon;

  if (profileLoading || walletsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="bg-atmosphere" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent"
        />
        <p className="text-muted-foreground text-center font-mono text-sm">Initializing Sovereign Ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header - Minimalist Sovereign Style */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-16 max-w-6xl mx-auto">
          {/* Left: Sidebar Menu */}
          <SovereignSidebar />

          {/* Center: Branding */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
              <span className="text-black font-bold text-lg">₳</span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight hidden sm:inline">
              Amabilia
            </span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative haptic-press"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFD700]" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="haptic-press"
            >
              <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Fallback Notice */}
        {isFallback && (
          <Alert className="border-[#FFD700]/50 bg-[#FFD700]/5">
            <AlertTriangle className="h-4 w-4 text-[#FFD700]" />
            <AlertTitle className="text-[#FFD700] text-sm">Limited Mode</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Some services are temporarily unavailable. Core functionality remains active.
            </AlertDescription>
          </Alert>
        )}

        {/* Activation CTA for Inactive Users */}
        {!profile?.membership_tier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border border-[#FFD700]/50 bg-gradient-to-r from-[#FFD700]/10 to-transparent"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-7 w-7 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground mb-1">Account Activation Required</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Unlock 50% referral commissions, global assignments, and P2P lending with a one-time activation.
                </p>
              </div>
              <Link to="/dashboard/upgrade" className="w-full sm:w-auto">
                <Button className="w-full gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold hover:opacity-90 haptic-press">
                  <CreditCard className="h-5 w-5" />
                  Activate Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
              tierConfig.color
            )}>
              <TierIcon className="h-7 w-7 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Welcome, {profile?.full_name?.split(' ')[0] || 'Member'}
              </h1>
              <Badge variant="outline" className="mt-1 border-[#FFD700]/30 text-[#FFD700]">
                {tierConfig.label}
              </Badge>
            </div>
          </div>

          {/* Referral Code */}
          {profile?.referral_code && (
            <button
              onClick={copyReferralCode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors haptic-press"
            >
              <span className="text-xs text-muted-foreground">Partner Code:</span>
              <span className="font-mono font-bold text-primary">{profile.referral_code}</span>
              {copied ? (
                <CheckCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* PRIMARY: Sovereign Balance Card */}
        <SovereignBalanceCard 
          totalBalance={totalBalance} 
          isSyncing={isSyncing}
          vaultYield={canAccessElite ? 0.01 : 0}
        />

        {/* GRID: Active Assignments + Wallet Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveAssignmentsCard />
          <WalletBreakdown
            mainBalance={mainWallet?.balance || 0}
            taskBalance={taskWallet?.balance || 0}
            royaltyBalance={royaltyWallet?.balance || 0}
            canAccessElite={canAccessElite}
          />
        </div>

        {/* Partner Network Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-xl bg-card border border-border"
        >
          <Link to="/dashboard/referrals" className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Crown className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  Partner Network
                </h3>
                <p className="text-sm text-muted-foreground">
                  {totalReferrals} partners • ₳{totalEarnings.toLocaleString()} earned
                </p>
              </div>
            </div>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              50% Commission
            </Badge>
          </Link>
        </motion.div>

        {/* Upgrade CTA */}
        {profile?.membership_tier && profile.membership_tier !== 'elite' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-xl border border-primary/30 bg-primary/5"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Unlock Elite Privileges</h3>
                <p className="text-sm text-muted-foreground">
                  Access P2P lending, 1% daily vault yield, and priority support
                </p>
              </div>
              <Link to="/dashboard/upgrade">
                <Button className="gap-2 haptic-press">
                  <Crown className="h-5 w-5" />
                  Upgrade to Elite
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      {/* Quick Action FAB */}
      <QuickActionHub />
    </div>
  );
}
