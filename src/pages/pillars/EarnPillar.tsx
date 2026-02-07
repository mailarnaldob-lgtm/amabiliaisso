import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Clock, Shield, Zap, Target, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * ₳ EARN — SOVEREIGN LABOR
 * Business Presentation Document
 */

export default function EarnPillar() {
  return (
    <div className="min-h-screen bg-[#050505] text-foreground overflow-x-hidden">
      {/* Watermark Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02] select-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 100px,
            rgba(255, 215, 0, 0.1) 100px,
            rgba(255, 215, 0, 0.1) 101px
          )`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[20vw] font-bold text-amber-400/[0.03] whitespace-nowrap rotate-[-15deg]">
            AMABILIA
          </span>
        </div>
      </div>

      {/* Luxury Header */}
      <header 
        className="sticky top-0 z-50 border-b border-amber-500/10"
        style={{
          background: 'linear-gradient(180deg, rgba(5, 5, 5, 0.98) 0%, rgba(5, 5, 5, 0.95) 100%)',
          backdropFilter: 'blur(40px)'
        }}
      >
        <div className="container mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-amber-400 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-mono text-xl">₳</span>
              <div>
                <h1 className="text-sm font-bold tracking-wider text-foreground">AMABILIA NETWORK</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Sovereign Whitepaper</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 container mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
              boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)'
            }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Briefcase className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="text-amber-400">₳</span> EARN
          </h1>
          <p className="text-xl sm:text-2xl text-emerald-400 font-medium mb-4">
            Sovereign Labor
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Convert your time and effort into the Alpha (₳) currency through verified missions.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-16">
          {/* Section 1: Purpose */}
          <motion.section
            className="rounded-2xl p-8 lg:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.03) 0%, transparent 100%)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
              backdropFilter: 'blur(40px)'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold">Purpose</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              The EARN pillar is the foundational gateway to the Alpha Ecosystem. It represents a paradigm shift 
              in how human effort is valued and compensated. Rather than exchanging time for deprecating fiat 
              currency, participants in the EARN system convert their verified labor directly into ₳—a sovereign 
              digital asset designed for long-term value retention.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg mt-4">
              Every mission completed through EARN is a micro-transaction in the global labor marketplace, 
              instantly compensating workers with liquid, transferable Alpha credits.
            </p>
          </motion.section>

          {/* Section 2: Mechanism */}
          <motion.section
            className="rounded-2xl p-8 lg:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.03) 0%, transparent 100%)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
              backdropFilter: 'blur(40px)'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold">Mechanism</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Real-Time Mission Control</h3>
                    <p className="text-sm text-muted-foreground">Live countdowns, instant task availability, and dynamic reward scaling.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Proof Verification</h3>
                    <p className="text-sm text-muted-foreground">Every submission undergoes multi-layer verification before reward release.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Sponsored Brand Rewards</h3>
                    <p className="text-sm text-muted-foreground">Direct partnership with global brands funding the mission pool.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Tier Scaling</h3>
                    <p className="text-sm text-muted-foreground">Higher membership tiers unlock premium missions with elevated rewards.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 3: Value Proposition */}
          <motion.section
            className="rounded-2xl p-8 lg:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.03) 0%, transparent 100%)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
              backdropFilter: 'blur(40px)'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold">Value Proposition</h2>
            </div>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Instant Liquidity:</strong> Earnings are credited immediately upon approval, with no waiting periods or withdrawal delays.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Effort-Based Valuation:</strong> Your reward is proportional to the complexity and value of the task, ensuring fair compensation.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Global Accessibility:</strong> Anyone with internet access can participate, democratizing income generation across borders.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Portfolio Diversification:</strong> Earned ₳ can be saved for yield, traded, or reinvested into the MLM network.</span>
              </li>
            </ul>
          </motion.section>

          {/* Section 4: Role in the Ecosystem */}
          <motion.section
            className="rounded-2xl p-8 lg:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              backdropFilter: 'blur(40px)'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-6 text-emerald-400">Role in the Alpha Ecosystem</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              EARN is the economic engine that powers the entire Alpha Ecosystem. It is the primary on-ramp 
              for new participants, converting their initial effort into the ₳ currency that fuels all other 
              pillars. Without EARN, there is no capital flow. It is the heartbeat of sovereign labor.
            </p>
            <div className="mt-8 p-6 rounded-xl bg-[#050505]/50 border border-amber-500/20">
              <p className="text-center text-amber-400 font-medium">
                "Labor is the first currency. Alpha is its perfected form."
              </p>
            </div>
          </motion.section>
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link to="/auth">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-lg font-semibold"
            >
              Start Earning ₳ Now
            </Button>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-500/10 py-8">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Amabilia Alpha Ecosystem. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
