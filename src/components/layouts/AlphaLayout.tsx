import { ReactNode } from 'react';
import { AppSwitcher } from '@/components/navigation/AppSwitcher';
import { Settings, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlphaLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  appColor?: string;
}

export function AlphaLayout({ children, title, subtitle, appColor = 'from-primary to-primary' }: AlphaLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header - 2026 Glassmorphism with sharp corners */}
      {title && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 h-16">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-primary`} />
                <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded hover:bg-muted/50 transition-colors haptic-press">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </button>
              <Link to="/dashboard/settings" className="p-2 rounded hover:bg-muted/50 transition-colors haptic-press">
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

      {/* App Switcher Navigation */}
      <AppSwitcher />
    </div>
  );
}
