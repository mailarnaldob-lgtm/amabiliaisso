import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Users, Zap, BarChart3, Shield } from 'lucide-react';

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
      className="group relative p-6 rounded-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 100%)',
        border: '1px solid hsl(220 23% 20% / 0.5)'
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        borderColor: 'hsl(45 100% 51% / 0.3)',
        boxShadow: '0 20px 40px hsl(0 0% 0% / 0.3), 0 0 30px hsl(45 100% 51% / 0.1)'
      }}
    >
      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/0 group-hover:from-amber-400/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500" />
      
      <div className="relative z-10 flex items-start gap-4">
        <motion.div 
          className="p-3 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.1) 0%, hsl(45 100% 51% / 0.05) 100%)',
            border: '1px solid hsl(45 100% 51% / 0.2)'
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon className="h-5 w-5 text-amber-400" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-foreground mb-2 group-hover:text-amber-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesGrid() {
  return (
    <section className="py-20 sm:py-28 px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Infrastructure <span className="text-amber-400">Components</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for scale. Designed for growth. Engineered for the global individual.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
