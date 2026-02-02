import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, ArrowDownCircle, Briefcase, Users, 
  Target, X, Sparkles, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  color: string;
  description: string;
}

const quickActions: QuickAction[] = [
  { 
    icon: RefreshCw, 
    label: 'Membership Renewal', 
    path: '/dashboard/upgrade', 
    color: 'from-[#FFD700] to-[#FFA500]',
    description: 'Renew monthly service access'
  },
  { 
    icon: PlusCircle, 
    label: 'Top-up Wallet', 
    path: '/dashboard/bank', 
    color: 'from-emerald-500 to-emerald-600',
    description: 'Add funds to your wallet'
  },
  { 
    icon: ArrowDownCircle, 
    label: 'Secure Payout', 
    path: '/dashboard/bank', 
    color: 'from-blue-500 to-blue-600',
    description: 'Withdraw your earnings'
  },
  { 
    icon: Briefcase, 
    label: 'Commit Capital', 
    path: '/dashboard/finance', 
    color: 'from-purple-500 to-purple-600',
    description: 'Invest in P2P lending'
  },
  { 
    icon: Users, 
    label: 'Partner Invite', 
    path: '/dashboard/referrals', 
    color: 'from-orange-500 to-orange-600',
    description: 'Invite partners to earn'
  },
  { 
    icon: Target, 
    label: 'Global Assignments', 
    path: '/dashboard/market', 
    color: 'from-cyan-500 to-cyan-600',
    description: 'Complete tasks for rewards'
  },
];

export function QuickActionHub() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-20 right-4 z-40",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-[#FFD700] to-[#FFA500]",
          "shadow-lg shadow-[#FFD700]/30",
          "flex items-center justify-center",
          "border-2 border-[#FFD700]/50",
          "transition-all duration-300",
          isExpanded && "rotate-45"
        )}
      >
        {isExpanded ? (
          <X className="h-6 w-6 text-black" />
        ) : (
          <Sparkles className="h-6 w-6 text-black" />
        )}
      </motion.button>

      {/* Action Menu */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            />

            {/* Actions Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "fixed bottom-36 right-4 z-40",
                "w-72 max-w-[calc(100vw-2rem)]",
                "bg-card/95 backdrop-blur-xl",
                "border border-border rounded-xl",
                "shadow-2xl shadow-black/20",
                "overflow-hidden"
              )}
            >
              {/* Header */}
              <div className="p-4 border-b border-border bg-gradient-to-r from-[#FFD700]/10 to-transparent">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FFD700]" />
                  Quick Actions
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Execute financial operations</p>
              </div>

              {/* Action Items */}
              <div className="p-2">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.path + action.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={action.path}
                      onClick={() => setIsExpanded(false)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        "hover:bg-muted/50 transition-colors",
                        "group haptic-press"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                        action.color
                      )}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {action.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
