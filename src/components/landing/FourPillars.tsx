import { motion } from 'framer-motion';
import { Briefcase, Vault, ArrowLeftRight, Network, Clock, Percent, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * THE FOUR PILLARS OF ₳ — CORE INFRASTRUCTURE
 * Sovereign Labor & Equity Network
 */

const pillars = [
  {
    symbol: '₳',
    title: 'EARN',
    subtitle: 'Sovereign Labor',
    description: 'Convert your time and effort into the Alpha (₳) currency through verified missions.',
    feature: 'Real-time mission control with live countdowns and sponsored brand rewards.',
    icon: Briefcase,
    featureIcon: Clock,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/30',
    glowColor: 'emerald',
    status: 'active'
  },
  {
    symbol: '₳',
    title: 'SAVE',
    subtitle: 'Sovereign Equity',
    description: 'Grow your ₳ holdings in a high-security cinematic vault.',
    feature: '1% Daily Yield generated automatically through the Amabilia Protocol.',
    icon: Vault,
    featureIcon: Percent,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/30',
    glowColor: 'blue',
    status: 'active'
  },
  {
    symbol: '₳',
    title: 'TRADE',
    subtitle: 'Sovereign Liquidity',
    description: 'Seamlessly convert your accumulated Alpha (₳) into fiat currency.',
    feature: 'ALPHA EXCHANGER',
    icon: ArrowLeftRight,
    featureIcon: Sparkles,
    color: 'from-[#FFD700] to-[#FFA500]',
    borderColor: 'border-[#FFD700]/30',
    glowColor: 'amber',
    status: 'coming-soon'
  },
  {
    symbol: '₳',
    title: 'MLM',
    subtitle: 'Sovereign Network',
    description: 'Build your legacy and earn multi-generational royalties from your global network.',
    feature: 'Real-time royalty distribution powered by the Amabilia Ledger.',
    icon: Network,
    featureIcon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/30',
    glowColor: 'purple',
    status: 'active'
  }
];

function PillarCard({
  pillar,
  index
}: {
  pillar: typeof pillars[0];
  index: number;
}) {
  const Icon = pillar.icon;
  const FeatureIcon = pillar.featureIcon;

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(220 23% 8% / 0.95) 0%, hsl(220 23% 5%) 100%)',
        backdropFilter: 'blur(40px)',
        border: '1px solid hsl(220 23% 20% / 0.3)'
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{
        y: -8,
        scale: 0.95,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glassmorphism Overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, hsl(45 100% 51% / 0.08) 0%, transparent 70%)`
        }}
      />

      {/* Corner Glow */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, hsl(45 100% 51% / 0.15) 0%, transparent 70%)`
        }}
      />

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${pillar.color} shadow-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-lg">{pillar.symbol}</span>
                <h3 className="text-xl font-bold text-foreground">{pillar.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {pillar.subtitle}
              </p>
            </div>
          </div>

          {pillar.status === 'coming-soon' && (
            <Badge 
              variant="outline" 
              className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold"
            >
              COMING SOON
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {pillar.description}
        </p>

        {/* Feature */}
        <div 
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.08) 0%, hsl(45 100% 51% / 0.02) 100%)',
            border: '1px solid hsl(45 100% 51% / 0.15)'
          }}
        >
          <FeatureIcon className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-400/90 font-medium">
            {pillar.feature}
          </span>
        </div>
      </div>

      {/* Bottom Glow Line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        initial={{ width: 0, opacity: 0 }}
        whileHover={{ width: '100%', opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export function FourPillars() {
  return (
    <section className="py-20 sm:py-28 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, transparent 100%)',
              border: '1px solid hsl(45 100% 51% / 0.3)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">
              Core Infrastructure
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            The Four Pillars of{' '}
            <span className="text-amber-400">₳</span>
          </motion.h2>

          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            A complete financial ecosystem. Earn. Save. Trade. Build.
          </motion.p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.title} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}