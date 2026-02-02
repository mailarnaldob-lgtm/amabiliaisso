import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowUpDown, Send, Target, Landmark, X, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Alpha Coin Hub - V8.4
 * The iconic Floating Action Button with Golden Alpha Coin design
 * Contains: Wallet, Exchange, Money Transfer, Assignments, Lending, Ad Wizard
 */

interface HubItem {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: string;
}
const hubItems: HubItem[] = [{
  icon: Wallet,
  label: 'My Wallet',
  description: 'View all balances',
  href: '/dashboard/bank',
  color: 'from-[#FFD700] to-[#FFA500]'
}, {
  icon: ArrowUpDown,
  label: 'Exchange',
  description: 'Top-up or Payout',
  href: '/dashboard/bank',
  color: 'from-emerald-400 to-emerald-600'
}, {
  icon: Send,
  label: 'Money Transfer',
  description: '3-step banking flow',
  href: '/dashboard/bank',
  color: 'from-blue-400 to-blue-600'
}, {
  icon: Target,
  label: 'Assignments',
  description: 'VPA missions',
  href: '/dashboard/market',
  color: 'from-purple-400 to-purple-600'
}, {
  icon: Landmark,
  label: 'Lending',
  description: 'P2P Credit Protocol',
  href: '/dashboard/finance',
  color: 'from-cyan-400 to-cyan-600'
}, {
  icon: Megaphone,
  label: 'Ad Wizard',
  description: 'Create campaigns',
  href: '/dashboard/ads',
  color: 'from-orange-400 to-red-500'
}];
export function AlphaCoinHub() {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="fixed bottom-24 right-4 z-40">
      <AnimatePresence>
        {isOpen && <>
            {/* Backdrop */}
            <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-md" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setIsOpen(false)} />
            
            {/* Menu Items */}
            <div className="absolute bottom-20 right-0 flex flex-col gap-3 items-end">
              {hubItems.map((item, index) => <motion.div key={item.label} initial={{
            opacity: 0,
            x: 30,
            scale: 0.8
          }} animate={{
            opacity: 1,
            x: 0,
            scale: 1
          }} exit={{
            opacity: 0,
            x: 30,
            scale: 0.8
          }} transition={{
            delay: index * 0.05,
            type: "spring",
            stiffness: 400,
            damping: 25
          }}>
                  <Link to={item.href} className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
                    {/* Label Badge */}
                    <motion.div className="flex flex-col items-end px-4 py-2 rounded-xl" style={{
                background: 'hsl(220 23% 8% / 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid hsl(45 100% 51% / 0.2)'
              }} whileHover={{
                x: -5,
                scale: 1.02
              }}>
                      <span className="text-sm font-semibold transition-colors text-zinc-50">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.description}
                      </span>
                    </motion.div>
                    
                    {/* Icon Button */}
                    <motion.div className={cn('w-12 h-12 rounded-full flex items-center justify-center', `bg-gradient-to-br ${item.color}`)} style={{
                boxShadow: '0 4px 20px hsl(45 100% 51% / 0.25)'
              }} whileHover={{
                scale: 1.1,
                rotate: 5
              }} whileTap={{
                scale: 0.95
              }}>
                      <item.icon className="w-5 h-5 text-black" />
                    </motion.div>
                  </Link>
                </motion.div>)}
            </div>
          </>}
      </AnimatePresence>
      
      {/* Main Alpha Coin FAB */}
      <motion.button className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden" style={{
      background: isOpen ? 'linear-gradient(135deg, hsl(220 23% 12%) 0%, hsl(220 23% 8%) 100%)' : 'linear-gradient(135deg, #d4af37 0%, #f4d03f 30%, #d4af37 60%, #aa8c2c 100%)',
      boxShadow: isOpen ? '0 0 30px hsl(0 0% 0% / 0.6), inset 0 1px 0 hsl(255 255% 255% / 0.1)' : '0 0 40px hsl(45 100% 51% / 0.4), 0 8px 30px hsl(0 0% 0% / 0.3), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
      border: isOpen ? '1px solid hsl(45 100% 51% / 0.4)' : '3px solid rgba(170,140,44,0.5)'
    }} onClick={() => setIsOpen(!isOpen)} whileHover={{
      scale: 1.08
    }} whileTap={{
      scale: 0.95
    }} animate={{
      rotate: isOpen ? 180 : 0
    }} transition={{
      type: "spring",
      stiffness: 300,
      damping: 20
    }}>
        {isOpen ? <X className="w-6 h-6 text-[#FFD700]" /> : <>
            {/* Inner coin detail */}
            <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)'
        }}>
              <span className="text-2xl font-bold text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">₳</span>
            </div>
          </>}
        
        {/* Pulse Ring - Only when closed */}
        {!isOpen && <motion.div className="absolute inset-0 rounded-full" style={{
        border: '2px solid hsl(45 100% 51% / 0.6)'
      }} animate={{
        scale: [1, 1.4, 1],
        opacity: [0.6, 0, 0.6]
      }} transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }} />}
      </motion.button>
    </div>;
}