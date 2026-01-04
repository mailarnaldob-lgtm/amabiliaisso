import { useLocation, useNavigate } from 'react-router-dom';
import { Landmark, Target, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSection {
  id: string;
  name: string;
  icon: React.ElementType;
  path: string;
  color: string;
  description: string;
}

const appSections: AppSection[] = [
  { 
    id: 'bank', 
    name: 'Bank', 
    icon: Landmark, 
    path: '/alpha/bank',
    color: 'from-amber-500 to-orange-600',
    description: 'Wallet & Credits'
  },
  { 
    id: 'market', 
    name: 'Market', 
    icon: Target, 
    path: '/alpha/market',
    color: 'from-emerald-500 to-teal-600',
    description: 'VPA Missions'
  },
  { 
    id: 'finance', 
    name: 'Finance', 
    icon: TrendingUp, 
    path: '/alpha/finance',
    color: 'from-blue-500 to-indigo-600',
    description: 'P2P Lending'
  },
  { 
    id: 'growth', 
    name: 'Growth', 
    icon: Users, 
    path: '/alpha/growth',
    color: 'from-purple-500 to-pink-600',
    description: 'Royalties & Network'
  },
];

export function AppSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentApp = () => {
    for (const app of appSections) {
      if (location.pathname.startsWith(app.path)) {
        return app.id;
      }
    }
    return 'bank'; // Default
  };

  const currentApp = getCurrentApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
        {appSections.map((app) => {
          const isActive = currentApp === app.id;
          const Icon = app.icon;
          
          return (
            <button
              key={app.id}
              onClick={() => navigate(app.path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2 rounded-xl transition-all duration-200',
                isActive 
                  ? 'scale-105' 
                  : 'text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100'
              )}
            >
              <div 
                className={cn(
                  'p-2 rounded-xl mb-1 transition-all duration-200',
                  isActive 
                    ? `bg-gradient-to-br ${app.color} shadow-lg` 
                    : 'bg-muted/50'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-white' : 'text-muted-foreground'
                )} />
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {app.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { appSections };
