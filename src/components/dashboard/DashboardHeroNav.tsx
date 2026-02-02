import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Landmark, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dashboard Hero Navigation - V8.4
 * Major 4 high-visibility icons positioned side-by-side on the dashboard
 * Per Blueprint V8.0 specifications
 */

interface NavCard {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  gradient: string;
  shadowColor: string;
}

const navCards: NavCard[] = [
  { 
    icon: Target, 
    label: 'EARN TASK REWARDS', 
    description: 'VPA Missions',
    path: '/dashboard/market',
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/30'
  },
  { 
    icon: Landmark, 
    label: 'ALPHA BANKERS', 
    description: 'Cooperative',
    path: '/dashboard/finance',
    gradient: 'from-[#FFD700] to-[#FFA500]',
    shadowColor: 'shadow-[#FFD700]/30'
  },
  { 
    icon: Users, 
    label: 'ROYALTY NETWORK', 
    description: 'Partner Growth',
    path: '/dashboard/growth',
    gradient: 'from-purple-500 to-pink-600',
    shadowColor: 'shadow-purple-500/30'
  },
  { 
    icon: TrendingUp, 
    label: 'MONEY TRANSFER', 
    description: 'Banking Flow',
    path: '/dashboard/bank',
    gradient: 'from-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-500/30'
  },
];

export function DashboardHeroNav() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {navCards.map((card, index) => (
        <motion.div
          key={card.path}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            to={card.path}
            className="block group"
          >
            <div 
              className={cn(
                'relative p-4 rounded-xl border border-border bg-card overflow-hidden',
                'hover:border-[#FFD700]/30 transition-all duration-200',
                'hover:-translate-y-1 haptic-press',
                card.shadowColor
              )}
            >
              {/* Background Gradient Overlay */}
              <div 
                className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
                  `bg-gradient-to-br ${card.gradient}`
                )}
              />

              {/* Icon */}
              <div 
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                  `bg-gradient-to-br ${card.gradient}`,
                  'shadow-lg',
                  card.shadowColor
                )}
              >
                <card.icon className="h-6 w-6 text-white" />
              </div>

              {/* Labels */}
              <h3 className="text-xs font-bold text-foreground tracking-wide mb-0.5 group-hover:text-[#FFD700] transition-colors">
                {card.label}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {card.description}
              </p>

              {/* Corner accent */}
              <div 
                className={cn(
                  'absolute top-0 right-0 w-16 h-16 rounded-bl-3xl opacity-5',
                  `bg-gradient-to-br ${card.gradient}`
                )}
              />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
