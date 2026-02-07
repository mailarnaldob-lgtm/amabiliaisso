import { motion } from 'framer-motion';
import { ArrowLeft, ArrowLeftRight, Globe, Shield, Zap, Clock, Sparkles, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * ₳ TRADE — SOVEREIGN LIQUIDITY
 * Business Presentation Document
 */

export default function TradePillar() {
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
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 20px 60px rgba(255, 215, 0, 0.3)'
            }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ArrowLeftRight className="h-10 w-10 text-black" />
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-amber-400">₳</span> TRADE
            </h1>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              COMING SOON
            </Badge>
          </div>
          <p className="text-xl sm:text-2xl text-amber-400 font-medium mb-4">
            Sovereign Liquidity
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Seamlessly convert your accumulated Alpha (₳) into fiat currency through the Alpha Exchanger.
          </p>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          className="rounded-2xl p-8 mb-16 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(40px)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-amber-400 mb-2">ALPHA EXCHANGER</h3>
          <p className="text-muted-foreground">The sovereign gateway from digital to physical wealth</p>
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
              <Globe className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold">Purpose</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              The TRADE pillar completes the sovereign financial cycle. While EARN generates ₳ and SAVE 
              compounds it, TRADE enables the final transformation: converting your digital Alpha holdings 
              into spendable fiat currency. This is the off-ramp that connects the Alpha Ecosystem to the 
              traditional financial world.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg mt-4">
              The Alpha Exchanger is designed to operate with institutional-grade liquidity, ensuring 
              fast, reliable conversions without slippage or hidden fees.
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
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <ArrowLeftRight className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">1:1 Exchange Rate</h3>
                    <p className="text-sm text-muted-foreground">₳ 1.00 = ₱ 1.00 (PHP). Transparent, fixed-rate conversion.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">1–24 Hour Processing</h3>
                    <p className="text-sm text-muted-foreground">External transfers processed within one business day.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Building className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Multiple Channels</h3>
                    <p className="text-sm text-muted-foreground">Support for GCash, Maya, and major Philippine banks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Flat Fee Structure</h3>
                    <p className="text-sm text-muted-foreground">₳ 15 flat fee for external transfers. No percentage cuts.</p>
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
                <span><strong className="text-foreground">Real-World Utility:</strong> Your earned ₳ translates directly into spendable money for bills, purchases, or savings.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Price Stability:</strong> The 1:1 PHP peg eliminates volatility, ensuring predictable value.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Transparent Fees:</strong> No hidden costs or variable spreads. What you see is what you get.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-mono">₳</span>
                <span><strong className="text-foreground">Audit Trail:</strong> Every conversion is logged on the Sovereign Ledger for full transparency.</span>
              </li>
            </ul>
          </motion.section>

          {/* Section 4: Role in the Ecosystem */}
          <motion.section
            className="rounded-2xl p-8 lg:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, transparent 100%)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              backdropFilter: 'blur(40px)'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-6 text-amber-400">Role in the Alpha Ecosystem</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              TRADE is the bridge between the digital Alpha economy and the physical world. It validates 
              the entire ecosystem by proving that ₳ is not just a number on a screen—it is convertible 
              wealth. The existence of a reliable off-ramp builds trust, attracts new participants, and 
              establishes ₳ as a legitimate medium of exchange.
            </p>
            <div className="mt-8 p-6 rounded-xl bg-[#050505]/50 border border-amber-500/20">
              <p className="text-center text-amber-400 font-medium">
                "Digital labor, physical freedom."
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
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black px-8 py-6 text-lg font-semibold"
            >
              Get Notified at Launch
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
