import { create } from 'zustand';

export type WalletType = 'main' | 'task' | 'royalty';
export type ArmyLevel = 'cadet' | 'specialist' | 'operative' | 'vanguard' | 'elite_operator';
export type MembershipTier = 'basic' | 'pro' | 'elite';
// LoanStatus is now managed in the database via loan_status enum

export interface Wallet {
  type: WalletType;
  balance: number;
  label: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  requiredLevel: ArmyLevel;
  category: string;
  proofRequired: 'screenshot' | 'video' | 'link';
  status: 'available' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
  deadline?: Date;
}

// LoanOffer and ActiveLoan types are now in src/hooks/useLending.ts
// All lending data comes from the database with proper server-side validation

interface AppState {
  // User state
  userId: string;
  userName: string;
  membershipTier: MembershipTier;
  armyLevel: ArmyLevel;
  isKycVerified: boolean;
  referralCode: string;

  // Wallets
  wallets: Wallet[];
  
  // Swap state
  swapMode: 'cashin' | 'cashout';
  
  // Actions
  setSwapMode: (mode: 'cashin' | 'cashout') => void;
  updateWalletBalance: (type: WalletType, amount: number) => void;
  swapToAlpha: (phpAmount: number) => void;
  swapToPHP: (alphaAmount: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Default user state (mock)
  userId: 'user-001',
  userName: 'Jonathan Nangkil',
  membershipTier: 'elite',
  armyLevel: 'operative',
  isKycVerified: true,
  referralCode: 'JNTHN888',

  // Initial wallet balances
  wallets: [
    { type: 'main', balance: 5420.50, label: 'Main Wallet', description: 'Deposits, Withdrawals & Commissions' },
    { type: 'task', balance: 1250.00, label: 'Task Wallet', description: 'Daily Earnings' },
    { type: 'royalty', balance: 890.25, label: 'Royalty Wallet', description: 'Passive Team Overrides' },
  ],

  swapMode: 'cashin',

  setSwapMode: (mode) => set({ swapMode: mode }),

  updateWalletBalance: (type, amount) => set((state) => ({
    wallets: state.wallets.map((w) =>
      w.type === type ? { ...w, balance: w.balance + amount } : w
    ),
  })),

  swapToAlpha: (phpAmount) => {
    const alphaAmount = phpAmount; // 1:1 peg
    get().updateWalletBalance('main', alphaAmount);
  },

  swapToPHP: (alphaAmount) => {
    const fee = alphaAmount * 0.02; // 2% fee
    const netAmount = alphaAmount - fee;
    get().updateWalletBalance('main', -alphaAmount);
    // In real app, trigger PHP disbursement
  },
}));

// Mock tasks data
export const MOCK_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Facebook Page Like & Follow',
    description: 'Like and follow the official AMABILIA Facebook page and take a screenshot.',
    reward: 25,
    requiredLevel: 'cadet',
    category: 'Social Media',
    proofRequired: 'screenshot',
    status: 'available',
  },
  {
    id: 'task-002',
    title: 'YouTube Video Watch & Comment',
    description: 'Watch the full promotional video and leave a meaningful comment.',
    reward: 50,
    requiredLevel: 'cadet',
    category: 'Video Engagement',
    proofRequired: 'screenshot',
    status: 'available',
  },
  {
    id: 'task-003',
    title: 'TikTok Video Creation',
    description: 'Create a 30-second promotional TikTok video about AMABILIA.',
    reward: 150,
    requiredLevel: 'specialist',
    category: 'Content Creation',
    proofRequired: 'video',
    status: 'available',
  },
  {
    id: 'task-004',
    title: 'Blog Review Article',
    description: 'Write a 500-word blog post reviewing the AMABILIA platform.',
    reward: 300,
    requiredLevel: 'operative',
    category: 'Content Writing',
    proofRequired: 'link',
    status: 'available',
  },
  {
    id: 'task-005',
    title: 'Influencer Outreach',
    description: 'Contact and onboard a micro-influencer to join AMABILIA.',
    reward: 500,
    requiredLevel: 'vanguard',
    category: 'Networking',
    proofRequired: 'screenshot',
    status: 'available',
  },
  {
    id: 'task-006',
    title: 'Strategic Partnership',
    description: 'Establish a partnership with a local business for AMABILIA promotion.',
    reward: 1000,
    requiredLevel: 'elite_operator',
    category: 'Business Development',
    proofRequired: 'screenshot',
    status: 'available',
  },
];

// Note: Loan offers are now fetched from the database via useLending hook
// Mock data removed for security - all lending operations now use server-side validation

// Army level configuration
export const ARMY_LEVELS: Record<ArmyLevel, { name: string; minTasks: number; icon: string }> = {
  cadet: { name: 'Cadet', minTasks: 0, icon: '🎖️' },
  specialist: { name: 'Specialist', minTasks: 10, icon: '⭐' },
  operative: { name: 'Operative', minTasks: 50, icon: '🌟' },
  vanguard: { name: 'Vanguard', minTasks: 150, icon: '💫' },
  elite_operator: { name: 'Elite Operator', minTasks: 500, icon: '👑' },
};

// Membership tier configuration
export const MEMBERSHIP_TIERS: Record<MembershipTier, { name: string; cost: number; features: string[] }> = {
  basic: {
    name: 'Basic',
    cost: 1000,
    features: ['Referral Link', '40% Commissions'],
  },
  pro: {
    name: 'Pro',
    cost: 2000,
    features: ['Referral Link', '40% Commissions', 'Daily Tasks', 'Army Training Access'],
  },
  elite: {
    name: 'Elite',
    cost: 3000,
    features: ['All Features', 'P2P Lending', 'KYC Approval', 'Priority Support'],
  },
};
