import { motion, useScroll, useTransform } from 'framer-motion';
import { Wallet, TrendingUp, Users, Zap, BarChart3, Shield } from 'lucide-react';
import { useRef } from 'react';

const features = [
  {
    icon: Wallet,
    title: "Triple Wallet System",
    description: "Task, Royalty, and Main wallets for organized earnings with real-time balance syncing."
  },
  {
    icon: TrendingUp,
    title: "P2P Lending Protocol",
    description: "Autonomous peer-to-peer lending with configurable terms and automated escrow."
  },
  {
    icon: Users,
    title: "Referral Engine",
    description: "50% commission on every membership with multi-tier tracking and instant payouts."
  },
  {
    icon: Zap,
    title: "Mission Economy",
    description: "Incentivized task completion with verified proof submission and instant rewards."
  },
  {
    icon: BarChart3,
    title: "Liquidity Exchange",
    description: "High-velocity cash-in/cash-out with multiple payment method integrations."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, row-level security, and comprehensive audit trails."
  }
];

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  index 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  index: number;
}) {
  return (
    <motion.div
      className="group relative p-6 rounded-lg overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 100%)',
        border: '1px solid hsl(220 23% 20% / 0.5)'
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        borderColor: 'hsl(45 100% 51% / 0.4)',
        boxShadow: '0 25px 50px hsl(0 0% 0% / 0.4), 0 0 40px hsl(45 100% 51% / 0.15)'
      }}
    >
      {/* Hover Glow Effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/0"
        initial={{ opacity: 0 }}
        whileHover={{ 
          opacity: 1,
          background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.08) 0%, transparent 50%, transparent 100%)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Corner accent */}
      <motion.div
        className="absolute top-0 right-0 w-16 h-16"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, hsl(45 100% 51% / 0.1) 50%)'
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10 flex items-start gap-4">
        <motion.div 
          className="p-3 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.1) 0%, hsl(45 100% 51% / 0.05) 100%)',
            border: '1px solid hsl(45 100% 51% / 0.2)'
          }}
          whileHover={{ scale: 1.15, rotate: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icon className="h-5 w-5 text-amber-400" />
        </motion.div>
        <div>
          <motion.h3 
            className="font-semibold text-foreground mb-2 transition-colors duration-300"
            whileHover={{ color: 'hsl(45 100% 51%)' }}
          >
            {title}
          </motion.h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Bottom line animation */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400/50 via-amber-400 to-amber-400/50"
        initial={{ width: 0, opacity: 0 }}
        whileHover={{ width: '100%', opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export function FeaturesGrid() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  
  return (
    <section ref={containerRef} className="py-20 sm:py-28 px-6 lg:px-8 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ y }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Infrastructure <span className="text-amber-400">Components</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Built for scale. Designed for growth. Engineered for the global individual.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
