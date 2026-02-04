import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, History, Users, Settings, Shield, 
  FileText, HelpCircle, LogOut, ChevronRight, Crown,
  Copy, Share2, Bell, Lock, Moon, Globe, CreditCard,
  Smartphone, ChevronDown, Target, Landmark, TrendingUp, MapPin,
  Columns, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

/**
 * Sovereign Sidebar - V9.0
 * Enhanced burger menu with section headers + active-route indicator
 * Premium transitions & presentation
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

interface NavSection {
  title: string;
  items: SidebarItem[];
}

// Organized navigation sections
const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { icon: Home, label: 'Command Center', path: '/dashboard', description: 'Your primary dashboard' },
      { icon: History, label: 'Account History', path: '/dashboard/transactions', description: 'View all transactions' },
    ]
  },
  {
    title: 'Apps',
    items: [
      { icon: TrendingUp, label: 'Sovereign Bank', path: '/dashboard/bank', description: 'Wallet & Exchanger' },
      { icon: Columns, label: 'Command Center', path: '/dashboard/command', description: 'Missions + Ads Hub', badge: 'NEW' },
      { icon: Zap, label: 'Global Assignments', path: '/dashboard/market', description: 'VPA Missions' },
      { icon: Landmark, label: 'Alpha Bankers', path: '/dashboard/finance', description: 'P2P Lending' },
      { icon: Users, label: 'Royalty Network', path: '/dashboard/growth', description: 'Team & Referrals' },
      { icon: Crown, label: 'Ad Wizard', path: '/dashboard/ads', description: 'Create ad campaigns', badge: 'PRO+' },
    ]
  },
  {
    title: 'Account',
    items: [
      { icon: Users, label: 'Partner Network', path: '/dashboard/referrals', description: 'Manage your referrals' },
    ]
  }
];

// All paths for route detection
const allNavPaths = navSections.flatMap(s => s.items.map(i => ({ path: i.path, label: i.label })));

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export function SovereignSidebar({ className }: SovereignSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { secureSignOut, isLoggingOut } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();

  // Refs for scroll-to-active behavior
  const navContainerRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);

  // Scroll to active item when sidebar opens
  const scrollToActiveItem = useCallback(() => {
    if (activeItemRef.current && navContainerRef.current) {
      // Small delay to ensure the sidebar animation has started
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 350); // After sidebar slide-in animation
    }
  }, []);

  // Trigger scroll when sidebar opens
  useEffect(() => {
    if (isOpen) {
      scrollToActiveItem();
    }
  }, [isOpen, scrollToActiveItem]);

  // Settings states
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [referralAlerts, setReferralAlerts] = useState(true);

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

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  // Determine active route label for "You are here" indicator
  const activeRouteLabel = useMemo(() => {
    const currentPath = location.pathname;
    const found = allNavPaths.find(n => n.path === currentPath);
    if (found) return found.label;
    // Check for partial matches (sub-routes)
    const partial = allNavPaths.find(n => currentPath.startsWith(n.path) && n.path !== '/dashboard');
    return partial?.label || 'Dashboard';
  }, [location.pathname]);

  return (
    <>
      {/* Trigger Button - Frosted Glass with hover animation */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-border",
            "hover:bg-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all duration-300",
            "haptic-press shadow-lg shadow-black/20",
            className
          )}
        >
          <Menu className="h-5 w-5 text-foreground" />
        </Button>
      </motion.div>

      {/* Overlay with blur effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel with enhanced transitions */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.8 }}
            transition={{ 
              type: 'spring', 
              damping: 28, 
              stiffness: 350,
              mass: 0.8
            }}
            className={cn(
              "fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw]",
              "bg-gradient-to-b from-card via-card to-card/95",
              "border-r border-[#FFD700]/20",
              "flex flex-col overflow-hidden",
              "shadow-2xl shadow-black/40"
            )}
          >
            {/* Header with gradient */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-[#FFD700]/10 via-[#FFD700]/5 to-transparent"
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-lg shadow-[#FFD700]/30"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Crown className="h-6 w-6 text-black" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">Amabilia</h2>
                  <p className="text-xs text-muted-foreground font-medium">Sovereign Menu</p>
                </div>
              </div>
              <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="haptic-press hover:bg-[#FFD700]/10 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>

            {/* User Profile Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-4 border-b border-border/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/20 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-[#FFD700] font-bold text-lg">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </span>
                </motion.div>
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
                <motion.div 
                  className="p-3 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm"
                  whileHover={{ borderColor: 'rgba(255, 215, 0, 0.3)' }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Partner Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono font-bold text-[#FFD700] text-sm tracking-wider">
                      {profile.referral_code}
                    </code>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyReferralCode}
                        className="h-8 w-8 hover:bg-[#FFD700]/10 rounded-lg"
                      >
                        <Copy className="h-4 w-4 text-[#FFD700]" />
                      </Button>
                    </motion.div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-xs border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 rounded-lg"
                    disabled
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share Invite Link
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Active Route Indicator - "You are here" */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-4 mb-3 p-2.5 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#FFD700]" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">You are here</span>
              </div>
              <p className="text-sm font-semibold text-[#FFD700] mt-0.5 truncate">{activeRouteLabel}</p>
            </motion.div>

            {/* Navigation Items with stagger animation */}
            <nav ref={navContainerRef} className="flex-1 overflow-y-auto px-3 pb-3 space-y-4 scroll-smooth">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {navSections.map((section) => (
                  <motion.div key={section.title} variants={itemVariants} className="space-y-1">
                    {/* Section Header */}
                    <div className="flex items-center gap-2 px-2 py-1">
                      <div className="h-px flex-1 bg-gradient-to-r from-[#FFD700]/30 to-transparent" />
                      <span className="text-[9px] uppercase tracking-widest text-[#FFD700]/70 font-bold">
                        {section.title}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-[#FFD700]/30 to-transparent" />
                    </div>

                    {/* Section Items */}
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path + item.label}
                          ref={isActive ? activeItemRef : undefined}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                            "group haptic-press relative",
                            isActive 
                              ? "bg-gradient-to-r from-[#FFD700]/15 to-[#FFD700]/5 text-[#FFD700] border border-[#FFD700]/20" 
                              : "hover:bg-muted/50 text-foreground border border-transparent"
                          )}
                        >
                          {/* Active indicator bar */}
                          {isActive && (
                            <motion.div
                              layoutId="activeNavIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-[#FFD700]"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <div className={cn(
                            "p-2 rounded-lg transition-all duration-200",
                            isActive ? "bg-[#FFD700]/20" : "bg-muted/30 group-hover:bg-muted/50"
                          )}>
                            <item.icon className={cn(
                              "h-4 w-4 transition-colors",
                              isActive ? "text-[#FFD700]" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "font-medium text-sm truncate",
                                isActive && "font-semibold"
                              )}>{item.label}</p>
                              {item.badge && (
                                <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 border-[#FFD700]/30 text-[#FFD700]">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isActive ? "text-[#FFD700]" : "group-hover:translate-x-0.5"
                          )} />
                        </Link>
                      );
                    })}
                  </motion.div>
                ))}

                {/* Divider before Settings */}
                <motion.div variants={itemVariants} className="py-1">
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </motion.div>

                {/* SETTINGS COLLAPSIBLE SECTION */}
                <motion.div variants={itemVariants}>
                  <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                          "group haptic-press",
                          settingsOpen 
                            ? "bg-gradient-to-r from-[#FFD700]/15 to-[#FFD700]/5 text-[#FFD700] border border-[#FFD700]/20" 
                            : "hover:bg-muted/50 text-foreground border border-transparent"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          settingsOpen ? "bg-[#FFD700]/20" : "bg-muted/30 group-hover:bg-muted/50"
                        )}>
                          <Settings className={cn(
                            "h-4 w-4 transition-colors",
                            settingsOpen ? "text-[#FFD700]" : "text-muted-foreground group-hover:text-foreground"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-sm">Account Settings</p>
                          <p className="text-[10px] text-muted-foreground">Security & preferences</p>
                        </div>
                        <motion.div
                          animate={{ rotate: settingsOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 ml-4 space-y-3 p-3 rounded-xl bg-muted/20 border border-border/50"
                      >
                        {/* Security Section */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-[#FFD700] flex items-center gap-2">
                            <Shield className="h-3 w-3" /> Security
                          </p>
                          <div className="space-y-2">
                            <button 
                              onClick={() => handleNavigation('/dashboard/settings#security')}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs">Change Password</span>
                              </div>
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs">Two-Factor Auth</span>
                              </div>
                              <Badge variant="outline" className="text-[8px] py-0 h-4">Soon</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-[#FFD700] flex items-center gap-2">
                            <Moon className="h-3 w-3" /> Preferences
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs">Dark Mode</span>
                              </div>
                              <Switch 
                                checked={darkMode} 
                                onCheckedChange={setDarkMode}
                                className="scale-75"
                              />
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs">Language</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">English</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Methods */}
                        <button 
                          onClick={() => handleNavigation('/dashboard/settings')}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">Payment Methods</span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>

                {/* NOTIFICATIONS COLLAPSIBLE SECTION */}
                <motion.div variants={itemVariants}>
                  <Collapsible open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                          "group haptic-press",
                          notificationsOpen 
                            ? "bg-gradient-to-r from-[#FFD700]/15 to-[#FFD700]/5 text-[#FFD700] border border-[#FFD700]/20" 
                            : "hover:bg-muted/50 text-foreground border border-transparent"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          notificationsOpen ? "bg-[#FFD700]/20" : "bg-muted/30 group-hover:bg-muted/50"
                        )}>
                          <Bell className={cn(
                            "h-4 w-4 transition-colors",
                            notificationsOpen ? "text-[#FFD700]" : "text-muted-foreground group-hover:text-foreground"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-sm">Notifications</p>
                          <p className="text-[10px] text-muted-foreground">Alerts & updates</p>
                        </div>
                        <motion.div
                          animate={{ rotate: notificationsOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 ml-4 space-y-2 p-3 rounded-xl bg-muted/20 border border-border/50"
                      >
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="text-xs">Push Notifications</span>
                          <Switch 
                            checked={pushNotifications} 
                            onCheckedChange={setPushNotifications}
                            className="scale-75"
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="text-xs">Email Updates</span>
                          <Switch 
                            checked={emailUpdates} 
                            onCheckedChange={setEmailUpdates}
                            className="scale-75"
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="text-xs">Referral Alerts</span>
                          <Switch 
                            checked={referralAlerts} 
                            onCheckedChange={setReferralAlerts}
                            className="scale-75"
                          />
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>

                {/* Help & Support */}
                <motion.div variants={itemVariants}>
                  <Link
                    to="/contact"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group haptic-press hover:bg-muted/50 text-foreground border border-transparent"
                  >
                    <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-all duration-200">
                      <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Help & Support</p>
                      <p className="text-[10px] text-muted-foreground">Get assistance</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                </motion.div>

                {/* Legal */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:bg-muted/50 text-foreground border border-transparent cursor-pointer">
                    <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-all duration-200">
                      <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Legal & Privacy</p>
                      <p className="text-[10px] text-muted-foreground">Terms & policies</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </motion.div>
              </motion.div>
            </nav>

            {/* Footer with enhanced styling */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent"
            >
              {/* Logout Confirmation Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      variant="ghost"
                      disabled={isLoggingOut}
                      className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-12 disabled:opacity-50"
                    >
                      <LogOut className={cn("h-4 w-4", isLoggingOut && "animate-spin")} />
                      <span className="font-medium">{isLoggingOut ? 'Signing Out...' : 'Secure Sign Out'}</span>
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-sm border-[#FFD700]/20 bg-card">
                  <AlertDialogHeader>
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                        <LogOut className="h-6 w-6 text-destructive" />
                      </div>
                    </div>
                    <AlertDialogTitle className="text-center">Sign Out?</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                      You will be securely signed out of your Amabilia account. All local session data will be cleared.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                    <AlertDialogAction
                      onClick={() => secureSignOut({ redirectTo: '/', clearAllData: true })}
                      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Yes, Sign Out
                    </AlertDialogAction>
                    <AlertDialogCancel className="w-full mt-0 border-[#FFD700]/30 hover:bg-[#FFD700]/10">
                      Cancel
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="mt-3 text-center">
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider">
                  AMABILIA NETWORK • 2026
                </p>
                <p className="text-[8px] text-muted-foreground/60 mt-1">
                  Sovereign Financial Architecture
                </p>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
