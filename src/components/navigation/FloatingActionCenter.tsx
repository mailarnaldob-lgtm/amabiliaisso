import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, LayoutDashboard, Key, ArrowLeftRight, 
  Rocket, Megaphone, Landmark, Globe, User, 
  TrendingUp, Shield, HelpCircle, Zap, Wallet,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  icon: LucideIcon;
  acronym: string;
  label: string;
  href: string;
  color: string;
  requiresAuth?: boolean;
}

// Authenticated user navigation items
const authenticatedItems: NavItem[] = [
  { 
    icon: Home, 
    acronym: 'HOME',
    label: 'Landing', 
    href: '/',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: LayoutDashboard, 
    acronym: 'DASH',
    label: 'Dashboard', 
    href: '/dashboard',
    color: 'from-[#FFD700] to-[#FFA500]',
    requiresAuth: true
  },
  { 
    icon: Key, 
    acronym: 'ACTV',
    label: 'Activate', 
    href: '/dashboard/upgrade',
    color: 'from-[#FFA500] to-[#FFD700]',
    requiresAuth: true
  },
  { 
    icon: ArrowLeftRight, 
    acronym: 'EXCH',
    label: 'Exchanger', 
    href: '/dashboard/exchanger',
    color: 'from-[#FFD700] to-[#FFA500]',
    requiresAuth: true
  },
  { 
    icon: Rocket, 
    acronym: 'MISS',
    label: 'Missions', 
    href: '/dashboard/market',
    color: 'from-[#FFA500] to-[#FFD700]',
    requiresAuth: true
  },
  { 
    icon: Megaphone, 
    acronym: 'CAMP',
    label: 'Campaigns', 
    href: '/dashboard/ads',
    color: 'from-[#FFD700] to-[#FFA500]',
    requiresAuth: true
  },
  { 
    icon: Landmark, 
    acronym: 'VAULT',
    label: 'Vault', 
    href: '/dashboard/finance',
    color: 'from-[#FFA500] to-[#FFD700]',
    requiresAuth: true
  },
  { 
    icon: Globe, 
    acronym: 'NET',
    label: 'Network', 
    href: '/dashboard/growth',
    color: 'from-[#FFD700] to-[#FFA500]',
    requiresAuth: true
  },
  { 
    icon: User, 
    acronym: 'PROF',
    label: 'Profile', 
    href: '/dashboard/settings',
    color: 'from-[#FFA500] to-[#FFD700]',
    requiresAuth: true
  },
];

