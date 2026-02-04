import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface ExpandableCardProps {
  children: ReactNode;
  expandedContent: ReactNode;
  className?: string;
  isBlurred?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  headerAction?: ReactNode;
}

export function ExpandableCard({
  children,
  expandedContent,
  className,
  isBlurred = false,
  onExpandChange,
  headerAction,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  return (
    <motion.div
      layout
      className={cn(
        "relative overflow-hidden rounded-xl border transition-all duration-300",
        "bg-card border-border",
        isExpanded && "border-[#FFD700]/40 shadow-lg shadow-[#FFD700]/10",
        isBlurred && !isExpanded && "opacity-40 blur-[1px] pointer-events-none",
        className
      )}
      initial={false}
      animate={{
        scale: isExpanded ? 1.02 : 1,
        zIndex: isExpanded ? 10 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.3,
      }}
    >
      {/* Main content - always visible */}
      <motion.div
        className="cursor-pointer"
        onClick={handleToggle}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <div className="relative">
          {children}
          
          {/* Expand indicator */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {headerAction}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-1 rounded-full bg-muted/50"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { type: "spring", stiffness: 400, damping: 30 },
                opacity: { duration: 0.2, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.2 },
                opacity: { duration: 0.1 }
              }
            }}
            className="border-t border-border/50"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              className="p-4"
            >
              {expandedContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
