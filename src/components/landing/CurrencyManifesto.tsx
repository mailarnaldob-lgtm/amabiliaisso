import { motion } from 'framer-motion';
import { Shield, Eye, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Suspense, lazy } from 'react';

// Lazy load the 3D coin for performance
const AlphaGoldCoin3D = lazy(() => 
  import('./AlphaGoldCoin3D').then(mod => ({ default: mod.AlphaGoldCoin3D }))
);

/**
 * THE ALPHA (₳) CURRENCY MANIFESTO
 * Sovereign Financial Legitimacy Statement
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

// Fallback coin while 3D loads
function CoinFallback() {
  return (
    <motion.div
      className="w-20 h-20 rounded-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #B8860B 100%)',
        boxShadow: '0 0 40px hsl(45 100% 51% / 0.4), inset 0 2px 4px hsl(45 100% 80% / 0.3)',
      }}
      animate={{
        rotateY: [0, 360],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <span className="text-4xl font-bold text-amber-900 font-mono">₳</span>
    </motion.div>
  );
}

export function CurrencyManifesto() {
  return (
    <section className="py-20 sm:py-28 px-6 lg:px-8 relative overflow-hidden">
      {/* Glassmorphism Background Container */}
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16"
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
          
          {/* Gold dust particles effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
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

          {/* Header with 3D Coin */}
          <div className="text-center mb-12">
            {/* Interactive 3D Coin */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            >
              <Suspense fallback={<CoinFallback />}>
                <AlphaGoldCoin3D size="xl" showTooltip={true} />
              </Suspense>
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              The Alpha <span className="text-amber-400">Currency</span> Manifesto
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
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.1) 0%, hsl(45 100% 51% / 0.05) 100%)',
                border: '1px solid hsl(45 100% 51% / 0.3)',
              }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-amber-400 font-mono font-bold">₳</span>
              <span className="text-sm text-amber-100/80">
                Convertible to cash via
              </span>
              <span className="text-amber-400 font-semibold">ALPHA EXCHANGER</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </motion.div>
          </div>

          {/* Manifesto Items with Coins */}
          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {manifestoItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="relative p-6 rounded-xl group"
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
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Mini coin accent */}
                  <motion.div
                    className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Suspense fallback={null}>
                      <AlphaGoldCoin3D size="sm" showTooltip={false} />
                    </Suspense>
                  </motion.div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                        border: '1px solid hsl(45 100% 51% / 0.2)'
                      }}
                    >
                      <Icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-amber-400 font-medium">{item.highlight}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Bottom accent with coins */}
          <motion.div
            className="mt-12 pt-8 border-t border-amber-500/10 flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <Suspense fallback={<CoinFallback />}>
                <AlphaGoldCoin3D size="md" showTooltip={true} />
              </Suspense>
              <div className="text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Exchange Rate</p>
                <p className="text-lg font-mono font-bold text-amber-400">₳ 1.00 = ₱ 1.00</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-amber-500/20" />
            
            <div className="flex items-center gap-2">
              <Suspense fallback={<CoinFallback />}>
                <AlphaGoldCoin3D size="md" showTooltip={true} />
              </Suspense>
              <div className="text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Daily Vault Yield</p>
                <p className="text-lg font-mono font-bold text-amber-400">1.00%</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-amber-500/20" />
            
            <div className="flex items-center gap-2">
              <Suspense fallback={<CoinFallback />}>
                <AlphaGoldCoin3D size="md" showTooltip={true} />
              </Suspense>
              <div className="text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Referral Bonus</p>
                <p className="text-lg font-mono font-bold text-amber-400">50%</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
