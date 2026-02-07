import { motion } from 'framer-motion';
import { ArrowLeft, Network, Users, TrendingUp, Shield, Layers, Crown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * ₳ MLM — SOVEREIGN NETWORK
 * Business Presentation Document
 */

export default function MLMPillar() {
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
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)'
            }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Network className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="text-amber-400">₳</span> MLM
          </h1>
          <p className="text-xl sm:text-2xl text-purple-400 font-medium mb-4">
            Sovereign Network
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Build your legacy and earn multi-generational royalties from your global network.
          </p>
        </motion.div>

        {/* Commission Highlight */}
        <motion.div
          className="rounded-2xl p-8 mb-16"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            backdropFilter: 'blur(40px)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <span className="text-4xl font-mono font-bold text-purple-400">50%</span>
              <p className="text-sm text-muted-foreground mt-1">Direct Referral Commission</p>
            </div>
            <div>
              <span className="text-4xl font-mono font-bold text-purple-400">10%</span>
              <p className="text-sm text-muted-foreground mt-1">Level 1 & 2 VPA Overrides</p>
            </div>
            <div>
              <span className="text-4xl font-mono font-bold text-purple-400">∞</span>
              <p className="text-sm text-muted-foreground mt-1">Network Depth Potential</p>
            </div>
          </div>
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
              <Crown className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold">Purpose</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              The MLM pillar is the network multiplication layer of the Alpha Ecosystem. It transforms 
              individual participants into team builders and leaders, creating a cascading structure 
              where everyone benefits from collective growth. This is not just referral marketing—it 
              is the construction of a sovereign wealth network.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg mt-4">
              By building and nurturing your downline, you create streams of passive royalty income 
              that persist and compound over time.
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
              <Layers className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold">Mechanism</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">50% Direct Commission</h3>
                    <p className="text-sm text-muted-foreground">Earn 50% of every upgrade fee from your direct referrals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">10% VPA Overrides</h3>
                    <p className="text-sm text-muted-foreground">Earn 10% of mission earnings from Level 1 & 2 downlines (EXPERT+).</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Recursive Rewards</h3>
                    <p className="text-sm text-muted-foreground">Every tier upgrade in your network triggers commission payouts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Network className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Real-Time Distribution</h3>
                    <p className="text-sm text-muted-foreground">Royalties are credited instantly via the Amabilia Ledger.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tier Breakdown */}
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
              <Crown className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold">Tier Commission Structure</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-500/20">
                    <th className="text-left py-3 text-muted-foreground font-medium">Tier</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Entry Fee</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Direct Bonus</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Passive Overrides</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  <tr className="border-b border-amber-500/10">
                    <td className="py-3 font-medium">PRO</td>
                    <td className="py-3 font-mono text-amber-400">₳ 300</td>
                    <td className="py-3 font-mono">₳ 150 (50%)</td>
                    <td className="py-3 text-muted-foreground">None</td>
                  </tr>
                  <tr className="border-b border-amber-500/10">
                    <td className="py-3 font-medium">EXPERT</td>
                    <td className="py-3 font-mono text-amber-400">₳ 600</td>
                    <td className="py-3 font-mono">₳ 300 (50%)</td>
                    <td className="py-3">10% Lvl 1 & 2</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-purple-400">ELITE</td>
                    <td className="py-3 font-mono text-amber-400">₳ 900</td>
                    <td className="py-3 font-mono">₳ 450 (50%)</td>
                    <td className="py-3">Full Passive + Vault</td>
                  </tr>
                </tbody>
              </table>
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
                <span><strong className="text-foreground">Residual Income:</strong> Build once, earn forever. Your network continues generating royalties without ongoing effort.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Team Leverage:</strong> Your success multiplies through the success of those you bring into the ecosystem.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Leadership Path:</strong> Progress from PRO to ELITE by building and mentoring your network.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Transparent Tracking:</strong> View your entire genealogy tree and real-time commission flow in the dashboard.</span>
              </li>
            </ul>
          </motion.section>

          {/* Section 4: Role in the Ecosystem */}
          <motion.section
            className="rounded-2xl p-8 lg:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, transparent 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              backdropFilter: 'blur(40px)'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Role in the Alpha Ecosystem</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              MLM is the growth engine that expands the Alpha Ecosystem organically. Every new member 
              brought in by a referrer becomes a potential recruiter themselves, creating exponential 
              network effects. This decentralized recruitment model ensures sustainable growth without 
              reliance on centralized marketing budgets.
            </p>
            <div className="mt-8 p-6 rounded-xl bg-[#050505]/50 border border-amber-500/20">
              <p className="text-center text-amber-400 font-medium">
                "Your network is your net worth."
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
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold"
            >
              Build Your Network
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
