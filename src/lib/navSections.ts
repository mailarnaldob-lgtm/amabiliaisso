 /**
  * SOVEREIGN NAVIGATION CONSTANTS - V10.0
  * Centralized four-pillar app taxonomy as per Blueprint V8.0
  * 
  * TERMINOLOGY STANDARD:
  * - EARN: Task Earnings (maps to Bank functions - /dashboard/bank)
  * - SAVE: Vault Savings (maps to VPA Missions - /dashboard/market)
  * - TRADE: P2P Trading (maps to Finance/Lending - /dashboard/finance)
  * - MLM: Referral Network (maps to Growth - /dashboard/growth)
  * 
  * This file is the SINGLE SOURCE OF TRUTH for all navigation labels.
  * All navigation components MUST import from here to prevent drift.
  */
 
 import { Landmark, Target, TrendingUp, Users, Crown, Megaphone, Wallet, ArrowUpDown, Send, ArrowRightLeft, ArrowLeftRight } from 'lucide-react';
 
// Core four-pillar taxonomy
export const APP_PILLARS = {
  EARN: {
    id: 'earn',
    name: 'EARN',
    description: 'Task Earnings',
    path: '/dashboard/bank',
    icon: Landmark,
    color: 'from-amber-500 to-orange-600',
    isOverlay: true, // Opens as full-screen overlay instead of navigation
  },
  SAVE: {
    id: 'save',
    name: 'SAVE',
    description: 'Vault Savings',
    path: '/dashboard/market',
    icon: Target,
    color: 'from-emerald-500 to-teal-600',
    isOverlay: true, // Opens as full-screen Cinematic Vault overlay
  },
  TRADE: {
    id: 'trade',
    name: 'TRADE',
    description: 'Buy & Sell ₳',
    path: '/dashboard/exchanger',
    icon: ArrowLeftRight,
    color: 'from-[#FFD700] to-[#FFA500]',
    isOverlay: false,
    comingSoon: false,
  },
  MLM: {
    id: 'mlm',
    name: 'MLM',
    description: 'Referral Network',
    path: '/dashboard/growth',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
    isOverlay: true, // Opens as full-screen overlay
  },
} as const;
 
 // Bottom navigation items (for AppSwitcher, BottomNav, SovereignBottomNav)
 export const BOTTOM_NAV_ITEMS = [
   APP_PILLARS.EARN,
   APP_PILLARS.SAVE,
   APP_PILLARS.TRADE,
   APP_PILLARS.MLM,
 ];
 
 // Floating Alpha Hub items (AlphaCoinHub)
 export const ALPHA_HUB_ITEMS = [
   {
     icon: Wallet,
     label: 'EARN Hub',
     description: 'Task Earnings',
     href: '/dashboard/bank',
     color: 'from-[#FFD700] to-[#FFA500]',
   },
   {
     icon: ArrowRightLeft,
     label: 'Exchanger',
     description: 'Buy/Sell ₳ Credits',
     href: '/dashboard/exchanger',
     color: 'from-[#FFD700] to-[#FFA500]',
   },
   {
     icon: Send,
     label: 'Money Transfer',
     description: '3-step banking flow',
     href: '/dashboard/bank',
     color: 'from-blue-400 to-blue-600',
   },
   {
     icon: Target,
     label: 'SAVE Hub',
     description: 'Vault Savings',
     href: '/dashboard/market',
     color: 'from-purple-400 to-purple-600',
   },
    {
      icon: ArrowLeftRight,
      label: 'TRADE Hub',
      description: 'Buy & Sell ₳',
      href: '/dashboard/exchanger',
      color: 'from-[#FFD700] to-[#FFA500]',
      comingSoon: false,
    },
   {
     icon: Megaphone,
     label: 'MLM Hub',
     description: 'Referral Network',
     href: '/dashboard/growth',
     color: 'from-orange-400 to-red-500',
   },
 ];
 
 // Bloom menu primary items
 export const BLOOM_PRIMARY_ITEMS = [
   {
     icon: Target,
     label: 'Mission Control',
     sublabel: 'Mission Control Center',
     path: '/dashboard',
     color: 'from-[#FFD700] to-[#FFA500]',
   },
   {
     icon: ArrowRightLeft,
     label: 'Exchanger',
     sublabel: 'Buy/Sell ₳ Credits',
     path: '/dashboard/exchanger',
     color: 'from-[#FFD700] to-[#B8860B]',
   },
   {
     icon: Landmark,
     label: 'ABC Vault',
     sublabel: 'Alpha Bankers Cooperative',
     path: '/dashboard/finance',
     color: 'from-blue-500 to-blue-600',
   },
   {
     icon: Megaphone,
     label: 'Traffic Engine',
     sublabel: 'Traffic Intelligence Engine',
     path: '/dashboard/ads',
     color: 'from-emerald-500 to-emerald-600',
     badge: 'PRO+',
   },
   {
     icon: Users,
     label: 'Profile',
     sublabel: 'Account & Identity',
     path: '/dashboard/profile',
     color: 'from-purple-500 to-purple-600',
   },
 ];
 
 // Bloom menu secondary items (quick access)
 export const BLOOM_SECONDARY_ITEMS = [
  { icon: TrendingUp, label: 'EARN', sublabel: 'Task Earnings', path: '/dashboard/bank', color: 'from-amber-500 to-orange-600' },
  { icon: Target, label: 'SAVE', sublabel: 'Vault Savings', path: '/dashboard/market', color: 'from-emerald-500 to-teal-600' },
  { icon: ArrowLeftRight, label: 'TRADE', sublabel: 'Buy & Sell ₳', path: '/dashboard/exchanger', color: 'from-[#FFD700] to-[#FFA500]' },
  { icon: Crown, label: 'MLM', sublabel: 'Referral Network', path: '/dashboard/growth', color: 'from-purple-500 to-pink-600' },
 ];
 
 // Dashboard hero navigation cards
 export const DASHBOARD_HERO_CARDS = [
   {
     icon: Target,
     label: 'EARN',
     fullLabel: 'EARN TASK REWARDS',
     description: 'VPA Missions',
     path: '/dashboard/market',
     gradient: 'from-emerald-500 to-teal-600',
     shadowColor: 'shadow-emerald-500/30',
   },
    {
      icon: ArrowLeftRight,
      label: 'TRADE',
      fullLabel: 'ALPHA EXCHANGER',
      description: 'Buy & Sell ₳',
      path: '/dashboard/exchanger',
      gradient: 'from-[#FFD700] to-[#FFA500]',
      shadowColor: 'shadow-[#FFD700]/30',
    },
   {
     icon: Users,
     label: 'MLM',
     fullLabel: 'ROYALTY NETWORK',
     description: 'Referral Network',
     path: '/dashboard/growth',
     gradient: 'from-purple-500 to-pink-600',
     shadowColor: 'shadow-purple-500/30',
   },
   {
     icon: TrendingUp,
     label: 'SAVE',
     fullLabel: 'VAULT SAVINGS',
     description: 'Secure Holdings',
     path: '/dashboard/bank',
     gradient: 'from-blue-500 to-indigo-600',
     shadowColor: 'shadow-blue-500/30',
   },
 ];
 
 // Sidebar navigation sections
 export const SIDEBAR_NAV_SECTIONS = [
   {
     title: 'Main',
     items: [
       { icon: Target, label: 'Command Center', path: '/dashboard', description: 'Your primary dashboard' },
       { icon: ArrowRightLeft, label: 'Exchanger', path: '/dashboard/exchanger', description: 'Buy/Sell ₳ Credits' },
     ],
   },
   {
     title: 'Apps',
     items: [
        { icon: TrendingUp, label: 'EARN', path: '/dashboard/bank', description: 'Task Earnings' },
        { icon: Target, label: 'SAVE', path: '/dashboard/market', description: 'Vault Savings' },
        { icon: ArrowLeftRight, label: 'TRADE', path: '/dashboard/exchanger', description: 'Buy & Sell ₳' },
        { icon: Users, label: 'MLM', path: '/dashboard/growth', description: 'Referral Network' },
       { icon: Crown, label: 'Ad Wizard', path: '/dashboard/ads', description: 'Create ad campaigns', badge: 'PRO+' },
     ],
   },
   {
     title: 'Account',
     items: [
       { icon: Users, label: 'Partner Network', path: '/dashboard/referrals', description: 'Manage your referrals' },
     ],
   },
 ];

// ============================================
// DESIGN SYSTEM: ALPHA GOLD ACCENT COLORS
// ============================================
// Primary Gold: #FFD700 (Alpha Gold)
// Secondary Gold: #FFA500 (Amber accent)
// Gold gradient: from-[#FFD700] to-[#FFA500]
// 
// Usage Guidelines:
// - Active nav items: text-[#FFD700]
// - Active indicators: bg-[#FFD700]
// - Hover states: hover:bg-[#FFD700]/10, hover:border-[#FFD700]/30
// - Shadows: shadow-[#FFD700]/20 or shadow-[#FFD700]/30
// - Badges: border-[#FFD700]/30 text-[#FFD700]
// - Gradients: bg-gradient-to-br from-[#FFD700] to-[#FFA500]
// ============================================