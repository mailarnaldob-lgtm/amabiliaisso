import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, History, Users, Settings, Shield, 
  FileText, HelpCircle, LogOut, ChevronRight, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SovereignSidebarProps {
  className?: string;
}

const sidebarItems = [
  { icon: Home, label: 'Command Center', path: '/dashboard', description: 'Your primary dashboard' },
  { icon: History, label: 'Account History', path: '/dashboard/transactions', description: 'View all transactions' },
  { icon: Users, label: 'Partner Network', path: '/dashboard/referrals', description: 'Manage your referrals' },
  { icon: Settings, label: 'Profile Settings', path: '/dashboard/settings', description: 'Update your profile' },
  { icon: Shield, label: 'Security Center', path: '/dashboard/settings#security', description: 'Account security' },
  { icon: FileText, label: 'System Logs', path: '/dashboard/transactions', description: 'Activity logs' },
  { icon: HelpCircle, label: 'Support', path: '/contact', description: 'Get help' },
];

export function SovereignSidebar({ className }: SovereignSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <>
      {/* Trigger Button - Frosted Glass */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-border",
          "hover:bg-primary/10 hover:border-primary/30 transition-all",
          "haptic-press",
          className
        )}
      >
        <Menu className="h-5 w-5 text-foreground" />
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw]",
              "bg-card border-r border-border",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                  <Crown className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">Amabilia</h2>
                  <p className="text-xs text-muted-foreground">Sovereign Menu</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="haptic-press"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-150",
                      "group haptic-press",
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isActive ? "bg-primary/20" : "bg-muted/30 group-hover:bg-muted/50"
                    )}>
                      <item.icon className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      "group-hover:translate-x-0.5"
                    )} />
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-3 font-mono">
                AMABILIA NETWORK • 2026
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
