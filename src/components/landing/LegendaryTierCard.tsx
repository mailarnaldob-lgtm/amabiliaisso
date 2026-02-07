import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Sparkles, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LegendaryTierCardProps {
  name: string;
  price: number;
  icon: LucideIcon;
  color: string;
  shadowColor: string;
  borderColor: string;
  features: string[];
  popular?: boolean;
  index: number;
}

/**
 * LEGENDARY TIER CARD - Sovereign Cinematic UI
 * 
 * Features:
 * - Hide/Expand interaction with legendary animations
 * - Glassmorphism backdrop-blur-2xl
 * - Obsidian Black (#050505) + Alpha Gold (#FFD700)
 * - 0.3s Bloom scale-down transitions
 * - Gold dust particles on expand
 */
export function LegendaryTierCard({
  name,
  price,
  icon: Icon,
  color,
  shadowColor,
  borderColor,
  features,
  popular = false,
  index,
}: LegendaryTierCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleExpand = useCallback(() => {
    if (!isExpanded) {
      // Generate gold dust particles on expand
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 1500);
    }
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="relative"
    >
      {/* Gold Dust Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full bg-[#FFD700] pointer-events-none z-50"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{
              opacity: [1, 0.8, 0],
              scale: [0, 1.5, 0.5],
              y: [0, -30],
              x: [0, (Math.random() - 0.5) * 40],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      <motion.div
        onClick={handleExpand}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scale: isHovered ? 1.02 : 1,
          rotateY: isHovered ? 3 : 0,
          rotateX: isHovered ? -2 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.3 }}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d]",
          "border transition-all duration-300",
          borderColor,
          isExpanded && "ring-2 ring-[#FFD700]/50 shadow-2xl shadow-[#FFD700]/20",
          "backdrop-blur-2xl"
        )}
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
        {/* Ambient Glow Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: isHovered || isExpanded ? 0.15 : 0.05,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(ellipse at center, ${name === 'Elite' ? '#FFD700' : name === 'Expert' ? '#6366f1' : '#10b981'}20 0%, transparent 70%)`,
          }}
        />

        {/* Edge Glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          animate={{
            boxShadow: isExpanded 
              ? `inset 0 0 30px rgba(255, 215, 0, 0.1), 0 0 40px rgba(255, 215, 0, 0.15)`
              : 'none',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Popular Badge */}
        {popular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold px-4 shadow-lg shadow-[#FFD700]/30">
            <Sparkles className="w-3 h-3 mr-1" />
            MOST POPULAR
          </Badge>
        )}

        <div className="relative p-6">
          {/* Collapsed Header - Always Visible */}
          <div className="flex items-center gap-4">
            {/* Icon */}
            <motion.div
              animate={{
                scale: isExpanded ? 1.1 : 1,
                rotate: isExpanded ? 5 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                `bg-gradient-to-br ${color}`,
                'shadow-lg',
                shadowColor
              )}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>

            {/* Name & Price */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#FFD700] font-mono">₱{price}</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
            </div>

            {/* Expand Indicator */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center"
            >
              <ArrowRight className={cn(
                "w-4 h-4 transition-colors",
                isExpanded ? "text-[#FFD700]" : "text-muted-foreground"
              )} style={{ transform: 'rotate(90deg)' }} />
            </motion.div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: "auto", 
                  opacity: 1,
                  transition: {
                    height: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3, delay: 0.1 }
                  }
                }}
                exit={{ 
                  height: 0, 
                  opacity: 0,
                  transition: {
                    height: { duration: 0.25 },
                    opacity: { duration: 0.15 }
                  }
                }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="pt-6 border-t border-[#FFD700]/10 mt-4"
                >
                  {/* Value Proposition */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {name === 'Pro' && 'Unlock the full earning potential of the Alpha Ecosystem. Start completing missions and earning ₳ today.'}
                    {name === 'Expert' && 'Lead your network with advanced tools and earn passive income through multi-level overrides.'}
                    {name === 'Elite' && 'Access the exclusive Alpha Bankers Cooperative and unlock the highest earning potential with daily vault yields.'}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-[#FFD700] mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Why Activate Box */}
                  <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10 mb-6">
                    <h4 className="text-sm font-semibold text-[#FFD700] mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Why Activate Now?
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• One-time payment, lifetime access</li>
                      <li>• Immediate access to ₳ earning missions</li>
                      <li>• 50% referral commissions on your network</li>
                      {name === 'Elite' && <li>• 1% daily yield on vault deposits</li>}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link to="/auth" className="block" onClick={(e) => e.stopPropagation()}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button
                        className={cn(
                          'w-full h-12 text-base font-bold transition-all gap-2',
                          name === 'Elite'
                            ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 shadow-lg shadow-[#FFD700]/30'
                            : 'bg-muted hover:bg-muted/80 text-foreground border border-[#FFD700]/20'
                        )}
                      >
                        <Sparkles className="w-4 h-4" />
                        ACTIVATE ACCOUNT
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Link>

                  {/* Tooltip */}
                  <p className="text-[10px] text-center text-muted-foreground mt-3 opacity-60">
                    Activate now to unlock ₳ earning & full network access
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Shimmer */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          animate={{
            background: isExpanded
              ? 'linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}
