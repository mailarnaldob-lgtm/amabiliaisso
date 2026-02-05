 import { ReactNode, useState } from 'react';
 import { SovereignBottomNav } from '@/components/navigation/SovereignBottomNav';
 import { Settings, Bell } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { BloomMenuOverlay, BloomMenuTrigger } from '@/components/navigation/BloomMenuOverlay';
 import { motion } from 'framer-motion';
 
 /**
  * Alpha Layout - V9.0 "Bloom"
  * Features cinematic Bloom Menu Overlay with scale/blur animation
  * Uses Sovereign Bottom Navigation with 4 major icons
  */
 
 interface AlphaLayoutProps {
   children: ReactNode;
   title?: string;
   subtitle?: string;
   appColor?: string;
 }
 
 export function AlphaLayout({ children, title, subtitle }: AlphaLayoutProps) {
   const [isBloomOpen, setIsBloomOpen] = useState(false);
 
   return (
     <>
       <motion.div 
         className="min-h-screen bg-background"
         animate={{
           scale: isBloomOpen ? 0.95 : 1,
           filter: isBloomOpen ? 'blur(8px)' : 'blur(0px)',
         }}
         transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
       >
         {/* 2026 Background Atmosphere */}
         <div className="bg-atmosphere" />
         
         {/* Header - 2026 Glassmorphism with Golden-Yellow Accent */}
         {title && (
           <header className="sticky top-0 z-40 border-b border-[#FFD700]/20 bg-card/95 backdrop-blur-xl">
             <div className="flex items-center justify-between px-4 h-16">
               <div className="flex items-center gap-3">
                 {/* Command Icon - Triggers Bloom Menu */}
                 <BloomMenuTrigger onClick={() => setIsBloomOpen(true)} />
 
                 <div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                     <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
                   </div>
                   {subtitle && (
                     <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                   )}
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Link to="/dashboard/transactions" className="p-2 rounded-lg hover:bg-[#FFD700]/10 transition-colors haptic-press relative">
                   <Bell className="h-5 w-5 text-muted-foreground" />
                   <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFD700]" />
                 </Link>
                 <Link to="/dashboard/settings" className="p-2 rounded-lg hover:bg-[#FFD700]/10 transition-colors haptic-press">
                   <Settings className="h-5 w-5 text-muted-foreground" />
                 </Link>
               </div>
             </div>
           </header>
         )}
 
         {/* Main Content */}
         <main className="pb-28 px-4 py-6 relative z-10">
           {children}
         </main>
 
         {/* Sovereign Bottom Navigation - 4 Major Icons */}
         <SovereignBottomNav />
       </motion.div>
       
       {/* Bloom Menu Overlay - Outside the scaled container */}
       <BloomMenuOverlay isOpen={isBloomOpen} onClose={() => setIsBloomOpen(false)} />
     </>
   );
 }