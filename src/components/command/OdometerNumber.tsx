import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OdometerNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
  duration?: number;
}

export function OdometerNumber({
  value,
  prefix = '',
  suffix = '',
  className,
  decimals = 0,
  duration = 0.6,
}: OdometerNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setIsAnimating(true);
      
      // Animate the number change
      const startValue = prevValue.current;
      const endValue = value;
      const diff = endValue - startValue;
      const startTime = performance.now();
      const animDuration = duration * 1000;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animDuration, 1);
        
        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValue + diff * eased;
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          setIsAnimating(false);
          prevValue.current = endValue;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);
  const digits = formattedValue.split('');

  return (
    <div className={cn("inline-flex items-baseline font-mono", className)}>
      {prefix && <span className="text-muted-foreground">{prefix}</span>}
      <div className="flex overflow-hidden">
        <AnimatePresence mode="popLayout">
          {digits.map((digit, index) => (
            <motion.span
              key={`${index}-${isAnimating ? 'anim' : digit}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                delay: index * 0.02
              }}
              className="inline-block"
            >
              {digit}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      {suffix && <span className="text-muted-foreground ml-0.5">{suffix}</span>}
    </div>
  );
}
