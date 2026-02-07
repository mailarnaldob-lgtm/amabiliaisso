import { motion } from 'framer-motion';
import { Star, Zap, Crown, Sparkles } from 'lucide-react';
import { LegendaryTierCard } from './LegendaryTierCard';

/**
 * TIER SHOWCASE - SOVEREIGN LEGENDARY UI V8.7
 * 
 * Interactive hide/expand legendary cards
 * One-time activation fees per Blueprint V8.7
 * PRO: ₱300, EXPERT: ₱600, ELITE: ₱900
 * 1% DAILY vault yield for Elite
 */

const tiers = [
  {
    name: 'Pro',
    price: 300,
    icon: Star,
    color: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    features: [
      'Full VPA Mission Access',
      '50% Referral Commission',
      'Omni-Transfer Engine',
      'Alpha Mobile Dashboard',
      'Priority Support Access',
    ],
    popular: false,
  },
  {
    name: 'Expert',
    price: 600,
    icon: Zap,
    color: 'from-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-500/20',
    borderColor: 'border-blue-500/30',
    features: [
      'All Pro Features',
      'Ad Wizard Professional',
      'Priority Mission Queue',
      '10% Network Overrides (Lvl 1-2)',
      '15,000 ₳ Daily Transfer Limit',
    ],
    popular: true,
  },
  {
    name: 'Elite',
    price: 900,
    icon: Crown,
    color: 'from-[#FFD700] to-[#FFA500]',
    shadowColor: 'shadow-[#FFD700]/30',
    borderColor: 'border-[#FFD700]/50',
    features: [
      'All Expert Features',
      'Alpha Bankers Cooperative',
      '1% Daily Vault Yield',
      'P2P Lending Access',
      'Full Royalty Engine',
      'VIP Priority Support',
    ],
    popular: false,
  },
];

export function TierShowcase() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Ambient Gold Orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.02) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 mb-6"
          >
            <Crown className="h-4 w-4 text-[#FFD700]" />
            <span className="text-sm font-medium text-[#FFD700]">One-Time Activation</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Choose Your <span className="text-[#FFD700]">Legendary</span> Path
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto mb-2"
          >
            One-time registration fee unlocks permanent access to the Alpha Ecosystem.
            No recurring charges. No hidden fees.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xs text-[#FFD700]/60 flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Click any card to reveal full details
          </motion.p>
        </div>

        {/* Legendary Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <LegendaryTierCard
              key={tier.name}
              {...tier}
              index={index}
            />
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          * Elite members require 3 direct EXPERT referrals to qualify for 1% Daily Vault Yield.
        </motion.p>
      </div>
    </section>
  );
}
