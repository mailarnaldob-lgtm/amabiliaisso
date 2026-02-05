import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BOTTOM_NAV_ITEMS } from '@/lib/navSections';
import { EarnHubOverlay } from '@/components/earn';
import { MLMHubOverlay } from '@/components/mlm';

/**
 * BottomNav - V12.0
 * Compact bottom navigation using centralized constants
 * EARN and MLM open as full-screen overlays; others navigate
 * Source: src/lib/navSections.ts
 */

const navItems = [
  ...BOTTOM_NAV_ITEMS.map(item => ({ id: item.id, icon: item.icon, label: item.name, path: item.path })),
  { id: 'profile', icon: User, label: 'Me', path: '/dashboard/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const [earnOverlayOpen, setEarnOverlayOpen] = useState(false);
  const [mlmOverlayOpen, setMlmOverlayOpen] = useState(false);

  const handleNavClick = (item: typeof navItems[number], e: React.MouseEvent) => {
    if (item.id === 'earn') {
      e.preventDefault();
      setEarnOverlayOpen(true);
    } else if (item.id === 'mlm') {
      e.preventDefault();
      setMlmOverlayOpen(true);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.id === 'earn' && earnOverlayOpen) ||
              (item.id === 'mlm' && mlmOverlayOpen);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(item, e)}
                className={cn(
                  'relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-150 haptic-press',
                  isActive ? 'text-[#FFD700]' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <item.icon className={cn(
                    'h-5 w-5 mb-1 transition-colors',
                    isActive && 'text-[#FFD700]'
                  )} />
                  <span className={cn(
                    'text-[10px] transition-colors',
                    isActive && 'font-semibold text-[#FFD700]'
                  )}>
                    {item.label}
                  </span>
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute bottom-1 w-8 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* EARN Hub Full-Screen Overlay */}
      <EarnHubOverlay 
        isOpen={earnOverlayOpen} 
        onClose={() => setEarnOverlayOpen(false)} 
      />

      {/* MLM Hub Full-Screen Overlay */}
      <MLMHubOverlay 
        isOpen={mlmOverlayOpen} 
        onClose={() => setMlmOverlayOpen(false)} 
      />
    </>
  );
}
