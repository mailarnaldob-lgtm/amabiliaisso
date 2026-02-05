 import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { useProfile } from '@/hooks/useProfile';
 import { useWallets } from '@/hooks/useWallets';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Crown, Zap, Star, Copy, CheckCheck, Eye, EyeOff, CreditCard, AlertTriangle } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
 import { cn, formatAlpha } from '@/lib/utils';
 
 /**
  * CommandCenterHeader - V9.0
  * Welcome header with user info, tier badge, referral code, and balance summary
  * Positioned at the top of the Command Center dashboard
  */
 
 export function CommandCenterHeader() {
   const { data: profile } = useProfile();
   const { totalBalance, isFallback } = useWallets();
   const { toast } = useToast();
   const [copied, setCopied] = useState(false);
   const [isHidden, setIsHidden] = useState(false);
 
   const canAccessElite = profile?.membership_tier === 'elite';
 
   const copyReferralCode = () => {
     if (profile?.referral_code) {
       navigator.clipboard.writeText(profile.referral_code);
       setCopied(true);
       toast({ title: 'Copied!', description: 'Partner code copied to clipboard' });
       setTimeout(() => setCopied(false), 2000);
     }
   };
 
   const getTierConfig = (tier: string | null) => {
     switch (tier) {
       case 'elite': return { icon: Crown, label: 'Elite', color: 'from-[#FFD700] to-[#FFA500]', textColor: 'text-[#FFD700]' };
       case 'expert': return { icon: Zap, label: 'Expert', color: 'from-primary to-primary/80', textColor: 'text-primary' };
       case 'pro': return { icon: Star, label: 'Pro', color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-400' };
       default: return { icon: Star, label: 'Inactive', color: 'from-muted to-muted', textColor: 'text-muted-foreground' };
     }
   };
 
   const tierConfig = getTierConfig(profile?.membership_tier || null);
   const TierIcon = tierConfig.icon;
 
   // Calculate daily yield (1% for Elite)
   const dailyYield = canAccessElite ? totalBalance * 0.01 : 0;
 
   return (
     <div className="space-y-4">
       {/* Activation CTA for Inactive Users */}
       {!profile?.membership_tier && (
         <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="p-4 rounded-xl border border-[#FFD700]/50 bg-gradient-to-r from-[#FFD700]/10 to-transparent"
         >
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FFD700]/30">
               <AlertTriangle className="h-5 w-5 text-black" />
             </div>
             <div className="flex-1">
               <h2 className="text-sm font-bold text-foreground">Account Activation Required</h2>
               <p className="text-xs text-muted-foreground">
                 Unlock missions, referral commissions, and P2P lending
               </p>
             </div>
             <Link to="/dashboard/upgrade" className="w-full sm:w-auto">
               <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold hover:opacity-90">
                 <CreditCard className="h-4 w-4" />
                 Activate
               </Button>
             </Link>
           </div>
         </motion.div>
       )}
 
       {/* Main Header Card */}
       <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="relative overflow-hidden rounded-xl border border-[#FFD700]/30 bg-card"
       >
         {/* Golden Gradient Top Section */}
         <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-4 relative">
           {/* Decorative Elements */}
           <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
           <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-black/10 blur-xl" />
 
           <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
             {/* Welcome + Tier */}
             <div className="flex items-center gap-3">
               <div className={cn(
                 "w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center shadow-lg"
               )}>
                 <TierIcon className="h-6 w-6 text-black" />
               </div>
               <div>
                 <h1 className="text-lg sm:text-xl font-bold text-black tracking-tight">
                   Welcome, {profile?.full_name?.split(' ')[0] || 'Member'}
                 </h1>
                 <Badge className="bg-black/20 text-black border-black/30 text-[10px]">
                   {tierConfig.label} Member
                 </Badge>
               </div>
             </div>
 
             {/* Balance Display */}
             <div className="flex items-center gap-3">
               <div className="text-right">
                 <p className="text-[10px] text-black/70 uppercase tracking-wide">Total Balance</p>
                 <div className="flex items-center gap-2">
                   <span className="text-2xl sm:text-3xl font-bold text-black font-mono tabular-nums">
                     ₳{isHidden ? '••••' : formatAlpha(totalBalance)}
                   </span>
                   <button 
                     onClick={() => setIsHidden(!isHidden)}
                     className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
                   >
                     {isHidden ? (
                       <EyeOff className="h-4 w-4 text-black/70" />
                     ) : (
                       <Eye className="h-4 w-4 text-black/70" />
                     )}
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
 
         {/* Bottom Section - Referral Code + Vault Yield */}
         <div className="p-3 bg-card border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
           {/* Referral Code */}
           {profile?.referral_code && (
             <button
               onClick={copyReferralCode}
               className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border hover:border-[#FFD700]/30 transition-colors"
             >
               <span className="text-[10px] text-muted-foreground">Partner Code:</span>
               <span className="font-mono font-bold text-[#FFD700] text-sm">{profile.referral_code}</span>
               {copied ? (
                 <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
               ) : (
                 <Copy className="h-3.5 w-3.5 text-muted-foreground" />
               )}
             </button>
           )}
 
           {/* Vault Yield Indicator */}
           <div className="flex items-center gap-2">
             {canAccessElite ? (
               <>
                 <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-[10px]">
                   1% DAILY YIELD
                 </Badge>
                 <span className="text-xs text-emerald-400">
                   +₳{formatAlpha(dailyYield)}/day
                 </span>
               </>
             ) : (
               <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">
                 Vault Locked
               </Badge>
             )}
           </div>
         </div>
       </motion.div>
     </div>
   );
 }