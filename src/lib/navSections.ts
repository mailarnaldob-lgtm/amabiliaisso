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
 
 import { Landmark, Target, TrendingUp, Users, Crown, Megaphone, Wallet, ArrowLeftRight } from 'lucide-react';
 
// Core four-pillar taxonomy - V12.0 FINAL
export const APP_PILLARS = {
  EARN: {
    id: 'earn',
    name: 'EARN',
    description: 'Task Earnings',
    path: '/dashboard/earn',
    icon: Landmark,
    color: 'from-amber-500 to-orange-600',
    isOverlay: false, // Now navigates to dedicated page
  },
  SAVE: {
    id: 'save',
    name: 'SAVE',
    description: 'Vault Savings',
    path: '/dashboard/save',
    icon: Target,
    color: 'from-emerald-500 to-teal-600',
    isOverlay: false, // Now navigates to dedicated page
  },
  TRADE: {
    id: 'trade',
    name: 'TRADE',
    description: 'Buy & Sell ₳',
    path: '/dashboard/trade',
    icon: ArrowLeftRight,
    color: 'from-[#FFD700] to-[#FFA500]',
    isOverlay: false,
    comingSoon: false,
  },
  MLM: {
    id: 'mlm',
    name: 'MLM',
    description: 'Referral Network',
    path: '/dashboard/mlm',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
    isOverlay: false, // Now navigates to dedicated page
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
    href: '/dashboard/earn',
    color: 'from-[#FFD700] to-[#FFA500]',
  },
  {
    icon: Target,
    label: 'SAVE Hub',
    description: 'Vault Savings',
    href: '/dashboard/save',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: ArrowLeftRight,
    label: 'TRADE Hub',
    description: 'Buy & Sell ₳',
    href: '/dashboard/trade',
    color: 'from-[#FFD700] to-[#FFA500]',
  },
  {
    icon: Users,
    label: 'MLM Hub',
    description: 'Referral Network',
    href: '/dashboard/mlm',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Megaphone,
    label: 'Ad Wizard',
    description: 'Traffic Engine',
    href: '/dashboard/ads',
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

// Bloom menu secondary items (quick access) - Four Pillars
export const BLOOM_SECONDARY_ITEMS = [
  { icon: TrendingUp, label: 'EARN', sublabel: 'Task Earnings', path: '/dashboard/earn', color: 'from-amber-500 to-orange-600' },
  { icon: Target, label: 'SAVE', sublabel: 'Vault Savings', path: '/dashboard/save', color: 'from-emerald-500 to-teal-600' },
  { icon: ArrowLeftRight, label: 'TRADE', sublabel: 'Buy & Sell ₳', path: '/dashboard/trade', color: 'from-[#FFD700] to-[#FFA500]' },
  { icon: Crown, label: 'MLM', sublabel: 'Referral Network', path: '/dashboard/mlm', color: 'from-purple-500 to-pink-600' },
];
 
// Dashboard hero navigation cards - Four Pillars
export const DASHBOARD_HERO_CARDS = [
  {
    icon: Landmark,
    label: 'EARN',
    fullLabel: 'EARN TASK REWARDS',
    description: 'VPA Missions',
    path: '/dashboard/earn',
    gradient: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/30',
  },
  {
    icon: Target,
    label: 'SAVE',
    fullLabel: 'VAULT SAVINGS',
    description: 'Secure Holdings',
    path: '/dashboard/save',
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/30',
  },
  {
    icon: ArrowLeftRight,
    label: 'TRADE',
    fullLabel: 'ALPHA EXCHANGER',
    description: 'Buy & Sell ₳',
    path: '/dashboard/trade',
    gradient: 'from-[#FFD700] to-[#FFA500]',
    shadowColor: 'shadow-[#FFD700]/30',
  },
  {
    icon: Users,
    label: 'MLM',
    fullLabel: 'ROYALTY NETWORK',
    description: 'Referral Network',
    path: '/dashboard/mlm',
    gradient: 'from-purple-500 to-pink-600',
    shadowColor: 'shadow-purple-500/30',
  },
];
 
// Sidebar navigation sections - Four Pillars V12.0
export const SIDEBAR_NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { icon: Target, label: 'Command Center', path: '/dashboard', description: 'Your primary dashboard' },
    ],
  },
  {
    title: 'Four Pillars',
    items: [
      { icon: Landmark, label: 'EARN', path: '/dashboard/earn', description: 'Task Earnings' },
      { icon: Target, label: 'SAVE', path: '/dashboard/save', description: 'Vault Savings' },
      { icon: ArrowLeftRight, label: 'TRADE', path: '/dashboard/trade', description: 'Buy & Sell ₳' },
      { icon: Users, label: 'MLM', path: '/dashboard/mlm', description: 'Referral Network' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { icon: Landmark, label: 'ABC Vault', path: '/dashboard/finance', description: 'P2P Lending' },
      { icon: Crown, label: 'Ad Wizard', path: '/dashboard/ads', description: 'Traffic Engine', badge: 'PRO+' },
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