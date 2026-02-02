import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, History, Users, Settings, Shield, 
  FileText, HelpCircle, LogOut, ChevronRight, Crown,
  Copy, Share2, Bell, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

/**
 * Sovereign Sidebar - V8.4
 * Burger menu with all secondary data migrated here:
 * - Partner Invite
 * - Account Security
 * - System Logs
 * - Profile
 */

interface SovereignSidebarProps {
  className?: string;
}

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  description: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Command Center', path: '/dashboard', description: 'Your primary dashboard' },
  { icon: History, label: 'Account History', path: '/dashboard/transactions', description: 'View all transactions' },
  { icon: Users, label: 'Partner Network', path: '/dashboard/referrals', description: 'Manage your referrals' },
  { icon: Crown, label: 'Ad Wizard', path: '/dashboard/ads', description: 'Create ad campaigns', badge: 'PRO+' },
  { icon: Settings, label: 'Profile Settings', path: '/dashboard/settings', description: 'Update your profile' },
  { icon: Shield, label: 'Security Center', path: '/dashboard/settings#security', description: 'Account security' },
  { icon: Bell, label: 'Notifications', path: '/dashboard/transactions', description: 'Activity alerts' },
  { icon: FileText, label: 'System Logs', path: '/dashboard/transactions', description: 'Audit trail' },
  { icon: HelpCircle, label: 'Support', path: '/contact', description: 'Get help' },
];

export function SovereignSidebar({ className }: SovereignSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: 'Copied!',
        description: 'Partner code copied to clipboard'
      });
    }
  };

  const getTierBadge = (tier: string | null | undefined) => {
    switch (tier) {
      case 'elite': return { label: 'Elite', color: 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30' };
      case 'expert': return { label: 'Expert', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'pro': return { label: 'Pro', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      default: return { label: 'Inactive', color: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const tierBadge = getTierBadge(profile?.membership_tier);

  return (
    <>
      {/* Trigger Button - Frosted Glass */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-border",
          "hover:bg-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all",
          "haptic-press",
          className
        )}
      >
        <Menu className="h-5 w-5 text-foreground" />
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw]",
              "bg-card border-r border-[#FFD700]/20",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-[#FFD700]/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-lg shadow-[#FFD700]/20">
                  <Crown className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">Amabilia</h2>
                  <p className="text-xs text-muted-foreground">Sovereign Menu</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="haptic-press hover:bg-[#FFD700]/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/20 flex items-center justify-center">
                  <span className="text-[#FFD700] font-bold text-lg">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {profile?.full_name || 'Member'}
                  </p>
                  <Badge variant="outline" className={cn('text-[10px] mt-1', tierBadge.color)}>
                    {tierBadge.label} Member
                  </Badge>
                </div>
              </div>

              {/* Partner Invite Section */}
              {profile?.referral_code && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Partner Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono font-bold text-[#FFD700] text-sm tracking-wider">
                      {profile.referral_code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyReferralCode}
                      className="h-8 w-8 hover:bg-[#FFD700]/10"
                    >
                      <Copy className="h-4 w-4 text-[#FFD700]" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-xs border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                    disabled
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share Invite Link
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-150",
                      "group haptic-press",
                      isActive 
                        ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20" 
                        : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isActive ? "bg-[#FFD700]/20" : "bg-muted/30 group-hover:bg-muted/50"
                    )}>
                      <item.icon className={cn(
                        "h-4 w-4",
                        isActive ? "text-[#FFD700]" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{item.label}</p>
                        {item.badge && (
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 border-[#FFD700]/30 text-[#FFD700]">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      "group-hover:translate-x-0.5"
                    )} />
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20">
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-3 font-mono tracking-wider">
                AMABILIA NETWORK • 2026
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
