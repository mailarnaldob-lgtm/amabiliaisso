import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RadialProgressClockProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: 'gold' | 'amber' | 'emerald' | 'blue';
  showTick?: boolean;
}

export function RadialProgressClock({
  progress,
  size = 48,
  strokeWidth = 3,
  className,
  color = 'gold',
  showTick = true,
}: RadialProgressClockProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  const colorMap = {
    gold: { stroke: '#FFD700', bg: 'rgba(255, 215, 0, 0.1)', glow: 'rgba(255, 215, 0, 0.4)' },
    amber: { stroke: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', glow: 'rgba(245, 158, 11, 0.4)' },
    emerald: { stroke: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', glow: 'rgba(16, 185, 129, 0.4)' },
    blue: { stroke: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', glow: 'rgba(59, 130, 246, 0.4)' },
  };
  
  const colors = colorMap[color];
  
  // Calculate tick position for clock hand effect
  const angle = (progress / 100) * 360 - 90;
  const tickX = size / 2 + (radius - 4) * Math.cos((angle * Math.PI) / 180);
  const tickY = size / 2 + (radius - 4) * Math.sin((angle * Math.PI) / 180);

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${colors.glow})`,
          }}
        />
      </svg>
      
      {/* Center glow */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at center, ${colors.bg} 0%, transparent 70%)`,
        }}
      >
        {/* Clock tick/hand */}
        {showTick && progress > 0 && (
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: colors.stroke,
              left: tickX - 3,
              top: tickY - 3,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        )}
      </div>
    </div>
  );
}
