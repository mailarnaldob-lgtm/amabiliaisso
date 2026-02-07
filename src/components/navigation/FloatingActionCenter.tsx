import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Wallet, ArrowUpDown, Send, Zap, Landmark, 
  Users, TrendingUp, Shield, HelpCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const authenticatedItems = [
  { 
    icon: Wallet, 
    label: 'My Wallet', 
    href: '/dashboard/bank',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: ArrowUpDown, 
    label: 'Exchange', 
    href: '/dashboard/bank',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: Send, 
    label: 'Transfer', 
    href: '/dashboard/bank',
    color: 'from-[#FFA500] to-[#FFD700]'
  },
  { 
    icon: Zap, 
    label: 'Missions', 
    href: '/dashboard/market',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: Landmark, 
    label: 'Lending', 
    href: '/dashboard/finance',
    color: 'from-[#FFA500] to-[#FFD700]'
  },
  { 
    icon: Users, 
    label: 'Network', 
    href: '/dashboard/growth',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
];

const publicItems = [
  { 
    icon: TrendingUp, 
    label: 'Join Now', 
    href: '/auth',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
  { 
    icon: Shield, 
    label: 'About', 
    href: '/about',
    color: 'from-[#FFA500] to-[#FFD700]'
  },
  { 
    icon: HelpCircle, 
    label: 'Contact', 
    href: '/contact',
    color: 'from-[#FFD700] to-[#FFA500]'
  },
];

/**
 * FLOATING ACTION CENTER - Global Component
 * 
 * Persists across:
 * - Landing page
 * - Main members dashboard
 * - All internal member pages
 * 
 * Features:
 * - Sovereign UI: Obsidian base, Alpha Gold accents
 * - Glassmorphism with subtle glow
 * - 0.3s Bloom scale-down (95%) animations
 * - Different menu items for authenticated vs public users
 */
export function FloatingActionCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  const menuItems = user ? authenticatedItems : publicItems;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with Glassmorphism */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Items */}
            <div className="absolute bottom-20 right-0 flex flex-col gap-3 items-end">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                >
                  <Link
                    to={item.href}
                    className="flex items-center gap-3 group"
                    onClick={() => setIsOpen(false)}
                  >
                    {/* Label with Glassmorphism */}
                    <motion.span 
                      className={cn(
                        "text-sm font-medium text-white/80 group-hover:text-white",
                        "transition-colors px-4 py-2 rounded-full",
                        "bg-[#0a0a0a]/90 backdrop-blur-xl",
                        "border border-[#FFD700]/20 group-hover:border-[#FFD700]/40",
                        "shadow-lg shadow-black/30"
                      )}
                      whileHover={{ x: -5 }}
                    >
                      {item.label}
                    </motion.span>
                    
                    {/* Icon Button */}
                    <motion.div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        `bg-gradient-to-br ${item.color}`,
                        "shadow-lg shadow-[#FFD700]/30"
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className="w-5 h-5 text-black" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main FAB Button - Alpha Gold */}
      <motion.button
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center",
          "text-2xl font-bold",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]/50"
        )}
        style={{
          background: isOpen 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #050505 100%)'
            : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          boxShadow: isOpen
            ? '0 0 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 0 40px rgba(255, 215, 0, 0.5), 0 8px 30px rgba(0, 0, 0, 0.4)',
          border: isOpen ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 180 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#FFD700]" />
        ) : (
          <span className="text-black font-bold text-xl">₳</span>
        )}
        
        {/* Pulse Ring - Only when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FFD700]/50"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>
    </div>
  );
}
