import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BOTTOM_NAV_ITEMS } from '@/lib/navSections';
import { EarnHubOverlay } from '@/components/earn';
import { MLMHubOverlay } from '@/components/mlm';
import { SaveVaultOverlay } from '@/components/vault';

/**
 * AppSwitcher - V12.0
 * Four-pillar bottom navigation using centralized constants
 * EARN, SAVE, and MLM open as full-screen overlays; TRADE navigates
 * Source: src/lib/navSections.ts
 */

export function AppSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const [earnOverlayOpen, setEarnOverlayOpen] = useState(false);
  const [saveOverlayOpen, setSaveOverlayOpen] = useState(false);
  const [mlmOverlayOpen, setMlmOverlayOpen] = useState(false);

  const getCurrentApp = () => {
    for (const app of BOTTOM_NAV_ITEMS) {
      if (location.pathname.startsWith(app.path)) {
        return app.id;
      }
    }
    return 'earn'; // Default
  };

  const currentApp = getCurrentApp();

  const handleAppClick = (app: typeof BOTTOM_NAV_ITEMS[number]) => {
    if (app.id === 'earn') {
      setEarnOverlayOpen(true);
    } else if (app.id === 'save') {
      setSaveOverlayOpen(true);
    } else if (app.id === 'mlm') {
      setMlmOverlayOpen(true);
    } else {
      navigate(app.path);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
          {BOTTOM_NAV_ITEMS.map((app) => {
            const isActive = currentApp === app.id || 
              (app.id === 'earn' && earnOverlayOpen) ||
              (app.id === 'save' && saveOverlayOpen) ||
              (app.id === 'mlm' && mlmOverlayOpen);
            const Icon = app.icon;
            
            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full py-2 rounded-xl transition-all duration-200',
                  isActive 
                    ? 'scale-105 text-[#FFD700]' 
                    : 'text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100'
                )}
              >
                <div 
                  className={cn(
                    'p-2 rounded-xl mb-1 transition-all duration-200',
                    isActive 
                      ? `bg-gradient-to-br ${app.color} shadow-lg` 
                      : 'bg-muted/50'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    isActive ? 'text-white' : 'text-muted-foreground'
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'text-[#FFD700] font-semibold' : 'text-muted-foreground'
                )}>
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* EARN Hub Full-Screen Overlay */}
      <EarnHubOverlay 
        isOpen={earnOverlayOpen} 
        onClose={() => setEarnOverlayOpen(false)} 
      />

      {/* SAVE Vault Full-Screen Overlay */}
      <SaveVaultOverlay 
        isOpen={saveOverlayOpen} 
        onClose={() => setSaveOverlayOpen(false)} 
      />

      {/* MLM Hub Full-Screen Overlay */}
      <MLMHubOverlay 
        isOpen={mlmOverlayOpen} 
        onClose={() => setMlmOverlayOpen(false)} 
      />
    </>
  );
}

export { BOTTOM_NAV_ITEMS as appSections };
