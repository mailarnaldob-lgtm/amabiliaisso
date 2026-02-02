import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Landmark, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Target, label: 'Assignments', path: '/dashboard/market' },
  { icon: Landmark, label: 'Bank', path: '/dashboard/bank' },
  { icon: TrendingUp, label: 'Finance', path: '/dashboard/finance' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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
  );
}
