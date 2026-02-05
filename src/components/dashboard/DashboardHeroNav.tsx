import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DASHBOARD_HERO_CARDS } from '@/lib/navSections';

/**
 * Dashboard Hero Navigation - V10.0
 * Four-pillar hero cards using centralized constants
 * Source: src/lib/navSections.ts
 */

export function DashboardHeroNav() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {DASHBOARD_HERO_CARDS.map((card, index) => (
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
                  'shadow-lg group-hover:shadow-xl group-hover:shadow-[#FFD700]/20 transition-shadow duration-300',
                  card.shadowColor
                )}
              >
                <card.icon className="h-6 w-6 text-white drop-shadow-sm" />
              </div>

              {/* Labels */}
              <h3 className="text-xs font-bold text-foreground tracking-wide mb-0.5 group-hover:text-[#FFD700] transition-colors">
                {card.fullLabel}
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
