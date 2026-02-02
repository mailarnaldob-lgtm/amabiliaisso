import { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { initAdminSession, getAdminInfoSync } from '@/lib/adminSession';
import { AdminSidebar } from './AdminSidebar';

interface AdminPageWrapperProps {
  children: (props: { adminInfo: { id: string; email: string; role: string } | null }) => ReactNode;
  title: string;
  description: string;
}

export function AdminPageWrapper({ children, title, description }: AdminPageWrapperProps) {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ id: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const isAdmin = await initAdminSession();
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      setAdminInfo(getAdminInfoSync());
      setIsInitialized(true);
    };
    init();
  }, [navigate]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        <div className="bg-atmosphere" />
        <div className="text-center space-y-4 relative z-10">
          <div className="relative">
            <Shield className="w-16 h-16 text-primary mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          </div>
          <div className="space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-sm font-mono text-muted-foreground tracking-wider">VALIDATING SOVEREIGN ACCESS...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Background Atmosphere - separate element with pointer-events-none */}
      <div className="bg-atmosphere" />
      
      <AdminSidebar adminInfo={adminInfo} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header with glassmorphism */}
        <header className="sticky top-0 z-10 border-b border-primary/10 bg-background/80 backdrop-blur-xl">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-8">
          {children({ adminInfo })}
        </div>
      </main>
    </div>
  );
}
