import { ReactNode } from 'react';
import { SovereignBottomNav } from '@/components/navigation/SovereignBottomNav';
import { Settings, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Alpha Layout - V8.4
 * Uses Sovereign Bottom Navigation with 4 major icons
 */

interface AlphaLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  appColor?: string;
}

export function AlphaLayout({ children, title, subtitle }: AlphaLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header - 2026 Glassmorphism with Golden-Yellow Accent */}
      {title && (
        <header className="sticky top-0 z-40 border-b border-[#FFD700]/20 bg-card/95 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 h-16">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link to="/dashboard/transactions" className="p-2 rounded-lg hover:bg-[#FFD700]/10 transition-colors haptic-press relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFD700]" />
              </Link>
              <Link to="/dashboard/settings" className="p-2 rounded-lg hover:bg-[#FFD700]/10 transition-colors haptic-press">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="pb-28 px-4 py-6 relative z-10">
        {children}
      </main>

      {/* Sovereign Bottom Navigation - 4 Major Icons */}
      <SovereignBottomNav />
    </div>
  );
}