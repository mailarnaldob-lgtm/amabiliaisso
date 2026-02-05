 import { useCallback } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { 
   Command, X, Settings, History, LogOut
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { cn } from '@/lib/utils';
 import { useAuth } from '@/contexts/AuthContext';
 import { useProfile } from '@/hooks/useProfile';
 import { Badge } from '@/components/ui/badge';
  import { BLOOM_PRIMARY_ITEMS, BLOOM_SECONDARY_ITEMS } from '@/lib/navSections';
 
 /**
  * Bloom Menu Overlay - V10.0 (Sovereign Stability)
  * Cinematic fullscreen overlay with scale/blur animation
  * Features:
  * - 0.3s Scale & Blur: Dashboard recedes (95% scale) while menu blurs background
  * - Obsidian Black (#050505) at 85% opacity
  * - Large, centered Elite Icons with Alpha Gold (#FFD700) accents
  * - 0.2s fade-out on close (per Sovereign mandate)
  * - backdrop-blur-2xl Glassmorphism
  * Source: src/lib/navSections.ts (centralized constants)
  */
 
 interface BloomMenuItem {
   icon: React.ElementType;
   label: string;
   sublabel: string;
   path: string;
   color: string;
   badge?: string;
 }
 
  const secondaryItems: BloomMenuItem[] = [
   ...BLOOM_SECONDARY_ITEMS,
   { icon: History, label: 'History', sublabel: 'Transactions', path: '/dashboard/transactions', color: 'from-slate-600 to-slate-700' },
   { icon: Settings, label: 'Settings', sublabel: 'Account', path: '/dashboard/settings', color: 'from-slate-600 to-slate-700' },
 ];
 
 // Animation variants
 const overlayVariants = {
   hidden: { opacity: 0 },
   visible: { 
     opacity: 1,
     transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
   },
   exit: { 
     opacity: 0,
     transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
   }
 };
 
 const menuContainerVariants = {
   hidden: { opacity: 0, scale: 0.9 },
   visible: { 
     opacity: 1, 
     scale: 1,
     transition: { 
       duration: 0.3,
       ease: [0.4, 0, 0.2, 1],
       staggerChildren: 0.05,
       delayChildren: 0.1
     }
   },
   exit: { 
     opacity: 0, 
     scale: 0.95,
     transition: { duration: 0.2 }
   }
 };
 
 const itemVariants = {
   hidden: { opacity: 0, y: 20, scale: 0.9 },
   visible: { 
     opacity: 1, 
     y: 0, 
     scale: 1,
     transition: { 
       type: 'spring', 
       stiffness: 400, 
       damping: 25 
     }
   }
 };
 
 interface BloomMenuOverlayProps {
   isOpen: boolean;
   onClose: () => void;
 }
 
 export function BloomMenuContent({ onClose }: { onClose: () => void }) {
   const navigate = useNavigate();
   const location = useLocation();
   const { secureSignOut, isLoggingOut } = useAuth();
   const { data: profile } = useProfile();
 
   const handleNavigate = useCallback((path: string) => {
     onClose();
     setTimeout(() => navigate(path), 150);
   }, [navigate, onClose]);
 
   const handleSignOut = async () => {
     await secureSignOut();
     onClose();
   };
 
   const getTierBadge = (tier: string | null | undefined) => {
     switch (tier) {
       case 'elite': return { label: 'ELITE', color: 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/40' };
       case 'expert': return { label: 'EXPERT', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
       case 'pro': return { label: 'PRO', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
       default: return { label: 'BASIC', color: 'bg-muted text-muted-foreground border-border' };
     }
   };
 
   const tierBadge = getTierBadge(profile?.membership_tier);
 
   return (
     <motion.div
       variants={menuContainerVariants}
       initial="hidden"
       animate="visible"
       exit="exit"
       className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12"
     >
       {/* Close Button - Top Right */}
       <motion.div 
         className="absolute top-6 right-6"
         initial={{ opacity: 0, rotate: -90 }}
         animate={{ opacity: 1, rotate: 0 }}
         transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
       >
         <Button
           variant="ghost"
           size="icon"
           onClick={onClose}
           className="w-12 h-12 rounded-full bg-card/50 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 hover:border-[#FFD700]/50 transition-all"
         >
           <X className="h-6 w-6 text-[#FFD700]" />
         </Button>
       </motion.div>
 
       {/* User Greeting */}
       <motion.div 
         variants={itemVariants}
         className="text-center mb-8"
       >
         <Badge variant="outline" className={cn('text-xs mb-2', tierBadge.color)}>
           {tierBadge.label} MEMBER
         </Badge>
         <h2 className="text-2xl font-bold text-foreground">
           {profile?.full_name || 'Sovereign'}
         </h2>
         <p className="text-sm text-muted-foreground mt-1">Choose your destination</p>
       </motion.div>
 
       {/* Primary Items - Large Elite Icons */}
       <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm w-full">
          {BLOOM_PRIMARY_ITEMS.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <motion.button
               key={item.path}
               variants={itemVariants}
               whileHover={{ scale: 1.05, y: -4 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => handleNavigate(item.path)}
               className={cn(
                 "relative flex flex-col items-center p-5 rounded-2xl",
                 "bg-card/60 backdrop-blur-sm border transition-all duration-300",
                 isActive 
                   ? "border-[#FFD700]/50 shadow-lg shadow-[#FFD700]/20" 
                   : "border-border/50 hover:border-[#FFD700]/30"
               )}
             >
               {/* Icon Container */}
               <div className={cn(
                 "w-14 h-14 rounded-xl mb-3 flex items-center justify-center",
                 "bg-gradient-to-br shadow-lg",
                 item.color
               )}>
                 <item.icon className="h-7 w-7 text-white" />
               </div>
               
               {/* Label */}
               <span className={cn(
                 "font-semibold text-sm",
                 isActive ? "text-[#FFD700]" : "text-foreground"
               )}>
                 {item.label}
               </span>
               <span className="text-[10px] text-muted-foreground mt-0.5 text-center">
                 {item.sublabel}
               </span>
 
               {/* Badge */}
               {item.badge && (
                 <Badge 
                   variant="outline" 
                   className="absolute -top-2 -right-2 text-[8px] px-1.5 py-0.5 bg-card border-[#FFD700]/40 text-[#FFD700]"
                 >
                   {item.badge}
                 </Badge>
               )}
 
               {/* Active Indicator */}
               {isActive && (
                 <motion.div
                   layoutId="bloomActiveIndicator"
                   className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#FFD700]"
                   transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                 />
               )}
             </motion.button>
           );
         })}
       </div>
 
       {/* Divider */}
       <motion.div 
         variants={itemVariants}
         className="flex items-center gap-3 mb-6 w-full max-w-sm"
       >
         <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />
         <span className="text-[10px] uppercase tracking-widest text-[#FFD700]/60 font-semibold">Quick Access</span>
         <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />
       </motion.div>
 
       {/* Secondary Items - Compact Row */}
       <motion.div 
         variants={itemVariants}
         className="flex justify-center gap-6 mb-10"
       >
         {secondaryItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <motion.button
               key={item.path}
               whileHover={{ scale: 1.1, y: -2 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleNavigate(item.path)}
               className="flex flex-col items-center gap-1"
             >
               <div className={cn(
                 "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                 isActive 
                   ? "bg-[#FFD700]/20 border border-[#FFD700]/40" 
                   : "bg-card/50 border border-border/50 hover:border-[#FFD700]/30"
               )}>
                 <item.icon className={cn(
                   "h-5 w-5",
                   isActive ? "text-[#FFD700]" : "text-muted-foreground"
                 )} />
               </div>
               <span className={cn(
                 "text-[10px] font-medium",
                 isActive ? "text-[#FFD700]" : "text-muted-foreground"
               )}>
                 {item.label}
               </span>
             </motion.button>
           );
         })}
       </motion.div>
 
       {/* Sign Out Button */}
       <motion.div variants={itemVariants}>
         <Button
           variant="ghost"
           onClick={handleSignOut}
           disabled={isLoggingOut}
           className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
         >
           <LogOut className="h-4 w-4" />
           {isLoggingOut ? 'Signing out...' : 'Sign Out'}
         </Button>
       </motion.div>
     </motion.div>
   );
 }
 
 export function BloomMenuOverlay({ isOpen, onClose }: BloomMenuOverlayProps) {
   return (
     <AnimatePresence>
       {isOpen && (
         <motion.div
           variants={overlayVariants}
           initial="hidden"
           animate="visible"
           exit="exit"
           className="fixed inset-0 z-50 backdrop-blur-2xl"
           style={{ backgroundColor: 'rgba(5, 5, 5, 0.85)' }}
           onClick={(e) => {
             if (e.target === e.currentTarget) onClose();
           }}
         >
           {/* Golden border accent glow */}
           <div className="absolute inset-0 pointer-events-none">
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />
             <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#FFD700]/30 to-transparent" />
             <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#FFD700]/30 to-transparent" />
           </div>
 
           <BloomMenuContent onClose={onClose} />
         </motion.div>
       )}
     </AnimatePresence>
   );
 }
 
 // Trigger Button Component
 export function BloomMenuTrigger({ onClick, className }: { onClick: () => void; className?: string }) {
   return (
     <motion.div
       whileHover={{ scale: 1.05 }}
       whileTap={{ scale: 0.95 }}
     >
       <Button
         variant="ghost"
         size="icon"
         onClick={onClick}
         className={cn(
           "w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-border",
           "hover:bg-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all duration-300",
           "haptic-press shadow-lg shadow-black/20",
           className
         )}
       >
         <Command className="h-5 w-5 text-foreground" />
       </Button>
     </motion.div>
   );
 }