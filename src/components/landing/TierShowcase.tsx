import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const tiers = [
  {
    label: 'Commission Rate',
    value: '50%',
    sublabel: 'Per referral'
  },
  {
    label: 'Service Maintenance',
    value: '₱300',
    sublabel: 'Monthly'
  },
  {
    label: 'Wallet Types',
    value: '3',
    sublabel: 'Task, Royalty, Main'
  },
  {
    label: 'P2P Lending',
    value: '3%',
    sublabel: 'Weekly yield'
  }
];

export function TierShowcase() {
  return (
    <section className="py-20 sm:py-28 px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card 
                className="border-0 overflow-hidden group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 100%)'
                }}
              >
                <CardContent className="p-6 text-center relative">
                  {/* Hover Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
                  </div>
                  
                  <motion.p 
                    className="text-3xl sm:text-4xl font-bold font-mono mb-2 relative z-10"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 40px hsl(45 100% 51% / 0.3)'
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm font-medium text-foreground mb-1 relative z-10">{stat.label}</p>
                  <p className="text-xs text-muted-foreground relative z-10">{stat.sublabel}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
