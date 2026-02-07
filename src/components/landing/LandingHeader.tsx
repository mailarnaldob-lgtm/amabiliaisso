import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X, Home, LayoutDashboard, Key, ArrowLeftRight, Rocket, Megaphone, Landmark, Globe, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * LandingHeader V10.0 - Sovereign Prestige Navigation (Final Build)
 * 
 * Features:
 * - Obsidian Black (#050505) + Alpha Gold (#FFD700) glassmorphism
 * - Full navigation links: Home, Dashboard, Activate, Exchanger, Missions, Campaigns, Vault, MLM, Profile
 * - Bloom scale-down (0.95 → 1.0) + gold underline hover effects
 * - Fully responsive: Desktop expanded, Mobile burger menu
 * - Persistent FAB integration with auto-hide on mobile nav open
 */

// Navigation items with icons
const navItems = [
  { icon: Home, label: 'Home', href: '/', requiresAuth: false },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', requiresAuth: true },
  { icon: Key, label: 'Activate', href: '/dashboard/upgrade', requiresAuth: true },
  { icon: ArrowLeftRight, label: 'Exchanger', href: '/dashboard/exchanger', requiresAuth: true },
  { icon: Rocket, label: 'Missions', href: '/dashboard/market', requiresAuth: true },
  { icon: Megaphone, label: 'Campaigns', href: '/dashboard/ads', requiresAuth: true },
  { icon: Landmark, label: 'Vault', href: '/dashboard/finance', requiresAuth: true },
  { icon: Globe, label: 'MLM', href: '/dashboard/growth', requiresAuth: true },
  { icon: User, label: 'Profile', href: '/dashboard/settings', requiresAuth: true },
];

export function LandingHeader() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  // Scroll detection for enhanced header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter nav items based on auth status
  const visibleNavItems = navItems.filter(item => 
    !item.requiresAuth || (item.requiresAuth && user)
  );

  const handleAuthNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMobile) {
      e.preventDefault();
      window.open('/auth', '_blank', 'noopener,noreferrer');
    }
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Dispatch custom event when mobile menu opens/closes (for FAB integration)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobileNavToggle', { detail: { isOpen: isMenuOpen } }));
  }, [isMenuOpen]);

  return (
    <motion.header 
      className="sticky top-0 z-50"
      style={{
        background: isScrolled 
          ? 'hsl(220 23% 5% / 0.98)' 
          : 'hsl(220 23% 5% / 0.95)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid hsl(45 100% 51% / ${isScrolled ? '0.15' : '0.08'})`,
        boxShadow: isScrolled ? '0 4px 30px hsl(0 0% 0% / 0.3)' : 'none',
        transition: 'all 0.3s ease-out'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto py-3 lg:py-4 flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
              border: '1px solid hsl(45 100% 51% / 0.3)',
              boxShadow: '0 0 20px hsl(45 100% 51% / 0.2)'
            }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 0 30px hsl(45 100% 51% / 0.4)' 
            }}
            whileTap={{ scale: 0.95 }}
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
          <span 
            className="text-lg font-semibold tracking-[0.12em] text-foreground group-hover:text-[#FFD700] transition-colors duration-300 hidden sm:block"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            AMABILIA
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {visibleNavItems.slice(0, 5).map((item) => (
            <Link 
              key={item.label}
              to={item.href} 
              className="relative px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-300 group"
            >
              <motion.span 
                className="flex items-center gap-1.5"
                whileHover={{ scale: 0.95 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <item.icon className="w-3.5 h-3.5 text-[#FFD700]/70 group-hover:text-[#FFD700] transition-colors" />
                {item.label}
              </motion.span>
              <span 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] group-hover:w-full transition-all duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
              />
            </Link>
          ))}

          {/* More dropdown for additional items */}
          {visibleNavItems.length > 5 && (
            <div className="relative group">
              <button className="px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-1">
                More
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <motion.div 
                className="absolute top-full right-0 mt-2 w-48 py-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                style={{
                  background: 'hsl(220 23% 8% / 0.98)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid hsl(45 100% 51% / 0.2)',
                  boxShadow: '0 10px 40px hsl(0 0% 0% / 0.5)'
                }}
              >
                {visibleNavItems.slice(5).map((item) => (
                  <Link 
                    key={item.label}
                    to={item.href} 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-[#FFD700] hover:bg-[#FFD700]/5 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </motion.div>
            </div>
          )}

          {/* Divider */}
          <div 
            className="w-px h-6 mx-3"
            style={{ background: 'hsl(45 100% 51% / 0.2)' }}
          />

          {/* About & Contact */}
          <Link to="/about" className="relative px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-300 group">
            <span>About</span>
            <span 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] group-hover:w-full transition-all duration-300"
              style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
            />
          </Link>
          <Link to="/contact" className="relative px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-300 group">
            <span>Contact</span>
            <span 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] group-hover:w-full transition-all duration-300"
              style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
            />
          </Link>

          {/* Auth Buttons */}
          {!user ? (
            <>
              <Link to="/auth" onClick={handleAuthNavigation}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-[#FFD700] hover:bg-[#FFD700]/10 font-medium tracking-wide transition-all duration-300"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth" onClick={handleAuthNavigation}>
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    className="px-5 py-2 text-sm rounded-md font-semibold text-black tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      boxShadow: '0 0 20px hsl(45 100% 51% / 0.3), inset 0 1px 0 hsl(45 100% 80% / 0.3)'
                    }}
                  >
                    Access Portal
                  </Button>
                </motion.div>
              </Link>
            </>
          ) : (
            <Link to="/dashboard">
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button 
                  className="px-5 py-2 text-sm rounded-md font-semibold text-black tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    boxShadow: '0 0 20px hsl(45 100% 51% / 0.3), inset 0 1px 0 hsl(45 100% 80% / 0.3)'
                  }}
                >
                  Dashboard
                </Button>
              </motion.div>
            </Link>
          )}
        </nav>

        {/* Mobile Burger Menu Button */}
        <motion.button 
          className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-[#FFD700]/10 transition-colors duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-[#FFD700]" />
          ) : (
            <Menu className="h-6 w-6 text-muted-foreground" />
          )}
        </motion.button>
      </div>

      {/* Mobile Navigation Slide-in Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="lg:hidden overflow-hidden"
            style={{
              background: 'hsl(220 23% 5% / 0.98)',
              borderTop: '1px solid hsl(45 100% 51% / 0.08)'
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="container py-4 flex flex-col gap-2 px-4 max-h-[70vh] overflow-y-auto">
              {/* Primary CTA */}
              <Link to={user ? "/dashboard" : "/auth"} onClick={handleLinkClick}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <Button 
                    className="w-full py-4 text-base rounded-lg font-semibold text-black tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      boxShadow: '0 0 20px hsl(45 100% 51% / 0.3)'
                    }}
                  >
                    {user ? 'Go to Dashboard' : 'Access Portal'}
                  </Button>
                </motion.div>
              </Link>

              <div 
                className="h-px my-2"
                style={{ background: 'hsl(45 100% 51% / 0.1)' }}
              />

              {/* Navigation Links */}
              {visibleNavItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                >
                  <Link 
                    to={item.href} 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-[#FFD700]/5 transition-all duration-300"
                    onClick={handleLinkClick}
                  >
                    <item.icon className="w-5 h-5 text-[#FFD700]/70" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div 
                className="h-px my-2"
                style={{ background: 'hsl(45 100% 51% / 0.1)' }}
              />

              {/* Secondary Links */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <Link 
                  to="/about" 
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                  onClick={handleLinkClick}
                >
                  About
                </Link>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.28 }}
              >
                <Link 
                  to="/contact" 
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                  onClick={handleLinkClick}
                >
                  Contact
                </Link>
              </motion.div>

              {!user && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link 
                    to="/auth" 
                    className="flex items-center px-4 py-3 rounded-lg text-base font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                    onClick={handleAuthNavigation}
                  >
                    Login
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
