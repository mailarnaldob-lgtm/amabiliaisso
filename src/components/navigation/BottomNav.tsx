import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, Landmark, ArrowRightLeft, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: Zap },
  { href: '/marketplace', label: 'Lend', icon: Landmark },
  { href: '/swap', label: 'Swap', icon: ArrowRightLeft },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-alpha'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'animate-pulse-glow')} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -top-0.5 w-8 h-1 rounded-full alpha-gradient" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
