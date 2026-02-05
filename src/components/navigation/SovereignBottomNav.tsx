import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BOTTOM_NAV_ITEMS } from '@/lib/navSections';

/**
 * Sovereign Bottom Navigation - V10.0
 * Four-pillar navigation using centralized constants
 * Source: src/lib/navSections.ts
 */

const navItems = BOTTOM_NAV_ITEMS.map(item => ({
  icon: item.icon,
  label: item.name,
  sublabel: item.description,
  path: item.path,
  color: item.color,
}));

export function SovereignBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#FFD700]/20 bg-card/98 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-stretch justify-around h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 haptic-press',
                active ? 'bg-[#FFD700]/5' : 'hover:bg-muted/30'
              )}
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center"
              >
                {/* Icon Container */}
                <div 
                  className={cn(
                    'p-2.5 rounded-xl mb-1 transition-all duration-200 shadow-sm',
                    active 
                      ? `bg-gradient-to-br ${item.color} shadow-lg shadow-[#FFD700]/20` 
                      : 'bg-muted/50 border border-border'
                  )}
                >
                  <item.icon className={cn(
                    'h-5 w-5 transition-colors',
                    active ? 'text-black' : 'text-muted-foreground'
                  )} />
                </div>

                {/* Label */}
                <span className={cn(
                  'text-[9px] font-bold tracking-wide transition-colors',
                  active ? 'text-[#FFD700]' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
                <span className={cn(
                  'text-[8px] transition-colors -mt-0.5',
                  active ? 'text-[#FFD700]/70' : 'text-muted-foreground/60'
                )}>
                  {item.sublabel}
                </span>
              </motion.div>

              {/* Active Indicator */}
              {active && (
                <motion.div
                  layoutId="sovereignNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
