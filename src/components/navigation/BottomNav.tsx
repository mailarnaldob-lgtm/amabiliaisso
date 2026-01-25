import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Landmark, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Target, label: 'Market', path: '/dashboard/market' },
  { icon: Landmark, label: 'Bank', path: '/dashboard/bank' },
  { icon: TrendingUp, label: 'Finance', path: '/dashboard/finance' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 mb-1', isActive && 'text-primary')} />
              <span className={cn('text-xs', isActive && 'font-medium')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}