// Public navigation items (non-authenticated)
const publicItems: NavItem[] = [
  { 
    icon: Home, 
    acronym: 'HOME',
    label: 'Home', 
    href: '/',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: Zap, 
    acronym: 'EARN',
    label: 'Earn Pillar', 
    href: '/pillars/earn',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: Wallet, 
    acronym: 'SAVE',
    label: 'Save Pillar', 
    href: '/pillars/save',
    color: 'from-[#FFA500] to-[#FFD700]'
  },
  { 
    icon: ArrowLeftRight, 
    acronym: 'TRADE',
    label: 'Trade Pillar', 
    href: '/pillars/trade',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: Globe, 
    acronym: 'MLM',
    label: 'MLM Pillar', 
    href: '/pillars/mlm',
    color: 'from-[#FFA500] to-[#FFD700]'
  },
  { 
    icon: TrendingUp, 
    acronym: 'JOIN',
    label: 'Join Now', 
    href: '/auth',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: Shield, 
    acronym: 'ABOUT',
    label: 'About', 
    href: '/about',
    color: 'from-[#FFA500] to-[#FFD700]'
  },
  { 
    icon: HelpCircle, 
    acronym: 'HELP',
    label: 'Contact', 
    href: '/contact',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
];

/**
 * FLOATING ACTION CENTER - Global Sovereign Navigator V10.0
 * 
 * Features:
 * - Global persistence across all pages
 * - Auto-hide after selection with 150ms delay
 * - Icon + Acronym labels for clarity
 * - Sovereign UI: Obsidian Black, Alpha Gold
 * - 0.3s Bloom scale-down (95%) animations
 * - Glassmorphism with backdrop-blur-2xl
 * - Mobile: FAB moves up on small screens (<768px)
 * - Auto-hides when mobile nav is open
 */
export function FloatingActionCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const menuItems = user ? authenticatedItems : publicItems;
  
  // Emit event when FAB opens so other components can react (e.g., LiveAlphaStats collapse)
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('fab-opened'));
    }
  }, [isOpen]);
  
  // Listen for mobile nav toggle events from LandingHeader
  useEffect(() => {
    const handleMobileNavToggle = (e: CustomEvent) => {
      setIsMobileNavOpen(e.detail.isOpen);
      if (e.detail.isOpen) {
        setIsOpen(false); // Close FAB when mobile nav opens
      }
    };

    window.addEventListener('mobileNavToggle', handleMobileNavToggle as EventListener);
    return () => {
      window.removeEventListener('mobileNavToggle', handleMobileNavToggle as EventListener);
    };
  }, []);
  
  // Handle navigation with auto-hide
  const handleNavigation = useCallback((href: string) => {
    setIsOpen(false);
    // Small delay for smooth animation before navigation
    setTimeout(() => {
      navigate(href);
    }, 150);
  }, [navigate]);

  // Check if current path matches item
  const isActiveRoute = useCallback((href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  }, [location.pathname]);
  
  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Hide when mobile nav is open
  if (isMobileNavOpen) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed z-50 transition-all duration-300",
        isMobile ? "bottom-20 right-4" : "bottom-6 right-6"
      )}
    >
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with Glassmorphism */}
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Container */}
            <motion.div
              className={cn(
                "absolute right-0",
                isMobile ? "bottom-16" : "bottom-20",
                "w-64 max-h-[60vh] overflow-y-auto",
                "bg-[#0a0a0a]/95 backdrop-blur-2xl",
                "border border-[#FFD700]/20 rounded-2xl",
                "shadow-2xl shadow-black/50",
                "scrollbar-thin scrollbar-thumb-[#FFD700]/20 scrollbar-track-transparent"
              )}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 p-3 border-b border-[#FFD700]/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#FFD700]">₳</span>
                  <span className="text-xs font-medium tracking-[0.15em] text-white/80">
                    SOVEREIGN NAV
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => {
                  const isActive = isActiveRoute(item.href);
                  
                  return (
                    <motion.button
                      key={item.acronym + item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl",
                        "transition-all duration-200",
                        "group cursor-pointer",
                        isActive 
                          ? "bg-[#FFD700]/10 border border-[#FFD700]/30" 
                          : "hover:bg-[#FFD700]/5 border border-transparent"
                      )}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Icon Container */}
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        "bg-gradient-to-br",
                        item.color,
                        "shadow-lg shadow-[#FFD700]/20",
                        "group-hover:shadow-[#FFD700]/40 transition-shadow"
                      )}>
                        <item.icon className="w-5 h-5 text-black" />
                      </div>
                      
                      {/* Text Container */}
                      <div className="flex-1 text-left">
                        <p className={cn(
                          "text-xs font-bold tracking-[0.1em]",
                          isActive ? "text-[#FFD700]" : "text-white/90 group-hover:text-[#FFD700]",
                          "transition-colors"
                        )}>
                          {item.acronym}
                        </p>
                        <p className="text-[10px] text-white/50 group-hover:text-white/70 transition-colors">
                          {item.label}
                        </p>
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 p-2 border-t border-[#FFD700]/10 bg-[#0a0a0a]/95">
                <p className="text-[9px] text-center text-white/30 tracking-wider">
                  AMABILIA NETWORK
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main FAB Button - Alpha Gold */}
      <motion.button
        className={cn(
          "relative rounded-full flex items-center justify-center",
          "text-2xl font-bold",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]/50",
          isMobile ? "w-14 h-14" : "w-16 h-16"
        )}
        style={{
          background: isOpen 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #050505 100%)'
            : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          boxShadow: isOpen
            ? '0 0 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 0 40px rgba(255, 215, 0, 0.5), 0 8px 30px rgba(0, 0, 0, 0.4)',
          border: isOpen ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 180 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isOpen ? (
          <X className={cn("text-[#FFD700]", isMobile ? "w-5 h-5" : "w-6 h-6")} />
        ) : (
          <span className={cn("text-black font-bold", isMobile ? "text-lg" : "text-xl")}>₳</span>
        )}
        
        {/* Pulse Ring - Only when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FFD700]/50"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>
    </div>
  );
}
