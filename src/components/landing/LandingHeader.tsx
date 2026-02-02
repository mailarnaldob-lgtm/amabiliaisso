import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function LandingHeader() {
  return (
    <motion.header 
      className="sticky top-0 z-50"
      style={{
        background: 'hsl(220 23% 5% / 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid hsl(45 100% 51% / 0.1)'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-4 flex items-center justify-between px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
              border: '1px solid hsl(45 100% 51% / 0.3)',
              boxShadow: '0 0 20px hsl(45 100% 51% / 0.2)'
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsl(45 100% 51% / 0.4)' }}
          >
            <span 
              className="font-bold text-lg"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              ₳
            </span>
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-amber-400 transition-colors">
            Amabilia
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10"
            >
              Login
            </Button>
          </Link>
          <Link to="/auth">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="px-6 py-2 text-sm rounded-lg font-semibold text-black"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 0 20px hsl(45 100% 51% / 0.3)'
                }}
              >
                Access Portal
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
