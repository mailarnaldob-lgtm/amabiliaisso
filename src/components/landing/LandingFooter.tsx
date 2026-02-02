import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function LandingFooter() {
  return (
    <footer 
      className="py-12 px-6 lg:px-8"
      style={{
        borderTop: '1px solid hsl(45 100% 51% / 0.1)'
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                border: '1px solid hsl(45 100% 51% / 0.2)'
              }}
            >
              <span 
                className="font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                ₳
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Amabilia Network © 2026
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
