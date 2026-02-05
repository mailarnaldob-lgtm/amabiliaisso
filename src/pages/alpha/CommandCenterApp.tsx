 import { AlphaLayout } from '@/components/layouts/AlphaLayout';
 import { DualColumnCommandCenter } from '@/components/command';
 import { CommandCenterHeader } from '@/components/command/CommandCenterHeader';
 
 export default function CommandCenterApp() {
   return (
     <AlphaLayout 
       title="Command Center" 
       subtitle="High-Velocity Operations Hub"
     >
       {/* Welcome Header with User Info + Balance */}
       <CommandCenterHeader />
       
       {/* Main Dual-Column Interface */}
       <div className="mt-6">
         <DualColumnCommandCenter />
       </div>
       
       {/* System Flow Info */}
       <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
         <p className="text-xs text-muted-foreground text-center">
           The Command Center powers your Alpha Network velocity. 
           Missions update every 15 seconds. Campaigns deploy capital across the sovereign network.
         </p>
       </div>
     </AlphaLayout>
   );
 }
