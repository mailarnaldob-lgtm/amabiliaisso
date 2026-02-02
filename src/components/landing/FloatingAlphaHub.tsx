import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowUpDown, Zap, X, Landmark, Send } from 'lucide-react';

const hubItems = [
  { 
    icon: Wallet, 
    label: 'My Wallet', 
    href: '/dashboard/bank',
    color: 'from-amber-400 to-amber-500'
  },
  { 
    icon: ArrowUpDown, 
    label: 'Exchange', 
    href: '/dashboard/bank',
    color: 'from-amber-400 to-orange-500'
  },
  { 
    icon: Send, 
    label: 'Transfer', 
    href: '/dashboard/bank',
    color: 'from-orange-400 to-amber-500'
  },
  { 
    icon: Zap, 
    label: 'Missions', 
    href: '/dashboard/market',
    color: 'from-amber-500 to-yellow-400'
  },
  { 
    icon: Landmark, 
    label: 'Lending', 
    href: '/dashboard/finance',
    color: 'from-yellow-400 to-amber-400'
  },
];

export function FloatingAlphaHub() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Items */}
            <div className="absolute bottom-20 right-0 flex flex-col gap-3 items-end">
              {hubItems.map((item, index) => (
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
                    <motion.span 
                      className="text-sm font-medium text-white/80 group-hover:text-white transition-colors px-3 py-1.5 rounded-full"
                      style={{
                        background: 'hsl(220 23% 10% / 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid hsl(45 100% 51% / 0.2)'
                      }}
                      whileHover={{ x: -5 }}
                    >
                      {item.label}
                    </motion.span>
                    
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${item.color}`}
                      style={{
                        boxShadow: '0 4px 20px hsl(45 100% 51% / 0.3)'
                      }}
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
      
      {/* Main FAB Button */}
      <motion.button
        className="relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
        style={{
          background: isOpen 
            ? 'linear-gradient(135deg, hsl(220 23% 15%) 0%, hsl(220 23% 10%) 100%)'
            : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          boxShadow: isOpen
            ? '0 0 30px hsl(0 0% 0% / 0.5), inset 0 1px 0 hsl(255 255% 255% / 0.1)'
            : '0 0 40px hsl(45 100% 51% / 0.5), 0 8px 30px hsl(0 0% 0% / 0.4)',
          border: isOpen ? '1px solid hsl(45 100% 51% / 0.3)' : 'none'
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
          <X className="w-6 h-6 text-amber-400" />
        ) : (
          <span className="text-black">₳</span>
        )}
        
        {/* Pulse Ring - Only when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid hsl(45 100% 51% / 0.5)'
            }}
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
