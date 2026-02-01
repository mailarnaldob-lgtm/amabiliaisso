import { ReactNode } from 'react';
import { BottomNav } from '@/components/navigation/BottomNav';

interface MemberLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function MemberLayout({ children, title }: MemberLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header - 2026 Glassmorphism */}
      {title && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="pb-24 px-4 py-6 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
