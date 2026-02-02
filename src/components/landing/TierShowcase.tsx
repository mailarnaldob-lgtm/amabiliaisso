import { motion } from 'framer-motion';
import { Star, Zap, Crown, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Tier Showcase - SOVEREIGN BRANDING V8.7
 * One-time activation fees per Blueprint V8.7
 * PRO: ₱300, EXPERT: ₱600, ELITE: ₱900
 * 1% DAILY vault yield for Elite
 */

const tiers = [{
  name: 'Pro',
  price: 300,
  icon: Star,
  color: 'from-emerald-500 to-teal-600',
  shadowColor: 'shadow-emerald-500/20',
  borderColor: 'border-emerald-500/30',
  features: ['Full VPA Mission Access', '50% Referral Commission', 'Omni-Transfer Engine', 'Alpha Mobile Dashboard'],
  popular: false
}, {
  name: 'Expert',
  price: 600,
  icon: Zap,
  color: 'from-blue-500 to-indigo-600',
  shadowColor: 'shadow-blue-500/20',
  borderColor: 'border-blue-500/30',
  features: ['All Pro Features', 'Ad Wizard Professional', 'Priority Mission Queue', '10% Network Overrides (Lvl 1-2)', '15,000 ₳ Daily Transfer Limit'],
  popular: true
}, {
  name: 'Elite',
  price: 900,
  icon: Crown,
  color: 'from-[#FFD700] to-[#FFA500]',
  shadowColor: 'shadow-[#FFD700]/30',
  borderColor: 'border-[#FFD700]/50',
  features: ['All Expert Features', 'Alpha Bankers Cooperative', '1% Daily Vault Yield', 'P2P Lending Access', 'Full Royalty Engine', 'Priority Support'],
  popular: false
}];

export function TierShowcase() {
  return <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background text-primary" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 mb-6">
            <Crown className="h-4 w-4 text-[#FFD700]" />
            <span className="text-sm font-medium text-[#FFD700]">One-Time Activation</span>
          </motion.div>
          
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your <span className="text-[#FFD700]">Sovereign</span> Level
          </motion.h2>
          
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }} className="text-muted-foreground max-w-2xl mx-auto">
            One-time registration fee unlocks permanent access to the Alpha Ecosystem.
            No recurring charges. No hidden fees.
          </motion.p>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => <motion.div key={tier.name} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.15
        }} className={cn('relative rounded-2xl p-6 bg-card border transition-all duration-300', 'hover:-translate-y-2', tier.borderColor, tier.popular && 'ring-2 ring-[#FFD700]/50')}>
              {/* Popular Badge */}
              {tier.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black font-bold px-4">
                  MOST POPULAR
                </Badge>}

              {/* Icon */}
              <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', `bg-gradient-to-br ${tier.color}`, 'shadow-lg', tier.shadowColor)}>
                <tier.icon className="h-7 w-7 text-white" />
              </div>

              {/* Name & Price */}
              <h3 className="text-xl font-bold mb-1 text-primary">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-[#FFD700] font-mono">₱{tier.price}</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>)}
              </ul>

              {/* CTA */}
              <Link to="/auth" className="block">
                <Button className={cn('w-full gap-2 font-bold transition-all', tier.name === 'Elite' ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90' : 'bg-muted hover:bg-muted/80 text-foreground')}>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>)}
        </div>

        {/* Footnote */}
        <motion.p initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.5
      }} className="text-center text-xs text-muted-foreground mt-8">
          * Elite members require 3 direct EXPERT referrals to qualify for 1% Daily Vault Yield.
        </motion.p>
      </div>
    </section>;
}
