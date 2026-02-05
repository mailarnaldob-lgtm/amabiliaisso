 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { cn } from '@/lib/utils';
 import { CAMPAIGN_TYPES } from '@/hooks/useAdCampaigns';
 
 interface AdTypeSelectorProps {
   selectedType: string;
   onSelect: (type: string) => void;
   className?: string;
 }
 
 export function AdTypeSelector({ selectedType, onSelect, className }: AdTypeSelectorProps) {
   const [hoveredType, setHoveredType] = useState<string | null>(null);
 
   return (
     <div className={cn("grid grid-cols-3 gap-3", className)}>
       {CAMPAIGN_TYPES.slice(0, 6).map((type) => {
         const isSelected = selectedType === type.value;
         const isHovered = hoveredType === type.value;
 
         return (
           <motion.button
             key={type.value}
             onClick={() => onSelect(type.value)}
             onHoverStart={() => setHoveredType(type.value)}
             onHoverEnd={() => setHoveredType(null)}
             className={cn(
               "relative flex flex-col items-center justify-center p-4 rounded-xl",
               "border transition-all duration-200",
               isSelected
                 ? "border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/20"
                 : "border-border/50 bg-card/50 hover:border-amber-500/50 hover:bg-amber-500/10"
             )}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             animate={{
               scale: isHovered && !isSelected ? 1.08 : isSelected ? 1.02 : 1,
             }}
             transition={{ type: "spring", stiffness: 400, damping: 30 }}
           >
             <span className="text-2xl mb-1">{type.icon}</span>
             <span className={cn(
               "text-[10px] font-medium transition-colors",
               isSelected ? "text-amber-400" : "text-muted-foreground"
             )}>
               {type.label.split(' ')[0]}
             </span>
 
             {/* Expansion tooltip on hover */}
             <AnimatePresence>
               {isHovered && !isSelected && (
                 <motion.div
                   initial={{ opacity: 0, y: 5, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 5, scale: 0.9 }}
                   className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover border border-border rounded-md shadow-lg z-10"
                 >
                   <span className="text-[10px] whitespace-nowrap">{type.label}</span>
                 </motion.div>
               )}
             </AnimatePresence>
 
             {isSelected && (
               <motion.div
                 layoutId="selected-ad-type"
                 className="absolute inset-0 border-2 border-amber-500 rounded-xl"
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
               />
             )}
           </motion.button>
         );
       })}
     </div>
   );
 }