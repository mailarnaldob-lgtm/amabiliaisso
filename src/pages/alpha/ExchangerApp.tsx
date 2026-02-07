/**
 * ALPHA EXCHANGER APP - Full Sovereign Exchange Experience
 * 
 * Production-Ready Features:
 * - BUY ₳ (Cash-In): Convert PHP to Alpha Credits
 * - SELL ₳ (Cash-Out): Withdraw Alpha Credits to PHP
 * - Real-time 15-second polling for rates and history
 * - Interactive 3D Alpha Coins
 * - Cinematic Obsidian Black + Alpha Gold theme
 * - Split-view desktop / stacked mobile layout
 * - Glassmorphism containers with Bloom animations
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, History, TrendingUp, Shield, 
  ArrowUpToLine, ArrowDownToLine 
} from 'lucide-react';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useWallets } from '@/hooks/useWallets';
import { 
  AlphaCoin3D, 
  ExchangeRateDisplay, 
  ExchangeTransactionHistory,
  ExchangeFormPanel,
  CashOutFormPanel,
  CashOutTransactionHistory
} from '@/components/exchanger';
import { SovereignExchangerModal } from '@/components/alpha/SovereignExchangerModal';

export default function ExchangerApp() {
  const { totalBalance } = useWallets();
  const [exchangerModalOpen, setExchangerModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('buy');
  const [historyTab, setHistoryTab] = useState('deposits');
  
  const handleProceedToPayment = () => {
    setExchangerModalOpen(true);
  };
  
  return (
    <AlphaLayout 
      title="Alpha Exchanger" 
      subtitle="Sovereign Currency Exchange"
    >
      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#FFD700]/30"
            initial={{
              x: `${Math.random() * 100}%`,
              y: '100%',
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: '-10%',
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d] border border-[#FFD700]/20 backdrop-blur-2xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FFA500]/5 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />
        
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <AlphaCoin3D size="lg" showTooltip={false} />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                <span className="text-[#FFD700]">₳</span>LPHA EXCHANGER
              </h1>
              <p className="text-muted-foreground text-sm mb-4">
                Buy and Sell ₳ Credits seamlessly. Your sovereign gateway to the Alpha Ecosystem.
              </p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20">
                  <TrendingUp className="w-4 h-4 text-[#FFD700]" />
                  <span className="text-xs text-[#FFD700] font-medium">1:1 Fixed Rate</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Admin-Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />
      </div>
      
      {/* Exchange Rate Display */}
      <ExchangeRateDisplay 
        rate={1} 
        lastUpdated={new Date()} 
        className="mb-6"
      />
      
      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Exchange Forms */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d] border border-[#FFD700]/20 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />
          
          <div className="relative p-6">
            {/* Buy/Sell Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4 bg-[#0a0a0a] border border-[#FFD700]/20">
                <TabsTrigger 
                  value="buy"
                  className="data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700] gap-2"
                >
                  <ArrowUpToLine className="w-4 h-4" />
                  Buy ₳
                </TabsTrigger>
                <TabsTrigger 
                  value="sell"
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Sell ₳
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="buy" className="mt-0">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFD700]" />
                  Convert PHP to ₳
                </h2>
                <ExchangeFormPanel 
                  balance={totalBalance}
                  onProceed={handleProceedToPayment}
                />
              </TabsContent>
              
              <TabsContent value="sell" className="mt-0">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
                  Withdraw ₳ to PHP
                </h2>
                <CashOutFormPanel 
                  balance={totalBalance}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right: Transaction History */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d] border border-[#FFD700]/20 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />
          
          <div className="relative p-6">
            <Tabs value={historyTab} onValueChange={setHistoryTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4 bg-[#0a0a0a] border border-border/50">
                <TabsTrigger 
                  value="deposits"
                  className="data-[state=active]:bg-[#FFD700]/10 data-[state=active]:text-[#FFD700] gap-2"
                >
                  <History className="w-4 h-4" />
                  Deposits
                </TabsTrigger>
                <TabsTrigger 
                  value="withdrawals"
                  className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 gap-2"
                >
                  <History className="w-4 h-4" />
                  Withdrawals
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="deposits" className="mt-0">
                <ExchangeTransactionHistory maxItems={8} />
              </TabsContent>
              
              <TabsContent value="withdrawals" className="mt-0">
                <CashOutTransactionHistory maxItems={8} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-xl bg-[#050505]/50 border border-[#FFD700]/10"
      >
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-[#FFD700]" />
            <span>Alpha Sovereign Ledger v2.0</span>
          </div>
          <span>15s Polling • Admin-Verified • Account Details Masked</span>
        </div>
      </motion.div>
      
      {/* Exchanger Modal for Full Flow */}
      <SovereignExchangerModal 
        open={exchangerModalOpen} 
        onOpenChange={setExchangerModalOpen}
      />
    </AlphaLayout>
  );
}