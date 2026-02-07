import { motion } from 'framer-motion';
import { Shield, Eye, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { AlphaGoldCoin3D } from './AlphaGoldCoin3D';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * THE ALPHA (₳) CURRENCY MANIFESTO - V10.0
 * 
 * Features:
 * - Hyper-realistic 3D Alpha Coins: brushed gold, polished edges, embossed ₳
 * - Desktop: inline with text, hover/click interactive (tilt, bounce, sparkle)
 * - Mobile: stacked layout, tap for interactions, scaled down, reduced particle density
 * - Pull-quote highlights in gold glow
 * - Fully responsive, cinematic, touch-friendly
 */

const manifestoItems = [
  {
    icon: Shield,
    title: 'Asset Status',
    description: 'The ₳ (Alpha) is not just a token; it is the native currency of the Amabilia Network, engineered for real-world value and institutional-grade liquidity.',
    highlight: 'Native Currency'
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'Every ₳ movement is recorded on the Sovereign Ledger, ensuring 100% mathematical precision and a perfect audit trail.',
    highlight: '100% Auditable'
  },
  {
    icon: Zap,
    title: 'Growth & Stability',
    description: 'Built on a foundation of 15-second RESTful polling for absolute stability and zero-lag performance.',
    highlight: 'Zero-Lag Performance'
  }
];

// Gold dust particles - reduced on mobile
function GoldDustParticles({ count = 12 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#FFD700]/40 rounded-full"
          style={{
            left: `${10 + (i * 7)}%`,
            top: `${15 + (i % 4) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export function CurrencyManifesto() {
  const isMobile = useIsMobile();

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glassmorphism Background Container */}
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          className="relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-16"
          style={{
            background: 'linear-gradient(135deg, hsl(220 23% 8% / 0.95) 0%, hsl(220 23% 5%) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid hsl(45 100% 51% / 0.2)',
            boxShadow: '0 0 80px hsl(45 100% 51% / 0.08), inset 0 1px 0 hsl(45 100% 51% / 0.1)'
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Corner Orb */}
          <div 
            className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 51% / 0.1) 0%, transparent 70%)'
            }}
          />
          
          {/* Gold dust particles - reduced on mobile */}
          <GoldDustParticles count={isMobile ? 6 : 12} />

          {/* Header with 3D Coin */}
          <div className="text-center mb-10 sm:mb-12">
            {/* Interactive 3D Coin - scales for mobile */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            >
              <AlphaGoldCoin3D size={isMobile ? "lg" : "xl"} showTooltip={true} />
            </motion.div>

            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              The Alpha <span className="text-[#FFD700]">Currency</span> Manifesto
            </motion.h2>

            <motion.p
              className="text-muted-foreground max-w-xl mx-auto mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              A currency designed for the modern sovereign individual.
            </motion.p>
            
            {/* Exchanger callout */}
            <Link to="/dashboard/exchanger">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.1) 0%, hsl(45 100% 51% / 0.05) 100%)',
                  border: '1px solid hsl(45 100% 51% / 0.3)',
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02, borderColor: 'hsl(45 100% 51% / 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[#FFD700] font-mono font-bold">₳</span>
                <span className="text-sm text-amber-100/80">
                  Convertible to cash via
                </span>
                <span className="text-[#FFD700] font-semibold">ALPHA EXCHANGER</span>
                <ArrowRight className="h-4 w-4 text-[#FFD700]" />
              </motion.div>
            </Link>
          </div>

          {/* Manifesto Items with Coins - Responsive grid */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {manifestoItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="relative p-5 sm:p-6 rounded-xl group"
                  style={{
                    background: 'linear-gradient(135deg, hsl(220 23% 12%) 0%, hsl(220 23% 8%) 100%)',
                    border: '1px solid hsl(220 23% 20% / 0.5)'
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{
                    y: -4,
                    borderColor: 'hsl(45 100% 51% / 0.3)',
                    boxShadow: '0 10px 40px hsl(45 100% 51% / 0.1)',
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Mini coin accent - visible on hover */}
                  <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                    <AlphaGoldCoin3D size="sm" showTooltip={false} />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                        border: '1px solid hsl(45 100% 51% / 0.2)'
                      }}
                    >
                      <Icon className="h-5 w-5 text-[#FFD700]" />
                    </div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700]" />
                    <span className="text-[#FFD700] font-medium">{item.highlight}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Bottom accent with coins - Responsive */}
          <motion.div
            className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[#FFD700]/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              {/* Exchange Rate */}
              <div className="flex items-center gap-3">
                <AlphaGoldCoin3D size={isMobile ? "sm" : "md"} showTooltip={true} />
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Exchange Rate</p>
                  <p 
                    className="text-base sm:text-lg font-bold text-[#FFD700]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ₳ 1.00 = ₱ 1.00
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-[#FFD700]/20" />
              
              {/* Daily Vault Yield */}
              <div className="flex items-center gap-3">
                <AlphaGoldCoin3D size={isMobile ? "sm" : "md"} showTooltip={true} />
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Daily Vault Yield</p>
                  <p 
                    className="text-base sm:text-lg font-bold text-[#FFD700]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    1.00%
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-[#FFD700]/20" />
              
              {/* Referral Bonus */}
              <div className="flex items-center gap-3">
                <AlphaGoldCoin3D size={isMobile ? "sm" : "md"} showTooltip={true} />
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Referral Bonus</p>
                  <p 
                    className="text-base sm:text-lg font-bold text-[#FFD700]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    50%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
